
import React from 'react';
import { ChevronRight } from 'lucide-react';

// Mock data for featured and recent articles
const featuredArticles = [
  {
    id: '1',
    title: 'Impactos do uso prolongado de inibidores de bomba de prótons',
    description: 'Uma análise detalhada dos efeitos a longo prazo do uso de IBPs no tratamento de doenças gástricas.',
    image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&q=80&w=1200',
    category: 'Gastroenterologia',
    date: '2024-04-15'
  },
  // ... more articles
];

const recentArticles = [
  {
    id: '2',
    title: 'Avanços no tratamento de diabetes tipo 2',
    category: 'Endocrinologia',
    progress: 45,
    image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800',
  },
  // ... more articles
];

const popularCategories = [
  {
    name: 'Cardiologia',
    count: 24,
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800',
  },
  // ... more categories
];

const Dashboard = () => {
  return (
    <div className="p-6 space-y-8">
      {/* Hero Carousel */}
      <section className="relative h-[400px] rounded-xl overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={featuredArticles[0].image} 
            alt={featuredArticles[0].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <span className="text-sm text-gray-300">{featuredArticles[0].category}</span>
          <h1 className="mt-2 text-4xl font-serif font-medium leading-tight">
            {featuredArticles[0].title}
          </h1>
          <p className="mt-4 text-gray-200 max-w-2xl">
            {featuredArticles[0].description}
          </p>
        </div>
      </section>

      {/* Continue Reading Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif">Continue de Onde Parou</h2>
          <button className="text-sm text-gray-400 flex items-center hover:text-white transition-colors">
            Ver todos <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentArticles.map(article => (
            <div key={article.id} className="bg-[#1a1a1a] rounded-lg overflow-hidden group">
              <div className="relative h-48">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                  <div 
                    className="h-full bg-white"
                    style={{ width: `${article.progress}%` }}
                  />
                </div>
              </div>
              <div className="p-4">
                <span className="text-sm text-gray-400">{article.category}</span>
                <h3 className="mt-2 text-lg font-medium">{article.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif">Explorar por Categoria</h2>
          <button className="text-sm text-gray-400 flex items-center hover:text-white transition-colors">
            Ver todas <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {popularCategories.map(category => (
            <div 
              key={category.name}
              className="relative h-40 rounded-lg overflow-hidden group cursor-pointer"
            >
              <img 
                src={category.image} 
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <h3 className="text-xl font-serif text-white">{category.name}</h3>
                <span className="mt-2 text-sm text-gray-300">{category.count} artigos</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
