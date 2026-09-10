# Softmusk Certificate Generator SaaS

Enterprise-grade, multi-tenant Certificate Generation and Verification platform built for **Softmusk Info Pvt. Ltd.** Enables instant single-entry generation, bulk Excel batch issuance with real-time preflight validation, drag-and-drop template editing, and tamper-proof public QR verification.

---

## 🚀 Key Features

- **Dual-Engine Rendering**: Pixel-perfect synchronization across **Canvas (PNG)** and **pdf-lib (PDF)**.
- **Embedded Serif & Times Typography**: Zero fallback font discrepancies on Vercel serverless Linux containers via bundled base64 font registration.
- **Automated SmartFit**: Intelligent text auto-scaling and wrapping that prevents name or content overflow across certificates.
- **Salutation Enforcement**: Automatic `"Mr./ Ms. "` prefix normalization with official Softmusk brand navy blue (`#03046e`).
- **Bulk Excel Preflight**: Drag-and-drop Excel processor with field alias resolution, column validation, and auto-fit health indicators before generation.
- **Public Tamper-Proof QR Verification**: Cryptographically hashed verification tokens resolving strictly to `https://smc.onqeva.in/verify/<token>`.
- **Cloudinary Storage**: Automated cloud asset persistence for generated PDFs, PNG previews, and institution stamps.

---

## 📁 Repository Structure

```
├── public/
│   ├── fonts/                   # TTF font files (Times, OpenSans, Tinos, Playfair)
│   ├── templates/               # Official cleaned certificate template backgrounds
│   │   ├── softmusk-internship-clean-bg.png
│   │   ├── softmusk-collaboration-clean-bg.png
│   │   └── softmusk-workshop-clean-bg.png
│   ├── image.png                # Official Softmusk logo
│   └── favicon.ico              # App favicon
├── refrence/                    # Reference design documents and sample certificate
├── scripts/                     # Production utility and testing scripts
│   ├── create_perfect_reference_backgrounds.ts   # Generates flawless template backgrounds
│   ├── seed_setups.js                           # Seeds initial program setups
│   ├── sync_db_templates.ts                     # Synchronizes templates to MongoDB
│   ├── upload_default_templates_cloudinary.ts   # Uploads template assets to Cloudinary
│   ├── test_all_features_e2e.ts                 # Full platform end-to-end test suite
│   └── test_official_templates_render.ts        # Renders all 3 templates for visual QA
├── src/
│   ├── app/                     # Next.js 16 App Router
│   │   ├── api/                 # Backend RESTful API endpoints
│   │   │   ├── assets/          # Institution branding assets (logos, signatures)
│   │   │   ├── auth/            # Authentication (login, logout, JWT session)
│   │   │   ├── batches/         # Bulk issuance batches
│   │   │   ├── certificates/    # Certificate CRUD (POST, GET, PUT, DELETE)
│   │   │   ├── exports/         # ZIP & data export endpoints
│   │   │   ├── health/          # Health check endpoint
│   │   │   ├── preflight/       # Excel batch preflight validation engine
│   │   │   ├── setups/          # Program setup configuration
│   │   │   ├── super-admin/     # Multi-tenant institution management
│   │   │   ├── templates/       # Template management & auto-sync
│   │   │   └── verification/    # Public certificate verification API
│   │   ├── dashboard/           # Authenticated Admin Dashboard
│   │   │   ├── assets/          # Asset Library management
│   │   │   ├── certificates/    # Single & Bulk Generation + Library
│   │   │   ├── setups/          # Program Setups & Dynamic Variable Mapping
│   │   │   ├── templates/       # Visual Drag-and-Drop Template Editor
│   │   │   ├── layout.tsx       # Sidebar navigation & tenant workspace context
│   │   │   └── page.tsx         # Executive Overview metrics
│   │   ├── login/               # Tenant authentication page
│   │   ├── super-admin/         # Multi-tenant super admin dashboard
│   │   ├── verify/[code]/       # Public QR verification landing page
│   │   ├── globals.css          # Tailwind CSS v4 design system
│   │   └── layout.tsx           # Root layout
│   ├── components/              # UI components
│   │   ├── ui/                  # Reusable primitives (toast, skeleton, data-toolbar, empty-state)
│   │   └── OfficialStamp.tsx    # Softmusk official seal component
│   ├── lib/                     # Utilities & Core Libs
│   │   ├── auth.ts              # JWT creation and token verification
│   │   ├── format-date.ts       # Certificate date standardizer (DD-Mon-YYYY)
│   │   ├── mongodb.ts           # Cached Mongoose connection handler
│   │   └── utils.ts             # Tailwind class merging (cn)
│   ├── models/                  # Mongoose schemas (Institution, User, Template, Setup, Certificate, Batch)
│   ├── services/
│   │   ├── certificate-engine/  # Core certificate rendering engine
│   │   │   ├── embedded-fonts.ts# Base64 embedded font binaries for serverless execution
│   │   │   ├── fonts.ts         # Font registration & fallback mappings
│   │   │   ├── index.ts         # Dual-engine canvas & PDF generator
│   │   │   └── smart-fit.ts     # Auto-fit calculation engine
│   │   └── storage.ts           # Cloudinary upload and deletion service
│   ├── types/
│   │   └── template.ts          # TypeScript interfaces for elements, positions, and styles
│   └── middleware.ts            # Route protection & canonical 301 redirection
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory (based on `.env.example`):

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/certificate-saas?retryWrites=true&w=majority

# Canonical Application URL
NEXT_PUBLIC_APP_URL=https://smc.onqeva.in

# Authentication
JWT_SECRET=your-super-secret-jwt-signing-key

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional Super Admin
SUPER_ADMIN_EMAIL=admin@softmusk.com
SUPER_ADMIN_PASSWORD=change_this_password
```

---

## 🛠️ Development & Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run TypeScript type check
npx tsc --noEmit

# Production build
npm run build

# Run template render verification (tests all 3 official templates)
npx tsx scripts/test_official_templates_render.ts

# Synchronize official templates into MongoDB
npx tsx scripts/sync_db_templates.ts
```

---

## 📜 Verification & Brand Standards

- **Official Domain**: `https://smc.onqeva.in` (all legacy `*.vercel.app` requests automatically redirect via 301).
- **Primary Brand Color**: `#03046e` (Deep Royal Navy Blue) for recipient names and highlighted program terms.
- **Accent Color**: `#c59b27` (Official Gold) for divider lines, stars, and seals.
- **Official Typography**: Times-Roman Bold for recipient titles and names, Helvetica / Open Sans for modern metadata.
