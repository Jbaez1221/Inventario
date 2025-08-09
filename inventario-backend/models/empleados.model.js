const db = require("../database");

function calcularTiempo(fecha) {
  if (!fecha) return null;
  const inicio = new Date(fecha);
  const hoy = new Date();
  let years = hoy.getFullYear() - inicio.getFullYear();
  let months = hoy.getMonth() - inicio.getMonth();
  let days = hoy.getDate() - inicio.getDate();
  if (days < 0) {
    months--;
    days += new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  return `${years} años, ${months} meses, ${days} días`;
}

function adaptarEmpleado(e) {
  const apellidos_nombres = `${e.apellidos || ''} ${e.nombres || ''}`.trim();
  const edad = calcularTiempo(e.fecha_nacimiento);
  const tiempo_servicio = calcularTiempo(e.fecha_inicio_contrato);

  return {
    id: e.id,
    ID: e.id,
    CUC: e.cuc,
    DNI: e.dni,
    NOMBRES: e.nombres,
    nombres: e.nombres,
    APELLIDOS: e.apellidos,
    apellidos: e.apellidos,
    APELLIDOS_NOMBRES: apellidos_nombres,
    HIJOS: e.hijos ?? 0,
    hijos: e.hijos ?? 0,
    "ESTADO CIVIL": e.estado_civil,
    estado_civil: e.estado_civil,
    "FECHA DE INGRESO": e.fecha_ingreso,
    fecha_ingreso: e.fecha_ingreso,
    SEDE: e.sede,
    sede: e.sede,
    AREA: e.area,
    area: e.area,
    PUESTO: e.puesto,
    puesto: e.puesto,
    "ASIGNACION FAMILIAR": e.asignacion_familiar,
    asignacion_familiar: e.asignacion_familiar,
    SEXO: e.sexo,
    sexo: e.sexo,
    "SISTEMAS DE PENSIONES": e.sistema_pensiones,
    sistema_pensiones: e.sistema_pensiones,
    sistemas_pensiones: e.sistema_pensiones,
    "TIPO DE AFP": e.tipo_afp,
    tipo_afp: e.tipo_afp,
    "NUMERO DE CUSSP": e.numero_cussp,
    numero_cussp: e.numero_cussp,
    "FECHA DE NACIMIENTO": e.fecha_nacimiento,
    fecha_nacimiento: e.fecha_nacimiento,
    EDAD: edad,
    DIRECCION: e.direccion,
    direccion: e.direccion,
    "TELEFONO PERSONAL": e.telefono_personal,
    telefono_personal: e.telefono_personal,
    "TELEFONO COORPORATIVO": e.telefono_coorporativo,
    telefono_coorporativo: e.telefono_coorporativo,
    "BANCO DE ABONO HABERES": e.banco_abono_haberes,
    banco_abono_haberes: e.banco_abono_haberes,
    "CUENTA BANCARIA HABERES": e.cuenta_bancaria_haberes,
    cuenta_bancaria_haberes: e.cuenta_bancaria_haberes,
    "MONEDA DE CTA HABERES": e.moneda_cta_haberes,
    moneda_cta_haberes: e.moneda_cta_haberes,
    "TIPO DE PLANILLA": e.tipo_planilla,
    tipo_planilla: e.tipo_planilla,
    "REGIMEN VACACIONAL": e.regimen_vacacional,
    regimen_vacacional: e.regimen_vacacional,
    "CORREO ELECTRONICO INSTITUCIONAL": e.correo_institucional,
    correo_institucional: e.correo_institucional,
    "CORREO ELECTRONICO PERSONAL": e.correo_personal,
    correo_personal: e.correo_personal,
    "TIPO DE CONTRATO": e.tipo_contrato,
    tipo_contrato: e.tipo_contrato,
    "FECHA INICIO DE CONTRATO": e.fecha_inicio_contrato,
    fecha_inicio_contrato: e.fecha_inicio_contrato,
    "FECHA FIN DE CONTRATO": e.fecha_fin_contrato,
    fecha_fin_contrato: e.fecha_fin_contrato,
    "TIEMPO DE SERVICIO": tiempo_servicio,
    "PERIODO DE PRUEBA": e.periodo_prueba,
    periodo_prueba: e.periodo_prueba,
    "PERIODO DE CONTRATO": e.periodo_contrato,
    periodo_contrato: e.periodo_contrato,
    RENOVACIÓN: e.renovacion,
    renovacion: e.renovacion,
    "GRADO DE ESTUDIOS": e.grado_estudios,
    grado_estudios: e.grado_estudios,
    "CENTRO DE ESTUDIOS": e.centro_estudios,
    centro_estudios: e.centro_estudios,
    "AÑO DE EGRESO": e.anio_egreso,
    anio_egreso: e.anio_egreso,
    "CONTACTO DE REFERENCIA": e.contacto_referencia,
    contacto_referencia: e.contacto_referencia,
    TALLA: e.talla,
    talla: e.talla,
    tiene_asignaciones: e.tiene_asignaciones
  };
}

const obtenerEmpleados = async () => {
  const result = await db.query(`
    SELECT e.*, 
      EXISTS (
        SELECT 1 FROM asignaciones a WHERE a.empleado_id = e.id
      ) AS tiene_asignaciones
    FROM empleados e
    ORDER BY e.id ASC
  `);

  return result.rows.map(adaptarEmpleado);
};

const buscarPorDni = async (dni) => {
  const result = await db.query(`
    SELECT e.*, 
      EXISTS (
        SELECT 1 FROM asignaciones a WHERE a.empleado_id = e.id
      ) AS tiene_asignaciones
    FROM empleados e
    WHERE e.dni = $1
  `, [dni]);

  if (result.rows.length === 0) return null;
  return adaptarEmpleado(result.rows[0]);
};

const crearEmpleado = async (empleado) => {
  const campos = [
    "cuc", "nombres", "apellidos", "dni", "hijos", "estado_civil", "fecha_ingreso", "sede", "area", "puesto",
    "asignacion_familiar", "sexo", "sistema_pensiones", "tipo_afp", "numero_cussp", "fecha_nacimiento",
    "direccion", "telefono_personal", "telefono_coorporativo", "banco_abono_haberes", "cuenta_bancaria_haberes",
    "moneda_cta_haberes", "tipo_planilla", "regimen_vacacional", "correo_institucional", "correo_personal",
    "tipo_contrato", "fecha_inicio_contrato", "fecha_fin_contrato", "periodo_prueba", "periodo_contrato",
    "renovacion", "grado_estudios", "centro_estudios", "anio_egreso", "contacto_referencia", "talla"
  ];

  if ('renovacion' in empleado) {
    empleado.renovacion = empleado.renovacion === true || empleado.renovacion === 'true' || empleado.renovacion === 1;
  }

  const valores = campos.map(c => empleado[c]);
  const placeholders = campos.map((_, i) => `$${i + 1}`).join(', ');

  const result = await db.query(
    `INSERT INTO empleados (${campos.join(', ')}) VALUES (${placeholders}) RETURNING *`,
    valores
  );
  return adaptarEmpleado(result.rows[0]);
};

const actualizarEmpleado = async (id, empleado) => {
  const campos = [
    "cuc", "nombres", "apellidos", "dni", "hijos", "estado_civil", "fecha_ingreso", "sede", "area", "puesto",
    "asignacion_familiar", "sexo", "sistema_pensiones", "tipo_afp", "numero_cussp", "fecha_nacimiento",
    "direccion", "telefono_personal", "telefono_coorporativo", "banco_abono_haberes", "cuenta_bancaria_haberes",
    "moneda_cta_haberes", "tipo_planilla", "regimen_vacacional", "correo_institucional", "correo_personal",
    "tipo_contrato", "fecha_inicio_contrato", "fecha_fin_contrato", "periodo_prueba", "periodo_contrato",
    "renovacion", "grado_estudios", "centro_estudios", "anio_egreso", "contacto_referencia", "talla"
  ];

  if ('renovacion' in empleado) {
    empleado.renovacion = empleado.renovacion === true || empleado.renovacion === 'true' || empleado.renovacion === 1;
  }

  const set = campos.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const valores = campos.map(c => empleado[c]);
  valores.push(id);

  const result = await db.query(
    `UPDATE empleados SET ${set} WHERE id = $${campos.length + 1} RETURNING *`,
    valores
  );
  if (result.rows.length === 0) return null;
  return adaptarEmpleado(result.rows[0]);
};

const eliminarEmpleado = async (id) => {
  await db.query("DELETE FROM empleados WHERE id = $1", [id]);
};

const tieneAsignaciones = async (empleadoId) => {
  const result = await db.query(
    "SELECT COUNT(*) FROM asignaciones WHERE empleado_id = $1",
    [empleadoId]
  );
  return parseInt(result.rows[0].count, 10) > 0;
};

module.exports = {
  obtenerEmpleados,
  buscarPorDni,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
  tieneAsignaciones,
};
