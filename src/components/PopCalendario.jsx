import React from "react";
import { LuCalendarSearch } from "react-icons/lu";

const PopCalendario = ({ datos, registerID, dark }) => {
  const abrirC1 = () => {
    window.open(
      `https://app.zonagestion.com/calendario?zoho=${registerID}`,
      "_blank"
    );
  };
  const abrirC2 = () => {
    window.open(
      `https://app.zonagestion.com/calendario?zoho=${registerID + "&filtro=1"}`,
      "_blank"
    );
  };
  return (
    <div className="gap-2 rounded-md flex center items-center">
      <button
        className={`flex items-center gap-2 border-none h-8 border-2 text-xs py-1 px-2 rounded-md ${
          dark === true ? "bg-[#ff862e]" : "bg-[#4c41ec]"
        }  text-white font-semibold ${
          dark === true ? "hover:bg-[#ff7640]" : "hover:bg-[#3232b6]"
        } hover:text-white`}
        onClick={abrirC1}
      >
        <LuCalendarSearch size={16} className=" cursor-pointer" />
        Calendar Profesional
      </button>
      <button
        className={`flex items-center gap-2 border-none h-8 border-2 text-xs py-1 px-2 rounded-md ${
          dark === true ? "bg-[#ff862e]" : "bg-[#4c41ec]"
        }  text-white font-semibold ${
          dark === true ? "hover:bg-[#ff7640]" : "hover:bg-[#3232b6]"
        } hover:text-white`}
        onClick={abrirC2}
      >
        <LuCalendarSearch size={16} className=" cursor-pointer" />
        Calendar Proyecto
      </button>
    </div>
  );
};

export default PopCalendario;
