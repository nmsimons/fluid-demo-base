import { createContext } from "react";
import type { SelectionManager } from "../utils/Interfaces/SelectionManager.js";
import { UsersManager } from "../utils/Interfaces/UsersManager.js";
import { DragManager } from "../utils/Interfaces/DragManager.js";
import { DragAndRotatePackage } from "../utils/drag.js";
import { TypedSelection } from "../utils/selection.js";

export const PresenceContext = createContext<{
	users: UsersManager;
	selection: SelectionManager<TypedSelection>;
	drag: DragManager<DragAndRotatePackage>;
}>({
	users: {} as UsersManager,
	selection: {} as SelectionManager<TypedSelection>,
	drag: {} as DragManager<DragAndRotatePackage>,
});
