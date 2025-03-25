
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="glass-panel p-10 text-center max-w-md mx-auto">
        <h1 className="text-6xl font-bold mb-4 text-aviator-red">404</h1>
        <p className="text-xl text-gray-700 mb-6">Oops! Page not found</p>
        <Button 
          className="bg-aviator-lightBlue hover:bg-aviator-lightBlue/90 text-white"
          onClick={() => window.location.href = "/"}
        >
          Return to Game
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
