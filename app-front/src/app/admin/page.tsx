"use client";
const API = process.env.NEXT_PUBLIC_API_URL;

import Link from "next/link";
import { useState, useEffect } from "react";
import Modal from "@/components/EditModal";

type Stats = {
  coworkings: number;
  seats: number;
  bookings: number;
  events: number;
  registrations: number;
  news: number;
  users: number;
};

type BookingStats = {
  coworking_location: number;
  count_bookings: number;
}[];

type RegistrationStats = {
  event_name: string;
  count_regs: number;
}[];

type DailyBookingStats = {
  day: string;
  count: number;
}[];

type DailyRegistrationStats = {
  day: string;
  count: number;
}[];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    coworkings: 0,
    seats: 0,
    bookings: 0,
    events: 0,
    registrations: 0,
    news: 0,
    users: 0,
  });

  const [bookingStats, setBookingStats] = useState<BookingStats>([]);
  const [registrationStats, setRegistrationStats] = useState<RegistrationStats>([]);
  const [dailyBookingStats, setDailyBookingStats] = useState<DailyBookingStats>([]);
  const [dailyRegistrationStats, setDailyRegistrationStats] = useState<DailyRegistrationStats>([]);
  const [loading, setLoading] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isDailyBookingModalOpen, setIsDailyBookingModalOpen] = useState(false);
  const [isDailyRegistrationModalOpen, setIsDailyRegistrationModalOpen] = useState(false);
  const [isDatePickerModalOpen, setIsDatePickerModalOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentStatType, setCurrentStatType] = useState<'booking' | 'registration' | null>(null);

  const truncateText = (text: string, length: number) => {
    return text.length > length ? `${text.substring(0, length)}...` : text;
  };

  const fetchBookingStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/stats/bookings/counts`, {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        },
        credentials: 'include',
        mode: 'cors'
      });
      if (response.ok) {
        const data = await response.json();
        const sortedData = data.sort((a: BookingStats[0], b: BookingStats[0]) => 
          a.coworking_location - b.coworking_location
        );
        setBookingStats(sortedData);
        setIsBookingModalOpen(true);
      }
    } catch (error) {
      console.error('Ошибка при получении статистики бронирований:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrationStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/stats/registrations/counts`, {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        },
        credentials: 'include',
        mode: 'cors'
      });
      if (response.ok) {
        const data = await response.json();
        setRegistrationStats(data);
        setIsRegistrationModalOpen(true);
      }
    } catch (error) {
      console.error('Ошибка при получении статистики регистраций:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSubmit = () => {
    if (currentStatType === 'booking') {
      if (selectedStartDate && selectedEndDate) {
        fetchDailyBookingStats(selectedStartDate, selectedEndDate);
      }
    } else if (currentStatType === 'registration') {
      if (selectedDate) {
        fetchDailyRegistrationStats(selectedDate);
      }
    }
    setIsDatePickerModalOpen(false);
  };

  const openDatePicker = (type: 'booking' | 'registration') => {
    setCurrentStatType(type);
    setIsDatePickerModalOpen(true);
  };

  const fetchDailyBookingStats = async (startDate: string, endDate: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/stats/bookings/daily?booking_start=${startDate}&booking_end=${endDate}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        },
        credentials: 'include',
        mode: 'cors'
      });
      if (response.ok) {
        const data = await response.json();
        setDailyBookingStats(data);
        setIsDailyBookingModalOpen(true);
      }
    } catch (error) {
      console.error('Ошибка при получении ежедневной статистики бронирований:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyRegistrationStats = async (date: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/stats/registrations/daily?event_reg_date_time=${date}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        },
        credentials: 'include',
        mode: 'cors'
      });
      if (response.ok) {
        const data = await response.json();
        setDailyRegistrationStats(data);
        setIsDailyRegistrationModalOpen(true);
      }
    } catch (error) {
      console.error('Ошибка при получении ежедневной статистики регистраций:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    const fetchData = async () => {};

    fetchData();
  }, []);

  const cards = [
    {
      label: "коворинги",
      emoji: "🏢",
      route: "/admin/coworking",
    },
    { label: "места", value: stats.seats, emoji: "💺", route: "/admin/seats" },
    {
      label: "бронирования",
      emoji: "📅",
      route: "/admin/bookings",
    },
    {
      label: "мероприятия",
      emoji: "🎉",
      route: "/admin/events",
    },
    {
      label: "регистрации на мероприятия",
      emoji: "📝",
      route: "/admin/registrations",
    },
    { label: "новости", value: stats.news, emoji: "📰", route: "/admin/news" },
    {
      label: "пользователи",
      emoji: "👥",
      route: "/admin/users",
    },
  ];

  return (
    <div className=" ">
      <h1 className="text-2xl font-bold flex mb-4 items-center text-white">
        Панель администратора
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.route}>
            <div className="bg-white rounded-[24px] shadow-lg p-6 flex flex-col items-center transition transform hover:scale-103 cursor-pointer">
              <span className="text-4xl mb-2">{card.emoji}</span>
              <span className="text-[14px] text-gray-500 capitalize ">
                {card.label}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white my-6 rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Статистика</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-2">
            <button
              onClick={fetchBookingStats}
              className="bg-[#303030] text-white text-[14px] leading-[17px] px-5 py-2 rounded-[24px] hover:bg-[#575757] transition w-full md:w-auto"
              disabled={loading}
            >
              Статистика бронирований
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={fetchRegistrationStats}
              className="bg-[#303030] text-white px-5 py-2 text-[14px] leading-[17px] rounded-[24px] hover:bg-[#575757] transition w-full md:w-auto"
              disabled={loading}
            >
              Статистика регистраций
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => openDatePicker('booking')}
              className="bg-[#303030] text-white text-[14px] leading-[17px] px-5 py-2 rounded-[24px] hover:bg-[#575757] transition w-full md:w-auto"
              disabled={loading}
            >
              Ежедневная статистика бронирований
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => openDatePicker('registration')}
              className="bg-[#303030] text-white px-5 py-2 text-[14px] leading-[17px] rounded-[24px] hover:bg-[#575757] transition w-full md:w-auto"
              disabled={loading}
            >
              Ежедневная статистика регистраций
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white my-6 rounded-xl shadow p-6">
        <p className="text-center">
          Выберите нужный раздел, нажав на карточку для управления данными.
        </p>
      </div>

      {/* Модальное окно для статистики бронирований */}
      <Modal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        title="Статистика бронирований"
      >
        <div className="px-6 py-4">
          {bookingStats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookingStats.map((stat, index) => (
                <div key={`booking-${stat.coworking_location}-${index}`} className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">Коворкинг {stat.coworking_location}</p>
                  <p className="text-gray-600">Количество бронирований: {stat.count_bookings}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Нет данных о бронированиях</p>
          )}
        </div>
      </Modal>

      {/* Модальное окно статистики регистраций */}
      <Modal 
        isOpen={isRegistrationModalOpen} 
        onClose={() => setIsRegistrationModalOpen(false)} 
        title="Статистика регистраций на мероприятия"
      >
        <div className="px-6 py-4">
          {registrationStats.length > 0 ? (
            <div className="grid grid-cols-1  ">
              {registrationStats.map((stat, index) => (
                <div 
                  key={`registration-${stat.event_name}-${index}`}
                  className="bg-gray-50 p-4 gap-4  flex rounded-lg"
                >
                  <h3 className="font-medium text-[16px] leading-[19px] text-gray-900 mb-2">{truncateText(stat.event_name, 25)}</h3>
                  <p className="text-gray-600 text-[16px] leading-[19px]">Кол-во регистраций: {stat.count_regs}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">Нет данных о регистрациях</p>
          )}
        </div>
      </Modal>

      {/* Модальное окно ежедневной статистики бронирований */}
      <Modal 
        isOpen={isDailyBookingModalOpen} 
        onClose={() => setIsDailyBookingModalOpen(false)} 
        title="Ежедневная статистика бронирований"
      >
        <div className="px-6 py-4">
          {dailyBookingStats.length > 0 ? (
            <div className="grid grid-cols-1  gap-4">
              {dailyBookingStats.map((stat, index) => (
                <div 
                  key={`daily-booking-${stat.day}-${index}`}
                  className="bg-gray-50 gap-4 p-4  flex rounded-lg"
                >
                  <h3 className="font-medium text-[16px] leading-[19px] text-gray-900 mb-2">{stat.day}</h3>
                  <p className="text-gray-600 text-[16px] leading-[19px]">Кол-во бронирований: {stat.count}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">Нет данных о бронированиях за выбранный период</p>
          )}
        </div>
      </Modal>

      {/* Модальное окно ежедневной статистики регистраций */}
      <Modal 
        isOpen={isDailyRegistrationModalOpen} 
        onClose={() => setIsDailyRegistrationModalOpen(false)} 
        title="Ежедневная статистика регистраций"
      >
        <div className="px-6 py-4">
          {dailyRegistrationStats.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {dailyRegistrationStats.map((stat, index) => (
                <div 
                  key={`daily-registration-${stat.day}-${index}`}
                  className="bg-gray-50 gap-4 p-4  flex rounded-lg"
                >
                  <h3 className="font-medium text-[16px] leading-[19px] text-gray-900 mb-2">{stat.day}</h3>
                  <p className="text-gray-600 text-[16px] leading-[19px]">Кол-во регистраций: {stat.count}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">Нет данных о регистрациях за выбранный день</p>
          )}
        </div>
      </Modal>

      {/* Модальное окно выбора даты */}
      <Modal 
        isOpen={isDatePickerModalOpen} 
        onClose={() => setIsDatePickerModalOpen(false)} 
        title={currentStatType === 'booking' ? "Выберите период" : "Выберите дату"}
      >
        <div className="p-6">
          {currentStatType === 'booking' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата начала
                </label>
                <input
                  type="date"
                  value={selectedStartDate}
                  onChange={(e) => setSelectedStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата окончания
                </label>
                <input
                  type="date"
                  value={selectedEndDate}
                  onChange={(e) => setSelectedEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Выберите дату
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleDateSubmit}
              className="bg-[#303030] text-white px-5 py-2 rounded-[24px] hover:bg-[#575757] transition"
              disabled={currentStatType === 'booking' ? (!selectedStartDate || !selectedEndDate) : !selectedDate}
            >
              Показать статистику
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
