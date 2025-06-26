// src/components/auth/AuthWrapper.tsx

import React from 'react';
import { Navigate } from 'react-router-dom'; // Outlet больше не нужен здесь
import { useAuthStatus } from '../../hooks/useAuthStatus'; // Импортируем наш кастомный хук аутентификации

/**
 * @interface AuthWrapperProps
 * @description Свойства для компонента AuthWrapper.
 * @property {React.ReactNode} children - Дочерние элементы, которые будут рендериться, если пользователь авторизован.
 */
interface AuthWrapperProps {
  children: React.ReactNode;
}

/**
 * @component AuthWrapper
 * @description Компонент-обертка для защиты маршрутов.
 * Перенаправляет неавторизованных пользователей на страницу входа.
 * Если пользователь авторизован, рендерит дочерние маршруты.
 */
const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => { // <-- Изменено здесь
  const { activeUser } = useAuthStatus(); // Получаем текущего пользователя из контекста

  // Если пользователя нет (не авторизован), перенаправляем на страницу входа
  // `replace` предотвращает добавление текущего пути в историю браузера
  if (!activeUser) {
    return <Navigate to="/login" replace />;
  }

  // Если пользователь авторизован, рендерим дочерние элементы
  return <>{children}</>; // <-- Изменено здесь
};

export default AuthWrapper;
