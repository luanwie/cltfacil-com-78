import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

const PageHeader = ({ title, description, className, children }: PageHeaderProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-muted-foreground max-w-3xl">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
};

export default PageHeader;