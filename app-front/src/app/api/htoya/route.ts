import { NextRequest, NextResponse } from "next/server";
const API = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  try {
    // Проверка кук из запроса
    const cookies = request.headers.get("cookie") || "";
    
    const response = await fetch(`${API}/htoya/`, {
      headers: { 
        "Cookie": cookies // Передаём все куки
      },
      credentials: "include",
    });

    if (response.ok) {
      const userData = await response.json();
      return NextResponse.json({
        authenticated: true,
        user: userData
      });
    }
    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
