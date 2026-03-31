#!/usr/bin/env python3
"""Validate all CSV files in the repository for data quality issues."""

import csv
import os
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
EXPECTED_HEADER = ["Difficulty", "Title", "Frequency", "Acceptance Rate", "Link", "Topics"]
EXPECTED_FILES = {
    "1. Thirty Days.csv",
    "2. Three Months.csv",
    "3. Six Months.csv",
    "4. More Than Six Months.csv",
    "5. All.csv",
}
VALID_DIFFICULTIES = {"EASY", "MEDIUM", "HARD"}


def validate_company(company_dir: Path) -> list[dict]:
    """Validate all CSVs in a company directory. Returns list of issues."""
    issues = []
    company = company_dir.name

    csv_files = {f.name for f in company_dir.iterdir() if f.suffix == ".csv"}
    missing = EXPECTED_FILES - csv_files
    extra = csv_files - EXPECTED_FILES

    if missing:
        issues.append({"severity": "HIGH", "file": company, "msg": f"Missing files: {missing}"})
    if extra:
        issues.append({"severity": "LOW", "file": company, "msg": f"Extra files: {extra}"})

    for csv_file in sorted(csv_files):
        csv_path = company_dir / csv_file
        label = f"{company}/{csv_file}"

        try:
            with open(csv_path, "r", encoding="utf-8") as f:
                reader = csv.reader(f)
                header = next(reader, None)

                if header != EXPECTED_HEADER:
                    issues.append({"severity": "HIGH", "file": label, "msg": f"Bad header: {header}"})

                rows = list(reader)
                if not rows:
                    issues.append({"severity": "INFO", "file": label, "msg": "Empty (header only)"})
                    continue

                titles = []
                for i, row in enumerate(rows, start=2):
                    if len(row) != 6:
                        issues.append({"severity": "HIGH", "file": label, "msg": f"Row {i}: {len(row)} cols"})
                        continue

                    diff, title, freq, ar, link, topics = row
                    titles.append(title)

                    if diff not in VALID_DIFFICULTIES:
                        issues.append({"severity": "HIGH", "file": label, "msg": f"Row {i}: bad difficulty '{diff}'"})

                    try:
                        f_val = float(freq)
                        if not (0 <= f_val <= 100):
                            issues.append({"severity": "MEDIUM", "file": label, "msg": f"Row {i}: freq out of range: {freq}"})
                    except ValueError:
                        issues.append({"severity": "MEDIUM", "file": label, "msg": f"Row {i}: non-numeric freq: {freq}"})

                    try:
                        ar_val = float(ar)
                        if not (0 <= ar_val <= 100):
                            issues.append({"severity": "MEDIUM", "file": label, "msg": f"Row {i}: AR out of range: {ar}"})
                    except ValueError:
                        issues.append({"severity": "MEDIUM", "file": label, "msg": f"Row {i}: non-numeric AR: {ar}"})

                    if not link.startswith("https://leetcode.com/problems/"):
                        issues.append({"severity": "HIGH", "file": label, "msg": f"Row {i}: bad link: {link}"})

                # Check duplicates
                seen = set()
                for t in titles:
                    if t in seen:
                        issues.append({"severity": "MEDIUM", "file": label, "msg": f"Duplicate: {t}"})
                    seen.add(t)

        except UnicodeDecodeError as e:
            issues.append({"severity": "HIGH", "file": label, "msg": f"Encoding error: {e}"})
        except Exception as e:
            issues.append({"severity": "HIGH", "file": label, "msg": f"Parse error: {e}"})

    return issues


def main():
    all_issues = []
    companies = sorted(
        [d for d in REPO_ROOT.iterdir() if d.is_dir() and not d.name.startswith(".") and d.name != "scripts"],
    )

    print(f"Validating {len(companies)} companies...\n")

    for company_dir in companies:
        issues = validate_company(company_dir)
        all_issues.extend(issues)

    # Summary
    by_severity = {}
    for issue in all_issues:
        sev = issue["severity"]
        by_severity.setdefault(sev, []).append(issue)

    has_errors = False
    for sev in ["HIGH", "MEDIUM", "LOW", "INFO"]:
        items = by_severity.get(sev, [])
        if items:
            print(f"[{sev}] {len(items)} issues")
            for item in items[:10]:
                print(f"  {item['file']}: {item['msg']}")
            if len(items) > 10:
                print(f"  ... and {len(items) - 10} more")
            print()
        if sev == "HIGH" and items:
            has_errors = True

    total = sum(len(v) for v in by_severity.values())
    info_count = len(by_severity.get("INFO", []))
    print(f"Total: {total} issues ({total - info_count} actionable, {info_count} informational)")

    if has_errors:
        print("\nValidation FAILED (HIGH severity issues found)")
        sys.exit(1)
    else:
        print("\nValidation PASSED")
        sys.exit(0)


if __name__ == "__main__":
    main()
