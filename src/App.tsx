import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import Layout from "./components/layout/layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthRedirect from "./pages/AuthRedirect";
import Calculadoras from "./pages/Calculadoras";
import AdicionalNoturno from "./pages/calculadoras/AdicionalNoturno";
import FeriasProporcionais from "./pages/calculadoras/FeriasProporcionais";
import DSR from "./pages/calculadoras/DSR";
import DecimoTerceiro from "./pages/calculadoras/DecimoTerceiro";
import BancoDeHoras from "./pages/calculadoras/BancoDeHoras";
import Rescisao from "./pages/calculadoras/Rescisao";
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
import AssinarPro from "./pages/AssinarPro";
import Sobre from "./pages/Sobre";
import Contato from "./pages/Contato";
import Termos from "./pages/Termos";
import Privacidade from "./pages/Privacidade";
import NotFound from "./pages/NotFound";
import MeuPerfil from "./pages/MeuPerfil";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    {/* 👇 basename usa a BASE_URL gerada pelo Vite (ex.: /cltfacil-com-78/) */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <Routes>
        {/* Widget sem layout */}
        <Route path="/widget/adicional-noturno" element={<Widget />} />

        {/* Auth sem layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth-redirect" element={<AuthRedirect />} />

        {/* Rotas com layout */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />

                <Route
                  path="/calculadoras"
                  element={
                    <ProtectedRoute>
                      <Calculadoras />
                    </ProtectedRoute>
                  }
                />

                {/* Calculadoras */}
                <Route path="/clt/adicional-noturno" element={<ProtectedRoute><AdicionalNoturno /></ProtectedRoute>} />
                <Route path="/clt/ferias-proporcionais" element={<ProtectedRoute><FeriasProporcionais /></ProtectedRoute>} />
                <Route path="/clt/dsr" element={<ProtectedRoute><DSR /></ProtectedRoute>} />
                <Route path="/clt/13o-proporcional" element={<ProtectedRoute><DecimoTerceiro /></ProtectedRoute>} />
                <Route path="/clt/banco-de-horas" element={<ProtectedRoute><BancoDeHoras /></ProtectedRoute>} />
                <Route path="/clt/rescisao" element={<ProtectedRoute><Rescisao /></ProtectedRoute>} />
                <Route path="/clt/salario-liquido" element={<ProtectedRoute><SalarioLiquido /></ProtectedRoute>} />
                <Route path="/clt/inss" element={<ProtectedRoute><INSS /></ProtectedRoute>} />
                <Route path="/clt/irrf" element={<ProtectedRoute><IRRF /></ProtectedRoute>} />
                <Route path="/clt/fgts" element={<ProtectedRoute><FGTS /></ProtectedRoute>} />
                <Route path="/clt/horas-extras" element={<ProtectedRoute><HorasExtras /></ProtectedRoute>} />
                <Route path="/clt/dsr-comissoes" element={<ProtectedRoute><DSRComissoes /></ProtectedRoute>} />
                <Route path="/clt/periculosidade" element={<ProtectedRoute><Periculosidade /></ProtectedRoute>} />
                <Route path="/clt/insalubridade" element={<ProtectedRoute><Insalubridade /></ProtectedRoute>} />
                <Route path="/clt/ferias-abono" element={<ProtectedRoute><FeriasAbono /></ProtectedRoute>} />
                <Route path="/clt/ferias-dobro" element={<ProtectedRoute><FeriasDobro /></ProtectedRoute>} />
                <Route path="/clt/aviso-previo" element={<ProtectedRoute><AvisoPrevio /></ProtectedRoute>} />
                <Route path="/clt/vale-transporte" element={<ProtectedRoute><ValeTransporte /></ProtectedRoute>} />

                {/* SEO-friendly aliases */}
                <Route path="/calculadora-rescisao" element={<ProtectedRoute><Rescisao /></ProtectedRoute>} />
                <Route path="/calculadora-horas-extras" element={<ProtectedRoute><HorasExtras /></ProtectedRoute>} />
                <Route path="/calculadora-dsr" element={<ProtectedRoute><DSR /></ProtectedRoute>} />
                <Route path="/calculadora-adicional-noturno" element={<ProtectedRoute><AdicionalNoturno /></ProtectedRoute>} />

                {/* 🔓 Assinar PRO – sem ProtectedRoute */}
                <Route path="/assinar-pro" element={<AssinarPro />} />

                {/* 🔐 Meu Perfil – com ProtectedRoute */}
                <Route path="/meu-perfil" element={<ProtectedRoute><MeuPerfil /></ProtectedRoute>} />

                <Route path="/debug-calculadoras" element={<DebugCalculadoras />} />
                <Route path="/sobre" element={<Sobre />} />
                <Route path="/contato" element={<Contato />} />
                <Route path="/termos" element={<Termos />} />
                <Route path="/privacidade" element={<Privacidade />} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
