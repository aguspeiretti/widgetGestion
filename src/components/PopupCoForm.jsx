import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const PopupCoForm = ({
  datos,
  registerID,
  onAddFormSet,
  togglePopupCo,
  formSets,
}) => {
  console.log("Form", formSets);

  const [formData, setFormData] = useState({
    Name: "CO",
    Estado: "Correcciones",
    Coordinacion_asociada: registerID,
    Paginas_a_entregar: "",
    Fecha_entrega_profesional: "",
    Fecha_entrega_cliente: "",
    Fecha_reagendada: "",
    Comentario: "",
    Hora: "",
    Correcciones: "",
    Urgente: false,
    Entreg_adelantado: false,
    Entrega_Gestor: "CO",
  });

  const tag = datos && datos.Tag ? datos.Tag[0].name : null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      formData.Estado === "Correcciones" &&
      (!formData.Correcciones || formData.Correcciones === "None")
    ) {
      Swal.fire({
        icon: "error",
        title: "Campos obligatorios",
        text: "Debe seleccionar un tipo de correccion",
      });
      return;
    }
    if (
      !formData.Fecha_entrega_cliente ||
      !formData.Fecha_entrega_profesional
    ) {
      Swal.fire({
        icon: "error",
        title: "Campos obligatorios",
        text: "Fecha de cliente y entrega profesional son obligatorios",
      });
      return;
    }
    onAddFormSet(formData);
    console.log(formData);
    setFormData({
      Name: "CO",
      Estado: "Correcciones",
      Coordinacion_asociada: registerID,
      Paginas_a_entregar: "",
      Fecha_entrega_profesional: "",
      Fecha_entrega_cliente: "",
      Fecha_reagendada: "",
      Comentario: "",
      Hora: "",
      Correcciones: "",
      Urgente: false,
      Entreg_adelantado: false,
      Entrega_Gestor: "CO",
    });
    togglePopupCo(); // Cierra el popup
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

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[30%]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold mb-4"> Nueva Entrada</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex items-center">
            <label
              htmlFor="Paginas_a_entregar"
              className="block text-sm font-medium text-gray-700 mr-4"
            >
              Nº de entrega
            </label>
            <p>{formData.Name}</p>
          </div>

          <div className="flex w-full justify-between">
            <div className="w-[100%] ">
              <div className="mb-4 flex items-center justify-between ">
                <label
                  htmlFor="Estado"
                  className="block text-sm font-medium text-gray-700"
                >
                  Estado
                </label>
                <select
                  id="Estado"
                  name="Estado"
                  value={formData.Estado}
                  onChange={handleChange}
                  className="block w-[125px]  border-2 px-2 border-gray-500 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ml-2"
                >
                  <option value="None">-None-</option>
                  {/* <option value="Pendiente">Pendiente</option> */}
                  <option value="Entregada">Entregada</option>
                  <option value="Paralizada">Paralizada</option>
                  <option value="Retrasada">Retrasada</option>
                  <option value="Correcciones">Correcciones</option>
                  <option value="Entrega asignada">Entrega asignada</option>
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
                  value={formData.Paginas_a_entregar}
                  onChange={handleChange}
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
                  value={formData.Fecha_entrega_profesional}
                  onChange={handleChange}
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
                  value={formData.Fecha_entrega_cliente}
                  onChange={handleChange}
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
                  value={formData.Hora}
                  onChange={handleChange}
                  className="block border-2 w-[125px] text-center border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-between mt-2">
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
                      checked={formData.Urgente}
                      onChange={handleChange}
                      className="rounded-md w-4 h-4 mt-1 ml-6"
                    />
                  </div>
                </div>
              </div>
              <div className="mb-4 w-full flex items-center justify-between">
                <label
                  htmlFor="Correcciones"
                  className="block text-sm font-medium text-gray-700"
                >
                  Correcciones
                </label>

                <select
                  id="Correcciones"
                  name="Correcciones"
                  value={formData.Correcciones}
                  onChange={handleChange}
                  className="block w-[125px] border-2 ml-4 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              <div className="mb-4 ">
                <label
                  htmlFor="Comentario"
                  className="block  text-sm font-medium text-gray-700"
                >
                  Comentario
                </label>
                <textarea
                  id="Comentario"
                  name="Comentario"
                  value={
                    formData.Comentario
                      ? formData.Comentario
                      : tag === "Para traducir"
                      ? "PARA TRADUCIR"
                      : tag === "Traducir"
                      ? "TRADUCCION"
                      : ""
                  }
                  onChange={handleChange}
                  className="mt-1 block w-full border-2 pl-2 pt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                ></textarea>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Agregar
                </button>
                <button
                  onClick={() => togglePopupCo()}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-500 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div></div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PopupCoForm;
