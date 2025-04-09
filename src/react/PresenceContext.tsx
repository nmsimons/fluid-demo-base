import { createContext } from "react";
import type { SelectionManager } from "../utils/Interfaces/SelectionManager.js";
import { UsersManager } from "../utils/Interfaces/UsersManager.js";
import { DragManager } from "../utils/Interfaces/DragManager.js";

export const PresenceContext = createContext<{
	users: UsersManager;
	selection: SelectionManager;
	drag: DragManager;
}>({
	users: {} as UsersManager,
	selection: {} as SelectionManager,
	drag: {} as DragManager,
});
