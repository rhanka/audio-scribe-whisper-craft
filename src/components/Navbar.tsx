
import { Link } from "react-router-dom";
import { Headphones, Volume } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

export function Navbar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="bg-background/80 backdrop-blur-sm sticky top-0 z-10 border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphones className="h-6 w-6" />
            <span className="text-xl font-bold">AudioScribe</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className={cn(
                "px-3 py-2 rounded-md transition-colors flex items-center gap-2",
                isActive("/") 
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Headphones size={18} />
              <span>Transcription</span>
            </Link>
            <Link 
              to="/text-to-speech" 
              className={cn(
                "px-3 py-2 rounded-md transition-colors flex items-center gap-2",
                isActive("/text-to-speech") 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Volume size={18} />
              <span>Synthèse Vocale</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
