import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Welcome to Esports Tournaments</h1>
      
      <div className="max-w-3xl mx-auto">
        <p className="text-lg mb-6">
          Organize and participate in exciting esports tournaments with our double elimination system.
        </p>
        
        {isAuthenticated ? (
          <div className="bg-blue-100 p-4 rounded-lg">
            <p className="text-blue-800">
              Welcome back, {user?.role === 'organizer' ? 'Organizer' : 'Team'} {user?.username}!
            </p>
          </div>
        ) : (
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-gray-800">
              Please login or register to create or join tournaments.
            </p>
          </div>
        )}
        
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">For Organizers</h3>
            <p>Create tournaments, manage participants, and update results.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">For Teams</h3>
            <p>Find tournaments, register your team, and compete for prizes.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Our Services</h3>
            <p>Check out additional services to enhance your tournament experience.</p>
            <Link to="/services" className="text-blue-600 hover:underline mt-2 block">Learn more →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
