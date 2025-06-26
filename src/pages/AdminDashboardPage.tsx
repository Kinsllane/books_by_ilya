// src/pages/AdminDashboardPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus';
import { registeredUsers, deleteUser, availableBooks, deleteBook } from '../data/appData'; // <-- ДОБАВЛЕН deleteBook
import BookCard from '../components/books/BookCard';

/**
 * @component AdminDashboardPage
 * @description Страница административной панели.
 * Доступна только пользователям с ролью 'admin'.
 * Позволяет управлять пользователями (удалять) и просматривать/удалять книги.
 */
const AdminDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { activeUser } = useAuthStatus();

    const [users, setUsers] = useState(registeredUsers);
    const [books, setBooks] = useState(availableBooks);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!activeUser || activeUser.role !== 'admin') {
            alert('Доступ запрещен. Только администраторы могут просматривать эту страницу.');
            navigate('/');
            return;
        }
        setUsers([...registeredUsers]);
        setBooks([...availableBooks]);
    }, [activeUser, navigate, registeredUsers, availableBooks]);

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
                setBooks([...availableBooks]); // Обновляем книги, так как владельцы могли измениться
            }
        }
    };

    /**
     * @function handleDeleteBook
     * @description Обработчик удаления книги.
     * @param {string} bookId - ID книги для удаления.
     */
    const handleDeleteBook = (bookId: string) => { // <-- НОВАЯ ФУНКЦИЯ
        if (!activeUser) return;

        if (window.confirm('Вы уверены, что хотите удалить эту книгу? Это действие необратимо.')) {
            const result = deleteBook(bookId, activeUser.id); // Вызываем функцию deleteBook
            setMessage(result.message);
            if (result.success) {
                setBooks([...availableBooks]); // Обновляем список книг
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
                <p className="info-message">Администратор может редактировать любую книгу, перейдя на её страницу деталей и нажав "Редактировать".</p>
                <div className="book-grid">
                    {books.map(book => (
                        <div key={book.id} className="admin-book-card-wrapper"> {/* <-- НОВАЯ ОБЕРТКА */}
                            <BookCard book={book} />
                            <button
                                onClick={() => handleDeleteBook(book.id)}
                                className="action-button reject-button delete-book-button" // <-- КНОПКА УДАЛЕНИЯ КНИГИ
                            >
                                Удалить книгу
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AdminDashboardPage;
