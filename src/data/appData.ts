// src/data/appData.ts

import { v4 as generateUniqueId } from 'uuid';
import type { BookEntry, UserProfile, BookReview, BookQuote, BookTrade } from '../types/appTypes';

// --- Имитация базы данных (хранение в памяти) ---

let registeredUsers: UserProfile[] = [
    { id: 'usr-001', name: 'Алиса', password: 'password123', balance: 1000, registrationDate: '2023-01-15' },
    { id: 'usr-002', name: 'Борис', password: 'password123', balance: 1500, registrationDate: '2023-02-20' },
    { id: 'usr-003', name: 'Вера', password: 'password123', balance: 800, registrationDate: '2023-03-10' },
];

export let availableBooks: BookEntry[] = [
    {
        id: 'book-001',
        title: 'Тень Ветра',
        author: 'Карлос Руис Сафон',
        description: 'Однажды в туманном рассвете 1945 года мальчик по имени Даниель попадает в таинственное место в сердце старого города — на Кладбище Забытых Книг. Там он находит проклятую книгу, которая изменит всю его жизнь и погрузит его в лабиринт интриг и тайн, скрытых в темной душе города.',
        coverImageUrl: 'book-cover-1.png',
        currentOwner: registeredUsers[0],
        isForSale: true,
        isForTrade: true,
        priceValue: 300,
        reviews: [
            { id: 'rev-001', text: 'Захватывающая история, не мог оторваться!', reviewer: registeredUsers[1] },
        ],
        quotes: [
            { id: 'qte-001', text: 'Книги — это зеркала: в них мы видим лишь то, что уже несем в своей душе.', quoter: registeredUsers[0] },
        ],
        publicationYear: 2001
    },
    {
        id: 'book-002',
        title: 'Дюна',
        author: 'Фрэнк Герберт',
        description: 'История Пола Атрейдеса, наследника могущественного дома, которому предстоит бороться за контроль над пустынной планетой Арракис, единственным источником самого ценного вещества во вселенной — пряности.',
        coverImageUrl: 'book-cover-2.png',
        currentOwner: registeredUsers[1],
        isForSale: false,
        isForTrade: true,
        reviews: [
            { id: 'rev-002', text: 'Величайшая научная фантастика всех времен. Обязательно к прочтению.', reviewer: registeredUsers[2] },
            { id: 'rev-003', text: 'Сложно, но очень интересно.', reviewer: registeredUsers[0] },
        ],
        quotes: [],
        publicationYear: 1965
    },
    {
        id: 'book-003',
        title: 'Гордость и Предубеждение',
        author: 'Джейн Остен',
        description: 'Классический роман о нравах, воспитании, морали и браке в обществе землевладельцев в Англии начала XIX века. В центре сюжета — отношения между Элизабет Беннет и богатым аристократом Фицуильямом Дарси.',
        coverImageUrl: 'book-cover-3.png',
        currentOwner: registeredUsers[2],
        isForSale: true,
        isForTrade: false,
        priceValue: 250,
        reviews: [],
        quotes: [
            { id: 'qte-002', text: 'Всеобщее признание, что одинокий мужчина, обладающий хорошим состоянием, должен нуждаться в жене.', quoter: registeredUsers[2] },
        ],
        publicationYear: 1813
    }
];

export let activeTrades: BookTrade[] = [];

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
        registrationDate: new Date().toISOString().split('T')[0] // Текущая дата
    };
    registeredUsers.push(newUser);
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
    return { success: true, message: `Баланс успешно пополнен на ${amount}₽.`, user };
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
        currentOwner: owner,
        reviews: [],
        quotes: [],
    };
    // Добавляем новую книгу в начало массива, чтобы она сразу была видна
    availableBooks = [newBook, ...availableBooks];
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

    // Проверяем, является ли пользователь владельцем книги
    if (existingBook.currentOwner.id !== userId) {
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

    // Проверяем, является ли пользователь владельцем книги
    if (bookToDelete.currentOwner.id !== userId) {
        return { success: false, message: "У вас нет прав для удаления этой книги." };
    }

    // Удаляем книгу из массива
    availableBooks.splice(bookIndex, 1);

    // Также удаляем все активные предложения обмена, связанные с этой книгой
    activeTrades = activeTrades.filter(trade =>
        trade.initiatorBook.id !== bookId && trade.recipientBook.id !== bookId
    );

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
        const { initiator, initiatorBook, recipient, recipientBook } = trade;

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
        return { success: true, message: "Обмен успешно завершен!" };
    } else {
        trade.status = response;
        const message = response === 'rejected' ? "Предложение обмена отклонено." : "Предложение обмена отменено.";
        return { success: true, message };
    }
};
