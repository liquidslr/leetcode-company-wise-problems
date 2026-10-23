# 🚀 LeetCode A-Z Master Automator

Tired of manually clicking "Add to List" for hundreds of company-tagged questions? Stop wasting time on data entry and start focused coding. 

This repository contains a **Master Automation Tool** that crawls through every company folder (from Accenture to Zynga), deduplicates questions globally, and auto-populates your LeetCode account with perfectly organized, company-specific lists in seconds.

---

## ✨ Features

* **A-Z Coverage:** Automatically processes every company folder in the repo.
* **Global Deduplication:** If a question appears in multiple company lists (e.g., *Two Sum* in both Google and Amazon), the script ensures it only gets added once to keep your prep clean.
* **Mass Creation:** Bypasses LeetCode's UI limits by talking directly to the GraphQL API.
* **Safe & Secure:** Uses your active browser session; no password or login credentials needed.

---

## 🛠️ Step-by-Step Guide

### 1. Generate the Automation Script
1.  Ensure you have **Python** installed on your machine.
2.  Open your terminal/command prompt and navigate to this folder.
3.  Run the crawler script:
    ```bash
    python leetcode_list_maker.py
    ```
4.  When prompted for the path, type `.` (a single period) and hit **Enter**.
5.  The script will scan all folders and generate a file named `master_console_script.js`.

### 2. Inject into LeetCode
1.  Open **[LeetCode.com](https://leetcode.com)** in your browser (make sure you are logged in).
2.  Press **F12** (or Right-Click > Inspect) to open the Developer Tools.
3.  Click on the **Console** tab.
4.  Open the `master_console_script.js` file generated in Step 1, copy **all** the code, and paste it into the browser console.
5.  Hit **Enter**.

### 3. Watch the Magic Happen
* The script will start creating lists and adding questions automatically.
* **Note:** There is a 2-second delay between companies to ensure your account stays safe from security flags. 
* Once the console prints `All companies processed successfully!`, simply **refresh your browser**.

---

## 📁 Repository Structure

```text
.
├── leetcode_list_maker.py   # The Python Crawler & Logic
├── README.md                # This Guide
├── .gitignore               # Keeps your generated scripts private
├── [Company Folders]/       # 100+ folders containing 5. All.csv
└── ...


---

## 🤝 Contributing & Credits

This tool was built to enhance and automate the data provided by the original community efforts.

* **Data Source:** Special thanks to the original creator of the [interview-company-wise-problems](https://github.com/liquidslr/interview-company-wise-problems) repository for the massive collection of company-wise CSVs.
* **Automation Logic:** Built by [Shivam Malge](https://github.com/ShivamMalge).

If this tool saved you hours of clicking, feel free to:

* **Star this repo** ⭐
* **Fork it** and add more company CSVs.
* **Share it** with your placement groups!

*Disclaimer: This tool is for educational and personal productivity purposes. Use responsibly.*
