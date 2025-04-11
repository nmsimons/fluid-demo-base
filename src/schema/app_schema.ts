/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { TreeViewConfiguration, SchemaFactory, Tree } from "fluid-framework";

// Schema is defined using a factory object that generates classes for objects as well
// as list and map nodes.

// Include a UUID to guarantee that this schema will be uniquely identifiable.
// As this schema uses a recursive type, the beta SchemaFactoryRecursive is used instead of just SchemaFactory.
const sf = new SchemaFactory("fc1db2e8-0a00-11ee-be56-0242ac120002");

export class Shape extends sf.object("Shape", {
	size: sf.number, // The size is a number that represents the width and height of the shape
	color: sf.string, // The color is a string that represents the color of the shape
	type: sf.string, // The shapeType is a string that represents the type of the shape
}) {} // The size is a number that represents the size of the shape

/**
 * A SharedTree object date-time
 */
export class DateTime extends sf.object("DateTime", {
	raw: sf.number,
}) {
	/**
	 * Get the date-time
	 */
	get value(): Date {
		return new Date(this.raw);
	}

	/**
	 * Set the raw date-time string
	 */
	set value(value: Date) {
		// Test if the value is a valid date
		if (isNaN(value.getTime())) {
			return;
		}
		this.raw = value.getTime();
	}
}

export class Note extends sf.object(
	"Note",
	// Fields for Notes which SharedTree will store and synchronize across clients.
	// These fields are exposed as members of instances of the Note class.
	{
		id: sf.identifier,
		text: sf.string,
		author: sf.string,
		/**
		 * Sequence of user ids to track which users have voted on this note.
		 */
		votes: sf.array(sf.string),
	},
) {
	public readonly toggleVote = (user: string) => {
		const index = this.votes.indexOf(user);
		if (index > -1) {
			this.votes.removeAt(index);
		} else {
			this.votes.insertAtEnd(user);
		}
	};
}

/**
 * A SharedTree object that allows users to vote
 */
export class Vote extends sf.object("Vote", {
	votes: sf.array(sf.string), // Map of votes
}) {
	/**
	 * Add a vote to the map of votes
	 * The key is the user id and the value is irrelevant
	 * @param vote The vote to add
	 */
	addVote(vote: string): void {
		if (this.votes.includes(vote)) {
			return;
		}
		this.votes.insertAtEnd(vote);
	}

	/**
	 * Remove a vote from the map of votes
	 * @param vote The vote to remove
	 */
	removeVote(vote: string): void {
		if (!this.votes.includes(vote)) {
			return;
		}
		const index = this.votes.indexOf(vote);
		this.votes.removeAt(index);
	}

	/**
	 * Toggle a vote in the map of votes
	 */
	toggleVote(vote: string): void {
		if (this.votes.includes(vote)) {
			this.removeVote(vote);
		} else {
			this.addVote(vote);
		}
	}

	/**
	 * Get the number of votes
	 * @returns The number of votes
	 */
	get numberOfVotes(): number {
		return this.votes.length;
	}

	/**
	 * Return whether the user has voted
	 * @param userId The user id
	 * @return Whether the user has voted
	 */
	hasVoted(userId: string): boolean {
		return this.votes.includes(userId);
	}
}
export class Comment extends sf.object("Comment", {
	id: sf.identifier,
	text: sf.string,
	userId: sf.string,
	votes: Vote,
	createdAt: DateTime,
}) {}

export class Item extends sf.object("Item", {
	id: sf.identifier,
	x: sf.number,
	y: sf.number,
	rotation: sf.number,
	comments: sf.array(Comment),
	votes: Vote,
	content: [Shape, Note],
}) {
	delete(): void {
		const parent = Tree.parent(this);
		if (Tree.is(parent, Items)) {
			parent.removeAt(parent.indexOf(this));
		} else if (Tree.is(parent, Group)) {
			parent.content.removeAt(parent.content.indexOf(this));
		}
	}
}

export class Group extends sf.object("Group", {
	id: sf.identifier,
	x: sf.number,
	y: sf.number,
	content: sf.array([Item]),
}) {}

export class Items extends sf.array("Items", [Item, Group]) {}

export type HintValues = (typeof hintValues)[keyof typeof hintValues];
export const hintValues = {
	string: "string",
	number: "number",
	boolean: "boolean",
	date: "date",
	vote: "vote",
} as const;

/**
 * Export the tree config appropriate for this schema.
 * This is passed into the SharedTree when it is initialized.
 * */
export const appTreeConfiguration = new TreeViewConfiguration(
	// Schema for the root
	{ schema: Items },
);
