// src/pages/BookDetailsPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus';
import {
    retrieveBookById,
    addReviewToBook, // Изменено с addBookReview
    addQuoteToBook,   // Изменено с addBookQuote
    purchaseBook,
    availableBooks
} from '../data/appData';

import ReviewForm from '../components/forms/ReviewForm';
import QuoteForm from '../components/forms/QuoteForm';

const BookDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { activeUser, setActiveUser } = useAuthStatus();

    const [book, setBook] = useState(() => retrieveBookById(id));
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showQuoteForm, setShowQuoteForm] = useState(false);

    useEffect(() => {
        setBook(retrieveBookById(id));
    }, [id, availableBooks]);

    const handleAddReview = (text: string) => {
        if (activeUser && book) {
            // Обновляем книгу в appData и получаем обновленный объект
            addReviewToBook(book.id, text, activeUser);
            // Принудительно обновляем состояние книги, чтобы UI обновился
            setBook(retrieveBookById(book.id));
            setShowReviewForm(false);
        }
    };

    const handleAddQuote = (text: string) => {
        if (activeUser && book) {
            // Обновляем книгу в appData и получаем обновленный объект
            addQuoteToBook(book.id, text, activeUser);
            // Принудительно обновляем состояние книги, чтобы UI обновился
            setBook(retrieveBookById(book.id));
            setShowQuoteForm(false);
        }
    };

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
            // Обновляем книгу в состоянии, используя данные из result
            setBook(result.book || retrieveBookById(book.id)); // Используем result.book, если есть, иначе перечитываем
            if (result.buyer) {
                const { password, ...userToStore } = result.buyer;
                setActiveUser(userToStore);
            }
        } else {
            alert(result.message);
        }
    };

    const handleProposeTrade = () => {
        if (!activeUser) {
            alert('Пожалуйста, войдите в систему, чтобы предложить обмен.');
            navigate('/login');
            return;
        }
        if (book) {
            navigate(`/propose-trade/${book.id}`);
        }
    };

    if (!book) {
        return <div className="page-message">Книга не найдена.</div>;
    }

    const isOwner = activeUser?.id === book.currentOwner.id;
    // Определяем путь к обложке. Если это Data URL или внешний URL, используем его напрямую.
    const coverPath = book.coverImageUrl.startsWith('http') || book.coverImageUrl.startsWith('data:image/')
        ? book.coverImageUrl
        : `/${book.coverImageUrl}`;

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
                        book.reviews.map(review => (
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
                        book.quotes.map(quote => (
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
