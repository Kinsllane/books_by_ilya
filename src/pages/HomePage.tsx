import React, { useState, useEffect } from 'react';
import BookCard from '../components/books/BookCard';
import { availableBooks } from '../data/appData';

const HomePage: React.FC = () => {
    const [booksToDisplay, setBooksToDisplay] = useState(availableBooks);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const filteredBooks = availableBooks.filter(book =>
            book.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setBooksToDisplay(filteredBooks);
    }, [searchTerm, availableBooks]); 

    return (
        <div className="home-page-container">
            <h1 className="page-title">Каталог книг</h1>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Поиск по названию книги..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Поиск книг"
                />
            </div>
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
