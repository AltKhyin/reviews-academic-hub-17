
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: any;
  onProfileUpdated: () => Promise<void>;
}

export function EditProfileDialog({ open, onOpenChange, profile, onProfileUpdated }: EditProfileDialogProps) {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    specialty: profile?.specialty || '',
    bio: profile?.bio || '',
    website: profile?.website || '',
    location: profile?.location || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para atualizar seu perfil",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Atualiza o perfil do usuário
      await updateProfile(formData);
      
      // Atualiza os dados do perfil no contexto
      await onProfileUpdated();
      
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });
      
      // Fecha o dialog
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao atualizar o perfil:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar o perfil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] border-[#2a2a2a]">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">Editar perfil</DialogTitle>
          <DialogDescription>
            Atualize suas informações pessoais e profissionais
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome completo</Label>
              <Input 
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="bg-[#212121] border-[#2a2a2a]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidade</Label>
              <Input 
                id="specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                placeholder="Ex: Cardiologia, Pediatria, etc."
                className="bg-[#212121] border-[#2a2a2a]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea 
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Conte um pouco sobre você e sua experiência"
                className="bg-[#212121] border-[#2a2a2a] min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input 
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://seusite.com"
                className="bg-[#212121] border-[#2a2a2a]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <Input 
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="São Paulo, Brasil"
                className="bg-[#212121] border-[#2a2a2a]"
              />
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-[#2a2a2a]"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-white text-[#121212] hover:bg-gray-200"
            >
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
