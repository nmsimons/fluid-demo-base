/* eslint-disable @typescript-eslint/no-unused-vars */
/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { JSX, useContext, useEffect, useState } from "react";
import { Items, Item, Group } from "../schema/app_schema.js";
import { IFluidContainer, Tree } from "fluid-framework";
import { PresenceContext } from "./PresenceContext.js";
import { ItemView } from "./itemux.js";

export function Canvas(props: {
	items: Items;
	container: IFluidContainer;
	setSize: (width: number, height: number) => void;
}): JSX.Element {
	const { items, setSize } = props;
	const [itemsArray, setItemsArray] = React.useState<(Item | Group)[]>(items.slice());
	const presence = useContext(PresenceContext);

	const canvasRef = React.useRef<HTMLDivElement>(null);

	useEffect(() => {
		const unsubscribe = Tree.on(items, "nodeChanged", () => {
			setItemsArray(items.slice());
		});
		return unsubscribe;
	}, []);

	const handleResize = () => {
		if (canvasRef.current) {
			const { width, height } = canvasRef.current.getBoundingClientRect();
			setSize(width, height);
		}
	};

	useEffect(() => {
		// Set the initial size of the canvas
		if (canvasRef.current) {
			const { width, height } = canvasRef.current.getBoundingClientRect();
			props.setSize(width, height);
		}
		window.addEventListener("resize", handleResize);
	}, []);

	const handleClick = () => {
		if (presence.selection) {
			presence.selection.clearSelection();
		}
	};

	return (
		<div
			id="canvas"
			onClick={handleClick}
			ref={canvasRef}
			onDragOver={(e) => {
				e.preventDefault();
				e.dataTransfer.dropEffect = "move";
			}}
			className="relative flex h-full w-full bg-transparent overflow-auto "
		>
			{itemsArray.map((item, index) =>
				item instanceof Item ? <ItemView item={item} key={index} index={index} /> : <></>,
			)}
		</div>
	);
}
