import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Certificate Management SaaS Engine",
    time: new Date().toISOString(),
  });
}
