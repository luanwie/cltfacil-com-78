import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import Layout from "./components/layout/layout";
import Index from "./pages/Index";
import Calculadoras from "./pages/Calculadoras";
import AdicionalNoturno from "./pages/calculadoras/AdicionalNoturno";
import AdicionalNoturnoCargoUF from "./pages/calculadoras/AdicionalNoturnoCargoUF";
import FeriasProporcionais from "./pages/calculadoras/FeriasProporcionais";
import DSR from "./pages/calculadoras/DSR";
import DecimoTerceiro from "./pages/calculadoras/DecimoTerceiro";
import BancoDeHoras from "./pages/calculadoras/BancoDeHoras";
import Rescisao from "./pages/calculadoras/Rescisao";
// Novas 12 calculadoras
import SalarioLiquido from "./pages/calculadoras/SalarioLiquido";
import INSS from "./pages/calculadoras/INSS";
import IRRF from "./pages/calculadoras/IRRF";
import FGTS from "./pages/calculadoras/FGTS";
import HorasExtras from "./pages/calculadoras/HorasExtras";
import DSRComissoes from "./pages/calculadoras/DSRComissoes";
import Periculosidade from "./pages/calculadoras/Periculosidade";
import Insalubridade from "./pages/calculadoras/Insalubridade";
import FeriasAbono from "./pages/calculadoras/FeriasAbono";
import FeriasDobro from "./pages/calculadoras/FeriasDobro";
import AvisoPrevio from "./pages/calculadoras/AvisoPrevio";
import ValeTransporte from "./pages/calculadoras/ValeTransporte";
import DebugCalculadoras from "./pages/DebugCalculadoras";
import Widget from "./pages/Widget";
import Sobre from "./pages/Sobre";
import Contato from "./pages/Contato";
import Termos from "./pages/Termos";
import Privacidade from "./pages/Privacidade";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Widget routes - sem layout */}
          <Route path="/widget/adicional-noturno" element={<Widget />} />
          
          {/* Rotas com layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/calculadoras" element={<Calculadoras />} />
                <Route path="/clt/adicional-noturno" element={<AdicionalNoturno />} />
                <Route path="/clt/adicional-noturno/:cargo/:uf" element={<AdicionalNoturnoCargoUF />} />
                <Route path="/clt/ferias-proporcionais" element={<FeriasProporcionais />} />
                <Route path="/clt/dsr" element={<DSR />} />
                <Route path="/clt/13o-proporcional" element={<DecimoTerceiro />} />
                <Route path="/clt/banco-de-horas" element={<BancoDeHoras />} />
                <Route path="/clt/rescisao" element={<Rescisao />} />
                {/* 12 novas calculadoras */}
                <Route path="/clt/salario-liquido" element={<SalarioLiquido />} />
                <Route path="/clt/inss" element={<INSS />} />
                <Route path="/clt/irrf" element={<IRRF />} />
                <Route path="/clt/fgts" element={<FGTS />} />
                <Route path="/clt/horas-extras" element={<HorasExtras />} />
                <Route path="/clt/dsr-comissoes" element={<DSRComissoes />} />
                <Route path="/clt/periculosidade" element={<Periculosidade />} />
                <Route path="/clt/insalubridade" element={<Insalubridade />} />
                <Route path="/clt/ferias-abono" element={<FeriasAbono />} />
                <Route path="/clt/ferias-dobro" element={<FeriasDobro />} />
                <Route path="/clt/aviso-previo" element={<AvisoPrevio />} />
                <Route path="/clt/vale-transporte" element={<ValeTransporte />} />
                {/* URLs SEO-friendly */}
                <Route path="/calculadora-rescisao" element={<Rescisao />} />
                <Route path="/calculadora-horas-extras" element={<HorasExtras />} />
                <Route path="/calculadora-dsr" element={<DSR />} />
                <Route path="/calculadora-adicional-noturno" element={<AdicionalNoturno />} />
                <Route path="/debug-calculadoras" element={<DebugCalculadoras />} />
                <Route path="/sobre" element={<Sobre />} />
                <Route path="/contato" element={<Contato />} />
                <Route path="/termos" element={<Termos />} />
                <Route path="/privacidade" element={<Privacidade />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;