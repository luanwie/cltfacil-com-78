import { 
  Calculator, 
  Clock, 
  Users, 
  Wallet, 
  Calendar,
  Home,
  FileText,
  TrendingUp,
  Shield,
  AlertTriangle,
  Plane,
  Car,
  DollarSign,
  Bot
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"

const calculatorItems = [
  {
    title: "Salário Líquido",
    url: "/clt/salario-liquido",
    icon: Wallet,
    popular: true,
  },
  {
    title: "Rescisão Trabalhista",
    url: "/clt/rescisao",
    icon: FileText,
    popular: true,
  },
  {
    title: "Horas Extras",
    url: "/clt/horas-extras",
    icon: Clock,
    popular: true,
  },
  {
    title: "DSR",
    url: "/clt/dsr",
    icon: TrendingUp,
  },
  {
    title: "13º Proporcional",
    url: "/clt/13o-proporcional",
    icon: DollarSign,
  },
  {
    title: "Férias Proporcionais",
    url: "/clt/ferias-proporcionais",
    icon: Calendar,
  },
  {
    title: "Adicional Noturno",
    url: "/clt/adicional-noturno",
    icon: Clock,
  },
  {
    title: "INSS",
    url: "/clt/inss",
    icon: Shield,
  },
  {
    title: "IRRF",
    url: "/clt/irrf",
    icon: Calculator,
  },
  {
    title: "FGTS",
    url: "/clt/fgts",
    icon: Users,
  },
  {
    title: "Insalubridade",
    url: "/clt/insalubridade",
    icon: AlertTriangle,
  },
  {
    title: "Periculosidade",
    url: "/clt/periculosidade",
    icon: Shield,
  },
  {
    title: "Aviso Prévio",
    url: "/clt/aviso-previo",
    icon: FileText,
  },
  {
    title: "Vale Transporte",
    url: "/clt/vale-transporte",
    icon: Car,
  },
  {
    title: "Custo Funcionário",
    url: "/clt/custo-funcionario",
    icon: Users,
  },
]

const mainItems = [
  {
    title: "Início",
    url: "/",
    icon: Home,
  },
  {
    title: "Calculadoras",
    url: "/calculadoras",
    icon: Calculator,
  },
  {
    title: "IA CLT",
    url: "/ia-clt",
    icon: Bot,
  },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const { user } = useAuth()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" 
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
            CLT
          </div>
          {state !== "collapsed" && (
            <div>
              <h1 className="text-lg font-semibold text-sidebar-foreground">CLT Fácil</h1>
              <p className="text-xs text-sidebar-foreground/70">Cálculos Trabalhistas</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">Calculadoras CLT</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {calculatorItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {state !== "collapsed" && (
                        <div className="flex items-center justify-between w-full">
                          <span>{item.title}</span>
                          {item.popular && (
                            <Badge variant="secondary" className="text-xs bg-sidebar-primary/20 text-sidebar-primary-foreground">
                              Popular
                            </Badge>
                          )}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}