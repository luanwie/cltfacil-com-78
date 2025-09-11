import { Link } from "react-router-dom";
import { 
  FileText, 
  Calendar, 
  Umbrella, 
  Handshake, 
  Calculator,
  ArrowRight,
  BookOpen,
  DollarSign
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FAQ from "@/components/ui/faq";
import Container from "@/components/ui/container";

const EducationalSection = () => {
  const educationalCards = [
    {
      title: "Como calcular rescisão corretamente",
      icon: FileText,
      description: "A rescisão trabalhista envolve diversos direitos que variam conforme o tipo de demissão. Na demissão sem justa causa, o trabalhador tem direito ao saldo de salário, aviso prévio (30 dias + 3 dias por ano trabalhado), férias proporcionais + 1/3, 13º proporcional, FGTS + 40% de multa.",
      example: "Exemplo prático: João trabalhou 8 meses e ganha R$ 3.000. Sua rescisão incluirá: saldo proporcional, aviso prévio de 54 dias (30 + 24), férias de 8/12 avos, 13º de 8/12 avos, FGTS acumulado + 40% de multa, totalizando aproximadamente R$ 8.500.",
      calculatorLink: "/clt/rescisao",
      calculatorText: "Calcular Rescisão"
    },
    {
      title: "Tudo sobre 13º salário proporcional",
      icon: DollarSign,
      description: "O 13º salário é devido a todos os trabalhadores CLT e deve ser pago proporcionalmente aos meses trabalhados. Considera-se mês completo quando o trabalhador tem frequência igual ou superior a 15 dias no mês. O cálculo é feito sobre o maior salário recebido no ano.",
      example: "Exemplo: Maria trabalhou 7 meses e seu maior salário foi R$ 2.500. Seu 13º será: (R$ 2.500 ÷ 12 meses) × 7 meses = R$ 1.458,33. Se ela recebe comissões, será considerada a média dos últimos 12 meses para calcular a base.",
      calculatorLink: "/clt/13o-proporcional",
      calculatorText: "Calcular 13º Proporcional"
    },
    {
      title: "Direitos de férias na CLT",
      icon: Umbrella,
      description: "Todo trabalhador tem direito a 30 dias de férias após 12 meses de trabalho, com acréscimo de 1/3 constitucional. É possível vender até 1/3 das férias (10 dias) e parcelar em até 3 vezes. Férias não gozadas no prazo correto devem ser pagas em dobro.",
      example: "Exemplo: Carlos ganha R$ 4.000 e quer vender 10 dias de férias. Receberá: 20 dias de férias (R$ 2.667) + 1/3 sobre 30 dias (R$ 1.333) + venda de 10 dias (R$ 1.333) + 1/3 da venda (R$ 444) = R$ 5.777 total.",
      calculatorLink: "/clt/ferias-proporcionais",
      calculatorText: "Calcular Férias"
    },
    {
      title: "Quando usar acordo mútuo",
      icon: Handshake,
      description: "O acordo mútuo permite que empregador e empregado encerrem o contrato por comum acordo. O trabalhador recebe 50% do aviso prévio, 50% da multa do FGTS (20% ao invés de 40%), pode sacar até 80% do FGTS, mas não tem direito ao seguro-desemprego.",
      example: "Exemplo: Pedro ganha R$ 3.500 e fará acordo mútuo após 2 anos. Receberá: saldo integral, 50% do aviso (18 dias), férias proporcionais + 1/3, 13º proporcional, 20% de multa do FGTS. Valor estimado: R$ 6.200 + saque de 80% do FGTS.",
      calculatorLink: "/clt/rescisao",
      calculatorText: "Simular Acordo Mútuo"
    }
  ];

  const faqItems = [
    {
      question: "Posso ser demitido durante as férias?",
      answer: "Não, o empregador não pode demitir o trabalhador durante o período de gozo das férias. A demissão só pode ocorrer após o retorno. Caso aconteça, a demissão será considerada nula e o trabalhador deve ser reintegrado ou receber indenização dobrada."
    },
    {
      question: "Como funciona o aviso prévio trabalhado?",
      answer: "No aviso prévio trabalhado, o empregado continua trabalhando normalmente por 30 dias (mínimo) + 3 dias por ano de empresa. Pode optar por reduzir 2 horas diárias OU faltar 7 dias corridos. O período é computado para todos os direitos (FGTS, férias, 13º)."
    },
    {
      question: "Acordo mútuo vale a pena?",
      answer: "Depende da situação. O acordo mútuo é vantajoso quando você quer sair da empresa e precisa sacar o FGTS. Porém, você perde o direito ao seguro-desemprego e recebe apenas 20% de multa. É ideal para quem já tem outro emprego ou vai empreender."
    },
    {
      question: "Férias vencidas são sempre pagas em dobro?",
      answer: "Sim, férias não concedidas no prazo legal (até 11 meses após o período aquisitivo) devem ser pagas em dobro. Isso significa que você recebe o valor das férias + 1/3 constitucional, tudo multiplicado por 2. É um direito irrenunciável."
    },
    {
      question: "Como calcular horas extras no domingo?",
      answer: "Trabalho no domingo sem compensação gera adicional de 100% (dobra o valor da hora). Se há revezamento semanal de domingos, pode ser 50%. Além disso, o domingo trabalhado gera direito a folga compensatória na semana seguinte."
    },
    {
      question: "FGTS rende menos que a poupança?",
      answer: "Atualmente sim. O FGTS rende 3% ao ano + TR, enquanto a poupança rende 70% da Selic (quando Selic > 8,5%) ou 0,5% + TR. Em 2024, a poupança tem rendido mais que o FGTS, mas o FGTS oferece proteção trabalhista e benefícios sociais."
    }
  ];

  return (
    <section className="py-16 bg-accent/5">
      <Container>
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                Aprenda com os especialistas
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Guia Completo de Cálculos Trabalhistas 2025
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Entenda seus direitos trabalhistas com explicações claras, exemplos práticos 
              e cálculos atualizados conforme a legislação brasileira.
            </p>
          </div>

          {/* Educational Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {educationalCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card key={index} className="group hover:shadow-elevated transition-all duration-medium">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                          {card.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {card.description}
                    </p>
                    
                    <div className="bg-accent/20 p-4 rounded-lg border-l-4 border-primary">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        Exemplo Prático
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {card.example}
                      </p>
                    </div>

                    <Button asChild className="w-full group/btn">
                      <Link to={card.calculatorLink}>
                        {card.calculatorText}
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Perguntas Frequentes sobre Direitos Trabalhistas
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Tire suas dúvidas mais comuns sobre CLT, rescisão, férias e outros direitos trabalhistas.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <FAQ 
                items={faqItems}
                title=""
                className="space-y-2"
              />
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-hero p-8 rounded-xl text-white">
            <h3 className="text-2xl font-bold mb-4">
              Precisa de cálculos ilimitados?
            </h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Torne-se PRO e tenha acesso ilimitado a todas as calculadoras, 
              relatórios personalizados e suporte prioritário.
            </p>
            <Button asChild variant="secondary" size="lg">
              <Link to="/assinar-pro">
                Tornar-se PRO Agora
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default EducationalSection;