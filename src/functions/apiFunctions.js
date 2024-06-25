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
      .then(function (response) {
        console.log("respuesta users", response);
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

export function attachFile(registerID, file) {
  console.log("data del attach");
  return new Promise(function (resolve, reject) {
    window.ZOHO.CRM.API.attachFile({
      Entity: "Leads",
      RecordID: registerID,
      File: { Name: "myFile.txt", Content: file },
    })
      .then(function (data) {
        resolve(data);
        console.log("esta es la data del attach", data);
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

export function getFields(entrity) {
  return new Promise(function (resolve, reject) {
    window.ZOHO.CRM.META.getFields({ Entity: "Leads" })
      .then(function (response) {
        console.log("respuesta Fields", response);
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

export function execute(func_name, req_data) {
  return new Promise(function (resolve, reject) {
    window.ZOHO.CRM.FUNCTIONS.execute(func_name, req_data)
      .then(function (data) {
        console.log(data);
      })
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
      .then(function (data) {
        console.log(data);
      })
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
        window.location.reload();
        console.log(data);
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

export function deleteRecord(id) {
  return new Promise(function (resolve, reject) {
    window.ZOHO.CRM.API.deleteRecord({
      Entity: "Entregas",
      RecordID: id,
    })
      .then(function (data) {
        window.location.reload();
        console.log(data);
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

export function updateRecord(APIData) {
  return new Promise(function (resolve, reject) {
    window.ZOHO.CRM.API.updateRecord({
      Entity: "Entregas",
      APIData: APIData,
      Trigger: ["workflow"],
    })
      .then(function (data) {
        console.log(data);
        window.location.reload();
      })
      .catch(function (error) {
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
