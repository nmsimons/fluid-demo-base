/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { JSX, useContext } from "react";
import { Item, Items, Shape, Vote, Comment, DateTime, Note } from "../schema/app_schema.js";
import {
	DismissFilled,
	ArrowUndoFilled,
	ArrowRedoFilled,
	ShapesRegular,
	ThumbLikeFilled,
	ThumbLikeRegular,
	CommentRegular,
	CommentFilled,
	NoteRegular,
} from "@fluentui/react-icons";
import { ToolbarButton, Tooltip } from "@fluentui/react-components";
import { PresenceContext } from "./PresenceContext.js";

export function NewShapeButton(props: {
	items: Items;
	canvasSize: { width: number; height: number };
}): JSX.Element {
	const { items, canvasSize } = props;

	const maxSize = 120;
	const minSize = 100;

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		const shape = new Shape({
			size: getRandomNumber(minSize, maxSize),
			// List of 16 colors to randomly select from
			color: [
				"#FF5733",
				"#33FF57",
				"#3357FF",
				"#FF33A1",
				"#A133FF",
				"#33FFF5",
				"#F5FF33",
				"#FF8C33",
				"#8C33FF",
				"#33FF8C",
				"#F5A133",
				"#A1F533",
				"#5733FF",
				"#FF3357",
				"#3357A1",
				"#A1FF33",
			][Math.floor(Math.random() * 16)],
			// Type is randomly selected from "circle", "square", "triangle", or "star"
			type: ["circle", "square", "triangle", "star"][Math.floor(Math.random() * 4)],
		});
		const item = new Item({
			x: getRandomNumber(0, canvasSize.width - maxSize - minSize),
			y: getRandomNumber(0, canvasSize.height - maxSize - minSize),
			comments: [],
			votes: new Vote({ votes: [] }),
			content: shape,
			// a random number between 0 and 15
			rotation:
				getRandomNumber(0, 1) === 0 ? getRandomNumber(0, 15) : getRandomNumber(345, 360),
		});
		items.insertAtEnd(item);
	};
	return (
		<TooltipButton
			onClick={(e: React.MouseEvent) => handleClick(e)}
			icon={<ShapesRegular />}
			tooltip="Insert a new shape"
		/>
	);
}

export function NewNoteButton(props: {
	items: Items;
	canvasSize: { width: number; height: number };
}): JSX.Element {
	const { items, canvasSize } = props;

	const presence = useContext(PresenceContext);

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();

		const note = new Note({
			text: "",
			author: presence.users.getMyself().value.id,
		});

		const item = new Item({
			x: getRandomNumber(0, canvasSize.width - 200),
			y: getRandomNumber(0, canvasSize.height - 200),
			comments: [],
			votes: new Vote({ votes: [] }),
			content: note,
			// a random number between 0 and 15
			rotation:
				getRandomNumber(0, 1) === 0 ? getRandomNumber(0, 15) : getRandomNumber(345, 360),
		});

		items.insertAtEnd(item);
	};
	return (
		<TooltipButton
			onClick={(e: React.MouseEvent) => handleClick(e)}
			icon={<NoteRegular />}
			tooltip="Insert a new note"
		/>
	);
}

// Generate a random number between min and max
const getRandomNumber = (min: number, max: number): number => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

export function UndoButton(props: { undo: () => void }): JSX.Element {
	const { undo } = props;
	return <TooltipButton tooltip="Undo" onClick={() => undo()} icon={<ArrowUndoFilled />} />;
}

export function RedoButton(props: { redo: () => void }): JSX.Element {
	const { redo } = props;
	return <TooltipButton onClick={() => redo()} icon={<ArrowRedoFilled />} tooltip="Redo" />;
}

export function DeleteButton(props: { delete: () => void }): JSX.Element {
	const { delete: deleteFunc } = props;
	return <IconButton onClick={() => deleteFunc()} icon={<DismissFilled />} />;
}

export function VoteButton(props: { vote: Vote }): JSX.Element {
	const { vote } = props;
	const presence = useContext(PresenceContext);
	const userId = presence.users.getMyself().value.id;

	const handleClick = (e: React.MouseEvent<Element, MouseEvent>) => {
		e.stopPropagation();
		vote.toggleVote(userId);
	};

	return (
		<TooltipButton
			icon={vote.hasVoted(userId) ? <ThumbLikeFilled /> : <ThumbLikeRegular />}
			onClick={(e) => handleClick(e)}
			tooltip={vote.numberOfVotes.toString()}
		></TooltipButton>
	);
}

export function CommentButton(props: { item: Item }): JSX.Element {
	const { item } = props;
	const presence = useContext(PresenceContext);
	const handleClick = (e: React.MouseEvent<Element, MouseEvent>) => {
		e.stopPropagation();
		const text = prompt("Enter your comment: ");
		if (text) {
			const comment = new Comment({
				text,
				userId: presence.users.getMyself().value.id,
				username: presence.users.getMyself().value.name,
				votes: new Vote({ votes: [] }),
				createdAt: new DateTime({ raw: Date.now() }),
			});
			item.comments.insertAtEnd(comment);
		}
	};

	return (
		<TooltipButton
			onClick={(e) => handleClick(e)}
			icon={item.comments.length > 0 ? <CommentFilled /> : <CommentRegular />}
			tooltip="Add Comment"
		/>
	);
}

export function ShowPaneButton(props: {
	hidePane: (hidden: boolean) => void;
	paneHidden: boolean;
	hiddenIcon: JSX.Element;
	shownIcon: JSX.Element;
	tooltip?: string;
}): JSX.Element {
	const { hidePane, paneHidden, hiddenIcon, shownIcon, tooltip } = props;
	return (
		<TooltipButton
			onClick={() => hidePane(!paneHidden)}
			icon={paneHidden ? hiddenIcon : shownIcon}
			tooltip={paneHidden ? `Show ${tooltip}` : `Hide ${tooltip}`}
		/>
	);
}

export function TooltipButton(props: {
	onClick: (e: React.MouseEvent) => void;
	children?: React.ReactNode;
	icon: JSX.Element;
	tooltip?: string;
	disabled?: boolean;
}): JSX.Element {
	const { children, tooltip } = props;

	return (
		<Tooltip content={tooltip ?? "No Tooltip Provided"} relationship="description">
			<ToolbarButton {...props}>{children}</ToolbarButton>
		</Tooltip>
	);
}

export function IconButton(props: {
	onClick: (value: React.MouseEvent) => void;
	children?: React.ReactNode;
	icon: JSX.Element;
	disabled?: boolean;
}): JSX.Element {
	const { children } = props;

	return <ToolbarButton {...props}>{children}</ToolbarButton>;
}

export function ButtonGroup(props: { children: React.ReactNode }): JSX.Element {
	return <div className="flex flex-intial items-center">{props.children}</div>;
}

export function Placeholder(): JSX.Element {
	return (
		<div className="h-full w-full flex flex-col items-center justify-center hover:bg-black hover: text-white">
			<div className="h-12 w-12 rounded-full bg-gray-600"></div>
			<div className="h-6 w-24 rounded-md bg-gray-600 mt-2"></div>
		</div>
	);
}
