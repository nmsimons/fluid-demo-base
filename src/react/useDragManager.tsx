// Custom hook to manage presence state in a Fluid Framework application
// It takes in a presence manager and a function to run when the presence state changes

import { useEffect } from "react";
import { DragManager, DragPackage } from "../utils/Interfaces/DragManager.js";

export function useDragManager<TState extends DragPackage>(
	dragManager: DragManager<TState>,
	runOnChange: (updated: TState) => void,
) {
	useEffect(() => {
		const unsubscribe = dragManager.events.on("updated", (updated) => {
			runOnChange(updated.value as TState);
		});
		return unsubscribe;
	}, []);

	useEffect(() => {
		const unsubscribe = dragManager.events.on("localUpdated", (updated) => {
			runOnChange(updated.value as TState);
		});
		return unsubscribe;
	}, []);
}
