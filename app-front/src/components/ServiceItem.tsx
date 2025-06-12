"use client";
const API = process.env.NEXT_PUBLIC_API_URL;

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PiOfficeChair } from "react-icons/pi";
import useStore from "../store/useStore";
import ServiceModal from "./ServiceModal";
import AuthModal from "./AuthModal";
import Image from "next/image";

interface CoworkingSpace {
  coworking_id: number;
  coworking_location: string;
  coworking_description: string;
}

interface Seat {
  seat_id: number;
  seat_coworking_id: number;
  seat_index: number;
  seat_status: number;
}

interface Booking {
  booking_id: number;
  booking_user_id: number;
  booking_seat_id: number;
  booking_start: string;
  booking_end: string;
  booking_email: string;
}

interface ServiceItemProps {
  service?: any;
  description?: string;
  priceList?: any[];
  departmentName: string;
}

const variants = {
  open: { opacity: 1, height: "auto", marginTop: "1rem", marginBottom: "1rem" },
  closed: { opacity: 0, height: 0, marginTop: 0, marginBottom: 0 },
};

export default function ServiceItem({ departmentName }: ServiceItemProps) {
  const token = useStore((state) => state.token); 
  const [isExpanded, setIsExpanded] = useState<{ [key: number]: boolean }>({});
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [pendingSeat, setPendingSeat] = useState<Seat | null>(null); 
  const [coworkingSpaces, setCoworkingSpaces] = useState<CoworkingSpace[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingData, setBookingData] = useState({
    booking_seat_id: 0,
    booking_start: "",
    booking_end: "",
    booking_email: "",
    agreement: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      const [coworkingRes, seatsRes, bookingsRes] = await Promise.all([
        fetch(`${API}/coworking/`),
        fetch(`${API}/seats/`),
        fetch(`${API}/bookings/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        }),
      ]);
      setCoworkingSpaces(await coworkingRes.json());
      setSeats(await seatsRes.json());
      const bookingsData = await bookingsRes.json();
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);

      const initialExpanded = coworkingSpaces.reduce((acc: any, space: any) => {
        acc[space.coworking_id] = false;
        return acc;
      }, {});
      setIsExpanded(initialExpanded);
    };
    fetchData();

    const interval = setInterval(() => {
      fetch(`${API}/seats/`).then((res) => res.json()).then(setSeats);
      fetch(`${API}/bookings/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      }).then((res) => res.json()).then((data) => setBookings(Array.isArray(data) ? data : []));
    }, 5000);

    return () => clearInterval(interval);
  }, [token]);

  // Открытие формы бронирования после авторизации
  useEffect(() => {
    if (token && pendingSeat) {
      setSelectedSeat(pendingSeat);
      setIsBookingModalOpen(true);
      setPendingSeat(null);
    }
  }, [token, pendingSeat]);

  const getEffectiveStatus = (seat: Seat) =>
    seat.seat_status === 0 && bookings.some((b) => b.booking_seat_id === seat.seat_id) ? 1 : seat.seat_status;

  const toggleExpanded = (coworkingId: number) => {
    setIsExpanded((prev) => ({ ...prev, [coworkingId]: !prev[coworkingId] }));
  };

  const handleBookingClick = (seat: Seat) => {
    if (!token) {
      setPendingSeat(seat); // Запоминаем место
      setIsAuthModalOpen(true);
      return;
    }
    const effectiveStatus = getEffectiveStatus(seat);
    if (effectiveStatus === 0) {
      setSelectedSeat(seat);
      setIsBookingModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsBookingModalOpen(false);
    setIsAuthModalOpen(false);
  };

  const handleAuthSuccess = () => {
    closeModal();
  };

  const handleBookingSubmit = async () => {
    if (!bookingData.agreement) {
      alert("Вы должны согласиться с условиями соглашения.");
      return;
    }
    const response = await fetch(`${API}/bookings/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({ ...bookingData, booking_seat_id: selectedSeat?.seat_id }),
    });
    if (response.ok) {
      alert("Место успешно забронировано!");
      closeModal();
      const [seatsRes, bookingsRes] = await Promise.all([
        fetch(`${API}/seats/`),
        fetch(`${API}/bookings/`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }),
      ]);
      setSeats(await seatsRes.json());
      setBookings(await bookingsRes.json());
    } else {
      alert("Ошибка при бронировании места.");
    }
  };

  const getSeatStatus = (status: number, seat: Seat) => {
    const hasActiveBooking = bookings.some(
      (b) => b.booking_seat_id === seat.seat_id && new Date(b.booking_end) > new Date()
    );
    if (hasActiveBooking) return "Забронировано";
    switch (status) {
      case 0: return "Забронировать";
      case 1: return "Занято";
      case 2: return "Технические неполадки";
      case 3: return "vip";
      default: return "Неизвестно";
    }
  };

  const getStatusColor = (status: number, seat: Seat) => {
    const hasActiveBooking = bookings.some(
      (b) => b.booking_seat_id === seat.seat_id && new Date(b.booking_end) > new Date()
    );
    if (hasActiveBooking) return "text-[#FE8DBD]";
    switch (status) {
      case 0: return "text-[#7ACB6E]";
      case 1: return "text-[#F07D7D]";
      case 2: return "text-gray-500";
      case 3: return "text-pink-500";
      default: return "text-gray-500";
    }
  };

  const getStatusBgColor = (status: number, seat: Seat) => {
    const hasActiveBooking = bookings.some(
      (b) => b.booking_seat_id === seat.seat_id && new Date(b.booking_end) > new Date()
    );
    if (hasActiveBooking) return "bg-[#FE8DBD] text-white";
    switch (status) {
      case 0: return "bg-[#7ACB6E] text-white";
      case 1: return "bg-[#F07D7D] text-white";
      case 2: return "bg-gray-500 text-white";
      case 3: return "bg-pink-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getCoworkingTitle = (coworkingId: number) => {
    switch (coworkingId) {
      case 1: return "4 этаж — Гибкий коворкинг для встреч и презентаций";
      case 2: return "4 этаж — Зал совещаний";
      default: return coworkingSpaces.find((s) => s.coworking_id === coworkingId)?.coworking_location || "";
    }
  };

  const getCoworkingIcon = (coworkingId: number) => {
    switch (coworkingId) {
      case 1: return "/icons/place.png";
      case 2: return "/icons/place2.png";
      default: return "/icons/place.png";
    }
  };

  return (
    <div>
      {coworkingSpaces.map((space) => (
        <motion.div
          key={space.coworking_id}
          className="bg-white md:p-6 p-2 rounded-lg shadow-sm mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div onClick={() => toggleExpanded(space.coworking_id)} className="cursor-pointer flex items-center">
            <div className="flex items-center mr-4">
              <Image src={getCoworkingIcon(space.coworking_id)} alt="Place" width={40} height={320} className="mr-6" />
              <h3 className={`md:text-[24px] text-[12px] font-medium ${isExpanded[space.coworking_id] ? "" : "text-black"}`}>
                {getCoworkingTitle(space.coworking_id)}
              </h3>
            </div>
            <motion.div className={`w-10 h-10 flex items-center justify-center rounded-full md:mr-5 mr-3 ${isExpanded[space.coworking_id] ? "bg-[#000]" : "bg-[#D9D9D9]"}`}>
              <motion.svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: isExpanded[space.coworking_id] ? 0 : -90 }}
                transition={{ duration: 0.4 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </motion.svg>
            </motion.div>
          </div>

          <motion.div
            initial="closed"
            animate={isExpanded[space.coworking_id] ? "open" : "closed"}
            variants={variants}
            style={{ overflow: "hidden" }}
          >
            <div className="mt-4 w-full mx-auto">
              {space.coworking_id === 2 && (
                <div className="text-[16px] text-black mb-6">
                  <div className="mb-2">— 6 мест</div>
                  <div>— телевизор 55 дюймов</div>
                </div>
              )}
              <div className={`grid grid-cols-1 ${space.coworking_id === 2 ? 'md:grid-cols-1 max-w-md mx-auto' : 'xl:grid-cols-3'} gap-4 mb-6`}>
                {seats.filter((seat) => seat.seat_coworking_id === space.coworking_id).map((seat) => {
                  const effectiveStatus = getEffectiveStatus(seat);
                  return (
                    <div key={seat.seat_id} className="relative cursor-pointer" onClick={() => handleBookingClick(seat)}>
                      <div className="flex items-center mb-2 gap-4">
                        <PiOfficeChair className={`${getStatusColor(effectiveStatus, seat)} w-10 h-10`} />
                        <div className="bg-black rounded-full px-4 py-1">
                          <span className="text-white text-xs">№{seat.seat_index}</span>
                        </div>
                        <div className={`${getStatusBgColor(effectiveStatus, seat)} px-4 py-2 rounded-[16px]`}>
                          {getSeatStatus(effectiveStatus, seat) === "Забронировать" ? "Забронировать" : getSeatStatus(effectiveStatus, seat)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ))}

      {isBookingModalOpen && selectedSeat && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-[#D9D9D9] rounded-3xl overflow-hidden max-w-[600px] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-3 text-xs flex justify-between items-center">
              <div className="text-[#FF4392]">Место №{selectedSeat.seat_index}</div>
              <button onClick={closeModal} className="text-gray-500">✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleBookingSubmit(); }} className="px-3">
              <div className="bg-white p-6 rounded-[20px]">
                <h2 className="text-[12px] font-[700] mb-2">Персональные данные</h2>
                <p className="text-[10px] leading-[13px] text-gray-500 mb-2">
                  На указанный e-mail пришлем подтверждение бронирования
                </p>
                <div className="space-y-2">
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded-full p-3 text-[10px]"
                    onChange={(e) => setBookingData({ ...bookingData, booking_start: e.target.value })}
                    required
                  />
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded-full p-3 text-[10px]"
                    onChange={(e) => setBookingData({ ...bookingData, booking_end: e.target.value })}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Электронная почта"
                    className="w-full border border-gray-300 rounded-full p-3 text-[10px]"
                    onChange={(e) => setBookingData({ ...bookingData, booking_email: e.target.value })}
                    required
                  />
                  <div className="flex items-start mt-4">
                    <input
                      type="checkbox"
                      id="agreement"
                      checked={bookingData.agreement}
                      onChange={(e) => setBookingData({ ...bookingData, agreement: e.target.checked })}
                      className="mt-1"
                      required
                    />
                    <label htmlFor="agreement" className="ml-2 md:text-[10px] text-[8px] leading-[11px] md:leading-[13px] text-gray-500">
                      Ознакомлен и согласился с <span className="text-pink-500">политикой обработки персональных данных</span> и даю разрешение на обработку персональных данных
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-4 mb-6">
                <button type="submit" className="w-[200px] bg-[#fff] text-black font-[500] rounded-[16px] py-3 text-[10px] h-10">
                  Забронировать место
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {isAuthModalOpen && (
        <AuthModal isOpen={isAuthModalOpen} onClose={handleAuthSuccess} />
      )}
    </div>
  );
}