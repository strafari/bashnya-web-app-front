"use client";
const API = process.env.NEXT_PUBLIC_API_URL;

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import useStore from "../store/useStore";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");
  const { setDepartments, setNews, setServices, setToken } = useStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/check-auth", {
          credentials: "include", // Передаем куки
        });
        const data = await response.json();
        setToken(data.authenticated ? "AUTHENTICATED" : null); // Устанавливаем токен в состояние
      } catch (error) {
        console.error("Ошибка проверки аутентификации:", error);
        setToken(null);
      }
    };
    checkAuth();
  }, [setToken]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [newsRes, departmentsRes, servicesRes] = await Promise.all([
          fetch(`${API}/news`),
          fetch(`${API}/departments`),
          fetch(`${API}/services`),
        ]);

        if (newsRes.ok) setNews(await newsRes.json());
        if (departmentsRes.ok) setDepartments(await departmentsRes.json());
        if (servicesRes.ok) setServices(await servicesRes.json());
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
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