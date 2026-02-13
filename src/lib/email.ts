import { Resend } from "resend";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const resend = getResend();
  await resend.emails.send({
    from: "EPMN Cahier de Vacances <onboarding@resend.dev>",
    to,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #930137;">EPMN — Cahier de Vacances</h2>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valable pendant 1 heure.</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #930137; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin: 16px 0;">
          Réinitialiser mon mot de passe
        </a>
        <p style="color: #666; font-size: 14px; margin-top: 24px;">Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.</p>
      </div>
    `,
  });
}
