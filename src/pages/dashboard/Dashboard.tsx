
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Mock data for articles
const recentArticles = [
  {
    id: '1',
    title: 'Impactos do uso prolongado de inibidores de bomba de prótons',
    topic: 'Gastroenterologia',
    date: '2023-10-12',
    imageUrl: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&q=80&w=300',
    status: 'new'
  },
  {
    id: '2',
    title: 'Análise comparativa: novos anticoagulantes vs. warfarina',
    topic: 'Cardiologia',
    date: '2023-10-08',
    imageUrl: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&q=80&w=300',
    status: 'viewed'
  },
  {
    id: '3',
    title: 'Meta-análise: eficácia de antidepressivos de nova geração',
    topic: 'Psiquiatria',
    date: '2023-10-05',
    imageUrl: 'https://images.unsplash.com/photo-1637877702828-a73783fabb9a?auto=format&fit=crop&q=80&w=300',
    status: 'popular'
  },
  {
    id: '4',
    title: 'Benefícios da terapia cognitiva comportamental em pacientes com dor crônica',
    topic: 'Neurologia',
    date: '2023-09-27',
    imageUrl: 'https://images.unsplash.com/photo-1576671414121-aa0c81c869e1?auto=format&fit=crop&q=80&w=300',
    status: 'viewed'
  },
];

const categories = [
  {
    name: 'Cardiologia',
    count: 24,
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=300',
  },
  {
    name: 'Endocrinologia',
    count: 18,
    imageUrl: 'https://images.unsplash.com/photo-1581595219265-c9e9049697bd?auto=format&fit=crop&q=80&w=300',
  },
  {
    name: 'Neurologia',
    count: 21,
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&q=80&w=300',
  },
  {
    name: 'Psiquiatria',
    count: 16,
    imageUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=300',
  },
];

// Status indicator component
const StatusIndicator = ({ status }: { status: string }) => {
  let color = '';
  let label = '';
  
  switch (status) {
    case 'new':
      color = 'bg-status-green';
      label = 'Novo';
      break;
    case 'popular':
      color = 'bg-status-amber';
      label = 'Popular';
      break;
    case 'viewed':
      color = 'bg-status-red';
      label = 'Visto';
      break;
    default:
      return null;
  }
  
  return (
    <div className="flex items-center">
      <span className={`${color} w-2 h-2 rounded-full mr-1`}></span>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
};

const ArticleCard = ({ article }: { article: typeof recentArticles[0] }) => {
  return (
    <Link 
      to={`/article/${article.id}`} 
      className="block group"
    >
      <div className="bg-[#1a1a1a] rounded-md overflow-hidden card-elevation transition-transform duration-300 group-hover:scale-[1.02]">
        <div className="relative h-36">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-3 left-3">
            <StatusIndicator status={article.status} />
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-serif text-lg font-medium line-clamp-2">{article.title}</h3>
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-400">{article.topic}</span>
            <span className="text-xs text-gray-400">{article.date}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const CategoryCard = ({ category }: { category: typeof categories[0] }) => {
  return (
    <Link 
      to={`/category/${category.name.toLowerCase()}`} 
      className="block group"
    >
      <div className="bg-[#1a1a1a] rounded-md overflow-hidden card-elevation transition-transform duration-300 group-hover:scale-[1.02]">
        <div className="relative h-24">
          <img 
            src={category.imageUrl} 
            alt={category.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h3 className="font-serif text-lg font-medium text-white">{category.name}</h3>
          </div>
        </div>
        <div className="p-3 text-center text-sm text-gray-400">
          {category.count} artigos
        </div>
      </div>
    </Link>
  );
};

const Dashboard: React.FC = () => {
  // Featured article (first one from recent)
  const featuredArticle = recentArticles[0];
  
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <section>
        <h2 className="font-serif text-2xl font-medium mb-6">Artigos em destaque</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Featured article */}
          <div className="lg:col-span-2">
            <Link 
              to={`/article/${featuredArticle.id}`} 
              className="block group"
            >
              <div className="relative h-80 rounded-md overflow-hidden card-elevation">
                <img 
                  src={featuredArticle.imageUrl} 
                  alt={featuredArticle.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="mb-2">
                    <StatusIndicator status={featuredArticle.status} />
                  </div>
                  <h3 className="font-serif text-xl md:text-2xl font-medium text-white mb-2">
                    {featuredArticle.title}
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">{featuredArticle.topic}</span>
                    <span className="text-sm text-gray-300">{featuredArticle.date}</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
          
          {/* Recent articles (excluding the featured one) */}
          <div className="space-y-6">
            {recentArticles.slice(1, 3).map((article) => (
              <div key={article.id} className="h-[calc(40%-12px)]">
                <Link 
                  to={`/article/${article.id}`} 
                  className="block group"
                >
                  <div className="bg-[#1a1a1a] rounded-md overflow-hidden card-elevation h-full flex">
                    <div className="w-1/3">
                      <div className="relative h-full">
                        <img 
                          src={article.imageUrl} 
                          alt={article.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="w-2/3 p-4 flex flex-col">
                      <h3 className="font-serif text-md font-medium line-clamp-2 group-hover:text-gray-200 transition-colors">
                        {article.title}
                      </h3>
                      <div className="mt-auto flex justify-between items-center">
                        <StatusIndicator status={article.status} />
                        <span className="text-xs text-gray-400">{article.date}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-2xl font-medium">Artigos recentes</h2>
          <Link to="/articles" className="text-sm text-gray-300 flex items-center hover:text-white hover-effect">
            Ver todos <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>
      
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-2xl font-medium">Explorar por especialidade</h2>
          <Link to="/categories" className="text-sm text-gray-300 flex items-center hover:text-white hover-effect">
            Ver todas <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.name} category={category} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
