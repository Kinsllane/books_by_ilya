// src/components/books/BookCard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import type { BookEntry } from '../../types/appTypes';

interface BookCardProps {
    book: BookEntry;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
    // Определяем путь к обложке. Если это Data URL или внешний URL, используем его напрямую.
    // Если это локальный файл (например, '/book-cover-default.png'), добавляем слэш.
    const coverPath = book.coverImageUrl.startsWith('http') || book.coverImageUrl.startsWith('data:image/')
        ? book.coverImageUrl
        : `/${book.coverImageUrl}`;

    return (
        <Link to={`/book/${book.id}`} className="book-card">
            <img src={coverPath} alt={`Обложка книги ${book.title}`} className="book-card-cover" />
            <div className="book-card-info">
                <h3 className="book-card-title">{book.title}</h3>
                <p className="book-card-author">{book.author}</p>
                <p className="book-card-owner">Владелец: {book.currentOwner.name}</p>
                {book.isForSale && book.priceValue && (
                    <p className="book-card-price">Цена: {book.priceValue}₽</p>
                )}
                {book.isForTrade && (
                    <p className="book-card-trade">Доступна для обмена</p>
                )}
            </div>
        </Link>
    );
};

export default BookCard;
