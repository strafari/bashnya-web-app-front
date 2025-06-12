import { NextRequest, NextResponse } from "next/server";
const API = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);
  // Добавить grant_type
  formData.append("grant_type", "password");

  const response = await fetch(`${API}/auth/jwt/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    credentials: "include",  // Важно для кук
    body: formData.toString(),
  });

  // Обработка 204 No Content
  if (response.status === 204) {
    const cookies = response.headers.get("set-cookie");
    const res = NextResponse.json(
      { message: "Login successful" },
      { status: 200 }
    );
    if (cookies) {
      res.headers.set("set-cookie", cookies);
    }
    return res;
  }

  // Обработка ошибок
  try {
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}