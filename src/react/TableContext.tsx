import { createContext } from "react";
import { FluidTable } from "../schema/app_schema.js";

export const TableContext = createContext<{
	table: FluidTable;
}>({
	table: {} as FluidTable,
});
