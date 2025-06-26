// src/App.tsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppHeader from './components/layout/AppHeader'; // Обновленный импорт для Header
import AppFooter from './components/layout/AppFooter'; // Добавляем Footer (будет создан позже)
import HomePage from './pages/HomePage';
import BookDetailsPage from './pages/BookDetailsPage';
import UserLoginPage from './pages/UserLoginPage'; // Обновленный импорт для LoginPage
import UserRegisterPage from './pages/UserRegisterPage'; // Обновленный импорт для RegisterPage
import AddBookFormPage from './pages/AddBookFormPage'; // Обновленный импорт для AddBookPage
import ProposeTradePage from './pages/ProposeTradePage'; // Новый импорт для TradePage
import UserProfilePage from './pages/UserProfilePage'; // Новый импорт для MyProfilePage
import AuthWrapper from './components/auth/AuthWrapper'; // Исправлено: AuthWrapper вместо ProtectedRoute

/**
 * @component App
 * @description Главный компонент приложения, отвечающий за маршрутизацию
 * и общую структуру страниц.
 */
const App: React.FC = () => {
    return (
        <div className="app-container"> {/* Основной контейнер приложения */}
            <AppHeader /> {/* Компонент шапки */}
            <main className="app-main-content"> {/* Основное содержимое страниц */}
                <Routes>
                    {/* Публичные маршруты */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/book/:id" element={<BookDetailsPage />} />
                    <Route path="/login" element={<UserLoginPage />} />
                    <Route path="/register" element={<UserRegisterPage />} />

                    {/* Защищенные маршруты (требуют аутентификации) */}
                    <Route
                        path="/add-book"
                        element={
                            <AuthWrapper> {/* Исправлено: AuthWrapper */}
                                <AddBookFormPage />
                            </AuthWrapper>
                        }
                    />
                    <Route
                        path="/propose-trade/:bookId"
                        element={
                            <AuthWrapper> {/* Исправлено: AuthWrapper */}
                                <ProposeTradePage />
                            </AuthWrapper>
                        }
                    />
                    <Route
                        path="/my-profile"
                        element={
                            <AuthWrapper> {/* Исправлено: AuthWrapper */}
                                <UserProfilePage />
                            </AuthWrapper>
                        }
                    />

                    {/* Маршрут для необнаруженных страниц (404) */}
                    <Route path="*" element={<h1 className="page-title">404: Страница не найдена</h1>} />
                </Routes>
            </main>
            <AppFooter /> {/* Компонент подвала */}
        </div>
    );
};

export default App;
