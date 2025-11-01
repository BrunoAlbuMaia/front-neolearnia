import { useState } from "react";
import { usePayments } from "../../hooks/usePayments";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { LoadingWrapper } from "../../components/ui/loading-wrapper";
import { useToast } from "../../hooks/use-toast";
import { 
  Check, 
  Crown, 
  Zap, 
  Sparkles, 
  Loader2,
  ArrowRight,
  Star,
  BookOpen,
  FileText,
  RefreshCw,
  Infinity,
  X
} from "lucide-react";
import { motion } from "framer-motion";

interface PlanLimits {
  max_decks?: number | null; // null = ilimitado
  max_flashcards_per_deck?: number | null;
  can_review?: boolean;
  max_reviews_per_day?: number | null;
  can_export?: boolean;
  can_import?: boolean;
  ai_assistance?: boolean;
  priority_support?: boolean;
}

interface Plan {
  id: string;
  name: string;
  description: PlanLimits;
  price: number;
  frequency_type: string;
  features?: string[];
  popular?: boolean;
}

export default function PlansPage() {
  const { plans, loadingPlans, createCheckout } = usePayments();
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCheckout = async (planId: string) => {
    try {
      setProcessingPlanId(planId);
      const response = await createCheckout(planId);
      
      // O response pode ser uma string (URL) ou um objeto com propriedade url/checkout_url
      let checkoutUrl: string;
      if (typeof response === 'string') {
        checkoutUrl = response;
      } else if (response && typeof response === 'object') {
        checkoutUrl = (response as any).url || (response as any).checkout_url || (response as any).link;
      } else {
        throw new Error("URL de checkout não retornada");
      }
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl; // Redireciona para o Mercado Pago
      } else {
        throw new Error("URL de checkout inválida");
      }
    } catch (err: any) {
      toast({
        title: "Erro ao processar assinatura",
        description: err.message || "Não foi possível iniciar o checkout. Tente novamente.",
        variant: "destructive",
      });
      setProcessingPlanId(null);
    }
  };

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes("premium") || name.includes("pro")) return Crown;
    if (name.includes("basic")) return Zap;
    return Sparkles;
  };

  const getPlanColor = (planName: string, isPopular?: boolean) => {
    if (isPopular) return "from-primary to-primary/80";
    const name = planName.toLowerCase();
    if (name.includes("premium") || name.includes("pro")) return "from-purple-500 to-purple-600";
    if (name.includes("basic")) return "from-blue-500 to-blue-600";
    return "from-primary to-accent";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4" variant="secondary">
            <Star className="w-3 h-3 mr-1" />
            Escolha o melhor plano para você
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Planos e Assinaturas
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Desbloqueie todo o potencial da plataforma com recursos avançados
          </p>
        </motion.div>

        {/* Loading State */}
        <LoadingWrapper
          isLoading={loadingPlans}
          size="xl"
          text="Carregando planos disponíveis..."
        >
          {/* Plans Grid */}
          {plans && Array.isArray(plans) && plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {plans.map((plan: Plan, index: number) => {
                const Icon = getPlanIcon(plan.name);
                const isPopular = plan.popular;
                const isProcessing = processingPlanId === plan.id;
                const gradientColor = getPlanColor(plan.name, isPopular);

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                        isPopular
                          ? "border-primary border-2 shadow-lg scale-105"
                          : "hover:border-primary/50"
                      }`}
                    >
                      {/* Popular Badge */}
                      {isPopular && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-primary text-primary-foreground shadow-lg">
                            <Crown className="w-3 h-3 mr-1" />
                            Popular
                          </Badge>
                        </div>
                      )}

                      {/* Gradient Header */}
                      <div className={`bg-gradient-to-r ${gradientColor} p-6 text-white`}>
                        <div className="flex items-center justify-between mb-2">
                          <Icon className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-white mb-1">
                          {plan.name}
                        </CardTitle>
                      </div>

                      <CardContent className="p-6">
                        {/* Price */}
                        <div className="mb-6">
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">
                              R$ {plan.price.toFixed(2)}
                            </span>
                            <span className="text-muted-foreground">
                              /{plan.frequency_type === "month" ? "mês" : plan.frequency_type}
                            </span>
                          </div>
                        </div>

                        {/* Features */}
                        {plan.features && plan.features.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-sm font-semibold text-foreground mb-3">Recursos incluídos:</h4>
                            <ul className="space-y-2">
                              {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                  <span className="text-sm text-muted-foreground">
                                    {feature}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Conditions/Limits */}
                        {plan.description && (
                          <div className="mb-6 pt-4 border-t">
                            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Condições do plano:
                            </h4>
                            <div className="space-y-2.5">
                              {/* Max Decks */}
                              {plan.description.max_decks !== undefined && (
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <BookOpen className="h-4 w-4" />
                                    <span>Decks criados</span>
                                  </div>
                                  <span className="font-medium text-foreground">
                                    {plan.description.max_decks === null ? (
                                      <span className="flex items-center gap-1 text-primary">
                                        <Infinity className="h-4 w-4" />
                                        Ilimitado
                                      </span>
                                    ) : (
                                      `Até ${plan.description.max_decks}`
                                    )}
                                  </span>
                                </div>
                              )}

                              {/* Max Flashcards per Deck */}
                              {plan.description.max_flashcards_per_deck !== undefined && (
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <FileText className="h-4 w-4" />
                                    <span>Flashcards por deck</span>
                                  </div>
                                  <span className="font-medium text-foreground">
                                    {plan.description.max_flashcards_per_deck === null ? (
                                      <span className="flex items-center gap-1 text-primary">
                                        <Infinity className="h-4 w-4" />
                                        Ilimitado
                                      </span>
                                    ) : (
                                      `Até ${plan.description.max_flashcards_per_deck}`
                                    )}
                                  </span>
                                </div>
                              )}

                              {/* Can Review */}
                              {plan.description.can_review !== undefined && (
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <RefreshCw className="h-4 w-4" />
                                    <span>Revisões diárias</span>
                                  </div>
                                  <span className="font-medium">
                                    {plan.description.can_review ? (
                                      plan.description.max_reviews_per_day ? (
                                        <span className="text-foreground">
                                          Até {plan.description.max_reviews_per_day}/dia
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1 text-primary">
                                          <Infinity className="h-4 w-4" />
                                          <span>Ilimitado</span>
                                        </span>
                                      )
                                    ) : (
                                      <span className="flex items-center gap-1 text-muted-foreground">
                                        <X className="h-4 w-4" />
                                        <span>Indisponível</span>
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )}

                              {/* Can Export */}
                              {plan.description.can_export !== undefined && (
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <span>Exportar decks</span>
                                  </div>
                                  <span className="font-medium">
                                    {plan.description.can_export ? (
                                      <span className="flex items-center gap-1 text-primary">
                                        <Check className="h-4 w-4" />
                                        <span>Disponível</span>
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 text-muted-foreground">
                                        <X className="h-4 w-4" />
                                        <span>Indisponível</span>
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )}

                              {/* Can Import */}
                              {plan.description.can_import !== undefined && (
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <span>Importar decks</span>
                                  </div>
                                  <span className="font-medium">
                                    {plan.description.can_import ? (
                                      <span className="flex items-center gap-1 text-primary">
                                        <Check className="h-4 w-4" />
                                        <span>Disponível</span>
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 text-muted-foreground">
                                        <X className="h-4 w-4" />
                                        <span>Indisponível</span>
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )}

                              {/* AI Assistance */}
                              {plan.description.ai_assistance !== undefined && (
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Sparkles className="h-4 w-4" />
                                    <span>Assistência por IA</span>
                                  </div>
                                  <span className="font-medium">
                                    {plan.description.ai_assistance ? (
                                      <span className="flex items-center gap-1 text-primary">
                                        <Check className="h-4 w-4" />
                                        <span>Incluído</span>
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 text-muted-foreground">
                                        <X className="h-4 w-4" />
                                        <span>Não incluído</span>
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )}

                              {/* Priority Support */}
                              {plan.description.priority_support !== undefined && (
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <span>Suporte prioritário</span>
                                  </div>
                                  <span className="font-medium">
                                    {plan.description.priority_support ? (
                                      <span className="flex items-center gap-1 text-primary">
                                        <Check className="h-4 w-4" />
                                        <span>Incluído</span>
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 text-muted-foreground">
                                        <X className="h-4 w-4" />
                                        <span>Padrão</span>
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* CTA Button */}
                        <Button
                          className={`w-full ${
                            isPopular
                              ? "bg-primary hover:bg-primary/90"
                              : "bg-primary/90 hover:bg-primary"
                          }`}
                          onClick={() => handleCheckout(plan.id)}
                          disabled={isProcessing}
                          size="lg"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processando...
                            </>
                          ) : (
                            <>
                              Assinar Agora
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum plano disponível no momento.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Info Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <p className="text-sm text-muted-foreground">
              Todos os planos incluem suporte e atualizações gratuitas.
              <br />
              Cancele a qualquer momento sem compromisso.
            </p>
          </motion.div>
        </LoadingWrapper>
      </div>
    </div>
  );
}

