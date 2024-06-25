import { create } from "zustand";
import { getRelatedRecords } from "../functions/apiFunctions";

const useRecordStore = create((set) => ({
  records: [],

  getRelatedRecords: async (registerID) => {
    try {
      getRelatedRecords("Coordinacion", registerID, "Entregas_asociadas").then(
        function (result) {
          const datos = result.register.map((record) => ({
            id: record.id,
            ...record,
          }));
          set({ records: datos });
        }
      );
    } catch (error) {
      console.log(error);
      set({ error: error.response.data.message });
    }
  },
}));

export default useRecordStore;
