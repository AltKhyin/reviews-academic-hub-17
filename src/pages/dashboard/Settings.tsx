
import React, { useState } from 'react';

const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState({
    newArticles: true,
    weeklyDigest: true,
    specialEvents: false
  });
  
  const [displayPrefs, setDisplayPrefs] = useState({
    darkMode: true,
    fontSize: 'medium',
    showAbstract: true
  });
  
  // Handler for notification toggles
  const handleNotificationChange = (setting: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  // Handler for display preferences
  const handleDisplayPrefChange = (setting: keyof typeof displayPrefs, value: any) => {
    setDisplayPrefs(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  return (
    <div className="animate-fade-in pb-12">
      <h1 className="font-serif text-2xl font-medium mb-8">Configurações</h1>
      
      <div className="space-y-8">
        {/* Account Settings */}
        <section className="bg-[#1a1a1a] rounded-lg shadow-lg card-elevation p-6">
          <h2 className="font-serif text-xl font-medium mb-6">Conta</h2>
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm text-gray-400 mb-2">
                  Nome completo
                </label>
                <input
                  id="fullName"
                  type="text"
                  defaultValue="Dr. Ana Martins"
                  className="bg-[#212121] border border-[#2a2a2a] w-full px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm text-gray-400 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  defaultValue="ana.martins@hospital.med.br"
                  className="bg-[#212121] border border-[#2a2a2a] w-full px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>
              
              <div>
                <label htmlFor="specialty" className="block text-sm text-gray-400 mb-2">
                  Especialidade
                </label>
                <input
                  id="specialty"
                  type="text"
                  defaultValue="Cardiologia"
                  className="bg-[#212121] border border-[#2a2a2a] w-full px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>
              
              <div>
                <label htmlFor="institution" className="block text-sm text-gray-400 mb-2">
                  Instituição
                </label>
                <input
                  id="institution"
                  type="text"
                  defaultValue="Hospital Central"
                  className="bg-[#212121] border border-[#2a2a2a] w-full px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>
            </div>
            
            <div>
              <button type="button" className="bg-white text-[#121212] px-4 py-2 rounded-md hover:bg-gray-200 hover-effect">
                Salvar alterações
              </button>
            </div>
          </form>
        </section>
        
        {/* Notification Preferences */}
        <section className="bg-[#1a1a1a] rounded-lg shadow-lg card-elevation p-6">
          <h2 className="font-serif text-xl font-medium mb-6">Notificações</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 hover:bg-[#212121] rounded-md">
              <div>
                <p className="font-medium">Novos artigos</p>
                <p className="text-sm text-gray-400">Notificações quando novos artigos forem publicados</p>
              </div>
              <div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.newArticles}
                    onChange={() => handleNotificationChange('newArticles')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#333333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-status-green"></div>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 hover:bg-[#212121] rounded-md">
              <div>
                <p className="font-medium">Resumo semanal</p>
                <p className="text-sm text-gray-400">Receber um resumo dos artigos mais lidos da semana</p>
              </div>
              <div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.weeklyDigest}
                    onChange={() => handleNotificationChange('weeklyDigest')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#333333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-status-green"></div>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 hover:bg-[#212121] rounded-md">
              <div>
                <p className="font-medium">Eventos especiais</p>
                <p className="text-sm text-gray-400">Notificações sobre webinars e eventos acadêmicos</p>
              </div>
              <div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.specialEvents}
                    onChange={() => handleNotificationChange('specialEvents')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#333333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-status-green"></div>
                </label>
              </div>
            </div>
          </div>
        </section>
        
        {/* Display Preferences */}
        <section className="bg-[#1a1a1a] rounded-lg shadow-lg card-elevation p-6">
          <h2 className="font-serif text-xl font-medium mb-6">Preferências de exibição</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-3 hover:bg-[#212121] rounded-md">
              <div>
                <p className="font-medium">Modo escuro</p>
                <p className="text-sm text-gray-400">Ativar tema escuro na interface</p>
              </div>
              <div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={displayPrefs.darkMode}
                    onChange={() => handleDisplayPrefChange('darkMode', !displayPrefs.darkMode)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#333333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-status-green"></div>
                </label>
              </div>
            </div>
            
            <div className="p-3 hover:bg-[#212121] rounded-md">
              <p className="font-medium mb-2">Tamanho da fonte</p>
              <p className="text-sm text-gray-400 mb-4">Ajustar o tamanho da fonte nos artigos</p>
              
              <div className="flex space-x-4">
                {['small', 'medium', 'large'].map((size) => (
                  <button
                    key={size}
                    onClick={() => handleDisplayPrefChange('fontSize', size)}
                    className={`px-4 py-2 rounded-md ${
                      displayPrefs.fontSize === size
                        ? 'bg-white text-[#121212]'
                        : 'bg-[#212121] text-gray-300 hover:bg-[#2a2a2a]'
                    } hover-effect`}
                  >
                    {size === 'small' ? 'Pequena' : size === 'medium' ? 'Média' : 'Grande'}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 hover:bg-[#212121] rounded-md">
              <div>
                <p className="font-medium">Mostrar resumos</p>
                <p className="text-sm text-gray-400">Exibir resumos dos artigos na lista</p>
              </div>
              <div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={displayPrefs.showAbstract}
                    onChange={() => handleDisplayPrefChange('showAbstract', !displayPrefs.showAbstract)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#333333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-status-green"></div>
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button className="bg-white text-[#121212] px-4 py-2 rounded-md hover:bg-gray-200 hover-effect">
              Aplicar preferências
            </button>
          </div>
        </section>
        
        {/* Security Section */}
        <section className="bg-[#1a1a1a] rounded-lg shadow-lg card-elevation p-6">
          <h2 className="font-serif text-xl font-medium mb-6">Segurança</h2>
          
          <div className="space-y-6">
            <div>
              <p className="font-medium mb-2">Alterar senha</p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm text-gray-400 mb-2">
                    Senha atual
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    className="bg-[#212121] border border-[#2a2a2a] w-full px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm text-gray-400 mb-2">
                    Nova senha
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    className="bg-[#212121] border border-[#2a2a2a] w-full px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm text-gray-400 mb-2">
                    Confirmar nova senha
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="bg-[#212121] border border-[#2a2a2a] w-full px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-white"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <button className="bg-white text-[#121212] px-4 py-2 rounded-md hover:bg-gray-200 hover-effect">
                  Atualizar senha
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
