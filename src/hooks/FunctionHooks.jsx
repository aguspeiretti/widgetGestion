export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};

export const redireccionWorkdrive = (url) => {
  if (url) {
    window.open(url, "_blank"); // Abre el enlace en una nueva pestaña
  } else {
    console.error("URL no válida");
  }
};

export function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
}

export const closeWidget = () => {
  window.ZOHO.CRM.UI.Popup.close().then(function (data) {});
};

export function formatDate(dateString) {
  const fecha = new Date(dateString);
  const day = fecha.getUTCDate(); // Obtener el día del mes en UTC
  const month = fecha.getUTCMonth() + 1; // Obtener el mes en UTC (con +1 porque los meses empiezan en 0)
  const year = fecha.getUTCFullYear(); // Obtener el año en UTC

  // Puedes ajustar el formato según tus preferencias
  return `${day}/${month}/${year}`;
}

export const getFieldValues = (fields, apiName) => {
  const field = fields.find((item) => item.api_name === apiName);
  return field ? field.pick_list_values || [] : [];
};
