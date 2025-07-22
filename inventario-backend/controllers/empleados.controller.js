const EmpleadosModel = require("../models/empleados.model");

// Obtener empleados
const listarEmpleados = async (req, res) => {
  try {
    const empleados = await EmpleadosModel.obtenerEmpleados();
    res.json(empleados);
  } catch (error) {
    console.error("Error al listar empleados:", error);
    res.status(500).json({ error: "Error al obtener empleados" });
  }
};

// Obtener empleados por dni

const obtenerEmpleadoPorDNI = async (req, res) => {
  const { dni } = req.params;
  try {
    const empleados = await EmpleadosModel.buscarPorDni(dni);

    if (empleados.length === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    res.json(empleados[0]); // retorna solo el primero
  } catch (error) {
    console.error("Error al buscar empleado por DNI:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};




// Crear empleado
const registrarEmpleado = async (req, res) => {
  try {
    const nuevoEmpleado = await EmpleadosModel.crearEmpleado(req.body);
    res.status(201).json(nuevoEmpleado);
  } catch (error) {
    console.error("Error al crear empleado:", error);
    res.status(500).json({ error: "Error al crear empleado" });
  }
};

// Actualizar empleado
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

// Eliminar empleado
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
