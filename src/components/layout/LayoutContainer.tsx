
// ABOUTME: Dynamic layout container that applies customizable spacing and sizing
// Core component for the layout customization system

import React from 'react';
import { cn } from '@/lib/utils';
import { SpacingConfig, SizeConfig } from '@/types/layout';
import { generateSectionClasses } from '@/utils/layoutUtils';

interface LayoutContainerProps {
  children: React.ReactNode;
  sectionId?: string;
  padding?: SpacingConfig;
  margin?: SpacingConfig;
  size?: SizeConfig;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  centerContent?: boolean;
  background?: string;
}

export const LayoutContainer: React.FC<LayoutContainerProps> = ({
  children,
  sectionId,
  padding,
  margin,
  size,
  className = '',
  as: Component = 'div',
  centerContent = true,
  background = ''
}) => {
  // Generate the complete class string
  const layoutClasses = React.useMemo(() => {
    if (!padding || !margin || !size) {
      return className;
    }

    const baseClasses = centerContent ? 'mx-auto' : '';
    const additionalClasses = `${baseClasses} ${background} ${className}`.trim();
    
    return generateSectionClasses(padding, margin, size, additionalClasses);
  }, [padding, margin, size, className, centerContent, background]);

  return (
    <Component 
      className={cn(layoutClasses)}
      data-section-id={sectionId}
    >
      {children}
    </Component>
  );
};

// Specialized container for page-level layouts
interface PageLayoutContainerProps {
  children: React.ReactNode;
  globalPadding?: SpacingConfig;
  globalMargin?: SpacingConfig;
  globalSize?: SizeConfig;
  className?: string;
  minHeight?: string;
}

export const PageLayoutContainer: React.FC<PageLayoutContainerProps> = ({
  children,
  globalPadding,
  globalMargin,
  globalSize,
  className = '',
  minHeight = 'min-h-screen'
}) => {
  const pageClasses = React.useMemo(() => {
    if (!globalPadding || !globalMargin || !globalSize) {
      return cn(minHeight, className);
    }

    const layoutClasses = generateSectionClasses(
      globalPadding,
      globalMargin,
      globalSize,
      `${minHeight} ${className}`
    );

    return cn(layoutClasses);
  }, [globalPadding, globalMargin, globalSize, className, minHeight]);

  return (
    <div className={pageClasses}>
      {children}
    </div>
  );
};

// Higher-order component for wrapping sections with layout configuration
interface WithLayoutConfigProps {
  sectionId: string;
  fallbackPadding?: SpacingConfig;
  fallbackMargin?: SpacingConfig;
  fallbackSize?: SizeConfig;
  className?: string;
  background?: string;
}

export const withLayoutConfig = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return React.forwardRef<any, P & WithLayoutConfigProps>((props, ref) => {
    const {
      sectionId,
      fallbackPadding,
      fallbackMargin,
      fallbackSize,
      className = '',
      background = '',
      ...componentProps
    } = props;

    // In a real implementation, this would use the layout hook
    // For now, we'll use fallback values
    const padding = fallbackPadding;
    const margin = fallbackMargin;
    const size = fallbackSize;

    return (
      <LayoutContainer
        sectionId={sectionId}
        padding={padding}
        margin={margin}
        size={size}
        className={className}
        background={background}
      >
        <WrappedComponent {...(componentProps as P)} ref={ref} />
      </LayoutContainer>
    );
  });
};
