const axios = require("axios");
const https = require("https");

const SAP_URL = process.env.SAP_URL;
const agent = new https.Agent({ rejectUnauthorized: false });

let sessionCookie = null;

async function login() {
  const res = await axios.post(`${SAP_URL}/Login`, {
    UserName: process.env.SAP_USER,
    Password: process.env.SAP_PASS,
    CompanyDB: process.env.SAP_COMPANY
  }, { httpsAgent: agent });

  sessionCookie = res.headers["set-cookie"].join("; ");
  return sessionCookie;
}

async function ensureSession() {
  if (!sessionCookie) await login();
  return sessionCookie;
}

// Obtener clientes
async function getClientes() {
  const cookie = await ensureSession();
  const res = await axios.get(`${SAP_URL}/BusinessPartners?$top=10`, {
    headers: { Cookie: cookie },
    httpsAgent: agent
  });
  return res.data.value;
}

// Obtener items
async function getItems() {
  const cookie = await ensureSession();
  const res = await axios.get(`${SAP_URL}/Items?$top=10`, {
    headers: { Cookie: cookie },
    httpsAgent: agent
  });
  return res.data.value;
}

// Crear orden de venta
async function crearOrden(orderData) {
  const cookie = await ensureSession();
  const res = await axios.post(`${SAP_URL}/Orders`, orderData, {
    headers: {
      Cookie: cookie,
      "Content-Type": "application/json"
    },
    httpsAgent: agent
  });
  return res.data;
}

module.exports = { getClientes, getItems, crearOrden };
