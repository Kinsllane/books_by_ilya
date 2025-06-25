import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tournament, Match, Team } from '../interfaces';
import { generateDoubleEliminationBracket } from '../utils/bracketGenerator';

interface TournamentContextType {
  tournaments: Tournament[];
  createTournament: (tournament: Omit<Tournament, 'id' | 'participants' | 'matches' | 'status'>) => Tournament;
  updateMatchResult: (tournamentId: string, matchId: string, score1: number, score2: number) => void;
  registerTeam: (tournamentId: string, team: Omit<Team, 'id'>) => void;
  getTournament: (id: string) => Tournament | undefined;
  startTournament: (tournamentId: string) => void; // Добавлено
}

const TournamentContext = createContext<TournamentContextType>({} as TournamentContextType);

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    const storedTournaments = localStorage.getItem('tournaments');
    if (storedTournaments) {
      setTournaments(JSON.parse(storedTournaments));
    }
  }, []);

  const saveTournaments = (newTournaments: Tournament[]) => {
    setTournaments(newTournaments);
    localStorage.setItem('tournaments', JSON.stringify(newTournaments));
  };

  const createTournament = (tournament: Omit<Tournament, 'id' | 'participants' | 'matches' | 'status'>) => {
    const newTournament: Tournament = {
      ...tournament,
      id: Date.now().toString(),
      participants: [],
      matches: [],
      status: 'upcoming'
    };
    
    const newTournaments = [...tournaments, newTournament];
    saveTournaments(newTournaments);
    return newTournament;
  };

  const updateMatchResult = (tournamentId: string, matchId: string, score1: number, score2: number) => {
    const updatedTournaments = tournaments.map(t => {
      if (t.id === tournamentId) {
        const updatedMatches = t.matches.map(m => {
          if (m.id === matchId) {
            const winnerId = score1 > score2 ? m.team1Id : m.team2Id;
            return { ...m, score1, score2, winnerId };
          }
          return m;
        });
        return { ...t, matches: updatedMatches };
      }
      return t;
    });
    saveTournaments(updatedTournaments);
  };

  const registerTeam = (tournamentId: string, team: Omit<Team, 'id'>) => {
    const newTeam: Team = { ...team, id: Date.now().toString() };
    const updatedTournaments = tournaments.map(t => {
      if (t.id === tournamentId) {
        return { ...t, participants: [...t.participants, newTeam] };
      }
      return t;
    });
    saveTournaments(updatedTournaments);
  };

  const getTournament = (id: string) => {
    return tournaments.find(t => t.id === id);
  };

  const startTournament = (tournamentId: string) => {
    const updatedTournaments = tournaments.map(t => {
      if (t.id === tournamentId && t.status === 'upcoming') {
        const matches = generateDoubleEliminationBracket(t);
        return { ...t, status: 'ongoing' as 'ongoing', matches }; // Убедитесь, что статус установлен правильно
      }
      return t;
    });
    saveTournaments(updatedTournaments);
  };
  

  return (
    <TournamentContext.Provider value={{ 
      tournaments, 
      createTournament, 
      updateMatchResult, 
      registerTeam,
      getTournament,
      startTournament // Добавлено
    }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => useContext(TournamentContext);
