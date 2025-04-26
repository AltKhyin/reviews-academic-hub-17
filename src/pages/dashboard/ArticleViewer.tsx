
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useArticleView } from '@/hooks/useArticleView';
import { ArticleActions } from '@/components/article/ArticleActions';
import { CommentSection } from '@/components/comments/CommentSection';
import { useSidebar } from '@/components/ui/sidebar';

// Mock article data
const mockArticle = {
  id: '1',
  title: 'Impactos do uso prolongado de inibidores de bomba de prótons',
  author: 'Johnson et al.',
  journal: 'Journal of Gastroenterology',
  year: '2023',
  abstract: 'Os inibidores de bomba de prótons (IBP) estão entre os medicamentos mais prescritos mundialmente. Este artigo avalia os potenciais riscos associados ao uso prolongado de IBPs, incluindo deficiência de vitamina B12, hipomagnesemia, aumento do risco de fraturas, infecções entéricas e efeitos renais adversos. A análise de grandes estudos observacionais e meta-análises recentes sugere cautela na prescrição prolongada destes medicamentos.',
  reviewDate: '12 de outubro de 2023',
  reviewedBy: 'Igor Eckert',
  reviewContent: `
Os inibidores da bomba de prótons (IBPs) representam uma classe de medicamentos amplamente prescrita e utilizada globalmente. Com sua eficácia comprovada no tratamento de distúrbios gastroesofágicos e sua disponibilidade tanto por prescrição médica quanto em formulações de venda livre, os IBPs se tornaram pilares no manejo de condições como doença do refluxo gastroesofágico (DRGE), úlceras pépticas e síndrome de Zollinger-Ellison.

Este artigo de Johnson et al. oferece uma revisão abrangente e equilibrada das evidências atuais sobre os potenciais efeitos adversos associados ao uso prolongado de IBPs. Os autores adotam uma abordagem metodológica rigorosa, analisando estudos observacionais de grande porte, ensaios clínicos randomizados e meta-análises recentes.

Pontos fortes:

1. Análise detalhada da plausibilidade biológica dos efeitos adversos reportados, incluindo os mecanismos pelos quais o uso de IBPs poderia levar à deficiência de nutrientes, alterações na microbiota intestinal e efeitos sistêmicos.

2. Discussão equilibrada dos dados epidemiológicos, reconhecendo tanto as associações significativas quanto as limitações metodológicas dos estudos observacionais que formam a base de muitas das preocupações de segurança.

3. Orientação clínica prática sobre monitoramento de pacientes em terapia prolongada com IBPs, oferecendo recomendações baseadas em evidências para triagem e acompanhamento.

Limitações:

1. Apesar da análise abrangente, o artigo poderia se beneficiar de uma estratificação mais detalhada dos riscos por subpopulações específicas, como idosos, pacientes com comorbidades e aqueles em politerapia.

2. A discussão sobre alternativas terapêuticas para pacientes de alto risco poderia ser mais robusta, incluindo protocolos de descontinuação gradual e estratégias de tratamento alternativas.

Implicações clínicas:

Este artigo reforça a importância da prescrição criteriosa de IBPs, seguindo o princípio de "dose mínima efetiva pelo menor tempo necessário". Médicos devem regularmente reavaliar a necessidade contínua do tratamento com IBPs, especialmente em pacientes idosos e naqueles com múltiplas comorbidades.

As evidências apresentadas suportam a necessidade de monitoramento periódico de níveis de vitamina B12, magnésio e densidade óssea em pacientes em uso prolongado de IBPs. Adicionalmente, é fundamental a educação dos pacientes sobre o uso apropriado destes medicamentos quando obtidos sem prescrição médica.

Em conclusão, este trabalho representa uma contribuição valiosa para a literatura médica sobre a segurança de IBPs, promovendo uma abordagem cautelosa e individualizada na prescrição prolongada destes medicamentos sem alimentar alarmismo injustificado.
  `,
  pdfUrl: 'https://example.com/article.pdf',
};

const ArticleViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [viewMode, setViewMode] = useState<'dual' | 'review' | 'original'>('dual');
  const article = mockArticle;
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  
  // Track article view
  useArticleView(id!);
  
  const handleViewModeChange = (mode: 'dual' | 'review' | 'original') => {
    setViewMode(mode);
  };
  
  return (
    <div className={`animate-fade-in pb-12 transition-all duration-300 ${isCollapsed ? 'max-w-[95%]' : 'max-w-[85%]'} mx-auto`}>
      <div className="mb-6">
        <div className="text-sm text-gray-400 mb-2">
          {article.journal} • {article.year}
        </div>
        <h1 className="font-serif text-3xl font-medium text-white mb-3">
          {article.title}
        </h1>
        <div className="text-sm text-gray-300 mb-4">
          Artigo original por {article.author}
        </div>
        <div className="text-sm text-gray-300 mb-6">
          Revisado por <span className="text-white">{article.reviewedBy}</span> em {article.reviewDate}
        </div>
        
        {/* Add ArticleActions component */}
        <div className="mt-4 mb-6">
          <ArticleActions articleId={id!} />
        </div>
        
        {/* View mode selector */}
        <div className="flex border-b border-[#2a2a2a] mb-8">
          <button
            onClick={() => handleViewModeChange('dual')}
            className={`px-4 py-2 text-sm hover-effect ${viewMode === 'dual' ? 'border-b-2 border-white text-white' : 'text-gray-400'}`}
          >
            Visualização dual
          </button>
          <button
            onClick={() => handleViewModeChange('review')}
            className={`px-4 py-2 text-sm hover-effect ${viewMode === 'review' ? 'border-b-2 border-white text-white' : 'text-gray-400'}`}
          >
            Apenas revisão
          </button>
          <button
            onClick={() => handleViewModeChange('original')}
            className={`px-4 py-2 text-sm hover-effect ${viewMode === 'original' ? 'border-b-2 border-white text-white' : 'text-gray-400'}`}
          >
            Artigo original
          </button>
        </div>
      </div>
      
      <div className={`${viewMode === 'dual' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : ''}`}>
        {/* PDF Viewers - Made identical */}
        {(viewMode === 'dual' || viewMode === 'original') && (
          <div className="bg-[#1a1a1a] rounded-lg p-6 shadow-lg card-elevation mb-6 md:mb-0">
            <div className="mb-4">
              <h2 className="font-serif text-xl font-medium">Artigo Original</h2>
            </div>
            <div className="w-full h-[60vh] bg-[#121212] rounded-md">
              <iframe
                src={article.pdfUrl}
                className="w-full h-full rounded-md"
                title="Original Article PDF"
              />
            </div>
          </div>
        )}
        
        {(viewMode === 'dual' || viewMode === 'review') && (
          <div className="bg-[#1a1a1a] rounded-lg p-6 shadow-lg card-elevation">
            <div className="mb-4">
              <h2 className="font-serif text-xl font-medium">Revisão</h2>
            </div>
            <div className="w-full h-[60vh] bg-[#121212] rounded-md">
              <iframe
                src={article.pdfUrl}
                className="w-full h-full rounded-md"
                title="Review PDF"
              />
            </div>
          </div>
        )}
      </div>

      <CommentSection articleId={id!} />
    </div>
  );
};

export default ArticleViewer;
