import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend@0.17.2";

const resendKey = import.meta.env.VITE_RESEND_API_KEY;
Deno.serve(async (req) => {
  try {
    // Récupération des données envoyées par HiveDetail.jsx
    const { email, hive_name, alert_type, value } = await req.json();

    const subject = `⚠️ Alerte Ruche : ${alert_type} sur ${hive_name}`;
    
    // Logique de message unique et propre
    let messageBody = "";
    if (alert_type === 'TEMP') {
      messageBody = `La température est tombée à ${value}°C.`;
    } else if (alert_type === 'PANNE SYSTÈME') {
      messageBody = `Le système n'a plus envoyé de données depuis ${value} minutes. Vérifiez l'alimentation ou le Wi-Fi.`;
    } else {
      messageBody = `Le poids a atteint ${value}kg.`;
    }

    // Envoi de l'email
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'boye.malick02@gmail.com', 
      subject: subject,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #f59e0b;">Alerte Ruche Connectée</h2>
          <p style="font-size: 16px;">${messageBody}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">
            Ruche concernée : <strong>${hive_name}</strong><br />
            Type d'alerte : ${alert_type}
          </p>
          <a href="https://ton-dashboard.vercel.app" style="display: inline-block; padding: 10px 20px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 8px; margin-top: 10px;">
            Ouvrir le Dashboard
          </a>
        </div>
      `
    });

    return new Response(JSON.stringify(data), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
});