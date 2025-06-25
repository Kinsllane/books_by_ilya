import React from 'react';

const services = [
  {
    id: 1,
    name: 'Premium Tournament Hosting',
    description: 'Get dedicated servers and priority support for your tournament',
    price: '$49.99',
    features: ['Dedicated server', 'Priority support', 'Custom branding', 'Advanced analytics']
  },
  {
    id: 2,
    name: 'Streaming Package',
    description: 'Professional streaming of your tournament matches',
    price: '$99.99',
    features: ['HD streaming', 'Commentary team', 'Graphics overlay', 'VOD storage']
  },
  {
    id: 3,
    name: 'Team Management Tools',
    description: 'Advanced tools for team captains and managers',
    price: '$29.99',
    features: ['Team scheduling', 'Player stats', 'Communication tools', 'Scrim finder']
  }
];

const ServicesPage: React.FC = () => {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Our Services</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">{service.name}</h2>
            <p className="text-gray-600 mb-4">{service.description}</p>
            <div className="mb-4">
              <span className="text-2xl font-bold">{service.price}</span>
              <span className="text-gray-500"> / tournament</span>
            </div>
            <ul className="space-y-2 mb-6">
              {service.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700">
              Purchase Service
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesPage;
