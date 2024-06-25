/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import "./home.css";
import {
  deleteRecord,
  getRelatedRecords,
  insertRecord,
  updateRecord,
} from "../functions/apiFunctions";
import PopupForm from "../components/PopupForm";
import Swal from "sweetalert2";
import Eleccion from "../components/Eleccion";
import PopupCoForm from "../components/PopupCoForm";
import { BsFilterSquare } from "react-icons/bs";

const Home = ({ datos, registerID }) => {
  const [formSets, setFormSets] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showPopupCo, setShowPopupCo] = useState(false);
  const [shouldGetRecords, setShouldGetRecords] = useState(true);
  const [style, setStyle] = useState("card");
  const [eleccion, setEleccion] = useState(false);
  const [filter, setFilter] = useState("Todas");
  const entregasNumerdas = formSets.filter((entry) => entry.Name !== "CO");
  const entregaCorrecciones = formSets.filter((entry) => entry.Name === "CO");
  const tag = datos && datos.Tag ? datos.Tag[0].name : null;
  const filtredEntys =
    filter === "Entrega Numerada"
      ? entregasNumerdas.slice() // Realiza una copia del array
      : filter === "Entrega Correcciones"
      ? entregaCorrecciones.slice() // Realiza una copia del array
      : formSets.slice(); // Realiza una copia del array

  const getRecords = async () => {
    try {
      const response = await getRelatedRecords(
        "Coordinacion",
        registerID,
        "Entregas_asociadas"
      );
      const datos = response.register.map((record) => ({
        id: record.id,
        ...record,
      }));
      const orderedFormSets = datos.sort((a, b) => {
        const fechaA = new Date(a.Fecha_entrega_profesional);
        const fechaB = new Date(b.Fecha_entrega_profesional);
        return fechaA - fechaB;
      });
      setFormSets(orderedFormSets);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (shouldGetRecords) {
      getRecords();
      setShouldGetRecords(false);
    }
  }, [shouldGetRecords]);
  const togglePopup = () => {
    setShowPopup(!showPopup);
    setEleccion(false);
  };
  const togglePopupCo = () => {
    setShowPopupCo(!showPopupCo);
    setEleccion(false);
  };
  const handleRecord = (formData) => {
    const { Fecha_entrega_cliente, Fecha_entrega_profesional } = formData;

    if (!Fecha_entrega_cliente || !Fecha_entrega_profesional) {
      Swal.fire({
        icon: "error",
        title: "Campos obligatorios",
        text: "Fecha de cliente y entrega profesional son obligatorios",
      });
      return;
    }

    const newRecord = { ...formData };
    insertRecord(newRecord)
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
      newFormSets[index][fieldName] = value;
      if (fieldName === "Fecha_entrega_profesional") {
        // Lógica adicional para manejar las fechas
        const fechaProfesional = new Date(value);
        // Calcula 2 días hábiles después de Fecha_entrega_profesional
        const fechaEntregaCliente = calculateNextBusinessDay(
          fechaProfesional,
          2
        );
        newFormSets[index]["Fecha_entrega_cliente"] = fechaEntregaCliente
          .toISOString()
          .split("T")[0];

        // Limpia Fecha_reagendada
        newFormSets[index]["Fecha_reagendada"] = "";
      } else if (fieldName === "Fecha_entrega_cliente") {
        // Limpia Fecha_reagendada
        newFormSets[index]["Fecha_reagendada"] = "";
      }
      return newFormSets;
    });
  };
  const calculateNextBusinessDay = (date, days) => {
    let count = 0;
    while (count < days) {
      date.setDate(date.getDate() + 1);
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        count++;
      }
    }
    return date;
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
      await deleteRecord(id, datos, registerID);
      setFormSets((prevFormSets) =>
        prevFormSets.filter((form) => form.id !== id)
      );

      Swal.fire(
        "Eliminado",
        "El registro se ha eliminado correctamente",
        "success"
      );
    } else {
      Swal.fire("Cancelado", "El registro no se ha eliminado", "info");
    }
  };
  const updateRecordInCRM = (index) => {
    const recordData = formSets[index];
    console.log(recordData);
    updateRecord(recordData)
      .then((result) => {
        setFormSets((prevFormSets) => {
          prevFormSets[index] = result;
          return prevFormSets;
        });
      })
      .catch((error) => {
        console.error("Error updating record", error);
      });
  };
  const saveAllChanges = async () => {
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

  return (
    <div className="w-screen h-screen font-mundo flex flex-col">
      <div className="w-[200px] h-full bg-violet-500 px-[20px] pt-4 flex flex-col items-center fixed">
        {datos && datos.Name ? (
          <div>
            <p className="text-2xl mt-2 text-white drop-shadow-xl  ">
              {datos.Name}
            </p>
            <div className="mt-8">
              <p className="text-white mt-2 text-[14px] font-semibold mb-2">
                Fecha final de entrega:
              </p>
              <p className="font-semibold">
                {datos.Fecha_Final_de_Entrega
                  ? formatDate(datos.Fecha_Final_de_Entrega)
                  : "No Tiene"}
              </p>
            </div>
            <div>
              <p className="text-white mt-2 text-[14px] font-semibold mb-2">
                Numero de paginas:
              </p>
              <p className="font-semibold">
                {datos.Numero_de_Paginas ? datos.Numero_de_Paginas : "No Tiene"}
              </p>
            </div>
            <div>
              <p className="text-white mt-2 text-[14px] font-semibold mb-2">
                Fechas especificas:
              </p>
              <p className="font-semibold">
                {datos.Cu_les_son_las_fechas_espec_ficas
                  ? datos.Cu_les_son_las_fechas_espec_ficas
                  : "No Tiene"}
              </p>
            </div>
          </div>
        ) : null}
      </div>
      <div className="ml-[200px] w-[calc(100%-200px)] max-w-full flex-col  h-[100%] max-h-full  bg-mundoJob bg-cover bg-center pt-4  gap-4 px-[30px]">
        <div className="flex w-full justify-between px-4 mt-2 gap-4">
          <div className="flex gap-8 mb-4">
            <div
              onClick={() => {
                setStyle("List");
              }}
              className="border-2 border-violet-500 p-2 rounded-md text-violet-500 font-semibold cursor-pointer hover:bg-violet-500 hover:text-white"
            >
              Vista lista
            </div>
            <div
              onClick={() => {
                setStyle("card");
              }}
              className="border-2 border-violet-500 p-2 rounded-md text-violet-500 font-semibold cursor-pointer hover:bg-violet-500 hover:text-white"
            >
              Vista tarjetas
            </div>
          </div>
          <div className="flex gap-8 mb-4">
            <button
              className="w-36 h-10 border-2 py-1 px-2 rounded-md border-violet-500 text-violet-500 font-semibold hover:bg-violet-500 hover:text-white"
              onClick={saveAllChanges}
            >
              Guardar todo
            </button>
            <button
              className="w-24 h-10 border-2 py-1 px-2 rounded-md border-violet-500 text-violet-500 font-semibold hover:bg-violet-500 hover:text-white"
              onClick={() => setEleccion(!eleccion)}
            >
              Nuevo +
            </button>
            {eleccion ? (
              <Eleccion
                togglePopup={togglePopup}
                togglePopupCo={togglePopupCo}
              />
            ) : null}
          </div>
        </div>
        <div className="flex ml-4 gap-8 mt-4">
          <div className="flex gap-2 items-center">
            <div className="flex gap-2 items-center">
              <BsFilterSquare /> Filtrar por:
            </div>
            <select
              className="block w-[160px] border-2 px-2 border-gray-500 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ml-2"
              name="filter"
              id="filter"
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="Todas">Todas</option>
              <option value="Entrega Numerada">Entrega Numerada</option>
              <option value="Entrega Correcciones">Entrega Correcciones</option>
            </select>
          </div>
        </div>

        {style === "card" ? (
          <div className="w-full flex justify-center items-center ">
            <div className="cards   gap-8 flex  flex-wrap mt-8">
              {filtredEntys.map((form, index) => (
                <div key={form.id}>
                  <div className="w-[370px] flex flex-col justify-between border-2 p-4 border-zinc-400 rounded-lg shadow-xl ">
                    <div className="mb-4 flex items-center ">
                      <label
                        htmlFor="Name"
                        className="block text-sm font-medium text-gray-700 mr-4"
                      >
                        Nº de entrega
                      </label>
                      <p>{form.Name}</p>
                    </div>
                    <div className="mb-4 flex items-center justify-between ">
                      <label
                        htmlFor="Name"
                        className="block text-sm font-medium text-gray-700 mr-4"
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
                        value={form.Entrega_Gestor}
                        className="block border-2 w-[125px] text-center border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="mb-4 flex items-center justify-between ">
                      <label
                        htmlFor="Estado"
                        className="block  text-sm font-medium text-gray-700"
                      >
                        Estado
                      </label>
                      <select
                        id="Estado"
                        name="Estado"
                        value={form.Estado}
                        onChange={(e) =>
                          handleFieldChange(index, "Estado", e.target.value)
                        }
                        className="block w-[125px]  border-2 px-2 border-gray-500 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ml-2"
                      >
                        <option value="None">-None-</option>
                        {form.Name && form.Name !== "CO" ? (
                          <option value="Pendiente">Pendiente</option>
                        ) : null}
                        <option value="Entregada">Entregada</option>
                        <option value="Paralizada">Paralizada</option>
                        <option value="Retrasada">Retrasada</option>
                        {form.Name && form.Name === "CO" ? (
                          <option value="Correcciones">Correcciones</option>
                        ) : null}
                        <option value="Entrega asignada">
                          Entrega asignada
                        </option>
                        <option value="Caida">Caida</option>
                      </select>
                    </div>
                    {form.Name && form.Name !== "CO" ? (
                      <div className="mb-4 flex items-center justify-between">
                        <label
                          htmlFor="Paginas_a_entregar"
                          className="block text-sm font-medium text-gray-700"
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
                          value={form.Paginas_a_entregar}
                          className="block border-2 w-[125px] text-center border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    ) : null}
                    <div className="mb-4 flex items-center justify-between">
                      <label
                        htmlFor={`Fecha_entrega_profesional_${index}`}
                        className="block text-sm font-medium text-gray-700 mr-4"
                      >
                        Fecha entrega profesional
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
                          value={form.Fecha_entrega_profesional}
                          className="block border-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <div className="mb-4 flex items-center justify-between">
                      <label
                        htmlFor={`Fecha_entrega_cliente_${index}`}
                        className="block text-sm font-medium text-gray-700 mr-4"
                      >
                        Fecha entrega cliente
                      </label>
                      <input
                        type="date"
                        id={`Fecha_entrega_cliente_${index}`}
                        name={`Fecha_entrega_cliente_${index}`}
                        value={form.Fecha_entrega_cliente}
                        required
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "Fecha_entrega_cliente",
                            e.target.value
                          )
                        }
                        className="block border-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="mb-4 flex items-center justify-between">
                      <label
                        htmlFor={`Fecha_reagendada_${index}`}
                        className="block text-sm font-medium text-gray-700 mr-4"
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
                        value={form.Fecha_reagendada}
                        className="block border-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="mb-4 flex items-center justify-between">
                      <label
                        htmlFor="Hora"
                        className="block text-sm font-medium text-gray-700"
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
                        value={form.Hora}
                        className="block border-2 w-[125px] text-center border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    {form.Name && form.Name === "CO" ? (
                      <div className="mb-4 text-sm flex items-center justify-between ">
                        <label
                          htmlFor="Correcciones"
                          className="block text- font-medium text-gray-700 "
                        >
                          Correcciones
                        </label>

                        <select
                          id="Correcciones"
                          name="Correcciones"
                          value={form.Correcciones}
                          className="block w-[125px] h-[26px] border-2 px-2 border-gray-500 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ml-2"
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
                    <div className="mb-4">
                      <label
                        htmlFor="Comentario"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Comentario
                      </label>
                      <textarea
                        id="Comentario"
                        name="Comentario"
                        value={
                          form.Comentario
                            ? form.Comentario
                            : tag === "Para traducir"
                            ? "PARA TRADUCIR"
                            : tag === "Traducir"
                            ? "TRADUCCION"
                            : ""
                        }
                        onChange={(e) =>
                          handleFieldChange(index, "Comentario", e.target.value)
                        }
                        className="mt-1 block w-full border-2 pl-2 pt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      ></textarea>
                    </div>

                    <div className="flex justify-between px-4 ">
                      <div className="mb-4 flex items-center">
                        <label
                          htmlFor="Urgente"
                          className="block text-sm font-medium text-gray-700"
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
                      {/* <div className="mb-4 flex items-center">
                        <label
                          htmlFor="Entreg_adelantado"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Entregó adelantado
                        </label>
                        <div className="flex justify-center items-center">
                          <input
                            type="checkbox"
                            id="Entreg_adelantado"
                            name="Entreg_adelantado"
                            checked={formSets[index].Entreg_adelantado} // Access state from object
                            onChange={() =>
                              handleFieldChange(
                                index,
                                "Entreg_adelantado",
                                !formSets[index].Entreg_adelantado
                              )
                            } // Update specific checkbox state
                            className="check check2 rounded-md w-4 h-4 "
                          />
                        </div>
                      </div> */}
                    </div>
                    <div className="flex gap-4 justify-end mb-4">
                      <button
                        className="self-end w-18 text-xs h-8  py-1 px-2 rounded-md border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-semibold bg-transparent"
                        onClick={() => delRecord(form.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // VISTA DE LISTA

          <div className="w-full flex flex-col justify-center items-center mt-8 ">
            {filtredEntys.map((form, index) => (
              <div className="list z-0 mb-4">
                <div
                  className=" flex justify-between pr-[130px] box1  "
                  key={form.id}
                >
                  <div className="flex flex-col w-16 ">
                    <label
                      htmlFor="Paginas_a_entregar"
                      className="block text-xs font-medium text-gray-700 mb-2 "
                    >
                      Nº Entrega
                    </label>
                    <p className="border-2 border-gray-500 rounded-lg flex justify-center">
                      {form.Name}
                    </p>
                  </div>
                  <div className="flex flex-col w-24 text-center ml-2 ">
                    <label
                      htmlFor="Paginas_a_entregar"
                      className="block text-xs font-medium text-gray-700 mb-2 "
                    >
                      Nº E. Gestor
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
                      value={form.Entrega_Gestor}
                      className="border-2 w-24 border-gray-500 rounded-lg flex justify-center text-center"
                    />
                  </div>

                  <div className="mb-4 flex flex-col items-center ml-1 ">
                    <label
                      htmlFor="Estado"
                      className="block  text-sm font-medium text-gray-700"
                    >
                      Estado
                    </label>
                    <select
                      id="Estado"
                      name="Estado"
                      value={form.Estado}
                      onChange={(e) =>
                        handleFieldChange(index, "Estado", e.target.value)
                      }
                      className="border-2 w-32 h-[28px]  text-xs border-gray-500 rounded-lg flex justify-center text-center mt-[4px]"
                    >
                      <option value="None">-None-</option>
                      {form.Name && form.Name !== "CO" ? (
                        <option value="Pendiente">Pendiente</option>
                      ) : null}
                      <option value="Entregada">Entregada</option>
                      <option value="Paralizada">Paralizada</option>
                      <option value="Retrasada">Retrasada</option>
                      {form.Name && form.Name === "CO" ? (
                        <option value="Correcciones">Correcciones</option>
                      ) : null}
                      <option value="Entrega asignada">Entrega asignada</option>
                      <option value="Caida">Caida</option>
                    </select>
                  </div>
                  {form.Name && form.Name !== "CO" ? (
                    <div className="mb-4 flex flex-col items-center ml-2 ">
                      <label
                        htmlFor="Paginas_a_entregar"
                        className="block text-xs font-medium text-gray-700 mb-2 "
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
                        value={form.Paginas_a_entregar}
                        className="border-2 w-24 border-gray-500 rounded-lg flex justify-center text-center"
                      />
                    </div>
                  ) : null}
                  <div className="mb-4 flex flex-col items-center ml-4 ">
                    <label
                      htmlFor="Fecha_entrega_profesional"
                      className="block text-xs font-medium text-gray-700 mb-2 "
                    >
                      Fecha entrega profesional
                    </label>
                    <input
                      type="date"
                      id="Fecha_entrega_profesional"
                      name="Fecha_entrega_profesional"
                      required
                      onChange={(e) =>
                        handleFieldChange(
                          index,
                          "Fecha_entrega_profesional",
                          e.target.value
                        )
                      }
                      value={form.Fecha_entrega_profesional}
                      className="border-2 w-32 h-[26px]  text-xs border-gray-500 rounded-lg flex justify-center text-center"
                    />
                  </div>
                  <div className="mb-4 flex flex-col items-center ml-4 ">
                    <label
                      htmlFor="Fecha_entrega_cliente"
                      className="block text-xs font-medium text-gray-700 mb-2 "
                    >
                      Fecha entrega cliente
                    </label>
                    <input
                      type="date"
                      id="Fecha_entrega_cliente"
                      name="Fecha_entrega_cliente"
                      value={form.Fecha_entrega_cliente}
                      required
                      onChange={(e) =>
                        handleFieldChange(
                          index,
                          "Fecha_entrega_cliente",
                          e.target.value
                        )
                      }
                      className="border-2 w-32 h-[26px]  text-xs border-gray-500 rounded-lg flex justify-center text-center"
                    />
                  </div>
                  <div className="mb-4 flex flex-col items-center ml-4 ">
                    <label
                      htmlFor="Fecha_entrega_cliente"
                      className="block text-xs font-medium text-gray-700 mb-2 "
                    >
                      Fecha reagendada
                    </label>
                    <input
                      type="date"
                      id="Fecha_reagendada"
                      name="Fecha_reagendada"
                      readOnly
                      onChange={(e) =>
                        handleFieldChange(
                          index,
                          "Fecha_reagendada",
                          e.target.value
                        )
                      }
                      value={form.Fecha_reagendada}
                      className="border-2 w-32 h-[26px]  text-xs border-gray-500 rounded-lg flex justify-center text-center"
                    />
                  </div>
                  <div className="mb-4 flex flex-col items-center ml-4 ">
                    <label
                      htmlFor="Hora"
                      className="block text-xs font-medium text-gray-700 mb-2 "
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
                      value={form.Hora}
                      className="border-2 w-32 h-[26px]  text-xs border-gray-500 rounded-lg flex justify-center text-center"
                    />
                  </div>
                  {form.Name && form.Name === "CO" ? (
                    <div className="mb-4 flex flex-col items-center ml-4 ">
                      <label
                        htmlFor="Correcciones"
                        className="block text-xs font-medium text-gray-700 mb-2 "
                      >
                        Correcciones
                      </label>

                      <select
                        id="Correcciones"
                        name="Correcciones"
                        value={form.Correcciones}
                        className="block w-[200px] h-[26px] border-2 px-2 border-gray-500 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ml-2"
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
                  {/* coment */}
                </div>
                <div className=" flex gap-8">
                  <div className="mb-4 urgente flex items-center">
                    <label
                      htmlFor="Urgente"
                      className="block text-xs font-medium text-gray-700"
                    >
                      Urgente?
                    </label>
                    <div className=" justify-center items-center">
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
                        className="rounded-md w-4 h-4 mt-1 ml-6"
                      />
                    </div>
                  </div>
                  {/* <div className=" entrego mb-4 items-center">
                    <label
                      htmlFor="Entreg_adelantado"
                      className="block text-xs font-medium text-gray-700"
                    >
                      Entregó adelantado
                    </label>
                    <div className="flex justify-center items-center">
                      <input
                        type="checkbox"
                        id="Entreg_adelantado"
                        name="Entreg_adelantado"
                        checked={formSets[index].Entreg_adelantado} // Access state from object
                        onChange={() =>
                          handleFieldChange(
                            index,
                            "Entreg_adelantado",
                            !formSets[index].Entreg_adelantado
                          )
                        } // Update specific checkbox state
                        className="rounded-md w-4 h-4 mt-1 ml-6"
                      />
                    </div>
                  </div> */}
                  <div className=" comentario  ">
                    <label
                      htmlFor="Comentario"
                      className="block text-xs font-medium text-gray-700 mr-4"
                    >
                      Comentario
                    </label>
                    <textarea
                      id="Comentario"
                      name="Comentario"
                      value={form.Comentario}
                      onChange={(e) =>
                        handleFieldChange(index, "Comentario", e.target.value)
                      }
                      className=" area border-2  h-[26px] flex justify-center items-center pl-4 text-start text-xs border-gray-500 rounded-lg "
                    ></textarea>
                  </div>
                  <div className="buttons ">
                    <button
                      className="self-end w-18 text-xs h-8  py-1 px-2 rounded-md border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-semibold bg-transparent"
                      onClick={() => delRecord(form.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="w-full h-[100px]"></div>
      </div>
      {showPopup && (
        <PopupForm
          registerID={registerID}
          onAddFormSet={handleRecord}
          togglePopup={togglePopup}
          formSets={formSets}
          datos={datos}
        />
      )}
      {showPopupCo && (
        <PopupCoForm
          registerID={registerID}
          onAddFormSet={handleRecord}
          togglePopupCo={togglePopupCo}
          formSets={formSets}
          datos={datos}
        />
      )}
    </div>
  );
};

export default Home;
