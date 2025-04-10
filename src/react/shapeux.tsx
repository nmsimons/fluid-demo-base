import React, { JSX, useState, useEffect } from "react";
import { Shape } from "../schema/app_schema.js";
import { Tree } from "fluid-framework";

export function ShapeView(props: { shape: Shape }): JSX.Element {
	const { shape } = props;

	const [shapeProps, setShapeProps] = useState({
		size: shape.size,
		backgroundColor: shape.color,
	});

	useEffect(() => {
		const unsubscribe = Tree.on(props.shape, "nodeChanged", () => {
			setShapeProps({ size: shape.size, backgroundColor: shape.color });
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
		<svg width={size} height={size} viewBox="2 2 20 20">
			<polygon
				points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
				fill={backgroundColor}
			/>
		</svg>
	);
}
