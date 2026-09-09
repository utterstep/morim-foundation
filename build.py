# /// script
# requires-python = ">=3.12"
# dependencies = ["jinja2"]
# ///
"""Render the Morim Foundation site from src/ into site/.

    uv run build.py            # render all languages and copy static files
    uv run build.py --serve    # render, then serve site/ on http://localhost:8000
    uv run build.py --check    # exit 1 if site/ is not what a fresh render produces

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
import shutil
import sys
import tempfile
from functools import partial
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, StrictUndefined

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
SITE = ROOT / "site"
STATIC_DIRS = ("css", "js", "assets")

# Order matters: it is the order of the language switcher.
LANGS = {
    "en": {"dir": "ltr", "path": "", "name": "English"},
    "ru": {"dir": "ltr", "path": "ru/", "name": "Русский"},
    "he": {"dir": "rtl", "path": "he/", "name": "עברית"},
}


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
    for lang, meta in LANGS.items():
        # Pages sit at /, /ru/ and /he/; shared files are addressed relative to
        # the page so the output works at the domain root, under /site/, or
        # from any local static server.
        root = "../" if meta["path"] else ""
        html = template.render(
            t=load_strings(lang, root),
            lang=lang,
            dir=meta["dir"],
            root=root,
            v=version,
            langs=[
                {"code": code, "name": m["name"], "href": root + m["path"], "current": code == lang}
                for code, m in LANGS.items()
            ],
        )
        target = out / meta["path"] / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(html, encoding="utf-8")
    for name in STATIC_DIRS:
        shutil.copytree(SRC / name, out / name, dirs_exist_ok=True)


def build() -> None:
    if SITE.exists():
        shutil.rmtree(SITE)
    render(SITE)
    print(f"rendered {', '.join(LANGS)} into {SITE.relative_to(ROOT)}/")


def check() -> int:
    with tempfile.TemporaryDirectory() as tmp:
        fresh = Path(tmp) / "site"
        render(fresh)
        diff = filecmp.dircmp(fresh, SITE)
        stale = _differences(diff)
    if stale:
        print("site/ is out of date; run `uv run build.py`:", file=sys.stderr)
        for path in stale:
            print(f"  {path}", file=sys.stderr)
        return 1
    print("site/ is up to date")
    return 0


def _differences(diff: filecmp.dircmp, prefix: str = "") -> list[str]:
    found = [prefix + name for name in diff.left_only + diff.right_only + diff.diff_files]
    for name, sub in diff.subdirs.items():
        found += _differences(sub, f"{prefix}{name}/")
    return found


def serve(port: int) -> None:
    handler = partial(http.server.SimpleHTTPRequestHandler, directory=str(SITE))
    with http.server.ThreadingHTTPServer(("127.0.0.1", port), handler) as server:
        print(f"serving {SITE.relative_to(ROOT)}/ at http://127.0.0.1:{port}/")
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
