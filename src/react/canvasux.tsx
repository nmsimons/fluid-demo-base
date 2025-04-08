/* eslint-disable @typescript-eslint/no-unused-vars */
/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { JSX, useEffect } from "react";
import { Items, Item, Shape } from "../schema/app_schema.js";
import { IFluidContainer, Tree } from "fluid-framework";

export function Canvas(props: {
	items: Items;
	container: IFluidContainer;
	setSize: (width: number, height: number) => void;
}): JSX.Element {
	const { items, setSize } = props;
	const [itemsArray, setItemsArray] = React.useState<Item[]>(items.slice());
	const canvasRef = React.useRef<HTMLDivElement>(null);

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

	return (
		<div ref={canvasRef} className="relative flex h-full w-full bg-transparent overflow-auto">
			{itemsArray.map((item, index) => (
				<ItemView item={item} key={index} index={index} />
			))}
		</div>
	);
}

const getContentElement = (item: Item): JSX.Element => {
	if (Tree.is(item.content, Shape)) {
		return <ShapeView shape={item.content} />;
	} else {
		return <></>;
	}
};

export function ItemView(props: { item: Item; index: number }): JSX.Element {
	const { item, index } = props;
	return (
		<div
			draggable="true"
			className="absolute"
			style={{
				left: item.x,
				top: item.y,
				zIndex: index,
			}}
		>
			{getContentElement(item)}
		</div>
	);
}

export function ShapeView(props: { shape: Shape }): JSX.Element {
	const { shape } = props;
	switch (shape.type) {
		case "circle":
			return <Circle size={shape.width} backgroundColor={shape.color} />;
		case "square":
			return (
				<Square
					size={shape.width}
					backgroundColor={shape.color}
					rotation={shape.rotation}
				/>
			);
		case "triangle":
			return (
				<Triangle
					size={shape.width}
					backgroundColor={shape.color}
					rotation={shape.rotation}
				/>
			);
		case "star":
			return (
				<Star size={shape.width} backgroundColor={shape.color} rotation={shape.rotation} />
			);
		default:
			return <></>;
	}
}

export function Circle(props: { size: number; backgroundColor: string }): JSX.Element {
	const { size, backgroundColor } = props;

	// Render a div with the absolute position of the item
	// that is a circle with the x and y coordinates of the item
	return (
		<div
			style={{
				width: size,
				height: size,
				backgroundColor,
				borderRadius: "50%",
			}}
		></div>
	);
}

export function Square(props: {
	size: number;
	backgroundColor: string;
	rotation: number;
}): JSX.Element {
	const { size, backgroundColor } = props;

	// Render a div with the absolute position of the item
	// that is a square with the x and y coordinates of the item
	// and is red
	return (
		<div
			style={{
				width: size,
				height: size,
				backgroundColor,
				transform: `rotate(${props.rotation}deg)`,
			}}
		></div>
	);
}

export function Triangle(props: {
	size: number;
	backgroundColor: string;
	rotation: number;
}): JSX.Element {
	const { size, backgroundColor } = props;
	// render a div with an equilateral triangle using CSS borders with a shadow
	return (
		<div
			style={{
				width: 0,
				height: 0,
				borderLeft: `${size / 2}px solid transparent`,
				borderRight: `${size / 2}px solid transparent`,
				borderBottom: `${size}px solid ${backgroundColor}`,
				transform: `rotate(${props.rotation}deg)`,
			}}
		></div>
	);
}

export function Star(props: {
	size: number;
	backgroundColor: string;
	rotation: number;
}): JSX.Element {
	const { size, backgroundColor, rotation } = props;
	// Render a star shape using svg and rotation
	return (
		<svg
			width={size}
			height={size}
			style={{ transform: `rotate(${rotation}deg)` }}
			viewBox="0 0 24 24"
		>
			<polygon
				points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
				fill={backgroundColor}
			/>
		</svg>
	);
}
