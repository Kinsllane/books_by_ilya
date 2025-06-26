// src/pages/AddBookFormPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus'; // Импортируем наш хук аутентификации
import { addNewBook } from '../data/appData'; // Импортируем функцию для добавления книги

/**
 * @component AddBookFormPage
 * @description Страница для добавления новой книги в каталог.
 * Доступна только авторизованным пользователям.
 */
const AddBookFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { activeUser } = useAuthStatus(); // Получаем текущего пользователя

    // Состояния для полей формы
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [isForSale, setIsForSale] = useState(false);
    const [priceValue, setPriceValue] = useState('');
    const [isForTrade, setIsForTrade] = useState(false);
    const [publicationYear, setPublicationYear] = useState(''); // Добавлено: Год публикации

    /**
     * @function handleSubmit
     * @description Обработчик отправки формы добавления книги.
     * @param {React.FormEvent} e - Событие формы.
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Проверка авторизации (хотя маршрут защищен, это дополнительная мера)
        if (!activeUser) {
            alert('Необходимо войти в систему, чтобы добавить книгу.');
            navigate('/login');
            return;
        }

        // Проверка цены, если книга выставлена на продажу
        if (isForSale && (!priceValue || Number(priceValue) <= 0)) {
            alert('Пожалуйста, укажите корректную цену для продажи (больше 0).');
            return;
        }

        // Проверка года публикации
        const year = Number(publicationYear);
        if (isNaN(year) || year <= 0 || year > new Date().getFullYear()) {
            alert('Пожалуйста, укажите корректный год публикации.');
            return;
        }

        // Создаем объект новой книги
        const newBookData = {
            title,
            author,
            description,
            // Используем предоставленный URL обложки или дефолтную обложку
            coverImageUrl: coverImageUrl || '/book-cover-default.png',
            isForSale,
            // Цена указывается только если книга на продажу, иначе undefined
            priceValue: isForSale ? Number(priceValue) : undefined,
            isForTrade,
            publicationYear: year // Добавлено: Год публикации
        };

        // Добавляем книгу через функцию из appData
        addNewBook(newBookData, activeUser);

        alert('Книга успешно добавлена в каталог!');
        navigate('/'); // Перенаправляем на главную страницу
    };

    return (
        <div className="form-container">
            <h2 className="form-title">Добавить новую книгу</h2>
            <form onSubmit={handleSubmit} className="add-book-form">

                <div className="form-group">
                    <label htmlFor="title">Название:</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        aria-label="Название книги"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="author">Автор:</label>
                    <input
                        type="text"
                        id="author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        required
                        aria-label="Автор книги"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Описание:</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={6} // Увеличиваем высоту текстового поля
                        aria-label="Описание книги"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="coverImageUrl">URL обложки (опционально):</label>
                    <input
                        type="text"
                        id="coverImageUrl"
                        value={coverImageUrl}
                        onChange={(e) => setCoverImageUrl(e.target.value)}
                        placeholder="https://example.com/cover.jpg или book-cover.png"
                        aria-label="URL обложки книги"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="publicationYear">Год публикации:</label>
                    <input
                        type="number"
                        id="publicationYear"
                        value={publicationYear}
                        onChange={(e) => setPublicationYear(e.target.value)}
                        required
                        min="1"
                        max={new Date().getFullYear()}
                        aria-label="Год публикации книги"
                    />
                </div>

                <div className="form-group options-group">
                    <label>Опции размещения:</label>

                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            id="isForSale"
                            checked={isForSale}
                            onChange={(e) => setIsForSale(e.target.checked)}
                            aria-label="Выставить на продажу"
                        />
                        <label htmlFor="isForSale">Выставить на продажу</label>
                    </div>

                    {isForSale && ( // Поле цены появляется только если выбрана опция "На продажу"
                         <div className="form-group nested-group">
                            <label htmlFor="priceValue">Цена (₽):</label>
                            <input
                                type="number"
                                id="priceValue"
                                value={priceValue}
                                onChange={(e) => setPriceValue(e.target.value)}
                                required={isForSale} // Обязательно, если на продажу
                                min="1" // Минимальная цена 1 рубль
                                aria-label="Цена книги"
                            />
                        </div>
                    )}

                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            id="isForTrade"
                            checked={isForTrade}
                            onChange={(e) => setIsForTrade(e.target.checked)}
                            aria-label="Выставить на обмен"
                        />
                        <label htmlFor="isForTrade">Выставить на обмен</label>
                    </div>
                </div>

                <button type="submit" className="submit-button">Разместить книгу</button>
            </form>
        </div>
    );
};

export default AddBookFormPage;
