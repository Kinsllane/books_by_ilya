// src/pages/UserRegisterPage.tsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus'; // Импортируем наш хук аутентификации
import { findUserByUsername, registerNewUser } from '../data/appData'; // Импортируем функции для работы с данными

/**
 * @component UserRegisterPage
 * @description Страница для регистрации новых пользователей в системе.
 */
const UserRegisterPage: React.FC = () => {
    const [username, setUsername] = useState(''); // Состояние для имени пользователя
    const [password, setPassword] = useState(''); // Состояние для пароля
    const [confirmPassword, setConfirmPassword] = useState(''); // Состояние для подтверждения пароля
    const [errorMessage, setErrorMessage] = useState(''); // Состояние для сообщений об ошибках
    
    const { setActiveUser } = useAuthStatus(); // Получаем функцию setActiveUser из хука
    const navigate = useNavigate(); // Хук для навигации

    /**
     * @function handleRegisterSubmit
     * @description Обработчик отправки формы регистрации.
     * @param {React.FormEvent} e - Событие формы.
     */
    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Предотвращаем стандартное поведение формы
        setErrorMessage(''); // Сбрасываем предыдущие ошибки

        // Проверка на совпадение паролей
        if (password !== confirmPassword) {
            setErrorMessage('Пароли не совпадают. Пожалуйста, проверьте.');
            return;
        }

        // Проверка длины пароля
        if (password.length < 6) {
            setErrorMessage('Пароль должен быть не менее 6 символов.');
            return;
        }

        // Проверка на уникальность имени пользователя
        if (findUserByUsername(username)) {
            setErrorMessage('Пользователь с таким именем уже существует. Пожалуйста, выберите другое имя.');
            return;
        }

        // Если все проверки пройдены, регистрируем нового пользователя
        const newUser = registerNewUser(username, password);
        
        // Автоматически входим в систему после регистрации
        const { password: _, ...userToStore } = newUser; // Удаляем пароль перед сохранением в контекст
        setActiveUser(userToStore);

        alert('Регистрация прошла успешно! Вы вошли в систему.'); // Уведомление об успехе
        navigate('/'); // Перенаправляем на главную страницу
    };

    return (
        <div className="form-container"> {/* Контейнер для формы */}
            <h2 className="form-title">Регистрация нового аккаунта</h2> {/* Заголовок формы */}
            <form onSubmit={handleRegisterSubmit} className="auth-form"> {/* Форма регистрации */}
                {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Отображение ошибки, если есть */}
                
                <div className="form-group">
                    <label htmlFor="reg-username">Имя пользователя:</label>
                    <input 
                        type="text" 
                        id="reg-username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                        aria-label="Имя пользователя"
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="reg-password">Пароль:</label>
                    <input 
                        type="password" 
                        id="reg-password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        aria-label="Пароль"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="confirm-password">Подтвердите пароль:</label>
                    <input 
                        type="password" 
                        id="confirm-password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                        aria-label="Подтвердите пароль"
                    />
                </div>
                
                <button type="submit" className="submit-button">Зарегистрироваться</button>
            </form>
            
            <p className="form-footer-text">
                Уже есть аккаунт? <Link to="/login" className="link-text">Войти</Link>
            </p>
        </div>
    );
};

export default UserRegisterPage;
