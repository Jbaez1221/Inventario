const TicketsModel = require("../models/tickets.model");
const EmpleadosModel = require("../models/empleados.model"); // Importa el modelo de empleados
const EmailService = require("../services/email.service");

const crearTicketPublico = async (req, res) => {
  try {
    const { dni, tipo, categoria, prioridad, observacion_inicial, anydesk_info } = req.body;

    const empleado = await EmpleadosModel.buscarPorDni(dni);
    if (!empleado) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }
    const ticketData = {
      solicitante_id: empleado.id,
      correo_solicitante: empleado.correo_personal || empleado.correo_institucional,
      area_solicitante: empleado.area,
      celular_solicitante: empleado.telefono_personal,
      tipo,
      categoria,
      prioridad,
      observacion_inicial,
      anydesk_info
    };

    const ticket = await TicketsModel.crearTicket(ticketData);
    res.status(201).json({ codigo: ticket.codigo, mensaje: "Ticket creado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Error al crear ticket" });
  }
};

const estadoTicketPublico = async (req, res) => {
  const { codigo, correo } = req.query;
  try {
    const ticket = await TicketsModel.buscarPorCodigoYCorreo(codigo, correo);
    if (!ticket) return res.status(404).json({ error: "Ticket no encontrado" });
    res.json({ estado: ticket.estado, solucion: ticket.solucion_aplicada });
  } catch (error) {
    res.status(500).json({ error: "Error al consultar ticket" });
  }
};

const buscarTicketsPublico = async (req, res) => {
  const { categoria, tipo, palabra } = req.query;
  try {
    const tickets = await TicketsModel.buscarTicketsSimilares({ categoria, tipo, palabra });
    res.json(tickets.map(t => ({
      codigo: t.codigo,
      estado: t.estado,
      solucion: t.solucion_aplicada,
      categoria: t.categoria,
      tipo: t.tipo,
      fecha_cierre: t.fecha_cierre,
      solucionado_por: t.asignado_nombres && t.asignado_apellidos 
        ? `${t.asignado_nombres} ${t.asignado_apellidos}` 
        : null,
      correo_tecnico: t.asignado_correo
    })));
  } catch (error) {
    res.status(500).json({ error: "Error al buscar tickets" });
  }
};

const crearTicket = async (req, res) => {
  try {
    const ticket = await TicketsModel.crearTicket(req.body);
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: "Error al crear ticket" });
  }
};

const listarTickets = async (req, res) => {
  try {
    const tickets = await TicketsModel.listarTickets();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: "Error al listar tickets" });
  }
};

const obtenerTicketPorId = async (req, res) => {
  try {
    const ticket = await TicketsModel.obtenerTicketPorId(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket no encontrado" });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener ticket" });
  }
};

const asignarPersonal = async (req, res) => {
  try {
    const { personalId, comentarios } = req.body;
    const ticket = await TicketsModel.asignarPersonal(req.params.id, personalId, comentarios);
    if (!ticket) return res.status(404).json({ error: "Ticket no encontrado" });

    const tecnico = await EmpleadosModel.obtenerEmpleadoPorId(personalId);
    if (tecnico) {
      const correoTecnico = tecnico.correo_institucional || tecnico.correo_personal;
      if (correoTecnico) {
        await EmailService.enviarNotificacionTicketAsignado({ tecnico, ticket });
        console.log(`[EMAIL] Se envió notificación de asignación a técnico: ${correoTecnico}`);
      } else {
        console.warn("[EMAIL] El técnico no tiene correo registrado:", tecnico);
      }
    }

    if (comentarios && comentarios.trim() !== "") {
      const solicitante = await EmpleadosModel.obtenerEmpleadoPorId(ticket.solicitante_id);
      if (solicitante) {
        const correoSolicitante = solicitante.correo_institucional || solicitante.correo_personal;
        if (correoSolicitante) {
          await EmailService.enviarNotificacionComentarioAsignacion({
            solicitante,
            ticket,
            comentario: comentarios
          });
          console.log(`[EMAIL] Se envió notificación de comentario al solicitante: ${correoSolicitante}`);
        } else {
          console.warn("[EMAIL] El solicitante no tiene correo registrado:", solicitante);
        }
      }
    }

    await TicketsModel.agregarHistorial(req.params.id, personalId, "Asignación", comentarios || "Asignado a personal");
    res.json(ticket);
  } catch (error) {
    console.error("Error en asignarPersonal:", error);
    res.status(500).json({ error: error.message || "Error al asignar personal" });
  }
};

const cambiarEstadoTicket = async (req, res) => {
  try {
    const { estado, solucion_aplicada, satisfaccion } = req.body;
    const ticket = await TicketsModel.cambiarEstadoTicket(req.params.id, estado, solucion_aplicada, satisfaccion);
    if (!ticket) return res.status(404).json({ error: "Ticket no encontrado" });

    const empleadoId = req.user?.empleado_id || null;
    await TicketsModel.agregarHistorial(req.params.id, empleadoId, "Cambio de estado", `Estado: ${estado}`);

    res.json(ticket);
  } catch (error) {
    console.error("Error al cambiar estado del ticket:", error);
    res.status(500).json({ error: error.message || "Error al cambiar estado del ticket" });
  }
};

const actualizarAnydeskInfo = async (req, res) => {
  try {
    const { anydesk_info } = req.body;
    const ticket = await TicketsModel.actualizarAnydeskInfo(req.params.id, anydesk_info);
    if (!ticket) return res.status(404).json({ error: "Ticket no encontrado" });

    const empleadoId = req.user?.empleado_id || null;
    await TicketsModel.agregarHistorial(
      req.params.id, 
      empleadoId, 
      "Información AnyDesk", 
      `AnyDesk: ${anydesk_info || 'Información removida'}`
    );

    res.json(ticket);
  } catch (error) {
    console.error("Error al actualizar información de AnyDesk:", error);
    res.status(500).json({ error: error.message || "Error al actualizar información de AnyDesk" });
  }
};

const listarHistorial = async (req, res) => {
  try {
    const historial = await TicketsModel.listarHistorial(req.params.id);
    res.json(historial);
  } catch (error) {
    res.status(500).json({ error: "Error al listar historial" });
  }
};

const agregarHistorial = async (req, res) => {
  try {
    const { usuarioId, accion, detalle } = req.body;
    await TicketsModel.agregarHistorial(req.params.id, usuarioId, accion, detalle);
    res.status(201).json({ message: "Historial agregado" });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar historial" });
  }
};

const listarEmpleadosSistemas = async (req, res) => {
  try {
    const empleados = await TicketsModel.listarEmpleadosSistemas();
    res.json(empleados);
  } catch (error) {
    res.status(500).json({ error: "Error al listar empleados de sistemas" });
  }
};

const buscarTicketsPorDni = async (req, res) => {
  try {
    const { dni } = req.query;
    if (!dni) return res.status(400).json({ error: "DNI requerido" });
    const tickets = await TicketsModel.buscarTicketsPorDni(dni);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar tickets por DNI" });
  }
};

const buscarTicketPorCodigo = async (req, res) => {
  try {
    const { codigo } = req.query;
    if (!codigo) return res.status(400).json({ error: "Código requerido" });
    const ticket = await TicketsModel.buscarTicketPorCodigo(codigo);
    if (!ticket) return res.status(404).json({ error: "Ticket no encontrado" });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar ticket por código" });
  }
};

module.exports = {
  crearTicketPublico,
  estadoTicketPublico,
  buscarTicketsPublico,
  buscarTicketsPorDni,
  buscarTicketPorCodigo,
  crearTicket,
  listarTickets,
  obtenerTicketPorId,
  asignarPersonal,
  cambiarEstadoTicket,
  actualizarAnydeskInfo,
  listarHistorial,
  agregarHistorial,
  listarEmpleadosSistemas,
};