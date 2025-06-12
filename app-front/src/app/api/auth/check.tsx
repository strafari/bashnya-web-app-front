import { NextApiRequest, NextApiResponse } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Метод не разрешен" });
  }

  try {
    // Получаем куки из запроса
    const cookies = req.headers.cookie || "";

    // Отправляем запрос к бэкенду FastAPI
    const response = await fetch(`${API_URL}/htoya/`, {
      method: "GET",
      headers: {
        "Cookie": cookies, // Передаем куки от клиента
        "Accept": "application/json",
      },
      credentials: "include", // Убеждаемся, что куки передаются
    });

    if (response.ok) {
      const userData = await response.json();
      return res.status(200).json({ authenticated: true, user: userData });
    } else {
      return res.status(401).json({ authenticated: false });
    }
  } catch (error) {
    console.error("Ошибка проверки аутентификации:", error);
    return res.status(500).json({ authenticated: false, error: "Ошибка сервера" });
  }
}