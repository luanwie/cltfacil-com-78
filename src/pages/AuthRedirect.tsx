import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Calculator } from 'lucide-react';

const AuthRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    if (!loading) {
      if (user) {
        const redirectTo = searchParams.get('redirect') || '/calculadoras';
        navigate(redirectTo, { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [user, loading, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
      <div className="text-center space-y-4">
        <Calculator className="w-12 h-12 text-primary mx-auto animate-pulse" />
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">
            Redirecionando...
          </h1>
          <p className="text-muted-foreground">
            Aguarde enquanto verificamos sua autenticação
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthRedirect;