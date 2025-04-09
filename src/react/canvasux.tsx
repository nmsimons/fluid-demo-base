/* eslint-disable @typescript-eslint/no-unused-vars */
/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { JSX, useContext, useEffect, useState } from "react";
import { Items, Item, Shape } from "../schema/app_schema.js";
import { IFluidContainer, Tree } from "fluid-framework";
import { PresenceContext } from "./PresenceContext.js";

export function Canvas(props: {
	items: Items;
	container: IFluidContainer;
	setSize: (width: number, height: number) => void;
}): JSX.Element {
	const { items, setSize } = props;
	const [itemsArray, setItemsArray] = React.useState<Item[]>(items.slice());
	const [dragging, setDragging] = useState(false);

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

	return (
		<div
			ref={canvasRef}
			onDragOver={(e) => {
				e.preventDefault();
				e.dataTransfer.dropEffect = "move";
			}}
			className="relative flex h-full w-full bg-transparent overflow-auto"
		>
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
	const [offset, setOffset] = useState({ x: 0, y: 0 });
	const [dragging, setDragging] = useState(false);

	const [itemProps, setItemProps] = useState<{ left: number; top: number; zIndex: number }>({
		left: item.x,
		top: item.y,
		zIndex: index,
	});

	useEffect(() => {
		const unsubscribe = Tree.on(item, "nodeChanged", () => {
			setItemProps({
				left: item.x,
				top: item.y,
				zIndex: index,
			});
		});
		return unsubscribe;
	}, []);

	const presence = useContext(PresenceContext); // Placeholder for context if needed

	useEffect(() => {
		const unsubscribe = presence.drag.events.on("updated", (dragData) => {
			if (dragData.value && dragData.value.id === item.id) {
				setItemProps({
					left: dragData.value.x,
					top: dragData.value.y,
					zIndex: index,
				});
			}
		});
		return unsubscribe;
	}, []);

	useEffect(() => {
		const unsubscribe = presence.drag.events.on("localUpdated", (dragData) => {
			if (dragData.value && dragData.value.id === item.id) {
				setItemProps({
					left: dragData.value.x,
					top: dragData.value.y,
					zIndex: index,
				});
			}
		});
		return unsubscribe;
	}, []);

	const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
		const { x, y } = getOffsetCoordinates(e);
		presence.drag.setDragging({ id: item.id, x, y });
	};

	const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
		setDragging(true);
		setOffset(calculateOffset(e));
		e.dataTransfer.setDragImage(new Image(), 0, 0);
	};

	const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
		setDragging(false);
		presence.drag.clearDragging();
		const { x, y } = getOffsetCoordinates(e);
		Tree.runTransaction(item, () => {
			item.x = x;
			item.y = y;
		});
	};

	const getOffsetCoordinates = (e: React.DragEvent<HTMLDivElement>): { x: number; y: number } => {
		const newX = e.pageX - (e.currentTarget.parentElement?.offsetLeft || 0);
		const newY = e.pageY - (e.currentTarget.parentElement?.offsetTop || 0);
		const coordinates = { x: newX - offset.x, y: newY - offset.y };
		coordinates.x = coordinates.x < 0 ? itemProps.left : coordinates.x;
		coordinates.y = coordinates.y < 0 ? itemProps.top : coordinates.y;
		return coordinates;
	};

	// calculate the offset of the pointer from the shape's origin
	// this is used to ensure the shape moves smoothly with the pointer
	// when dragging
	const calculateOffset = (e: React.DragEvent<HTMLDivElement>): { x: number; y: number } => {
		const newX = e.pageX - (e.currentTarget.parentElement?.offsetLeft || 0);
		const newY = e.pageY - (e.currentTarget.parentElement?.offsetTop || 0);
		return {
			x: newX - item.x,
			y: newY - item.y,
		};
	};

	return (
		<div
			onDragStart={(e) => handleDragStart(e)}
			onDrag={(e) => handleDrag(e)}
			onDragEnd={(e) => handleDragEnd(e)}
			draggable="true"
			className="absolute"
			style={{ ...itemProps }}
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
