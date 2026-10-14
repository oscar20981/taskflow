/**
 * Reglas de respuesta (HU-06). No se usa inteligencia artificial: cada categoría
 * tiene una respuesta predefinida y existe una respuesta genérica para el resto.
 * Edita los textos para adaptarlos a la organización.
 */
export const REGLAS = {
  Informacion: {
    palabrasClave: ['horario', 'informacion', 'información', 'atencion', 'atención', 'direccion', 'dirección'],
    respuesta: () =>
      'Nuestro horario de atención es de lunes a viernes de 8:00 a. m. a 5:00 p. m. y sábados de 8:00 a. m. a 12:00 m. ' +
      'Para más información general escríbenos a info@taskflow.local.',
  },
  Soporte: {
    palabrasClave: ['acceso', 'acceder', 'contraseña', 'contrasena', 'error', 'falla', 'no puedo', 'problema', 'soporte'],
    respuesta: () =>
      'Para recuperar el acceso: 1) verifica tu usuario y contraseña, 2) usa la opción "¿Olvidaste tu contraseña?", ' +
      '3) si el problema continúa, contacta al canal de soporte: soporte@taskflow.local.',
  },
  Documento: {
    palabrasClave: ['certificado', 'documento', 'constancia', 'copia'],
    respuesta: () =>
      'Para solicitar un documento debes diligenciar el formulario de solicitud y adjuntar copia de tu documento de identidad. ' +
      'El trámite tarda 3 días hábiles y recibirás el documento en tu correo registrado.',
  },
  Consulta: {
    palabrasClave: ['estado', 'consulta', 'tramite', 'trámite', 'seguimiento', 'radicado'],
    respuesta: (s) =>
      `Tu consulta quedó registrada con el identificador ${String(s._id)}. ` +
      'Puedes ver el estado actualizado de tu trámite en el listado de solicitudes de TaskFlow.',
  },
  Actualizacion: {
    palabrasClave: ['actualizar', 'actualizacion', 'actualización', 'modificar', 'cambiar', 'datos'],
    respuesta: () =>
      'Para actualizar tus datos: 1) ingresa a tu perfil, 2) edita la información que cambió, ' +
      '3) adjunta el soporte correspondiente y 4) confirma. Verás reflejado el cambio en un plazo de 2 días hábiles.',
  },
};

export const RESPUESTA_GENERICA = () =>
  'Hemos recibido tu solicitud y fue registrada correctamente. Un asesor la revisará y te responderá lo antes posible.';

const normalizar = (texto = '') => String(texto).toLowerCase();

/**
 * Paso "Identificar categoría" del flujo del Worker:
 * 1) Si la categoría elegida por el usuario tiene regla, se usa esa.
 * 2) Si no (p. ej. "Otra"), se intenta deducir por palabras clave del título y la descripción.
 * 3) Si nada coincide, devuelve null y se usará la respuesta genérica.
 */
export const identificarCategoria = (solicitud) => {
  if (REGLAS[solicitud.categoria]) return solicitud.categoria;

  const texto = `${normalizar(solicitud.titulo)} ${normalizar(solicitud.descripcion)}`;
  const coincidencia = Object.entries(REGLAS).find(([, regla]) => regla.palabrasClave.some((p) => texto.includes(p)));
  return coincidencia ? coincidencia[0] : null;
};

export const generarRespuesta = (solicitud) => {
  const categoria = identificarCategoria(solicitud);
  const regla = categoria ? REGLAS[categoria] : null;
  return {
    categoria,
    generica: !regla,
    respuesta: regla ? regla.respuesta(solicitud) : RESPUESTA_GENERICA(solicitud),
  };
};
