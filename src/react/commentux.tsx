// A pane that shows comments and allows users to interact with them
import { Button, Textarea } from "@fluentui/react-components";
import React, { useContext, useEffect, useState } from "react";
import { Pane } from "./paneux.js";
import { PresenceContext } from "./PresenceContext.js";
import { App, Comment, Comments, Group, Item, Shape } from "../schema/app_schema.js";
import { Tree } from "fluid-framework";

export function CommentPane(props: {
	hidden: boolean;
	setHidden: (hidden: boolean) => void;
	selectedItemId: string | undefined;
	app: App;
}): JSX.Element {
	const { hidden, setHidden, selectedItemId, app } = props;
	const presence = useContext(PresenceContext);
	const [commentArray, setCommentArray] = useState<Comment[]>([]);
	const [comments, setComments] = useState<Comments>();
	const [title, setTitle] = useState("Comments");

	useEffect(() => {
		const target = getCommentTarget(selectedItemId, app);
		setComments(target.comments);
		if (target instanceof Group) {
			setTitle("Group Comments");
		} else if (target instanceof Item) {
			const content = target.content;
			if (content instanceof Shape) {
				setTitle(`Comments on ${content.type}`);
			} else {
				setTitle("Comments on note");
			}
		} else {
			setTitle("General comments");
		}
	}, [selectedItemId]);

	useEffect(() => {
		if (comments) {
			setCommentArray(comments.slice());
			const unsubscribe = Tree.on(comments, "nodeChanged", () => {
				setCommentArray(comments.slice());
			});
			return unsubscribe;
		}
	}, [comments]);

	const handleAddComment = (comment: string) => {
		if (comment.trim() === "") return;
		if (comments) {
			comments.addComment(
				comment,
				presence.users.getMyself().value.id,
				presence.users.getMyself().value.name,
			);
		}
	};

	return (
		<Pane hidden={hidden} setHidden={setHidden} title={title}>
			<div className="flex flex-col h-full space-y-2">
				<CommentList comments={commentArray} />
				<CommentInput callback={(comment) => handleAddComment(comment)} />
			</div>
		</Pane>
	);
}

export function CommentList(props: { comments: Comment[] }): JSX.Element {
	const { comments } = props;
	return (
		<div className="flex flex-col h-full space-y-2">
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
		<div className="flex flex-col space-y-2 ">
			<Textarea
				style={{ marginBottom: "8px" }}
				rows={4}
				value={comment}
				onChange={(e) => setComment(e.target.value)}
				placeholder="Type your comment here..."
			/>
			<Button
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

const getCommentTarget = (id: string | undefined, app: App): Item | Group | App => {
	if (id === undefined) return app;
	const item = app.items.find((i) => i.id === id);
	return item ? item : app;
};
