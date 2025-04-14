// custom hook to update the view when tree state changes
import { useEffect, useState } from "react";
import { Tree } from "fluid-framework";
import { TreeNode } from "@fluidframework/tree/alpha";

export function useTree(node: TreeNode): object {
	const [inval, setInval] = useState({});

	useEffect(() => {
		const unsubscribe = Tree.on(node, "nodeChanged", () => {
			setInval({});
		});
		return unsubscribe;
	}, [node]);

	return inval;
}
