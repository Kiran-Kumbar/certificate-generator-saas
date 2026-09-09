import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { User, Institution } from "@/models";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "certificate-saas-super-secret-jwt-key";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    let user = await User.findOne({ email });

    const defaultEmail = process.env.SUPER_ADMIN_EMAIL || "admin@softmusk.com";
    const defaultPassword = process.env.SUPER_ADMIN_PASSWORD || "admin123";

    // Seed default Institution and Admin for immediate initial setup/login testing if DB is empty
    const isSeedAttempt =
      (!user) &&
      ((email === "admin@example.com" && password === "admin123") ||
       (email === "admin@softmusk.com" && password === "admin123") ||
       (email === defaultEmail && password === defaultPassword));

    if (isSeedAttempt) {
      let inst = await Institution.findOne();
      if (!inst) {
        inst = await Institution.create({
          name: "Softmusk Info Pvt. Ltd.",
          code: "SM",
          email: email,
          certificatePrefix: "SM",
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      user = await User.create({
        institutionId: inst._id,
        name: "Softmusk Admin",
        email: email,
        passwordHash,
        role: "super_admin",
      });
    }

    // Ensure existing demo admin account has super_admin role if returning
    if (user && (user.email === "admin@example.com" || user.email === "admin@softmusk.com" || user.email === defaultEmail) && user.role !== "super_admin") {
      user.role = "super_admin";
      await user.save();
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        institutionId: user.institutionId,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institutionId: user.institutionId,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Authentication error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
