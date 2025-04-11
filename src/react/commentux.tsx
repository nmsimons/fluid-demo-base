// A pane that shows comments and allows users to interact with them
import { Button, Textarea } from "@fluentui/react-components";
import React, { useState } from "react";
import { Pane } from "./paneux.js";

export function CommentPane(props: {
	hidden: boolean;
	setHidden: (hidden: boolean) => void;
}): JSX.Element {
	const { hidden, setHidden } = props;

	const [comments, setComments] = useState<string[]>([]);
	const [newComment, setNewComment] = useState("");

	const handleAddComment = () => {
		if (newComment.trim()) {
			setComments([...comments, newComment]);
			setNewComment("");
		}
	};

	return (
		<Pane hidden={hidden} setHidden={setHidden} title="Comments">
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
					{comments.map((comment, index) => (
						<div key={index} className="p-2 border rounded bg-gray-50">
							{comment}
						</div>
					))}
				</div>
			</div>
		</Pane>
	);
}
