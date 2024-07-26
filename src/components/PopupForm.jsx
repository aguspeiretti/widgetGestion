/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getRelatedRecords } from "../functions/apiFunctions";

const PopupForm = ({
  datos,
  registerID,
  onAddFormSet,
  onAddFormSet2,
  togglePopup,
  formSets,
  records,
  dark,
}) => {
  const tag = datos && datos.Tag ? datos.Tag[0].name : null;
  const [commentEdited, setCommentEdited] = useState(false);
  const [formData, setFormData] = useState({
    Name: "",
    Estado: "Pendiente",
    Coordinacion_asociada: registerID,
    Paginas_a_entregar: "",
    Fecha_entrega_profesional: "",
    Fecha_entrega_cliente: "",
    Fecha_reagendada: "",
    Comentario:
      tag === "Para traducir"
        ? "PARA TRADUCIR"
        : tag === "Traducir"
        ? "TRADUCCION"
        : "",
    Hora: "",
    // Correcciones: "",
    Urgente: false,
    Entreg_adelantado: false,
    Entrega_Gestor: "",
    Ocultar_entrega_gestor: "",
  });
  const [latestDates, setLatestDates] = useState({
    clientDate: null,
    professionalDate: null,
  });

  const getRecords = async () => {
    try {
      const response = await getRelatedRecords(
        "Coordinacion",
        registerID,
        "Entregas_asociadas"
      );
      const registros = response.register || [];

      const validFormSets = registros.filter((item) => item.Name !== "CO");
      console.log(validFormSets);

      return registros;
    } catch (error) {
      console.error(error);
    }
  };
  const getNextDeliveryNumber = async () => {
    const cantidadActual = await getRecords();
    console.log("1", cantidadActual);
    let nextNumber = 1;
    const validFormSets = cantidadActual.filter((item) => item.Name !== "CO");
    console.log(validFormSets.length);
    if (validFormSets.length > 0) {
      nextNumber = validFormSets.length + 1;
    }
    return nextNumber.toString();
  };

  const obtenerGestor = async () => {
    const data = {
      arguments: JSON.stringify({
        coord_actual_id: registerID,
      }),
    };
    try {
      const response = await window.ZOHO.CRM.FUNCTIONS.execute(
        "calcularnumeracionentregagestorindependiente",
        data
      );
      const gestor = response.details.output;
      setFormData((prevData) => ({
        ...prevData,
        Entrega_Gestor: gestor,
      }));
    } catch (error) {
      console.error("Error executing function:", error);
    }
  };

  useEffect(() => {
    if (formData.Fecha_entrega_profesional) {
      const nextWorkingDay = getNextWorkingDay(
        formData.Fecha_entrega_profesional,
        2
      );
      setFormData((prevData) => ({
        ...prevData,
        Fecha_entrega_cliente: nextWorkingDay,
      }));
    }
  }, [formData.Fecha_entrega_profesional]);

  useEffect(() => {
    obtenerGestor();
    getRecords();
    const fetchNextDeliveryNumber = async () => {
      const nextNumber = await getNextDeliveryNumber();
      setFormData((prevData) => ({
        ...prevData,
        Name: nextNumber,
      }));
    };

    fetchNextDeliveryNumber();
  }, []);

  useEffect(() => {
    if (records && records.length > 0) {
      findLatestDates();
    }
  }, [records]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await obtenerGestor();
    await getRecords();
    if (
      !formData.Fecha_entrega_cliente ||
      !formData.Fecha_entrega_profesional ||
      !formData.Paginas_a_entregar ||
      !formData.Entrega_Gestor
    ) {
      Swal.fire({
        icon: "error",
        title: "Campos obligatorios",
        text: "Fecha de cliente , entrega profesional , paginas y gestor son obligatorios",
      });
      return;
    }
    let finalCommentValue = formData.Comentario;
    if (!commentEdited && finalCommentValue === "") {
      if (tag === "Para traducir") {
        finalCommentValue = "PARA TRADUCIR";
      } else if (tag === "Traducir") {
        finalCommentValue = "TRADUCCION";
      }
    }
    // Lógica para determinar Estado_entrega_cliente
    let Estado_entrega_cliente = "";
    switch (formData.Estado) {
      case "Entregada":
        Estado_entrega_cliente = "Recibida";
        break;
      case "Correcciones":
        Estado_entrega_cliente = "Pendiente";
        break;
      case "Retrasada":
        // Deja el valor por defecto, que se asume como ""
        break;
      default:
        Estado_entrega_cliente = formData.Estado;
        break;
    }

    // Aquí verificamos si tag es "Traducir" para ajustar Ocultar_entrega_gestor
    const shouldHideDeliveryManager = tag === "Traducir";

    onAddFormSet({
      ...formData,
      Comentario: finalCommentValue,
      Ocultar_entrega_gestor: shouldHideDeliveryManager, // Ajustamos el valor aquí
      Estado_entrega_cliente: Estado_entrega_cliente, // Ajustamos el valor aquí
    });

    setFormData({
      Name: "",
      Estado: "Pendiente",
      Coordinacion_asociada: registerID,
      Paginas_a_entregar: "",
      Fecha_entrega_profesional: "",
      Fecha_entrega_cliente: "",
      Fecha_reagendada: "",
      Comentario: "",
      Hora: "",
      Urgente: false,
      Entreg_adelantado: false,
      Entrega_Gestor: "",
      Ocultar_entrega_gestor: false, // Aseguramos que se resetee a false si es necesario
    });

    if (tag === "Traducir") {
      console.log("si es");
    }

    const togglePopups = () => {
      setCommentEdited(false);
      togglePopup();
      // ... otras acciones de cierre del popup ...
    };

    togglePopups();
  };

  const getInitialComment = (tag) => {
    if (tag === "Para traducir") return "PARA TRADUCIR";
    if (tag === "Traducir") return "TRADUCCION";
    return "";
  };

  const handleSubmitWhithNew = async (e) => {
    e.preventDefault();
    await getRecords();

    if (
      !formData.Fecha_entrega_cliente ||
      !formData.Fecha_entrega_profesional ||
      !formData.Paginas_a_entregar ||
      !formData.Entrega_Gestor
    ) {
      Swal.fire({
        icon: "error",
        title: "Campos obligatorios",
        text: "Fecha de cliente , entrega profesional , paginas y gestor son obligatorios",
      });
      return;
    }
    let finalCommentValue = formData.Comentario;
    if (!commentEdited && finalCommentValue === "") {
      finalCommentValue = getInitialComment(tag);
    }
    // Lógica para determinar Estado_entrega_cliente
    let Estado_entrega_cliente = "";
    switch (formData.Estado) {
      case "Entregada":
        Estado_entrega_cliente = "Recibida";
        break;
      case "Correcciones":
        Estado_entrega_cliente = "Pendiente";
        break;
      case "Retrasada":
        Estado_entrega_cliente = Estado_entrega_cliente || "Pendiente";
        break;
      default:
        Estado_entrega_cliente = formData.Estado;
        break;
    }
    // Verificar y ajustar Estado_entrega_cliente si es -None-
    if (Estado_entrega_cliente === "-None-") {
      Estado_entrega_cliente = "Pendiente";
    }
    // Determinamos si debemos ocultar la entrega del gestor
    const shouldHideDeliveryManager = tag === "Traducir";

    onAddFormSet2({
      ...formData,
      Comentario: finalCommentValue,
      Ocultar_entrega_gestor: shouldHideDeliveryManager,
      Estado_entrega_cliente: Estado_entrega_cliente, // Ajustamos el valor aquí
    });

    setFormData({
      Name: "",
      Estado: "Pendiente",
      Coordinacion_asociada: registerID,
      Paginas_a_entregar: "",
      Fecha_entrega_profesional: "",
      Fecha_entrega_cliente: "",
      Fecha_reagendada: "",
      Comentario: getInitialComment(tag), // Usar la función auxiliar aquí
      Hora: "",
      Urgente: false,
      Entreg_adelantado: false,
      Entrega_Gestor: "",
      Ocultar_entrega_gestor: false, // Aseguramos que se resetee a false si es necesario
    });
    setCommentEdited(false);
    const fetchNextDeliveryNumber = async () => {
      const nextNumber = await getNextDeliveryNumber();
      setFormData((prevData) => ({
        ...prevData,
        Name: nextNumber,
      }));
    };
    setCommentEdited(false);
    setTimeout(() => {
      obtenerGestor();
    }, 2000);
    fetchNextDeliveryNumber();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "Comentario") {
      setCommentEdited(true);
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const getNextWorkingDay = (startDate, numberOfDays) => {
    let currentDate = new Date(startDate);
    let addedDays = 0;

    while (addedDays < numberOfDays) {
      currentDate.setDate(currentDate.getDate() + 1);
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Excluye domingos (0) y sábados (6)
        addedDays++;
      }
    }

    return currentDate.toISOString().split("T")[0]; // Formatea la fecha en YYYY-MM-DD
  };

  function formatDate(dateString) {
    if (dateString) {
      // Check if dateString is not null
      const [year, month, day] = dateString.split("-");
      return `${parseInt(day)}/${parseInt(month)}/${year}`;
    } else {
      return ""; // Or return any default value you prefer
    }
  }
  const findLatestDates = () => {
    let latestClientDate = null;
    let latestProfessionalDate = null;

    records.forEach((record) => {
      if (record.Fecha_entrega_cliente) {
        const clientDate = new Date(record.Fecha_entrega_cliente);
        if (!latestClientDate || clientDate > latestClientDate) {
          latestClientDate = clientDate;
        }
      }
      if (record.Fecha_entrega_profesional) {
        const professionalDate = new Date(record.Fecha_entrega_profesional);
        if (
          !latestProfessionalDate ||
          professionalDate > latestProfessionalDate
        ) {
          latestProfessionalDate = professionalDate;
        }
      }
    });

    setLatestDates({
      clientDate: latestClientDate
        ? latestClientDate.toISOString().split("T")[0]
        : null,
      professionalDate: latestProfessionalDate
        ? latestProfessionalDate.toISOString().split("T")[0]
        : null,
    });
  };
  if (latestDates && latestDates.clientDate) {
    // Check if latestDates exists and clientDate has a value
    const formattedClientDate = formatDate(latestDates.clientDate);
    console.log(formattedClientDate); // Replace with your desired action
  } else {
    console.log(
      "latestDates.clientDate is null or latestDates does not exist."
    );
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-950  bg-opacity-50 backdrop-blur-sm z-50 ">
      <div
        className={`${
          dark ? "bg-[#2f374c]" : "bg-[#f0f1f1]"
        } p-6 rounded-lg  w-[40%] h-[90%] shadow-[0px_0px_30px_rgba(234,234,234,0.5)] `}
      >
        <div className="flex items-center justify-between ">
          <h2
            className={`text-xl ${
              dark ? "text-[#ff862e]" : "text-[#2e27e9]"
            }  font-semibold mb-4`}
          >
            Nueva Entrada
          </h2>
        </div>
        <form onSubmit={handleSubmit} className=" h-[90%] ">
          <div className="flex w-[100%] h-full ">
            <div className="w-[100%] h-full flex flex-col justify-between  ">
              <div className="mb-4 flex items-center justify-between  ">
                <label
                  htmlFor="Paginas_a_entregar"
                  className={`block text-md 4xl:text-lg font-medium ${
                    dark ? "text-white" : "text-black"
                  }  mr-4`}
                >
                  Nº de entrega
                </label>
                <input
                  type="text"
                  id="Name"
                  name="Name"
                  value={formData.Name}
                  onChange={handleChange}
                  className={`block border-2 w-[125px] text-center border-none rounded-md shadow-sm ${
                    dark ? "bg-[#222631]" : "bg-white"
                  } ${
                    dark ? "text-white" : "text-black"
                  } sm:text-md 4xl:text-lg`}
                />
              </div>
              <div className="mb-4 flex items-center justify-between ">
                <label
                  htmlFor="Name"
                  className={`block text-md 4xl:text-lg font-medium ${
                    dark ? "text-white" : "text-black"
                  }  mr-4`}
                >
                  Nº Entrega Gestor
                </label>
                <input
                  type="text"
                  id="Entrega_Gestor"
                  name="Entrega_Gestor"
                  value={formData.Entrega_Gestor}
                  onChange={handleChange}
                  className={`block border-2 w-[125px] text-center border-none rounded-md shadow-sm ${
                    dark ? "bg-[#222631]" : "bg-white"
                  } ${
                    dark ? "text-white" : "text-black"
                  } sm:text-md 4xl:text-lg`}
                />
              </div>
              <div className="mb-4 w-full flex items-center justify-between">
                <label
                  htmlFor="Estado"
                  className={`block text-md 4xl:text-lg font-medium ${
                    dark ? "text-white" : "text-black"
                  }  mr-4`}
                >
                  Estado
                </label>

                <select
                  id="Estado"
                  name="Estado"
                  value={formData.Estado}
                  onChange={handleChange}
                  className={`block border-2 w-[125px] text-center border-none rounded-md shadow-sm ${
                    dark ? "bg-[#222631]" : "bg-white"
                  } ${
                    dark ? "text-white" : "text-black"
                  } sm:text-md 4xl:text-lg`}
                >
                  <option value="None">-None-</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Entregada">Entregada</option>
                  <option value="Paralizada">Paralizada</option>
                  <option value="Retrasada">Retrasada</option>
                  {/* <option value="Correcciones">Correcciones</option> */}
                  {/* <option value="Entrega asignada">Entrega asignada</option> */}
                  <option value="Caida">Caida</option>
                </select>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <label
                  htmlFor="Paginas_a_entregar"
                  className={`block text-md 4xl:text-lg font-medium ${
                    dark ? "text-white" : "text-black"
                  }  mr-4`}
                >
                  Páginas a entregar
                </label>
                <input
                  type="text"
                  id="Paginas_a_entregar"
                  name="Paginas_a_entregar"
                  value={formData.Paginas_a_entregar}
                  onChange={handleChange}
                  className={`block border-2 w-[125px] text-center border-none rounded-md shadow-sm ${
                    dark ? "bg-[#222631]" : "bg-white"
                  } ${
                    dark ? "text-white" : "text-black"
                  } sm:text-md 4xl:text-lg`}
                />
              </div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="Fecha_entrega_profesional"
                  className={`block text-md 4xl:text-lg font-medium ${
                    dark ? "text-white" : "text-black"
                  }  mr-4`}
                >
                  Fecha entrega profesional
                </label>
                <input
                  type="date"
                  id="Fecha_entrega_profesional"
                  name="Fecha_entrega_profesional"
                  value={formData.Fecha_entrega_profesional}
                  onChange={handleChange}
                  className={`block border-2 w-[125px] text-center border-none rounded-md shadow-sm ${
                    dark ? "bg-[#222631]" : "bg-white"
                  } ${
                    dark ? "text-white" : "text-black"
                  } sm:text-md 4xl:text-lg`}
                />
              </div>
              <p className="text-sm text-[#f73463] font-semibold mb-2">
                {latestDates.professionalDate
                  ? formatDate(latestDates.professionalDate) +
                    " es la fecha anteriormente agendada para el profesional en este proyecto"
                  : "No hay fechas anteriores"}
              </p>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="Fecha_entrega_cliente"
                  className={`block text-md 4xl:text-lg font-medium ${
                    dark ? "text-white" : "text-black"
                  }  mr-4`}
                >
                  Fecha entrega cliente
                </label>
                <input
                  type="date"
                  id="Fecha_entrega_cliente"
                  name="Fecha_entrega_cliente"
                  value={formData.Fecha_entrega_cliente}
                  onChange={handleChange}
                  className={`block border-2 w-[125px] text-center border-none rounded-md shadow-sm ${
                    dark ? "bg-[#222631]" : "bg-white"
                  } ${
                    dark ? "text-white" : "text-black"
                  } sm:text-md 4xl:text-lg`}
                />
              </div>
              <p className="text-sm text-[#f73463] font-semibold mb-2">
                {latestDates.clientDate
                  ? formatDate(latestDates.clientDate) +
                    " es la fecha anteriormente agendada para el cliente en este proyecto"
                  : "No hay fechas anteriores"}
              </p>
              <div className="mb-4 flex items-center justify-between">
                <label
                  htmlFor="Hora"
                  className={`block text-md 4xl:text-lg font-medium ${
                    dark ? "text-white" : "text-black"
                  }  mr-4`}
                >
                  Hora profesional
                </label>
                <input
                  type="time"
                  id="Hora"
                  name="Hora"
                  value={formData.Hora}
                  onChange={handleChange}
                  className={`block border-2 w-[125px] text-center border-none rounded-md shadow-sm ${
                    dark ? "bg-[#222631]" : "bg-white"
                  } ${
                    dark ? "text-white" : "text-black"
                  } sm:text-md 4xl:text-lg`}
                />
              </div>
              <div className="flex justify-between  mt-2">
                <div className="mb-4 flex items-center">
                  <label
                    htmlFor="Urgente"
                    className={`block text-md 4xl:text-lg font-medium ${
                      dark ? "text-white" : "text-black"
                    }  mr-4`}
                  >
                    Urgente?
                  </label>
                  <div className="flex justify-center items-center">
                    <input
                      type="checkbox"
                      id="Urgente"
                      name="Urgente"
                      checked={formData.Urgente}
                      onChange={handleChange}
                      className="rounded-md w-4 h-4 mt-1 ml-6"
                    />
                  </div>
                </div>
                {/* <div className="mb-4 flex items-center">
                  <label
                    htmlFor="Entreg_adelantado"
                    className="block text-md 4xl:text-lg font-medium text-white"
                  >
                    Entregó adelantado
                  </label>
                  <div className="flex justify-center items-center">
                    <input
                      type="checkbox"
                      id="Entreg_adelantado"
                      name="Entreg_adelantado"
                      checked={formData.Entreg_adelantado}
                      onChange={handleChange}
                      className="rounded-md w-4 h-4 mt-1 ml-6"
                    />
                  </div>
                </div> */}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="Comentario"
                  className={`block text-md 4xl:text-lg font-medium ${
                    dark ? "text-white" : "text-black"
                  }  mr-4`}
                >
                  Comentario
                </label>
                <textarea
                  id="Comentario"
                  name="Comentario"
                  value={formData.Comentario}
                  onChange={handleChange}
                  className={`mt-1 block w-full border-2 pl-2 pt-1 border-none  rounded-md shadow-sm  ${
                    dark ? "bg-[#222631]" : "bg-white"
                  } text-white sm:text-md 4xl:text-lg`}
                ></textarea>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-md 4xl:text-lg font-medium rounded-md text-white bg-[#43d1a7] hover:bg-[#37c298] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Guardar
                </button>
                <div
                  onClick={handleSubmitWhithNew}
                  className="cursor-pointer inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-md 4xl:text-lg font-medium rounded-md text-white bg-[#43d1a7] hover:bg-[#37c298] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Guardar y nuevo
                </div>
                <button
                  onClick={() => togglePopup()}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-md 4xl:text-lg font-medium rounded-md text-white bg-[#f74363] hover:bg-[#db3a58] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PopupForm;
