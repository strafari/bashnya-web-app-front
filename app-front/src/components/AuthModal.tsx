import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import useStore from "@/store/useStore";
const API = process.env.NEXT_PUBLIC_API_URL;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    user_name: "",
  });
  const [error, setError] = useState<string>("");
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const router = useRouter();
  const { setToken } = useStore();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsTermsAccepted(e.target.checked);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = isLogin ? `${API}/auth/jwt/login` : `${API}/auth/register`;
    const body = isLogin
      ? new URLSearchParams({
          username: formData.email,
          password: formData.password,
          grant_type: "password",
        }).toString()
      : JSON.stringify({
          email: formData.email,
          password: formData.password,
          user_name: formData.user_name,
        });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": isLogin ? "application/x-www-form-urlencoded" : "application/json",
        },
        credentials: "include",
        body,
      });

      if (response.ok || response.status === 204) {
        // После успешной авторизации проверяем пользователя
        const checkResponse = await fetch(`${API}/htoya/`, {
          credentials: "include",
        });
        if (checkResponse.ok) {
          const userData = await checkResponse.json();
          setToken("AUTHENTICATED"); // Устанавливаем токен в Zustand
        }
        onClose();
        router.refresh();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || (isLogin ? "Ошибка входа" : "Ошибка регистрации"));
      }
    } catch (error) {
      setError("Ошибка сети");
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="bg-[#1B1B1B] px-10 py-12 rounded-[40px] shadow-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center gap-4">
          <div></div>
          <button onClick={onClose} className="h-12 bg-[#1B1B1B] rounded-full text-white">
            Готово
          </button>
        </div>
        <h2 className="text-white text-center font-[500] mb-4">
          {isLogin ? "Авторизация" : "Регистрация"}
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-white">Почта</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-white">Имя</label>
              <input
                type="text"
                name="user_name"
                value={formData.user_name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-white">Пароль</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          {!isLogin && (
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="terms"
                checked={isTermsAccepted}
                onChange={handleCheckboxChange}
                className="mr-2"
                required
              />
              <label htmlFor="terms" className="text-[10px] text-white">
                Я ознакомлен с политикой обработки персональных данных
              </label>
            </div>
          )}
          <button
            type="submit"
            className="h-10 mx-auto flex bg-[#FF4392] text-white py-2 px-4 rounded-md"
          >
            {isLogin ? "Войти" : "Регистрация"}
          </button>
        </form>
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 mx-auto flex bg-white text-black py-2 px-4 rounded-md"
        >
          {isLogin ? "Нет аккаунта? Зарегистрируйтесь" : "Уже есть аккаунт? Авторизуйтесь"}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default AuthModal;