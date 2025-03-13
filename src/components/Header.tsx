
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 px-4 py-3 flex items-center justify-between z-50 transition-all duration-300",
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-white",
        className
      )}
    >
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold">Main CC Portal</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        {!isAuthenticated ? (
          <>
            <Button variant="ghost" size="sm">
              About
            </Button>
            <Button variant="ghost" size="sm">
              Features
            </Button>
          </>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout}
            className="hover:bg-muted transition-colors"
          >
            Logout
          </Button>
        )}
        
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-muted overflow-hidden transition-transform hover:scale-105">
          <UserCircle className="w-7 h-7 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
