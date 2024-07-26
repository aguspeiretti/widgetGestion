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
import PopupForm from "../components/PopupForm";
import Swal from "sweetalert2";
import Eleccion from "../components/Eleccion";
import PopupCoForm from "../components/PopupCoForm";
import { BsFilterSquare } from "react-icons/bs";
import useRecordStore from "../context/recodStore";
import DropCustom from "../components/DropCustom";
import PopCalendario from "../components/PopCalendario";
import { FaRegClock } from "react-icons/fa";
import { MdCheck } from "react-icons/md";
import { IoCloseCircleOutline } from "react-icons/io5";
import Tooltip from "../components/Tooltip";
import { BsMoonStars } from "react-icons/bs";
import { BsSunFill } from "react-icons/bs";

const Home = ({ datos, registerID }) => {
  const [filter, setFilter] = useState("Todas");
  const [eleccion, setEleccion] = useState(false);
  const [formSets, setFormSets] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showPopupCo, setShowPopupCo] = useState(false);
  const [modifiedIndexes, setModifiedIndexes] = useState([]);
  const entregasNumerdas = formSets.filter((entry) => entry.Name !== "CO");
  const entregaCorrecciones = formSets.filter((entry) => entry.Name === "CO");
  const tag = datos && datos.Tag ? datos.Tag[0].name : null;
  const { getRelatedRecord, records } = useRecordStore();
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
    getRelatedRecord(registerID);

    cargarRegistros();
  }, []);

  useEffect(() => {
    cargarRegistros();
  }, [registerID]);

  useEffect(() => {
    getRecords();
  }, [records, tag]);

  const cargarRegistros = async () => {
    await getRelatedRecord(registerID);
  };
  const getRecords = async () => {
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
    } catch (error) {
      console.error("Error al obtener registros:", error);
    }
  };
  const togglePopup = () => {
    setShowPopup(!showPopup);
    setEleccion(false);
  };
  const togglePopupCo = () => {
    setShowPopupCo(!showPopupCo);
    setEleccion(false);
  };
  const handleRecord = (formData) => {
    const newRecord = { ...formData };
    insertRecord(newRecord);
    cargarRegistros()
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
  const handleFieldChange = (index, fieldName, value) => {
    setFormSets((prevFormSets) => {
      const newFormSets = [...prevFormSets];
      newFormSets[index] = {
        ...newFormSets[index],
        [fieldName]: value,
      };

      if (!modifiedIndexes.includes(index)) {
        setModifiedIndexes([...modifiedIndexes, index]);
      }

      // Lógica adicional para fechas si es necesario

      return newFormSets;
    });
  };
  const delRecord = async (id) => {
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
          let errorMessage = "No se pudo eliminar el registro. ";
          if (deleteResult.error) {
            errorMessage += `Error: ${deleteResult.error}`;
          }
          if (deleteResult.details) {
            errorMessage += ` Detalles: ${JSON.stringify(
              deleteResult.details
            )}`;
          }

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
    ];

    const updatedData = {};
    fieldsToUpdate.forEach((field) => {
      if (recordData.hasOwnProperty(field)) {
        updatedData[field] = recordData[field];
      }
    });

    try {
      const result = await updateRecord(updatedData);

      // Asumiendo que result.data contiene los datos actualizados
      return result.data;
    } catch (error) {
      console.error("Error updating record", error);
      throw error;
    }
  };
  const saveAllChanges = async () => {
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
        title: "Error al guardar los cambios",
        text: "Por favor, inténtalo de nuevo más tarde",
      });
    }
  };
  function formatDate(dateString) {
    const fecha = new Date(dateString);
    const day = fecha.getDate();
    const month = fecha.getMonth() + 1;
    const year = fecha.getFullYear();

    // Puedes ajustar el formato según tus preferencias
    return `${day}/${month}/${year}`;
  }
  const guardarYavanzar = async () => {
    try {
      // Crea un array de promesas para todas las actualizaciones
      const updatePromises = formSets.map((recordData, index) =>
        updateRecordInCRM(index, recordData)
      );
      await Promise.all(updatePromises);

      Swal.fire({
        icon: "success",
        title: "Cambios guardados ",
        showConfirmButton: false,
        timer: 2000,
      });

      window.ZOHO.CRM.BLUEPRINT.proceed();
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
        text: "Hay cambios sin guardar. ¿Deseas cerrar de todos modos?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, cerrar",
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
  const closeWidget = () => {
    window.ZOHO.CRM.UI.Popup.close().then(function (data) {});
  };
  function truncateText(text, maxLength) {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + "...";
    }
    return text;
  }
  const handleDarkMode = (prop) => {
    setDark(prop);
    localStorage.setItem("darkMode", JSON.stringify(prop));
  };
  const hasUnsavedChanges = () => {
    return modifiedIndexes.length > 0;
  };

  return (
    <div className="w-screen h-screen font-mundo flex flex-col ">
      <div className="w-full ">
        {datos && datos.Name ? (
          <>
            <div
              className={`flex h-[40px] ${
                dark ? "bg-[#222631]" : "bg-[#f0f0f8]"
              } justify-between items-center pr-10 pl-5`}
            >
              <div className="flex h-[125%] gap-8 text-xs items-center ">
                <p
                  className={`text-xl font-bold ${
                    dark ? "text-white" : "text-zinc-800"
                  }  drop-shadow-xl`}
                >
                  {datos.Name}
                </p>
                <PopCalendario
                  dark={dark}
                  datos={datos}
                  registerID={registerID}
                />
              </div>
              <div className=" h-[50px] flex gap-4  items-center justify-center ">
                <button
                  className="flex items-center gap-2 w-28 h-8 border-2 text-xs py-1 px-2 rounded-md bg-[#f73463] border-none text-white font-semibold hover:bg-red-600 hover:text-white"
                  onClick={close}
                >
                  <IoCloseCircleOutline size={20} />
                  Cancelar
                </button>
                <button
                  className={`flex items-center gap-2 border-none h-8 border-2 text-xs py-1 px-2 rounded-md ${
                    dark === true ? "bg-[#ff862e]" : "bg-[#4c41ec]"
                  }  text-white font-semibold hover:bg-violet-600 hover:text-white`}
                  onClick={saveAllChanges}
                >
                  <FaRegClock size={14} />
                  Guardar y cerrar
                </button>

                <button
                  className="flex items-center gap-2  h-8 border-2 text-xs py-1 px-2 rounded-md bg-[#43d1a7] border-none text-white font-semibold hover:bg-green-600 hover:text-white"
                  onClick={() => guardarYavanzar()}
                >
                  <MdCheck size={16} />
                  Guardar y avanzar
                </button>
              </div>
            </div>
            <div
              className={` segunda-barra flex  h-[40px] ${
                dark ? "bg-[#2f374c]" : "bg-[#e5e5e6]"
              } ${
                dark ? "text-[#ffb22e]" : "text-[#4c41ec]"
              }  justify-start items-center pr-6 pl-2 shadow-2xl relative `}
            >
              <div className="flex w-[18%] text-center item-center  ">
                <p
                  className={`${
                    dark ? "text-[#dddee0]" : "text-zinc-800"
                  }  text-[14px] font-extrabold mr-2 `}
                >
                  Fecha final de entrega:
                </p>
                <p className="font-semibold  text-[14px] mr-6 ">
                  {datos.Fecha_Final_de_Entrega
                    ? formatDate(datos.Fecha_Final_de_Entrega)
                    : "No Tiene"}
                </p>
              </div>
              <div className="flex w-[41%] text-center items-center ">
                <p
                  className={`${
                    dark ? "text-[#dddee0]" : "text-zinc-800"
                  }  text-[14px] font-extrabold `}
                >
                  Fechas especificas:
                </p>
                <p className="text-[14px] ml-2 font-semibold mr-2 ">
                  {datos && datos.Cu_les_son_las_fechas_espec_ficas
                    ? truncateText(datos.Cu_les_son_las_fechas_espec_ficas, 60)
                    : "no tiene"}
                </p>
                <Tooltip
                  title={datos && datos.Cu_les_son_las_fechas_espec_ficas}
                />
              </div>
              <div className="flex w-[41%] text-center items-center">
                <p
                  className={`${
                    dark ? "text-[#dddee0]" : "text-zinc-800"
                  }  text-[14px] font-extrabold `}
                >
                  Tema del proyecto:
                </p>
                <p className="text-[14px]  ml-2 font-semibold mr-2 ">
                  {datos.Tema_del_Proyecto
                    ? truncateText(datos.Tema_del_Proyecto, 90)
                    : "no tiene"}
                </p>
                <Tooltip title={datos.Tema_del_Proyecto} />
              </div>
            </div>
          </>
        ) : null}
      </div>
      <div className="flex h-[calc(100vh-80px)]  relative ">
        {datos ? (
          <div
            className={`flex flex-col w-[200px] h-[100%] ${
              dark ? "bg-[#2f374c]" : "bg-[#e5e5e6]"
            } items-center mb-2 ${
              dark ? "text-[#ffb22e]" : "text-[#4c41ec]"
            }  `}
          >
            <div className="flex text-center items-center  w-full mt-4 px-4 justify-between ">
              <p
                className={`${
                  dark ? "text-[#dddee0]" : "text-zinc-800"
                }  text-[14px] font-extrabold `}
              >
                Total de paginas:
              </p>
              <p className="font-semibold  text-[14px] ml-1">
                {datos.Numero_de_Paginas ? datos.Numero_de_Paginas : "No Tiene"}
              </p>
            </div>
            <div className="flex text-center items-center  w-full mt-4 px-4 justify-between ">
              <p
                className={`${
                  dark ? "text-[#dddee0]" : "text-zinc-800"
                }  text-[14px] font-extrabold `}
              >
                Paginas nuevas:
              </p>
              <p className="font-semibold  text-[14px] ml-1">
                {datos.Cuantas_pagina_son_nuevas
                  ? datos.Cuantas_pagina_son_nuevas
                  : "No Tiene"}
              </p>
            </div>
            <div className="flex text-center items-center  w-full mt-4 px-4 justify-between ">
              <p
                className={`${
                  dark ? "text-[#dddee0]" : "text-zinc-800"
                }  text-[14px] font-extrabold `}
              >
                Pag. correcciones:
              </p>
              <p className="font-semibold  text-[14px] ml-1">
                {datos.Cuantas_paginas_son_de_correcciones
                  ? datos.Cuantas_paginas_son_de_correcciones
                  : "No Tiene"}
              </p>
            </div>
            <div className="flex text-center items-center  w-full mt-4 px-4 justify-between ">
              <p
                className={`${
                  dark ? "text-[#dddee0]" : "text-zinc-800"
                }  text-[14px] font-extrabold `}
              >
                Pag. 1er entrega:
              </p>
              <p className="font-semibold  text-[14px] ml-1">
                {datos.Pagina_Primera_Entrega
                  ? datos.Pagina_Primera_Entrega
                  : ""}
              </p>
            </div>
            <div className="flex text-center items-center  w-full mt-4 px-4 justify-between ">
              <p
                className={`${
                  dark ? "text-[#dddee0]" : "text-zinc-800"
                }  text-[14px] font-extrabold `}
              >
                C. nuevas pautas
              </p>
              <Tooltip
                pos={"-top-20 right-42"}
                title={datos && datos.Comentario_cerrado_nuevas_pautas}
              />
            </div>
            <div className="flex text-center items-center  w-full mt-4 px-4 justify-between ">
              <p
                className={`${
                  dark ? "text-[#dddee0]" : "text-zinc-800"
                }  text-[14px] font-extrabold `}
              >
                C. cliente
              </p>
              <Tooltip
                pos={"top-5 right-30"}
                title={datos && datos.Comentario_del_cliente}
              />
            </div>
            <div className="flex flex-col text-start   w-full mt-4 px-4 justify-between ">
              <div
                className={`flex gap-2 items-center ${
                  dark ? "text-white" : "text-zinc-800"
                } `}
              >
                <BsFilterSquare /> Filtro:
              </div>
              <select
                className={`block mt-2  border-none   border-gray-500 rounded-md shadow-sm p-1  ${
                  dark ? "bg-[#222631]" : "bg-[#f0f0f8]"
                } text-[14px]  sm:text-sm ${
                  dark ? "text-white" : "text-zinc-800"
                }`}
                name="filter"
                id="filter"
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="Todas">Todas</option>
                <option value="Entrega Numerada">Entrega Numerada</option>
                <option value="Entrega Correcciones">
                  Entrega Correcciones
                </option>
              </select>
            </div>

            <div className="flex absolute bottom-12">
              <div className="flex flex-col gap-2 items-center">
                <button
                  className="w-[160px] h-8 border-2 text-xs py-1 px-2 rounded-md border-none bg-[#f73463] text-white font-semibold hover:bg-red-500  hover:text-white"
                  onClick={() => delAllRecords()}
                >
                  Eliminar TODAS
                </button>
              </div>
            </div>
          </div>
        ) : null}
        <div className="w-[100%] h-[100%]   overflow-hidden  flex-col    ">
          <div
            className={` w-full h-full flex justify-start items-start  ${
              dark ? "bg-[#222631]" : "bg-[#f0f0f8]"
            } p-4  overflow-x-auto   `}
          >
            <div className="flex w-full justify-start mb-[60px] ">
              <div className="cards gap-2 flex  justify-start flex-wrap ">
                {filtredEntys.map((form, index) => (
                  <div key={form.id}>
                    <div
                      className={`card ${
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
                        <DropCustom
                          dark={dark}
                          options={
                            form.Name === "CO"
                              ? [
                                  { value: "None", label: "-None-" },
                                  {
                                    value: "Entregada",
                                    label: "Entregada",
                                    color: "#25b52a",
                                  },
                                  {
                                    value: "Paralizada",
                                    label: "Paralizada",
                                    color: "#f5c72f",
                                  },
                                  {
                                    value: "Retrasada",
                                    label: "Retrasada",
                                    color: "#eb4d4d",
                                  },
                                  {
                                    value: "Correcciones",
                                    label: "Correcciones",
                                    color: "#168aef",
                                  },
                                  {
                                    value: "Entrega asignada",
                                    label: "Entrega asignada",
                                    color: "#f8e199",
                                  },
                                  {
                                    value: "Caida",
                                    label: "Caida",
                                    color: "#9a2e47",
                                  },
                                ]
                              : [
                                  { value: "None", label: "-None-" },
                                  {
                                    value: "Pendiente",
                                    label: "Pendiente",
                                    color: "#dbdbdb",
                                  },
                                  {
                                    value: "Entregada",
                                    label: "Entregada",
                                    color: "#25b52a",
                                  },
                                  {
                                    value: "Paralizada",
                                    label: "Paralizada",
                                    color: "#f5c72f",
                                  },
                                  {
                                    value: "Retrasada",
                                    label: "Retrasada",
                                    color: "#eb4d4d",
                                  },
                                  {
                                    value: "Entrega asignada",
                                    label: "Entrega asignada",
                                    color: "#f8e199",
                                  },
                                  {
                                    value: "Caida",
                                    label: "Caida",
                                    color: "#9a2e47",
                                  },
                                ]
                          }
                          value={form.Estado}
                          onChange={(value) =>
                            handleFieldChange(index, "Estado", value)
                          }
                          className="block border-2 w-[125px]  text-center  border-none p-1 rounded-md shadow-sm bg-[#f0f0f8] dark:bg-[#222631] text-white text-[14px] focus:ring-indigo-500 focus:border-indigo-500"
                        />
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
                            onChange={(e) => {
                              handleFieldChange(
                                index,
                                "Fecha_entrega_profesional",
                                e.target.value
                              );
                            }}
                            value={form.Fecha_entrega_profesional || ""}
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
                          readOnly
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
                            className="block text- font-medium text-white text-[16px] "
                          >
                            Correcciones
                          </label>

                          <select
                            id="Correcciones"
                            name="Correcciones"
                            value={form.Correcciones}
                            className={`block border-2 w-[125px]  text-center border-none p-1 rounded-md shadow-sm ${
                              dark ? "bg-[#222631]" : "bg-[#f0f0f8]"
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

                      <div className="flex justify-between   ">
                        <div className=" flex items-center ">
                          <label
                            htmlFor="Urgente"
                            className={`block  font-medium ${
                              dark ? "text-white text" : "text-zinc-800"
                            }  text-[16px] mr-4  `}
                          >
                            Urgente?
                          </label>
                          <div className="flex justify-center items-center">
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full h-[125px]"></div>
        </div>
        <div className="fixed top-[95px] right-6 ">
          <button
            className={` w-12  h-12 border-2 text-2xl shadow-xl  rounded-full ${
              dark ? "bg-[#ff862e]" : "bg-[#4c5af6]"
            } border-none text-white font-semibold  `}
            onClick={() => setEleccion(!eleccion)}
          >
            +
          </button>
          {eleccion ? (
            <Eleccion togglePopup={togglePopup} togglePopupCo={togglePopupCo} />
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
