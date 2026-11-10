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

# Pages, by their path under each language's own. The landing is one long
# page; schools and partners have a page of their own. An article is a page
# of its own too, written in src/articles/<name>.<lang>.html.j2 and built only
# in the languages listed for it: the switchers on it show the others greyed
# out, and its head names only the translations that exist.
#
# The landing can feature one article, with copy from the article's own file
# (its `teaser`), on the landings whose language has the article: a pen note
# over the first row of the frame, and the article as a page on a desk before
# the team. `back` is where a page's Back pill leads on its language's landing;
# a featured article leads back to its desk.
PAGES = {
    "home": {"path": "", "feature": "pisa-2025"},
    "schools": {"path": "schools/", "back": "#audiences"},
    "pisa-2025": {"path": "pisa-2025/", "article": "articles/pisa-2025", "langs": ("en",)},
}
FEATURE_ID = "research"  # the desk section's id on the landing (template.html.j2)


def page_langs(spec: dict) -> tuple[str, ...]:
    """The languages a page is built in, in switcher order."""
    return tuple(code for code in LANGS if code in spec.get("langs", LANGS))


def featured(lang: str) -> dict | None:
    """The article the landing features in this language, if it has one:
    its file (for the band's copy) and its path relative to the landing."""
    name = PAGES["home"].get("feature")
    if not name or lang not in page_langs(PAGES[name]):
        return None
    spec = PAGES[name]
    return {"name": name, "file": f"{spec['article']}.{lang}.html.j2", "href": spec["path"]}


def back_target(page: str, spec: dict, lang: str) -> str:
    """Where the Back pill of a page of its own leads on the landing."""
    if "back" in spec:
        return spec["back"]
    feature = featured(lang)
    return f"#{FEATURE_ID}" if feature and feature["name"] == page else "#top"


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


def module_graph() -> list[str]:
    """The module graph behind main.js, for one modulepreload each in the
    landing's head, so the browser fetches the scripts in parallel instead of
    walking the import chain. Read from the JS sources so the list stays true."""
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
    return [m.relative_to(js).as_posix() for m in modules]


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
    for (page, spec), (lang, meta) in product(PAGES.items(), LANGS.items()):
        built = page_langs(spec)
        if lang not in built:
            continue
        # Pages sit at /, /ru/, /he/ and their schools/ below; shared files are
        # addressed relative to the page so the output works at the domain
        # root, under /site/, or from any local static server.
        page_path = spec["path"]
        path = meta["path"] + page_path
        root = "../" * path.count("/")
        html = template.render(
            t=load_strings(lang, root),
            page=page,
            # The article's own file (title, copy, labels), in this language.
            article=f"{spec['article']}.{lang}.html.j2" if "article" in spec else None,
            # The article the landing features, if any (home only).
            feature=featured(lang) if not page_path else None,
            feature_id=FEATURE_ID,
            back=back_target(page, spec, lang),
            # This language's landing, relative to the page ("" on the landing).
            home="../" if page_path else "",
            lang=lang,
            dir=meta["dir"],
            root=root,
            v=version,
            # The landing's scripts, preloaded in its head.
            modules=module_graph() if not page_path else None,
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
                    # Whether this page exists in that language at all.
                    "exists": code in built,
                    # A page reached by its URL still names itself as current.
                    "linked": (m["linked"] and code in built) or code == lang,
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
    pages: dict[str, None] = {}
    for spec in PAGES.values():
        for lang in page_langs(spec):
            path = LANGS[lang]["path"] + spec["path"]
            pages[path.split("/")[0] if path else "index.html"] = None
    return list(pages) + list(STATIC_DIRS)


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
