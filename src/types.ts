/**
 * Киберспортивный турнир: основные типы данных
 * Заменили книжные сущности на турнирные
 */

export interface TournamentComment {
    id: string;
    text: string;
    user: User;
    createdAt: string;
  }
export interface User {
    id: string;
    name: string;
    email?: string; // Добавили для регистрации
    avatar?: string; // URL к аватарке
    balance: number;
    team?: string; // ID текущей команды
}

// Было: Review → Стало: Match (информация о матче)
export interface Match {
    id: string;
    team1: Team;
    team2: Team;
    score?: [number, number]; // [team1, team2]
    startTime: string;
    endTime?: string;
    streamUrl?: string; // Ссылка на трансляцию
    status: 'upcoming' | 'live' | 'finished';
}

// Было: Quote → Стало: TournamentComment (комментарии к турниру)
export interface TournamentComment {
    id: string;
    text: string;
    user: User;
    createdAt: string;
}

export interface Team {
    id: string;
    name: string;
    logo?: string; // URL к логотипу
    game: string; // 'Dota 2', 'CS2' и т.д.
    captain: User; // Капитан команды
    members: User[]; // Участники (3-5 человек)
    rating?: number; // Рейтинг для seeding
}

export interface Tournament {
    id: string;
    name: string;
    game: GameType;
    organizer: User;
    prizePool: number;
    status: 'upcoming' | 'registration' | 'ongoing' | 'finished';
    teams: Team[];
    brackets: TournamentBrackets;
    maxTeams: number;
    matchTime: number;
  }

export interface BracketMatch {
    id: string;
    team1?: Team | null; // Optional для первых раундов
    team2?: Team | null;
    score?: [number, number];
    winner?: Team | null;
    round: number; // Номер раунда
    stage: 'upper' | 'lower' | 'final';
    nextMatchId?: string; // Связь с следующим матчем
    startTime?: string;
}

// Бывший Trade → Теперь TournamentApplication (заявка на участие)
export interface TournamentApplication {
    id: string;
    team: Team;
    tournament: Tournament;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

/** Дополнительные типы для UI */
export type GameType = 'Dota 2' | 'CS2' | 'Valorant' | 'LoL' | 'Overwatch 2';
export interface Game {
    id: GameType;
    name: string;
    teamSize: number; // 1 для соло, 5 для Dota 2 и т.д.
    logo: string; // Путь к изображению
}

export interface BracketMatch {
    id: string;
    team1?: Team | null;
    team2?: Team | null;
    score?: [number, number];
    winner?: Team | null;
    round: number;
    stage: 'upper' | 'lower' | 'final';
    nextMatchId?: string;
    startTime?: string;
  }
  
  export interface TournamentBrackets {
    upper: BracketMatch[];
    lower: BracketMatch[];
    final?: BracketMatch;
  }