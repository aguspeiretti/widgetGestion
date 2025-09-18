import Swal from "sweetalert2";

export function getRecord(module, registerID) {
  return new Promise(function (resolve, reject) {
    window.ZOHO.CRM.API.getRecord({ Entity: module, RecordID: registerID })
      .then(function (response) {
        const register = response.data[0];
        resolve({ register });
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

export function getUsers() {
  return new Promise(function (resolve, reject) {
    window.ZOHO.CRM.API.getAllUsers({
      Type: "ActiveUsers",
      page: 1,
      per_page: 200,
    })
      .then(function (response) {})
      .catch(function (error) {
        reject(error);
      });
  });
}

export function attachFile(registerID, file) {
  return new Promise(function (resolve, reject) {
    window.ZOHO.CRM.API.attachFile({
      Entity: "Leads",
      RecordID: registerID,
      File: { Name: "myFile.txt", Content: file },
    })
      .then(function (data) {
        resolve(data);
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

export function getFields(entrity) {
  return new Promise(function (resolve, reject) {
    window.ZOHO.CRM.META.getFields({ Entity: "Leads" })
      .then(function (response) {})
      .catch(function (error) {
        reject(error);
      });
  });
}

export function execute(func_name, req_data) {
  return new Promise(function (resolve, reject) {
    window.ZOHO.CRM.FUNCTIONS.execute(func_name, req_data)
      .then(function (data) {})
      .catch(function (error) {
        reject(error);
      });
  });
}

export function getRelatedRecords(module, registerID, related) {
  return new Promise(function (resolve, reject) {
    window.ZOHO.CRM.API.getRelatedRecords({
      Entity: module,
      RecordID: registerID,
      RelatedList: related,
      page: 1,
      per_page: 200,
    })
      .then(function (response) {
        const register = response.data;
        resolve({ register });
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

export function createRecord() {
  return new Promise(function (resolve, reject) {
    window.ZOHO.CRM.UI.Record.create({ Entity: "Entregas" })
      .then(function (data) {})
      .catch(function (error) {
        reject(error);
      });
  });
}

export function insertRecord(APIData) {
  return new Promise(function (resolve, reject) {
    window.ZOHO.CRM.API.insertRecord({
      Entity: "Entregas",
      APIData: APIData,
      Trigger: ["workflow"],
    })
      .then(function (data) {
        resolve(data);
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

export function insertRecord2(APIData) {
  return new Promise(function (resolve, reject) {
    window.ZOHO.CRM.API.insertRecord({
      Entity: "Entregas",
      APIData: APIData,
      Trigger: ["workflow"],
    })
      .then(function (data) {
        Swal.fire(
          "Agregado",
          "El registro se ha agregado correctamente",
          "success"
        );
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

export function updateRecord(APIData) {
  return new Promise((resolve, reject) => {
    window.ZOHO.CRM.API.updateRecord({
      Entity: "Entregas",
      APIData: APIData,
      Trigger: ["workflow"],
    })
      .then(function (data) {
        resolve(data); // Resolvemos la promesa con los datos actualizados
      })
      .catch(function (error) {
        console.error("Error en la actualización:", error);
        Swal.fire({
          icon: "error",
          title: "Error al actualizar",
          text: "No se pudo actualizar el registro",
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
        });
        reject(error);
      });
  });
}

export function deleteRecord(id, shouldReload = false) {
  return new Promise((resolve, reject) => {
    window.ZOHO.CRM.API.deleteRecord({
      Entity: "Entregas",
      RecordID: id,
    })
      .then((data) => {
        if (
          data &&
          data.data &&
          Array.isArray(data.data) &&
          data.data.length > 0 &&
          data.data[0].status === "success" &&
          data.data[0].code === "SUCCESS"
        ) {
          if (shouldReload) {
            window.location.reload();
          }
          resolve({ status: "success" });
        } else {
          resolve({
            status: "error",
            error: "Eliminación fallida",
            details: data,
          });
        }
      })
      .catch((error) => {
        console.error(`Error al eliminar la entrega ${id}:`, error);
        resolve({ status: "error", error: error.toString() });
      });
  });
}

export async function deleteAllRecords(entregas) {
  const results = await Promise.all(
    entregas.map((entrega) => deleteRecord(entrega.id, false))
  );

  const successCount = results.filter(
    (result) => result.status === "success"
  ).length;
  const failedCount = results.length - successCount;

  return {
    message: `${successCount} de ${entregas.length} entregas han sido eliminadas. ${failedCount} fallaron.`,
    results: results.map((result, index) => ({
      id: entregas[index].id,
      status: result.status,
      error: result.error,
    })),
  };
}
