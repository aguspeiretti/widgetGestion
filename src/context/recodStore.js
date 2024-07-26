import { create } from "zustand";
import { getRelatedRecords } from "../functions/apiFunctions";

const useRecordStore = create((set) => ({
  records: [],

  getRelatedRecord: async (registerID) => {
    try {
      const result = await getRelatedRecords(
        "Coordinacion",
        registerID,
        "Entregas_asociadas"
      );

      // Asegúrate de que result.register es un array
      if (Array.isArray(result.register)) {
        const datos = result.register.map((record) => ({
          id: record.id,
          ...record,
        }));
        set({ records: datos });
      } else {
        console.warn(
          "Expected result.register to be an array, but it is not:",
          result.register
        );
        set({ records: [] }); // O maneja el estado según tu necesidad
      }
    } catch (error) {
      console.error("Error fetching related records:", error);
      set({ error: error.message || "An error occurred" });
    }
  },
}));

export default useRecordStore;
