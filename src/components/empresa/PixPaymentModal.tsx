import React, { useState, useEffect } from 'react';
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
import { 
  initMercadoPago, 
  CardNumber, 
  SecurityCode, 
  ExpirationDate,
  createCardToken 
} from '@mercadopago/sdk-react';

// Inicializar SDK do Mercado Pago
initMercadoPago('TEST-c9267c95-0402-4969-b163-b0c0456e33a7', {
  locale: 'pt-BR'
});

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
  const [cardholderName, setCardholderName] = useState('');
  const [cardholderEmail, setCardholderEmail] = useState('');
  const [identificationType, setIdentificationType] = useState<'CPF' | 'CNPJ'>('CPF');
  const [identificationNumber, setIdentificationNumber] = useState('');
  
  const { toast } = useToast();
  const { profile } = useAuth();

  // Preencher email automaticamente
  useEffect(() => {
    if (profile?.email) {
      setCardholderEmail(profile.email);
    }
    if (profile?.nome) {
      setCardholderName(profile.nome);
    }
  }, [profile]);

  // Cleanup
  useEffect(() => {
    return () => {
      setCardholderName('');
      setCardholderEmail('');
      setIdentificationNumber('');
    };
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

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast({
        title: 'Erro de autenticação',
        description: 'Faça login para continuar',
        variant: 'destructive',
      });
      return;
    }

    // Validações
    if (!cardholderName || !cardholderEmail || !identificationNumber) {
      toast({
        title: 'Preencha todos os campos',
        description: 'Todos os campos são obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    setCardPaymentLoading(true);

    try {
      console.log('[MP] Criando token do cartão...');
      
      // Criar token do cartão
      const cardToken = await createCardToken({
        cardholderName,
        identificationType,
        identificationNumber: identificationNumber.replace(/\D/g, ''),
      });

      if (!cardToken || !cardToken.id) {
        throw new Error('Não foi possível criar o token do cartão. Verifique os dados e tente novamente.');
      }

      console.log('[MP] Token criado com sucesso:', cardToken.id);

      const { data, error } = await supabase.functions.invoke('create-card-payment', {
        body: {
          planoId: plano.id,
          userInfo: {
            email: cardholderEmail,
            docType: identificationType,
            docNumber: identificationNumber.replace(/\D/g, ''),
          },
          cardToken: cardToken.id,
          installments: 1,
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
      console.error('[MP] Erro ao processar pagamento:', error);
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

  const formatDocument = (value: string, type: 'CPF' | 'CNPJ') => {
    const cleaned = value.replace(/\D/g, '');
    if (type === 'CPF') {
      return cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .slice(0, 14);
    } else {
      return cleaned
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
        .slice(0, 18);
    }
  };

  const handleClose = () => {
    setPaymentData(null);
    setDocumento('');
    setTipoDocumento('CPF');
    setCopied(false);
    setActiveTab('pix');
    setCardholderName('');
    setCardholderEmail('');
    setIdentificationNumber('');
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
            <form onSubmit={handleCardPayment} className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">{plano.nome}</h3>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(plano.preco_mensal)}/mês
                </p>
              </div>

              <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-4">Dados do titular:</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Nome completo do titular *</Label>
                  <Input 
                    id="cardholderName"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="Nome como está no cartão"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cardholderEmail">E-mail *</Label>
                  <Input 
                    id="cardholderEmail"
                    type="email"
                    value={cardholderEmail}
                    onChange={(e) => setCardholderEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="identificationType">Tipo de Documento *</Label>
                  <Select 
                    value={identificationType} 
                    onValueChange={(value: 'CPF' | 'CNPJ') => {
                      setIdentificationType(value);
                      setIdentificationNumber('');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CPF">CPF</SelectItem>
                      <SelectItem value="CNPJ">CNPJ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="identificationNumber">{identificationType} *</Label>
                  <Input 
                    id="identificationNumber"
                    value={identificationNumber}
                    onChange={(e) => setIdentificationNumber(formatDocument(e.target.value, identificationType))}
                    placeholder={identificationType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
                    maxLength={identificationType === 'CPF' ? 14 : 18}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-4">Dados do cartão:</h4>
                
                <div className="space-y-2">
                  <Label>Número do cartão *</Label>
                  <CardNumber placeholder="0000 0000 0000 0000" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Validade *</Label>
                    <ExpirationDate placeholder="MM/AA" />
                  </div>
                  <div className="space-y-2">
                    <Label>CVV *</Label>
                    <SecurityCode placeholder="123" />
                  </div>
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full" 
                disabled={cardPaymentLoading || !cardholderName || !cardholderEmail || !identificationNumber}
              >
                {cardPaymentLoading ? 'Processando...' : 'Pagar com Cartão'}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Pagamento seguro processado pelo Mercado Pago
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
