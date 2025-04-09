import { createContext } from "react";
import type { SelectionManager } from "../utils/Interfaces/SelectionManager.js";
import { UsersManager } from "../utils/Interfaces/UsersManager.js";
import { TableSelection } from "../utils/selection.js";
import { DragManager } from "../utils/Interfaces/DragManager.js";

export const PresenceContext = createContext<{
	users: UsersManager;
	selection: SelectionManager<TableSelection>;
	drag: DragManager;
}>({
	users: {} as UsersManager,
	selection: {} as SelectionManager<TableSelection>,
	drag: {} as DragManager,
});
