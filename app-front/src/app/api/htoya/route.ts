import { NextRequest, NextResponse } from "next/server";
const API = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(`${API}/htoya/`, {
      headers: {
        // Передаём cookie из запроса
        Cookie: req.headers.get("Cookie") || "",
      },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Unauthorized");

    const userData = await response.json();
    return NextResponse.json(userData);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Authentication failed", error: error.message },
      { status: 401 }
    );
  }
}
