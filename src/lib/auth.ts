import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "certificate-saas-super-secret-jwt-key";

export interface JWTPayload {
  userId: string;
  institutionId: string;
  role: string;
  name: string;
  email: string;
}

export function extractAuthToken(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/token=([^;]+)/);
  if (tokenMatch) {
    return decodeURIComponent(tokenMatch[1]);
  }

  // Fallback to Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return null;
}

export function verifyAuthToken(req: Request): JWTPayload | null {
  const token = extractAuthToken(req);

  if (token) {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
      // Fall through to fallback
    }
  }

  // Local development fallback: Return demo admin payload if cookie is missing or unverified
  if (process.env.NODE_ENV !== "production") {
    return {
      userId: "66d84f2e0000000000000001",
      institutionId: "66d84f2e0000000000000002",
      role: "super_admin",
      name: "Demo Admin",
      email: "admin@example.com",
    };
  }

  return null;
}
