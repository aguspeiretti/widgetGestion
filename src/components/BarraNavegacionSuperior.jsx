import React from "react";
import PopCalendario from "./PopCalendario";
import { IoCloseCircleOutline } from "react-icons/io5";
import { FaRegClock } from "react-icons/fa";
import { MdCheck } from "react-icons/md";

const BarraNavegacionSuperior = ({
  dark,
  datos,
  registerID,
  close,
  saveAllChanges,
  guardarYavanzar,
}) => {
  return (
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
        <PopCalendario dark={dark} datos={datos} registerID={registerID} />
      </div>
      <div className=" h-[50px] flex gap-4  items-center justify-center ">
        <button
          className="flex items-center gap-2 w-28 h-8 border-2 text-xs py-1 px-2 rounded-md bg-[#f73463] border-none text-white font-semibold hover:bg-red-600 hover:text-white"
          onClick={close}
        >
          <IoCloseCircleOutline size={20} />
          Cancelar
        </button>
        <div
          className={`flex items-center gap-2 border-none h-8 border-2 text-xs py-1 px-2 rounded-md cursor-pointer ${
            dark === true ? "bg-[#ff862e]" : "bg-[#4c41ec]"
          }  text-white font-semibold hover:bg-[#3232b6] hover:text-white`}
          onClick={saveAllChanges}
        >
          <FaRegClock size={14} />
          Guardar y cerrar
        </div>

        <button
          className="flex items-center gap-2  h-8 border-2 text-xs py-1 px-2 rounded-md bg-[#43d1a7] border-none text-white font-semibold hover:bg-green-600 hover:text-white"
          onClick={() => guardarYavanzar()}
        >
          <MdCheck size={16} />
          Guardar y avanzar
        </button>
      </div>
    </div>
  );
};

export default BarraNavegacionSuperior;
