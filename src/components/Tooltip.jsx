import React, { useState } from "react";
import { FaRegQuestionCircle } from "react-icons/fa";

const Tooltip = ({ title, width = "300px", height = "auto", pos }) => {
  const [showTitle, setShowTitle] = useState(false);

  const handleIconClick = () => {
    setShowTitle(!showTitle);
  };

  return (
    <div className="relative tool cursor-pointer">
      <FaRegQuestionCircle size={15} onClick={handleIconClick} />
      {showTitle && (
        <div
          className={` absolute ${
            pos ? pos : "top-5 right-0"
          } bg-[#222631] border-none shadow-xl text-white border p-2 rounded z-50`}
          style={{
            width,
            height,
            wordWrap: "break-word",
            whiteSpace: "normal",
            fontSize: "14px",
            fontWeight: "normal",
          }}
        >
          {title}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
