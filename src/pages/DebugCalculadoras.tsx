import { Link } from "react-router-dom";
import Container from "@/components/ui/container";

const DebugCalculadoras = () => {
  const calculadoras = [
    { title: "Salário Líquido", href: "/clt/salario-liquido" },
    { title: "INSS Mensal", href: "/clt/inss" },
    { title: "IRRF Mensal", href: "/clt/irrf" },
    { title: "FGTS + Projeção", href: "/clt/fgts" },
    { title: "Horas Extras (50%/100%)", href: "/clt/horas-extras" },
    { title: "DSR sobre Comissões", href: "/clt/dsr-comissoes" },
    { title: "Periculosidade (30%)", href: "/clt/periculosidade" },
    { title: "Insalubridade (10/20/40%)", href: "/clt/insalubridade" },
    { title: "Férias + Abono (1/3)", href: "/clt/ferias-abono" },
    { title: "Férias em Dobro", href: "/clt/ferias-dobro" },
    { title: "Aviso Prévio", href: "/clt/aviso-previo" },
    { title: "Vale-Transporte (6%)", href: "/clt/vale-transporte" },
  ];

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold mb-6">Debug - 12 Novas Calculadoras</h1>
      <div className="grid gap-4">
        {calculadoras.map((calc) => (
          <div key={calc.href} className="p-4 border rounded-lg">
            <Link 
              to={calc.href} 
              className="text-primary hover:underline font-medium"
            >
              {calc.title} → {calc.href}
            </Link>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Link to="/calculadoras" className="text-primary hover:underline">
          ← Voltar para Calculadoras
        </Link>
      </div>
    </Container>
  );
};

export default DebugCalculadoras;