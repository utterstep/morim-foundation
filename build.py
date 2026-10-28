# /// script
# requires-python = ">=3.12"
# dependencies = ["jinja2"]
# ///
"""Render the Morim Foundation site from src/ into the repository root.

    uv run build.py            # render all languages and copy static files
    uv run build.py --serve    # render, then serve the root on http://localhost:8000
    uv run build.py --check    # exit 1 if the output is not what a fresh render produces

GitHub Pages serves the root of `main`, so the generated files (index.html,
ru/, he/, css/, js/, assets/) live next to the sources and are committed.

There is no other tooling: the template is plain HTML with Jinja2 tags, strings
live in src/i18n/<lang>.json, and everything under src/css, src/js and
src/assets is copied verbatim.
"""

from __future__ import annotations

import argparse
import filecmp
import hashlib
import http.server
import json
import re
import shutil
import sys
import tempfile
from functools import partial
from itertools import product
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, StrictUndefined

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
OUT = ROOT
STATIC_DIRS = ("css", "js", "assets")

# `rel=canonical` and `rel=alternate hreflang` are the two places a URL cannot be
# relative: search engines resolve them against the indexed origin, not the page.
# Everything else on the page stays relative so a preview still works anywhere.
SITE = "https://morim.foundation/"

# Order matters: it is the order of the language switcher. A language with
# "linked": False is still built and served at its URL, but the switchers on
# the other languages' pages show it greyed out instead of linking to it
# (its newest copy is waiting for a native review).
LANGS = {
    "en": {"dir": "ltr", "path": "", "name": "English", "linked": True},
    "ru": {"dir": "ltr", "path": "ru/", "name": "Русский", "linked": False},
    "he": {"dir": "rtl", "path": "he/", "name": "עברית", "linked": False},
}

# Pages per language, by their path under the language's own. The landing is
# one long page; schools and partners have a page of their own.
PAGES = {"home": "", "schools": "schools/"}


def load_strings(lang: str, root: str) -> dict:
    """Load one language file and resolve `{root}` in its HTML fragments.

    Editors write asset paths as `{root}assets/...` so the same JSON works for
    a page at `/` and one at `/ru/`. Other braces (`{app}`, `{label}`) are
    placeholders for JavaScript and are left alone.
    """
    with (SRC / "i18n" / f"{lang}.json").open(encoding="utf-8") as handle:
        return _resolve_root(json.load(handle), root)


def _resolve_root(value, root: str):
    if isinstance(value, str):
        return value.replace("{root}", root)
    if isinstance(value, list):
        return [_resolve_root(item, root) for item in value]
    if isinstance(value, dict):
        return {key: _resolve_root(item, root) for key, item in value.items()}
    return value


def asset_version() -> str:
    """Short hash of every stylesheet and script, appended to their URLs as
    `?v=` so a redeploy never pairs new markup with a cached old stylesheet."""
    digest = hashlib.sha256()
    for name in ("css", "js"):
        for file in sorted((SRC / name).rglob("*")):
            if file.is_file():
                digest.update(file.read_bytes())
    return digest.hexdigest()[:8]


def stamp_imports(js: Path, version: str) -> None:
    """Append `?v=` to every relative import in the copied scripts. main.js is
    requested with the version, but a browser with a warm cache would pair
    it with the old modules behind it (a renamed export then breaks every
    script on the page); stamped, the whole graph changes together, and
    the modulepreload links in the head name the same URLs."""
    for file in js.rglob("*.js"):
        source = file.read_text()
        stamped = re.sub(
            r"""((?:from|import)\s*['"])(\.[^'"?]+)(['"])""",
            lambda m: f"{m.group(1)}{m.group(2)}?v={version}{m.group(3)}",
            source,
        )
        if stamped != source:
            file.write_text(stamped)


def hero_hints(root: str) -> dict:
    """Head hints so the hero collage is ready when the page is: the module
    graph behind main.js (one modulepreload each, so the browser fetches them
    in parallel instead of walking the import chain), the icons the opening
    composition shows (preloaded with the same srcset/sizes the DOM uses) and
    the stream posters. All read from the JS sources so the lists stay true."""
    js = SRC / "js"
    modules: list[Path] = []
    todo = [js / "main.js"]
    while todo:
        module = todo.pop(0)
        if module in modules or not module.exists():
            continue
        modules.append(module)
        for match in re.finditer(r"""(?:from|import)\s*['"](\.[^'"]+)['"]""", module.read_text()):
            todo.append((module.parent / match.group(1)).resolve())
    apps_js = (js / "lib" / "hero-apps.js").read_text()
    apps = re.findall(r"icon\('([a-z]+)', \[([\d, ]+)\]\)", apps_js)
    sizes = re.search(r"heroAppSizes = '([^']+)'", apps_js).group(1)
    opening = re.search(r"const apps = \[([\d, ]+)\]", (js / "lib" / "hero-floating.js").read_text())
    icons = []
    for index in (int(i) for i in opening.group(1).split(",")):
        slug, widths = apps[index]
        ws = [int(w) for w in widths.split(",")]
        icons.append({
            "href": f"{root}assets/hero-app-{slug}-{ws[-1]}.webp",
            "srcset": ", ".join(f"{root}assets/hero-app-{slug}-{w}.webp {w}w" for w in ws),
            "sizes": sizes,
        })
    posters = re.findall(r"poster: '([^']+)'", (js / "lib" / "hero-videos.js").read_text())
    return {
        "modules": [m.relative_to(js).as_posix() for m in modules],
        "icons": icons,
        "posters": [f"{root}assets/video/{p}" for p in posters],
    }


def render(out: Path) -> None:
    env = Environment(
        loader=FileSystemLoader(SRC),
        undefined=StrictUndefined,
        autoescape=False,  # JSON values are authored HTML fragments
        trim_blocks=True,
        lstrip_blocks=True,
        keep_trailing_newline=True,
    )
    template = env.get_template("template.html.j2")
    version = asset_version()
    for (page, page_path), (lang, meta) in product(PAGES.items(), LANGS.items()):
        # Pages sit at /, /ru/, /he/ and their schools/ below; shared files are
        # addressed relative to the page so the output works at the domain
        # root, under /site/, or from any local static server.
        path = meta["path"] + page_path
        root = "../" * path.count("/")
        html = template.render(
            t=load_strings(lang, root),
            page=page,
            # This language's landing, relative to the page ("" on the landing).
            home="../" if page_path else "",
            lang=lang,
            dir=meta["dir"],
            root=root,
            v=version,
            # The collage lives on the landing only.
            hero=hero_hints(root) if not page_path else None,
            site=SITE,
            canonical=SITE + path,
            x_default=SITE + page_path,
            langs=[
                {
                    "code": code,
                    "name": m["name"],
                    "dir": m["dir"],
                    "href": root + m["path"] + page_path,
                    "url": SITE + m["path"] + page_path,
                    "current": code == lang,
                    # A page reached by its URL still names itself as current.
                    "linked": m["linked"] or code == lang,
                }
                for code, m in LANGS.items()
            ],
        )
        target = out / path / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(html, encoding="utf-8")
    for name in STATIC_DIRS:
        shutil.copytree(SRC / name, out / name, dirs_exist_ok=True)
    stamp_imports(out / "js", version)


def generated() -> list[str]:
    """Everything the build owns at the root; nothing else is ever touched."""
    pages = [meta["path"].rstrip("/") or "index.html" for meta in LANGS.values()]
    pages += [path.rstrip("/") for path in PAGES.values() if path]
    return pages + list(STATIC_DIRS)


def build() -> None:
    for name in generated():
        path = OUT / name
        if path.is_dir():
            shutil.rmtree(path)
        elif path.exists():
            path.unlink()
    render(OUT)
    print(f"rendered {', '.join(LANGS)} into {', '.join(generated())}")


def check() -> int:
    stale = []
    with tempfile.TemporaryDirectory() as tmp:
        fresh = Path(tmp)
        render(fresh)
        for name in generated():
            if (fresh / name).is_dir():
                stale += _differences(filecmp.dircmp(fresh / name, OUT / name), f"{name}/")
            elif not (OUT / name).exists() or not filecmp.cmp(fresh / name, OUT / name, shallow=False):
                stale.append(name)
    if stale:
        print("generated files are out of date; run `uv run build.py`:", file=sys.stderr)
        for path in stale:
            print(f"  {path}", file=sys.stderr)
        return 1
    print("generated files are up to date")
    return 0


def _differences(diff: filecmp.dircmp, prefix: str = "") -> list[str]:
    found = [prefix + name for name in diff.left_only + diff.right_only + diff.diff_files]
    for name, sub in diff.subdirs.items():
        found += _differences(sub, f"{prefix}{name}/")
    return found


def serve(port: int) -> None:
    handler = partial(http.server.SimpleHTTPRequestHandler, directory=str(OUT))
    with http.server.ThreadingHTTPServer(("127.0.0.1", port), handler) as server:
        print(f"serving the repository root at http://127.0.0.1:{port}/")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--serve", nargs="?", const=8000, type=int, metavar="PORT")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    if args.check:
        return check()
    build()
    if args.serve is not None:
        serve(args.serve)
    return 0


if __name__ == "__main__":
    sys.exit(main())
