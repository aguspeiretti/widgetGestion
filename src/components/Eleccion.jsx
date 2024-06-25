import React from "react";

const Eleccion = ({ togglePopup, togglePopupCo }) => {
  return (
    <div className="absolute w-44 h-24 bg-white rounded-lg top-[70px] right-6 shadow-2xl border-2 p-1 flex-col z-20">
      <div
        onClick={togglePopup}
        className="border-2 rounded-md p-1 mb-3 cursor-pointer hover:bg-violet-400 hover:text-white"
      >
        Entrega numeradas
      </div>
      <div
        onClick={togglePopupCo}
        className="border-2 rounded-md p-1 cursor-pointer hover:bg-violet-400 hover:text-white"
      >
        Entrega correcciones
      </div>
    </div>
  );
};

export default Eleccion;
