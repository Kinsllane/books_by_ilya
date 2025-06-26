// src/pages/UserProfilePage.tsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus';
import BookCard from '../components/books/BookCard';
import {
    availableBooks,
    activeTrades,
    findUserById,
    respondToTradeProposal,
    deleteBook,
    updateUserProfile // <-- НОВЫЙ ИМПОРТ
} from '../data/appData';
import type { BookEntry, BookTrade, UserProfile } from '../types/appTypes';

/**
 * @component UserProfilePage
 * @description Страница профиля пользователя, отображающая его книги, баланс,
 * предложения обмена (входящие и исходящие), а также позволяющая редактировать профиль.
 */
const UserProfilePage: React.FC = () => {
    const { activeUser, setActiveUser } = useAuthStatus();
    const navigate = useNavigate();

    const [myBooks, setMyBooks] = useState<BookEntry[]>([]);
    const [incomingTrades, setIncomingTrades] = useState<BookTrade[]>([]);
    const [outgoingTrades, setOutgoingTrades] = useState<BookTrade[]>([]);
    const [showTopUpForm, setShowTopUpForm] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Состояния для редактирования профиля
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [newBio, setNewBio] = useState(activeUser?.bio || '');
    const [newAvatarDataUrl, setNewAvatarDataUrl] = useState<string | null>(activeUser?.avatarUrl || null);
    const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);


    const getBooksByOwnerId = (ownerId: string): BookEntry[] => {
        return availableBooks.filter(book => book.currentOwner.id === ownerId);
    };

    const getTradeOffersForUser = (userId: string): { incoming: BookTrade[], outgoing: BookTrade[] } => {
        const incoming = activeTrades.filter(trade => trade.recipient.id === userId && trade.status === 'pending');
        const outgoing = activeTrades.filter(trade => trade.initiator.id === userId && trade.status === 'pending');
        return { incoming, outgoing };
    };

    useEffect(() => {
        if (activeUser) {
            setMyBooks(getBooksByOwnerId(activeUser.id));
            const { incoming, outgoing } = getTradeOffersForUser(activeUser.id);
            setIncomingTrades(incoming);
            setOutgoingTrades(outgoing);
            // Обновляем состояния формы редактирования при изменении activeUser
            setNewBio(activeUser.bio || '');
            setNewAvatarDataUrl(activeUser.avatarUrl || null);
        } else {
            navigate('/login');
        }
    }, [activeUser, navigate, availableBooks, activeTrades]);

    /**
     * @function handleTopUpSubmit
     * @description Обработчик отправки формы пополнения баланса.
     * Перенаправляет на страницу оплаты.
     * @param {React.FormEvent} e - Событие формы.
     */
    const handleTopUpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        const amount = Number(topUpAmount);
        if (!activeUser) {
            setErrorMessage('Пользователь не авторизован.');
            return;
        }
        if (amount <= 0 || isNaN(amount)) {
            setErrorMessage('Пожалуйста, введите корректную сумму для пополнения (больше 0).');
            return;
        }

        navigate('/payment', { state: { amount: amount } });
    };

    /**
     * @function handleTradeResponse
     * @description Обработчик ответа на предложение обмена (принять/отклонить).
     * @param {string} tradeId - ID предложения обмена.
     * @param {'accepted' | 'rejected'} response - Ответ на предложение.
     */
    const handleTradeResponse = (tradeId: string, response: 'accepted' | 'rejected') => {
        setErrorMessage('');
        setSuccessMessage('');
        const result = respondToTradeProposal(tradeId, response);
        if (result.success) {
            setSuccessMessage(result.message);
            if (activeUser) {
                // Обновляем списки книг и обменов после успешной операции
                setMyBooks(getBooksByOwnerId(activeUser.id));
                const { incoming, outgoing } = getTradeOffersForUser(activeUser.id);
                setIncomingTrades(incoming);
                setOutgoingTrades(outgoing);
                // Обновляем данные пользователя, так как баланс мог измениться
                const updatedUser = findUserById(activeUser.id);
                if (updatedUser) {
                    setActiveUser(updatedUser);
                }
            }
        } else {
            setErrorMessage(result.message);
        }
    };

    /**
     * @function handleCancelTrade
     * @description Обработчик отмены исходящего предложения обмена.
     * @param {string} tradeId - ID предложения обмена.
     */
    const handleCancelTrade = (tradeId: string) => {
        setErrorMessage('');
        setSuccessMessage('');
        const result = respondToTradeProposal(tradeId, 'cancelled');
        if (result.success) {
            setSuccessMessage(result.message);
            if (activeUser) {
                const { incoming, outgoing } = getTradeOffersForUser(activeUser.id);
                setIncomingTrades(incoming);
                setOutgoingTrades(outgoing);
            }
        } else {
            setErrorMessage(result.message);
        }
    };

    /**
     * @function handleDeleteBook
     * @description Обработчик удаления книги.
     * @param {string} bookId - ID книги для удаления.
     */
    const handleDeleteBook = (bookId: string) => {
        if (!activeUser) {
            alert('Вы не авторизованы.');
            return;
        }
        if (window.confirm('Вы уверены, что хотите удалить эту книгу? Это действие необратимо.')) {
            const result = deleteBook(bookId, activeUser.id);
            if (result.success) {
                setSuccessMessage(result.message);
                // Обновляем список книг пользователя после удаления
                setMyBooks(getBooksByOwnerId(activeUser.id));
                // Также обновляем предложения обмена, так как удаленная книга могла быть в них
                const { incoming, outgoing } = getTradeOffersForUser(activeUser.id);
                setIncomingTrades(incoming);
                setOutgoingTrades(outgoing);
            } else {
                setErrorMessage(result.message);
            }
        }
    };

    /**
     * @function handleAvatarFileChange
     * @description Обработчик изменения файла аватара.
     * Читает выбранный файл как Data URL.
     * @param {React.ChangeEvent<HTMLInputElement>} e - Событие изменения файла.
     */
    const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Пожалуйста, выберите файл изображения (PNG, JPG, JPEG, GIF).');
                setNewAvatarDataUrl(activeUser?.avatarUrl || null); // Возвращаем старый аватар
                setSelectedAvatarFile(null);
                return;
            }

            setSelectedAvatarFile(file); // Сохраняем файл для последующей обработки
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewAvatarDataUrl(reader.result as string);
            };
            reader.onerror = () => {
                alert('Не удалось прочитать файл.');
                setNewAvatarDataUrl(activeUser?.avatarUrl || null);
                setSelectedAvatarFile(null);
            };
            reader.readAsDataURL(file);
        } else {
            setNewAvatarDataUrl(activeUser?.avatarUrl || null); // Если файл не выбран, возвращаем старый
            setSelectedAvatarFile(null);
        }
    };

    /**
     * @function handleProfileSave
     * @description Обработчик сохранения изменений профиля.
     */
    const handleProfileSave = () => {
        if (!activeUser) return;

        setErrorMessage('');
        setSuccessMessage('');

        const updates: Partial<UserProfile> = {
            bio: newBio.trim()
        };

        // Если выбран новый файл аватара, используем его Data URL
        if (newAvatarDataUrl) {
            updates.avatarUrl = newAvatarDataUrl;
        } else if (activeUser.avatarUrl) {
            // Если аватар был, но его удалили (или не выбрали новый), можно сбросить на дефолтный
            updates.avatarUrl = '/default-avatar.png';
        }


        const result = updateUserProfile(activeUser.id, updates);
        if (result.success && result.user) {
            setActiveUser(result.user); // Обновляем пользователя в контексте
            setSuccessMessage('Профиль успешно обновлен!');
            setIsEditingProfile(false); // Выходим из режима редактирования
        } else {
            setErrorMessage(result.message || 'Ошибка при обновлении профиля.');
        }
    };

    // Вспомогательная функция для определения пути к обложке
    const getCoverPath = (imageUrl: string): string => {
        // Если это Data URL или внешний URL, используем его напрямую.
        // Если это локальный файл (например, '/book-cover-default.png'), добавляем слэш.
        if (imageUrl.startsWith('http') || imageUrl.startsWith('data:image/')) {
            return imageUrl;
        }
        return `/${imageUrl}`;
    };


    if (!activeUser) {
        return <div className="page-message">Загрузка профиля...</div>;
    }

    return (
        <div className="profile-page-container">
            <div className="profile-header-section">
                <div className="profile-avatar-wrapper">
                    <img
                        src={activeUser.avatarUrl || '/default-avatar.png'}
                        alt={`${activeUser.name}'s avatar`}
                        className="profile-avatar"
                    />
                </div>
                <div className="profile-info-main">
                    <h1 className="profile-name">{activeUser.name}</h1>
                    <p className="profile-role">Роль: {activeUser.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
                    <p className="profile-balance">Баланс: <strong>{activeUser.balance}₽</strong></p>
                    <p className="profile-registration-date">Зарегистрирован: {activeUser.registrationDate}</p>
                    <div className="profile-bio">
                        <h3>О себе:</h3>
                        <p>{activeUser.bio || 'Пользователь пока не добавил информацию о себе.'}</p>
                    </div>
                    <button onClick={() => setIsEditingProfile(true)} className="action-button primary-button edit-profile-button">
                        Редактировать профиль
                    </button>
                </div>
            </div>

            {isEditingProfile && (
                <div className="profile-edit-form form-container">
                    <h3>Редактировать профиль</h3>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}

                    <div className="form-group">
                        <label htmlFor="avatarUpload">Изменить аватар:</label>
                        <input
                            type="file"
                            id="avatarUpload"
                            accept="image/*"
                            onChange={handleAvatarFileChange}
                            aria-label="Загрузить новый аватар"
                        />
                        {newAvatarDataUrl && (
                            <div className="avatar-preview">
                                <p>Предпросмотр аватара:</p>
                                <img src={newAvatarDataUrl} alt="Предпросмотр аватара" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '50%', marginTop: '10px', border: '1px solid #ddd' }} />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="bio">Биография:</label>
                        <textarea
                            id="bio"
                            value={newBio}
                            onChange={(e) => setNewBio(e.target.value)}
                            placeholder="Расскажите немного о себе..."
                            rows={4}
                            aria-label="Биография пользователя"
                        />
                    </div>

                    <div className="form-actions">
                        <button onClick={handleProfileSave} className="submit-button">Сохранить</button>
                        <button onClick={() => setIsEditingProfile(false)} className="cancel-button">Отмена</button>
                    </div>
                </div>
            )}

            <section className="balance-section">
                <h2 className="section-title">Управление балансом</h2>
                {!showTopUpForm && (
                    <button onClick={() => setShowTopUpForm(true)} className="action-button primary-button">Пополнить баланс</button>
                )}
                {showTopUpForm && (
                    <form onSubmit={handleTopUpSubmit} className="top-up-form">
                        <input
                            type="number"
                            value={topUpAmount}
                            onChange={e => setTopUpAmount(e.target.value)}
                            placeholder="Сумма пополнения"
                            min="1"
                            required
                            aria-label="Сумма пополнения"
                        />
                        <button type="submit" className="submit-button">Перейти к оплате</button>
                        <button type="button" onClick={() => setShowTopUpForm(false)} className="cancel-button">Отмена</button>
                    </form>
                )}
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}
            </section>

            <section className="trades-section">
                <h2 className="section-title">Предложения обмена</h2>

                <h3>Входящие предложения:</h3>
                {incomingTrades.length > 0 ? (
                    <div className="trade-list">
                        {incomingTrades.map(trade => (
                            <div key={trade.id} className="trade-offer-card">
                                <p><strong>{trade.initiator.name}</strong> хочет обменять свою книгу:</p>
                                <div className="trade-books-display">
                                    <div className="book-item">
                                        <Link to={`/book/${trade.initiatorBook.id}`}>
                                            <img src={getCoverPath(trade.initiatorBook.coverImageUrl)} alt={trade.initiatorBook.title} />
                                        </Link>
                                        <p>{trade.initiatorBook.title}</p>
                                    </div>
                                    <span className="trade-arrow">&harr;</span>
                                    <div className="book-item">
                                        <Link to={`/book/${trade.recipientBook.id}`}>
                                            <img src={getCoverPath(trade.recipientBook.coverImageUrl)} alt={trade.recipientBook.title} />
                                        </Link>
                                        <p>на вашу: {trade.recipientBook.title}</p>
                                    </div>
                                </div>
                                <div className="trade-actions">
                                    <button onClick={() => handleTradeResponse(trade.id, 'accepted')} className="action-button accept-button">Принять</button>
                                    <button onClick={() => handleTradeResponse(trade.id, 'rejected')} className="action-button reject-button">Отклонить</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-content-message">Нет входящих предложений обмена.</p>
                )}

                <h3>Исходящие предложения:</h3>
                {outgoingTrades.length > 0 ? (
                    <div className="trade-list">
                        {outgoingTrades.map(trade => (
                            <div key={trade.id} className="trade-offer-card">
                                <p>Вы предложили <strong>{trade.recipient.name}</strong> обменять вашу книгу:</p>
                                <div className="trade-books-display">
                                    <div className="book-item">
                                        <Link to={`/book/${trade.initiatorBook.id}`}>
                                            <img src={getCoverPath(trade.initiatorBook.coverImageUrl)} alt={trade.initiatorBook.title} />
                                        </Link>
                                        <p>{trade.initiatorBook.title}</p>
                                    </div>
                                    <span className="trade-arrow">&harr;</span>
                                    <div className="book-item">
                                        <Link to={`/book/${trade.recipientBook.id}`}>
                                            <img src={getCoverPath(trade.recipientBook.coverImageUrl)} alt={trade.recipientBook.title} />
                                        </Link>
                                        <p>на: {trade.recipientBook.title}</p>
                                    </div>
                                </div>
                                <div className="trade-actions">
                                    <button onClick={() => handleCancelTrade(trade.id)} className="action-button cancel-button">Отменить предложение</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-content-message">Нет исходящих предложений обмена.</p>
                )}
            </section>

            <section className="my-books-section">
                <h2 className="section-title">Мои книги</h2>
                {myBooks.length > 0 ? (
                    <div className="book-grid">
                        {myBooks.map(book => (
                            <div key={book.id} className="my-book-card-wrapper">
                                <BookCard book={book} />
                                <button
                                    onClick={() => handleDeleteBook(book.id)}
                                    className="action-button reject-button delete-book-button"
                                >
                                    Удалить
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-content-message">У вас пока нет книг. <Link to="/add-book" className="link-text">Добавить книгу?</Link></p>
                )}
            </section>
        </div>
    );
};

export default UserProfilePage;
