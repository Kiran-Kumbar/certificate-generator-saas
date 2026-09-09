# 🚀 Production Deployment & Hosting Guide (Vercel + MongoDB Atlas + Cloudinary)

This guide explains where data is stored, how the production architecture works, and the exact steps and credentials required to host the **Softmusk Certificate Generator SaaS** live on **Vercel**.

---

## 🏢 1. Where and How Data Is Stored in Production

In a production serverless environment like Vercel, the local server filesystem is **read-only and ephemeral** (any temporary files saved to disk disappear as soon as the serverless function terminates). 

Therefore, production data is split cleanly across two cloud services:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             VERCEL DEPLOYMENT                               │
│              (Next.js App Router Serverless Functions & UI)                 │
└───────────────────────┬─────────────────────────────┬───────────────────────┘
                        │                             │
                        ▼                             ▼
┌──────────────────────────────────────┐    ┌──────────────────────────────────┐
│        1. MONGODB ATLAS (Cloud)      │    │     2. CLOUDINARY (Cloud CDN)    │
├──────────────────────────────────────┤    ├──────────────────────────────────┤
│ Stored Data & Collections:           │    │ Stored Media & Binary Files:     │
│ • Users & Admin Authentication       │    │ • Generated Official Vector PDFs │
│ • Institutions & Configuration       │    │ • High-Resolution PNG Previews   │
│ • Certificate Setup Variables        │    │ • Uploaded Template Backgrounds  │
│ • Certificate Templates & Layouts    │    │ • Official Signatures & Stamps   │
│ • Issued Certificates Records        │    │                                  │
│ • Cryptographic Verification Hashes  │    │ Features:                        │
│ • Bulk Generation Batches            │    │ • Permanent CDN storage          │
│ • Asset Metadata                     │    │ • Global fast delivery           │
└──────────────────────────────────────┘    └──────────────────────────────────┘
```

---

## 🔑 2. Required Production Credentials (Environment Variables)

To deploy on Vercel, you need these **5 key environment variables**:

| Variable Name | Purpose | Where to Get It | Example Value |
| :--- | :--- | :--- | :--- |
| `MONGODB_URI` | Cloud database connection string | [MongoDB Atlas](https://cloud.mongodb.com) (Free M0 Cluster) | `mongodb+srv://admin:pass@cluster0.abcde.mongodb.net/certificate_saas?retryWrites=true&w=majority` |
| `NEXT_PUBLIC_APP_URL` | Base public URL embedded in QR codes for mobile verification | Your Vercel domain or custom domain | `https://your-app.vercel.app` or `https://certificates.softmusk.com` |
| `JWT_SECRET` | Secret key for signing admin login session tokens | Generate any 32-char random string | `e7f8a92b...` (Run `openssl rand -base64 32`) |
| `CLOUDINARY_CLOUD_NAME` | Cloud storage account identifier | [Cloudinary Dashboard](https://cloudinary.com) | `softmusk-cloud` |
| `CLOUDINARY_API_KEY` | Cloud storage API access key | [Cloudinary Dashboard](https://cloudinary.com) | `123456789012345` |
| `CLOUDINARY_API_SECRET`| Cloud storage private access key | [Cloudinary Dashboard](https://cloudinary.com) | `aBcDeFgHiJkLmNoPqRsTuVwXyZ` |
| `SUPER_ADMIN_EMAIL` | *(Optional)* Default admin email for first login | Set your preferred email | `admin@softmusk.com` |
| `SUPER_ADMIN_PASSWORD` | *(Optional)* Default admin password | Set your preferred password | `YourSecurePassword123!` |

---

## 📋 3. Step-by-Step Production Setup & Hosting

### Step 1: Set Up Free Cloud Database (MongoDB Atlas)
1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free account.
2. Click **Create a Deployment** → Choose **M0 Free Cluster**.
3. Choose your nearest cloud region (e.g. AWS Mumbai `ap-south-1`).
4. In **Security Quickstart**:
   - Create a database user with username (e.g. `cert_admin`) and password. (Save these!)
   - In **Network Access**, add IP `0.0.0.0/0` (Allow access from anywhere) so Vercel's serverless functions can connect.
5. Click **Connect** → Choose **Drivers** (Node.js).
6. Copy the connection string. Replace `<password>` with your database password:
   ```env
   MONGODB_URI=mongodb+srv://cert_admin:YourPassword@cluster0.xxxxx.mongodb.net/certificate_saas?retryWrites=true&w=majority
   ```

---

### Step 2: Set Up Free Permanent File Storage (Cloudinary)
1. Go to [https://cloudinary.com](https://cloudinary.com) and sign up for a **Free Account** (includes 25 GB free storage/bandwidth per month).
2. Go to your **Dashboard**:
   - Copy **Cloud Name**
   - Copy **API Key**
   - Copy **API Secret**
3. These 3 values will be pasted into Vercel.

---

### Step 3: Push Project to GitHub
In your local project terminal:
```bash
git add .
git commit -m "Production-ready Softmusk Certificate Generator SaaS"
git branch -M main
git remote add origin https://github.com/your-username/certificate-generator-saas.git
git push -u origin main
```

---

### Step 4: Import & Deploy on Vercel
1. Go to [https://vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** → **Project**.
3. Select your `certificate-generator-saas` GitHub repository and click **Import**.
4. In the **Environment Variables** section, expand it and add the following:
   - `MONGODB_URI`: *Your MongoDB Atlas connection string*
   - `NEXT_PUBLIC_APP_URL`: `https://your-project-name.vercel.app` (or custom domain)
   - `JWT_SECRET`: *A secure random string*
   - `CLOUDINARY_CLOUD_NAME`: *Your Cloudinary cloud name*
   - `CLOUDINARY_API_KEY`: *Your Cloudinary API key*
   - `CLOUDINARY_API_SECRET`: *Your Cloudinary API secret*
   - `SUPER_ADMIN_EMAIL`: `admin@softmusk.com`
   - `SUPER_ADMIN_PASSWORD`: `admin123` *(change to your preferred password)*
5. Click **Deploy**.
6. Vercel will automatically build the Next.js project and deploy it globally within ~2 minutes!

---

### Step 5: Verify Live Production Deployment
1. Open your live Vercel URL (e.g. `https://your-app.vercel.app/login`).
2. Log in with:
   - **Email:** `admin@softmusk.com` (or `admin@example.com`)
   - **Password:** `admin123` (or whatever you set in `SUPER_ADMIN_PASSWORD`)
3. The database will automatically self-bootstrap:
   - Creates the default Institution (*Softmusk Info Pvt. Ltd.*)
   - Creates the default Template (*Softmusk Internship Certificate Portrait A4*)
   - Creates the default Certificate Setup (*Student Name, Reg No, College Name, Dept, Domain, Start Date, End Date*)
4. Issue a certificate or open the **Template Editor**:
   - You can drag, resize with 8 handles, add lines, badges, and export.
   - Click **`PDF`** to view and download the official certificate directly in the browser!
   - Scan the QR code with your mobile phone to verify it live!
