"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <div className="min-h-screen flex flex-col">
      {!isLoginPage && (
        <header className="bg-[#22212C] rounded-[16px] m-2 mb-4 text-white">
          <div className="container mx-auto p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Link href="/admin">
                  <img
                    src="/logo_bashnya.svg"
                    alt="Логотип"
                    className="h-8 w-auto"
                  />
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[12px]">Администратор</span>
              </div>
            </div>
          </div>
        </header>
      )}
      <main className="flex-grow container mx-auto p-4">{children}</main>
      <footer className="bg-[#303030] py-4 text-center text-white ">
        <div className="container mx-auto">
          &copy; {new Date().getFullYear()} Башня - Панель администратора
        </div>
      </footer>
    </div>
  );
}
