// src/pages/EditBookFormPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus';
import { retrieveBookById, updateBook } from '../data/appData';
import type { BookEntry } from '../types/appTypes';

/**
 * @component EditBookFormPage
 * @description Страница для редактирования существующей книги.
 * Доступна только авторизованным пользователям, являющимся владельцами книги,
 * или администраторам.
 */
const EditBookFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { activeUser } = useAuthStatus();

    // Состояния для полей формы
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [isForSale, setIsForSale] = useState(false);
    const [priceValue, setPriceValue] = useState('');
    const [isForTrade, setIsForTrade] = useState(false);
    const [publicationYear, setPublicationYear] = useState('');
    const [loading, setLoading] = useState(true);
    const [bookNotFound, setBookNotFound] = useState(false);

    // НОВОЕ СОСТОЯНИЕ: для хранения выбранного файла обложки
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        if (!activeUser) {
            alert('Необходимо войти в систему для редактирования книги.');
            navigate('/login');
            return;
        }

        if (id) {
            const bookToEdit = retrieveBookById(id);
            if (bookToEdit) {
                // Проверяем, является ли текущий пользователь владельцем книги ИЛИ администратором
                if (bookToEdit.currentOwner.id !== activeUser.id && activeUser.role !== 'admin') { // <-- ИЗМЕНЕНИЕ ЗДЕСЬ
                    alert('У вас нет прав для редактирования этой книги.');
                    navigate('/');
                    return;
                }

                // Предзаполняем форму данными книги
                setTitle(bookToEdit.title);
                setAuthor(bookToEdit.author);
                setDescription(bookToEdit.description);
                setCoverImageUrl(bookToEdit.coverImageUrl); // Устанавливаем текущий URL обложки
                setIsForSale(bookToEdit.isForSale);
                setPriceValue(bookToEdit.priceValue ? String(bookToEdit.priceValue) : '');
                setIsForTrade(bookToEdit.isForTrade);
                setPublicationYear(String(bookToEdit.publicationYear));
                setLoading(false);
            } else {
                setBookNotFound(true);
                setLoading(false);
            }
        } else {
            setBookNotFound(true);
            setLoading(false);
        }
    }, [id, activeUser, navigate]);

    /**
     * @function handleFileChange
     * @description Обработчик изменения файла обложки.
     * Читает выбранный файл и преобразует его в Data URL.
     * @param {React.ChangeEvent<HTMLInputElement>} e - Событие изменения input file.
     */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file); // Сохраняем файл в состоянии
            const reader = new FileReader();
            reader.onloadend = () => {
                // Когда файл прочитан, устанавливаем его как coverImageUrl
                setCoverImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file); // Читаем файл как Data URL
        } else {
            setSelectedFile(null);
            // Если файл не выбран, можно очистить coverImageUrl или оставить текущий
            // setCoverImageUrl(''); // Или оставить текущий, если не выбран новый файл
        }
    };

    /**
     * @function handleSubmit
     * @description Обработчик отправки формы редактирования книги.
     * @param {React.FormEvent} e - Событие формы.
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!activeUser || !id) {
            alert('Ошибка: Пользователь не авторизован или ID книги отсутствует.');
            return;
        }

        if (isForSale && (!priceValue || Number(priceValue) <= 0)) {
            alert('Пожалуйста, укажите корректную цену для продажи (больше 0).');
            return;
        }

        if (!publicationYear || Number(publicationYear) <= 0) {
            alert('Пожалуйста, укажите корректный год публикации (больше 0).');
            return;
        }

        const updatedBookData = {
            title,
            author,
            description,
            // Используем coverImageUrl, который мог быть установлен из файла или вручную
            coverImageUrl: coverImageUrl || '/book-cover-default.png',
            isForSale,
            priceValue: isForSale ? Number(priceValue) : undefined,
            isForTrade,
            publicationYear: Number(publicationYear)
        };

        const result = updateBook(id, updatedBookData, activeUser.id);

        if (result.success) {
            alert('Информация о книге успешно обновлена!');
            navigate(`/book/${id}`);
        } else {
            alert(`Ошибка обновления: ${result.message}`);
        }
    };

    if (loading) {
        return <div className="page-message">Загрузка данных книги...</div>;
    }

    if (bookNotFound) {
        return <div className="page-message">Книга для редактирования не найдена.</div>;
    }

    return (
        <div className="form-container">
            <h2 className="form-title">Редактировать книгу</h2>
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
                        rows={6}
                        aria-label="Описание книги"
                    />
                </div>

                {/* НОВОЕ ПОЛЕ: Загрузка файла обложки */}
                <div className="form-group">
                    <label htmlFor="coverFile">Загрузить обложку (файл):</label>
                    <input
                        type="file"
                        id="coverFile"
                        accept="image/*" // Принимаем только изображения
                        onChange={handleFileChange}
                        aria-label="Загрузить файл обложки"
                    />
                    {selectedFile && <p className="info-message">Выбран файл: {selectedFile.name}</p>}
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

                    {isForSale && (
                         <div className="form-group nested-group">
                            <label htmlFor="priceValue">Цена (₽):</label>
                            <input
                                type="number"
                                id="priceValue"
                                value={priceValue}
                                onChange={(e) => setPriceValue(e.target.value)}
                                required={isForSale}
                                min="1"
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

                <button type="submit" className="submit-button">Сохранить изменения</button>
            </form>
        </div>
    );
};

export default EditBookFormPage;
