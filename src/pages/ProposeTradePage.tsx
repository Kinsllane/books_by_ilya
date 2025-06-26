// src/pages/ProposeTradePage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus'; // Импортируем наш хук аутентификации
import {
    retrieveBookById, // Правильное название функции
    createNewTradeProposal, // Правильное название функции
    availableBooks // Для получения всех книг и фильтрации
} from '../data/appData'; // Импортируем функции для работы с данными
import type { BookEntry } from '../types/appTypes'; // Импортируем тип BookEntry

/**
 * @component ProposeTradePage
 * @description Страница для создания предложения обмена книгами.
 * Пользователь выбирает свою книгу для обмена на целевую книгу.
 */
const ProposeTradePage: React.FC = () => {
    const { bookId: targetBookId } = useParams<{ bookId: string }>(); // ID целевой книги из URL
    const navigate = useNavigate();
    const { activeUser } = useAuthStatus(); // Текущий авторизованный пользователь

    const [targetBook, setTargetBook] = useState<BookEntry | null>(null); // Целевая книга
    const [myTradableBooks, setMyTradableBooks] = useState<BookEntry[]>([]); // Книги пользователя, доступные для обмена
    const [selectedMyBookId, setSelectedMyBookId] = useState<string>(''); // Выбранная книга пользователя для обмена
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Функция для получения книг пользователя по владельцу
    const getBooksByOwnerId = (ownerId: string): BookEntry[] => {
        return availableBooks.filter(book => book.currentOwner.id === ownerId);
    };

    useEffect(() => {
        // Загружаем целевую книгу
        const foundTargetBook = retrieveBookById(targetBookId); // Исправлено: retrieveBookById
        if (foundTargetBook) {
            setTargetBook(foundTargetBook);
        } else {
            // Если целевая книга не найдена, перенаправляем или показываем ошибку
            setErrorMessage('Целевая книга для обмена не найдена.');
            return;
        }

        // Загружаем книги текущего пользователя, доступные для обмена
        if (activeUser) {
            const userBooks = getBooksByOwnerId(activeUser.id).filter((book: BookEntry) => book.isForTrade); // Явный тип
            setMyTradableBooks(userBooks);
            // Автоматически выбираем первую книгу, если они есть
            if (userBooks.length > 0) {
                setSelectedMyBookId(userBooks[0].id);
            }
        }
    }, [targetBookId, activeUser, availableBooks]); // Зависимости: ID целевой книги, текущий пользователь, availableBooks

    /**
     * @function handleSubmit
     * @description Обработчик отправки формы предложения обмена.
     * @param {React.FormEvent} e - Событие формы.
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (!activeUser) {
            setErrorMessage('Вы не авторизованы.');
            return;
        }

        if (!targetBookId || !selectedMyBookId) {
            setErrorMessage('Пожалуйста, выберите свою книгу для обмена.');
            return;
        }

        // Проверяем, что пользователь не пытается обменять книгу сам с собой
        if (targetBook?.currentOwner.id === activeUser.id) {
            setErrorMessage('Вы не можете обменять книгу сами с собой.');
            return;
        }

        // Создаем предложение обмена
        const result = createNewTradeProposal(activeUser.id, selectedMyBookId, targetBookId); // Исправлено: createNewTradeProposal

        if (result.success) {
            setSuccessMessage(result.message + ' Вы будете перенаправлены на главную страницу.');
            // Перенаправляем на главную страницу через 3 секунды
            setTimeout(() => navigate('/'), 3000);
        } else {
            setErrorMessage(result.message);
        }
    };

    // Если целевая книга не найдена или пользователь не авторизован
    if (!targetBook) {
        return <div className="page-message">Загрузка или книга не найдена...</div>;
    }

    // Если у пользователя нет книг для обмена
    if (myTradableBooks.length === 0) {
        return (
            <div className="form-container">
                <h2 className="form-title">Предложение обмена</h2>
                <p className="info-message">У вас нет книг, доступных для обмена.</p>
                <p className="info-message">Вы можете <Link to="/add-book" className="link-text">добавить книгу</Link> и пометить ее как доступную для обмена.</p>
            </div>
        );
    }

    return (
        <div className="form-container">
            <h2 className="form-title">Предложение обмена</h2>
            <p className="info-message">Вы хотите обменять одну из своих книг на <strong>"{targetBook.title}"</strong> автора {targetBook.author}.</p>

            <form onSubmit={handleSubmit} className="trade-form">
                <div className="form-group">
                    <label htmlFor="myBook">Выберите вашу книгу для обмена:</label>
                    <select
                        id="myBook"
                        value={selectedMyBookId}
                        onChange={e => setSelectedMyBookId(e.target.value)}
                        required
                        aria-label="Моя книга для обмена"
                    >
                        {myTradableBooks.map((book: BookEntry) => ( // Явный тип
                            <option key={book.id} value={book.id}>
                                {book.title}
                            </option>
                        ))}
                    </select>
                </div>

                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}

                <button type="submit" className="submit-button" disabled={!!successMessage}>Отправить предложение</button>
            </form>
        </div>
    );
};

export default ProposeTradePage;
