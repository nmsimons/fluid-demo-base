// A pane for displaying and interacting with an LLM on the right side of the screen
import { Button, Textarea } from "@fluentui/react-components";
import { ArrowLeftFilled } from "@fluentui/react-icons";
import React, { useState } from "react";
import { Pane } from "./paneux.js";
import { asTreeViewAlpha, TreeView, TreeBranch } from "@fluidframework/tree/alpha";
import { createFunctioningAgent } from "@fluidframework/tree-agent/alpha";
import { App } from "../schema/app_schema.js";
import { ChatOpenAI } from "@langchain/openai";

export function PromptPane(props: {
	hidden: boolean;
	setHidden: (hidden: boolean) => void;
	view: TreeView<typeof App>;
}): JSX.Element {
	const { hidden, setHidden } = props;
	const [response, setResponse] = useState("");
	const [branch, setBranch] = useState<TreeBranch | undefined>();

	const handlePromptSubmit = async (prompt: string) => {
		const client = new ChatOpenAI({ model: "o3-mini" });
		const branch = asTreeViewAlpha(props.view).fork();
		setBranch(branch);
		const agent = createFunctioningAgent(client, branch, { log: (msg) => console.log(msg) });
		const response = await agent.query(prompt);
		setResponse(response ?? "LLM query failed.");
	};

	const handleApplyResponse = () => {
		if (branch !== undefined) {
			asTreeViewAlpha(props.view).merge(branch);
			setBranch(undefined);
		}
	};

	return (
		<Pane hidden={hidden} setHidden={setHidden} title="Prompt">
			<PromptOutput response={response} />
			<ApplyResponseButton response={response} callback={handleApplyResponse} />
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
				className="flex "
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

export function PromptOutput(props: { response: string }): JSX.Element {
	const { response } = props;
	return (
		<Textarea
			className="flex grow"
			readOnly
			placeholder="Your response will appear here..."
			value={response}
		/>
	);
}

export function ApplyResponseButton(props: {
	response: string;
	callback: (response: string) => void;
}): JSX.Element {
	const { response, callback } = props;

	return (
		<Button
			className="flex shrink-0"
			onClick={() => {
				callback(response);
			}}
			icon={<ArrowLeftFilled />}
		>
			Accept Response
		</Button>
	);
}
