import React from 'react';
import { Link } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import { useAuth } from '../context/AuthContext';

const TournamentsPage: React.FC = () => {
  const { tournaments } = useTournament();
  const { user } = useAuth();

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">All Tournaments</h1>
        {user?.role === 'organizer' && (
          <Link 
            to="/create-tournament" 
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Create Tournament
          </Link>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map(tournament => (
          <div key={tournament.id} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">
              <Link to={`/tournament/${tournament.id}`} className="text-blue-600 hover:underline">
                {tournament.name}
              </Link>
            </h2>
            <p className="text-gray-800 mb-1">Game: {tournament.game}</p>
            <p className="text-gray-600 mb-2">
              {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
            </p>
            <div className="flex justify-between text-sm">
              <span className={`px-2 py-1 rounded ${
                tournament.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                tournament.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {tournament.status}
              </span>
              <span>
                Teams: {tournament.participants.length}/{tournament.maxTeams}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TournamentsPage;
