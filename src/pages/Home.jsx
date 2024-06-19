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

const Home = ({ datos, registerID }) => {
  const [formSets, setFormSets] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [shouldGetRecords, setShouldGetRecords] = useState(true);

  const getRecords = () => {
    getRelatedRecords("Coordinacion", registerID, "Entregas_asociadas")
      .then(function (result) {
        const datos = result.register.map((record) => ({
          id: record.id,
          ...record,
        }));
        setFormSets(datos);
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  useEffect(() => {
    if (shouldGetRecords) {
      getRecords();
      setShouldGetRecords(false);
    }
  }, [shouldGetRecords]);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleRecord = (formData) => {
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
      if (fieldName === "Urgente" || fieldName === "Entreg_adelantado") {
        newFormSets[index][fieldName] = !newFormSets[index][fieldName];
      } else {
        newFormSets[index][fieldName] = value;
      }
      return newFormSets;
    });
  };

  const delRecord = async (id) => {
    await deleteRecord(id, datos, registerID);
    setFormSets((prevFormSets) =>
      prevFormSets.filter((form) => form.id !== id)
    );
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
        Swal.fire({
          icon: "success",
          title: "Registro actualizado",
          showConfirmButton: false,
          timer: 2000,
        });
      })
      .catch((error) => {
        console.error("Error updating record", error);
      });
  };

  return (
    <div className="w-screen h-screen font-mundo flex">
      <div className="w-[150px] h-full bg-violet-500 px-[30px] pt-4 flex flex-col items-center fixed">
        {datos && datos.Name ? (
          <p className="text-2xl text-white drop-shadow-xl  ">{datos.Name}</p>
        ) : null}
      </div>
      <div className="ml-[150px] w-[calc(100%-150px)] max-w-full flex-col  h-[100%] max-h-full  bg-mundoJob bg-cover bg-center pt-4  gap-4 px-[30px]">
        <div className="flex w-full justify-end gap-4">
          <button
            className="w-24 h-10 border-2 py-1 px-2 rounded-md border-violet-500 text-violet-500 font-semibold"
            onClick={togglePopup}
          >
            Nuevo +
          </button>
        </div>
        <div className="w-full flex justify-center items-center ">
          <div className="w-[1300px]  gap-8 flex  flex-wrap mt-8">
            {formSets
              .sort((a, b) => parseInt(a.Name) - parseInt(b.Name))
              .map((form, index) => (
                <div key={form.id}>
                  <div className="w-[370px] flex flex-col justify-between border-2 p-4 border-zinc-400 rounded-lg shadow-xl">
                    <div className="mb-4 flex items-center">
                      <label
                        htmlFor="Paginas_a_entregar"
                        className="block text-sm font-medium text-gray-700 mr-4"
                      >
                        Nº de entrega
                      </label>
                      <p>{form.Name}</p>
                    </div>
                    <div className="mb-4 flex items-center ">
                      <label
                        htmlFor="Estado"
                        className="block text-sm font-medium text-gray-700"
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
                        className="block w-full border-2 px-2 border-gray-500 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ml-2"
                      >
                        <option value="None">-None-</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Entregada">Entregada</option>
                        <option value="Paralizada">Paralizada</option>
                        <option value="Retrasada">Retrasada</option>
                        <option value="Correcciones">Correcciones</option>
                        <option value="Entrega asignada">
                          Entrega asignada
                        </option>
                        <option value="Caida">Caida</option>
                      </select>
                    </div>
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
                    <div className="mb-4 flex items-center justify-between">
                      <label
                        htmlFor="Fecha_entrega_profesional"
                        className="block text-sm font-medium text-gray-700 mr-4"
                      >
                        Fecha entrega profesional
                      </label>
                      <input
                        type="date"
                        id="Fecha_entrega_profesional"
                        name="Fecha_entrega_profesional"
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "Fecha_entrega_profesional",
                            e.target.value
                          )
                        }
                        value={form.Fecha_entrega_profesional}
                        className="block border-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="mb-4 flex items-center justify-between">
                      <label
                        htmlFor="Fecha_entrega_cliente"
                        className="block text-sm font-medium text-gray-700 mr-4"
                      >
                        Fecha entrega cliente
                      </label>
                      <input
                        type="date"
                        id="Fecha_entrega_cliente"
                        name="Fecha_entrega_cliente"
                        value={form.Fecha_entrega_cliente}
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
                        htmlFor="Fecha_entrega_cliente"
                        className="block text-sm font-medium text-gray-700 mr-4"
                      >
                        Fecha entrega cliente
                      </label>
                      <input
                        type="date"
                        id="Fecha_reagendada"
                        name="Fecha_reagendada"
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
                    <div className="mb-4 flex items-center">
                      <label
                        htmlFor="Correcciones"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Correcciones
                      </label>

                      <select
                        id="Correcciones"
                        name="Correcciones"
                        value={form.Correcciones}
                        className="block w-full border-2 px-2 border-gray-500 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ml-2"
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
                        value={form.Comentario}
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
                            checked={form.Urgente}
                            onChange={() => handleFieldChange(index, "Urgente")}
                            className="rounded-md w-4 h-4 mt-1 ml-6"
                          />
                        </div>
                      </div>
                      <div className="mb-4 flex items-center">
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
                            checked={form.Entreg_adelantado}
                            onChange={() =>
                              handleFieldChange(index, "Entreg_adelantado")
                            }
                            className="rounded-md w-4 h-4 mt-1 ml-6"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 justify-end mb-4">
                      <button
                        className="self-end w-18 text-xs h-8 border-2 py-1 px-2 rounded-md border-purple-400 text-purple-400 font-semibold bg-transparent"
                        onClick={() => updateRecordInCRM(index)}
                      >
                        Guardar
                      </button>
                      <button
                        className="self-end w-18 text-xs h-8  py-1 px-2 rounded-md bg-red-500 text-white font-semibold bg-transparent"
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
        <div className="w-full h-[100px]"></div>
      </div>
      {showPopup && (
        <PopupForm
          registerID={registerID}
          onAddFormSet={handleRecord}
          togglePopup={togglePopup}
          formSets={formSets}
        />
      )}
    </div>
  );
};

export default Home;
