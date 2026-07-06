import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const {
      email,
      password,
      full_name,
      role,
    } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Create Auth user
    const { data, error } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (error) throw error;

    const userId = data.user.id;

    // Insert profile
    const { error: profileError } =
      await supabase
        .from("profiles")
        .insert({
          id: userId,
          full_name,
          email,
        });

    if (profileError) throw profileError;

    // Insert role
    const { error: roleError } =
      await supabase
        .from("roles")
        .insert({
          user_id: userId,
          role,
        });

    if (roleError) throw roleError;

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error:
          err.message ||
          "Something went wrong",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  }
});