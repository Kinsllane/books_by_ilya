import React from 'react';
import { Link } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import { useAuth } from '../context/AuthContext';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { tournaments } = useTournament();

  const userTournaments = tournaments.filter(t => 
    user?.role === 'organizer' 
      ? t.organizerId === user.id 
      : t.participants.some(p => p.members.includes(user?.username || ''))
  );

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            {user?.role === 'organizer' ? 'Your Organized Tournaments' : 'Your Participating Tournaments'}
          </h2>
          
          {userTournaments.length > 0 ? (
            <ul className="space-y-3">
              {userTournaments.map(tournament => (
                <li key={tournament.id} className="border-b pb-2">
                  <Link to={`/tournament/${tournament.id}`} className="text-blue-600 hover:underline">
                    {tournament.name} ({tournament.game})
                  </Link>
                  <p className="text-sm text-gray-600">
                    Status: {tournament.status} | Teams: {tournament.participants.length}/{tournament.maxTeams}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">
              {user?.role === 'organizer' 
                ? "You haven't organized any tournaments yet."
                : "You're not participating in any tournaments yet."}
            </p>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            {user?.role === 'organizer' && (
              <Link 
                to="/create-tournament" 
                className="block bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 text-center"
              >
                Create New Tournament
              </Link>
            )}
            
            <Link 
              to="/tournaments" 
              className="block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-center"
            >
              Browse All Tournaments
            </Link>
            
            <Link 
              to="/services" 
              className="block bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 text-center"
            >
              View Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
