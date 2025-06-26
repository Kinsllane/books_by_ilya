// src/components/layout/AppHeader.tsx

import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStatus } from '../../hooks/useAuthStatus';

/**
 * @component AppHeader
 * @description Компонент шапки приложения, содержащий логотип, навигацию и информацию о пользователе.
 */
const AppHeader: React.FC = () => {
    const { activeUser, signOut } = useAuthStatus();
    const navigate = useNavigate();

    /**
     * @function handleLogout
     * @description Обработчик выхода пользователя из системы.
     */
    const handleLogout = () => {
        signOut();
        navigate('/');
    };

    return (
        <header className="app-header">
            <Link to="/" className="app-logo">
                <img src="/logo.png" alt="BookSwap Logo" />
                <span>BookTradeIlya</span>
            </Link>
            <nav className="main-nav">
                <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Главная</NavLink>
                
                {activeUser ? (
                    <>
                        {activeUser.role === 'admin' && ( // <-- ПОКАЗЫВАЕМ ССЫЛКУ ТОЛЬКО АДМИНАМ
                            <NavLink to="/admin-dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Админ-панель</NavLink>
                        )}
                        <NavLink to="/my-profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Мой профиль</NavLink>
                        <NavLink to="/add-book" className="nav-link add-book-btn">Добавить книгу</NavLink>
                        <div className="user-controls">
                           <span className="user-info">
                                Привет, {activeUser.name}! (Баланс: {activeUser.balance}₽)
                            </span>
                           <button onClick={handleLogout} className="logout-btn">Выйти</button>
                        </div>
                    </>
                ) : (
                     <div className="auth-links">
                        <NavLink to="/login" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Войти</NavLink>
                        <NavLink to="/register" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Регистрация</NavLink>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default AppHeader;
