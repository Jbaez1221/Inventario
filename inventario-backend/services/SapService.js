const axios = require("axios");
const https = require("https");

const SAP_URL = process.env.SAP_URL;
const SAP_USER = process.env.SAP_USER;
const SAP_PASS = process.env.SAP_PASS;
const SAP_COMPANY = process.env.SAP_COMPANY;

let sessionCookie = null;

// Configuración para ignorar certificados self-signed
const agent = new https.Agent({ rejectUnauthorized: false });

// Login a SAP
async function login() {
  try {
    const body = {
      UserName: SAP_USER,
      Password: SAP_PASS,
      CompanyDB: SAP_COMPANY
    };

    const res = await axios.post(`${SAP_URL}/Login`, body, {
      headers: { "Content-Type": "application/json" },
      httpsAgent: agent
    });

    sessionCookie = res.headers["set-cookie"];
    console.log("✅ Login SAP exitoso");
    return sessionCookie;
  } catch (err) {
    console.error("❌ Error en login SAP:", err.message);
    throw new Error("No se pudo conectar a SAP Service Layer");
  }
}

// Asegurar sesión activa
async function ensureSession() {
  if (!sessionCookie) {
    await login();
  }
  return sessionCookie;
}

// Obtener Items
async function getItems() {
  const cookie = await ensureSession();
  try {
    const res = await axios.get(`${SAP_URL}/Items?$top=10`, {
      headers: { Cookie: cookie },
      httpsAgent: agent
    });
    return res.data.value; // SAP devuelve { value: [...] }
  } catch (err) {
    console.error("❌ Error obteniendo Items:", err.message);
    throw new Error("No se pudieron obtener Items desde SAP");
  }
}

module.exports = { login, getItems };
