
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT-LINK] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Create Supabase client with service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user and check if they're an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Unauthorized access");
    }

    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userData.user.id)
      .single();
    
    if (adminError || !adminData) {
      throw new Error("Admin access required");
    }

    logStep("Admin verification passed", { userId: userData.user.id });

    // Parse request body
    const { name, description, amount, currency = 'USD' } = await req.json();
    
    if (!name || !amount || amount <= 0) {
      throw new Error("Name and a positive amount are required");
    }

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
    
    // Convert amount to cents for Stripe
    const amountInCents = Math.round(amount * 100);
    
    // Create Stripe payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name,
              description: description || undefined,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      after_completion: {
        type: "redirect",
        redirect: {
          url: `${req.headers.get("origin")}/payment-success?source=admin_link`
        }
      }
    });
    
    logStep("Payment link created", { paymentLinkId: paymentLink.id, url: paymentLink.url });
    
    // Store payment link in database
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('payment_links')
      .insert({
        name,
        description,
        amount: amountInCents,
        currency: currency.toUpperCase(),
        url: paymentLink.url,
        stripe_id: paymentLink.id,
        created_by: userData.user.id
      })
      .select()
      .single();
    
    if (insertError) {
      throw new Error(`Error saving payment link: ${insertError.message}`);
    }
    
    logStep("Payment link saved to database", { linkId: insertData.id });

    return new Response(JSON.stringify(insertData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep(`ERROR: ${errorMessage}`);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
