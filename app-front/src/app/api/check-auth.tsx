import { NextRequest, NextResponse } from "next/server";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie") || "";
    const response = await fetch(`${API_URL}/htoya/`, {
      method: "GET",
      headers: { "Cookie": cookies },
      credentials: "include",
    });

    if (response.ok) {
      const userData = await response.json();
      return NextResponse.json({ authenticated: true, user: userData });
    }
    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (error) {
    console.error("Ошибка проверки авторизации:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}