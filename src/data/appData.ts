// src/data/appData.ts

import { v4 as generateUniqueId } from 'uuid';
import type { BookEntry, UserProfile, BookReview, BookQuote, BookTrade } from '../types/appTypes';

// --- Вспомогательные функции для работы с localStorage ---
const LS_PREFIX = 'bookswap_'; // Префикс для ключей в localStorage, чтобы избежать конфликтов

/**
 * Загружает данные из localStorage.
 * @param key Ключ для хранения данных.
 * @param defaultData Данные по умолчанию, если в localStorage ничего нет или произошла ошибка.
 * @returns Загруженные данные или данные по умолчанию.
 */
const loadData = <T>(key: string, defaultData: T): T => {
    try {
        const storedData = localStorage.getItem(LS_PREFIX + key);
        // Дополнительная проверка для UserProfile: убедимся, что поле 'role' присутствует
        if (key === 'registeredUsers' && storedData) {
            const parsedData: UserProfile[] = JSON.parse(storedData);
            // Если у пользователя нет роли, присваиваем 'user' по умолчанию
            // Также инициализируем avatarUrl и bio, если их нет
            return parsedData.map(user => ({
                ...user,
                role: user.role || 'user',
                avatarUrl: user.avatarUrl || '/default-avatar.png', // <-- ИНИЦИАЛИЗАЦИЯ АВАТАРА
                bio: user.bio || '' // <-- ИНИЦИАЛИЗАЦИЯ БИО
            })) as T;
        }
        return storedData ? JSON.parse(storedData) : defaultData;
    } catch (error) {
        console.error(`Ошибка загрузки данных из localStorage для ключа ${key}:`, error);
        return defaultData; // Возвращаем дефолтные данные в случае ошибки
    }
};

/**
 * Сохраняет данные в localStorage.
 * @param key Ключ для хранения данных.
 * @param data Данные для сохранения.
 */
const saveData = <T>(key: string, data: T) => {
    try {
        localStorage.setItem(LS_PREFIX + key, JSON.stringify(data));
    } catch (error) {
        console.error(`Ошибка сохранения данных в localStorage для ключа ${key}:`, error);
    }
};
// --- Конец вспомогательных функций ---


// --- Дефолтные данные для инициализации (если localStorage пуст) ---

// Дефолтные пользователи - ОСТАВЛЯЕМ ТОЛЬКО АДМИНА
const DEFAULT_USERS: UserProfile[] = [
    {
        id: 'usr-admin',
        name: 'Админ',
        password: 'adminpassword',
        balance: 9999,
        registrationDate: '2023-01-01',
        role: 'admin',
        avatarUrl: '/default-avatar.png', // <-- ДОБАВЛЕНО
        bio: 'Главный администратор системы BookSwap.' // <-- ДОБАВЛЕНО
    },
];

// Дефолтные книги - УДАЛЯЕМ ВСЕ
const DEFAULT_BOOKS: BookEntry[] = []; // <-- ПУСТОЙ МАССИВ

// --- Имитация базы данных (хранение в памяти, загрузка из localStorage) ---

export let registeredUsers: UserProfile[] = loadData('registeredUsers', DEFAULT_USERS);
export let availableBooks: BookEntry[] = loadData('availableBooks', DEFAULT_BOOKS);
export let activeTrades: BookTrade[] = loadData('activeTrades', []);


// --- Восстановление ссылок на объекты после загрузки из localStorage ---
// Этот блок остается, так как он важен для корректной работы с данными,
// даже если они загружены из localStorage или созданы динамически.
// Он гарантирует, что ссылки на UserProfile и BookEntry внутри других структур
// (например, reviews, quotes, trades) будут корректными объектами, а не просто ID.

// 1. Восстанавливаем ссылки на UserProfile в BookEntry (currentOwner, reviews, quotes)
availableBooks.forEach(book => {
    // currentOwner
    const owner = registeredUsers.find(u => u.id === book.currentOwner.id);
    if (owner) {
        book.currentOwner = owner;
    } else {
        // Если владелец не найден (например, удален), назначаем первого пользователя (админа)
        console.warn(`Владелец книги "${book.title}" (ID: ${book.id}) не найден. Назначаем первого пользователя (админа).`);
        book.currentOwner = registeredUsers[0]; // Назначаем первого пользователя по умолчанию (это будет админ)
    }

    // reviews.reviewer
    book.reviews.forEach(review => {
        const reviewer = registeredUsers.find(u => u.id === review.reviewer.id);
        if (reviewer) {
            review.reviewer = reviewer;
        } else {
            console.warn(`Рецензент рецензии ${review.id} для книги "${book.title}" не найден.`);
            review.reviewer = registeredUsers[0]; // Назначаем первого пользователя по умолчанию
        }
    });

    // quotes.quoter
    book.quotes.forEach(quote => {
        const quoter = registeredUsers.find(u => u.id === quote.quoter.id);
        if (quoter) {
            quote.quoter = quoter;
        } else {
            console.warn(`Автор цитаты ${quote.id} для книги "${book.title}" не найден.`);
            quote.quoter = registeredUsers[0]; // Назначаем первого пользователя по умолчанию
        }
    });
});

// 2. Восстанавливаем ссылки на UserProfile и BookEntry в BookTrade
activeTrades.forEach(trade => {
    // initiator
    const initiator = registeredUsers.find(u => u.id === trade.initiator.id);
    if (initiator) {
        trade.initiator = initiator;
    } else {
        console.warn(`Инициатор обмена ${trade.id} не найден. Обмен будет отклонен.`);
        trade.status = 'rejected'; // Отклоняем обмен, если инициатор не найден
    }

    // recipient
    const recipient = registeredUsers.find(u => u.id === trade.recipient.id);
    if (recipient) {
        trade.recipient = recipient;
    } else {
        console.warn(`Получатель обмена ${trade.id} не найден. Обмен будет отклонен.`);
        trade.status = 'rejected'; // Отклоняем обмен, если получатель не найден
    }

    // initiatorBook
    const initiatorBook = availableBooks.find(b => b.id === trade.initiatorBook.id);
    if (initiatorBook) {
        trade.initiatorBook = initiatorBook;
    } else {
        console.warn(`Книга инициатора обмена ${trade.id} не найдена. Обмен будет отклонен.`);
        trade.status = 'rejected'; // Отклоняем обмен, если книга не найдена
    }

    // recipientBook
    const recipientBook = availableBooks.find(b => b.id === trade.recipientBook.id);
    if (recipientBook) {
        trade.recipientBook = recipientBook;
    } else {
        console.warn(`Книга получателя обмена ${trade.id} не найдена. Обмен будет отклонен.`);
        trade.status = 'rejected'; // Отклоняем обмен, если книга не найдена
    }
});
// --- Конец восстановления ссылок ---


// --- Функции для работы с пользователями ---

/**
 * @function authenticateUser
 * @description Имитирует аутентификацию пользователя по имени и паролю.
 * @param {string} username - Имя пользователя.
 * @param {string} password_raw - Пароль пользователя.
 * @returns {UserProfile | undefined} Профиль пользователя, если аутентификация успешна, иначе undefined.
 */
export const authenticateUser = (username: string, password_raw: string): UserProfile | undefined => {
    return registeredUsers.find(user => user.name === username && user.password === password_raw);
};

/**
 * @function findUserByUsername
 * @description Ищет пользователя по имени (без учета регистра).
 * @param {string} username - Имя пользователя для поиска.
 * @returns {UserProfile | undefined} Профиль пользователя, если найден, иначе undefined.
 */
export const findUserByUsername = (username: string): UserProfile | undefined => {
    return registeredUsers.find(user => user.name.toLowerCase() === username.toLowerCase());
};

/**
 * @function findUserById
 * @description Ищет пользователя по его ID.
 * @param {string | undefined} userId - ID пользователя.
 * @returns {UserProfile | undefined} Профиль пользователя, если найден, иначе undefined.
 */
export const findUserById = (userId: string | undefined): UserProfile | undefined => {
    if (!userId) return undefined;
    return registeredUsers.find(user => user.id === userId);
};

/**
 * @function registerNewUser
 * @description Регистрирует нового пользователя в системе.
 * @param {string} username - Имя нового пользователя.
 * @param {string} password_raw - Пароль нового пользователя.
 * @returns {UserProfile} Созданный профиль пользователя.
 */
export const registerNewUser = (username: string, password_raw: string): UserProfile => {
    const newUser: UserProfile = {
        id: `usr-${generateUniqueId()}`,
        name: username,
        password: password_raw,
        balance: 500, // Начальный баланс
        registrationDate: new Date().toISOString().split('T')[0], // Текущая дата
        role: 'user', // по умолчанию новый пользователь - обычный пользователь
        avatarUrl: '/default-avatar.png', // <-- ИНИЦИАЛИЗАЦИЯ АВАТАРА
        bio: '' // <-- ИНИЦИАЛИЗАЦИЯ БИО
    };
    registeredUsers.push(newUser);
    saveData('registeredUsers', registeredUsers); // Сохраняем изменения
    return newUser;
};

/**
 * @function topUpUserBalance
 * @description Пополняет баланс пользователя.
 * @param {string} userId - ID пользователя.
 * @param {number} amount - Сумма пополнения.
 * @returns {{ success: boolean, message: string, user?: UserProfile }} Результат операции.
 */
export const topUpUserBalance = (userId: string, amount: number): { success: boolean, message: string, user?: UserProfile } => {
    if (amount <= 0) {
        return { success: false, message: "Сумма пополнения должна быть положительной." };
    }
    const user = findUserById(userId);
    if (!user) {
        return { success: false, message: "Пользователь не найден." };
    }
    user.balance += amount;
    saveData('registeredUsers', registeredUsers); // Сохраняем изменения
    return { success: true, message: `Баланс успешно пополнен на ${amount}₽.`, user };
};

/**
 * @function updateUserProfile
 * @description Обновляет информацию профиля пользователя (аватар, био).
 * @param {string} userId - ID пользователя, чей профиль обновляется.
 * @param {Partial<UserProfile>} updates - Объект с обновляемыми полями (avatarUrl, bio).
 * @returns {{ success: boolean, message: string, user?: UserProfile }} Результат операции.
 */
export const updateUserProfile = (userId: string, updates: Partial<UserProfile>): { success: boolean, message: string, user?: UserProfile } => {
    const userIndex = registeredUsers.findIndex(user => user.id === userId);
    if (userIndex === -1) {
        return { success: false, message: "Пользователь не найден." };
    }

    const user = registeredUsers[userIndex];
    registeredUsers[userIndex] = { ...user, ...updates }; // Применяем обновления
    saveData('registeredUsers', registeredUsers); // Сохраняем изменения
    return { success: true, message: "Профиль успешно обновлен.", user: registeredUsers[userIndex] };
};


/**
 * @function deleteUser
 * @description Удаляет пользователя из системы.
 * @param {string} userIdToDelete - ID пользователя, которого нужно удалить.
 * @param {string} adminId - ID администратора, выполняющего действие (для проверки прав).
 * @returns {{ success: boolean, message: string }} Результат операции.
 */
export const deleteUser = (userIdToDelete: string, adminId: string): { success: boolean, message: string } => {
    const adminUser = findUserById(adminId);
    if (!adminUser || adminUser.role !== 'admin') {
        return { success: false, message: "У вас нет прав администратора для удаления пользователей." };
    }

    if (userIdToDelete === adminId) {
        return { success: false, message: "Администратор не может удалить сам себя." };
    }

    const userIndex = registeredUsers.findIndex(user => user.id === userIdToDelete);
    if (userIndex === -1) {
        return { success: false, message: "Пользователь не найден." };
    }

    const userToDelete = registeredUsers[userIndex];

    // Переназначаем книги удаляемого пользователя первому админу (который всегда есть)
    const defaultOwner = registeredUsers.find(u => u.role === 'admin'); // Ищем админа
    if (!defaultOwner) { // Этого не должно произойти, если админ всегда есть
        return { success: false, message: "Ошибка: Администратор для переназначения книг не найден." };
    }

    availableBooks.forEach(book => {
        if (book.currentOwner.id === userToDelete.id) {
            book.currentOwner = defaultOwner;
        }
    });

    // Удаляем пользователя
    registeredUsers.splice(userIndex, 1);
    saveData('registeredUsers', registeredUsers);
    saveData('availableBooks', availableBooks); // Сохраняем изменения в книгах, так как владельцы могли измениться

    // Также удаляем все активные предложения обмена, связанные с этим пользователем
    const initialActiveTradesLength = activeTrades.length;
    activeTrades = activeTrades.filter(trade =>
        trade.initiator.id !== userIdToDelete && trade.recipient.id !== userIdToDelete
    );
    if (activeTrades.length !== initialActiveTradesLength) {
        saveData('activeTrades', activeTrades);
    }

    return { success: true, message: `Пользователь ${userToDelete.name} успешно удален.` };
};


// --- Функции для работы с книгами ---

/**
 * @function retrieveBookById
 * @description Ищет книгу по ее ID.
 * @param {string | undefined} bookId - ID книги.
 * @returns {BookEntry | undefined} Запись о книге, если найдена, иначе undefined.
 */
export const retrieveBookById = (bookId: string | undefined): BookEntry | undefined => {
    if (!bookId) return undefined;
    return availableBooks.find(book => book.id === bookId);
};

/**
 * @function addNewBook
 * @description Добавляет новую книгу в каталог.
 * @param {Omit<BookEntry, 'id' | 'currentOwner' | 'reviews' | 'quotes'>} bookDetails - Детали новой книги.
 * @param {UserProfile} owner - Пользователь, добавляющий книгу.
 * @returns {BookEntry} Созданная запись о книге.
 */
export const addNewBook = (bookDetails: Omit<BookEntry, 'id' | 'currentOwner' | 'reviews' | 'quotes'>, owner: UserProfile): BookEntry => {
    const newBook: BookEntry = {
        ...bookDetails,
        id: `book-${generateUniqueId()}`,
        currentOwner: owner, // owner уже является ссылкой на объект из registeredUsers
        reviews: [],
        quotes: [],
    };
    // Добавляем новую книгу в начало массива, чтобы она сразу была видна
    availableBooks = [newBook, ...availableBooks];
    saveData('availableBooks', availableBooks); // Сохраняем изменения
    return newBook;
};

/**
 * @function updateBook
 * @description Обновляет информацию о существующей книге.
 * @param {string} bookId - ID книги для обновления.
 * @param {Omit<BookEntry, 'id' | 'currentOwner' | 'reviews' | 'quotes'>} updatedDetails - Обновленные детали книги.
 * @param {string} userId - ID пользователя, пытающегося обновить книгу (для проверки прав).
 * @returns {{ success: boolean, message: string, updatedBook?: BookEntry }} Результат операции.
 */
export const updateBook = (
    bookId: string,
    updatedDetails: Omit<BookEntry, 'id' | 'currentOwner' | 'reviews' | 'quotes'>,
    userId: string
): { success: boolean, message: string, updatedBook?: BookEntry } => {
    const bookIndex = availableBooks.findIndex(book => book.id === bookId);

    if (bookIndex === -1) {
        return { success: false, message: "Книга не найдена." };
    }

    const existingBook = availableBooks[bookIndex];
    // Получаем объект пользователя, который пытается обновить
    const actingUser = findUserById(userId);

    // Проверяем права: либо владелец, либо администратор
    if (!actingUser || (existingBook.currentOwner.id !== userId && actingUser.role !== 'admin')) {
        return { success: false, message: "У вас нет прав для редактирования этой книги." };
    }

    // Обновляем свойства книги
    const updatedBook: BookEntry = {
        ...existingBook, // Сохраняем существующие ID, владельца, рецензии, цитаты
        ...updatedDetails, // Применяем новые детали
        // Убедимся, что priceValue корректно устанавливается/удаляется
        priceValue: updatedDetails.isForSale ? updatedDetails.priceValue : undefined
    };

    availableBooks[bookIndex] = updatedBook;
    saveData('availableBooks', availableBooks); // Сохраняем изменения

    return { success: true, message: "Информация о книге успешно обновлена.", updatedBook };
};


/**
 * @function deleteBook
 * @description Удаляет книгу из каталога.
 * @param {string} bookId - ID книги для удаления.
 * @param {string} userId - ID пользователя, пытающегося удалить книгу (для проверки прав).
 * @returns {{ success: boolean, message: string }} Результат операции.
 */
export const deleteBook = (bookId: string, userId: string): { success: boolean, message: string } => {
    const bookIndex = availableBooks.findIndex(book => book.id === bookId);

    if (bookIndex === -1) {
        return { success: false, message: "Книга не найдена." };
    }

    const bookToDelete = availableBooks[bookIndex];
    const actingUser = findUserById(userId); // Получаем объект пользователя, который пытается удалить

    // Проверяем права: либо владелец, либо администратор
    if (!actingUser || (bookToDelete.currentOwner.id !== userId && actingUser.role !== 'admin')) {
        return { success: false, message: "У вас нет прав для удаления этой книги." };
    }

    // Удаляем книгу из массива
    availableBooks.splice(bookIndex, 1);
    saveData('availableBooks', availableBooks); // Сохраняем изменения

    // Также удаляем все активные предложения обмена, связанные с этой книгой
    const initialActiveTradesLength = activeTrades.length;
    activeTrades = activeTrades.filter(trade =>
        trade.initiatorBook.id !== bookId && trade.recipientBook.id !== bookId
    );
    if (activeTrades.length !== initialActiveTradesLength) {
        saveData('activeTrades', activeTrades); // Сохраняем изменения, если обмены были удалены
    }

    return { success: true, message: "Книга успешно удалена." };
};


/**
 * @function addReviewToBook
 * @description Добавляет рецензию к книге.
 * @param {string} bookId - ID книги.
 * @param {string} text - Текст рецензии.
 * @param {UserProfile} reviewer - Пользователь, оставляющий рецензию.
 * @returns {BookReview} Созданная рецензия.
 */
export const addReviewToBook = (bookId: string, text: string, reviewer: UserProfile): BookReview => {
    const book = retrieveBookById(bookId);
    const newReview: BookReview = { id: `rev-${generateUniqueId()}`, text, reviewer };
    if (book) {
        book.reviews.push(newReview);
        saveData('availableBooks', availableBooks); // Сохраняем изменения
    }
    return newReview;
};

/**
 * @function addQuoteToBook
 * @description Добавляет цитату к книге.
 * @param {string} bookId - ID книги.
 * @param {string} text - Текст цитаты.
 * @param {UserProfile} quoter - Пользователь, добавляющий цитату.
 * @returns {BookQuote} Созданная цитата.
 */
export const addQuoteToBook = (bookId: string, text: string, quoter: UserProfile): BookQuote => {
    const book = retrieveBookById(bookId);
    const newQuote: BookQuote = { id: `qte-${generateUniqueId()}`, text, quoter };
    if (book) {
        book.quotes.push(newQuote);
        saveData('availableBooks', availableBooks); // Сохраняем изменения
    }
    return newQuote;
};

/**
 * @function purchaseBook
 * @description Имитирует покупку книги.
 * @param {string} bookId - ID книги для покупки.
 * @param {string} buyerId - ID пользователя-покупателя.
 * @returns {{ success: boolean, message: string, book?: BookEntry, buyer?: UserProfile }} Результат операции.
 */
export const purchaseBook = (bookId: string, buyerId: string): { success: boolean, message: string, book?: BookEntry, buyer?: UserProfile } => {
    const book = retrieveBookById(bookId);
    const buyer = findUserById(buyerId);

    if (!book || !buyer || !book.priceValue) {
        return { success: false, message: "Книга или покупатель не найдены, или книга не имеет цены." };
    }

    const seller = findUserById(book.currentOwner.id);

    if (!seller) {
        return { success: false, message: "Продавец книги не найден." };
    }

    if (buyer.balance < book.priceValue) {
        return { success: false, message: "Недостаточно средств на балансе для покупки." };
    }

    // Выполнение транзакции
    buyer.balance -= book.priceValue;
    seller.balance += book.priceValue;
    book.currentOwner = buyer; // Смена владельца книги
    book.isForSale = false; // Книга больше не продается
    book.isForTrade = false; // Книга больше не для обмена (по умолчанию после покупки)

    saveData('registeredUsers', registeredUsers); // Сохраняем изменения балансов
    saveData('availableBooks', availableBooks); // Сохраняем изменения книги (владелец, isForSale, isForTrade)

    return { success: true, message: "Покупка книги успешно совершена!", book, buyer };
};

// --- Функции для работы с обменами ---

/**
 * @function getUserTradeProposals
 * @description Возвращает входящие и исходящие предложения обмена для пользователя.
 * @param {string} userId - ID пользователя.
 * @returns {{ incoming: BookTrade[], outgoing: BookTrade[] }} Списки предложений.
 */
export const getUserTradeProposals = (userId: string): { incoming: BookTrade[], outgoing: BookTrade[] } => {
    const incoming = activeTrades.filter(t => t.recipient.id === userId && t.status === 'pending');
    const outgoing = activeTrades.filter(t => t.initiator.id === userId && t.status === 'pending');
    return { incoming, outgoing };
};

/**
 * @function createNewTradeProposal
 * @description Создает новое предложение обмена книгами.
 * @param {string} initiatorId - ID пользователя, инициирующего обмен.
 * @param {string} initiatorBookId - ID книги, которую предлагает инициатор.
 * @param {string} recipientBookId - ID книги, которую хочет получить инициатор.
 * @returns {{ success: boolean, message: string }} Результат операции.
 */
export const createNewTradeProposal = (initiatorId: string, initiatorBookId: string, recipientBookId: string): { success: boolean, message: string } => {
    const initiator = findUserById(initiatorId);
    const initiatorBook = retrieveBookById(initiatorBookId);
    const recipientBook = retrieveBookById(recipientBookId);

    if (!initiator || !initiatorBook || !recipientBook) {
        return { success: false, message: "Ошибка: Недостаточно данных для создания предложения обмена." };
    }

    const recipient = recipientBook.currentOwner;

    // Проверка на существование аналогичного предложения
    const existingTrade = activeTrades.find(t =>
        t.status === 'pending' &&
        ((t.initiator.id === initiator.id && t.initiatorBook.id === initiatorBook.id && t.recipientBook.id === recipientBook.id) ||
         (t.initiator.id === recipient.id && t.initiatorBook.id === recipientBook.id && t.recipientBook.id === initiatorBook.id))
    );

    if (existingTrade) {
        return { success: false, message: "Такое предложение обмена уже существует и ожидает ответа." };
    }

    const newTrade: BookTrade = {
        id: `trade-${generateUniqueId()}`,
        initiator,
        initiatorBook,
        recipient,
        recipientBook,
        status: 'pending'

    };

    activeTrades.push(newTrade);
    saveData('activeTrades', activeTrades); // Сохраняем изменения
    return { success: true, message: "Предложение обмена успешно отправлено!" };
};

/**
 * @function respondToTradeProposal
 * @description Обрабатывает ответ на предложение обмена (принять/отклонить/отменить).
 * @param {string} tradeId - ID предложения обмена.
 * @param {'accepted' | 'rejected' | 'cancelled'} response - Ответ на предложение.
 * @returns {{ success: boolean, message: string }} Результат операции.
 */
export const respondToTradeProposal = (tradeId: string, response: 'accepted' | 'rejected' | 'cancelled'): { success: boolean, message: string } => {
    const trade = activeTrades.find(t => t.id === tradeId);
    if (!trade) {
        return { success: false, message: "Предложение обмена не найдено." };
    }

    if (response === 'accepted') {
        const { initiatorBook, recipientBook } = trade;

        // Меняем владельцев книг
        const tempOwner = initiatorBook.currentOwner;
        initiatorBook.currentOwner = recipientBook.currentOwner;
        recipientBook.currentOwner = tempOwner;

        // Отмечаем книги как не для продажи/обмена после успешного обмена
        initiatorBook.isForSale = false;
        initiatorBook.isForTrade = false;
        recipientBook.isForSale = false;
        recipientBook.isForTrade = false;

        trade.status = 'accepted';

        saveData('availableBooks', availableBooks); // Сохраняем изменения книг (владельцы, статусы)
        saveData('activeTrades', activeTrades); // Сохраняем изменения обмена (статус)

        return { success: true, message: "Обмен успешно завершен!" };
    } else {
        trade.status = response;
        saveData('activeTrades', activeTrades); // Сохраняем изменения обмена (статус)
        const message = response === 'rejected' ? "Предложение обмена отклонено." : "Предложение обмена отменено.";
        return { success: true, message };
    }
};
