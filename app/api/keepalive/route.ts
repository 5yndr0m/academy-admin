import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "";

  try {
    const res = await fetch(`${backendUrl}/api/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const data = await res.json();
    return NextResponse.json({ pinged: true, backend: data });
  } catch (err) {
    return NextResponse.json(
      { pinged: false, error: String(err) },
      { status: 503 }
    );
  }
}
