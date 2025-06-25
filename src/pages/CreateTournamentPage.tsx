import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTournament } from '../context/TournamentContext';

const CreateTournamentPage: React.FC = () => {
  const [tournamentData, setTournamentData] = useState({
    name: '',
    game: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maxTeams: 8
  });
  const [error, setError] = useState('');
  const { createTournament } = useTournament();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tournamentData.name || !tournamentData.game) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (new Date(tournamentData.endDate) < new Date(tournamentData.startDate)) {
      setError('End date must be after start date');
      return;
    }
    
    if (tournamentData.maxTeams < 2 || tournamentData.maxTeams > 32) {
      setError('Number of teams must be between 2 and 32');
      return;
    }
    
    const tournament = createTournament({
      ...tournamentData,
      organizerId: user?.id || '',
    });
    
    navigate(`/tournament/${tournament.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Tournament</h1>
      
      {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="name">
            Tournament Name *
          </label>
          <input
            id="name"
            type="text"
            className="w-full p-2 border rounded"
            value={tournamentData.name}
            onChange={(e) => setTournamentData({...tournamentData, name: e.target.value})}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="game">
            Game *
          </label>
          <input
            id="game"
            type="text"
            className="w-full p-2 border rounded"
            value={tournamentData.game}
            onChange={(e) => setTournamentData({...tournamentData, game: e.target.value})}
            required
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="startDate">
              Start Date *
            </label>
            <input
              id="startDate"
              type="date"
              className="w-full p-2 border rounded"
              value={tournamentData.startDate}
              onChange={(e) => setTournamentData({...tournamentData, startDate: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="endDate">
              End Date *
            </label>
            <input
              id="endDate"
              type="date"
              className="w-full p-2 border rounded"
              value={tournamentData.endDate}
              onChange={(e) => setTournamentData({...tournamentData, endDate: e.target.value})}
              required
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="maxTeams">
            Maximum Teams (2-32) *
          </label>
          <input
            id="maxTeams"
            type="number"
            min="2"
            max="32"
            className="w-full p-2 border rounded"
            value={tournamentData.maxTeams}
            onChange={(e) => setTournamentData({...tournamentData, maxTeams: parseInt(e.target.value)})}
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Create Tournament
        </button>
      </form>
    </div>
  );
};

export default CreateTournamentPage;
