// src/pages/AdminDashboardPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // <-- Убедитесь, что Link импортирован
import { useAuthStatus } from '../hooks/useAuthStatus';
import { registeredUsers, deleteUser, availableBooks, deleteBook } from '../data/appData';
import BookCard from '../components/books/BookCard';

/**
 * @component AdminDashboardPage
 * @description Страница административной панели.
 * Доступна только пользователям с ролью 'admin'.
 * Позволяет управлять пользователями (удалять) и просматривать/удалять книги с поиском.
 */
const AdminDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { activeUser } = useAuthStatus();

    const [users, setUsers] = useState(registeredUsers);
    const [books, setBooks] = useState(availableBooks); // Все книги
    const [filteredBooks, setFilteredBooks] = useState(availableBooks); // Отфильтрованные книги для отображения
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!activeUser || activeUser.role !== 'admin') {
            alert('Доступ запрещен. Только администраторы могут просматривать эту страницу.');
            navigate('/');
            return;
        }
        setUsers([...registeredUsers]);
        // Обновляем и фильтруем книги при изменении данных или поискового запроса
        const currentBooks = [...availableBooks]; // Получаем актуальный список
        const filtered = currentBooks.filter(book =>
            book.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setBooks(currentBooks); // Обновляем полный список (если он изменился)
        setFilteredBooks(filtered); // Обновляем отфильтрованный список
    }, [activeUser, navigate, registeredUsers, availableBooks, searchTerm]);

    /**
     * @function handleDeleteUser
     * @description Обработчик удаления пользователя.
     * @param {string} userId - ID пользователя для удаления.
     */
    const handleDeleteUser = (userId: string) => {
        if (!activeUser) return;

        if (window.confirm('Вы уверены, что хотите удалить этого пользователя? Все его книги будут переназначены, а обмены удалены.')) {
            const result = deleteUser(userId, activeUser.id);
            setMessage(result.message);
            if (result.success) {
                setUsers([...registeredUsers]);
                // После удаления пользователя, книги могли быть переназначены, поэтому обновляем их
                const currentBooks = [...availableBooks];
                const filtered = currentBooks.filter(book =>
                    book.title.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setBooks(currentBooks);
                setFilteredBooks(filtered);
            }
        }
    };

    /**
     * @function handleDeleteBook
     * @description Обработчик удаления книги.
     * @param {string} bookId - ID книги для удаления.
     */
    const handleDeleteBook = (bookId: string) => {
        if (!activeUser) return;

        if (window.confirm('Вы уверены, что хотите удалить эту книгу? Это действие необратимо.')) {
            const result = deleteBook(bookId, activeUser.id);
            setMessage(result.message);
            if (result.success) {
                // После удаления книги, обновляем отфильтрованный список
                const currentBooks = [...availableBooks];
                const filtered = currentBooks.filter(book =>
                    book.title.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setBooks(currentBooks);
                setFilteredBooks(filtered);
            }
        }
    };

    if (!activeUser || activeUser.role !== 'admin') {
        return <div className="page-message">Загрузка или доступ запрещен...</div>;
    }

    return (
        <div className="form-container">
            <h2 className="form-title">Панель администратора</h2>
            {message && <p className={message.includes('успешно') ? 'success-message' : 'error-message'}>{message}</p>}

            <section className="admin-section">
                <h3>Управление пользователями</h3>
                <ul className="user-list">
                    {users.map(user => (
                        <li key={user.id} className="user-item">
                            <span>{user.name} (ID: {user.id}, Роль: {user.role})</span>
                            {user.id !== activeUser.id && user.role !== 'admin' && (
                                <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="action-button reject-button"
                                >
                                    Удалить
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </section>

            <section className="admin-section mt-4">
                <h3>Управление книгами</h3>
                <p className="info-message">Администратор может редактировать любую книгу, а так же удалять их.</p>
                
                {/* Поле поиска для книг в админке */}
                <div className="search-bar mb-3">
                    <input
                        type="text"
                        placeholder="Поиск книг по названию..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Поиск книг в админ-панели"
                    />
                </div>
                {/* Поле поиска для книг в админке */}

                <div className="book-grid">
                    {filteredBooks.length > 0 ? (
                        filteredBooks.map(book => (
                            <div key={book.id} className="admin-book-card-wrapper">
                                <BookCard book={book} />
                                <div className="admin-book-actions"> {/* <-- НОВЫЙ DIV ДЛЯ КНОПОК */}
                                    <Link
                                        to={`/edit-book/${book.id}`}
                                        className="action-button primary-button edit-book-button" // <-- КНОПКА РЕДАКТИРОВАНИЯ
                                    >
                                        Редактировать
                                    </Link>
                                    <button
                                        onClick={() => handleDeleteBook(book.id)}
                                        className="action-button reject-button delete-book-button"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-books-message">Книг по вашему запросу не найдено.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default AdminDashboardPage;
