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
	const [newComment, setNewComment] = useState("");
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
				setTitle("Item comments");
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

	const handleAddComment = () => {
		if (newComment.trim() === "") return;
		if (comments) {
			comments.addComment(newComment, presence.users.getMyself().value.id);
			setNewComment("");
		}
	};

	return (
		<Pane hidden={hidden} setHidden={setHidden} title={title}>
			<div className="flex flex-col space-y-2">
				<Textarea
					style={{ marginBottom: "8px" }}
					rows={4}
					value={newComment}
					onChange={(e) => setNewComment(e.target.value)}
					placeholder="Type your comment here..."
				/>
				<Button appearance="primary" onClick={handleAddComment}>
					Add Comment
				</Button>
				<div className="mt-4 space-y-2">
					{commentArray.map((comment, index) => (
						<div key={index} className="p-2 border rounded bg-gray-50">
							{comment.text}
						</div>
					))}
				</div>
			</div>
		</Pane>
	);
}

const getCommentTarget = (id: string | undefined, app: App): Item | Group | App => {
	if (id === undefined) return app;
	const item = app.items.find((i) => i.id === id);
	return item ? item : app;
};
