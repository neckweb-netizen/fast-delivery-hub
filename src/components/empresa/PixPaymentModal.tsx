import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, CheckCircle, QrCode, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plano: {
    id: string;
    nome: string;
    preco_mensal: number;
  };
}

export const PixPaymentModal = ({ isOpen, onClose, plano }: PixPaymentModalProps) => {
  const [documento, setDocumento] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState<'CPF' | 'CNPJ'>('CPF');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('pix');
  const [cardPaymentLoading, setCardPaymentLoading] = useState(false);
  
  const { toast } = useToast();
  const { profile } = useAuth();

  // Inicializar Mercado Pago SDK
  React.useEffect(() => {
    initMercadoPago('TEST-c9267c95-0402-4969-b163-b0c0456e33a7');
  }, []);

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  };

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
      .slice(0, 18);
  };

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = tipoDocumento === 'CPF' 
      ? formatCPF(e.target.value) 
      : formatCNPJ(e.target.value);
    setDocumento(formatted);
  };

  const handleTipoDocumentoChange = (value: 'CPF' | 'CNPJ') => {
    setTipoDocumento(value);
    setDocumento('');
  };

  const createPixPayment = async () => {
    if (!profile) {
      toast({
        title: 'Erro de autenticação',
        description: 'Faça login para continuar',
        variant: 'destructive',
      });
      return;
    }

    const documentoNumeros = documento.replace(/\D/g, '');
    const documentoValido = tipoDocumento === 'CPF' 
      ? documentoNumeros.length === 11 
      : documentoNumeros.length === 14;

    if (!documento || !documentoValido) {
      toast({
        title: `${tipoDocumento} inválido`,
        description: `Por favor, insira um ${tipoDocumento} válido`,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-pix-payment', {
        body: {
          planoId: plano.id,
          userInfo: {
            nome: profile?.nome || 'Usuário',
            email: profile?.email || '',
            documento: documento.replace(/\D/g, ''),
            tipoDocumento,
          },
        },
      });

      if (error) {
        console.error('Erro ao criar pagamento:', error);
        toast({
          title: 'Erro ao criar pagamento',
          description: 'Tente novamente em alguns instantes',
          variant: 'destructive',
        });
        return;
      }

      setPaymentData(data);
      toast({
        title: 'Pix gerado com sucesso!',
        description: 'Escaneie o QR Code ou copie o código para pagar.',
      });
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      toast({
        title: 'Erro ao processar pagamento',
        description: 'Tente novamente em alguns instantes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardPayment = async (formData: any) => {
    if (!profile) {
      toast({
        title: 'Erro de autenticação',
        description: 'Faça login para continuar',
        variant: 'destructive',
      });
      return;
    }

    setCardPaymentLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-card-payment', {
        body: {
          planoId: plano.id,
          userInfo: {
            email: profile.email,
            docType: formData.identificationType,
            docNumber: formData.identificationNumber,
          },
          cardToken: formData.token,
          installments: formData.installments || 1,
        },
      });

      if (error) throw error;

      if (data.status === 'approved') {
        toast({
          title: 'Pagamento aprovado!',
          description: 'Seu plano foi ativado com sucesso.',
        });
        handleClose();
      } else if (data.status === 'in_process') {
        toast({
          title: 'Pagamento em análise',
          description: 'Seu pagamento está sendo processado.',
        });
        handleClose();
      } else {
        toast({
          title: 'Pagamento não aprovado',
          description: 'Tente novamente ou use outro método de pagamento.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error processing card payment:', error);
      toast({
        title: 'Erro ao processar pagamento',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setCardPaymentLoading(false);
    }
  };

  const copyPixCode = () => {
    if (paymentData?.qr_code) {
      navigator.clipboard.writeText(paymentData.qr_code);
      setCopied(true);
      toast({
        title: 'Código copiado!',
        description: 'Cole no seu app de banco para pagar',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setPaymentData(null);
    setDocumento('');
    setTipoDocumento('CPF');
    setCopied(false);
    setActiveTab('pix');
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Pagamento do Plano
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pix" className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              PIX
            </TabsTrigger>
            <TabsTrigger value="card" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Cartão
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pix" className="space-y-6 mt-6">
            {!paymentData ? (
              <>
                <div className="space-y-2">
                  <h3 className="font-semibold">{plano.nome}</h3>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(plano.preco_mensal)}/mês
                  </p>
                </div>

                <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium">Dados do titular:</h4>
                  <div className="space-y-2">
                    <Label>Nome completo</Label>
                    <Input value={profile?.nome || ''} readOnly className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input value={profile?.email || ''} readOnly className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipoDocumento">Tipo de Documento *</Label>
                    <Select value={tipoDocumento} onValueChange={handleTipoDocumentoChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CPF">CPF (Pessoa Física)</SelectItem>
                        <SelectItem value="CNPJ">CNPJ (Pessoa Jurídica)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="documento">{tipoDocumento} *</Label>
                    <Input
                      id="documento"
                      placeholder={tipoDocumento === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
                      value={documento}
                      onChange={handleDocumentoChange}
                      maxLength={tipoDocumento === 'CPF' ? 14 : 18}
                    />
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={createPixPayment}
                  disabled={isLoading || !documento}
                >
                  {isLoading ? 'Gerando Pix...' : 'Gerar Pix'}
                </Button>
              </>
            ) : (
              <div className="space-y-6 text-center">
                <div>
                  <h3 className="font-semibold mb-2">Escaneie o QR Code</h3>
                  {paymentData.qr_code_base64 && (
                    <div className="flex justify-center mb-4">
                      <img 
                        src={`data:image/png;base64,${paymentData.qr_code_base64}`}
                        alt="QR Code Pix"
                        className="w-48 h-48 object-contain border rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Ou copie o código Pix:</Label>
                  <div className="flex gap-2">
                    <Input
                      value={paymentData.qr_code || ''}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyPixCode}
                    >
                      {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Valor: {formatCurrency(plano.preco_mensal)}
                </p>

                <Button onClick={handleClose} className="w-full">
                  Fechar
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="card" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">{plano.nome}</h3>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(plano.preco_mensal)}/mês
                </p>
              </div>

              <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-4">Informações do Pagamento:</h4>
                
                <div className="space-y-2">
                  <Label>Nome completo do titular</Label>
                  <Input 
                    value={profile?.nome || ''} 
                    readOnly 
                    className="bg-background" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input 
                    value={profile?.email || ''} 
                    readOnly 
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-4">
                  Preencha os dados do cartão abaixo:
                </p>
                <CardPayment
                  initialization={{ amount: plano.preco_mensal }}
                  onSubmit={handleCardPayment}
                  locale="pt-BR"
                />
              </div>

              {cardPaymentLoading && (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Processando pagamento...</span>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Pagamento seguro processado pelo Mercado Pago
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
