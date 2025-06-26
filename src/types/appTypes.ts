// src/types/appTypes.ts

/**
 * @interface UserProfile
 * @description Представляет профиль пользователя в системе.
 * @property {string} id - Уникальный идентификатор пользователя.
 * @property {string} name - Имя пользователя (логин).
 * @property {string} [password] - Пароль пользователя (опционально, для хранения в памяти, в реальном приложении был бы хэш).
 * @property {number} balance - Баланс пользователя в условных единицах (например, рублях).
 * @property {string} registrationDate - Дата регистрации пользователя в формате 'YYYY-MM-DD'.
 */
export interface UserProfile {
    id: string;
    name: string;
    password?: string;
    balance: number;
    registrationDate: string;
}

/**
 * @interface BookReview
 * @description Представляет рецензию на книгу.
 * @property {string} id - Уникальный идентификатор рецензии.
 * @property {string} text - Текст рецензии.
 * @property {UserProfile} reviewer - Пользователь, оставивший рецензию.
 */
export interface BookReview {
    id: string;
    text: string;
    reviewer: UserProfile;
}

/**
 * @interface BookQuote
 * @description Представляет цитату из книги.
 * @property {string} id - Уникальный идентификатор цитаты.
 * @property {string} text - Текст цитаты.
 * @property {UserProfile} quoter - Пользователь, добавивший цитату.
 */
export interface BookQuote {
    id: string;
    text: string;
    quoter: UserProfile;
}

/**
 * @interface BookEntry
 * @description Представляет запись о книге в каталоге.
 * @property {string} id - Уникальный идентификатор книги.
 * @property {string} title - Название книги.
 * @property {string} author - Автор книги.
 * @property {string} description - Описание книги.
 * @property {string} coverImageUrl - URL изображения обложки книги.
 * @property {UserProfile} currentOwner - Текущий владелец книги.
 * @property {boolean} isForSale - Флаг, указывающий, продается ли книга.
 * @property {boolean} isForTrade - Флаг, указывающий, доступна ли книга для обмена.
 * @property {number} [priceValue] - Цена книги, если она продается (опционально).
 * @property {BookReview[]} reviews - Массив рецензий на книгу.
 * @property {BookQuote[]} quotes - Массив цитат из книги.
 * @property {number} publicationYear - Год публикации книги.
 */
export interface BookEntry {
    id: string;
    title: string;
    author: string;
    description: string;
    coverImageUrl: string;
    currentOwner: UserProfile;
    isForSale: boolean;
    isForTrade: boolean;
    priceValue?: number;
    reviews: BookReview[];
    quotes: BookQuote[];
    publicationYear: number;
}

/**
 * @interface BookTrade
 * @description Представляет предложение обмена книгами.
 * @property {string} id - Уникальный идентификатор предложения обмена.
 * @property {UserProfile} initiator - Пользователь, инициировавший обмен.
 * @property {BookEntry} initiatorBook - Книга, которую предлагает инициатор.
 * @property {UserProfile} recipient - Пользователь, которому предложен обмен.
 * @property {BookEntry} recipientBook - Книга, которую хочет получить инициатор (принадлежит получателю).
 * @property {'pending' | 'accepted' | 'rejected' | 'cancelled'} status - Текущий статус предложения обмена.
 */
export interface BookTrade {
    id: string;
    initiator: UserProfile;
    initiatorBook: BookEntry;
    recipient: UserProfile;
    recipientBook: BookEntry;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
}
