
import React, { useState } from 'react';
import { Bookmark, ThumbsDown, ThumbsUp, ChevronRight, ChevronLeft } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Mock data for medical articles
const featuredArticle = {
  id: '1',
  title: 'Impactos do uso prolongado de inibidores de bomba de prótons',
  description: 'Uma análise detalhada dos efeitos a longo prazo do uso de IBPs no tratamento de doenças gástricas.',
  image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&q=80&w=1200',
  category: 'Gastroenterologia',
  date: '2024-04-15'
};

const recentArticles = [
  {
    id: '2',
    title: 'Avanços no tratamento de diabetes tipo 2',
    category: 'Endocrinologia',
    image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '3',
    title: 'Uso de anticoagulantes em pacientes cardiológicos',
    category: 'Cardiologia',
    image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '4',
    title: 'Novos protocolos para tratamento de DPOC',
    category: 'Pneumologia',
    image: 'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '5',
    title: 'Terapias inovadoras para doenças reumáticas',
    category: 'Reumatologia',
    image: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '6',
    title: 'Nutrição e saúde mental: evidências recentes',
    category: 'Psiquiatria',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800',
  },
];

const recommendedArticles = [
  {
    id: '7',
    title: 'Novas diretrizes para o tratamento de hipertensão',
    category: 'Cardiologia',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '8',
    title: 'Abordagens atalizadas para o manejo da dor crônica',
    category: 'Anestesiologia',
    image: 'https://images.unsplash.com/photo-1600959907703-125ba0a688ed?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '9',
    title: 'O papel dos probióticos na saúde digestiva',
    category: 'Gastroenterologia',
    image: 'https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '10',
    title: 'Biomarcadores e medicina personalizada em oncologia',
    category: 'Oncologia',
    image: 'https://images.unsplash.com/photo-1579154392429-0e6b4e615afa?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '11',
    title: 'Demência precoce: diagnóstico e intervenções',
    category: 'Neurologia',
    image: 'https://images.unsplash.com/photo-1559757152-a0db245654b1?auto=format&fit=crop&q=80&w=800',
  },
];

// Article Card component with hover actions
const ArticleCard = ({ article }: { article: any }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative rounded-md overflow-hidden h-[360px] w-[202px] transition-transform duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img 
        src={article.image} 
        alt={article.title}
        className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? 'scale-105 brightness-50' : ''}`}
      />
      
      <div className="absolute inset-0 flex flex-col justify-between p-4">
        <div>
          <span className="text-xs font-medium text-gray-200 bg-black/40 px-2 py-1 rounded">
            {article.category}
          </span>
          
          {/* Bookmark button visible on hover */}
          {isHovered && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="absolute top-4 right-4 bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors">
                    <Bookmark size={16} className="text-white" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Salvar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div>
          <h3 className={`text-sm font-medium ${isHovered ? 'text-white' : 'text-transparent'} transition-colors duration-200`}>
            {article.title}
          </h3>
          
          {/* Rating buttons visible on hover */}
          {isHovered && (
            <div className="flex items-center justify-center gap-4 mt-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors">
                      <ThumbsUp size={16} strokeWidth={2} className="text-white" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Quero mais conteúdos assim</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors">
                      <ThumbsUp size={16} className="text-white" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Gostei</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors">
                      <ThumbsDown size={16} className="text-white" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Não tenho interesse no assunto</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ArticleRow component for displaying a row of articles
const ArticleRow = ({ title, articles }: { title: string, articles: any[] }) => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-serif mb-4 px-6">{title}</h2>
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {articles.map((article) => (
            <CarouselItem key={article.id} className="pl-4 md:basis-auto flex-shrink-0">
              <ArticleCard article={article} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </section>
  );
};

const Dashboard = () => {
  return (
    <div className="pt-4 pb-16 space-y-8">
      {/* Hero section - Spotlight Article */}
      <section className="w-full h-[500px] relative mb-12">
        <div className="absolute inset-0">
          <img 
            src={featuredArticle.image} 
            alt={featuredArticle.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>
        
        <div className="relative h-full flex items-center px-12 z-10">
          <div className="max-w-2xl text-white">
            <span className="text-sm font-medium text-gray-300 bg-black/40 px-2 py-1 rounded">
              {featuredArticle.category}
            </span>
            <h1 className="mt-4 text-5xl font-serif font-medium leading-tight">
              {featuredArticle.title}
            </h1>
            <p className="mt-4 text-lg text-gray-200 max-w-xl">
              {featuredArticle.description}
            </p>
            <button className="mt-8 bg-white text-black px-6 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors">
              Ler agora
            </button>
          </div>
        </div>
      </section>

      {/* Recent Editions */}
      <ArticleRow title="Edições Recentes" articles={recentArticles} />
      
      {/* Recommended For You */}
      <ArticleRow title="Recomendados Para Você" articles={recommendedArticles} />
    </div>
  );
};

export default Dashboard;
