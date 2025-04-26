import React from 'react';
import FeaturedArticle from '@/components/dashboard/FeaturedArticle';
import ArticleRow from '@/components/dashboard/ArticleRow';

// Use the uploaded images for our articles
const articleImages = [
  "public/lovable-uploads/ba82f429-8498-4176-8abd-279367caaf35.png",
  "public/lovable-uploads/8c6aee29-8c15-4492-98f3-b393030acf76.png",
  "public/lovable-uploads/c9dce0ac-483c-48cf-b855-bb44ff08755e.png",
  "public/lovable-uploads/16f91f11-7e2a-4785-a90c-970bab8b1726.png",
  "public/lovable-uploads/2c9a1ed0-f4b0-455c-be83-093401f2fc28.png",
  "public/lovable-uploads/af8f6030-7cde-46c3-b7cf-632fba1640f0.png",
  "public/lovable-uploads/a75fa39a-5ddd-4d50-bebb-f4fcb9f9e441.png",
  "public/lovable-uploads/e5d4c469-741d-449d-ac1f-5c65dd1b43cc.png",
  "public/lovable-uploads/930dd9fe-24b2-4eaa-b650-5d9b972365c1.png",
  "public/lovable-uploads/f91e147b-b75c-4526-be0d-1970386fc6f2.png",
  "public/lovable-uploads/01c4827b-95ef-42e7-af12-2dbb60c75f06.png",
];

// Mock data for medical articles
const featuredArticle = {
  id: '1',
  title: 'Impactos do uso prolongado de inibidores de bomba de prótons',
  description: 'Uma análise detalhada dos efeitos a longo prazo do uso de IBPs no tratamento de doenças gástricas.',
  image: articleImages[0],
  category: 'Gastroenterologia',
  date: '2024-04-15'
};

const recentArticles = [
  {
    id: '2',
    title: 'Avanços no tratamento de diabetes tipo 2',
    description: 'Novas pesquisas e abordagens terapêuticas que estão transformando o manejo do diabetes tipo 2.',
    category: 'Endocrinologia',
    image: articleImages[1],
  },
  {
    id: '3',
    title: 'Uso de anticoagulantes em pacientes cardiológicos',
    description: 'Revisão sistemática dos benefícios e riscos da terapia anticoagulante em diferentes perfis de pacientes.',
    category: 'Cardiologia',
    image: articleImages[2],
  },
  {
    id: '4',
    title: 'Novos protocolos para tratamento de DPOC',
    description: 'Atualização dos guidelines internacionais para o manejo da doença pulmonar obstrutiva crônica.',
    category: 'Pneumologia',
    image: articleImages[3],
  },
  {
    id: '5',
    title: 'Terapias inovadoras para doenças reumáticas',
    description: 'Avanços recentes em terapias biológicas e imunológicas para condições reumáticas inflamatórias.',
    category: 'Reumatologia',
    image: articleImages[4],
  },
  {
    id: '6',
    title: 'Nutrição e saúde mental: evidências recentes',
    description: 'O papel da alimentação na prevenção e tratamento de condições psiquiátricas como depressão e ansiedade.',
    category: 'Psiquiatria',
    image: articleImages[5],
  },
];

const recommendedArticles = [
  {
    id: '7',
    title: 'Novas diretrizes para o tratamento de hipertensão',
    description: 'Mudanças significativas nas recomendações para diagnóstico e tratamento da hipertensão arterial.',
    category: 'Cardiologia',
    image: articleImages[6],
  },
  {
    id: '8',
    title: 'Abordagens atualizadas para o manejo da dor crônica',
    description: 'Estratégias multidisciplinares e personalizadas para o tratamento eficaz da dor persistente.',
    category: 'Anestesiologia',
    image: articleImages[7],
  },
  {
    id: '9',
    title: 'O papel dos probióticos na saúde digestiva',
    description: 'Análise das evidências científicas sobre o uso de probióticos para diferentes condições gastrointestinais.',
    category: 'Gastroenterologia',
    image: articleImages[8],
  },
  {
    id: '10',
    title: 'Biomarcadores e medicina personalizada em oncologia',
    description: 'Como os biomarcadores estão revolucionando o diagnóstico precoce e o tratamento individualizado do câncer.',
    category: 'Oncologia',
    image: articleImages[9],
  },
  {
    id: '11',
    title: 'Demência precoce: diagnóstico e intervenções',
    description: 'Avanços no reconhecimento e intervenção terapêutica em estágios iniciais de doenças neurodegenerativas.',
    category: 'Neurologia',
    image: articleImages[10],
  },
];

const Dashboard = () => {
  return (
    <div className="pt-4 pb-16 space-y-8">
      <FeaturedArticle article={featuredArticle} />
      <ArticleRow title="Edições Recentes" articles={recentArticles} />
      <ArticleRow title="Recomendados Para Você" articles={recommendedArticles} />
    </div>
  );
};

export default Dashboard;
