// A pane for displaying and interacting with an LLM on the right side of the screen
import { Button, Textarea } from "@fluentui/react-components";
import { ArrowLeftFilled } from "@fluentui/react-icons";
import React, { useState } from "react";
import { Pane } from "./paneux.js";
import { TreeViewAlpha } from "@fluidframework/tree/alpha";
import { createFunctioningAgent } from "@fluidframework/tree-agent/alpha";
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

	const handlePromptSubmit = async (prompt: string) => {
		const client = new ChatOpenAI({ model: "o4-mini" });
		const agent = createFunctioningAgent(client, view, {
			log: (msg) => updateLog(msg),
		});
		const r = await agent.query(prompt);
		setResponse(r ?? "LLM query failed.");
	};

	const handleCancelResponse = () => {
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
		<div className="flex flex-col justify-self-end gap-y-2 ">
			<Textarea
				className="flex"
				rows={8}
				value={prompt}
				onChange={(e) => setPrompt(e.target.value)}
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
