// custom hook to update the view when tree state changes
import { useEffect, useState } from "react";
import { Tree } from "fluid-framework";
import { TreeNode } from "@fluidframework/tree/alpha";

export function useTree(node: TreeNode, deep: boolean = false): number {
	const [inval, setInval] = useState(0);

	useEffect(() => {
		const unsubscribe = Tree.on(node, deep ? "treeChanged" : "nodeChanged", () => {
			setInval((prev) => prev + 1);
		});
		return unsubscribe;
	}, [node, deep]);

	return inval;
}
