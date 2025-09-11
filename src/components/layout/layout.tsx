import Header from "./header";
import Footer from "./footer";
import { UsageTopBanner } from "@/components/ui/usage-top-banner";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-subtle">
      <UsageTopBanner />
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;