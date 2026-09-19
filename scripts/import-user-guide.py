#!/usr/bin/env python3
from pathlib import Path
import re

SRC = Path("/Users/mukeshkumar/Desktop/construction-management/docs/user-guide/CONSTRUCTION_MANAGEMENT_USER_GUIDE.md")
DEST = Path("/Users/mukeshkumar/Desktop/nimble-construction-accounting-docs/content")

CHAPTERS = [
    ("1.foundation-and-master-data.md", "Foundation and master data", "Set up corporations, accounts, masters, and vendors.", "i-lucide-database"),
    ("2.projects.md", "Projects", "Create and manage construction projects.", "i-lucide-building-2"),
    ("3.cost-codes.md", "Cost codes", "Configure cost code divisions and configurations.", "i-lucide-hash"),
    ("4.item-types-and-items.md", "Item Types and Items List", "Maintain item types and the preferred-item catalog.", "i-lucide-boxes"),
    ("5.estimates.md", "Estimates", "Create the project budget and approval workflow.", "i-lucide-calculator"),
    ("6.purchase-orders.md", "Purchase Orders", "Commit material or labor from a vendor.", "i-lucide-shopping-cart"),
    ("7.change-orders.md", "Change Orders", "Modify an existing purchase order commitment.", "i-lucide-git-branch"),
    ("8.stock-receipt-notes.md", "Stock Receipt Notes", "Record material shipment and receipt.", "i-lucide-package-check"),
    ("9.vendor-invoices.md", "Vendor Invoices", "Record vendor invoices, advances, and holdback.", "i-lucide-receipt"),
    ("10.reports.md", "Reports", "Review budget, payable, and stock reports.", "i-lucide-bar-chart-3"),
    ("11.end-to-end-workflows.md", "End-to-end workflows", "Follow the main construction process from masters to reports.", "i-lucide-workflow"),
    ("12.troubleshooting.md", "Troubleshooting and FAQ", "Resolve common user and support questions.", "i-lucide-circle-help"),
    ("13.glossary.md", "Glossary and status reference", "Business terms and status meanings.", "i-lucide-book-text"),
]


def convert_figures(text: str) -> str:
    pattern = re.compile(
        r'<figure class="screenshot">\s*<img src="images/([^"]+)" alt="([^"]+)">\s*<figcaption>([^<]+)</figcaption>\s*</figure>',
        re.MULTILINE,
    )
    return pattern.sub(r"![\3](/images/\1)", text)


def strip_title_page(text: str) -> str:
    return re.sub(r"<section class=\"title-page\">.*?</section>\s*", "", text, flags=re.DOTALL)


def main() -> None:
    raw = strip_title_page(SRC.read_text())
    raw = convert_figures(raw)
    parts = re.split(r"^# \d+\. .+$", raw, flags=re.MULTILINE)[1:]
    if len(parts) != len(CHAPTERS):
        raise SystemExit(f"Expected {len(CHAPTERS)} chapters, found {len(parts)}")

    DEST.mkdir(parents=True, exist_ok=True)
    for part, (filename, title, description, icon) in zip(parts, CHAPTERS):
        body = part.strip()
        body = re.sub(r"^---\s*$", "", body, flags=re.MULTILINE).strip()
        body = re.sub(
            r"Update this guide when user-visible navigation.*$",
            "Update this guide when user-visible navigation, fields, status names, validation messages, or workflows change.",
            body,
            flags=re.DOTALL,
        )
        frontmatter = (
            "---\n"
            f"title: {title}\n"
            f"description: {description}\n"
            "navigation:\n"
            f"  icon: {icon}\n"
            "seo:\n"
            f"  title: {title}\n"
            f"  description: {description}\n"
            "---\n\n"
        )
        (DEST / filename).write_text(frontmatter + body + "\n")
        print(f"wrote content/{filename}")


if __name__ == "__main__":
    main()
