import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Calculator, LogOut, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Container from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();

  const navItems = [
    { label: "Sobre", href: "/sobre" },
    { label: "Privacidade", href: "/privacidade" },
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Calculator className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-foreground">CLT Fácil</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive(item.href) ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {(userProfile as any)?.is_pro && (
                    <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold">
                      <Crown className="h-3 w-3 mr-1" />
                      PRO
                    </Badge>
                  )}
                  {userProfile && (
                    <span className="text-sm text-muted-foreground">
                      Olá, {userProfile.nome}
                    </span>
                  )}
                </div>
                <Button asChild variant="hero" size="sm">
                  <Link to="/calculadoras">Calculadoras</Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild variant="hero" size="sm">
                  <Link to="/calculadoras">Abrir Calculadoras</Link>
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-border mt-4 pt-4">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive(item.href) ? "text-primary" : "text-muted-foreground"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    {(userProfile as any)?.is_pro && (
                      <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold">
                        <Crown className="h-3 w-3 mr-1" />
                        PRO
                      </Badge>
                    )}
                    {userProfile && (
                      <span className="text-sm text-muted-foreground">
                        Olá, {userProfile.nome}
                      </span>
                    )}
                  </div>
                  <Button asChild variant="hero" size="sm" className="w-fit">
                    <Link to="/calculadoras" onClick={() => setIsMenuOpen(false)}>
                      Calculadoras
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-fit gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Button asChild variant="ghost" size="sm" className="w-fit">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      Entrar
                    </Link>
                  </Button>
                  <Button asChild variant="hero" size="sm" className="w-fit">
                    <Link to="/calculadoras" onClick={() => setIsMenuOpen(false)}>
                      Abrir Calculadoras
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
};

export default Header;