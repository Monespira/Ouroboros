from __future__ import annotations

import sys
from pathlib import Path
from pypdf import PdfReader


source, destination = map(Path, sys.argv[1:3])
reader = PdfReader(source)
parts = ["# Monespira - Guia Comercial e Operacional", "", "**Versão:** 3.0  ", "**Data:** 21/07/2026  ", f"**Fonte:** `{source}`", ""]
for index, page in enumerate(reader.pages, start=1):
    text = (page.extract_text() or "").strip()
    parts.extend([f"## Página {index}", "", text, ""])
destination.parent.mkdir(parents=True, exist_ok=True)
destination.write_text("\n".join(parts).strip() + "\n", encoding="utf-8")
print(f"{len(reader.pages)} páginas -> {destination}")
