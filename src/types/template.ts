export type Position = {
  x: number;      // Document point (pt)
  y: number;      // Document point (pt)
  width: number;  // Document point (pt)
  height: number; // Document point (pt)
};

export type SmartFitConfig = {
  enabled: boolean;
  maxLines: number;
  minFontSize: number;
  wordWrap: boolean;
};

export type CertificateElementType =
  | "text"
  | "variable"
  | "image"
  | "signature"
  | "stamp"
  | "qr"
  | "line"
  | "shape"
  | "badge";

export type CertificateShapeType =
  | "rectangle"
  | "rounded"
  | "circle"
  | "badge"
  | "seal"
  | "star"
  | "medal"
  | "ribbon"
  | "line"
  | "double-line"
  | "gold-divider"
  | "dashed-line"
  | "dotted-line"
  | "corner-ornament";

export type CertificateElementStyle = {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline";
  textAlign: "left" | "center" | "right";
  color: string;
  lineHeight?: number;
  letterSpacing?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: "solid" | "dashed" | "dotted" | "double";
  borderRadius?: number;
  opacity?: number;
  shapeType?: CertificateShapeType;
};

export type CertificateElement = {
  id: string;
  type: CertificateElementType;
  position: Position;
  variableKey?: string;
  content?: string;
  assetId?: string;
  cloudinaryUrl?: string;
  style?: CertificateElementStyle;
  smartFit?: SmartFitConfig;
  locked?: boolean;
  hidden?: boolean;
  rotation?: number;
};

export type CertificateDocument = {
  width: number;       // A4 Landscape: 841.89 pt
  height: number;      // A4 Landscape: 595.28 pt
  unit: "pt";
  backgroundUrl?: string;
  backgroundPublicId?: string;
  elements: CertificateElement[];
};

export type ElementLayoutResult = {
  id: string;
  resolvedContent?: string;
  fontSize?: number;
  lines?: string[];
  overflow: boolean;
  actionTaken: "none" | "wrapped" | "font_reduced" | "error";
};

export type CertificateRenderResult = {
  pdfBuffer: Buffer;
  pngBuffer: Buffer;
  certificateNumber: string;
  verificationToken: string;
  verificationCodeHash: string;
  layout: {
    elements: ElementLayoutResult[];
    hasOverflow: boolean;
  };
};

export type PreflightRowResult = {
  rowNumber: number;
  data: Record<string, unknown>;
  elements: ElementLayoutResult[];
  status: "ready" | "wrapped" | "font_reduced" | "overflow_error";
};

export type PreflightResult = {
  total: number;
  ready: number;
  wrapped: number;
  fontReduced: number;
  errors: number;
  rows: PreflightRowResult[];
};
