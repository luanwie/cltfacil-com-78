import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: "Sobre", href: "/sobre" },
    { label: "Privacidade", href: "/privacidade" },
  ];

  const isActive = (href: string) => location.pathname === href;

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
            <Button asChild variant="hero" size="sm">
              <Link to="/calculadoras">Abrir Calculadoras</Link>
            </Button>
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
              <Button asChild variant="hero" size="sm" className="w-fit">
                <Link to="/calculadoras" onClick={() => setIsMenuOpen(false)}>
                  Abrir Calculadoras
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
};

export default Header;