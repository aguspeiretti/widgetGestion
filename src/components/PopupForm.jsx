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
  estadosProduccion,
}) => {
  const tag = datos && datos.Tag ? datos.Tag.map((tag) => tag.name) : [];
  const comentario = tag.includes("Para traducir")
    ? "PARA TRADUCIR"
    : tag.includes("Traducir")
    ? "TRADUCCION"
    : "";
  const [commentEdited, setCommentEdited] = useState(false);
  const [registros, setRegistros] = useState([]);
  const [formData, setFormData] = useState({
    Name: "",
    Fecha_reagendada_prod_interna: "",
    Fecha_produccion_interna: "",
    Estado_produccion_interna: "",
    Estado: "Pendiente",
    Coordinacion_asociada: registerID,
    Paginas_a_entregar: "",
    Fecha_entrega_profesional: "",
    Fecha_entrega_cliente: "",
    Fecha_reagendada: "",
    Comentario: comentario,
    Hora: "",
    // Correcciones: "",
    Urgente: false,
    Entreg_adelantado: false,
    Entrega_Gestor: "",
    Ocultar_entrega_gestor: "",
    Creado_por_widget: false,
  });

  const [latestDates, setLatestDates] = useState({
    clientDate: null,
    professionalDate: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const getRecords = async () => {
    try {
      const response = await getRelatedRecords(
        "Coordinacion",
        registerID,
        "Entregas_asociadas"
      );
      const registros = response.register || [];
      setRegistros(registros);
      return registros;
    } catch (error) {
      console.error(error);
    }
  };
  const getNextDeliveryNumber = async () => {
    const cantidadActual = await getRecords();

    let nextNumber = 1;
    const validFormSets = cantidadActual.filter((item) => item.Name !== "CO");

    if (validFormSets.length > 0) {
      nextNumber = validFormSets.length + 1;
    }
    return nextNumber.toString();
  };

  useEffect(() => {
    function ajustarAFechaHabil(fecha) {
      const diaSemana = fecha.getUTCDay();
      if (diaSemana === 6) {
        // Si es sábado, mover al lunes (2 días adelante)
        fecha.setUTCDate(fecha.getUTCDate() + 3);
      } else if (diaSemana === 0) {
        // Si es domingo, mover al lunes (1 día adelante)
        fecha.setUTCDate(fecha.getUTCDate() + 2);
      } else if (diaSemana === 5) {
        // Si es domingo, mover al lunes (1 día adelante)
        fecha.setUTCDate(fecha.getUTCDate() + 4);
      } else if (diaSemana === 1) {
        // Si es domingo, mover al lunes (1 día adelante)
        fecha.setUTCDate(fecha.getUTCDate() + 2);
      } else if (diaSemana === 2) {
        // Si es domingo, mover al lunes (1 día adelante)
        fecha.setUTCDate(fecha.getUTCDate() + 2);
      } else if (diaSemana === 3) {
        // Si es domingo, mover al lunes (1 día adelante)
        fecha.setUTCDate(fecha.getUTCDate() + 2);
      } else if (diaSemana === 4) {
        // Si es domingo, mover al lunes (1 día adelante)
        fecha.setUTCDate(fecha.getUTCDate() + 4);
      }
      return fecha;
    }
    if (
      formData.Fecha_produccion_interna &&
      datos?.Procesos_especiales === "PD produccion interna"
    ) {
      const profesionalDate = new Date(formData.Fecha_produccion_interna);
      const profesionalDateUTC = new Date(
        Date.UTC(
          profesionalDate.getUTCFullYear(),
          profesionalDate.getUTCMonth(),
          profesionalDate.getUTCDate()
        )
      );

      let fechaProfesional = new Date(profesionalDateUTC);
      fechaProfesional.setUTCDate(fechaProfesional.getUTCDate() + 7);
      fechaProfesional = ajustarAFechaHabil(fechaProfesional); // Ajustar si cae en fin de semana

      let fechaCliente = new Date(fechaProfesional);
      fechaCliente.setUTCDate(fechaCliente.getUTCDate() + 4);
      fechaCliente = ajustarAFechaHabil(fechaCliente); // Ajustar si cae en fin de semana

      // Convertir a formato YYYY-MM-DD
      const formattedProfecionalDate = fechaProfesional
        .toISOString()
        .split("T")[0];
      const formattedClientDate = fechaCliente.toISOString().split("T")[0];

      setFormData((prevFormSets) => ({
        ...prevFormSets,

        Fecha_entrega_profesional: formattedProfecionalDate,
        Fecha_entrega_cliente: formattedClientDate,
        Editado_por_widget: true,
      }));
    }
  }, [formData.Fecha_produccion_interna]);

  useEffect(() => {
    if (
      formData.Fecha_entrega_profesional &&
      datos?.Procesos_especiales === "PD produccion interna"
    ) {
      // If manually modified in PD production mode, update client date with 4 business days
      const profesionalDate = new Date(formData.Fecha_entrega_profesional);
      const profesionalDateUTC = new Date(
        Date.UTC(
          profesionalDate.getUTCFullYear(),
          profesionalDate.getUTCMonth(),
          profesionalDate.getUTCDate()
        )
      );

      function ajustarAFechaHabil(fecha) {
        const diaSemana = fecha.getUTCDay();
        if (diaSemana === 6) {
          // Si es sábado, mover al lunes (2 días adelante)
          fecha.setUTCDate(fecha.getUTCDate() + 3);
        } else if (diaSemana === 0) {
          // Si es domingo, mover al lunes (1 día adelante)
          fecha.setUTCDate(fecha.getUTCDate() + 2);
        } else if (diaSemana === 5) {
          // Si es domingo, mover al lunes (1 día adelante)
          fecha.setUTCDate(fecha.getUTCDate() + 4);
        } else if (diaSemana === 1) {
          // Si es domingo, mover al lunes (1 día adelante)
          fecha.setUTCDate(fecha.getUTCDate() + 2);
        } else if (diaSemana === 2) {
          // Si es domingo, mover al lunes (1 día adelante)
          fecha.setUTCDate(fecha.getUTCDate() + 2);
        } else if (diaSemana === 3) {
          // Si es domingo, mover al lunes (1 día adelante)
          fecha.setUTCDate(fecha.getUTCDate() + 2);
        } else if (diaSemana === 4) {
          // Si es domingo, mover al lunes (1 día adelante)
          fecha.setUTCDate(fecha.getUTCDate() + 4);
        }
        return fecha;
      }

      // Calculate client date (4 business days after professional date)
      let fechaCliente = new Date(profesionalDateUTC);
      fechaCliente.setUTCDate(fechaCliente.getUTCDate() + 4);
      fechaCliente = ajustarAFechaHabil(fechaCliente); // Adjust if weekend

      // Format date as YYYY-MM-DD
      const formattedClientDate = fechaCliente.toISOString().split("T")[0];

      setFormData((prevData) => ({
        ...prevData,
        Fecha_entrega_cliente: formattedClientDate,
        Editado_por_widget: true,
      }));
    }
  }, [formData.Fecha_entrega_profesional]);

  useEffect(() => {
    if (
      formData.Fecha_entrega_profesional &&
      datos?.Procesos_especiales !== "PD produccion interna"
    ) {
      // Convert the professional delivery date to a Date object
      const profesionalDate = new Date(formData.Fecha_entrega_profesional);

      const profesionalDateUTC = new Date(
        Date.UTC(
          profesionalDate.getUTCFullYear(),
          profesionalDate.getUTCMonth(),
          profesionalDate.getUTCDate(),
          profesionalDate.getUTCHours(),
          profesionalDate.getUTCMinutes(),
          profesionalDate.getUTCSeconds()
        )
      );

      const profesionalDayOfWeek = profesionalDateUTC.getUTCDay();
      const clientDate = new Date(profesionalDateUTC);

      // Apply specific rules based on the day of the week
      switch (profesionalDayOfWeek) {
        case 4: // Thursday
          // If professional date is Thursday, client date is next Monday (+4 days)
          clientDate.setUTCDate(profesionalDateUTC.getUTCDate() + 4);
          break;

        case 5: // Friday
          // If professional date is Friday, client date is next Tuesday (+4 days)
          clientDate.setUTCDate(profesionalDateUTC.getUTCDate() + 4);
          break;

        case 6: // Saturday
          // If professional date is Saturday, client date is next Tuesday (+3 days)
          clientDate.setUTCDate(profesionalDateUTC.getUTCDate() + 3);
          break;

        default:
          // For all other days, add 2 days (original rule)
          clientDate.setUTCDate(profesionalDateUTC.getUTCDate() + 2);
          break;
      }

      // Format the date as a string
      const formattedClientDate = clientDate.toISOString().split("T")[0];

      // Update form data with the new client delivery date
      setFormData((prevData) => ({
        ...prevData,
        Fecha_entrega_cliente: formattedClientDate,
      }));
    }
  }, [formData.Fecha_entrega_profesional]);

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
  }, [registerID]);

  useEffect(() => {
    if (records) {
      findLatestDates();
    }
  }, [registros, records]);

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      Fecha_entrega_profesional: latestDates.professionalDate,
    }));
    setTimeout(() => {
      setFormData((prevData) => ({
        ...prevData,
        Fecha_entrega_cliente: latestDates.clientDate,
      }));
    }, 2000);
  }, [latestDates.professionalDate, latestDates.clientDate]);

  const getInitialComment = (tag) => {
    if (tag === "Para traducir") return "PARA TRADUCIR";
    if (tag === "Traducir") return "TRADUCCION";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Evita envíos si ya se está procesando

    setIsSubmitting(true);
    await obtenerGestor();
    if (datos?.Procesos_especiales === "PD produccion interna") {
      if (
        formData.Estado_produccion_interna === "" ||
        formData.Estado_produccion_interna === null ||
        formData.Estado_produccion_interna === undefined ||
        !formData.Fecha_produccion_interna
      ) {
        Swal.fire({
          icon: "error",
          title: "Campos obligatorios",
          text: "Estado de produccion interna y Fecha de produccion interna ",
        });
        setIsSubmitting(false); // Finaliza el estado de carga
        return;
      }
    }

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
      setCommentEdited(false);
      setIsSubmitting(false); // Inicia el estado de carga
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
    // Aquí verificamos si tag es "Traducir" para ajustar Ocultar_entrega_gestor
    const shouldHideDeliveryManager = tag === "Traducir";

    onAddFormSet({
      ...formData,
      Comentario: finalCommentValue,
      Ocultar_entrega_gestor: shouldHideDeliveryManager, // Ajustamos el valor aquí
      Estado_entrega_cliente: Estado_entrega_cliente, // Ajustamos el valor aquí
      Creado_por_widget: true,
    });

    setFormData({
      Name: "",
      Fecha_reagendada_prod_interna: "",
      Fecha_produccion_interna: "",
      Estado_produccion_interna: "",
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
    }

    const togglePopups = () => {
      setCommentEdited(false);
      togglePopup();
      // ... otras acciones de cierre del popup ...
    };

    togglePopups();
    setIsSubmitting(false); // Finaliza el estado de carga
    await getRecords();
  };

  const handleSubmitWhithNew = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Evita envíos si ya se está procesando

    setIsSubmitting(true);
    if (datos?.Procesos_especiales === "PD produccion interna") {
      if (
        formData.Estado_produccion_interna === "" ||
        formData.Estado_produccion_interna === null ||
        formData.Estado_produccion_interna === undefined ||
        !formData.Fecha_produccion_interna
      ) {
        Swal.fire({
          icon: "error",
          title: "Campos obligatorios",
          text: "Estado de produccion interna y Fecha de produccion interna ",
        });
        setIsSubmitting(false); // Finaliza el estado de carga
        return;
      }
    }

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
      setIsSubmitting(false); // Finaliza el estado de carga
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
      Creado_por_widget: true,
    });

    setFormData({
      Name: "",
      Fecha_reagendada_prod_interna: "",
      Fecha_produccion_interna: "",
      Estado_produccion_interna: "",
      Estado: "Pendiente",
      Coordinacion_asociada: registerID,
      Paginas_a_entregar: "",
      Fecha_entrega_profesional: "",
      Fecha_entrega_cliente: "",
      Fecha_reagendada: "",
      Comentario: comentario,
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

    setTimeout(() => {
      fetchNextDeliveryNumber();
    }, 2000);
    setCommentEdited(false);
    setTimeout(() => {
      obtenerGestor();
    }, 2000);
    setIsSubmitting(false); // Inicia el estado de carga
    await getRecords();
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

    registros.forEach((record) => {
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

  useEffect(() => {
    if (records && records.length > 0) {
      findLatestDates();
    }
  }, [records]);

  const formattedClientDate = formatDate(latestDates?.clientDate ?? null);

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-950  bg-opacity-30  z-50 ">
      <div
        className={`${
          dark ? "bg-[#2f374c]" : "bg-[#f0f1f1]"
        } p-6 rounded-lg  w-[40%] h-[90%] overflow-auto shadow-[0px_0px_30px_rgba(234,234,234,0.5)] `}
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
                  value={formData.Name || ""}
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
                  value={formData.Entrega_Gestor || ""}
                  onChange={handleChange}
                  className={`block border-2 w-[125px] text-center border-none rounded-md shadow-sm ${
                    dark ? "bg-[#222631]" : "bg-white"
                  } ${
                    dark ? "text-white" : "text-black"
                  } sm:text-md 4xl:text-lg`}
                />
              </div>

              {datos?.Procesos_especiales === "PD produccion interna" && (
                <>
                  <div className="mb-4 flex items-center justify-between ">
                    <label
                      htmlFor="Name"
                      className={`block text-md 4xl:text-lg font-medium ${
                        dark ? "text-white" : "text-black"
                      }  mr-4`}
                    >
                      E. prod interna
                    </label>
                    <select
                      id="Estado_produccion_interna"
                      name="Estado_produccion_interna"
                      value={formData.Estado_produccion_interna}
                      className={`block border-2 w-[125px]  text-center border-none p-1 rounded-md shadow-sm ${
                        dark ? "bg-[#222631]" : "bg-white"
                      } ${dark ? "text-[#dddee0]" : "text-zinc-800"}  `}
                      onChange={handleChange}
                    >
                      {estadosProduccion?.map((e) => (
                        <option key={e.display_value} value={e.display_value}>
                          {e.display_value}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4 flex items-center justify-between ">
                    <label
                      htmlFor="Name"
                      className={`block text-md 4xl:text-lg font-medium ${
                        dark ? "text-white" : "text-black"
                      }  mr-4`}
                    >
                      Fecha. prod interna
                    </label>
                    <input
                      type="date"
                      id={`Fecha_produccion_interna`}
                      name={`Fecha_produccion_interna`}
                      value={formData.Fecha_produccion_interna || ""}
                      onChange={handleChange}
                      className={`block border-2 w-[125px]  text-center border-none p-1 rounded-md shadow-sm ${
                        dark ? "bg-[#222631]" : "bg-white"
                      } ${dark ? "text-[#dddee0]" : "text-zinc-800"}  `}
                    />
                  </div>
                  {/* <div className="mb-4 flex items-center justify-between ">
                    <label
                      htmlFor="Name"
                      className={`block text-md 4xl:text-lg font-medium ${
                        dark ? "text-white" : "text-black"
                      }  mr-4`}
                    >
                      Fecha. prod interna reagendada
                    </label>
                    <input
                      type="date"
                      id={`Fecha_reagendada_prod_interna`}
                      name={`Fecha_reagendada_prod_interna`}
                      value={formData.Fecha_reagendada_prod_interna || ""}
                      onChange={handleChange}
                      className={`block border-2 w-[125px]  text-center border-none p-1 rounded-md shadow-sm ${
                        dark ? "bg-[#222631]" : "bg-white"
                      } ${dark ? "text-[#dddee0]" : "text-zinc-800"}  `}
                    />
                  </div> */}
                </>
              )}

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
                  value={formData.Estado || "Pendiente"}
                  onChange={handleChange}
                  className={`block border-2 w-[125px] text-center border-none rounded-md shadow-sm ${
                    dark ? "bg-[#222631]" : "bg-white"
                  } ${
                    dark ? "text-white" : "text-black"
                  } sm:text-md 4xl:text-lg`}
                >
                  {/* <option value="None">-None-</option> */}
                  <option value="Pendiente">Pendiente</option>
                  <option value="Entregada">Entregada</option>
                  <option value="Paralizada">Paralizada</option>
                  <option value="Retrasada">Retrasada</option>
                  {/* <option value="Correcciones">Correcciones</option> */}
                  {/* <option value="Entrega asignada">Entrega asignada</option> */}
                  <option value="Caida">Caida</option>
                  <option value="Incompleta">Incompleta</option>
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
                  value={formData.Paginas_a_entregar || ""}
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
                  value={formData.Fecha_entrega_profesional || ""}
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
                  value={formData.Fecha_entrega_cliente || ""}
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
                  value={formData.Hora || ""}
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
                      checked={formData.Urgente || false}
                      onChange={handleChange}
                      className="rounded-md w-4 h-4 mt-1 ml-6"
                    />
                  </div>
                </div>
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
                  value={formData.Comentario || ""}
                  onChange={handleChange}
                  className={`mt-1 block w-full border-2 pl-2 pt-1 border-none  rounded-md shadow-sm  ${
                    dark ? "bg-[#222631]" : "bg-white"
                  } ${
                    dark ? "text-white" : "text-black"
                  } sm:text-md 4xl:text-lg`}
                ></textarea>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-md 4xl:text-lg font-medium rounded-md text-white bg-[#43d1a7] hover:bg-[#37c298] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Guardar
                </button>
                <div
                  onClick={handleSubmitWhithNew}
                  disabled={isSubmitting}
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
