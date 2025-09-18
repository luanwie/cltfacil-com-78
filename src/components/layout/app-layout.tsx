import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { User, Settings, LogOut, CreditCard } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AppLayoutProps {
  children: React.ReactNode;
}

const getBreadcrumbFromPath = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  
  const breadcrumbs = [
    { title: "Início", href: "/" }
  ];

  if (segments.length === 0) {
    return breadcrumbs;
  }

  if (segments[0] === "clt") {
    breadcrumbs.push({ title: "Calculadoras", href: "/calculadoras" });
    
    if (segments[1]) {
      const calculatorNames: Record<string, string> = {
        "salario-liquido": "Salário Líquido",
        "rescisao": "Rescisão Trabalhista",
        "horas-extras": "Horas Extras",
        "dsr": "DSR",
        "13o-proporcional": "13º Proporcional",
        "ferias-proporcionais": "Férias Proporcionais",
        "adicional-noturno": "Adicional Noturno",
        "inss": "INSS",
        "irrf": "IRRF",
        "fgts": "FGTS",
        "insalubridade": "Insalubridade",
        "periculosidade": "Periculosidade",
        "aviso-previo": "Aviso Prévio",
        "vale-transporte": "Vale Transporte",
        "custo-funcionario": "Custo Funcionário",
      };
      
      const calculatorName = calculatorNames[segments[1]] || segments[1];
      breadcrumbs.push({ title: calculatorName, href: pathname });
    }
  } else if (segments[0] === "calculadoras") {
    breadcrumbs.push({ title: "Calculadoras", href: "/calculadoras" });
  } else if (segments[0] === "ia-clt") {
    breadcrumbs.push({ title: "IA CLT", href: "/ia-clt" });
  } else if (segments[0] === "meu-perfil") {
    breadcrumbs.push({ title: "Meu Perfil", href: "/meu-perfil" });
  } else if (segments[0] === "calculos-salvos") {
    breadcrumbs.push({ title: "Cálculos Salvos", href: "/calculos-salvos" });
  }

  return breadcrumbs;
};

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const breadcrumbs = getBreadcrumbFromPath(location.pathname);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao fazer logout.",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbs.map((breadcrumb, index) => (
                      <React.Fragment key={breadcrumb.href}>
                        <BreadcrumbItem>
                          {index === breadcrumbs.length - 1 ? (
                            <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink href={breadcrumb.href}>
                              {breadcrumb.title}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-4">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getUserInitials(user.user_metadata?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          {user.user_metadata?.full_name && (
                            <p className="font-medium">{user.user_metadata.full_name}</p>
                          )}
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/meu-perfil")}>
                        <User className="mr-2 h-4 w-4" />
                        Meu Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/calculos-salvos")}>
                        <Settings className="mr-2 h-4 w-4" />
                        Cálculos Salvos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/assinar-pro")}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Assinar PRO
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button onClick={() => navigate("/login")}>
                    Entrar
                  </Button>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;