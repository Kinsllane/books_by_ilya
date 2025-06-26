
export interface UserProfile {
    id: string;
    name: string;
    password?: string;
    balance: number;
    registrationDate: string;
}

export interface BookReview {
    id: string;
    text: string;
    reviewer: UserProfile;
}

export interface BookQuote {
    id: string;
    text: string;
    quoter: UserProfile;
}


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

export interface BookTrade {
    id: string;
    initiator: UserProfile;
    initiatorBook: BookEntry;
    recipient: UserProfile;
    recipientBook: BookEntry;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
}


export interface UserProfile {
    id: string;
    name: string;
    password?: string;
    balance: number;
    registrationDate: string;
    role: 'user' | 'admin'; // <-- Добавляем это поле
}
