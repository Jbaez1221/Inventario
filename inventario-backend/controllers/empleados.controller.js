const EmpleadosModel = require("../models/empleados.model");

const listarEmpleados = async (req, res) => {
  try {
    const empleados = await EmpleadosModel.obtenerEmpleados();
    res.json(empleados);
  } catch (error) {
    console.error("Error al listar empleados:", error);
    res.status(500).json({ error: "Error al obtener empleados" });
  }
};

const obtenerEmpleadoPorDNI = async (req, res) => {
  const { dni } = req.params;
  try {
    const empleado = await EmpleadosModel.buscarPorDni(dni);

    if (!empleado) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    res.json(empleado);
  } catch (error) {
    console.error("Error al buscar empleado por DNI:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const registrarEmpleado = async (req, res) => {
  try {
    const { dni, nombres, apellidos } = req.body;
    if (!dni || !nombres || !apellidos) {
      return res.status(400).json({ error: "DNI, nombres y apellidos son obligatorios." });
    }
    const nuevoEmpleado = await EmpleadosModel.crearEmpleado(req.body);
    res.status(201).json(nuevoEmpleado);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: "El DNI ya está registrado en el sistema." });
    }
    console.error("Error al crear empleado:", error);
    res.status(500).json({ error: "Error al crear empleado" });
  }
};

const actualizarEmpleado = async (req, res) => {
  const { id } = req.params;
  try {
    const actualizado = await EmpleadosModel.actualizarEmpleado(id, req.body);
    if (!actualizado) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }
    res.json(actualizado);
  } catch (error) {
    console.error("Error al actualizar empleado:", error);
    res.status(500).json({ error: "Error al actualizar empleado" });
  }
};

const eliminarEmpleado = async (req, res) => {
  const { id } = req.params;
  try {
    await EmpleadosModel.eliminarEmpleado(id);
    res.json({ mensaje: "Empleado eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar empleado:", error);
    res.status(500).json({ error: "Error al eliminar empleado" });
  }
};

module.exports = {
  listarEmpleados,
  registrarEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
  obtenerEmpleadoPorDNI,
};
