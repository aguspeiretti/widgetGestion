import React, { useState, useRef, useEffect } from "react";

const DropCustom = ({
  options,
  value,
  onChange,
  className,
  dark,
  handleEstadoElegido,
  id,
  index,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedOption = options.find((option) => option.value === value);

  const handleToggleDropdown = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  const handleSelectOption = (option) => {
    onChange(option.value);
    setIsOpen(false);
    handleEstadoElegido(option.value, id);
  };

  // Efecto para manejar clics fuera del dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    // Agregar listener si el dropdown está abierto
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Limpiar el listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      ref={dropdownRef}
      className={`cursor-pointer ${
        dark ? " bg-[#222631]" : "bg-white"
      }  block relative border-none p-1 w-[125px] text-[15px] text-center border-gray-300 rounded-md shadow-sm ${
        dark ? " text-white" : "text-black"
      }`}
    >
      <div className="dropdown-trigger" onClick={handleToggleDropdown}>
        {selectedOption ? (
          <div className="flex items-center justify-start ml-2 ">
            <div
              className="w-2 h-2 rounded-full "
              style={{ backgroundColor: selectedOption.color }}
            ></div>
            <div className="ml-2">{selectedOption.label}</div>
          </div>
        ) : (
          "Seleccionar"
        )}
      </div>
      {isOpen && (
        <div
          className={`dropdown-content absolute top-5 right-[-15px] ${
            dark ? "bg-[#222631]" : "bg-white"
          } w-40 h-60 rounded-md border-[2px] z-10`}
        >
          {options.map((option) => (
            <div
              key={option.color}
              className="h-6 mt-1 hover:bg-slate-200 flex items-center justify-center"
            >
              <div className="w-[20%] flex justify-center">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: option.color }}
                ></div>
              </div>
              <div
                key={option.value}
                className="w-[80%] flex justify-start text-sm font-semibold"
                onClick={() => handleSelectOption(option)}
              >
                <p className="font-semibold">{option.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropCustom;
