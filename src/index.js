import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.js";
import "./index.css";

window.ZOHO.embeddedApp.on("PageLoad", function (data) {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <React.StrictMode>
      <App data={data} />
    </React.StrictMode>
  );
});
window.ZOHO.embeddedApp.init();

//Entrorno para visualizar en localhost

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );
