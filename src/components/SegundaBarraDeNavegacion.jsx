import React from "react";
import Tooltip from "./Tooltip";

const SegundaBarraDeNavegacion = ({
  dark,
  datos,
  truncateText,
  formatDate,
}) => {
  return (
    <div
      className={` segunda-barra flex  h-[40px] ${
        dark ? "bg-[#2f374c]" : "bg-[#e5e5e6]"
      } ${
        dark ? "text-[#ffb22e]" : "text-[#4c41ec]"
      }  justify-around items-center pr-6 pl-2 shadow-2xl relative `}
    >
      <div className="flex  text-center item-center  ">
        <p
          className={`${
            dark ? "text-[#dddee0]" : "text-zinc-800"
          }  text-[14px] font-extrabold mr-2 `}
        >
          Fecha final entrega ventas:
        </p>
        <p className="font-semibold  text-[14px] mr-6 ">
          {datos.Fecha_Final_de_Entrega
            ? formatDate(datos.Fecha_Final_de_Entrega)
            : "-"}
        </p>
      </div>
      <div className="flex  text-center item-center justify-center  ">
        <p
          className={`${
            dark ? "text-[#dddee0]" : "text-zinc-800"
          }  text-[14px] font-extrabold  mr-4 `}
        >
          Comentario cliente
        </p>
        <Tooltip
          pos={"top-4 right-30"}
          title={datos && datos.Comentario_del_cliente}
        />
      </div>
      <div className="flex  text-center items-center ">
        <p
          className={`${
            dark ? "text-[#dddee0]" : "text-zinc-800"
          }  text-[14px] font-extrabold mr-4 `}
        >
          Comentario nuevas pautas
        </p>
        <Tooltip
          pos={"top-4 right-30"}
          title={datos && datos.Comentario_cerrado_nuevas_pautas}
        />
      </div>
      <div className="flex  text-center items-center">
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
            : "-"}
        </p>
        <Tooltip title={datos.Tema_del_Proyecto} />
      </div>
    </div>
  );
};

export default SegundaBarraDeNavegacion;
