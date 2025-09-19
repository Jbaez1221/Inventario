import axiosBackend from "../axiosBackend";

// Obtener clientes desde SAP
export const getClientes = async () => {
  const res = await axiosBackend.get("/ventas/clientes");
  return res.data;
};

// Obtener items desde SAP
export const getItems = async () => {
  const res = await axiosBackend.get("/ventas/items");
  return res.data;
};

// Crear una orden de venta en SAP
export const crearOrden = async (ordenData) => {
  const res = await axiosBackend.post("/ventas/orders", ordenData);
  return res.data;
};
