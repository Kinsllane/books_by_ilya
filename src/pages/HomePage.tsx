// src/pages/HomePage.tsx

import React, { useState, useEffect } from 'react';
import BookCard from '../components/books/BookCard'; // Импортируем компонент BookCard
import { availableBooks } from '../data/appData'; // Импортируем массив книг из appData

/**
 * @component HomePage
 * @description Главная страница приложения, отображающая список всех доступных книг.
 */
const HomePage: React.FC = () => {
    // Используем состояние для книг, чтобы компонент мог перерендериться при изменении данных
    // (например, после покупки или обмена книги, когда меняется владелец)
    const [booksToDisplay, setBooksToDisplay] = useState(availableBooks);

    // Эффект для обновления списка книг, если availableBooks изменится
    // В реальном приложении здесь могла бы быть подписка на изменения или более сложный механизм
    useEffect(() => {
        setBooksToDisplay(availableBooks);
    }, [availableBooks]); // Зависимость от availableBooks (хотя это мутируемый массив, React не увидит мутации без нового объекта)

    // Для принудительного обновления при мутации availableBooks (если не создается новый массив)
    // Можно использовать ключ, основанный на длине массива и ID владельцев, как в оригинале
    // const bookStateSignature = availableBooks.length + '_' + availableBooks.map(b => b.currentOwner.id).join('');

    return (
        <div className="home-page-container">
            <h1 className="page-title">Каталог книг</h1>
            <div className="book-grid"> {/* Сетка для отображения карточек книг */}
                {booksToDisplay.length > 0 ? (
                    booksToDisplay.map(book => (
                        <BookCard key={book.id} book={book} />
                    ))
                ) : (
                    <p className="no-books-message">Книг пока нет в каталоге.</p>
                )}
            </div>
        </div>
    );
};

export default HomePage;
