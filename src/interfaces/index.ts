export interface User {
    id: string;
    username: string;
    password: string;
    email: string;
    role: 'organizer' | 'team';
  }
  
  export interface Tournament {
    id: string;
    name: string;
    game: string;
    startDate: string;
    endDate: string;
    maxTeams: number;
    organizerId: string;
    participants: Team[];
    matches: Match[];
    status: 'upcoming' | 'ongoing' | 'completed'; // Убедитесь, что тип здесь правильный
  }
  
  export interface Team {
    id: string;
    name: string;
    members: string[];
    logo?: string;
  }
  
  export interface Match {
    id: string;
    round: number;
    bracket: 'winners' | 'losers' | 'final';
    team1Id: string | null;
    team2Id: string | null;
    score1: number | null;
    score2: number | null;
    winnerId: string | null;
  }
  
  