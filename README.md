# 💰 Personal Finance Control (Web, Privacy-First)

[Versión en español](./README.es.md)

**Offline-first** web application for personal finance tracking, designed with a **privacy-first** approach:  
your data **never leaves your device** and there is no backend or external server storage.

---

## 🎯 Project goals

- Track monthly income, expenses and budgets
- Analyze spending by category and transactions
- Work **100% offline**
- Keep all data **client-side only**
- Be usable on both **mobile and desktop**
- Avoid unnecessary dependencies and heavy frameworks

---

## ✨ Main features

- 📊 Dashboard with KPIs and income/expense by category charts
- ➕ Income and expense registration with categories
- 📅 Monthly control with dynamic month selector
- 📈 Category budgets with overspending alerts
- 🚨 Automatic alerts:
  - ⚠️ Month in red (expenses > income)
  - ⚠️ Low savings (< 10% of income)
  - ⚠️ Category close to its budget (80%)
  - 🔴 Category over budget
- 📂 Category-based spending analysis with summary
- 📋 Transaction table for the current month
- 🌙 Native dark theme
- 🗂️ Tab-based navigation (Dashboard, Register, Budgets, Analysis, Settings)
- 💾 Local persistence with **IndexedDB**
- 📦 Local backup system:
  - Export to **JSON** or **CSV**
  - Export all / only incomes / only expenses / only budgets
  - Import full JSON backups
- ☁️ Cloud backups (optional):
  - **Google Drive** provider configurable by the user (Client ID + API Key)
  - Backups stored in a `app-finanzas/backup-YYYY.json` folder in Drive
- 🧹 Manual cleanup of the local database with confirmation

---

## 🔐 Privacy & security

- ❌ No backend  
- ❌ No user accounts  
- ❌ No tracking  
- ❌ No cookies  
- ✅ Data stored only in the browser (IndexedDB)  
- ✅ Backups under the user's explicit control (JSON)  

The user is the **sole owner of their data**.

---

## 🧱 Architecture

The application has been migrated to an architecture based on **Astro + React + TypeScript**, preserving the **offline-first** and **privacy-first** approach.

### High-level structure

```text
app-finanzas/
├── astro.config.mjs          # Astro configuration (React, Tailwind)
├── package.json              # Dev/build scripts
├── vercel.json               # Deployment config for Vercel (static build)
│
├── src/
│   ├── pages/
│   │   └── index.astro       # Main page, mounts the React AppShell
│   │
│   ├── layouts/
│   │   └── Layout.astro      # Base layout (HTML shell, global styles, etc.)
│   │
│   ├── components/
│   │   ├── AppShell/         # Main shell (tabs: Dashboard, Register, etc.)
│   │   ├── views/            # React views per section (Dashboard, Register, Budgets, Settings)
│   │   └── register/         # Register components (forms, monthly transactions table, etc.)
│   │
│   ├── core/
│   │   ├── domain/           # Domain types & logic (movements, budgets, alerts)
│   │   ├── state/            # Typed reactive store (CoreStore)
│   │   ├── persistence/      # IndexedDB, typed repository, local backup
│   │   ├── cloud/            # Typed adapter for cloud backups (Google Drive)
│   │   └── app/              # AppCore facade: single contract for the UI
│   │
│   ├── context/
│   │   └── AppContext.tsx    # React context exposing core state + actions
│   │
│   └── hooks/
│       └── useAppCore.ts     # Hook that boots and interacts with AppCore
│
└── public/                   # Static assets (if any)
```

### 🏗️ Layered architecture

```text
┌─────────────────────────────────────────────┐
│  UI Layer (Astro pages + React views)       │  Tabs, forms, tables
├─────────────────────────────────────────────┤
│  App Facade (core/app/AppCore)             │  Single contract for the UI (actions + queries)
├─────────────────────────────────────────────┤
│  Domain Layer (core/domain)                │  Pure business logic (alerts, budgets, etc.)
├─────────────────────────────────────────────┤
│  State Layer (core/state)                  │  Typed observable store (CoreStore)
├─────────────────────────────────────────────┤
│  Persistence Layer (core/persistence)      │  IndexedDB + local backups (JSON/CSV)
├─────────────────────────────────────────────┤
│  Cloud Layer (core/cloud)                  │  Adapter for cloud providers (Google Drive)
├─────────────────────────────────────────────┤
│  Browser Storage (IndexedDB, localStorage) │  Physical storage
└─────────────────────────────────────────────┘
```

### 🔄 Data flow (Astro/React version)

1. The **user interacts** with forms/buttons in React views (for example, `RegisterView`).
2. Views call **core actions** exposed by `AppCore` via `AppContext` (for example, `addIncome`, `addExpense`, `saveBudget`).
3. The core updates the **reactive store** (`CoreStore`) and **persists** data into IndexedDB via the typed `Repository`.
4. React views subscribe to core state and **re-render automatically** when data changes.
5. **Local backup** and **cloud backup** operations also go through `AppCore`, keeping a single entry point for all core logic.

### 📋 Key principles

- **AppCore as a single facade** → The UI only knows one contract (`AppCore`), making internal evolution of the core easier.
- **Domain-first** → Business logic (alerts, budgets, calculations) lives in `core/domain` as pure functions.
- **Repository Pattern** → Persistence factored into `core/persistence`, currently implemented with IndexedDB.
- **Observable Store** → `CoreStore` exposes `getState`, `setState`, `subscribe` for a clear, predictable data flow.
- **Decoupled UI** → React views focus on presentation and calling core actions, not on persistence details.
- **Static build** → Astro generates a **static site** and mounts a React `AppShell` via `client:load`, keeping good performance and SEO.

---

## 🧩 History & migration

- The first version of the app was built with **HTML + CSS + JavaScript (ES Modules)**, no frameworks.
- To improve **productivity**, **view composition** and **extensibility**, it was gradually migrated to **Astro + React + TypeScript**.
- Business logic was restructured around a typed `AppCore`, but the basic data model (incomes, expenses, budgets) and **IndexedDB** persistence were preserved.
- **Local backups** (JSON/CSV) and **Google Drive** integration were kept and adapted to the new typed core.
- The migration goal was to improve internal architecture **without changing the original spirit**: **offline-first**, **privacy-first**, no backend.

---

## 🗃️ Data persistence

- **Source of truth:** IndexedDB  
- **Stores:** `incomes`, `expenses`, `budgets`  
- **Local backups:**
  - `core/backup` module with format providers (JSON, CSV)
  - Export:
    - All (`incomes`, `expenses`, `budgets`)
    - Only expenses
    - Only incomes
    - Only budgets
  - Import full backups from JSON
- **Cloud backups (optional):**
  - Google Drive provider configured by the user
  - Backups stored in a `app-finanzas/` folder in Drive
  - One file per year: `backup-YYYY.json` (for example `backup-2026.json`)
  - Restore uses the most recent backup available
- **Identifiers:** Auto-increment-like for transactions, category as key for budgets

---

## 🛠️ Data structures

```javascript
// Income
{
  id: <auto>,
  date: "2026-01-15",
  month: "2026-01",
  type: "Salary",
  amount: 2000000
}

// Expense
{
  id: <auto>,
  date: "2026-01-15",
  month: "2026-01",
  category: "Groceries",
  description: "Supermarket",
  amount: 150000
}

// Budget
{
  category: "Rent",
  amount: 900000
}
```

---

## 🚀 How to run and use the app

### Local development

Requirements:

- Node.js `>= 22.12.0`

Install dependencies:

```bash
npm install
```

Start the Astro dev server:

```bash
npm run dev
```

By default the app will be available at a URL like `http://localhost:4321`.

### Production build

```bash
npm run build
```

Astro will generate a static site in the `dist/` folder, which is what gets deployed to production.

### Deployment on Vercel

The project includes a `vercel.json` configured to use `@vercel/static-build` with `dist` as output. Typical flow:

1. Connect the repository to Vercel.
2. Ensure the build command is `npm run build` and the output directory is `dist`.
3. Every push to the configured branch triggers a new deployment.

The app still does not require a dedicated backend: everything runs in the user’s browser.

---

## 📱 Compatibility

- Chrome / Edge  
- Firefox  
- Safari (desktop and mobile)  
- Any modern browser that supports IndexedDB  

---

## 🗂️ Expense categories

The default expense categories in the form are:

- **Rent**
- **Groceries**
- **Utilities**
- **Motorbike**
- **Leisure**

---

## 🧭 App navigation

The interface is organized into 5 main tabs:

1. **Dashboard** – KPIs, balance and income vs. expense charts  
2. **Register** – Forms to add incomes and expenses  
3. **Budgets** – Budget table per category and alerts  
4. **Analysis** – Category summary and detailed transaction table  
5. **Settings** –  
   - **Backup** section: local backups (JSON/CSV), restore and danger zone.  
   - **Data persistence** section: storage provider selection and configuration (Google Drive).  

---

## 🧠 Project status

✔ Functional  
✔ Stable  
✔ Designed for personal use  
✔ Ready for future improvements (PWA, encryption, optional sync)

---

## 📌 Planned improvements

- 🔐 Client-side encryption (optional)  
- 📱 Installable PWA  
- ✏️ Edit/delete registered transactions  
- 🔍 Advanced filters and search  
- 🌗 Light/dark theme toggle  
- 📝 Customizable categories  
- 🧪 Automated tests  

---

## ☁️ Google Drive cloud backup configuration

Google Drive integration is **optional** and configured 100% in the browser.

### 1. Create a project in Google Cloud

1. Go to [Google Cloud Console](https://console.cloud.google.com/).  
2. Create a new project (for example `app-finanzas`).  
3. In **APIs & Services → Library**, enable the **Google Drive API**.

### 2. Create credentials

In **APIs & Services → Credentials**:

1. Create an **API Key**.  
2. Create an **OAuth 2.0 Client ID** of type **Web application**.
   - Add the authorized origin for where you serve the app  
     (for example `http://localhost:4173` or your Vercel URL).

Keep:

- `Client ID` (format `xxxxx.apps.googleusercontent.com`).  
- `API Key`.

### 3. Configure the consent screen (OAuth consent screen)

In **APIs & Services → OAuth consent screen**:

1. Select user type `External` (for personal use, Testing mode is fine).  
2. Fill in the minimum required fields (app name, support email, etc.).  
3. Add your Google account(s) as **Test users**.

> While the project is in Testing mode, only emails added as Test users  
> will be able to authorize the app.

### 4. Connect Google Drive from the app

In the `app-finanzas` application:

1. Go to **Settings → Data persistence**.  
2. In “Storage”, select **Google Drive**.  
3. Fill in:
   - **Client ID** (from Google Cloud).  
   - **API Key**.  
4. Click **“Configure provider”**.
   - A Google popup will open to choose your account and authorize the app.  
   - If all goes well, you’ll see a message like:  
     `Connected to Google Drive as your-email@example.com`.

### 5. Use cloud backups

Once configured:

1. Go to **Settings → Backup**.  
2. Use the buttons:
   - **“Save backup to cloud”** → uploads a full backup to your Drive.  
   - **“Restore from cloud”** → restores the most recent backup.

Backups are stored in your Google Drive in a `app-finanzas/` folder, with one file per year, e.g.:

- `backup-2025.json`, `backup-2026.json`, etc.

> The app never sends your credentials or financial data to any server.  
> Keys and authentication state are stored only in your browser (localStorage).

---

## 📄 License

Personal / educational use.  
You are responsible for managing and backing up your own data.
