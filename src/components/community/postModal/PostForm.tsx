
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Flair {
  id: string;
  name: string;
  color: string;
}

export interface PostFormData {
  title: string;
  content: string;
  flair_id: string;
}

interface PostFormProps {
  onSubmit: (data: PostFormData) => void;
  isSubmitting: boolean;
  flairs: Flair[];
  onCancel: () => void;
}

export const PostForm: React.FC<PostFormProps> = ({ 
  onSubmit, 
  isSubmitting, 
  flairs,
  onCancel
}) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<PostFormData>({
    defaultValues: {
      flair_id: flairs.length > 0 ? flairs[0].id : ''
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título <span className="text-red-500">*</span></Label>
        <Input
          id="title"
          placeholder="Digite um título para sua publicação"
          {...register('title', { required: 'O título é obrigatório' })}
        />
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Conteúdo</Label>
        <Textarea
          id="content"
          placeholder="Digite o conteúdo da sua publicação"
          rows={10}
          {...register('content')}
          className="min-h-[200px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="flair">Categoria <span className="text-red-500">*</span></Label>
        <Select 
          defaultValue={flairs.length > 0 ? flairs[0].id : undefined}
          onValueChange={(value) => setValue('flair_id', value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {flairs.map((flair) => (
              <SelectItem key={flair.id} value={flair.id}>
                <span 
                  className="inline-block w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: flair.color }} 
                />
                {flair.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.flair_id && <p className="text-red-500 text-sm">A categoria é obrigatória</p>}
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Publicando...' : 'Publicar'}
        </Button>
      </div>
    </form>
  );
};
