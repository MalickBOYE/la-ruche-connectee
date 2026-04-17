import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend@0.17.2";

const resend = new Resend('re_ZVzU7oMG_H8BYG3umhNbrniiWZWjBHzvJ');

Deno.serve(async (req) => {
  try {
    // On récupère les infos envoyées par ton Trigger SQL
    const { email, hive_name, alert_type, value } = await req.json();

    const subject = `⚠️ Alerte Ruche : ${alert_type} sur ${hive_name}`;
    const message = alert_type === 'TEMP' 
      ? `La température est tombée à ${value}°C.` 
      : `Le poids a atteint ${value}kg.`;

    // Envoi de l'email via Resend
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'boye.malick02@gmail.com', 
      subject: subject,
      html: `
        <h3>Alerte Ruche</h3>
        <p>${message}</p>
        <p>Vérifiez l'état de la ruche <strong>${hive_name}</strong>.</p>
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