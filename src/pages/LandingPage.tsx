
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Users, 
  BookOpen, 
  MessageCircle,
  CheckCircle,
  ArrowRight,
  Instagram,
  MessageSquare
} from 'lucide-react';

const LandingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "Como funciona a sugestão de temas?",
      answer: "Nossa comunidade sugere temas relevantes através de um sistema de votação. Nossos especialistas avaliam as sugestões e priorizam aqueles com maior impacto clínico e interesse da comunidade."
    },
    {
      question: "E se eu não gostar?",
      answer: "Oferecemos 14 dias de garantia total. Se não ficar satisfeito, devolvemos 100% do valor pago, sem perguntas."
    },
    {
      question: "Quantos reviews são publicados?",
      answer: "Publicamos 2-3 reviews por semana, sempre focando em qualidade sobre quantidade. Cada review é cuidadosamente preparado para ser lido em até 10 minutos."
    },
    {
      question: "Posso cancelar quando quiser?",
      answer: "Sim, você pode cancelar sua assinatura a qualquer momento. Não há fidelidade ou multas por cancelamento."
    },
    {
      question: "O conteúdo é atualizado?",
      answer: "Sim, nosso conteúdo é constantemente atualizado com as mais recentes evidências científicas e discussões relevantes da comunidade médica."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-[#0E0E0E] text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-serif text-4xl md:text-6xl font-medium leading-tight mb-6">
                Evidência clínica, sem ruído.
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                2–3 reviews por semana. Leitura em até 10 minutos.
              </p>
              <Button 
                size="lg" 
                className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-4 mb-8"
              >
                Começar por R$ 24,90/mês
              </Button>
              
              {/* Seat Counter */}
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Vagas preenchidas</span>
                  <span className="text-sm font-medium">78 de 300</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-[#7E5BEF] h-2 rounded-full" style={{ width: '26%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-lg shadow-2xl p-6 transform rotate-3">
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
                <Badge className="bg-[#7E5BEF] text-white">Review Semanal</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-4 bg-[#F4F1EA]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-center mb-12 text-black">
            Cansado de ver opinião sem referência?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="font-semibold mb-4 text-red-600">Discussões típicas nas redes</h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-gray-100 p-3 rounded">
                    <strong>@usuario123:</strong> "Isso não funciona, tenho 20 anos de experiência"
                  </div>
                  <div className="bg-gray-100 p-3 rounded">
                    <strong>@medico_opiniao:</strong> "Discordo totalmente! Vi vários casos..."
                  </div>
                  <div className="bg-gray-100 p-3 rounded">
                    <strong>@especialista_autodenominado:</strong> "Vocês estão errados 🤦‍♂️"
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 border-[#7E5BEF] border-2">
              <CardContent className="p-0">
                <h3 className="font-semibold mb-4 text-[#7E5BEF]">Discussões no Reviews</h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                    <div className="flex items-center gap-2 mb-1">
                      <strong>Dr. Silva</strong>
                      <Badge variant="outline" className="text-xs">Cardiologista</Badge>
                    </div>
                    <p>"Interessante análise. O estudo XXXX (2023) corrobora esses achados."</p>
                    <div className="flex items-center gap-2 mt-2">
                      <ChevronUp className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-gray-600">12 upvotes</span>
                    </div>
                  </div>
                </div>
                <p className="text-center mt-4 font-medium text-[#7E5BEF]">
                  Aqui, cada argumento tem fonte.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-center mb-16">
            Como funciona
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#7E5BEF] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Especialistas escolhem</h3>
              <p className="text-gray-600">
                Nossa equipe de especialistas seleciona os estudos mais relevantes e impactantes da semana.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#7E5BEF] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Você recebe análise crítica</h3>
              <p className="text-gray-600">
                Receba um PDF conciso com análise crítica do estudo, pontos fortes e limitações.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#7E5BEF] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Debate com pares</h3>
              <p className="text-gray-600">
                Participe de discussões moderadas com outros profissionais, baseadas em evidências.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-[#F4F1EA]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <CardContent className="p-0">
                <MessageCircle className="h-12 w-12 text-[#7E5BEF] mx-auto mb-4" />
                <h3 className="font-semibold text-xl mb-3">Discussão que Evolui</h3>
                <p className="text-gray-600">
                  Sistema de upvotes prioriza argumentos com melhor fundamentação científica.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 text-center">
              <CardContent className="p-0">
                <CheckCircle className="h-12 w-12 text-[#7E5BEF] mx-auto mb-4" />
                <h3 className="font-semibold text-xl mb-3">Método à Vista</h3>
                <p className="text-gray-600">
                  Classificação GRADE e tags de limitação para transparência total do estudo.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 text-center">
              <CardContent className="p-0">
                <Star className="h-12 w-12 text-[#7E5BEF] mx-auto mb-4" />
                <h3 className="font-semibold text-xl mb-3">Curadoria Cirúrgica</h3>
                <p className="text-gray-600">
                  Apenas estudos com real impacto clínico passam pelo nosso filtro rigoroso.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Tour */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-center mb-4">
            Veja como funciona na prática
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Uma experiência pensada para profissionais que valorizam seu tempo
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-[#7E5BEF] to-purple-600 flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-white" />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Review Card</h3>
                <p className="text-sm text-gray-600">
                  Visualização clara do estudo com resumo executivo
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <ArrowRight className="h-16 w-16 text-white" />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Leitura Rápida</h3>
                <p className="text-sm text-gray-600">
                  Acesso direto ao PDF com análise crítica completa
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <MessageCircle className="h-16 w-16 text-white" />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Discussão Moderada</h3>
                <p className="text-sm text-gray-600">
                  Troca de experiências com base em evidências
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-[#F4F1EA]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-center mb-16">
            O que dizem nossos membros
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#7E5BEF] rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    AM
                  </div>
                  <div>
                    <h4 className="font-semibold">Dr. André Marques</h4>
                    <p className="text-sm text-gray-600">Cardiologista</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  "Finalmente posso me manter atualizado sem perder horas garimpando estudos. 
                  A curadoria é excepcional."
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#7E5BEF] rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    RC
                  </div>
                  <div>
                    <h4 className="font-semibold">Dra. Roberta Costa</h4>
                    <p className="text-sm text-gray-600">Endocrinologista</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  "As discussões aqui são de outro nível. Cada comentário agrega valor real 
                  à minha prática clínica."
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#7E5BEF] rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    PL
                  </div>
                  <div>
                    <h4 className="font-semibold">Dr. Paulo Lima</h4>
                    <p className="text-sm text-gray-600">Pneumologista</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  "Reviews claros, discussões embasadas e uma comunidade que realmente 
                  entende de medicina baseada em evidências."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl mb-12">
            Comece hoje mesmo
          </h2>
          
          <Card className="max-w-md mx-auto p-8 border-[#7E5BEF] border-2">
            <CardContent className="p-0">
              <Badge className="bg-[#7E5BEF] text-white mb-4">Plano Founder</Badge>
              
              <div className="mb-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <button
                    onClick={() => setIsAnnual(false)}
                    className={`px-4 py-2 rounded ${!isAnnual ? 'bg-[#7E5BEF] text-white' : 'bg-gray-100'}`}
                  >
                    Mensal
                  </button>
                  <button
                    onClick={() => setIsAnnual(true)}
                    className={`px-4 py-2 rounded ${isAnnual ? 'bg-[#7E5BEF] text-white' : 'bg-gray-100'}`}
                  >
                    Anual
                  </button>
                </div>
                
                <div className="text-4xl font-bold mb-2">
                  {isAnnual ? 'R$ 249' : 'R$ 24,90'}
                  <span className="text-lg font-normal text-gray-600">
                    {isAnnual ? '/ano' : '/mês'}
                  </span>
                </div>
                
                {isAnnual && (
                  <p className="text-green-600 font-medium">
                    Economize 2 meses
                  </p>
                )}
              </div>
              
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Acesso completo a todos os reviews
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Participação nas discussões
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Sugestão de temas
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  14 dias de garantia
                </li>
              </ul>
              
              <Button size="lg" className="w-full bg-black text-white hover:bg-gray-800 mb-4">
                Começar Agora
              </Button>
              
              <p className="text-xs text-gray-500">
                Enquanto manter assinatura ativa. Depois: R$34,90.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-[#F4F1EA]">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-center mb-16">
            Perguntas frequentes
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-semibold">{faq.question}</h3>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-[#7E5BEF]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#7E5BEF]" />
                  )}
                </button>
                
                {openFaq === index && (
                  <CardContent className="px-6 pb-6 pt-0">
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-[#0E0E0E] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl mb-8">
            Junte-se à nova forma de discutir ciência clínica em português.
          </h2>
          
          <Button size="lg" className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-4">
            Acessar agora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-serif text-2xl font-medium mb-2">Reviews.</h3>
              <p className="text-gray-400">por Igor Eckert</p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <a href="/policy" className="text-gray-400 hover:text-white transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Termos
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Contato
              </a>
            </div>
            
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <MessageSquare className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Reviews. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
