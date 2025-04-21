/* eslint-disable @typescript-eslint/no-unused-vars */
/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { JSX, useContext, useEffect } from "react";
import { Items, Item } from "../schema/app_schema.js";
import { IFluidContainer } from "fluid-framework";
import { PresenceContext } from "./PresenceContext.js";
import { ItemView } from "./itemux.js";
import { useTree } from "./useTree.js";

export function Canvas(props: {
	items: Items;
	container: IFluidContainer;
	setSize: (width: number, height: number) => void;
}): JSX.Element {
	const { items, setSize } = props;
	const presence = useContext(PresenceContext);
	useTree(items);

	const canvasRef = React.useRef<HTMLDivElement>(null);

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
			{items.map((item, index) =>
				item instanceof Item ? <ItemView item={item} key={item.id} index={index} /> : <></>,
			)}
		</div>
	);
}
