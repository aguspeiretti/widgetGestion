import "./App.css";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import { execute, getRecord } from "./functions/apiFunctions";

function App(data) {
  const module = data.data.Entity;
  const registerID = data.data.EntityId;
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    window.ZOHO.CRM.UI.Resize({ height: "100%", width: "100%" }).then(function (
      data
    ) {});

    getRecord(module, registerID)
      .then(function (result) {
        const datos = result.register;
        setDatos(datos);
      })
      .catch(function (error) {
        // console.error(error);
      });
  }, [module, registerID]);

  //params para ejecutar execute

  // var func_name = "ejecucionPruebaWidget";
  // var req_data = {
  //   arguments: JSON.stringify({
  //     param1: "siprxx.xxx@xxxx.com",
  //   }),
  // };
  // execute(func_name, req_data);

  //-------------------------->

  return (
    <div className="App ">
      {data !== null ? (
        <Home datos={datos} registerID={registerID} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;
