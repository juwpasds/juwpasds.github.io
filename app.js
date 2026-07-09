/* =============================================================
   Alumni Directory — app.js
   Weekend Masters in Applied Statistics and Data Science
   Jahangirnagar University
   -------------------------------------------------------------
   !!! SECURITY WARNING !!!
   The login below is a FRONT-END ONLY check. The User ID and
   Password are visible to anyone who reads this file (which is
   public on GitHub Pages / Netlify / any static host). This is
   NOT real authentication and provides NO protection for
   sensitive data. It only hides the page visually from casual
   visitors. See README.md for full details.

   DO NOT store private, sensitive, or confidential alumni data
   in alumni.csv on a public static host.
   =============================================================*/

/* -----------------------------------------------------------
   1. LOGIN CREDENTIALS
   Change these two values to set your own User ID / Password.
   ----------------------------------------------------------- */
const COMMON_USER_ID = "alumni";
const COMMON_PASSWORD = "alumni2026";

/* Key used in sessionStorage to remember the login state.
   sessionStorage is cleared automatically when the browser tab
   / window is closed, so the user has to log in again next time. */
const SESSION_KEY = "alumniDirectoryLoggedIn";

/* Path to the CSV file. Must sit next to index.html. */
const CSV_FILE_PATH = "alumni.csv";

/* -----------------------------------------------------------
   Global state
   ----------------------------------------------------------- */
let allRecords = [];     // array of objects, one per alumni row
let csvColumns = [];     // ordered list of cleaned column names

/* =============================================================
   2. LOGIN / LOGOUT HANDLING
   =============================================================*/

function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

function setLoggedIn() {
  sessionStorage.setItem(SESSION_KEY, "true");
}

function clearLoggedIn() {
  sessionStorage.removeItem(SESSION_KEY);
}

function showApp() {
  document.getElementById("login-screen").hidden = true;
  document.getElementById("app").hidden = false;
  // Load data only once the user is actually looking at the app.
  loadAlumniData();
}

function showLogin() {
  document.getElementById("app").hidden = true;
  document.getElementById("login-screen").hidden = false;
}

function initLoginForm() {
  const form = document.getElementById("login-form");
  const errorMsg = document.getElementById("login-error");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const enteredId = document.getElementById("user-id").value.trim();
    const enteredPassword = document.getElementById("password").value;

    if (enteredId === COMMON_USER_ID && enteredPassword === COMMON_PASSWORD) {
      errorMsg.hidden = true;
      setLoggedIn();
      showApp();
      form.reset();
    } else {
      errorMsg.hidden = false;
    }
  });
}

function initLogoutButton() {
  document.getElementById("logout-btn").addEventListener("click", function () {
    clearLoggedIn();
    showLogin();
  });
}

/* =============================================================
   3. ROBUST CSV PARSER
   -------------------------------------------------------------
   A hand-written RFC4180-style parser. It correctly handles:
     - commas inside quoted fields ("Dhaka, Bangladesh")
     - double quotes inside quoted fields ("She said ""hi""")
     - line breaks inside quoted cells
     - empty cells (,,)
   It intentionally avoids a naive text.split(",") approach,
   which breaks as soon as any field contains a comma.

   Returns: array of rows, where each row is an array of strings.
   =============================================================*/
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  // Normalize Windows line endings so \r\n doesn't create blank cells.
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const nextChar = normalized[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // Escaped double quote inside a quoted field -> literal "
        field += '"';
        i++; // skip the second quote
      } else if (char === '"') {
        // Closing quote
        inQuotes = false;
      } else {
        // Any character, including newlines, inside quotes
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(field);
        field = "";
      } else if (char === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += char;
      }
    }
  }

  // Push the final field/row if the file doesn't end with a newline.
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Remove fully empty trailing rows (common at end of CSV files).
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ""));
}

/* Clean up a header name: trim whitespace, collapse internal
   double spaces, so "Current Employment Status  " still matches
   "Current Employment Status". */
function cleanHeaderName(name) {
  return name.replace(/\s+/g, " ").trim();
}

/* Convert parsed CSV rows into an array of record objects using
   the header row as keys. */
function rowsToObjects(rows) {
  if (rows.length === 0) return { columns: [], records: [] };

  const rawHeaders = rows[0];
  const headers = rawHeaders.map(cleanHeaderName);

  const records = [];
  for (let r = 1; r < rows.length; r++) {
    const rowValues = rows[r];
    // Skip completely blank rows
    const isBlankRow = rowValues.every((v) => v.trim() === "");
    if (isBlankRow) continue;

    const record = {};
    headers.forEach((header, index) => {
      const value = rowValues[index] !== undefined ? rowValues[index].trim() : "";
      record[header] = value;
    });
    records.push(record);
  }

  return { columns: headers, records };
}

/* =============================================================
   4. LOADING THE CSV FILE
   =============================================================*/

function loadAlumniData() {
  const statusEl = document.getElementById("csv-status");
  statusEl.textContent = "Loading alumni data from alumni.csv...";

  fetch(CSV_FILE_PATH)
    .then((response) => {
      if (!response.ok) {
        throw new Error("HTTP " + response.status + " " + response.statusText);
      }
      return response.text();
    })
    .then((csvText) => {
      const rows = parseCSV(csvText);
      const { columns, records } = rowsToObjects(rows);

      csvColumns = columns;
      allRecords = records;

      if (records.length === 0) {
        statusEl.textContent =
          "alumni.csv was loaded but no records were found. Please check the file.";
        return;
      }

      statusEl.textContent = "";
      renderSummary(allRecords);
      renderTable(csvColumns, allRecords);
      populateFilterDropdowns(allRecords);
      renderCards(allRecords);
    })
    .catch((error) => {
      console.error("Error loading alumni.csv:", error);
      statusEl.innerHTML =
        "<strong>Could not load alumni.csv.</strong> " +
        "Make sure alumni.csv is in the same folder as index.html, and that " +
        "you are viewing this site through a local web server (e.g. " +
        "<code>python -m http.server 8000</code>) or a real hosting service " +
        "— not by double-clicking index.html. Details: " +
        escapeHtml(error.message);
    });
}

/* =============================================================
   5. COLUMN NAME HELPERS
   -------------------------------------------------------------
   Because CSV column names can vary slightly, we look up values
   using a list of possible aliases per logical field, and match
   case-insensitively after cleaning whitespace.
   =============================================================*/

function findColumnValue(record, aliases) {
  const keys = Object.keys(record);
  for (const alias of aliases) {
    const aliasClean = alias.toLowerCase();
    const matchKey = keys.find((k) => k.toLowerCase() === aliasClean);
    if (matchKey && record[matchKey] !== undefined && record[matchKey] !== "") {
      return record[matchKey];
    }
  }
  return "";
}

/* Logical field -> list of acceptable column name spellings.
   Add more aliases here if your CSV uses different wording. */
const FIELD_ALIASES = {
  name: ["Name", "Full Name"],
  email: ["Email", "Email Address"],
  phone: ["Phone number", "Phone Number", "Phone", "Contact Number"],
  address: ["Address"],
  batch: ["Batch Number", "Batch"],
  education: [
    "Undergraduate Education and Institute (comma-separated)",
    "Undergraduate Education and Institute",
    "Undergraduate Education",
  ],
  specialization: ["Specialization"],
  skills: ["Skills"],
  affiliation: ["Current Affiliation (Job/University)", "Current Affiliation"],
  jobTitle: [
    "Current Job Title & Company (if Employed)",
    "Current Job Title and Company (if Employed)",
    "Current Job Title & Company",
  ],
  employmentStatus: ["Current Employment Status", "Employment Status"],
  linkedin: ["Linkedin Profile Link", "LinkedIn Profile Link", "LinkedIn"],
  otherLink: [
    "Any other social media platform/website link (Orcid/Researchgate/Facebook/X)",
    "Any other social media platform/website link",
    "Other Social Media/Website Link",
  ],
  feedback: ["Any feedback/comment", "Feedback/Comment", "Feedback"],
  bloodGroup: ["Blood Group"],
};

function getField(record, fieldKey) {
  return findColumnValue(record, FIELD_ALIASES[fieldKey] || [fieldKey]);
}

/* =============================================================
   6. HTML ESCAPING (XSS-safety for user-supplied CSV content)
   =============================================================*/

function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* Render a value as a "Not provided" muted span if empty, or the
   escaped text otherwise. */
function displayValue(value) {
  if (!value || value.trim() === "") {
    return '<span class="muted">Not provided</span>';
  }
  return escapeHtml(value);
}

/* Turn a raw string into a clickable mailto link if it looks like
   an email address. */
function displayEmail(value) {
  if (!value || value.trim() === "") {
    return '<span class="muted">Not provided</span>';
  }
  const safe = escapeHtml(value);
  return `<a href="mailto:${safe}">${safe}</a>`;
}

/* Turn a raw string into a clickable link (opens in a new tab) if
   it looks like a URL. Supports multiple comma/space separated
   links in one cell. Falls back to plain escaped text otherwise. */
function displayLink(value) {
  if (!value || value.trim() === "") {
    return '<span class="muted">Not provided</span>';
  }

  // Split on commas or whitespace in case multiple links are listed.
  const pieces = value.split(/[\s,]+/).filter(Boolean);
  const rendered = pieces.map((piece) => {
    const looksLikeUrl = /^(https?:\/\/|www\.)/i.test(piece);
    if (looksLikeUrl) {
      const href = piece.startsWith("http") ? piece : "https://" + piece;
      const safeHref = escapeHtml(href);
      const safeText = escapeHtml(piece);
      return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${safeText}</a>`;
    }
    return escapeHtml(piece);
  });

  return rendered.join(", ");
}

/* =============================================================
   7. SUMMARY CARDS (Section B)
   =============================================================*/

function renderSummary(records) {
  const grid = document.getElementById("summary-grid");
  grid.innerHTML = "";

  const cards = [];

  // Total alumni records
  cards.push({ value: records.length, label: "Total Alumni Records" });

  // Number of batch groups represented
  const batchValues = records
    .map((r) => getField(r, "batch"))
    .filter((v) => v && v.trim() !== "");
  const uniqueBatches = new Set(batchValues.map((v) => v.trim()));
  if (uniqueBatches.size > 0) {
    cards.push({ value: uniqueBatches.size, label: "Batch Groups Represented" });
  }

  // Number of employed alumni (if employment status column exists)
  const hasEmploymentColumn = records.some(
    (r) => getField(r, "employmentStatus").trim() !== ""
  );
  if (hasEmploymentColumn) {
    const employedCount = records.filter((r) => {
      const status = getField(r, "employmentStatus").toLowerCase();
      return status.includes("employ") && !status.includes("unemploy");
    }).length;
    cards.push({ value: employedCount, label: "Employed Alumni" });
  }

  // Number of records with blood group provided
  const hasBloodGroupColumn = records.some(
    (r) => getField(r, "bloodGroup").trim() !== ""
  );
  if (hasBloodGroupColumn) {
    const bloodGroupCount = records.filter(
      (r) => getField(r, "bloodGroup").trim() !== ""
    ).length;
    cards.push({ value: bloodGroupCount, label: "Blood Group Provided" });
  }

  cards.forEach((card) => {
    const div = document.createElement("div");
    div.className = "summary-card";
    div.innerHTML = `
      <div class="summary-value">${escapeHtml(card.value)}</div>
      <div class="summary-label">${escapeHtml(card.label)}</div>
    `;
    grid.appendChild(div);
  });
}

/* =============================================================
   8. FULL SPREADSHEET-STYLE TABLE (Section C)
   =============================================================*/

function renderTable(columns, records) {
  const thead = document.getElementById("data-table-head");
  const tbody = document.getElementById("data-table-body");

  // Header row
  const headerRow = document.createElement("tr");
  columns.forEach((col) => {
    const th = document.createElement("th");
    th.textContent = col;
    headerRow.appendChild(th);
  });
  thead.innerHTML = "";
  thead.appendChild(headerRow);

  // Body rows
  tbody.innerHTML = "";
  records.forEach((record) => {
    const tr = document.createElement("tr");
    columns.forEach((col) => {
      const td = document.createElement("td");
      const rawValue = record[col] || "";
      const lowerCol = col.toLowerCase();

      if (lowerCol.includes("email")) {
        td.innerHTML = displayEmail(rawValue);
      } else if (lowerCol.includes("link") || lowerCol.includes("linkedin") || lowerCol.includes("website")) {
        td.innerHTML = displayLink(rawValue);
      } else {
        td.innerHTML = displayValue(rawValue);
      }

      td.title = rawValue; // full text on hover, since cells truncate visually
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

/* =============================================================
   9. FILTER DROPDOWNS (Section D)
   =============================================================*/

function populateFilterDropdowns(records) {
  // --- Batch dropdown ---
  const batchSelect = document.getElementById("filter-batch");
  const batchValues = records
    .map((r) => getField(r, "batch"))
    .filter((v) => v && v.trim() !== "");
  const uniqueBatches = Array.from(new Set(batchValues.map((v) => v.trim()))).sort();

  batchSelect.innerHTML = '<option value="">All Batches</option>';
  uniqueBatches.forEach((batch) => {
    const opt = document.createElement("option");
    opt.value = batch;
    opt.textContent = batch;
    batchSelect.appendChild(opt);
  });

  // --- Employment status dropdown (only show if column exists) ---
  const employmentWrapper = document.getElementById("filter-employment-wrapper");
  const employmentSelect = document.getElementById("filter-employment");
  const hasEmploymentColumn = records.some(
    (r) => getField(r, "employmentStatus").trim() !== ""
  );

  if (hasEmploymentColumn) {
    employmentWrapper.hidden = false;
    const employmentValues = records
      .map((r) => getField(r, "employmentStatus"))
      .filter((v) => v && v.trim() !== "");
    const uniqueStatuses = Array.from(new Set(employmentValues.map((v) => v.trim()))).sort();

    employmentSelect.innerHTML = '<option value="">All Statuses</option>';
    uniqueStatuses.forEach((status) => {
      const opt = document.createElement("option");
      opt.value = status;
      opt.textContent = status;
      employmentSelect.appendChild(opt);
    });
  } else {
    employmentWrapper.hidden = true;
  }

  // Wire up live filtering
  document.getElementById("filter-batch").addEventListener("change", applyFilters);
  document.getElementById("filter-employment").addEventListener("change", applyFilters);
  document.getElementById("filter-specialization").addEventListener("input", applyFilters);
  document.getElementById("filter-keyword").addEventListener("input", applyFilters);
  document.getElementById("clear-filters-btn").addEventListener("click", clearFilters);
}

function clearFilters() {
  document.getElementById("filter-batch").value = "";
  document.getElementById("filter-employment").value = "";
  document.getElementById("filter-specialization").value = "";
  document.getElementById("filter-keyword").value = "";
  applyFilters();
}

/* =============================================================
   10. FILTERING LOGIC
   =============================================================*/

function applyFilters() {
  const batchFilter = document.getElementById("filter-batch").value.trim().toLowerCase();
  const employmentFilter = document.getElementById("filter-employment").value.trim().toLowerCase();
  const specializationFilter = document.getElementById("filter-specialization").value.trim().toLowerCase();
  const keywordFilter = document.getElementById("filter-keyword").value.trim().toLowerCase();

  const filtered = allRecords.filter((record) => {
    // Batch filter (exact match on dropdown value)
    if (batchFilter) {
      const batchValue = getField(record, "batch").trim().toLowerCase();
      if (batchValue !== batchFilter) return false;
    }

    // Employment status filter (exact match on dropdown value)
    if (employmentFilter) {
      const statusValue = getField(record, "employmentStatus").trim().toLowerCase();
      if (statusValue !== employmentFilter) return false;
    }

    // Specialization / skills search (partial match across both fields)
    if (specializationFilter) {
      const combined = (
        getField(record, "specialization") + " " + getField(record, "skills")
      ).toLowerCase();
      if (!combined.includes(specializationFilter)) return false;
    }

    // General keyword search across every field in the record
    if (keywordFilter) {
      const allValues = Object.values(record).join(" ").toLowerCase();
      if (!allValues.includes(keywordFilter)) return false;
    }

    return true;
  });

  renderCards(filtered);
  updateResultCount(filtered.length, allRecords.length);
}

function updateResultCount(shown, total) {
  const el = document.getElementById("filter-result-count");
  el.textContent = `Showing ${shown} of ${total} alumni`;
}

/* =============================================================
   11. ALUMNI PROFILE CARDS (Section E)
   =============================================================*/

function renderCards(records) {
  const grid = document.getElementById("cards-grid");
  const noResultsMsg = document.getElementById("no-results-msg");

  grid.innerHTML = "";

  if (records.length === 0) {
    noResultsMsg.hidden = false;
    updateResultCount(0, allRecords.length);
    return;
  }
  noResultsMsg.hidden = true;

  records.forEach((record) => {
    const card = document.createElement("div");
    card.className = "alumni-card";

    const name = getField(record, "name");
    const batch = getField(record, "batch");

    let html = "";
    html += `<div class="card-name">${name ? escapeHtml(name) : '<span class="muted">Name not provided</span>'}</div>`;
    if (batch) {
      html += `<div class="card-batch">Batch ${escapeHtml(batch)}</div>`;
    }

    html += cardField("Email", displayEmail(getField(record, "email")), true);
    html += cardField("Phone", displayValue(getField(record, "phone")));
    html += cardField("Address", displayValue(getField(record, "address")));
    html += cardField("Undergraduate Education", displayValue(getField(record, "education")));
    html += cardField("Specialization", displayValue(getField(record, "specialization")));
    html += cardField("Skills", displayValue(getField(record, "skills")));
    html += cardField("Current Affiliation", displayValue(getField(record, "affiliation")));
    html += cardField("Job Title & Company", displayValue(getField(record, "jobTitle")));
    html += cardField("Employment Status", displayValue(getField(record, "employmentStatus")));
    html += cardField("LinkedIn", displayLink(getField(record, "linkedin")), true);
    html += cardField("Other Links", displayLink(getField(record, "otherLink")), true);
    html += cardField("Feedback / Comment", displayValue(getField(record, "feedback")));
    html += cardField("Blood Group", displayValue(getField(record, "bloodGroup")));

    card.innerHTML = html;
    grid.appendChild(card);
  });
}

/* Helper to build one label/value row inside a card.
   isPreEscapedHtml = true means "valueHtml" is already-safe HTML
   (e.g. from displayEmail/displayLink) and should not be escaped again. */
function cardField(label, valueHtml) {
  return `
    <div class="card-field">
      <span class="field-label">${escapeHtml(label)}:</span>
      <span class="field-value">${valueHtml}</span>
    </div>
  `;
}

/* =============================================================
   12. APP STARTUP
   =============================================================*/

document.addEventListener("DOMContentLoaded", function () {
  initLoginForm();
  initLogoutButton();

  if (isLoggedIn()) {
    showApp();
  } else {
    showLogin();
  }
});
