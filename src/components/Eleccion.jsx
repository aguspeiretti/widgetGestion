import React from "react";

const Eleccion = ({ togglePopup, togglePopupCo }) => {
  return (
    <div className="absolute w-[200px]  right-[50px] top-4 bg-transparent border-none rounded-lg  border-2 p-1 flex-col z-20 text-white">
      <div
        onClick={togglePopup}
        className="border-2 rounded-md text-center bg-[#909091] p-1 mb-3 cursor-pointer hover:bg-[#ff862e] hover:text-white shadow-xl border-none"
      >
        Entrega numeradas
      </div>
      <div
        onClick={togglePopupCo}
        className="border-2 rounded-md bg-[#909091] text-center p-1 cursor-pointer hover:bg-[#ff862e] hover:text-white shadow-xl border-none"
      >
        Entrega correcciones
      </div>
    </div>
  );
};

export default Eleccion;
