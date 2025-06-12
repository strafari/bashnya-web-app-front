"use client";
const API = process.env.NEXT_PUBLIC_API_URL;

import { useEffect } from "react";
import useStore from "../store/useStore";
import { usePathname } from "next/navigation";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, setToken } = useStore();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API}/htoya/`, {
          credentials: "include",
        });
        if (response.ok) {
          setToken("AUTHENTICATED");
        } else if (token) {
          setToken(null);
        }
      } catch (error) {
        console.error("Ошибка проверки авторизации:", error);
        if (token) setToken(null);
      }
    };
    checkAuth();
  }, [pathname, setToken]);

  return <>{children}</>;
}