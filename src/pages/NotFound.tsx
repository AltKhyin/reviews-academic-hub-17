
// ABOUTME: 404 page with consistent color system
// Uses app colors for proper visual identity

import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CSS_VARIABLES } from "@/utils/colorSystem";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: CSS_VARIABLES.PRIMARY_BG, color: CSS_VARIABLES.TEXT_PRIMARY }}
    >
      <div className="text-center max-w-md p-6">
        <h1 className="font-serif text-6xl font-medium mb-4" style={{ color: CSS_VARIABLES.TEXT_PRIMARY }}>
          404
        </h1>
        <p className="text-xl mb-6" style={{ color: CSS_VARIABLES.TEXT_SECONDARY }}>
          Página não encontrada
        </p>
        <p className="mb-8" style={{ color: CSS_VARIABLES.TEXT_MUTED }}>
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link
          to="/"
          className="inline-block px-4 py-2 rounded-md hover:opacity-90 transition-colors"
          style={{ 
            backgroundColor: CSS_VARIABLES.TEXT_PRIMARY, 
            color: CSS_VARIABLES.PRIMARY_BG 
          }}
        >
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
