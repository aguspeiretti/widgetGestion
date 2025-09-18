/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import "./home.css";
import {
  deleteRecord,
  getRelatedRecords,
  insertRecord,
  insertRecord2,
  updateRecord,
  deleteAllRecords,
} from "../functions/apiFunctions";
import {
  isValidUrl,
  redireccionWorkdrive,
  truncateText,
  closeWidget,
  formatDate,
  getFieldValues,
} from "../hooks/FunctionHooks";
import useRecordStore from "../context/recodStore";
import PopupCoForm from "../components/PopupCoForm";
import PopupForm from "../components/PopupForm";
import Swal from "sweetalert2";
import Eleccion from "../components/Eleccion";
import BarraNavegacionSuperior from "../components/BarraNavegacionSuperior";
import SegundaBarraDeNavegacion from "../components/SegundaBarraDeNavegacion";
import BarraNavegacionLateral from "../components/BarraNavegacionLateral";
import DropCustom from "../components/DropCustom";
import rechazo from "../assets/rechazo.png";
import carpeta from "../assets/carpeta.png";
import ia from "../assets/Untitled-1.gif";

import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { BsMoonStars, BsSunFill } from "react-icons/bs";

const Home = ({ datos, registerID, handleResize }) => {
  const [filter, setFilter] = useState("Todas");
  const [eleccion, setEleccion] = useState(false);
  const [formSets, setFormSets] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showPopupCo, setShowPopupCo] = useState(false);
  const [modifiedIndexes, setModifiedIndexes] = useState([]);
  const entregasNumerdas = formSets.filter((entry) => entry.Name !== "CO");
  const entregaCorrecciones = formSets.filter((entry) => entry.Name === "CO");
  const { getRelatedRecord, records } = useRecordStore();
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [expandedCardId2, setExpandedCardId2] = useState(null);
  const [selectedMotivos, setSelectedMotivos] = useState({});
  const [motivosLuncher, setMotivosLuncher] = useState(false);
  const [fields, setFields] = useState([]);
  const [dropOpen, setDropOpen] = useState(false);
  const [realizarGuardado, setRealizarGuardado] = useState(false);
  const [enviarEntrega, setEnviarEntrega] = useState(false);
  const [dark, setDark] = useState(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    return savedDarkMode ? JSON.parse(savedDarkMode) : false;
  });

  const filterMap = {
    "Entrega Numerada": entregasNumerdas,
    "Entrega Correcciones": entregaCorrecciones,
    default: formSets,
  };

  const filtredEntys = [...(filterMap[filter] || filterMap.default)];

  useEffect(() => {
    getFields();
  }, []);
  useEffect(() => {
    getRecords();
  }, [records]);
  const CargarCarpetas = () => {
    setTimeout(() => {
      especificRecords();
    }, 5000);
  };
  useEffect(() => {
    const initialMotivos = {}; // Crear un objeto inicial

    // Iterar sobre los formularios para construir el estado inicial
    filtredEntys.forEach((form) => {
      initialMotivos[form.id] = form.Motivo_no_procesada?.reduce(
        (acc, motivo) => {
          acc[motivo] = true; // Marcar como `true` los valores existentes
          return acc;
        },
        {}
      );
    });

    setSelectedMotivos(initialMotivos); // Establecer el estado inicial
  }, [motivosLuncher]);

  const cargarRegistros = async () => {
    try {
      // Muestra la alerta de carga
      CargarCarpetas();
      Swal.fire({
        title: "Cargando registros",
        text: "Por favor espera...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading(); // Muestra el indicador de carga
        },
      });

      // await sleep(3000); // Simula un retraso de 3 segundos
      await getRelatedRecord(registerID); // Llama a tu función principal

      // Cierra la alerta después de que todo termine
      Swal.close();

      // Opcional: Muestra una alerta de éxito
    } catch (error) {
      // Cierra la alerta de carga en caso de error
      Swal.close();

      // Opcional: Muestra una alerta de error
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al cargar los registros.",
      });
    }
  };
  const getRecords = async () => {
    console.log("getRecords");

    try {
      const response = await getRelatedRecords(
        "Coordinacion",
        registerID,
        "Entregas_asociadas"
      );

      // Verifica si response y response.register están definidos y si es un array
      if (!response || !Array.isArray(response.register)) {
        throw new Error("La respuesta no contiene un array de registros");
      }

      // Procesa los registros
      const datos = response.register.map((record) => ({
        id: record.id,
        ...record,
      }));

      // Ordena los registros por fecha
      const orderedFormSets = datos.sort((a, b) => {
        // Asegúrate de que las fechas están en un formato válido
        const fechaA = new Date(a.Fecha_entrega_profesional);
        const fechaB = new Date(b.Fecha_entrega_profesional);
        if (isNaN(fechaA) || isNaN(fechaB)) {
          console.warn(
            "Una de las fechas no es válida:",
            a.Fecha_entrega_profesional,
            b.Fecha_entrega_profesional
          );
          return 0; // Si las fechas no son válidas, no ordena estas entradas
        }
        return fechaA - fechaB;
      });

      setFormSets(orderedFormSets);
      setMotivosLuncher(!motivosLuncher);
    } catch (error) {
      console.error("Error al obtener registros:", error);
    }
  };
  const toggleCard = (cardId) => {
    setExpandedCardId(cardId === expandedCardId ? null : cardId);
  };
  const toggleCard2 = (cardId) => {
    setExpandedCardId2(cardId === expandedCardId2 ? null : cardId);
  };
  const togglePopup = () => {
    setShowPopup(!showPopup);
    setEleccion(false);
  };
  const togglePopupCo = () => {
    setShowPopupCo(!showPopupCo);
    setEleccion(false);
  };
  const delRecord = async (id) => {
    if (hasUnsavedChanges()) {
      const result = await Swal.fire({
        title: "¿Guardar cambios antes de eliminar?",
        text: "Hay cambios sin guardar. Al eliminar la tarjeta los cambios se guardaran automaticamente!",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, Eliminar",
        cancelButtonText: "No",
      });

      if (result.isConfirmed) {
        await saveAllChangesWhithOutClose();

        try {
          Swal.fire({
            title: "Eliminando entrega",
            text: "Por favor espere...",
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
              Swal.showLoading();
            },
          });
          const deleteResult = await deleteRecord(id, false);

          if (deleteResult.status === "success") {
            setFormSets((prevFormSets) =>
              prevFormSets.filter((form) => form.id !== id)
            );

            Swal.fire(
              "Eliminado",
              "El registro se ha eliminado correctamente.",
              "success"
            );
          } else {
            let errorMessage =
              "No se pudo eliminar el registro. Contacte con el administrador ";

            console.error("Error al eliminar el registro:", deleteResult);

            Swal.fire({
              title: "Error",
              text: errorMessage,
              icon: "error",
            });
          }
        } catch (error) {
          console.error("Error inesperado al eliminar el registro:", error);
          Swal.fire(
            "Error",
            "Hubo un problema inesperado al eliminar el registro",
            "error"
          );
        }

        Swal.close(); // Cierra el mensaje de guardando
      }
    } else {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: "Eliminando entrega",
            text: "Por favor espere...",
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
              Swal.showLoading();
            },
          });

          const deleteResult = await deleteRecord(id, false);

          if (deleteResult.status === "success") {
            setFormSets((prevFormSets) =>
              prevFormSets.filter((form) => form.id !== id)
            );

            Swal.fire(
              "Eliminado",
              "El registro se ha eliminado correctamente.",
              "success"
            );
          } else {
            let errorMessage =
              "No se pudo eliminar el registro. Contacte con el administrador ";

            console.error("Error al eliminar el registro:", deleteResult);

            Swal.fire({
              title: "Error",
              text: errorMessage,
              icon: "error",
            });
          }
        } catch (error) {
          console.error("Error inesperado al eliminar el registro:", error);
          Swal.fire(
            "Error",
            "Hubo un problema inesperado al eliminar el registro",
            "error"
          );
        }
      } else {
        Swal.fire("Cancelado", "El registro no se ha eliminado", "info");
      }
    }
  };
  const delAllRecords = async () => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará todas las entregas y no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar todas",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Eliminando entregas",
          text: "Por favor espere...",
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });

        const deleteResult = await deleteAllRecords(formSets);

        let successCount = deleteResult.results.filter(
          (result) => result.status === "success"
        ).length;
        let failedCount = deleteResult.results.length - successCount;

        // Actualizamos el estado con las entregas restantes
        let remainingEntregas = formSets.filter(
          (entrega) =>
            !deleteResult.results.find(
              (result) =>
                result.id === entrega.id && result.status === "success"
            )
        );

        setFormSets(remainingEntregas);

        if (failedCount > 0) {
          const retryResult = await Swal.fire({
            title: "Algunas entregas no se pudieron eliminar",
            html: `
              <p>${successCount} de ${formSets.length} entregas han sido eliminadas. ${failedCount} fallaron.</p>
              <p>¿Desea intentar eliminar las ${failedCount} entregas restantes?</p>
            `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, reintentar",
            cancelButtonText: "No, dejar como está",
          });

          if (retryResult.isConfirmed) {
            return delAllRecords(); // Llamada recursiva para reintentar
          }
        }

        Swal.fire({
          title: "Proceso completado",
          html: `
            <p>${successCount} de ${
            formSets.length
          } entregas han sido eliminadas.</p>
            ${
              failedCount > 0
                ? `<p>${failedCount} entregas no pudieron ser eliminadas. Por favor, revise y inténtelo de nuevo más tarde si es necesario.</p>`
                : ""
            }
          `,
          icon: failedCount > 0 ? "warning" : "success",
        }).then(() => {
          window.location.reload();
        });
      } catch (error) {
        console.error("Error al eliminar las entregas:", error);
        Swal.fire(
          "Error",
          "Hubo un problema al eliminar las entregas",
          "error"
        );
      }
    } else {
      Swal.fire("Cancelado", "Las entregas no se han eliminado", "info");
    }
  };
  const updateRecordInCRM = async (index, recordData) => {
    const fieldsToUpdate = [
      "id",
      "Name",
      "Entrega_Gestor",
      "Estado",
      "Paginas_a_entregar",
      "Fecha_entrega_profesional",
      "Fecha_entrega_cliente",
      "Fecha_reagendada",
      "Hora",
      "Correcciones",
      "Comentario",
      "Urgente",
      "Creado_por_widget",
      "No_procesada",
      "Motivo_no_procesada",
      "Comentario_no_procesada_por_Coordinacion",
      "Entrega_enviada_por_correo",
      "Comentarios_profesional",
    ];

    const updatedData = {};

    fieldsToUpdate.forEach((field) => {
      if (recordData.hasOwnProperty(field)) {
        updatedData[field] = recordData[field];
      }
    });

    const motivosIndividuales = Object.keys(
      selectedMotivos[recordData.id] || []
    );
    updatedData.Motivo_no_procesada = motivosIndividuales;

    // Solo setea Editado_por_widget si la tarjeta específica ha sido editada
    updatedData.Editado_por_widget =
      formSets[index]?.Editado_por_widget || false;

    // if (enviarEntrega === true) {
    //   updatedData.Entrega_enviada_por_correo = true;
    // }
    console.log(formSets[index]?.Entrega_enviada_por_correo);

    if (formSets[index]?.Entrega_enviada_por_correo === true) {
      updatedData.Entrega_enviada_por_correo = true;
    }

    if (
      (updatedData.Entrega_Gestor !== "CO" &&
        (updatedData.Paginas_a_entregar === "" ||
          updatedData.Paginas_a_entregar === null)) ||
      updatedData.Fecha_entrega_profesional === "" ||
      updatedData.Fecha_entrega_profesional === null ||
      updatedData.Fecha_entrega_cliente === "" ||
      updatedData.Fecha_entrega_cliente === null ||
      updatedData.Name === "" ||
      updatedData.Name === null ||
      updatedData.Entrega_Gestor === "" ||
      updatedData.Entrega_Gestor === null ||
      updatedData.Estado === "" ||
      updatedData.Estado === null ||
      updatedData.No_procesada === true ||
      updatedData.No_procesada === null ||
      updatedData.Motivo_no_procesada === "" ||
      updatedData.Motivo_no_procesada === null ||
      updatedData.Comentario_no_procesada_por_Coordinacion === "" ||
      updatedData.Comentario_no_procesada_por_Coordinacion === null
      // ||updatedData.Entrega_enviada_por_correo === "" ||
      // updatedData.Entrega_enviada_por_correo === null
    ) {
      const camposInvalidos = [];

      // Validar 'Paginas_a_entregar' solo si 'Entrega_Gestor' no es "CO"
      if (updatedData.Entrega_Gestor !== "CO") {
        if (
          updatedData.Paginas_a_entregar === "" ||
          updatedData.Paginas_a_entregar === null
        ) {
          camposInvalidos.push("Paginas a entregar");
        }
      }

      // Validar los otros campos
      if (
        updatedData.Fecha_entrega_profesional === "" ||
        updatedData.Fecha_entrega_profesional === null
      ) {
        camposInvalidos.push("Fecha entrega profesional");
      }
      if (
        !updatedData.Entrega_enviada_por_correo &&
        formSets[index]?.requiresEmail === true // Validar solo si este índice requiere correo
      ) {
        camposInvalidos.push("Entrega enviada por correo");
      }

      if (
        updatedData.Fecha_entrega_cliente === "" ||
        updatedData.Fecha_entrega_cliente === null
      ) {
        camposInvalidos.push("Fecha entrega cliente");
      }
      if (updatedData.Entrega_enviada_por_correo === undefined) {
        camposInvalidos.push("Entrega enviada por correo");
      }
      if (updatedData.Name === "" || updatedData.Name === null) {
        camposInvalidos.push("Nº de entrega");
      }

      if (
        updatedData.Entrega_Gestor === "" ||
        updatedData.Entrega_Gestor === null
      ) {
        camposInvalidos.push("Nº de entrega gestor");
      }

      if (updatedData.No_procesada === true) {
        if (
          Array.isArray(updatedData.Motivo_no_procesada) &&
          updatedData.Motivo_no_procesada.length === 0
        ) {
          camposInvalidos.push("Motivo no procesada");
        }
      }

      if (updatedData.Estado === "" || updatedData.Estado === null) {
        camposInvalidos.push("Estado");
      }

      // Mostrar el error si hay campos inválidos
      if (camposInvalidos.length > 0) {
        await Swal.fire({
          icon: "error",
          title: `Falta completar: ${camposInvalidos.join(", ")}`,
          // text: camposInvalidos.join("\n"),
        });
        throw new Error(camposInvalidos.join("\n"));
      }
    }
    try {
      const result = await updateRecord(updatedData);

      // Asumiendo que result.data contiene los datos actualizados
      return result.data;
    } catch (error) {
      console.error("Error updating record", error);
      throw error;
    }
  };
  const ejecutarFuncion = async () => {
    setRealizarGuardado(!realizarGuardado);
  };

  const saveAllChanges = async () => {
    try {
      await ejecutarFuncion(); // Llama al evento del hijo

      const updatePromises = formSets.map((recordData, index) => {
        return updateRecordInCRM(index, recordData);
      });

      const results = await Promise.all(updatePromises);

      // Actualizar el estado con los resultados
      setFormSets((prevFormSets) => {
        const newFormSets = [...prevFormSets];
        results.forEach((result, index) => {
          newFormSets[index] = { ...newFormSets[index], ...result };
        });
        return newFormSets;
      });

      Swal.fire({
        icon: "success",
        title: "Cambios guardados",
        showConfirmButton: false,
        timer: 2000,
      });

      window.ZOHO.CRM.UI.Popup.closeReload().then(function (data) {});
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
      Swal.fire({
        icon: "error",
        title: "Faltan campos de completar",
        text: "Por favor, inténtalo de nuevo más tarde",
      });
    }
  };
  const saveAllChangesWhithOutClose = async () => {
    try {
      const updatePromises = formSets.map((recordData, index) =>
        updateRecordInCRM(index, recordData)
      );

      const results = await Promise.all(updatePromises);

      // Actualizar el estado con los resultados
      setFormSets((prevFormSets) => {
        const newFormSets = [...prevFormSets];
        results.forEach((result, index) => {
          newFormSets[index] = { ...newFormSets[index], ...result };
        });
        setModifiedIndexes([]);

        return newFormSets;
      });

      Swal.fire({
        icon: "success",
        title: "Cambios guardados",
        showConfirmButton: false,
        timer: 2000,
      });

      // window.ZOHO.CRM.UI.Popup.closeReload().then(function (data) {});
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
      Swal.fire({
        icon: "error",
        title: "Faltan campos de completar",
        text: "Por favor, inténtalo de nuevo más tarde",
      });
    }
  };
  const guardarYavanzar = async () => {
    try {
      await ejecutarFuncion(); // Llama al evento del hijo
      // Crea un array de promesas para todas las actualizaciones
      const updatePromises = formSets.map((recordData, index) =>
        updateRecordInCRM(index, recordData)
      );
      const results = await Promise.all(updatePromises);

      // Actualizar el estado con los resultados
      setFormSets((prevFormSets) => {
        const newFormSets = [...prevFormSets];
        results.forEach((result, index) => {
          newFormSets[index] = { ...newFormSets[index], ...result };
        });

        return newFormSets;
      });

      Swal.fire({
        icon: "success",
        title: "Cambios guardados ",
        showConfirmButton: false,
        timer: 2000,
      });

      window.ZOHO.CRM.BLUEPRINT.();
    } catch (error) {
      console.error("Error al guardar los cambios:", error);

      Swal.fire({
        icon: "error",
        title: "Error al guardar los cambios",
        text: "Por favor, inténtalo de nuevo más tarde",
      });
    }
  };
  const close = () => {
    if (hasUnsavedChanges()) {
      Swal.fire({
        title: "¿Estás seguro?",
        text: "Está seguro que quiere descartar los cambios? ",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          closeWidget();
        }
      });
    } else {
      closeWidget();
    }
  };
  const handleOpen = () => {
    setDropOpen(!dropOpen);
  };
  const handleCheckboxChange = (formId, displayValue) => {
    setSelectedMotivos((prevState) => {
      // Create a copy of the previous state for the specific formId
      const currentFormMotivos = prevState[formId] || {};

      // Toggle the checked state
      const newValue = !currentFormMotivos[displayValue];

      // If the value is being checked, add it to the object
      // If the value is being unchecked, remove it from the object
      const updatedFormMotivos = newValue
        ? { ...currentFormMotivos, [displayValue]: true }
        : Object.keys(currentFormMotivos)
            .filter((key) => key !== displayValue)
            .reduce((acc, key) => {
              acc[key] = currentFormMotivos[key];
              return acc;
            }, {});

      return {
        ...prevState,
        [formId]: updatedFormMotivos,
      };
    });
  };
  const handleFieldChange = async (index, fieldName, value) => {
    // Para fecha reagendada, validar que no sea anterior a fecha profesional
    if (fieldName === "Fecha_reagendada") {
      const fechaProfesional = formSets[index].Fecha_entrega_profesional;

      // Permitir valor nulo o vacío
      if (!value || value === "") {
        setFormSets((prevFormSets) => {
          const newFormSets = [...prevFormSets];
          newFormSets[index] = {
            ...newFormSets[index],
            [fieldName]: null, // o "" dependiendo de cómo prefieras manejar los valores vacíos
            Editado_por_widget: true,
          };
          if (!modifiedIndexes.includes(index)) {
            setModifiedIndexes((prev) => [...prev, index]);
          }
          return newFormSets;
        });
        return;
      }

      // Solo validar si hay una fecha profesional y la fecha reagendada no es nula
      if (fechaProfesional && value < fechaProfesional) {
        alert(
          "La fecha reagendada no puede ser anterior a la fecha profesional"
        );
        return;
      }
    }
    if (fieldName === "Fecha_entrega_profesional") {
      let fechaString = value.toString();
      var req_data = {
        arguments: JSON.stringify({
          profesional: fechaString,
        }),
      };
      try {
        const data = await window.ZOHO.CRM.FUNCTIONS.execute(
          "FechaClienteWidget",
          req_data
        );
        setFormSets((prevFormSets) => {
          const newFormSets = [...prevFormSets];
          newFormSets[index] = {
            ...newFormSets[index],
            [fieldName]: value,
            Fecha_entrega_cliente: data.details.output,
            Editado_por_widget: true,
          };
          if (!modifiedIndexes.includes(index)) {
            setModifiedIndexes((prev) => [...prev, index]);
          }
          console.log("newFormSets", newFormSets);
          return newFormSets;
        });
      } catch (error) {
        console.log(error);
      }
    } else if (fieldName === "Estado") {
      setFormSets((prevFormSets) => {
        const newFormSets = [...prevFormSets];
        newFormSets[index] = {
          ...newFormSets[index],
          [fieldName]: value,
          Editado_por_widget: true,
          // Set Entrega_enviada_por_correo based on Estado value
          Entrega_enviada_por_correo: value === "Entregada",
        };
        if (!modifiedIndexes.includes(index)) {
          setModifiedIndexes((prev) => [...prev, index]);
        }
        return newFormSets;
      });
    } else {
      setFormSets((prevFormSets) => {
        const newFormSets = [...prevFormSets];
        newFormSets[index] = {
          ...newFormSets[index],
          [fieldName]: value,
          Editado_por_widget: true,
        };
        if (!modifiedIndexes.includes(index)) {
          setModifiedIndexes((prev) => [...prev, index]);
        }
        return newFormSets;
      });
    }
  };
  const handleRecord = async (formData) => {
    const newRecord = { ...formData };

    insertRecord(newRecord);

    await cargarRegistros()
      .then((result) => {
        setFormSets((prevFormSets) => [...prevFormSets, newRecord]);
        // togglePopup();
      })
      .catch((error) => {
        console.error("Error al agregar el registro:", error);
      });
  };
  const handleRecord2 = (formData) => {
    const newRecord = { ...formData };

    insertRecord2(newRecord);
    cargarRegistros()
      .then((result) => {
        setFormSets((prevFormSets) => [...prevFormSets, newRecord]);
      })
      .catch((error) => {
        console.error("Error al agregar el registro:", error);
      });
  };
  const handleEstadoElegido = (estado, index) => {
    if (estado === "Entregada") {
      // togglePopEnvio(index);
      toggleCard2(index);
      setEnviarEntrega(true);
    }
  };
  const handleIa = async (id) => {
    // Mostrar SweetAlert de carga
    const loadingAlert = Swal.fire({
      title: "Procesando",
      text: "Por favor, espere...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const req_data = {
      arguments: JSON.stringify({
        entrega_id: id,
      }),
    };

    try {
      const response = await window.ZOHO.CRM.FUNCTIONS.execute(
        "turnitingetviewer",
        req_data
      );

      // Extraer 'output' de los detalles
      const output = response?.details?.output;

      // Cerrar el SweetAlert de carga
      loadingAlert.close();

      if (!output || output === "") {
        // Mostrar alerta de advertencia
        Swal.fire({
          icon: "warning",
          title: "Atención",
          text: "No se puede acceder al reporte.",
          confirmButtonText: "Aceptar",
        });
      } else if (isValidUrl(output)) {
        // Mostrar alerta de éxito antes de redirigir
        await Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Redirigiendo al reporte...",
          showConfirmButton: false,
          timer: 1500,
        });

        // Abrir URL en nueva pestaña
        window.open(output, "_blank");
      }
    } catch (error) {
      console.error("Error al ejecutar la función:", error);

      // Cerrar el SweetAlert de carga
      loadingAlert.close();

      // Mostrar alerta de error
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un problema al procesar la solicitud.",
        confirmButtonText: "Aceptar",
      });
    }
  };
  const handleDarkMode = (prop) => {
    setDark(prop);
    localStorage.setItem("darkMode", JSON.stringify(prop));
  };
  const getFields = () => {
    return new Promise(function (resolve, reject) {
      window.ZOHO.CRM.META.getFields({ Entity: "Entregas" })
        .then(function (response) {
          setFields(response.fields);
        })
        .catch(function (error) {
          reject(error);
        });
    });
  };
  const especificRecords = async () => {
    console.log("especific");

    try {
      const response = await getRelatedRecords(
        "Coordinacion",
        registerID,
        "Entregas_asociadas"
      );

      if (!response?.register?.length) return;

      setFormSets((prevState) => {
        return prevState.map((item) => {
          const updatedRecord = response.register.find((r) => r.id === item.id);
          if (updatedRecord) {
            return {
              ...item,
              // Solo actualizar campos específicos
              // Entrega_enviada_por_correo:
              //   updatedRecord.Entrega_enviada_por_correo,
              Workdrive_entrega: updatedRecord.Workdrive_entrega,
              // Otros campos que necesites actualizar
            };
          }
          return item;
        });
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const hasUnsavedChanges = () => {
    return modifiedIndexes.length > 0;
  };

  const motivo_no_procesada = getFieldValues(fields, "Motivo_no_procesada");

  const STATUS_OPTIONS = {
    CO: [
      { value: "Entregada", label: "Entregada", color: "#25b52a" },
      { value: "Paralizada", label: "Paralizada", color: "#f5c72f" },
      { value: "Retrasada", label: "Retrasada", color: "#eb4d4d" },
      { value: "Correcciones", label: "Correcciones", color: "#168aef" },
      {
        value: "Entrega asignada",
        label: "Entrega asignada",
        color: "#f8e199",
      },
      { value: "Caida", label: "Caida", color: "#9a2e47" },
      { value: "Incompleta", label: "Incompleta", color: "#c9ba46" },
    ],
    DEFAULT: [
      { value: "Pendiente", label: "Pendiente", color: "#dbdbdb" },
      { value: "Entregada", label: "Entregada", color: "#25b52a" },
      { value: "Paralizada", label: "Paralizada", color: "#f5c72f" },
      { value: "Retrasada", label: "Retrasada", color: "#eb4d4d" },
      {
        value: "Entrega asignada",
        label: "Entrega asignada",
        color: "#f8e199",
      },
      { value: "Caida", label: "Caida", color: "#9a2e47" },
      { value: "Incompleta", label: "Incompleta", color: "#c9ba46" },
    ],
  };

  return (
    <div className="w-screen h-screen font-mundo flex flex-col ">
      <div className="w-full ">
        {datos && datos.Name ? (
          <>
            {/*barra navegacion superior*/}
            <BarraNavegacionSuperior
              dark={dark}
              datos={datos}
              registerID={registerID}
              close={close}
              saveAllChanges={saveAllChanges}
              guardarYavanzar={guardarYavanzar}
            />
            {/*segunda barra navegacion superior*/}
            <SegundaBarraDeNavegacion
              datos={datos}
              dark={dark}
              truncateText={truncateText}
              formatDate={formatDate}
            />
          </>
        ) : null}
      </div>
      <div className="flex h-[calc(100vh-80px)]  relative ">
        {datos ? (
          <BarraNavegacionLateral
            datos={datos}
            registerID={registerID}
            dark={dark}
            setFilter={setFilter}
            delAllRecords={delAllRecords}
            realizarGuardado={realizarGuardado}
          />
        ) : null}

        {/*tarjetas*/}

        <div className="w-[100%] h-[100%]   overflow-hidden  flex-col    ">
          <div
            className={` w-full h-full flex justify-start items-start  ${
              dark ? "bg-[#222631]" : "bg-[#f0f0f8]"
            } p-4  overflow-x-auto   `}
          >
            <div className="flex w-full justify-start mb-[60px] ">
              <div className="cards gap-2 flex  justify-start flex-wrap ">
                {filtredEntys.map((form, index) => (
                  <div key={index}>
                    <div
                      className={`card relative overflow-hidden ${
                        dark
                          ? "shadow-[0px_0px_10px_rgba(234,234,234,0.5)]"
                          : "shadow-[0px_0px_10px_rgba(0,0,0,0.5)]"
                      } ${dark ? "bg-[#2f374c]" : "bg-[#e5e5e6]"} ${
                        modifiedIndexes.includes(index) ? "modif pulse" : ""
                      }`}
                    >
                      <div className="flex justify-between ">
                        <div className=" flex items-center h-[25px]   ">
                          <label
                            htmlFor="Name"
                            className={`block  font-medium ${
                              dark ? "text-white text" : "text-zinc-800"
                            }  text-[16px] mr-4  `}
                          >
                            Nº de entrega
                          </label>
                          <input
                            type="text"
                            id="Name"
                            name="Name"
                            onChange={(e) =>
                              handleFieldChange(index, "Name", e.target.value)
                            }
                            disabled={form.Name === "CO"} // Deshabilitar si el valor es "CO"
                            value={form.Name || ""}
                            className={`block border-2 text-lg w-[50px]  text-center bg-transparent border-none rounded-md shadow-sm ${
                              dark ? "bg-[#222631]" : "bg-white"
                            } text-white text-[14px] ${
                              dark ? "text-[#dddee0]" : "text-zinc-800"
                            }  `}
                          />
                        </div>
                        <div className="flex gap-4 justify-end ">
                          <button
                            className="btn-raro w-18 text-xs h-6   px-2 rounded-md border-none  text-white  hover:text-white font-semibold bg-transparent"
                            onClick={() => delRecord(form.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                      <div className=" flex items-center justify-between ">
                        <label
                          htmlFor="Name"
                          className={`block  font-medium ${
                            dark ? "text-white text" : "text-zinc-800"
                          }  text-[16px] mr-4  `}
                        >
                          Nº Entrega Gestor
                        </label>
                        <input
                          type="text"
                          id="Entrega_Gestor"
                          name="Entrega_Gestor"
                          onChange={(e) =>
                            handleFieldChange(
                              index,
                              "Entrega_Gestor",
                              e.target.value
                            )
                          }
                          disabled={form.Name === "CO"} // Deshabilitar si el valor es "CO"
                          value={form.Entrega_Gestor || ""}
                          className={`block border-2 w-[125px]  text-center border-none p-1 rounded-md shadow-sm ${
                            dark ? "bg-[#222631]" : "bg-white"
                          } ${dark ? "text-[#dddee0]" : "text-zinc-800"}  `}
                        />
                      </div>
                      <div className="flex items-center justify-between  ">
                        <label
                          htmlFor="Estado"
                          className={`block  font-medium ${
                            dark ? "text-white text" : "text-zinc-800"
                          }  text-[16px] mr-4  `}
                        >
                          Estado
                        </label>
                        <div className="flex items-center gap-2">
                          {form.Workdrive_entrega !== undefined &&
                          form.Workdrive_entrega !== null &&
                          formSets[index].Estado === "Entregada" ? (
                            <MdKeyboardArrowDown
                              onClick={() => toggleCard2(form.id)}
                            />
                          ) : null}
                          <DropCustom
                            index={index}
                            id={form.id}
                            handleEstadoElegido={handleEstadoElegido}
                            dark={dark}
                            options={
                              STATUS_OPTIONS[
                                form.Name === "CO" ? "CO" : "DEFAULT"
                              ]
                            }
                            value={form.Estado}
                            onChange={(value) =>
                              handleFieldChange(index, "Estado", value)
                            }
                            className="block border-2 w-[125px] text-center border-none p-1 rounded-md shadow-sm bg-[#f0f0f8] dark:bg-[#222631] text-white text-[14px] focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      {form.Name && form.Name !== "CO" ? (
                        <div className=" flex items-center justify-between">
                          <label
                            htmlFor="Paginas_a_entregar"
                            className={`block  font-medium ${
                              dark ? "text-white text" : "text-zinc-800"
                            }  text-[16px] mr-4  `}
                          >
                            Páginas a entregar
                          </label>
                          <input
                            type="text"
                            id="Paginas_a_entregar"
                            name="Paginas_a_entregar"
                            onChange={(e) =>
                              handleFieldChange(
                                index,
                                "Paginas_a_entregar",
                                e.target.value
                              )
                            }
                            value={form.Paginas_a_entregar || ""}
                            className={`block border-2 w-[125px]  text-center border-none p-1 rounded-md shadow-sm ${
                              dark ? "bg-[#222631]" : "bg-white"
                            } ${dark ? "text-[#dddee0]" : "text-zinc-800"}  `}
                          />
                        </div>
                      ) : null}
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor={`Fecha_entrega_profesional_${index}`}
                          className={`block  font-medium ${
                            dark ? "text-white text" : "text-zinc-800"
                          }  text-[16px] mr-4  `}
                        >
                          Fecha profesional
                        </label>
                        <div>
                          <input
                            type="date"
                            id={`Fecha_entrega_profesional_${index}`}
                            name={`Fecha_entrega_profesional_${index}`}
                            value={form.Fecha_entrega_profesional || ""}
                            onChange={(e) => {
                              handleFieldChange(
                                index,
                                "Fecha_entrega_profesional",
                                e.target.value
                              );
                            }}
                            className={`block border-2 w-[125px]  text-center border-none p-1 rounded-md shadow-sm ${
                              dark ? "bg-[#222631]" : "bg-white"
                            } ${dark ? "text-[#dddee0]" : "text-zinc-800"}  `}
                          />
                        </div>
                      </div>
                      <div className=" flex items-center justify-between">
                        <label
                          htmlFor={`Fecha_entrega_cliente_${index}`}
                          className={`block  font-medium ${
                            dark ? "text-white text" : "text-zinc-800"
                          }  text-[16px] mr-4  `}
                        >
                          Fecha cliente
                        </label>
                        <input
                          type="date"
                          id={`Fecha_entrega_cliente_${index}`}
                          name={`Fecha_entrega_cliente_${index}`}
                          value={form.Fecha_entrega_cliente || ""}
                          required
                          onChange={(e) =>
                            handleFieldChange(
                              index,
                              "Fecha_entrega_cliente",
                              e.target.value
                            )
                          }
                          className={`block border-2 w-[125px]  text-center border-none p-1 rounded-md shadow-sm ${
                            dark ? "bg-[#222631]" : "bg-white"
                          } ${dark ? "text-[#dddee0]" : "text-zinc-800"}  `}
                        />
                      </div>
                      <div className=" flex items-center justify-between">
                        <label
                          htmlFor={`Fecha_reagendada_${index}`}
                          className={`block  font-medium ${
                            dark ? "text-white text" : "text-zinc-800"
                          }  text-[16px] mr-4  `}
                        >
                          Fecha reagendada
                        </label>
                        <input
                          type="date"
                          id={`Fecha_reagendada_${index}`}
                          name={`Fecha_reagendada_${index}`}
                          min={form.Fecha_entrega_profesional || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              index,
                              "Fecha_reagendada",
                              e.target.value
                            )
                          }
                          value={form.Fecha_reagendada || ""}
                          className={`block border-2 w-[125px]  text-center border-none p-1 rounded-md shadow-sm ${
                            dark ? "bg-[#222631]" : "bg-white"
                          }  ${dark ? "text-[#dddee0]" : "text-zinc-800"} `}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="Hora"
                          className={`block  font-medium ${
                            dark ? "text-white text" : "text-zinc-800"
                          }  text-[16px] mr-4   `}
                        >
                          Hora profesional
                        </label>
                        <input
                          type="time"
                          id="Hora"
                          name="Hora"
                          onChange={(e) =>
                            handleFieldChange(index, "Hora", e.target.value)
                          }
                          value={form.Hora || ""}
                          className={`block border-2 w-[125px]  text-center border-none p-1 rounded-md shadow-sm ${
                            dark ? "bg-[#222631]" : "bg-white"
                          } ${dark ? "text-[#dddee0]" : "text-zinc-800"}  `}
                        />
                      </div>
                      {form.Name && form.Name === "CO" ? (
                        <div className="  flex items-center justify-between ">
                          <label
                            htmlFor="Correcciones"
                            className={`block  font-medium ${
                              dark ? "text-white text" : "text-zinc-800"
                            }  text-[16px] mr-4   `}
                          >
                            Correcciones
                          </label>

                          <select
                            id="Correcciones"
                            name="Correcciones"
                            value={form.Correcciones}
                            className={`block border-2 w-[125px]  text-center border-none p-1 rounded-md shadow-sm ${
                              dark ? "bg-[#222631]" : "bg-white"
                            } ${dark ? "text-[#dddee0]" : "text-zinc-800"}  `}
                            onChange={(e) =>
                              handleFieldChange(
                                index,
                                "Correcciones",
                                e.target.value
                              )
                            }
                          >
                            <option value="None">-None-</option>
                            <option value="NA">NA</option>
                            <option value="Relacionadas con el profesional">
                              Relacionadas con el profesional
                            </option>
                            <option value="Relacionadas con cambios pedidos por el cliente">
                              Relacionadas con cambios pedidos por el cliente
                            </option>
                          </select>
                        </div>
                      ) : null}
                      <div className="text-sm flex items-center justify-between">
                        <label
                          htmlFor={`Comentario_${index}`}
                          className={`block  font-medium ${
                            dark ? "text-white text" : "text-zinc-800"
                          }  text-[16px] mr-4  `}
                        >
                          Comentario
                        </label>
                        <input
                          id={`Comentario_${index}`}
                          name={`Comentario_${index}`}
                          value={form.Comentario || ""}
                          maxLength={1900} // Limita a 1900 caracteres
                          onChange={(e) =>
                            handleFieldChange(
                              index,
                              "Comentario",
                              e.target.value
                            )
                          }
                          className={`block border-2 w-[125px]  text-center border-none p-1 rounded-md shadow-sm ${
                            dark ? "bg-[#222631]" : "bg-white"
                          } ${dark ? "text-[#dddee0]" : "text-zinc-800"}  `}
                        />
                      </div>
                      <div className="flex justify-between h-[50px]  items-center pr-8  ">
                        <div className=" flex items-center ">
                          <label
                            htmlFor="Urgente"
                            className={`block  font-medium ${
                              dark ? "text-white text" : "text-zinc-800"
                            }  text-[16px] mr-4  `}
                          >
                            Urgente?
                          </label>
                          <div className="flex  justify-center items-center ">
                            <input
                              type="checkbox"
                              id="Urgente"
                              name="Urgente"
                              checked={formSets[index].Urgente} // Access state from object
                              onChange={() =>
                                handleFieldChange(
                                  index,
                                  "Urgente",
                                  !formSets[index].Urgente
                                )
                              } // Update specific checkbox state
                              className="check rounded-md w-4 h-4 mt-1 ml-6"
                            />
                          </div>
                        </div>

                        {form.Workdrive_entrega !== undefined &&
                        form.Workdrive_entrega !== null ? (
                          <img
                            // onClick={() => togglePoRechazo(index)}
                            onClick={() => toggleCard(form.id)}
                            src={rechazo}
                            alt=""
                            className="h-[50%] cursor-pointer"
                          />
                        ) : null}
                        {form.Workdrive_entrega !== undefined &&
                        form.Workdrive_entrega !== null ? (
                          <div
                            className={`logoIa h-full w-auto flex items-center justify-center flex-col relative ${
                              form.Fue_procesado_correctamente_por_turnitin ===
                                "NO" || !form.submission_id
                                ? "opacity-50"
                                : ""
                            }`}
                          >
                            <img
                              onClick={
                                form.Fue_procesado_correctamente_por_turnitin ===
                                  "NO" || !form.submission_id
                                  ? null
                                  : () => handleIa(form.id)
                              }
                              src={ia}
                              alt=""
                              className="h-[50%] cursor-pointer"
                            />
                            <span className="porcentaje text-center absolute top-[-20px] p-[4px] rounded-lg whitespace-nowrap bg-zinc-800 text-white opacity-0">
                              {form.Porcentaje_plagio
                                ? `${form.Porcentaje_plagio} %`
                                : ` ${
                                    form.Fue_procesado_correctamente_por_turnitin ===
                                      "NO" || !form.submission_id
                                      ? "No disponible"
                                      : "Consultar % IA"
                                  } `}
                            </span>
                          </div>
                        ) : null}
                        {form.Workdrive_entrega !== undefined &&
                        form.Workdrive_entrega !== null ? (
                          <img
                            onClick={() =>
                              redireccionWorkdrive(form.Workdrive_entrega)
                            }
                            src={carpeta}
                            alt=""
                            className="h-[45%] cursor-pointer"
                          />
                        ) : null}
                      </div>
                      <div
                        className={`card2 absolute flex justify-start left-0 ${
                          expandedCardId === form.id
                            ? "top-[0px]"
                            : "top-[700px]"
                        }  ${dark ? "bg-[#2f374c]" : "bg-[#e5e5e6]"} ${
                          modifiedIndexes.includes(index) ? "modif pulse" : ""
                        }`}
                      >
                        <div
                          onClick={() => toggleCard()}
                          className="cursor-pointer"
                        >
                          <MdKeyboardArrowDown />
                        </div>
                        <div className="w-full flex-grow p-0  rounded-xl flex justify-start items-center flex-col relative aqui">
                          <p className="text-bold text-center font-medium mt-4">
                            Aqui puedes marcar la entrega como no procesada
                          </p>
                          <div className="flex items-center  gap-4 mt-4">
                            <label htmlFor="No_procesada" className="">
                              Entrega No Procesada
                            </label>
                            <input
                              type="checkbox"
                              name="No_procesada"
                              id="No_procesada"
                              checked={form.No_procesada}
                              onChange={(e) =>
                                handleFieldChange(
                                  index,
                                  "No_procesada",
                                  e.target.checked
                                )
                              }
                            />
                          </div>

                          <label className="mt-8 mb-2">
                            Motivo no procesada
                          </label>
                          <div>
                            <div
                              onClick={() => handleOpen()}
                              className="w-full h-[40px] bg-white rounded-lg shadow-xl flex items-center px-4 justify-between relative cursor-pointer"
                            >
                              Selecciona el motivo
                              {dropOpen ? (
                                <MdKeyboardArrowUp />
                              ) : (
                                <MdKeyboardArrowDown />
                              )}
                            </div>
                            {dropOpen ? (
                              <div
                                key={form.id}
                                className="flex flex-col w-full bg-white px-4 py-2 rounded-lg shadow-xl mt-2 relative h-[200px] overflow-auto"
                              >
                                {motivo_no_procesada.map((item) => (
                                  <div
                                    key={item.display_value}
                                    className="flex items-center"
                                  >
                                    <input
                                      type="checkbox"
                                      id={`motivo-${form.id}-${item.display_value}`}
                                      className="mr-2"
                                      checked={
                                        selectedMotivos[form.id]?.[
                                          item.display_value
                                        ] || false
                                      }
                                      onChange={() =>
                                        handleCheckboxChange(
                                          form.id,
                                          item.display_value
                                        )
                                      }
                                    />
                                    <label
                                      htmlFor={`motivo-${form.id}-${item.display_value}`}
                                    >
                                      {item.display_value}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>

                          <label htmlFor="comentarioTextarea" className="mt-2">
                            Comentario no procesada
                          </label>
                          <textarea
                            id="comentarioTextarea"
                            onChange={(e) =>
                              handleFieldChange(
                                index,
                                "Comentario_no_procesada_por_Coordinacion",
                                e.target.value
                              )
                            }
                            value={
                              form.Comentario_no_procesada_por_Coordinacion ||
                              ""
                            }
                            className="w-full h-[100px] rounded-lg mt-2 shadow-lg p-2"
                            maxLength={1900} // Limita a 1900 caracteres
                          ></textarea>
                        </div>
                      </div>

                      {form.Workdrive_entrega !== undefined &&
                      form.Workdrive_entrega !== null ? (
                        <div
                          tabIndex="-1"
                          aria-hidden="true"
                          className={`card2 absolute flex justify-start left-0 ${
                            expandedCardId2 === form.id
                              ? "top-[0px]"
                              : "hidden top-[700px]"
                          }  ${dark ? "bg-[#2f374c]" : "bg-[#e5e5e6]"} ${
                            modifiedIndexes.includes(index) ? "modif pulse" : ""
                          }`}
                        >
                          <div
                            onClick={() => toggleCard2()}
                            className="cursor-pointer mb-4"
                          >
                            <MdKeyboardArrowDown />
                          </div>

                          <div className="w-full p-0 rounded-xl flex justify-center items-center flex-col relative acabas">
                            <p className="text-[20px] w-full text-center font-medium">
                              Acabas de marcar la casilla como entregada.
                            </p>
                            <div className="flex items-center gap-4 mt-8">
                              <label htmlFor="Entrega_enviada_por_correo">
                                Enviar entrega por correo
                              </label>
                              <input
                                type="checkbox"
                                id="Entrega_enviada_por_correo"
                                checked={form.Entrega_enviada_por_correo}
                                onChange={(e) => {
                                  // setEnviarEntrega(e.target.checked);
                                  handleFieldChange(
                                    index,
                                    "Entrega_enviada_por_correo",
                                    e.target.checked
                                  );
                                }}
                              />
                            </div>
                            <div className="flex flex-col items-center gap-4 mt-8">
                              <label htmlFor="Comentarios_profesional">
                                Comentario profesional
                              </label>
                              <textarea
                                id="Comentarios_profesional"
                                className="w-[300px] h-[100px] rounded-md"
                                maxLength={1900} // Limita a 1900 caracteres
                                onChange={(e) =>
                                  handleFieldChange(
                                    index,
                                    "Comentarios_profesional",
                                    e.target.value
                                  )
                                }
                                value={form.Comentarios_profesional || ""}
                              ></textarea>
                              <p className="text-center font-semibold">
                                Al guardar los cambios, su entrega será
                                procesada{" "}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full h-[125px] "></div>
        </div>

        {/*boton para abrir pops y cambiar color */}

        <div className="fixed top-[95px] right-6 ">
          <button
            className={` w-12  h-12 border-2 text-2xl shadow-xl  rounded-full ${
              dark ? "bg-[#ff862e]" : "bg-[#4c5af6]"
            } border-none text-white font-semibold ${
              dark ? "hover:bg-[#ff7b2e]" : "hover:bg-[#483edb]"
            }  `}
            onClick={() => setEleccion(!eleccion)}
          >
            +
          </button>
          {eleccion ? (
            <Eleccion
              togglePopup={togglePopup}
              togglePopupCo={togglePopupCo}
              dark={dark}
              hasUnsavedChanges={hasUnsavedChanges}
              saveAllChangesWhithOutClose={saveAllChangesWhithOutClose}
              setModifiedIndexes={setModifiedIndexes}
            />
          ) : null}
        </div>
        <div
          onClick={() => handleDarkMode(false)}
          className={`fixed bottom-[95px] right-8 cursor-pointer ${
            dark ? "text-white" : "text-[#4c5af6]"
          } `}
        >
          <BsSunFill />
        </div>
        <div
          onClick={() => handleDarkMode(true)}
          className={`fixed bottom-[55px] right-8 cursor-pointer ${
            dark ? "text-white" : "text-[#4c5af6]"
          } `}
        >
          <BsMoonStars />
        </div>
      </div>

      {/*popUps*/}

      {showPopup && (
        <PopupForm
          registerID={registerID}
          onAddFormSet={handleRecord}
          onAddFormSet2={handleRecord2}
          togglePopup={togglePopup}
          cargarRegistros={cargarRegistros}
          records={records}
          datos={datos}
          dark={dark}
        />
      )}
      {showPopupCo && (
        <PopupCoForm
          registerID={registerID}
          onAddFormSet={handleRecord}
          onAddFormSet2={handleRecord2}
          togglePopupCo={togglePopupCo}
          formSets={formSets}
          records={records}
          datos={datos}
          dark={dark}
        />
      )}
    </div>
  );
};

export default Home;
