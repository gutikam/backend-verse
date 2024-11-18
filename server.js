const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path"); // Importa el módulo path

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de CORS: Permitir solicitudes solo desde tu dominio frontend
const corsOptions = {
  origin: "https://versiculos-aleatorios.com", // Cambia esto a la URL de tu frontend
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions)); // Usar CORS con opciones

// Middleware
app.use(express.json());

// Sirve los archivos estáticos del build
app.use(express.static(path.join(__dirname, "public"))); // 'public' es donde estará tu build

// Ruta principal para verificar si el servidor está activo
app.get("/", (req, res) => {
  res.status(200).send("Al menos el servidor está corriendo 👌");
});

// Ruta para manejar el envío de contacto
app.post("/api/contact", async (req, res) => {
  const { nombreCompleto, email, mensaje } = req.body;

  // Configurar Nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail", // Usamos Gmail en este ejemplo; puedes cambiar el servicio si lo deseas
    auth: {
      user: process.env.EMAIL_USER, // Tu correo electrónico
      pass: process.env.EMAIL_PASS, // Tu contraseña de aplicación
    },
  });

  // Opciones del correo
  const mailOptions = {
    from: email, // Correo de quien envía (usuario)
    to: process.env.EMAIL_USER, // Tu correo donde quieres recibir el mensaje
    subject: "Nuevo mensaje de contacto",
    text: `Nombre: ${nombreCompleto}\nEmail: ${email}\nMensaje: ${mensaje}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Mensaje enviado con éxito" });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).json({ error: "Error al enviar el mensaje" });
  }
});

// Si no se encuentra una ruta, sirve el archivo index.html de tu build
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});