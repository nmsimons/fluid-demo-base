// custom hook to update the view when tree state changes
import { useEffect, useState } from "react";
import { Tree } from "fluid-framework";
import { TreeNode } from "@fluidframework/tree/alpha";

export function useTree(node: TreeNode, deep: boolean = false): object {
	const [inval, setInval] = useState({});

	useEffect(() => {
		let eventName: "nodeChanged" | "treeChanged" = "nodeChanged";
		if (deep) eventName = "treeChanged";
		const unsubscribe = Tree.on(node, eventName, () => {
			setInval({});
		});
		return unsubscribe;
	}, [node, deep]);

	return inval;
}
