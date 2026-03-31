# LeetCode Company-Wise Interview Problems

Curated lists of LeetCode questions grouped by company, sourced from LeetCode's company tags.

**Last updated:** 20 June 2025

## Structure

Each company has its own folder containing CSV files organized by time period:

| File | Description |
|------|-------------|
| `1. Thirty Days.csv` | Problems asked in the last 30 days |
| `2. Three Months.csv` | Problems asked in the last 3 months |
| `3. Six Months.csv` | Problems asked in the last 6 months |
| `4. More Than Six Months.csv` | Problems asked more than 6 months ago |
| `5. All.csv` | All problems for the company |

## CSV Format

```
Difficulty,Title,Frequency,Acceptance Rate,Link,Topics
MEDIUM,Two Sum,100.0,55.8,https://leetcode.com/problems/two-sum,"Array, Hash Table"
```

| Column | Description |
|--------|-------------|
| Difficulty | `EASY`, `MEDIUM`, or `HARD` |
| Title | Problem name |
| Frequency | How often the problem appears (0–100 scale) |
| Acceptance Rate | Percentage of accepted submissions (0–100) |
| Link | Direct link to the LeetCode problem |
| Topics | Comma-separated list of problem topics/tags |

## Stats

- **470** companies covered
- **2,350** CSV files
- **18,600+** problem entries

## Automated Updates

A Python script is included to validate CSV data quality:

```bash
pip install -r requirements.txt
python scripts/validate_csvs.py
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b my-fix`)
3. Make your changes
4. Run the validation script to ensure data quality
5. Commit with a clear message (`git commit -m "fix: description"`)
6. Open a Pull Request

## Related

- [System Design Notes](https://github.com/liquidslr/system-design-notes)

## License

This project is for educational purposes. LeetCode problem data is sourced from publicly available company tags.
