// A pane that shows comments and allows users to interact with them
import { Button, Textarea } from "@fluentui/react-components";
import React, { useContext, useEffect, useState } from "react";
import { Pane } from "./paneux.js";
import { PresenceContext } from "./PresenceContext.js";
import { App, Comment, Comments, Group, Item, Shape } from "../schema/app_schema.js";
import { useTree } from "./useTree.js";

export function CommentPane(props: {
	hidden: boolean;
	setHidden: (hidden: boolean) => void;
	item: Item | Group | App;
}): JSX.Element {
	const { hidden, setHidden, item } = props;
	const presence = useContext(PresenceContext);
	const [title, setTitle] = useState("Comments");
	useTree(item.comments);

	useEffect(() => {
		if (item instanceof Group) {
			setTitle("Group Comments");
		} else if (item instanceof Item) {
			const content = item.content;
			if (content instanceof Shape) {
				setTitle(`Comments on ${content.type}`);
			} else {
				setTitle("Comments on note");
			}
		} else {
			setTitle("General comments");
		}
	}, [item]);

	const handleAddComment = (comment: string) => {
		if (comment.trim() === "") return;
		item.comments.addComment(
			comment,
			presence.users.getMyself().value.id,
			presence.users.getMyself().value.name,
		);
	};

	return (
		<Pane hidden={hidden} setHidden={setHidden} title={title}>
			<CommentList comments={item.comments} />
			<CommentInput callback={(comment) => handleAddComment(comment)} />
		</Pane>
	);
}

export function CommentList(props: { comments: Comments }): JSX.Element {
	const { comments } = props;
	return (
		<div className="flex flex-col grow space-y-2 overflow-y-auto">
			{comments.map((comment) => (
				<CommentText key={comment.id} comment={comment} />
			))}
		</div>
	);
}

export function CommentText(props: { comment: Comment }): JSX.Element {
	const { comment } = props;
	return <div className="p-2 border rounded bg-gray-50">{comment.text}</div>;
}

export function CommentInput(props: { callback: (comment: string) => void }): JSX.Element {
	const { callback } = props;
	const [comment, setComment] = useState("");
	return (
		<div className="flex flex-col justify-self-end gap-y-2 ">
			<Textarea
				className="flex"
				rows={4}
				value={comment}
				onChange={(e) => setComment(e.target.value)}
				placeholder="Type your comment here..."
			/>
			<Button
				className="flex "
				appearance="primary"
				onClick={() => {
					callback(comment);
					setComment("");
				}}
			>
				Comment
			</Button>
		</div>
	);
}
