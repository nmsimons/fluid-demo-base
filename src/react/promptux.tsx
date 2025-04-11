// A pane for displaying and interacting with an LLM on the right side of the screen
import { Button, Textarea } from "@fluentui/react-components";
import { ArrowLeftFilled } from "@fluentui/react-icons";
import React, { useState } from "react";
import { Pane } from "./paneux.js";

export function PromptPane(): JSX.Element {
	const [response, setResponse] = useState("");

	const handlePromptSubmit = (prompt: string) => {
		// Simulate an API call to get a response from the LLM
		setResponse(`Response to: ${prompt}`);
	};

	const handleApplyResponse = (res: string) => {
		// Apply the response to the document or state as needed
		// simluate applying response
		console.log("Applying response:", res);
	};

	return (
		<Pane hidden={false} title="Prompt">
			<PromptOutput response={response} applyResponse={handleApplyResponse} />
			<PromptInput callback={handlePromptSubmit} />
		</Pane>
	);
}

export function PromptInput(props: { callback: (prompt: string) => void }): JSX.Element {
	const { callback } = props;
	const [prompt, setPrompt] = useState("");
	return (
		<div className="flex flex-col space-y-2">
			<Textarea
				style={{ marginBottom: "8px" }}
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

export function PromptOutput(props: {
	response: string;
	applyResponse: (response: string) => void;
}): JSX.Element {
	const { response, applyResponse } = props;

	return (
		<>
			<Textarea
				style={{ marginBottom: "8px", height: "100%", resize: "none" }}
				readOnly
				placeholder="Your response will appear here..."
				value={response}
			/>
			<ApplyResponseButton response={response} callback={(res) => applyResponse(res)} />
		</>
	);
}

export function ApplyResponseButton(props: {
	response: string;
	callback: (response: string) => void;
}): JSX.Element {
	const { response, callback } = props;

	return (
		<Button
			style={{ marginBottom: "8px" }}
			appearance="subtle"
			onClick={() => {
				callback(response);
			}}
			icon={<ArrowLeftFilled />}
		>
			Accept Response
		</Button>
	);
}
