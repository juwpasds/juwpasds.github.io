Weekend Masters in Applied Statistics and Data Science Alumni Directory
A simple static web-based alumni directory for the Weekend Masters in Applied Statistics and Data Science, Jahangirnagar University.
The website loads alumni information from a CSV file and displays it after a common login. It is designed for beginner-friendly deployment using GitHub Pages, Netlify, or other static website hosting platforms.
Live Website
After publishing through GitHub Pages, the website link will look like:
```text
https://your-github-username.github.io/your-repository-name/
```
Replace the above link with your actual GitHub Pages URL after deployment.
Features
Login page with common User ID and password
Alumni information loaded from `alumni.csv`
Summary section showing basic alumni statistics
Full spreadsheet-style table view
Alumni profile card view
Search and filtering options:
Batch number
Employment status
Specialization / skills
General keyword search
Responsive layout for desktop and mobile screens
Clickable email and profile links
Default Login
```text
User ID: alumni
Password: alumni2026
```
To change the login credentials, open `app.js` and edit:
```javascript
const COMMON_USER_ID = "alumni";
const COMMON_PASSWORD = "alumni2026";
```
Project Files
```text
.
├── index.html      # Main webpage structure
├── style.css       # Website design and layout
├── app.js          # Login, CSV loading, table display, and search functions
├── alumni.csv      # Alumni information file
└── README.md       # Project documentation
```
CSV File Format
The website reads data from:
```text
alumni.csv
```
The first row of the CSV file must contain column headings. Example:
```csv
Name,Email,Phone number,Batch Number,Current Employment Status,Specialization,Skills
```
Additional columns may be included. The website will still display them in the full spreadsheet-style table.
How to Run Locally
Download or clone this repository.
Open the project folder in Command Prompt or Terminal.
Run:
```bash
python -m http.server 8000
```
Then open your browser and visit:
```text
http://localhost:8000
```
Do not open `index.html` directly by double-clicking it, because the CSV file may not load correctly in some browsers.
How to Publish on GitHub Pages
Create a GitHub repository.
Upload these files to the root of the repository:
```text
index.html
style.css
app.js
alumni.csv
README.md
```
Go to repository Settings.
Open Pages.
Under Build and deployment, select:
```text
Source: Deploy from a branch
Branch: main
Folder: /root
```
Click Save.
Wait a few minutes for GitHub Pages to publish the site.
Your website URL will look like:
```text
https://your-github-username.github.io/repository-name/
```
How to Update Alumni Data
To update the alumni directory:
Edit `alumni.csv`.
Keep the filename exactly as:
```text
alumni.csv
```
Upload or commit the updated file to GitHub.
Refresh the website after GitHub Pages redeploys.
Important Security Warning
This project uses front-end JavaScript login only. It is not real password protection.
On static hosting platforms such as GitHub Pages, Netlify, or Cloudflare Pages, files such as `app.js` and `alumni.csv` can still be accessed by technical users.
Therefore, this project should only be used for public or consent-based alumni information.
Do not publish sensitive private information such as:
Personal phone numbers
Home addresses
Private email addresses
Blood group information
Any information shared without consent
For real authentication and private data protection, use a backend-based system such as Firebase Authentication, Supabase, Cloudflare Access, or a university-managed web server.
Recommended Use
This project is suitable for:
Weekend Masters in Applied Statistics and Data Science alumni directory
Small alumni groups
Public alumni directories
Demo websites
Internal prototypes
Beginner web development learning
This project is not suitable for confidential alumni databases unless proper authentication and server-side protection are added.
License
This project may be used and modified for academic, educational, and non-commercial purposes.
Author / Maintainer
Prepared for the Weekend Masters in Applied Statistics and Data Science, Jahangirnagar University Alumni Directory project.
