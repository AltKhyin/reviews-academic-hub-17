
// ABOUTME: Header component for the new home page - Monochromatic design compliant
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, TrendingUp, Clock, BookOpen } from 'lucide-react';

export const HomeHeader: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-background via-card to-secondary/20 dark:from-background dark:via-card dark:to-secondary/10">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <BookOpen className="w-8 h-8 text-foreground" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Central de Evidências
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Sua fonte confiável para análises científicas atualizadas, revisões sistemáticas e evidências baseadas em medicina
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="border-border bg-card/60 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Sparkles className="w-8 h-8 text-warning mx-auto mb-3" />
                <h3 className="font-semibold text-card-foreground mb-2">Evidências Curadas</h3>
                <p className="text-sm text-muted-foreground">
                  Análises rigorosas por especialistas qualificados
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-border bg-card/60 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-success mx-auto mb-3" />
                <h3 className="font-semibold text-card-foreground mb-2">Sempre Atualizado</h3>
                <p className="text-sm text-muted-foreground">
                  Conteúdo científico mais recente e relevante
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-border bg-card/60 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-card-foreground mb-2">Acesso Rápido</h3>
                <p className="text-sm text-muted-foreground">
                  Encontre informações essenciais em segundos
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
