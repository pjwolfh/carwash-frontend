const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// 🎉 Correo para usuario final
const enviarCorreoBienvenida = async (destinatario, telefono) => {
  const info = await transporter.sendMail({
    from: '"CarwashApp 🧼🚗" <no-reply@carwash.com>',
    to: destinatario,
    subject: "🎉 ¡Bienvenido a CarwashApp!",
    html: `
      <h2>¡Gracias por registrarte en CarwashApp!</h2>
      <p>🎁 Por tu registro, te has ganado un <strong>servicio de lavado GRATIS</strong>.</p>
      <p>📱 Tu número <strong>${telefono}</strong> será tu método de ingreso al sistema.</p>
      <hr>
      <small>Este mensaje ha sido enviado automáticamente, por favor no responder.</small>
    `
  });

  console.log("📬 Correo enviado al usuario final:", info.messageId);
};

// 💼 Correo para dueños
const enviarCorreoDueño = async (destinatario, nombreContacto, passwordPlano, nombreEmpresa, telefono) => {
  console.log("📨 Enviando correo a dueño con datos:", {
    destinatario,
    nombreContacto,
    passwordPlano,
    nombreEmpresa,
    telefono
  });

  await transporter.sendMail({
    from: '"CarwashApp 💦🚘" <no-reply@carwash.com>',
    to: destinatario,
    subject: `📣 ¡Bienvenido a CarwashApp, ${nombreContacto}!`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>¡Hola <strong style="color: #007bff;">${nombreContacto}</strong>!</h2>
        <p>Tu empresa <strong>${nombreEmpresa}</strong> ha sido registrada exitosamente en <strong>CarwashApp</strong>.</p>

        <h4>🔐 Tus credenciales</h4>
        <p><strong>Usuario:</strong> ${destinatario}</p>
        <p><strong>Contraseña:</strong> <span style="color: red; font-weight: bold;">${passwordPlano}</span></p>
        <p><strong>📱 Teléfono registrado:</strong> ${telefono}</p>

        <hr>
        <p>🔁 Podés cambiar tu contraseña luego desde la sección de configuración.</p>
        <p>🙌 ¡Gracias por confiar en CarwashApp!</p>
        <hr>
        <small>Este mensaje ha sido enviado automáticamente. No respondas a este correo.</small>
      </div>
    `
  });

  console.log("📬 Correo enviado correctamente a dueño:", destinatario);
};

module.exports = {
  enviarCorreoBienvenida,
  enviarCorreoDueño
};
