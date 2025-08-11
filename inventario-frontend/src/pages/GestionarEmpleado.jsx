import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosBackend from "../api/axios";
import { useAuth } from "../hooks/useAuth";

const ESTADOS_CIVIL = ["Soltero", "Casado", "Divorciado", "Viudo", "Conviviente"];
const SEXOS = ["Masculino", "Femenino", "Otro"];
const REGIMENES = ["General", "Especial", "Otro"];
const TIPOS_CONTRATO = ["Indeterminado", "Plazo Fijo", "Prácticas", "Locación", "Otro"];
const TALLAS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const RENOVACION_OPCIONES = [
  { label: "Sí", value: true },
  { label: "No", value: false }
];

const CAMPOS_FORM = [
  { name: "APELLIDOS", label: "Apellidos", type: "text", required: true },
  { name: "NOMBRES", label: "Nombres", type: "text", required: true },
  { name: "CUC", label: "CUC", type: "text" },
  { name: "DNI", label: "DNI", type: "text", required: true, maxLength: 8, pattern: "\\d{8}" },
  { name: "HIJOS", label: "Hijos", type: "number", min: 0 },
  { name: "ESTADO CIVIL", label: "Estado Civil", type: "select", options: ESTADOS_CIVIL },
  { name: "FECHA DE INGRESO", label: "Fecha de Ingreso", type: "date" },
  { name: "SEDE", label: "Sede", type: "text" },
  { name: "AREA", label: "Área", type: "text" },
  { name: "PUESTO", label: "Puesto", type: "text" },
  { name: "ASIGNACION FAMILIAR", label: "Asignación Familiar", type: "switch", options: RENOVACION_OPCIONES }, // <-- ahora boolean
  { name: "SEXO", label: "Sexo", type: "select", options: SEXOS },
  { name: "SISTEMAS DE PENSIONES", label: "Sistemas de Pensiones", type: "text" },
  { name: "TIPO DE AFP", label: "Tipo de AFP", type: "text" },
  { name: "NUMERO DE CUSSP", label: "Número de CUSSP", type: "text" },
  { name: "FECHA DE NACIMIENTO", label: "Fecha de Nacimiento", type: "date" },
  { name: "DIRECCION", label: "Dirección", type: "textarea" },
  { name: "TELEFONO PERSONAL", label: "Teléfono Personal", type: "text" },
  { name: "TELEFONO COORPORATIVO", label: "Teléfono Corporativo", type: "text" },
  { name: "BANCO DE ABONO HABERES", label: "Banco de Abono Haberes", type: "text" },
  { name: "CUENTA BANCARIA HABERES", label: "Cuenta Bancaria Haberes", type: "text" },
  { name: "MONEDA DE CTA HABERES", label: "Moneda de Cuenta Haberes", type: "text" },
  { name: "TIPO DE PLANILLA", label: "Tipo de Planilla", type: "text" },
  { name: "REGIMEN VACACIONAL", label: "Régimen Vacacional", type: "select", options: REGIMENES },
  { name: "CORREO ELECTRONICO INSTITUCIONAL", label: "Correo Institucional", type: "email" },
  { name: "CORREO ELECTRONICO PERSONAL", label: "Correo Personal", type: "email" },
  { name: "TIPO DE CONTRATO", label: "Tipo de Contrato", type: "select", options: TIPOS_CONTRATO },
  { name: "FECHA INICIO DE CONTRATO", label: "Fecha Inicio Contrato", type: "date" },
  { name: "FECHA FIN DE CONTRATO", label: "Fecha Fin Contrato", type: "date" },
  { name: "PERIODO DE PRUEBA", label: "Periodo de Prueba", type: "text" },
  { name: "PERIODO DE CONTRATO", label: "Periodo de Contrato", type: "text" },
  { name: "RENOVACIÓN", label: "Renovación", type: "switch", options: RENOVACION_OPCIONES },
  { name: "GRADO DE ESTUDIOS", label: "Grado de Estudios", type: "text" },
  { name: "CENTRO DE ESTUDIOS", label: "Centro de Estudios", type: "text" },
  { name: "AÑO DE EGRESO", label: "Año de Egreso", type: "number", min: 1900, max: 2100 },
  { name: "CONTACTO DE REFERENCIA", label: "Contacto de Referencia", type: "textarea" },
  { name: "TALLA", label: "Talla", type: "select", options: TALLAS }
];

function toDateInput(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (typeof value === "string" && value.includes("T")) return value.split("T")[0];
  const d = new Date(value);
  return d.toISOString().split("T")[0];
}

const mapFormToApi = (form) => ({
  cuc: form.CUC,
  dni: form.DNI,
  nombres: form.NOMBRES || "",
  apellidos: form.APELLIDOS || "",
  hijos: form.HIJOS === "" ? 0 : Number(form.HIJOS),
  estado_civil: form["ESTADO CIVIL"],
  fecha_ingreso: form["FECHA DE INGRESO"],
  sede: form.SEDE,
  area: form.AREA,
  puesto: form.PUESTO,
  asignacion_familiar: form["ASIGNACION FAMILIAR"] === undefined ? false : (form["ASIGNACION FAMILIAR"] === true || form["ASIGNACION FAMILIAR"] === "true"),
  sexo: form.SEXO,
  sistema_pensiones: form["SISTEMAS DE PENSIONES"],
  tipo_afp: form["TIPO DE AFP"],
  numero_cussp: form["NUMERO DE CUSSP"],
  fecha_nacimiento: form["FECHA DE NACIMIENTO"],
  direccion: form.DIRECCION,
  telefono_personal: form["TELEFONO PERSONAL"],
  telefono_coorporativo: form["TELEFONO COORPORATIVO"],
  banco_abono_haberes: form["BANCO DE ABONO HABERES"],
  cuenta_bancaria_haberes: form["CUENTA BANCARIA HABERES"],
  moneda_cta_haberes: form["MONEDA DE CTA HABERES"],
  tipo_planilla: form["TIPO DE PLANILLA"],
  regimen_vacacional: form["REGIMEN VACACIONAL"],
  correo_institucional: form["CORREO ELECTRONICO INSTITUCIONAL"],
  correo_personal: form["CORREO ELECTRONICO PERSONAL"],
  tipo_contrato: form["TIPO DE CONTRATO"],
  fecha_inicio_contrato: form["FECHA INICIO DE CONTRATO"],
  fecha_fin_contrato: form["FECHA FIN DE CONTRATO"],
  periodo_prueba: form["PERIODO DE PRUEBA"],
  periodo_contrato: form["PERIODO DE CONTRATO"],
  renovacion: form["RENOVACIÓN"] === undefined ? false : (form["RENOVACIÓN"] === true || form["RENOVACIÓN"] === "true"),
  grado_estudios: form["GRADO DE ESTUDIOS"],
  centro_estudios: form["CENTRO DE ESTUDIOS"],
  anio_egreso: form["AÑO DE EGRESO"],
  contacto_referencia: form["CONTACTO DE REFERENCIA"],
  talla: form.TALLA
});

const mapApiToForm = (api) => ({
  ID: api.ID || api.id || "",
  CUC: api.CUC || api.cuc || "",
  DNI: api.DNI || api.dni || "",
  NOMBRES: api.NOMBRES || api.nombres || "",
  APELLIDOS: api.APELLIDOS || api.apellidos || "",
  HIJOS: api.HIJOS ?? api.hijos ?? 0,
  "ESTADO CIVIL": api.estado_civil || "",
  "FECHA DE INGRESO": toDateInput(api.fecha_ingreso),
  SEDE: api.sede || "",
  AREA: api.area || "",
  PUESTO: api.puesto || "",
  "ASIGNACION FAMILIAR": api.asignacion_familiar === true || api.asignacion_familiar === "true" ? true : false,
  SEXO: api.sexo || "",
  "SISTEMAS DE PENSIONES": api["SISTEMAS DE PENSIONES"] || api.sistema_pensiones || "",
  "TIPO DE AFP": api.tipo_afp || "",
  "NUMERO DE CUSSP": api.numero_cussp || "",
  "FECHA DE NACIMIENTO": toDateInput(api.fecha_nacimiento),
  DIRECCION: api.direccion || "",
  "TELEFONO PERSONAL": api.telefono_personal || "",
  "TELEFONO COORPORATIVO": api.telefono_coorporativo || "",
  "BANCO DE ABONO HABERES": api.banco_abono_haberes || "",
  "CUENTA BANCARIA HABERES": api.cuenta_bancaria_haberes || "",
  "MONEDA DE CTA HABERES": api.moneda_cta_haberes || "",
  "TIPO DE PLANILLA": api.tipo_planilla || "",
  "REGIMEN VACACIONAL": api.regimen_vacacional || "",
  "CORREO ELECTRONICO INSTITUCIONAL": api.correo_institucional || "",
  "CORREO ELECTRONICO PERSONAL": api.correo_personal || "",
  "TIPO DE CONTRATO": api.tipo_contrato || "",
  "FECHA INICIO DE CONTRATO": toDateInput(api.fecha_inicio_contrato),
  "FECHA FIN DE CONTRATO": toDateInput(api.fecha_fin_contrato),
  "PERIODO DE PRUEBA": api.periodo_prueba || "",
  "PERIODO DE CONTRATO": api.periodo_contrato || "",
  "RENOVACIÓN": api.renovacion === true || api.renovacion === "true" ? true : false,
  "GRADO DE ESTUDIOS": api.grado_estudios || "",
  "CENTRO DE ESTUDIOS": api.centro_estudios || "",
  "AÑO DE EGRESO": api.anio_egreso || "",
  "CONTACTO DE REFERENCIA": api.contacto_referencia || "",
  TALLA: api.talla || ""
});

const GestionarEmpleado = () => {
  const { token, user } = useAuth();
  const rol = user?.user?.rol;
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({});
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (id) {
      axiosBackend.get(`/empleados/por-dni/${id}`)
        .then(res => setForm(mapApiToForm(res.data)));
    }
  }, [id]);

  if (!token || (rol !== "admin" && rol !== "rrhh")) {
    return <div>No tienes permisos para acceder a esta sección.</div>;
  }

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "radio"
        ? (value === "true" ? true : value === "false" ? false : value)
        : value
    });
  };

  const validar = () => {
    const nuevosErrores = {};
    CAMPOS_FORM.forEach(({ name, required, type, maxLength, pattern }) => {
      const valor = form[name];
      if (required && (!valor || valor === "")) {
        nuevosErrores[name] = "Este campo es obligatorio";
      }
      if (maxLength && valor && valor.length > maxLength) {
        nuevosErrores[name] = `Máximo ${maxLength} caracteres`;
      }
      if (pattern && valor && !new RegExp(pattern).test(valor)) {
        nuevosErrores[name] = "Formato inválido";
      }
      if (type === "email" && valor && !/^[^@]+@[^@]+\.[^@]+$/.test(valor)) {
        nuevosErrores[name] = "Correo inválido";
      }
    });
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    setEnviando(true);
    try {
      const datosApi = mapFormToApi(form);
      const empleadoId = form.ID || id;
      if (empleadoId) {
        await axiosBackend.put(`/empleados/${empleadoId}`, datosApi);
      } else {
        await axiosBackend.post("/empleados", datosApi);
      }
      navigate("/empleados");
    } catch {
      alert("Error al guardar empleado");
    } finally {
      setEnviando(false);
    }
  };

  const renderCampo = (name) => {
    const campo = CAMPOS_FORM.find(c => c.name === name);
    if (!campo) return null;
    return (
      <div key={campo.name} className="form-group" style={{ minWidth: 200 }}>
        <label style={{ fontWeight: 600 }}>
          {campo.label}
          {campo.required && <span style={{ color: "#ff5252", marginLeft: 4 }}>*</span>}
        </label>
        {campo.type === "select" ? (
          <select
            name={campo.name}
            value={form[campo.name] || ""}
            onChange={handleChange}
            required={campo.required}
            className={errores[campo.name] ? "input-error" : ""}
          >
            <option value="">Seleccione...</option>
            {campo.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : campo.type === "switch" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {campo.options.map(opt => (
              <label key={String(opt.value)} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input
                  type="radio"
                  name={campo.name}
                  value={opt.value}
                  checked={form[campo.name] === opt.value}
                  onChange={handleChange}
                />
                {opt.label}
              </label>
            ))}
          </div>
        ) : campo.type === "textarea" ? (
          <textarea
            name={campo.name}
            value={form[campo.name] || ""}
            onChange={handleChange}
            rows={3}
            required={campo.required}
            className={errores[campo.name] ? "input-error" : ""}
          />
        ) : (
          <input
            type={campo.type}
            name={campo.name}
            value={form[campo.name] || ""}
            onChange={handleChange}
            required={campo.required}
            min={campo.min}
            max={campo.max}
            maxLength={campo.maxLength}
            pattern={campo.pattern}
            className={errores[campo.name] ? "input-error" : ""}
            autoComplete="off"
          />
        )}
        {errores[campo.name] && (
          <span style={{ color: "#ff5252", fontSize: "0.95em" }}>{errores[campo.name]}</span>
        )}
      </div>
    );
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="formulario">
        <h2 className="form-main-title">{id ? "Editar Empleado" : "Registrar Empleado"}</h2>

        <div className="form-section">
          <span className="form-section-icon" aria-label="Datos personales">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="#8ab4f8" strokeWidth="2"/><path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke="#8ab4f8" strokeWidth="2"/></svg>
          </span>
          <span className="form-section-title">Datos personales</span>
        </div>
        {["APELLIDOS", "NOMBRES", "CUC", "DNI", "HIJOS", "ESTADO CIVIL", "FECHA DE NACIMIENTO", "SEXO", "DIRECCION", "TALLA"].map(name =>
          renderCampo(name)
        )}

        <div className="form-section">
          <span className="form-section-icon" aria-label="Contrato">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2" stroke="#8ab4f8" strokeWidth="2"/><path d="M8 7h8M8 11h8M8 15h4" stroke="#8ab4f8" strokeWidth="2"/></svg>
          </span>
          <span className="form-section-title">Datos de Contrato</span>
        </div>
        {["FECHA DE INGRESO", "SEDE", "AREA", "PUESTO", "TIPO DE CONTRATO", "FECHA INICIO DE CONTRATO", "FECHA FIN DE CONTRATO", "PERIODO DE PRUEBA", "PERIODO DE CONTRATO", "RENOVACIÓN", "REGIMEN VACACIONAL", "TIPO DE PLANILLA"].map(name =>
          renderCampo(name)
        )}

        <div className="form-section">
          <span className="form-section-icon" aria-label="Bancarios">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2" stroke="#8ab4f8" strokeWidth="2"/><path d="M3 10h18" stroke="#8ab4f8" strokeWidth="2"/></svg>
          </span>
          <span className="form-section-title">Datos Bancarios</span>
        </div>
        {["BANCO DE ABONO HABERES", "CUENTA BANCARIA HABERES", "MONEDA DE CTA HABERES"].map(name =>
          renderCampo(name)
        )}

        <div className="form-section">
          <span className="form-section-icon" aria-label="Pensiones">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="8" rx="2" stroke="#8ab4f8" strokeWidth="2"/><path d="M2 10l10-6 10 6" stroke="#8ab4f8" strokeWidth="2"/></svg>
          </span>
          <span className="form-section-title">Sistemas de Pensiones</span>
        </div>
        {["SISTEMAS DE PENSIONES", "TIPO DE AFP", "NUMERO DE CUSSP", "ASIGNACION FAMILIAR"].map(name =>
          renderCampo(name)
        )}

        <div className="form-section">
          <span className="form-section-icon" aria-label="Contacto y estudios">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M6 8v2a6 6 0 006 6h2" stroke="#8ab4f8" strokeWidth="2"/><rect x="14" y="14" width="6" height="6" rx="1" stroke="#8ab4f8" strokeWidth="2"/><circle cx="8" cy="6" r="2" stroke="#8ab4f8" strokeWidth="2"/></svg>
          </span>
          <span className="form-section-title">Contacto y Estudios</span>
        </div>
        {["TELEFONO PERSONAL", "TELEFONO COORPORATIVO", "CORREO ELECTRONICO INSTITUCIONAL", "CORREO ELECTRONICO PERSONAL", "GRADO DE ESTUDIOS", "CENTRO DE ESTUDIOS", "AÑO DE EGRESO", "CONTACTO DE REFERENCIA"].map(name =>
          renderCampo(name)
        )}

        <div className="botones">
          <button type="submit" className="btn-primary" disabled={enviando}>
            {enviando ? "Guardando..." : id ? "Actualizar" : "Registrar"}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate("/empleados")} disabled={enviando}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default GestionarEmpleado;