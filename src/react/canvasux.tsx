/* eslint-disable @typescript-eslint/no-unused-vars */
/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { JSX, useContext, useEffect, useRef, useState } from "react";
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
	const [selected, setSelected] = useState(false);

	const [itemProps, setItemProps] = useState<{
		left: number;
		top: number;
		zIndex: number;
		transform: string;
	}>({
		left: item.x,
		top: item.y,
		zIndex: index,
		transform: `rotate(${item.rotation}deg)`,
	});

	useEffect(() => {
		const unsubscribe = Tree.on(item, "nodeChanged", () => {
			setItemProps({
				left: item.x,
				top: item.y,
				zIndex: index,
				transform: `rotate(${item.rotation}deg)`,
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
					transform: `rotate(${dragData.value.rotation}deg)`,
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
					transform: `rotate(${dragData.value.rotation}deg)`,
				});
			}
		});
		return unsubscribe;
	}, []);

	useEffect(() => {
		const unsubscribe = presence.selection.events.on("localUpdated", (selectionData) => {
			setSelected(presence.selection.testSelection({ id: item.id }));
		});
		return unsubscribe;
	}, []);

	const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
		e.stopPropagation();
		const { x, y } = getOffsetCoordinates(e);
		presence.drag.setDragging({ id: item.id, x, y, rotation: item.rotation });
	};

	const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
		e.stopPropagation();
		presence.selection.setSelection({ id: item.id });
		setDragging(true);
		setOffset(calculateOffset(e, item));
		e.dataTransfer.setDragImage(new Image(), 0, 0);
	};

	const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
		e.stopPropagation();
		const { x, y } = getOffsetCoordinates(e);
		Tree.runTransaction(item, () => {
			item.x = x;
			item.y = y;
		});
		presence.drag.clearDragging();
		setDragging(false);
	};

	const getOffsetCoordinates = (e: React.DragEvent<HTMLDivElement>): { x: number; y: number } => {
		const canvasElement = document.getElementById("canvas");
		const canvasRect = canvasElement?.getBoundingClientRect() || { left: 0, top: 0 };
		const newX = e.pageX - canvasRect.left;
		const newY = e.pageY - canvasRect.top;
		const coordinates = { x: newX - offset.x, y: newY - offset.y };
		coordinates.x = coordinates.x < 0 ? itemProps.left : coordinates.x;
		coordinates.y = coordinates.y < 0 ? itemProps.top : coordinates.y;
		return coordinates;
	};

	const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		if (presence.selection) {
			if (selected) {
				presence.selection.clearSelection();
			} else {
				presence.selection.setSelection({ id: item.id });
			}
		}
	};

	return (
		<div
			onClick={(e) => handleClick(e)}
			onDragStart={(e) => handleDragStart(e)}
			onDrag={(e) => handleDrag(e)}
			onDragEnd={(e) => handleDragEnd(e)}
			draggable="true"
			className="absolute"
			style={{ ...itemProps }}
		>
			<SelectionBox selected={selected} item={item} />
			{getContentElement(item)}
		</div>
	);
}

// calculate the offset of the pointer from the item's origin
// this is used to ensure the item moves smoothly with the pointer
// when dragging
const calculateOffset = (
	e: React.MouseEvent<HTMLDivElement>,
	item: Item,
): { x: number; y: number } => {
	const canvasElement = document.getElementById("canvas");
	const canvasRect = canvasElement?.getBoundingClientRect() || { left: 0, top: 0 };
	const newX = e.pageX - canvasRect.left;
	const newY = e.pageY - canvasRect.top;
	return {
		x: newX - item.x,
		y: newY - item.y,
	};
};

export function SelectionBox(props: { selected: boolean; item: Item }): JSX.Element {
	const { selected, item } = props;
	const padding = 8;

	return (
		<div
			className={`absolute border-4 border-dashed border-blue-800 bg-transparent ${selected ? "" : " hidden"}`}
			style={{
				left: -padding,
				top: -padding,
				width: `calc(100% + ${padding * 2}px)`,
				height: `calc(100% + ${padding * 2}px)`,
				zIndex: 1000,
			}}
		>
			<SelectionControls item={item} padding={padding} />
		</div>
	);
}

export function SelectionControls(props: { item: Item; padding: number }): JSX.Element {
	const { item, padding } = props;

	const height = 32;

	return (
		<div
			className={`absolute flex flex-row justify-items-center items-center w-full bg-blue-800 border-4 border-blue-800`}
			style={{
				left: -padding / 2,
				top: -(height + 2) - padding,
				width: `calc(100% + ${padding}px)`,
				height: height,
			}}
		>
			<DragHandle item={item} />{" "}
		</div>
	);
}

export function DragHandle(props: { item: Item }): JSX.Element {
	const { item } = props;

	const [rotating, setRotating] = useState(false);
	const offset = useRef({ x: 0, y: 0 });
	const rotation = useRef(item.rotation);

	const presence = useContext(PresenceContext);

	const handleRotate = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		if (!rotating) return;

		e.bubbles = false;
		e.stopPropagation();
		e.preventDefault();

		const s = e.currentTarget.getBoundingClientRect();
		const o = calculateOffset(e, item);

		const startingAngle = item.rotation;
		// Calculate the angle in radians and convert it to degrees
		const angleInRadians = Math.atan2(o.y - s.height / 2, o.x - s.width / 2);
		const angleInDegrees = (angleInRadians * 180) / Math.PI + 90; // Adjust for initial rotation

		// Calculate the difference from the original rotation which is item.rotation
		const adjustedAngle = angleInDegrees;

		// Normalize the angle to be between 0 and 360
		let normalizedAngle = adjustedAngle % 360;
		if (normalizedAngle < 0) normalizedAngle += 360;

		rotation.current = normalizedAngle;
		console.log("rotation:", o, angleInDegrees, adjustedAngle, normalizedAngle);

		if (rotation.current !== item.rotation) {
			presence.drag.setDragging({
				id: item.id,
				x: item.x,
				y: item.y,
				rotation: rotation.current,
			});
		}
	};

	const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
		e.bubbles = false;
		e.stopPropagation();
		e.dataTransfer.setDragImage(new Image(), 0, 0);
		offset.current = calculateOffset(e, item);
		setRotating(true);
	};

	const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
		e.bubbles = false;
		e.stopPropagation();
		setRotating(false);
		if (rotation.current !== item.rotation) {
			item.rotation = rotation.current;
		}
	};

	const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		e.stopPropagation();
		const o = calculateOffset(e, item);
		console.log("click", o);
	};

	return (
		<div
			onClick={(e) => handleClick(e)}
			onDragStart={(e) => handleDragStart(e)}
			onDrag={(e) => handleRotate(e)}
			onDragEnd={(e) => handleDragEnd(e)}
			onMouseMove={(e) => handleRotate(e)}
			draggable="true"
			className={`absolute bg-red-800 border-4 border-red-800`}
			style={{
				top: -15,
			}}
		></div>
	);
}

export function ShapeView(props: { shape: Shape }): JSX.Element {
	const { shape } = props;

	const [shapeProps, setShapeProps] = useState({
		size: shape.width,
		backgroundColor: shape.color,
	});

	useEffect(() => {
		const unsubscribe = Tree.on(props.shape, "nodeChanged", () => {
			setShapeProps({ size: shape.width, backgroundColor: shape.color });
		});
		return unsubscribe;
	}, []);

	switch (shape.type) {
		case "circle":
			return <Circle {...shapeProps} />;
		case "square":
			return <Square {...shapeProps} />;
		case "triangle":
			return <Triangle {...shapeProps} />;
		case "star":
			return <Star {...shapeProps} />;
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

export function Square(props: { size: number; backgroundColor: string }): JSX.Element {
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
			}}
		></div>
	);
}

export function Triangle(props: { size: number; backgroundColor: string }): JSX.Element {
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
			}}
		></div>
	);
}

export function Star(props: { size: number; backgroundColor: string }): JSX.Element {
	const { size, backgroundColor } = props;
	// Render a star shape using svg and rotation
	return (
		<svg width={size} height={size} viewBox="0 0 24 24">
			<polygon
				points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
				fill={backgroundColor}
			/>
		</svg>
	);
}
