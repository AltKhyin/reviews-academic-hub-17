
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white">
      <div className="text-center max-w-md p-6">
        <h1 className="font-serif text-6xl font-medium mb-4">404</h1>
        <p className="text-xl text-gray-300 mb-6">Página não encontrada</p>
        <p className="text-gray-400 mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link
          to="/"
          className="inline-block bg-white text-[#121212] px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
