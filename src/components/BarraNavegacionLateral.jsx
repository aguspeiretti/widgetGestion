import React, { useEffect, useRef, useState } from "react";
import Tooltip from "./Tooltip";
import { BsFilterSquare } from "react-icons/bs";
import {
  getRecord,
  getRelatedRecords,
  updateRecord,
} from "../functions/apiFunctions";
import Swal from "sweetalert2";
import { FaSpinner } from "react-icons/fa";

const BarraNavegacionLateral = ({
  dark,
  datos,
  setFilter,
  truncateText,
  delAllRecords,
  registerID,
  realizarGuardado,
  formatDate,
}) => {
  const [nReasignar, setNreasignar] = useState("");
  const [tipoCoordinacion, setTipoCoordinacion] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false); // Estado para el mensaje de éxito
  const [profesionalAsignado, setProfesionalAsignado] = useState("");
  const [colorProfesional, setColorProfesional] = useState("");
  const isMounted = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [profesionalData, setProfesionalData] = useState({
    id: "",
    color: "",
  });
  const abortController = useRef(null);

  useEffect(() => {
    const getRecords = async () => {
      try {
        const response = await getRecord("Coordinacion", registerID);
        console.log(response, "desde la barra lateral");
        setProfesionalAsignado(response.register.Profesional_Asignado.id);
        setNreasignar(response.register.Num_entregas_del_reasignar);
        setTipoCoordinacion(response.register.Tipo_de_coordinacion);
      } catch (error) {
        console.log(error);
      }
    };
    getRecords();
  }, []);

  useEffect(() => {
    const fetchProfesionalData = async () => {
      // Cancel any ongoing requests
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();

      try {
        setIsLoading(true);
        // First get the coordination data
        const coordinacionResponse = await getRecord(
          "Coordinacion",
          registerID
        );

        if (!coordinacionResponse?.register?.Profesional_Asignado?.id) {
          throw new Error("No professional ID found");
        }

        const profesionalId =
          coordinacionResponse.register.Profesional_Asignado.id;

        // Then get the professional's color data
        const profesionalResponse = await getRecord("Vendors", profesionalId);

        if (!profesionalResponse?.register?.Color_profesional) {
          throw new Error("No color data found");
        }

        setProfesionalData({
          id: profesionalId,
          color: profesionalResponse.register.Color_profesional,
        });
      } catch (error) {
        console.error("Error fetching professional data:", error);
        setProfesionalData({ id: "", color: "" });
      } finally {
        setIsLoading(false);
      }
    };

    if (registerID) {
      fetchProfesionalData();
    }

    // Cleanup function
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [registerID]);

  const getColorClassName = (color) => {
    const colorMap = {
      Rojo: "bg-red-500 text-white",
      Verde: "bg-green-500 text-white",
      Naranja: "bg-orange-500 text-white",
      Gris: "bg-gray-500 text-white",
      "": "border-2 border-black  text-black rounded-lg",
    };
    return colorMap[color] || colorMap[""];
  };

  // Color display component
  const ColorDisplay = () => (
    <div className="flex flex-col text-center items-center w-full mt-0 px-4 justify-between">
      <p
        className={`${
          dark ? "text-[#dddee0]" : "text-zinc-800"
        } text-[14px] font-extrabold`}
      >
        Color profesional:
      </p>
      <div
        className={`px-2 py-1 rounded-lg transition-colors duration-300 ${getColorClassName(
          profesionalData.color
        )}`}
      >
        <p className={`text-[14px] ml-2 font-semibold mr-2`}>
          {isLoading ? "Cargando..." : profesionalData.color || "-"}
        </p>
      </div>
    </div>
  );

  useEffect(() => {
    if (!isMounted.current) {
      // Si es la primera vez, marcar como montado
      isMounted.current = true;
      return; // Salir del efecto
    }

    // Llamar a handleSubmit sin evento
    handleSubmit(null);
  }, [realizarGuardado]);

  const handleSubmit = async (event) => {
    // Prevenir evento solo si existe
    if (event && event.preventDefault) {
      event.preventDefault();
    }

    console.log("ChildComponent: Iniciando handleSubmit");
    setLoading(true);
    setSaved(false);

    const APIData = {
      id: registerID,
      Num_entregas_del_reasignar: nReasignar,
    };

    try {
      console.log("ChildComponent: Ejecutando actualización...");
      const data = await window.ZOHO.CRM.API.updateRecord({
        Entity: "Coordinacion",
        APIData: APIData,
        Trigger: [], // Importante: array vacío
      });

      console.log("ChildComponent: Actualización exitosa", data);
      setLoading(false);
      setSaved(true);

      // Verificar que todo sigue funcionando después de la actualización
      console.log(
        "ChildComponent: Widget sigue abierto después de actualización"
      );

      setTimeout(() => {
        setSaved(false); // Resetea el mensaje de guardado
      }, 2000);

      return data;
    } catch (error) {
      console.error("ChildComponent: Error en la actualización:", error);
      setLoading(false);

      await Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        text: "No se pudo actualizar el registro",
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });

      throw error;
    }
  };

  return (
    <div
      className={`flex flex-col w-[200px] h-[100%]  ${
        dark ? "bg-[#2f374c]" : "bg-[#e5e5e6]"
      } items-center mb-2 ${dark ? "text-[#ffb22e]" : "text-[#4c41ec]"}  `}
    >
      <div className="flex flex-col text-center items-center  w-full mt-4 px-4 justify-between ">
        <p
          className={`${
            dark ? "text-[#dddee0]" : "text-zinc-800"
          }  text-[14px] font-extrabold `}
        >
          Total de paginas:
        </p>
        <p className="font-semibold  text-[14px] ml-1">
          {datos.Numero_de_Paginas !== undefined &&
          datos.Numero_de_Paginas !== null
            ? datos.Numero_de_Paginas
            : "-"}
        </p>
      </div>

      <div className="flex flex-col text-center items-center  w-full mt-4 px-4 justify-between ">
        <p
          className={`${
            dark ? "text-[#dddee0]" : "text-zinc-800"
          }  text-[14px] font-extrabold `}
        >
          Paginas nuevas:
        </p>
        <p className="font-semibold  text-[14px] ml-1">
          {datos.Cuantas_pagina_son_nuevas !== undefined &&
          datos.Cuantas_pagina_son_nuevas !== null
            ? datos.Cuantas_pagina_son_nuevas
            : "-"}
        </p>
      </div>
      <div className="flex flex-col text-center items-center  w-full mt-4 px-4 justify-between ">
        <p
          className={`${
            dark ? "text-[#dddee0]" : "text-zinc-800"
          }  text-[14px] font-extrabold `}
        >
          Pag. correcciones:
        </p>
        <p className="font-semibold  text-[14px] ml-1">
          {datos.Cuantas_paginas_son_de_correcciones !== undefined &&
          datos.Cuantas_paginas_son_de_correcciones !== null
            ? datos.Cuantas_paginas_son_de_correcciones
            : "-"}
        </p>
      </div>
      <div className="flex flex-col text-center items-center  w-full mt-4 px-6 justify-between ">
        <p
          className={`${
            dark ? "text-[#dddee0]" : "text-zinc-800"
          }  text-[14px] font-extrabold `}
        >
          Pag. 1er entrega:
        </p>
        <p className="font-semibold  text-[14px] ml-1">
          {datos.Pagina_Primera_Entrega !== undefined &&
          datos.Pagina_Primera_Entrega !== null
            ? datos.Pagina_Primera_Entrega
            : "-"}
        </p>
      </div>

      <div className="flex flex-col text-center items-center  w-full mt-4 px-4 justify-between ">
        <p
          className={`${
            dark ? "text-[#dddee0]" : "text-zinc-800"
          }  text-[14px] font-extrabold mr-2 `}
        >
          Fecha profesional:
        </p>
        <p className="font-semibold  text-[14px] mr-6 ">
          {datos.Fecha_para_el_Profesional1
            ? formatDate(datos.Fecha_para_el_Profesional1)
            : "-"}
        </p>
      </div>
      <div className="flex flex-col text-center items-center  w-full mt-4 px-4 justify-between ">
        <p
          className={`${
            dark ? "text-[#dddee0]" : "text-zinc-800"
          }  text-[14px] font-extrabold `}
        >
          Fechas especificas:
        </p>
        <p className="text-[14px] ml-2 font-semibold mr-2 ">
          {datos && datos.Cu_les_son_las_fechas_espec_ficas
            ? truncateText(datos.Cu_les_son_las_fechas_espec_ficas, 15)
            : "-"}
        </p>
        <Tooltip
          pos={"top-4 right-30"}
          title={datos && datos.Cu_les_son_las_fechas_espec_ficas}
        />
      </div>
      <div className="flex  flex-col text-center items-center  w-full mt-2 px-4 justify-between ">
        <ColorDisplay />
      </div>
      <div className="flex flex-col text-center items-center  w-full mt-4 px-4 justify-between ">
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
          } text-[14px]  sm:text-sm ${dark ? "text-white" : "text-zinc-800"}`}
          name="filter"
          id="filter"
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="Todas">Todas</option>
          <option value="Entrega Numerada">Entrega Numerada</option>
          <option value="Entrega Correcciones">Entrega Correcciones</option>
        </select>
      </div>
      {tipoCoordinacion &&
      ["Ampliar", "Rehacer", "Reasignacion"].includes(tipoCoordinacion) ? (
        <div className="text-black mt-4 font-semibold flex flex-col">
          <p className="text-sm mb-2">N. entrega reasignar</p>
          <textarea
            value={nReasignar}
            className="rounded-md text-sm p-2"
            maxLength={50}
            onChange={(e) => setNreasignar(e.target.value)}
          ></textarea>
          <button
            onClick={handleSubmit}
            className="bg-indigo-700 mt-4 py-2 rounded-xl text-white text-xs w-[130px] flex justify-center items-center"
          >
            {loading ? (
              <FaSpinner className="animate-spin w-5 h-5" /> // Spinner que gira
            ) : saved ? (
              <span>¡Guardado!</span> // Mensaje de éxito
            ) : (
              "Guardar N. entrega"
            )}
          </button>
        </div>
      ) : null}

      <div className="flex mt-8 mb-8">
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
  );
};

export default BarraNavegacionLateral;
