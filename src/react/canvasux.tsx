/* eslint-disable @typescript-eslint/no-unused-vars */
/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { JSX, useEffect } from "react";
import { Items, Shape as FluidShape } from "../schema/app_schema.js";
import { ConnectionState, IFluidContainer, IServiceAudience, Myself, Tree } from "fluid-framework";
import { undoRedo } from "../utils/undo.js";
import type { SelectionManager } from "../utils/Interfaces/SelectionManager.js";

import { TableSelection } from "../utils/selection.js";

export function Canvas(props: {
	items: Items;
	selection: SelectionManager<TableSelection>;
	container: IFluidContainer;
	setConnectionState: (arg: string) => void;
	setSaved: (arg: boolean) => void;
	setSize: (width: number, height: number) => void;
}): JSX.Element {
	const { items, selection, container, setConnectionState, setSaved } = props;
	const [itemsArray, setItemsArray] = React.useState<FluidShape[]>(items.slice());
	const canvasRef = React.useRef<HTMLDivElement>(null);

	useEffect(() => {
		const updateConnectionState = () => {
			if (container.connectionState === ConnectionState.Connected) {
				setConnectionState("connected");
			} else if (props.container.connectionState === ConnectionState.Disconnected) {
				setConnectionState("disconnected");
			} else if (props.container.connectionState === ConnectionState.EstablishingConnection) {
				setConnectionState("connecting");
			} else if (props.container.connectionState === ConnectionState.CatchingUp) {
				setConnectionState("catching up");
			}
		};
		updateConnectionState();
		setSaved(!props.container.isDirty);
		container.on("connected", updateConnectionState);
		container.on("disconnected", updateConnectionState);
		container.on("dirty", () => props.setSaved(false));
		container.on("saved", () => props.setSaved(true));
		container.on("disposed", updateConnectionState);
	}, []);

	useEffect(() => {
		const unsubscribe = Tree.on(items, "treeChanged", () => {
			console.log("Tree changed");
			setItemsArray(items.slice());
		});
		return unsubscribe;
	}, []);

	const handleResize = () => {
		if (canvasRef.current) {
			const { width, height } = canvasRef.current.getBoundingClientRect();
			props.setSize(width, height);
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

	return (
		<div ref={canvasRef} className="relative flex h-full w-full bg-transparent overflow-auto">
			{itemsArray.map((item, index) => (
				<Shape item={item} key={index} />
			))}
		</div>
	);
}

export function Shape(props: { item: FluidShape }): JSX.Element {
	const { item } = props;
	switch (item.type) {
		case "circle":
			return (
				<Circle
					left={item.position.x}
					top={item.position.y}
					width={item.width}
					height={item.width}
					backgroundColor={item.color}
				/>
			);
		default:
			return <></>;
	}
}

export function Circle(props: {
	left: number;
	top: number;
	width: number;
	height: number;
	backgroundColor: string;
}): JSX.Element {
	const { left, top, width, height, backgroundColor } = props;

	// Render a div with the absolute position of the item
	// that is a circle with the x and y coordinates of the item
	// and is red
	return (
		<div
			className="absolute w-10 h-10 rounded-full"
			style={{
				left,
				top,
				width,
				height,
				backgroundColor,
			}}
		></div>
	);
}
