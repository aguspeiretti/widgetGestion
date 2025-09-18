import React from "react";
import Swal from "sweetalert2";

const Eleccion = ({
  togglePopup,
  togglePopupCo,
  dark,
  hasUnsavedChanges,
  saveAllChangesWhithOutClose,
  setModifiedIndexes,
}) => {
  const handleAddButtonClick = async () => {
    if (hasUnsavedChanges()) {
      const result = await Swal.fire({
        title: "¿Guardar cambios?",
        text: "Hay cambios sin guardar. ¿Desea guardarlos antes de agregar una nueva entrega?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, guardar",
        cancelButtonText: "No",
      });

      if (result.isConfirmed) {
        Swal.fire({
          title: "Guardando...",
          text: "Por favor espera mientras se guardan los cambios.",
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await saveAllChangesWhithOutClose();

        Swal.close(); // Cierra el mensaje de guardando

        // Añadimos un pequeño retraso antes de abrir el nuevo popup
        setTimeout(() => {
          togglePopup();
        }, 500); // 500 ms de retraso
      } else {
        togglePopup();
      }
    } else {
      togglePopup();
    }
  };

  const handleAddButtonClick2 = async () => {
    if (hasUnsavedChanges()) {
      const result = await Swal.fire({
        title: "¿Guardar cambios?",
        text: "Hay cambios sin guardar. ¿Desea guardarlos antes de agregar una nueva entrega?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, guardar",
        cancelButtonText: "No",
      });

      if (result.isConfirmed) {
        Swal.fire({
          title: "Guardando...",
          text: "Por favor espera mientras se guardan los cambios.",
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await saveAllChangesWhithOutClose();

        Swal.close(); // Cierra el mensaje de guardando

        // Añadimos un pequeño retraso antes de abrir el nuevo popup
        setTimeout(() => {
          togglePopupCo();
        }, 500); // 500 ms de retraso
      } else {
        togglePopupCo();
      }
    } else {
      togglePopupCo();
    }
  };

  const open1 = () => {
    handleAddButtonClick();
  };

  const open2 = () => {
    handleAddButtonClick2();
  };

  return (
    <div
      className={`absolute w-[200px]  right-[50px] top-4 bg-transparent border-none rounded-lg  border-2 p-1 flex-col z-20 text-white`}
    >
      <div
        onClick={open1}
        className={`border-2 rounded-md text-center bg-[#909091] p-1 mb-3 cursor-pointer ${
          dark ? "hover:bg-[#ff862e]" : "hover:bg-[#4649ff]"
        }  hover:text-white shadow-xl border-none`}
      >
        Entrega numeradas
      </div>
      <div
        onClick={open2}
        className={`border-2 rounded-md text-center bg-[#909091] p-1 mb-3 cursor-pointer ${
          dark ? "hover:bg-[#ff862e]" : "hover:bg-[#4649ff]"
        }  hover:text-white shadow-xl border-none`}
      >
        Entrega correcciones
      </div>
    </div>
  );
};

export default Eleccion;
