
// ABOUTME: Enhanced reviewer quote block with comprehensive inline settings and expert commentary
// Supports rich quote formatting, author credentials, institutional info, and visual customization

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineRichTextEditor } from '@/components/editor/inline/InlineRichTextEditor';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Quote, 
  User, 
  Upload, 
  Star,
  Award,
  BookOpen,
  MapPin,
  Mail,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewerQuoteProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
}

const quoteStyles = {
  default: 'border-l-4',
  enclosed: 'border',
  elevated: 'border shadow-lg',
  minimal: 'border-l-2'
};

const quoteSizes = {
  compact: {
    container: 'p-4',
    quote: 'text-base',
    author: 'text-sm',
    details: 'text-xs',
    avatar: 'w-8 h-8',
    icon: 'w-4 h-4'
  },
  normal: {
    container: 'p-6',
    quote: 'text-lg',
    author: 'text-base',
    details: 'text-sm',
    avatar: 'w-10 h-10',
    icon: 'w-5 h-5'
  },
  large: {
    container: 'p-8',
    quote: 'text-xl',
    author: 'text-lg',
    details: 'text-base',
    avatar: 'w-12 h-12',
    icon: 'w-6 h-6'
  }
};

const expertiseTypes = {
  physician: { label: 'Médico', icon: Award },
  researcher: { label: 'Pesquisador', icon: BookOpen },
  specialist: { label: 'Especialista', icon: Star },
  professor: { label: 'Professor', icon: BookOpen },
  consultant: { label: 'Consultor', icon: User }
};

export const ReviewerQuote: React.FC<ReviewerQuoteProps> = ({ 
  block, 
  readonly = false,
  onUpdate
}) => {
  const content = block.content;
  const quote = content.quote || '';
  const author = content.author || '';
  const title = content.title || '';
  const institution = content.institution || '';
  const avatarUrl = content.avatar_url || '';
  const expertiseType = content.expertise_type || 'physician';
  const credentials = content.credentials || '';
  const location = content.location || '';
  const email = content.email || '';
  const website = content.website || '';
  const quoteDate = content.quote_date || '';
  const context = content.context || '';
  const quoteStyle = content.quote_style || 'default';
  const size = content.size || 'normal';
  const showCredentials = content.show_credentials ?? true;
  const showLocation = content.show_location ?? false;
  const showContact = content.show_contact ?? false;
  const showContext = content.show_context ?? false;
  const showDate = content.show_date ?? false;
  const rating = content.rating || 0;
  const showRating = content.show_rating ?? false;

  // Color system integration
  const textColor = content.text_color || '#ffffff';
  const backgroundColor = content.background_color || '#1a1a1a';
  const borderColor = content.border_color || '#2a2a2a';
  const accentColor = content.accent_color || '#a855f7';
  const quoteColor = content.quote_color || textColor;
  const authorColor = content.author_color || textColor;

  const [imageError, setImageError] = useState(false);

  const handleUpdate = (field: string, value: any) => {
    if (onUpdate) {
      onUpdate({
        content: {
          ...content,
          [field]: value
        }
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const ExpertiseIcon = expertiseTypes[expertiseType]?.icon || Award;
  const sizeClasses = quoteSizes[size];
  const styleClasses = quoteStyles[quoteStyle];

  const cardStyle: React.CSSProperties = {
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    borderLeftColor: quoteStyle === 'default' || quoteStyle === 'minimal' ? accentColor : borderColor,
    color: textColor
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className="w-4 h-4"
        style={{ 
          color: i < rating ? '#fbbf24' : '#374151',
          fill: i < rating ? '#fbbf24' : 'none'
        }}
      />
    ));
  };

  if (readonly) {
    return (
      <div className="reviewer-quote-block my-8">
        <Card 
          className={cn("shadow-lg transition-all duration-200", styleClasses)}
          style={cardStyle}
        >
          <CardContent className={sizeClasses.container}>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div 
                  className={cn("rounded-full flex items-center justify-center", sizeClasses.icon)}
                  style={{ backgroundColor: `${accentColor}1a` }}
                >
                  <Quote 
                    className={sizeClasses.icon} 
                    style={{ color: accentColor }}
                  />
                </div>
              </div>

              <div className="flex-1 space-y-4">
                {/* Context */}
                {showContext && context && (
                  <div 
                    className={cn("italic", sizeClasses.details)}
                    style={{ color: textColor, opacity: 0.7 }}
                  >
                    <strong>Contexto:</strong> {context}
                  </div>
                )}

                {/* Quote */}
                <blockquote>
                  <div 
                    className={cn("italic leading-relaxed", sizeClasses.quote)}
                    style={{ color: quoteColor }}
                    dangerouslySetInnerHTML={{ __html: `"${quote}"` }}
                  />
                </blockquote>

                {/* Author Section */}
                <div className="flex items-start gap-3 pt-4 border-t" 
                     style={{ borderColor: borderColor }}>
                  
                  <Avatar className={sizeClasses.avatar}>
                    {avatarUrl && !imageError ? (
                      <AvatarImage 
                        src={avatarUrl} 
                        alt={author} 
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <AvatarFallback 
                        style={{ 
                          backgroundColor: accentColor,
                          color: '#ffffff'
                        }}
                      >
                        {author ? getInitials(author) : <User className={cn(sizeClasses.icon, "opacity-60")} />}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className={cn("font-semibold", sizeClasses.author)}
                        style={{ color: authorColor }}
                      >
                        {author}
                      </div>
                      
                      {showCredentials && credentials && (
                        <div className="flex items-center gap-1">
                          <ExpertiseIcon className="w-3 h-3" style={{ color: accentColor }} />
                          <span 
                            className={cn("font-medium", sizeClasses.details)}
                            style={{ color: accentColor }}
                          >
                            {credentials}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {title && (
                      <div 
                        className={cn("mt-1", sizeClasses.details)}
                        style={{ color: textColor, opacity: 0.8 }}
                      >
                        {title}
                      </div>
                    )}
                    
                    {institution && (
                      <div 
                        className={cn("mt-1", sizeClasses.details)}
                        style={{ color: textColor, opacity: 0.6 }}
                      >
                        {institution}
                      </div>
                    )}

                    {showLocation && location && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" style={{ color: textColor, opacity: 0.6 }} />
                        <span 
                          className={sizeClasses.details}
                          style={{ color: textColor, opacity: 0.6 }}
                        >
                          {location}
                        </span>
                      </div>
                    )}

                    {showRating && rating > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        {renderStars(rating)}
                      </div>
                    )}

                    {/* Contact Info */}
                    {showContact && (email || website) && (
                      <div className="flex gap-3 mt-2">
                        {email && (
                          <a 
                            href={`mailto:${email}`}
                            className="flex items-center gap-1 hover:opacity-80"
                            style={{ color: accentColor }}
                          >
                            <Mail className="w-3 h-3" />
                            <span className={sizeClasses.details}>Email</span>
                          </a>
                        )}
                        {website && (
                          <a 
                            href={website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:opacity-80"
                            style={{ color: accentColor }}
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className={sizeClasses.details}>Website</span>
                          </a>
                        )}
                      </div>
                    )}

                    {showDate && quoteDate && (
                      <div className="flex items-center gap-1 mt-2">
                        <Calendar className="w-3 h-3" style={{ color: textColor, opacity: 0.5 }} />
                        <span 
                          className={sizeClasses.details}
                          style={{ color: textColor, opacity: 0.5 }}
                        >
                          {quoteDate}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="reviewer-quote-block my-8 group relative">
      {/* Inline Settings */}
      <div className="absolute -top-2 -right-2 z-10">
        <InlineBlockSettings
          block={block}
          onUpdate={onUpdate}
        />
      </div>

      <div className="space-y-4">
        {/* Configuration Panel */}
        <div 
          className="p-4 rounded border space-y-4"
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderColor: '#2a2a2a'
          }}
        >
          {/* Style and Size Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
                Estilo da Citação
              </Label>
              <Select value={quoteStyle} onValueChange={(value) => handleUpdate('quote_style', value)}>
                <SelectTrigger 
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: textColor }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectItem value="default">Borda Esquerda</SelectItem>
                  <SelectItem value="enclosed">Envolvido</SelectItem>
                  <SelectItem value="elevated">Elevado</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
                Tamanho
              </Label>
              <Select value={size} onValueChange={(value) => handleUpdate('size', value)}>
                <SelectTrigger 
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: textColor }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectItem value="compact">Compacto</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
                Tipo de Especialista
              </Label>
              <Select value={expertiseType} onValueChange={(value) => handleUpdate('expertise_type', value)}>
                <SelectTrigger 
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: textColor }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  {Object.entries(expertiseTypes).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className="w-4 h-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Display Options */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-credentials"
                checked={showCredentials}
                onCheckedChange={(checked) => handleUpdate('show_credentials', checked)}
              />
              <Label htmlFor="show-credentials" className="text-xs" style={{ color: textColor }}>
                Credenciais
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-location"
                checked={showLocation}
                onCheckedChange={(checked) => handleUpdate('show_location', checked)}
              />
              <Label htmlFor="show-location" className="text-xs" style={{ color: textColor }}>
                Localização
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-contact"
                checked={showContact}
                onCheckedChange={(checked) => handleUpdate('show_contact', checked)}
              />
              <Label htmlFor="show-contact" className="text-xs" style={{ color: textColor }}>
                Contato
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-context"
                checked={showContext}
                onCheckedChange={(checked) => handleUpdate('show_context', checked)}
              />
              <Label htmlFor="show-context" className="text-xs" style={{ color: textColor }}>
                Contexto
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-date"
                checked={showDate}
                onCheckedChange={(checked) => handleUpdate('show_date', checked)}
              />
              <Label htmlFor="show-date" className="text-xs" style={{ color: textColor }}>
                Data
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-rating"
                checked={showRating}
                onCheckedChange={(checked) => handleUpdate('show_rating', checked)}
              />
              <Label htmlFor="show-rating" className="text-xs" style={{ color: textColor }}>
                Avaliação
              </Label>
            </div>
          </div>

          {/* Rating Control */}
          {showRating && (
            <div>
              <Label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
                Avaliação (1-5 estrelas)
              </Label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUpdate('rating', i + 1)}
                    className="p-1"
                  >
                    <Star
                      className="w-4 h-4"
                      style={{ 
                        color: i < rating ? '#fbbf24' : '#374151',
                        fill: i < rating ? '#fbbf24' : 'none'
                      }}
                    />
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Quote Card */}
        <Card 
          className={cn("shadow-lg transition-all duration-200", styleClasses)}
          style={cardStyle}
        >
          <CardContent className={sizeClasses.container}>
            <div className="flex gap-4">
              {/* Quote Icon */}
              <div className="flex-shrink-0">
                <div 
                  className={cn("rounded-full flex items-center justify-center", sizeClasses.icon)}
                  style={{ backgroundColor: `${accentColor}1a` }}
                >
                  <Quote 
                    className={sizeClasses.icon} 
                    style={{ color: accentColor }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-4">
                {/* Context Editor */}
                {showContext && (
                  <div>
                    <Label className="text-xs font-medium mb-1 block" style={{ color: textColor, opacity: 0.8 }}>
                      Contexto da Citação
                    </Label>
                    <InlineTextEditor
                      value={context}
                      onChange={(value) => handleUpdate('context', value)}
                      placeholder="Contexto ou situação da citação..."
                      className={cn("italic", sizeClasses.details)}
                      style={{ color: textColor, opacity: 0.7 }}
                    />
                  </div>
                )}

                {/* Quote Editor */}
                <blockquote>
                  <InlineRichTextEditor
                    value={quote}
                    onChange={(value) => handleUpdate('quote', value)}
                    placeholder="Digite a citação aqui..."
                    className={cn("italic leading-relaxed", sizeClasses.quote)}
                    style={{ color: quoteColor }}
                  />
                </blockquote>

                {/* Author Information */}
                <div className="flex items-start gap-3 pt-4 border-t" 
                     style={{ borderColor: borderColor }}>
                  
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className={sizeClasses.avatar}>
                      {avatarUrl && !imageError ? (
                        <AvatarImage 
                          src={avatarUrl} 
                          alt={author} 
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <AvatarFallback 
                          style={{ 
                            backgroundColor: accentColor,
                            color: '#ffffff'
                          }}
                        >
                          {author ? getInitials(author) : <User className={cn(sizeClasses.icon, "opacity-60")} />}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs p-1 h-auto opacity-60 hover:opacity-100"
                      onClick={() => {
                        // TODO: Implement avatar upload
                        console.log('Upload avatar');
                      }}
                    >
                      <Upload className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Author Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <InlineTextEditor
                        value={author}
                        onChange={(value) => handleUpdate('author', value)}
                        placeholder="Nome do autor"
                        className={cn("font-semibold", sizeClasses.author)}
                        style={{ color: authorColor }}
                      />
                      
                      {showCredentials && (
                        <div className="flex items-center gap-1">
                          <ExpertiseIcon className="w-3 h-3" style={{ color: accentColor }} />
                          <InlineTextEditor
                            value={credentials}
                            onChange={(value) => handleUpdate('credentials', value)}
                            placeholder="Credenciais"
                            className={cn("font-medium", sizeClasses.details)}
                            style={{ color: accentColor }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <InlineTextEditor
                      value={title}
                      onChange={(value) => handleUpdate('title', value)}
                      placeholder="Título/Cargo (opcional)"
                      className={sizeClasses.details}
                      style={{ color: textColor, opacity: 0.8 }}
                    />
                    
                    <InlineTextEditor
                      value={institution}
                      onChange={(value) => handleUpdate('institution', value)}
                      placeholder="Instituição (opcional)"
                      className={sizeClasses.details}
                      style={{ color: textColor, opacity: 0.6 }}
                    />

                    {/* Additional Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {/* Avatar URL */}
                      <Input
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => handleUpdate('avatar_url', e.target.value)}
                        placeholder="URL do avatar"
                        className="text-xs"
                        style={{ 
                          backgroundColor: '#212121',
                          borderColor: borderColor,
                          color: textColor
                        }}
                      />

                      {showLocation && (
                        <InlineTextEditor
                          value={location}
                          onChange={(value) => handleUpdate('location', value)}
                          placeholder="Localização"
                          className="text-xs"
                          style={{ color: textColor }}
                        />
                      )}

                      {showContact && (
                        <>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => handleUpdate('email', e.target.value)}
                            placeholder="Email"
                            className="text-xs"
                            style={{ 
                              backgroundColor: '#212121',
                              borderColor: borderColor,
                              color: textColor
                            }}
                          />
                          
                          <Input
                            type="url"
                            value={website}
                            onChange={(e) => handleUpdate('website', e.target.value)}
                            placeholder="Website"
                            className="text-xs"
                            style={{ 
                              backgroundColor: '#212121',
                              borderColor: borderColor,
                              color: textColor
                            }}
                          />
                        </>
                      )}

                      {showDate && (
                        <Input
                          type="date"
                          value={quoteDate}
                          onChange={(e) => handleUpdate('quote_date', e.target.value)}
                          className="text-xs"
                          style={{ 
                            backgroundColor: '#212121',
                            borderColor: borderColor,
                            color: textColor
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
