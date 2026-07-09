# Weekend Masters in Applied Statistics and Data Science Alumni Directory

A simple static web-based alumni directory for the **Weekend Masters in Applied Statistics and Data Science**, **Jahangirnagar University**.

This is a beginner-friendly, plain **HTML + CSS + vanilla JavaScript** website. It reads alumni information from a CSV file (`alumni.csv`) and displays it as summary statistics, a full spreadsheet-style table, and searchable/filterable profile cards — all behind a simple login screen.

No frameworks, no build tools, no server-side code required. It runs entirely in the browser and can be hosted for free on GitHub Pages, Netlify, or similar static hosts.

---

## Live Website

> Replace this with your actual deployed link once published, e.g.:
> `https://juwpasds.github.io/`

---

## Features

- Simple login screen with a common User ID / Password (front-end only — see security warning below)
- Login state remembered for the browser session using `sessionStorage`, plus a Logout button
- Loads alumni data dynamically from `alumni.csv` using `fetch()`
- Robust, hand-written CSV parser that correctly handles:
  - commas inside quoted fields
  - double quotes inside quoted fields
  - line breaks inside a single cell
  - empty cells
- Dynamic summary cards (total alumni, batch groups, employed alumni, blood group provided, etc.)
- Collapsible full spreadsheet-style table with all CSV columns, horizontal scrolling, clickable emails and links
- Search & filter tools:
  - Batch number dropdown
  - Employment status dropdown (auto-hidden if that column doesn't exist in your CSV)
  - Specialization / skills text search
  - General keyword search across all fields
  - "Clear Filters" button
- Clean, responsive, card-based alumni profiles
- Gracefully handles missing columns and extra spaces in CSV headers
- Missing values are shown as a muted **"Not provided"** instead of blank space
- All CSV content is HTML-escaped before rendering, to avoid unsafe/broken markup if a cell contains special characters

---

## Default Login

| Field | Value |
|---|---|
| User ID | `alumni` |
| Password | `alumni2026` |

You can change these at any time by editing the top of `app.js`:

```js
const COMMON_USER_ID = "alumni";
const COMMON_PASSWORD = "alumni2026";
```

---

## Project Files

| File | Purpose |
|---|---|
| `index.html` | Page structure: login screen + main app layout |
| `style.css` | All styling (colors, layout, responsive design) |
| `app.js` | Login/logout logic, CSV loading & parsing, rendering, search & filters |
| `alumni.csv` | Sample alumni data (dummy records) — replace with your real data |
| `README.md` | This file |

---

## CSV File Format

`alumni.csv` must be placed in the **same folder** as `index.html`. The first row must be the column headers. Recommended columns (you can use any subset — missing columns are handled gracefully):

```
Name,Email,Phone number,Address,Batch Number,Undergraduate Education and Institute (comma-separated),Specialization,Skills,Current Affiliation (Job/University),Current Job Title & Company (if Employed),Current Employment Status,Linkedin Profile Link,Any other social media platform/website link (Orcid/Researchgate/Facebook/X),Any feedback/comment,Blood Group
```

Notes:

- If a field contains a comma (e.g. an address like `"Dhaka, Bangladesh"`), wrap that field in double quotes.
- If a field contains a double quote character, escape it by doubling it, e.g. `"She said ""hello"""`.
- If a field contains a line break (e.g. a multi-line comment), wrap it in double quotes — the parser supports multi-line quoted cells.
- Leave a cell empty for missing data; it will display as "Not provided" on the site.
- Extra spaces in column headers (e.g. `"Current Employment Status  "`) are automatically trimmed, so they still match correctly.

You can edit `alumni.csv` in Excel, Google Sheets, or any spreadsheet tool — just make sure to **export/save as CSV (Comma delimited)**.

---

## How to Run Locally

Because browsers block `fetch()` requests to local files for security reasons, you **cannot** just double-click `index.html` and expect the CSV to load. You need to serve the folder through a simple local web server.

If you have Python installed, open a terminal in the project folder and run:

```bash
python -m http.server 8000
```

Then open your browser and visit:

```
http://localhost:8000
```

You should see the login screen, and after logging in, the alumni directory populated from `alumni.csv`.

> ⚠️ Do **not** open `index.html` by double-clicking it in your file explorer — the CSV file will fail to load (`fetch` requests to `file://` URLs are blocked by most browsers).

---

## How to Publish on GitHub Pages

1. Create a new repository on GitHub (e.g. `alumni-directory`).
2. Upload these files to the **root** of the repository:
   - `index.html`
   - `style.css`
   - `app.js`
   - `alumni.csv`
   - `README.md`
3. Go to your repository's **Settings → Pages**.
4. Under "Build and deployment", select **Deploy from a branch**.
5. Set **Branch** to `main` and **Folder** to `/root` (sometimes shown as `/ (root)`).
6. Click **Save**.
7. Wait a minute or two, then refresh the Pages settings page — GitHub will show your live site URL (something like `https://your-username.github.io/alumni-directory/`).

The same basic idea applies to Netlify, Vercel, or any other static hosting service: just upload/drag-and-drop the same five files.

---

## How to Update Alumni Data

1. Open `alumni.csv` in Excel, Google Sheets, or a text editor.
2. Add, edit, or remove rows as needed. Keep the header row (first row) unchanged, or update the column aliases in `app.js` (see `FIELD_ALIASES`) if you rename columns.
3. Save/export the file as CSV, keeping the filename `alumni.csv`.
4. Re-upload/replace `alumni.csv` in your GitHub repository (or your hosting provider).
5. Refresh the website — no other code changes are needed.

---

## Important Security Warning

**This website's login screen is a front-end (client-side) convenience feature only. It is NOT real security.**

- The User ID and Password are stored in plain text inside `app.js`, which is a public file on any static host. Anyone can view the page source, open `app.js` in their browser's developer tools, and read the credentials directly.
- Anyone can also directly open `alumni.csv` in a browser (e.g. `yoursite.com/alumni.csv`) and see all the data, **completely bypassing the login screen** — because static hosting serves all files publicly by default, regardless of what the login page shows.
- `sessionStorage` only remembers that the "Login" button was clicked; it does not encrypt, protect, or restrict access to any file on the server.
- There is no backend, no database, no user accounts, and no real authentication of any kind.

**Because of this:**

- Do **not** publish sensitive, private, or confidential personal information (e.g. national ID numbers, home addresses without consent, financial details, etc.) using this template.
- Only include alumni data that individuals have explicitly consented to share publicly.
- If you need real access control or data protection, you must use a proper backend with server-side authentication and authorization — this static template cannot provide that.

This login screen exists purely to give the site a members-only "feel" and to discourage casual browsing — not to protect data from anyone with basic technical knowledge.

---

## Recommended Use

This template is best suited for:

- A lightweight, informal alumni contact/networking directory
- Data that alumni have agreed to share within their own community
- Internal batch/cohort directories where the "login" is a light social gate, not a security boundary

It is **not** recommended for:

- Storing sensitive personal, medical, or financial information
- Any use case with legal or regulatory data protection requirements
- Situations requiring guaranteed restricted access

---

## License

This project is provided as-is for educational and community use. You are free to copy, modify, and adapt it for your own alumni directory or similar non-commercial projects. No warranty is provided.

---

## Author / Maintainer

Maintained by the Weekend Masters in Applied Statistics and Data Science alumni community, Jahangirnagar University.

For questions, corrections, or contributions, please open an issue or pull request on this repository (or contact the current maintainer directly).
