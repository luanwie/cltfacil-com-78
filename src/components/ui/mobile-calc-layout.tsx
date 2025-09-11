import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MobileCalcLayoutProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}

export const MobileCalcLayout = ({ title, icon, children, className }: MobileCalcLayoutProps) => {
  return (
    <Card className={cn(
      "w-full mobile-card-spacing",
      "p-4 md:p-6", // Mobile-first padding
      className
    )}>
      <CardHeader className="px-0 pb-4 md:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          {icon}
          <span className="leading-tight">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 space-y-4 md:space-y-6 mobile-spacing">
        {children}
      </CardContent>
    </Card>
  );
};

interface MobileInputGroupProps {
  children: ReactNode;
  className?: string;
}

export const MobileInputGroup = ({ children, className }: MobileInputGroupProps) => {
  return (
    <div className={cn(
      "space-y-3 md:space-y-4", // Increased spacing on mobile
      className
    )}>
      {children}
    </div>
  );
};

interface MobileResultCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const MobileResultCard = ({ title, children, className }: MobileResultCardProps) => {
  return (
    <Card className={cn(
      "mobile-card-spacing bg-accent/50 border-accent-foreground/20",
      className
    )}>
      <CardHeader className="px-4 py-3 md:px-6 md:py-4">
        <CardTitle className="text-base md:text-lg text-accent-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-3 md:px-6 md:py-4 pt-0 space-y-3 md:space-y-4 mobile-result-spacing">
        {children}
      </CardContent>
    </Card>
  );
};

interface MobileResultRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
}

export const MobileResultRow = ({ label, value, highlight = false, className }: MobileResultRowProps) => {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4",
      "py-2 border-b border-border/50 last:border-b-0",
      highlight && "bg-primary/5 px-3 py-3 rounded-md border border-primary/20",
      className
    )}>
      <span className={cn(
        "text-sm md:text-base text-muted-foreground",
        highlight && "font-medium text-foreground"
      )}>
        {label}
      </span>
      <span className={cn(
        "text-base md:text-lg font-semibold",
        highlight && "text-primary text-lg md:text-xl"
      )}>
        {value}
      </span>
    </div>
  );
};

interface MobileButtonGroupProps {
  children: ReactNode;
  className?: string;
}

export const MobileButtonGroup = ({ children, className }: MobileButtonGroupProps) => {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row gap-3 sm:gap-4 w-full",
      "mt-6 md:mt-8", // Extra top margin for button groups
      className
    )}>
      {children}
    </div>
  );
};