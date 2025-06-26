// src/pages/HomePage.tsx

import React, { useState, useEffect } from 'react';
import BookCard from '../components/books/BookCard';
import { availableBooks } from '../data/appData';

/**
 * @component HomePage
 * @description Главная страница приложения, отображающая список всех доступных книг с возможностью поиска.
 */
const HomePage: React.FC = () => {
    const [booksToDisplay, setBooksToDisplay] = useState(availableBooks);
    const [searchTerm, setSearchTerm] = useState('');

    // Эффект для обновления списка книг и применения фильтрации
    useEffect(() => {
        // Фильтруем книги на основе поискового запроса (только по названию)
        const filteredBooks = availableBooks.filter(book =>
            book.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setBooksToDisplay(filteredBooks);
    }, [searchTerm, availableBooks]); // Зависимости: поисковый запрос и массив всех книг

    return (
        <div className="home-page-container">
            <h1 className="page-title">Каталог книг</h1>

            {/* Поле поиска */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Поиск по названию книги..." // <-- ИЗМЕНЕН ТЕКСТ ПЛЕЙСХОЛДЕРА
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Поиск книг"
                />
            </div>
            {/* Поле поиска */}

            <div className="book-grid">
                {booksToDisplay.length > 0 ? (
                    booksToDisplay.map(book => (
                        <BookCard key={book.id} book={book} />
                    ))
                ) : (
                    <p className="no-books-message">Книг по вашему запросу не найдено.</p>
                )}
            </div>
        </div>
    );
};

export default HomePage;
