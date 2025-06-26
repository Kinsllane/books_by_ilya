// src/pages/BookDetailsPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus'; // Импортируем наш хук аутентификации
import {
    retrieveBookById, // Правильное название функции
    addReviewToBook, // Правильное название функции
    addQuoteToBook, // Правильное название функции
    purchaseBook,
    availableBooks // Импортируем для принудительного обновления
} from '../data/appData'; // Импортируем функции для работы с данными
import type { BookReview, BookQuote } from '../types/appTypes'; // Импортируем типы

// Импортируем компоненты форм для рецензий и цитат
import ReviewForm from '../components/forms/ReviewForm';
import QuoteForm from '../components/forms/QuoteForm';

/**
 * @component BookDetailsPage
 * @description Страница, отображающая подробную информацию о книге, рецензии, цитаты,
 * а также кнопки для покупки, обмена и добавления контента.
 */
const BookDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Получаем ID книги из URL
    const navigate = useNavigate();
    const { activeUser, setActiveUser } = useAuthStatus(); // Получаем текущего пользователя и функцию его обновления

    // Используем состояние для книги, чтобы принудительно перерендеривать компонент
    // при добавлении рецензий/цитат или изменении владельца/статуса книги.
    const [book, setBook] = useState(() => retrieveBookById(id)); // Исправлено: retrieveBookById
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showQuoteForm, setShowQuoteForm] = useState(false);

    // Эффект для обновления книги, если данные в appData изменились (например, после покупки)
    useEffect(() => {
        setBook(retrieveBookById(id)); // Исправлено: retrieveBookById
    }, [id, availableBooks]); // Зависимость от availableBooks для реакции на изменения в глобальном массиве

    // Обработчик добавления рецензии
    const handleAddReview = (text: string) => {
        if (activeUser && book) {
            addReviewToBook(book.id, text, activeUser); // Исправлено: addReviewToBook
            setBook(retrieveBookById(book.id)); // Обновляем состояние книги, перечитывая из appData
            setShowReviewForm(false); // Скрываем форму
        }
    };

    // Обработчик добавления цитаты
    const handleAddQuote = (text: string) => {
        if (activeUser && book) {
            addQuoteToBook(book.id, text, activeUser); // Исправлено: addQuoteToBook
            setBook(retrieveBookById(book.id)); // Обновляем состояние книги, перечитывая из appData
            setShowQuoteForm(false); // Скрываем форму
        }
    };

    // Обработчик покупки книги
    const handleBuyBook = () => {
        if (!activeUser) {
            alert('Пожалуйста, войдите в систему, чтобы совершить покупку.');
            navigate('/login');
            return;
        }
        if (!book || !book.isForSale || !book.priceValue) {
            alert('Эта книга недоступна для покупки.');
            return;
        }

        const result = purchaseBook(book.id, activeUser.id);
        if (result.success) {
            alert(result.message);
            setBook(result.book); // Исправлено: result.book вместо result.updatedBook
            if (result.buyer) { // Исправлено: result.buyer вместо result.updatedBuyer
                // Обновляем баланс текущего пользователя в контексте
                const { password, ...userToStore } = result.buyer;
                setActiveUser(userToStore);
            }
        } else {
            alert(result.message);
        }
    };

    // Обработчик предложения обмена
    const handleProposeTrade = () => {
        if (!activeUser) {
            alert('Пожалуйста, войдите в систему, чтобы предложить обмен.');
            navigate('/login');
            return;
        }
        if (book) {
            navigate(`/propose-trade/${book.id}`); // Перенаправляем на страницу предложения обмена
        }
    };

    // Если книга не найдена
    if (!book) {
        return <div className="page-message">Книга не найдена.</div>;
    }

    // Проверяем, является ли текущий пользователь владельцем книги
    const isOwner = activeUser?.id === book.currentOwner.id;
    // Определяем путь к обложке
    const coverPath = book.coverImageUrl.startsWith('http') ? book.coverImageUrl : `/${book.coverImageUrl}`;

    return (
        <div className="book-detail-page">
            <div className="book-main-info">
                <div className="book-cover-area">
                    <img src={coverPath} alt={`Обложка ${book.title}`} className="book-cover-large" />
                </div>
                <div className="book-text-info">
                    <h1 className="book-title">{book.title}</h1>
                    <h2 className="book-author">{book.author}</h2>
                    <p className="book-owner"><strong>Владелец:</strong> {book.currentOwner.name}</p>
                    {book.isForSale && book.priceValue && (
                        <p className="book-price"><strong>Цена:</strong> {book.priceValue}₽</p>
                    )}
                    <p className="book-description">{book.description}</p>

                    <div className="book-actions">
                        {book.isForSale && !isOwner && (
                            <button onClick={handleBuyBook} className="action-button buy-button">Купить</button>
                        )}
                        {book.isForTrade && !isOwner && (
                            <button onClick={handleProposeTrade} className="action-button trade-button">Предложить обмен</button>
                        )}
                        {isOwner && (
                            <p className="owner-message"><em>Это ваша книга.</em></p>
                        )}
                    </div>
                </div>
            </div>

            <div className="book-additional-sections">
                <section className="reviews-section">
                    <h3 className="section-title">Рецензии</h3>
                    {book.reviews.length > 0 ? (
                        book.reviews.map((review: BookReview) => ( // Явный тип
                            <div key={review.id} className="content-card review-card">
                                <p className="content-text">"{review.text}"</p>
                                <div className="content-author">- {review.reviewer.name}</div>
                            </div>
                        ))
                    ) : (
                        <p className="no-content-message">Рецензий пока нет.</p>
                    )}
                    {activeUser && (
                        !showReviewForm ? (
                            <button onClick={() => setShowReviewForm(true)} className="add-content-button">Добавить рецензию</button>
                        ) : (
                            <ReviewForm onSubmit={handleAddReview} onCancel={() => setShowReviewForm(false)} />
                        )
                    )}
                </section>

                <section className="quotes-section">
                    <h3 className="section-title">Цитаты</h3>
                    {book.quotes.length > 0 ? (
                        book.quotes.map((quote: BookQuote) => ( // Явный тип
                            <div key={quote.id} className="content-card quote-card">
                                <p className="content-text">"{quote.text}"</p>
                                <div className="content-author">- {quote.quoter.name}</div>
                            </div>
                        ))
                    ) : (
                        <p className="no-content-message">Цитат пока нет.</p>
                    )}
                    {activeUser && (
                        !showQuoteForm ? (
                            <button onClick={() => setShowQuoteForm(true)} className="add-content-button">Добавить цитату</button>
                        ) : (
                            <QuoteForm onSubmit={handleAddQuote} onCancel={() => setShowQuoteForm(false)} />
                        )
                    )}
                </section>
            </div>
        </div>
    );
};

export default BookDetailsPage;
