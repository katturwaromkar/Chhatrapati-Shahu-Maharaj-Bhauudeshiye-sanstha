# Hostinger Deployment Guide

This guide details the step-by-step process for deploying the **Chhatrapati Shahu Maharaj Bahuuddeshiya Sanstha** web application to **Hostinger** web hosting.

---

## 🚀 Quick Summary of Hostinger Compatibility

- **Hosting Type**: Hostinger Web Hosting / Premium / Business / Cloud (Apache & LiteSpeed Web Server).
- **Backend Architecture**: Dual-stack support.
  - Primary: Native PHP Backend (`php_backend/*.php`) routed via `.htaccess` (`/api/*`).
  - Secondary/Fallback: Node.js / Vercel Serverless API (`api/*.js`).
- **Database**: Local JSON storage in `php_backend/data/` (secured via `.htaccess`) or Supabase PostgreSQL via Prisma.

---

## 📁 Step 1: Prepare Your Production Files

Make sure you have all project files in your workspace directory ready for upload.

### Files & Folders to Upload:
- HTML pages (`index.html`, `about.html`, `family-health-card.html`, `patient-registration.html`, `hospitals.html`, `doctors.html`, `camps-photos.html`, `news.html`, `documents.html`, `our-officers.html`, `committee.html`, `contact.html`, `disclaimer.html`, `privacy-policy.html`, `terms.html`, `404.html`)
- Assets (`css/`, `js/`, `assets/`, `documents/`)
- PHP Backend (`php_backend/`)
- Web Server Config (`.htaccess`, `_headers`, `robots.txt`, `sitemap.xml`, `manifest.json`, `sw.js`)

> [!IMPORTANT]
> Do **NOT** upload `node_modules/`, `.git/`, `.env`, or local build logs. The `.htaccess` file automatically blocks access to sensitive files, but keeping them off the server is best practice.

---

## 🛠️ Step 2: Upload to Hostinger hPanel File Manager

1. Log into your **Hostinger Control Panel (hPanel)**: [https://hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Go to **Websites** -> Select your domain (`chatrpatishahumaharajbahuuddeshiyasanstha.in`).
3. Click on **File Manager**.
4. Open the **`public_html`** directory.
5. Upload all project files directly into `public_html/`.

*(Alternatively, use **FTP / SFTP** using FileZilla with Hostinger FTP credentials).*

---

## 🔒 Step 3: Verify File & Directory Permissions

In Hostinger File Manager:
- Set **Directories** permissions to `755`.
- Set **Files** permissions to `644`.
- Ensure `php_backend/data/` exists and is writable by PHP (`755` or `777`).

---

## 🛡️ Step 4: Enable Free SSL (HTTPS)

1. In hPanel, go to **Security** -> **SSL**.
2. Select your domain and click **Install SSL**.
3. Enable **Automatic HTTPS Redirection**. (The included `.htaccess` file also forces HTTPS automatically).

---

## 🌐 Step 5: Test Live API Endpoints

Once uploaded, test the following endpoints in your web browser or Postman:

1. **Visitor Counter**:
   `https://chatrpatishahumaharajbahuuddeshiyasanstha.in/api/counter`
2. **Health Cards API**:
   `https://chatrpatishahumaharajbahuuddeshiyasanstha.in/api/cards`
3. **Patients API**:
   `https://chatrpatishahumaharajbahuuddeshiyasanstha.in/api/patients`

---

## 🗄️ Step 6 (Optional): Connect External Database (Supabase / MySQL)

If you wish to switch from local JSON storage to Supabase PostgreSQL or Hostinger MySQL:
1. In hPanel, go to **Databases** -> **MySQL Databases** to create a database.
2. Update `.env` variables (`DATABASE_URL`, `DIRECT_URL`).
3. Run `npx prisma db push` from your local machine.

---

## ✅ Deployment Checklist

- [x] Apache Rewrite rules configured in `.htaccess` (`/api/*` -> `php_backend/*.php`)
- [x] Data folder protected (`php_backend/data/.htaccess`)
- [x] Security headers enabled (HSTS, CSP, X-Frame-Options)
- [x] Browser Caching & Gzip Compression active
- [x] PWA Service Worker (`sw.js`) verified
- [x] Offline fallback (`404.html`) ready
