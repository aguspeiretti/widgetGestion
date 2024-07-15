import React, { useState } from "react";

const DropCustom = ({ options, value, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  const handleToggleDropdown = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  const handleSelectOption = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className="cursor-pointer bg-white block relative border-2 w-[125px] text-xs text-center border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
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
        <div className="dropdown-content  absolute top-5 right-[-15px] bg-white w-40 h-60 rounded-md border-[2px] z-10  ">
          {options.map((option) => (
            <div className="h-6 mt-1 hover:bg-slate-200 flex items-center justify-center ">
              <div className="w-[20%] flex justify-center ">
                <div
                  className="w-3 h-3 rounded-full "
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
