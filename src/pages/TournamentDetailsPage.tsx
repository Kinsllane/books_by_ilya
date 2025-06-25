import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tournament, Match, Team } from '../interfaces';
import { useTournament } from '../context/TournamentContext';
import { useAuth } from '../context/AuthContext';

const TournamentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getTournament, updateMatchResult, registerTeam, startTournament } = useTournament();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState('');
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [score1, setScore1] = useState<number | null>(null);
  const [score2, setScore2] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      const foundTournament = getTournament(id);
      if (foundTournament) {
        setTournament(foundTournament);
      } else {
        navigate('/tournaments');
      }
    }
  }, [id, getTournament, navigate]);

  const handleRegisterTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !members || !id) {
      setError('Please fill all fields');
      return;
    }
    
    try {
      registerTeam(id, {
        name: teamName,
        members: members.split(',').map(m => m.trim()).filter(m => m)
      });
      setTeamName('');
      setMembers('');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register team');
    }
  };

  const handleUpdateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatch || !id) {
      setError('No match selected');
      return;
    }
    
    if (score1 === null || score2 === null) {
      setError('Please enter scores for both teams');
      return;
    }

    try {
      updateMatchResult(id, editingMatch.id, score1, score2);
      setEditingMatch(null);
      setScore1(null);
      setScore2(null);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update match');
    }
  };

  const handleStartTournament = () => {
    if (!id || !tournament) return;
    
    if (tournament.participants.length < 2) {
      setError('Need at least 2 teams to start tournament');
      return;
    }

    try {
      startTournament(id);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start tournament');
    }
  };

  const renderMatch = (match: Match) => {
    if (!tournament) return null;

    const team1 = tournament.participants.find(t => t.id === match.team1Id);
    const team2 = tournament.participants.find(t => t.id === match.team2Id);
    const winner = tournament.participants.find(t => t.id === match.winnerId);

    return (
      <div key={match.id} className="bg-white p-3 rounded shadow-sm border border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <p className={`font-medium ${winner?.id === match.team1Id ? 'text-green-600' : ''}`}>
              {team1 ? team1.name : 'TBD'}
            </p>
            <p className={`font-medium ${winner?.id === match.team2Id ? 'text-green-600' : ''}`}>
              {team2 ? team2.name : 'TBD'}
            </p>
          </div>
          <div className="text-right">
            <p>{match.score1 !== null ? match.score1 : '-'}</p>
            <p>{match.score2 !== null ? match.score2 : '-'}</p>
          </div>
        </div>
        {user?.role === 'organizer' && tournament.status === 'ongoing' && (
          <button 
            onClick={() => {
              setEditingMatch(match);
              setScore1(match.score1);
              setScore2(match.score2);
            }}
            className="mt-2 w-full text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
          >
            Update Score
          </button>
        )}
      </div>
    );
  };

  const renderBracketSection = (bracket: 'winners' | 'losers' | 'final', title: string) => {
    if (!tournament || tournament.matches.length === 0) return null;
    
    const bracketMatches = tournament.matches
      .filter(m => m.bracket === bracket)
      .sort((a, b) => a.round - b.round);

    if (bracketMatches.length === 0) return null;

    return (
      <div className="mt-6">
        <h3 className="font-bold text-lg mb-3">{title} Bracket</h3>
        <div className="space-y-4">
          {[...new Set(bracketMatches.map(m => m.round))]
            .sort()
            .map(round => (
              <div key={round} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">
                  {bracket === 'final' 
                    ? 'Final' 
                    : `${title} Round ${round}`}
                </h4>
                <div className="grid gap-3">
                  {bracketMatches
                    .filter(m => m.round === round)
                    .map(renderMatch)}
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  if (!tournament) return <div className="p-8 text-center">Loading tournament...</div>;

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">{tournament.name}</h1>
            <p className="text-xl text-gray-600">{tournament.game}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              tournament.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
              tournament.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {tournament.status}
            </span>
            {user?.role === 'organizer' && tournament.status === 'upcoming' && (
              <button
                onClick={handleStartTournament}
                className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700"
              >
                Start Tournament
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Tournament Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Start Date</p>
                  <p className="font-medium">
                    {new Date(tournament.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">End Date</p>
                  <p className="font-medium">
                    {new Date(tournament.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Teams</p>
                  <p className="font-medium">
                    {tournament.participants.length}/{tournament.maxTeams}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Organizer</p>
                  <p className="font-medium">
                    {user?.id === tournament.organizerId ? 'You' : 'Organizer'}
                  </p>
                </div>
              </div>
            </div>

            {tournament.status !== 'upcoming' && (
              <>
                {renderBracketSection('winners', 'Winners')}
                {renderBracketSection('losers', 'Losers')}
                {renderBracketSection('final', 'Final')}
              </>
            )}
          </div>

          <div className="space-y-6">
            {user?.role === 'team' && tournament.status === 'upcoming' && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Register Your Team</h2>
                <form onSubmit={handleRegisterTeam}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-1 text-sm">Team Name *</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-1 text-sm">
                      Team Members (comma separated) *
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={members}
                      onChange={(e) => setMembers(e.target.value)}
                      required
                      placeholder="Player1, Player2, Player3"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                    disabled={tournament.participants.length >= tournament.maxTeams}
                  >
                    {tournament.participants.length >= tournament.maxTeams 
                      ? 'Tournament Full' 
                      : 'Register Team'}
                  </button>
                </form>
              </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Participants ({tournament.participants.length})
                </h2>
                {tournament.status === 'completed' && tournament.matches.length > 0 && (
                  <button 
                    onClick={() => navigate(`/tournament/${tournament.id}/results`)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Final Results
                  </button>
                )}
              </div>
              
              {tournament.participants.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {tournament.participants.map(team => (
                    <li key={team.id} className="py-2">
                      <div className="font-medium">{team.name}</div>
                      {team.members.length > 0 && (
                        <div className="text-sm text-gray-600">
                          Members: {team.members.join(', ')}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No teams registered yet</p>
              )}
            </div>

            {editingMatch && (
              <div className="bg-white p-6 rounded-lg shadow-md border border-blue-200">
                <h2 className="text-xl font-semibold mb-4">Update Match Result</h2>
                <form onSubmit={handleUpdateMatch}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">
                        {tournament.participants.find(t => t.id === editingMatch.team1Id)?.name || 'Team 1'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full p-2 border rounded"
                        value={score1 ?? ''}
                        onChange={(e) => setScore1(e.target.value ? parseInt(e.target.value) : null)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">
                        {tournament.participants.find(t => t.id === editingMatch.team2Id)?.name || 'Team 2'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full p-2 border rounded"
                        value={score2 ?? ''}
                        onChange={(e) => setScore2(e.target.value ? parseInt(e.target.value) : null)}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingMatch(null)}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetailsPage;
