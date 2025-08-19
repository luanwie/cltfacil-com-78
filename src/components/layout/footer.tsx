import { Link } from "react-router-dom";
import { Calculator } from "lucide-react";
import Container from "@/components/ui/container";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted mt-20 border-t border-border">
      <Container>
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold text-foreground">CLT Fácil</span>
              </div>
              <p className="text-muted-foreground text-sm max-w-md">
                Calculadoras trabalhistas gratuitas para simplificar seus cálculos de CLT. 
                Ferramenta simples, rápida e confiável para trabalhadores e profissionais de RH.
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Calculadoras</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/calculadora-rescisao" className="text-muted-foreground hover:text-primary transition-colors">
                    Rescisão Trabalhista
                  </Link>
                </li>
                <li>
                  <Link to="/calculadora-horas-extras" className="text-muted-foreground hover:text-primary transition-colors">
                    Horas Extras
                  </Link>
                </li>
                <li>
                  <Link to="/calculadora-dsr" className="text-muted-foreground hover:text-primary transition-colors">
                    DSR
                  </Link>
                </li>
                <li>
                  <Link to="/calculadora-adicional-noturno" className="text-muted-foreground hover:text-primary transition-colors">
                    Adicional Noturno
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/sobre" className="text-muted-foreground hover:text-primary transition-colors">
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link to="/contato" className="text-muted-foreground hover:text-primary transition-colors">
                    Contato
                  </Link>
                </li>
                <li>
                  <Link to="/termos" className="text-muted-foreground hover:text-primary transition-colors">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link to="/privacidade" className="text-muted-foreground hover:text-primary transition-colors">
                    Privacidade
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} CLT Fácil. Todos os direitos reservados.
            </p>
            <p className="text-xs text-muted-foreground max-w-md text-center md:text-right">
              <strong>Aviso legal:</strong> As calculadoras oferecem estimativas baseadas na legislação atual. 
              Consulte sempre a CCT/ACT e legislação específica aplicável.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;