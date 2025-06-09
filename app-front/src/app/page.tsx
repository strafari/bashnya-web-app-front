"use client";
import React, { useState, useEffect } from "react";
import DepartmentServiceCount from "@/components/DepartmentServiceCount";
import ReviewsComponent from "@/components/ReviewsComponent";
import TopServicesSection from "@/components/TopServicesSection";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import ServiceModal from "@/components/ServiceModal";
import NewsCard from "@/components/NewsCard";
import EventsCard from "@/components/EventsCard";
import EventModal from "@/components/EventModal";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";

const API = process.env.NEXT_PUBLIC_API_URL!;
if (!API) {
  console.error("⚠️ NEXT_PUBLIC_API_URL is not defined!");
}

interface NewsItem {
  news_id: number;
  news_photo: string;
  news_title: string;
  news_text: string;
  news_date: string;
}

interface EventItem {
  event_id: number;
  event_name: string;
  event_description: string;
  event_date_time: string;
  event_location: string;
  event_max_seats: number;
  event_photo?: string;
  event_host?: string;
  event_price?: string;
}

export default function Home() {
  const [selectedService, setSelectedService] = useState({ name: "", price: "" });
  const [latestNews, setLatestNews]   = useState<NewsItem[]>([]);
  const [latestEvents, setLatestEvents] = useState<EventItem[]>([]);
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [showHeader, setShowHeader]     = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Логика открытия/закрытия модалок…
  const handleOpenModal = () => { setIsModalOpen(true); setShowHeader(false); };
  const handleCloseModal = () => { setIsModalOpen(false); setShowHeader(true); };
  const openModal = (name: string, price: string) => {
    setSelectedService({ name, price });
    handleOpenModal();
  };
  const closeModal = handleCloseModal;
  const handleOpenEventModal = (event: EventItem) => {
    setSelectedEvent(event);
    handleOpenModal();
  };
  const handleCloseEventModal = () => {
    setSelectedEvent(null);
    handleCloseModal();
  };

  useEffect(() => {
    // Fetch latest news
    const fetchLatestNews = async () => {
      if (!API) return;
      const url = `${API}/news?limit=3&sort=latest`;
      console.log("Fetching news from", url);
      try {
        const res = await fetch(url, { mode: "cors", cache: "no-store" });
        if (!res.ok) throw new Error(`News ${res.status}`);
        const data: NewsItem[] = await res.json();
        console.log("News loaded:", data);
        setLatestNews(data);
      } catch (err) {
        console.error("Error fetching news:", err);
      }
    };
    fetchLatestNews();
  }, [API]);

  useEffect(() => {
    // Fetch latest events
    const fetchLatestEvents = async () => {
      if (!API) return;
      const url = `${API}/events`;
      console.log("Fetching events from", url);
      try {
        const res = await fetch(url, { mode: "cors", cache: "no-store" });
        if (!res.ok) throw new Error(`Events ${res.status}`);
        const data: EventItem[] = await res.json();
        console.log("Events loaded:", data);
        // Сортируем по id, чтобы свежие первыми
        setLatestEvents(data.sort((a, b) => b.event_id - a.event_id));
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    fetchLatestEvents();
  }, [API]);

  return (
    <div className="grid gap-6">
      {showHeader && <Header />}
      <ScrollToTop />

      {/* Hero & Sections… */}

      {/* Новости */}
      <section className="container mx-auto px-4 mt-12">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl md:text-4xl">НОВОСТИ</h2>
          <Link href="/news">
            <button className="bg-black text-white px-4 py-2 rounded">Все новости</button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 mb-6">
          {latestNews.length > 0
            ? latestNews.map(n => (
                <NewsCard
                  key={n.news_id}
                  news_id={n.news_id}
                  news_photo={n.news_photo}
                  news_title={n.news_title}
                  news_text={n.news_text}
                  news_date={n.news_date}
                />
              ))
            : <p>Загрузка новостей…</p>
          }
        </div>
      </section>

      {/* Мероприятия */}
      <section className="container mx-auto px-4 mt-12">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl md:text-4xl">МЕРОПРИЯТИЯ</h2>
          <Link href="/events">
            <button className="bg-black text-white px-4 py-2 rounded">Все события</button>
          </Link>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-6 mb-6">
          {latestEvents.length > 0
            ? latestEvents.slice(0, 2).map(evt => (
                <EventsCard
                  key={evt.event_id}
                  event={evt}
                  onClick={() => handleOpenEventModal(evt)}
                />
              ))
            : <p>Загрузка мероприятий…</p>
          }
        </div>
      </section>

      <EventModal
        isOpen={isModalOpen}
        onClose={handleCloseEventModal}
        event={selectedEvent}
      />
    </div>
  );
}
