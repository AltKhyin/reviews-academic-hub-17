
import React from 'react';

// Mock user profile data
const userProfile = {
  name: 'Dr. Ana Martins',
  specialty: 'Cardiologia',
  email: 'ana.martins@hospital.med.br',
  institution: 'Hospital Central',
  joinDate: '10 de agosto de 2023',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
  readArticles: 17,
  savedArticles: 8,
  recentActivity: [
    { type: 'read', title: 'Análise comparativa: novos anticoagulantes vs. warfarina', date: '18 out, 2023' },
    { type: 'saved', title: 'Meta-análise: eficácia de antidepressivos de nova geração', date: '15 out, 2023' },
    { type: 'read', title: 'Impactos do uso prolongado de inibidores de bomba de prótons', date: '12 out, 2023' },
  ]
};

const ActivityIcon = ({ type }: { type: string }) => {
  if (type === 'read') {
    return <span className="bg-status-green w-2 h-2 rounded-full"></span>;
  } else if (type === 'saved') {
    return <span className="bg-status-amber w-2 h-2 rounded-full"></span>;
  }
  return null;
};

const Profile: React.FC = () => {
  return (
    <div className="animate-fade-in pb-12">
      <div className="bg-[#1a1a1a] rounded-lg shadow-lg card-elevation p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-6">
          <div className="mb-4 md:mb-0">
            <div className="relative">
              <img 
                src={userProfile.avatar} 
                alt={userProfile.name} 
                className="w-24 h-24 rounded-full object-cover"
              />
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-status-green border-2 border-[#1a1a1a]"></div>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-serif text-2xl font-medium mb-1">{userProfile.name}</h1>
            <p className="text-gray-400">{userProfile.specialty}</p>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p>{userProfile.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Instituição</p>
                <p>{userProfile.institution}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Membro desde</p>
                <p>{userProfile.joinDate}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 md:mt-0 flex flex-col items-center space-y-3">
            <div className="bg-[#212121] rounded-md p-3 w-full text-center">
              <p className="text-2xl font-medium">{userProfile.readArticles}</p>
              <p className="text-xs text-gray-400">Artigos lidos</p>
            </div>
            <div className="bg-[#212121] rounded-md p-3 w-full text-center">
              <p className="text-2xl font-medium">{userProfile.savedArticles}</p>
              <p className="text-xs text-gray-400">Artigos salvos</p>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-center md:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
          <button className="bg-white text-[#121212] px-4 py-2 rounded-md hover:bg-gray-200 hover-effect">
            Editar perfil
          </button>
          <button className="border border-[#2a2a2a] px-4 py-2 rounded-md hover:bg-[#2a2a2a] hover-effect">
            Preferências
          </button>
        </div>
      </div>
      
      {/* Recent activity section */}
      <div className="bg-[#1a1a1a] rounded-lg shadow-lg card-elevation p-6">
        <h2 className="font-serif text-xl font-medium mb-6">Atividade recente</h2>
        
        <div className="space-y-4">
          {userProfile.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start space-x-4 p-3 hover:bg-[#212121] rounded-md hover-effect">
              <div className="mt-1">
                <ActivityIcon type={activity.type} />
              </div>
              <div className="flex-1">
                <p className="font-medium">{activity.title}</p>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">
                    {activity.type === 'read' ? 'Lido em' : 'Salvo em'} {activity.date}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <button className="text-sm text-gray-400 hover:text-white hover-effect">
            Ver todas as atividades
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
