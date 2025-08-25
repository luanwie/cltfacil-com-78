import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-PRICE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const priceId = Deno.env.get("STRIPE_PRICE_ID");

    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!priceId) throw new Error("STRIPE_PRICE_ID is not set");

    logStep("Stripe configuration verified", { priceId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Buscar o preço do Stripe
    const price = await stripe.prices.retrieve(priceId);
    logStep("Price retrieved from Stripe", { 
      id: price.id, 
      amount: price.unit_amount, 
      currency: price.currency 
    });

    // Formatar o preço
    const amount = price.unit_amount || 0;
    const currency = price.currency || 'brl';
    
    let formattedPrice = '';
    if (currency.toLowerCase() === 'brl') {
      formattedPrice = `R$ ${(amount / 100).toFixed(2).replace('.', ',')}`;
      if (price.recurring?.interval === 'month') {
        formattedPrice += '/mês';
      } else if (price.recurring?.interval === 'year') {
        formattedPrice += '/ano';
      }
    } else {
      formattedPrice = `${currency.toUpperCase()} ${(amount / 100).toFixed(2)}`;
      if (price.recurring?.interval === 'month') {
        formattedPrice += '/month';
      } else if (price.recurring?.interval === 'year') {
        formattedPrice += '/year';
      }
    }

    logStep("Price formatted", { formattedPrice });

    return new Response(JSON.stringify({ 
      label: formattedPrice,
      amount,
      currency,
      interval: price.recurring?.interval
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in get-price", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});