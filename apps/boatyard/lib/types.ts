import type { Database } from "./database.types";

type JobRow = Database["public"]["Tables"]["jobs"]["Row"];
type BoatRow = Database["public"]["Tables"]["boats"]["Row"];
type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];

export type JobWithBoat = JobRow & {
  boat:
    | (Pick<BoatRow, "name" | "make" | "model"> & {
        customer: Pick<CustomerRow, "name"> | null;
      })
    | null;
};
