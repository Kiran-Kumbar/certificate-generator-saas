import mongoose, { Schema, Document, Model } from "mongoose";

// --- Institution Model ---
export interface IInstitution extends Document {
  name: string;
  code: string;
  email: string;
  phone?: string;
  certificatePrefix: string;
  status: "active" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

const InstitutionSchema = new Schema<IInstitution>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    email: { type: String, required: true },
    phone: { type: String },
    certificatePrefix: { type: String, required: true, uppercase: true, default: "CERT" },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
  },
  { timestamps: true }
);

export const Institution: Model<IInstitution> =
  mongoose.models.Institution || mongoose.model<IInstitution>("Institution", InstitutionSchema);

// --- User Model ---
export interface IUser extends Document {
  institutionId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: "super_admin" | "admin" | "staff";
  status: "active" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["super_admin", "admin", "staff"], default: "admin" },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

// --- Asset Model ---
export interface IAsset extends Document {
  institutionId: mongoose.Types.ObjectId;
  name: string;
  type: "logo" | "signature" | "stamp" | "seal" | "watermark" | "other";
  cloudinaryPublicId: string;
  url: string;
  mimeType: string;
  bytes: number;
  width?: number;
  height?: number;
  createdBy: mongoose.Types.ObjectId;
}

const AssetSchema = new Schema<IAsset>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", required: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["logo", "signature", "stamp", "seal", "watermark", "other"],
      required: true,
    },
    cloudinaryPublicId: { type: String, required: true },
    url: { type: String, required: true },
    mimeType: { type: String, required: true },
    bytes: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Asset: Model<IAsset> = mongoose.models.Asset || mongoose.model<IAsset>("Asset", AssetSchema);

// --- Template & TemplateVersion Model ---
export interface ITemplate extends Document {
  institutionId: mongoose.Types.ObjectId;
  name: string;
  backgroundUrl: string;
  backgroundPublicId: string;
  width: number;
  height: number;
  elements: Array<Record<string, unknown>>;
  status: "draft" | "published" | "archived";
  createdBy: mongoose.Types.ObjectId;
}

const TemplateSchema = new Schema<ITemplate>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", required: true, index: true },
    name: { type: String, required: true },
    backgroundUrl: { type: String, required: true },
    backgroundPublicId: { type: String, required: true },
    width: { type: Number, default: 841.89 },
    height: { type: Number, default: 595.28 },
    elements: { type: Schema.Types.Mixed, default: [] },
    status: { type: String, enum: ["draft", "published", "archived"], default: "published" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Template: Model<ITemplate> =
  mongoose.models.Template || mongoose.model<ITemplate>("Template", TemplateSchema);

// --- CertificateSetup Model ---
export interface ICertificateSetup extends Document {
  institutionId: mongoose.Types.ObjectId;
  name: string;
  templateId: mongoose.Types.ObjectId;
  programText: string;
  variables: Array<{ key: string; label: string; type: string; required: boolean }>;
  folderRule?: string;
  createdBy: mongoose.Types.ObjectId;
}

const CertificateSetupSchema = new Schema<ICertificateSetup>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", required: true, index: true },
    name: { type: String, required: true },
    templateId: { type: Schema.Types.ObjectId, ref: "Template", required: true },
    programText: { type: String, required: true },
    variables: [
      {
        key: { type: String, required: true },
        label: { type: String, required: true },
        type: { type: String, default: "text" },
        required: { type: Boolean, default: true },
      },
    ],
    folderRule: { type: String, default: "/{{year}}/{{program}}" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const CertificateSetup: Model<ICertificateSetup> =
  mongoose.models.CertificateSetup || mongoose.model<ICertificateSetup>("CertificateSetup", CertificateSetupSchema);

// --- CertificateBatch Model ---
export interface ICertificateBatch extends Document {
  institutionId: mongoose.Types.ObjectId;
  setupId: mongoose.Types.ObjectId;
  name: string;
  total: number;
  processed: number;
  successful: number;
  failed: number;
  status: "processing" | "completed" | "completed_with_errors" | "failed";
  createdBy: mongoose.Types.ObjectId;
}

const CertificateBatchSchema = new Schema<ICertificateBatch>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", required: true, index: true },
    setupId: { type: Schema.Types.ObjectId, ref: "CertificateSetup", required: true },
    name: { type: String, required: true },
    total: { type: Number, required: true },
    processed: { type: Number, default: 0 },
    successful: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["processing", "completed", "completed_with_errors", "failed"],
      default: "processing",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const CertificateBatch: Model<ICertificateBatch> =
  mongoose.models.CertificateBatch || mongoose.model<ICertificateBatch>("CertificateBatch", CertificateBatchSchema);

// --- Folder Model ---
export interface IFolder extends Document {
  institutionId: mongoose.Types.ObjectId;
  name: string;
  parentId?: mongoose.Types.ObjectId;
  path: string;
}

const FolderSchema = new Schema<IFolder>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", required: true, index: true },
    name: { type: String, required: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Folder" },
    path: { type: String, required: true },
  },
  { timestamps: true }
);

export const Folder: Model<IFolder> = mongoose.models.Folder || mongoose.model<IFolder>("Folder", FolderSchema);

// --- Counter Model ---
export interface ICounter extends Document {
  institutionId: mongoose.Types.ObjectId;
  year: number;
  prefix: string;
  sequence: number;
}

const CounterSchema = new Schema<ICounter>({
  institutionId: { type: Schema.Types.ObjectId, required: true, index: true },
  year: { type: Number, required: true },
  prefix: { type: String, required: true },
  sequence: { type: Number, default: 0 },
});

CounterSchema.index({ institutionId: 1, year: 1, prefix: 1 }, { unique: true });

export const Counter: Model<ICounter> = mongoose.models.Counter || mongoose.model<ICounter>("Counter", CounterSchema);

// --- Certificate Model ---
export interface ICertificate extends Document {
  institutionId: mongoose.Types.ObjectId;
  setupId: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  batchId?: mongoose.Types.ObjectId;
  rowNumber?: number;
  certificateNumber: string;
  verificationToken?: string;
  verificationCodeHash: string;
  studentName: string;
  recipientData: Record<string, unknown>;
  pdfUrl: string;
  pngUrl: string;
  folderId?: mongoose.Types.ObjectId;
  status: "draft" | "issued" | "revoked";
  issuedAt: Date;
  lastEmailedTo?: string;
  lastEmailedAt?: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", required: true, index: true },
    setupId: { type: Schema.Types.ObjectId, ref: "CertificateSetup", required: true },
    templateId: { type: Schema.Types.ObjectId, ref: "Template", required: true },
    batchId: { type: Schema.Types.ObjectId, ref: "CertificateBatch", index: true },
    rowNumber: { type: Number },
    certificateNumber: { type: String, required: true },
    verificationToken: { type: String, index: true },
    verificationCodeHash: { type: String, required: true, index: true },
    studentName: { type: String, required: true, index: true },
    recipientData: { type: Schema.Types.Mixed, required: true },
    pdfUrl: { type: String, required: true },
    pngUrl: { type: String, required: true },
    folderId: { type: Schema.Types.ObjectId, ref: "Folder" },
    status: { type: String, enum: ["draft", "issued", "revoked"], default: "issued" },
    issuedAt: { type: Date, default: Date.now },
    lastEmailedTo: { type: String },
    lastEmailedAt: { type: Date },
  },
  { timestamps: true }
);

CertificateSchema.index({ institutionId: 1, certificateNumber: 1 }, { unique: true });
CertificateSchema.index(
  { batchId: 1, rowNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { batchId: { $exists: true, $type: "objectId" } },
  }
);

if (process.env.NODE_ENV === "development" && mongoose.models.Certificate) {
  delete (mongoose.models as Record<string, unknown>).Certificate;
}

export const Certificate: Model<ICertificate> =
  mongoose.models.Certificate || mongoose.model<ICertificate>("Certificate", CertificateSchema);
