// A pane for displaying and interacting with an LLM on the right side of the screen
import { Button, Textarea } from "@fluentui/react-components";
import { ArrowLeftFilled } from "@fluentui/react-icons";
import React, { useEffect, useState } from "react";
import { Pane } from "./paneux.js";
import { TreeViewAlpha } from "@fluidframework/tree/alpha";
import { createFunctioningAgent, SharedTreeSemanticAgent } from "@fluidframework/tree-agent/alpha";
import { App } from "../schema/app_schema.js";
import { ChatOpenAI } from "@langchain/openai";

export function PromptPane(props: {
	hidden: boolean;
	setHidden: (hidden: boolean) => void;
	view: TreeViewAlpha<typeof App>;
}): JSX.Element {
	const { hidden, setHidden, view } = props;
	const [response, setResponse] = useState("");
	const [log, setLog] = useState("");
	const updateLog = (msg: string) => {
		setLog((prev) => prev + msg + "\n");
	};
	const [agent, setAgent] = useState<SharedTreeSemanticAgent | undefined>();
	useEffect(() => {
		setAgent(
			createFunctioningAgent(new ChatOpenAI({ model: "o4-mini" }), view, {
				log: (msg) => updateLog(msg),
				domainHints,
			}),
		);
	}, [view]);

	const handlePromptSubmit = async (prompt: string) => {
		if (agent !== undefined) {
			const r = await agent.query(prompt);
			setResponse(r ?? "LLM query failed.");
		}
	};

	const handleCancelResponse = () => {
		setAgent(
			createFunctioningAgent(new ChatOpenAI({ model: "o4-mini" }), view, {
				log: (msg) => updateLog(msg),
				domainHints,
			}),
		);
		setResponse("");
		setLog("");
	};

	return (
		<Pane hidden={hidden} setHidden={setHidden} title="Prompt">
			<PromptLog log={log} />
			<PromptOutput response={response} />
			<ResponseButtons response={response} cancelCallback={handleCancelResponse} />
			<PromptInput callback={handlePromptSubmit} />
		</Pane>
	);
}

export function PromptInput(props: { callback: (prompt: string) => void }): JSX.Element {
	const { callback } = props;
	const [prompt, setPrompt] = useState("");
	return (
		<div className="flex flex-col justify-self-end gap-y-2">
			<Textarea
				className="flex"
				rows={8}
				value={prompt}
				onChange={(e) => setPrompt(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						callback(prompt);
					}
				}}
				placeholder="Type your prompt here..."
			/>
			<Button
				appearance="primary"
				onClick={() => {
					callback(prompt);
				}}
			>
				Submit Prompt
			</Button>
		</div>
	);
}

export function PromptLog(props: { log: string }): JSX.Element {
	const { log } = props;
	return (
		<textarea
			className="flex grow"
			readOnly
			placeholder="Your prompt log will appear here..."
			value={log}
			style={{
				resize: "none",
				backgroundColor: "white",
				border: "1px solid #ccc",
				padding: "8px",
				borderRadius: "4px",
				outline: "none",
			}}
		/>
	);
}

export function PromptOutput(props: { response: string }): JSX.Element {
	const { response } = props;
	return (
		<textarea
			rows={8}
			readOnly
			placeholder="Your response will appear here..."
			value={response}
			style={{
				resize: "none",
				backgroundColor: "white",
				border: "1px solid #ccc",
				padding: "8px",
				borderRadius: "4px",
				outline: "none",
			}}
		/>
	);
}

export function ResponseButtons(props: {
	response: string;
	cancelCallback: () => void;
}): JSX.Element {
	const { response, cancelCallback } = props;

	return (
		<div className="flex flex-row gap-x-2">
			<CancelResponseButton response={response} callback={cancelCallback} />
		</div>
	);
}

export function ApplyResponseButton(props: {
	response: string;
	callback: (response: string) => void;
}): JSX.Element {
	const { response, callback } = props;

	return (
		<Button
			appearance="primary"
			className="flex shrink-0 grow"
			onClick={() => {
				callback(response);
			}}
			icon={<ArrowLeftFilled />}
			disabled={response.trim() === ""}
		>
			Accept Response
		</Button>
	);
}

export function CancelResponseButton(props: {
	response: string;
	callback: () => void;
}): JSX.Element {
	const { callback, response } = props;

	return (
		<Button
			className="flex shrink-0 grow"
			onClick={() => {
				callback();
			}}
			disabled={response.trim() === ""}
		>
			Clear
		</Button>
	);
}

const domainHints = `This is a 2D application that allows the user to position shapes on a canvas.
The shapes can be moved, rotated, resized and have style properties changed.
Each shape can have comments associated with it as well.

Here's an example of a canvas with five shapes on it:

\`\`\`JSON
{
  "items": [
    {
      // Index: 0,
      "id": "c0115f64-c0c0-4248-b23d-4b66b5df5917",
      "x": 1123,
      "y": 575,
      "rotation": 352,
      "comments": [],
      "votes": {
        "votes": []
      },
      "content": {
        "size": 118,
        "color": "#A133FF",
        "type": "star"
      }
    },
    {
      // Index: 1,
      "id": "c0115f64-c0c0-4248-b23d-4b66b5df5919",
      "x": 692,
      "y": 231,
      "rotation": 357,
      "comments": [],
      "votes": {
        "votes": []
      },
      "content": {
        "size": 111,
        "color": "#FF3357",
        "type": "triangle"
      }
    },
    {
      // Index: 2,
      "id": "c0115f64-c0c0-4248-b23d-4b66b5df591b",
      "x": 1228,
      "y": 85,
      "rotation": 12,
      "comments": [],
      "votes": {
        "votes": []
      },
      "content": {
        "size": 110,
        "color": "#FF5733",
        "type": "square"
      }
    },
    {
      // Index: 3,
      "id": "c0115f64-c0c0-4248-b23d-4b66b5df591d",
      "x": 228,
      "y": 199,
      "rotation": 353,
      "comments": [],
      "votes": {
        "votes": []
      },
      "content": {
        "size": 111,
        "color": "#3357FF",
        "type": "star"
      }
    },
    {
      // Index: 4,
      "id": "c0115f64-c0c0-4248-b23d-4b66b5df591f",
      "x": 588,
      "y": 699,
      "rotation": 355,
      "comments": [],
      "votes": {
        "votes": []
      },
      "content": {
        "size": 105,
        "color": "#FF5733",
        "type": "star"
      }
    }
  ],
  "comments": []
}
\`\`\`;

Here's an example of a function that can be run by the tree editing tool which adds three now shapes to the canvas, groups items on the canvas by shape type and organizes them spatially, and then colors all shapes red:

function editTree({ root, create }) {
  // Add three new shapes: a star, a triangle, and a circle
  const newStar = create.Item({
    x: 100,
    y: 400,
    rotation: 0,
    comments: [],
    votes: create.Vote({ votes: [] }),
    content: create.Shape({ size: 110, color: "#FF0000", type: "star" })
  });
  const newTriangle = create.Item({
    x: 400,
    y: 100,
    rotation: 0,
    comments: [],
    votes: create.Vote({ votes: [] }),
    content: create.Shape({ size: 110, color: "#FF0000", type: "triangle" })
  });
  const newCircle = create.Item({
    x: 400,
    y: 400,
    rotation: 0,
    comments: [],
    votes: create.Vote({ votes: [] }),
    content: create.Shape({ size: 110, color: "#FF0000", type: "circle" })
  });
  // Insert the new shapes at the end of the canvas
  root.items.insertAt(root.items.length, newStar, newTriangle, newCircle);

  // Group all shapes spatially by type and make them red
  root.items.forEach(item => {
    // Color everything red
    if (item.content && item.content.color !== undefined) {
      item.content.color = "#FF0000";
    }
    // Position by shape type
    switch (item.content.type) {
	  case "square":
		item.x = 100;
		item.y = 100;
		break;
      case "star":
        item.x = 100;
		item.y = 400;
        break;
      case "triangle":
        item.x = 400;
		item.y = 100;
        break;
      case "circle":
        item.x = 400;
		item.y = 400;
        break;
    }
  });

  // Spread the shapes in each group out a bit so they are more visible
  root.items.forEach(item => {
      item.x += Math.random() * 50 - 25;
	  item.y += Math.random() * 50 - 25;
  });
}

When responding to the user, do not reference technical details like "schema" or "data" or "tree" - explain what has happened with high-level user-friendly language.
`;
