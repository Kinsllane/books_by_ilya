// src/pages/UserLoginPage.tsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus'; // Импортируем наш хук аутентификации

/**
 * @component UserLoginPage
 * @description Страница для входа пользователей в систему.
 */
const UserLoginPage: React.FC = () => {
    const [username, setUsername] = useState(''); // Состояние для имени пользователя
    const [password, setPassword] = useState(''); // Состояние для пароля
    const [errorMessage, setErrorMessage] = useState(''); // Состояние для сообщений об ошибках
    
    const { signIn } = useAuthStatus(); // Получаем функцию signIn из хука
    const navigate = useNavigate(); // Хук для навигации

    /**
     * @function handleLoginSubmit
     * @description Обработчик отправки формы входа.
     * @param {React.FormEvent} e - Событие формы.
     */
    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Предотвращаем стандартное поведение формы
        setErrorMessage(''); // Сбрасываем предыдущие ошибки

        const user = signIn(username, password); // Пытаемся войти
        if (user) {
            navigate('/'); // При успешном входе перенаправляем на главную страницу
        } else {
            setErrorMessage('Неверное имя пользователя или пароль. Пожалуйста, попробуйте снова.'); // Устанавливаем сообщение об ошибке
        }
    };

    return (
        <div className="form-container"> {/* Контейнер для формы */}
            <h2 className="form-title">Вход в аккаунт</h2> {/* Заголовок формы */}
            <form onSubmit={handleLoginSubmit} className="auth-form"> {/* Форма входа */}
                {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Отображение ошибки, если есть */}
                
                <div className="form-group">
                    <label htmlFor="username">Имя пользователя:</label>
                    <input 
                        type="text" 
                        id="username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                        aria-label="Имя пользователя"
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="password">Пароль:</label>
                    <input 
                        type="password" 
                        id="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        aria-label="Пароль"
                    />
                </div>
                
                <button type="submit" className="submit-button">Войти</button>
            </form>
            
            <p className="form-footer-text">
                Ещё нет аккаунта? <Link to="/register" className="link-text">Зарегистрироваться</Link>
            </p>
        </div>
    );
};

export default UserLoginPage;
