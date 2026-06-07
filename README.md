# 🛡️ Incident IRA — Incident Reporting & Analysis

A multi-organization web app for reporting, investigating and learning from workplace incidents:
self-service org registration with admin approval, a guided **5-step incident workflow**, per-person
**injury reports** on an interactive **body map**, a standalone **occupational-illness** module, fully
interactive **root-cause diagram builders** (5-Why, Fishbone, Bow-Tie, FTA, ETA), a cross-record
**Action Tracker**, and an interactive analytics **dashboard**.

Built with **React (JSX) + Vite**, **Cloud Firestore + Firebase Auth**, **Tailwind CSS**,
**Framer Motion**, **Recharts**, **React Flow** (`@xyflow/react`), and **react-to-print**.

---

## Features

- **5-step incident workflow** (one resumable record):
  1. Initial Incident Report — date/time, type, severity, HSE category, location, narrative, affected
     personnel (internal/external), photographic evidence → print the **Initial Report**.
  1a. **Injury Reports** (shown for first-aid / lost-time / reportable injuries) — per person: first aid,
     injured body part(s) on an interactive **body map**, injury type, medication, days off work,
     medical records.
  2. Investigation Team · 3. **Investigation diagram** · 4. CAPA actions · 5. Horizontal deployment →
     **Close** the incident and print the **Full Incident Report** (incl. the diagram + injury reports).
- **Investigation diagram builders** — drag-and-drop, fully interactive (React Flow): **5-Why**,
  **Fishbone (6M)**, **Bow-Tie**, **Fault Tree Analysis**, **Event Tree Analysis**. Each is exported to a
  PNG that is embedded in the report PDF.
- **Illness reporting** — standalone or linked to an incident: exposed HSE agent, exposure duration, PPE,
  health issue, affected body parts, corrective actions, printable report.
- **Action Tracker** — corrective/preventive actions from incidents *and* illnesses in one place, with
  open / in-progress / closed status, overdue flags, and "my actions".
- **Dashboard** — interactive cross-filtering by Level (severity), Type, HSE Category, Location, plus an
  Action Status widget and a **body heatmap** of injuries/illnesses.
- **Roles** — Reporter / Investigator / Admin, with org-approval signup.

---

## Getting started

```bash
npm install
cp .env.example .env   # then fill in your Firebase web config
npm run dev
```

Until `.env` has a real Firebase config the app shows a **"Connect Firebase"** setup screen.

### Create a Firebase project
1. Firebase Console → create a project → add a **Web app**; copy the config into `.env`
   (`VITE_FIREBASE_*`).
2. Enable **Authentication → Email/Password**.
3. Create a **Cloud Firestore** database.
4. Publish security rules: `firebase deploy --only firestore:rules` (rules live in
   [`firestore.rules`](firestore.rules)).

---

## Quality & tests

- **Unit tests:** `npm test` (Vitest) — pure logic libs (`stats`, `permissions`, `actions`, `audit`,
  `fileToDataUrl`, `session`).
- **Security-rules tests:** `npm run test:rules` — boots the Firestore emulator and runs allow/deny cases
  in `tests/rules/` against [`firestore.rules`](firestore.rules). **Requires Java (a JRE)** for the
  emulator.
- **Build:** `npm run build` then `npm run preview`.

## Data model (Firestore)

```
users/{uid}                                            role(reporter|investigator|admin), status, orgId, dept
organizations/{orgId}                                  org doc
organizations/{orgId}/incidents/{id}                   the 5-step incident (+ injury reports)
organizations/{orgId}/incidents/{id}/photos/{pid}      base64 images / medical records / diagram PNG (≤750KB)
organizations/{orgId}/illnesses/{id}                   illness report (+ /files subcollection)
organizations/{orgId}/meta/stats                       dashboard counters (severity/type/category/location/lifecycle)
organizations/{orgId}/auditLogs/{id}                   append-only, immutable
orgIndex/{nameLower}                                   public { orgId, name } signup index
```

Soft-deleted incidents/illnesses move to an admin **Recycle Bin** (`/app/recycle`) and can be restored or
permanently purged. The audit log is append-only and immutable by design.

> Incident IRA is a record-keeping, investigation and tracking aid. It does **not** discharge any statutory
> reporting obligation (e.g. RIDDOR) or occupational-health duty.
