import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NoticeProps {
  children: React.ReactNode;
  variant?: "info" | "warning" | "success" | "error";
  className?: string;
}

const Notice = ({ children, variant = "info", className }: NoticeProps) => {
  const variants = {
    info: {
      container: "bg-accent border-accent-foreground/20 text-accent-foreground",
      icon: Info,
    },
    warning: {
      container: "bg-accent border-accent-foreground/20 text-accent-foreground",
      icon: AlertTriangle,
    },
    success: {
      container: "bg-accent border-accent-foreground/20 text-accent-foreground",
      icon: CheckCircle,
    },
    error: {
      container: "bg-accent border-accent-foreground/20 text-accent-foreground",
      icon: XCircle,
    },
  };

  const { container, icon: Icon } = variants[variant];

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-lg border text-sm",
      container,
      className
    )}>
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default Notice;