
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { CadastrarEmpresaDialog } from '@/components/profile/CadastrarEmpresaDialog';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthDialog = ({ open, onOpenChange }: AuthDialogProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        
        if (error) throw error;
        
        toast.success('Login realizado com sucesso!');
        onOpenChange(false);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nome: name,
            },
            emailRedirectTo: `${window.location.origin}/`
          },
        });
        
        if (error) throw error;
        
        toast.success('Conta criada com sucesso!');
        onOpenChange(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setShowPassword(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast.error('Digite seu email primeiro');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });
      
      if (error) throw error;
      
      toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[400px] p-4 sm:p-6">
        <VisuallyHidden>
          <DialogTitle>
            {isLogin ? 'Entrar na conta' : 'Criar nova conta'}
          </DialogTitle>
        </VisuallyHidden>
        
        <div className="space-y-4 sm:space-y-6">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold">
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isLogin 
                ? 'Acesse sua conta para continuar' 
                : 'Crie sua conta para começar'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                  className="h-10"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
            </Button>
          </form>

          {/* Login/Signup toggle and password reset */}
          <div className="text-center space-y-2">
            <button
              onClick={toggleMode}
              className="text-sm text-primary hover:underline"
              data-tutorial="create-account"
            >
              {isLogin 
                ? 'Não tem uma conta? Criar conta' 
                : 'Já tem uma conta? Entrar'
              }
            </button>
            
            {isLogin && (
              <div>
                <button
                  onClick={handlePasswordReset}
                  className="text-xs sm:text-sm text-muted-foreground hover:text-primary hover:underline"
                  disabled={loading}
                >
                  Esqueceu sua senha?
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3 sm:space-y-4">
            <Separator />
            
            <div className="text-center">
              <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                Tem uma empresa?
              </p>
              <CadastrarEmpresaDialog 
                variant="card"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
