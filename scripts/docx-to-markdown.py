from __future__ import annotations

import re
import sys
from pathlib import Path
from docx import Document
from docx.document import Document as DocumentType
from docx.table import Table
from docx.text.paragraph import Paragraph


def escape_cell(value: str) -> str:
    return value.replace("|", "\\|").replace("\n", "<br>").strip()


def iter_blocks(document: DocumentType):
    body = document.element.body
    for child in body.iterchildren():
        if child.tag.endswith("}p"):
            yield Paragraph(child, document)
        elif child.tag.endswith("}tbl"):
            yield Table(child, document)


def paragraph_markdown(paragraph: Paragraph) -> str:
    text = "".join(run.text for run in paragraph.runs).strip()
    if not text:
        return ""
    style = (paragraph.style.name or "").lower() if paragraph.style else ""
    heading = re.search(r"heading\s*([1-6])|t[ií]tulo\s*([1-6])", style)
    if heading:
        level = int(heading.group(1) or heading.group(2))
        return f"{'#' * level} {text}"
    numbering = paragraph._p.pPr is not None and paragraph._p.pPr.numPr is not None
    if numbering or "list" in style or "lista" in style:
        return f"- {text}"
    return text


def table_markdown(table: Table) -> str:
    rows = [[escape_cell(cell.text) for cell in row.cells] for row in table.rows]
    if not rows:
        return ""
    width = max(len(row) for row in rows)
    rows = [row + [""] * (width - len(row)) for row in rows]
    output = [f"| {' | '.join(rows[0])} |", f"| {' | '.join(['---'] * width)} |"]
    output.extend(f"| {' | '.join(row)} |" for row in rows[1:])
    return "\n".join(output)


def convert(source: Path, destination: Path) -> None:
    document = Document(source)
    parts: list[str] = []
    for block in iter_blocks(document):
        rendered = paragraph_markdown(block) if isinstance(block, Paragraph) else table_markdown(block)
        if rendered:
            parts.append(rendered)
    destination.parent.mkdir(parents=True, exist_ok=True)
    output = ""
    for part in parts:
        separator = "\n" if output.rstrip().split("\n")[-1].startswith("|") and part.startswith("|") else "\n\n"
        output = f"{output}{separator if output else ''}{part}"
    destination.write_text(output.strip() + "\n", encoding="utf-8")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Uso: docx-to-markdown.py PASTA_ORIGEM PASTA_DESTINO")
    source_dir, destination_dir = map(Path, sys.argv[1:])
    files = sorted(source_dir.glob("*.docx"))
    if not files:
        raise SystemExit("Nenhum DOCX encontrado.")
    for source in files:
        name = source.name[:-5] if source.name.lower().endswith(".docx") else source.stem
        if name.lower().endswith(".md"):
            name = name[:-3]
        destination = destination_dir / f"{name}.md"
        convert(source, destination)
        print(f"{source.name} -> {destination}")
