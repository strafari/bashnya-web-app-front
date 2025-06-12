"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import useStore from "../store/useStore";
const API = process.env.NEXT_PUBLIC_API_URL;
export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");
  const { setDepartments, setNews, setServices, setToken } = useStore();

  // Добавлено: Проверка аутентификации
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check");
        const data = await response.json();
        setToken(data.authenticated ? "AUTHENTICATED" : null);
      } catch (error) {
        setToken(null);
      }
    };
    checkAuth();
  }, [setToken]);

  // Добавлено: Общая загрузка данных
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [newsRes, departmentsRes, servicesRes] = await Promise.all([
          fetch("/api/news"),
          fetch("/api/departments"),
          fetch("/api/services"),
        ]);

        if (newsRes.ok) setNews(await newsRes.json());
        if (departmentsRes.ok) setDepartments(await departmentsRes.json());
        if (servicesRes.ok) setServices(await servicesRes.json());
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      }
    };

    fetchInitialData();
  }, [setNews, setDepartments, setServices]);

  return (
    <>
      {!isAdminPage && <Header />}
      <main className="flex-grow">{children}</main>
      {!isAdminPage && <Footer />}
    </>
  );
}
