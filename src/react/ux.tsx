/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { JSX, useContext, useEffect, useState } from "react";
import { App } from "../schema/app_schema.js";
import "../output.css";
import { ConnectionState, IFluidContainer, TreeView } from "fluid-framework";
import { Canvas } from "./canvasux.js";
import type { SelectionManager } from "../utils/Interfaces/SelectionManager.js";
import { undoRedo } from "../utils/undo.js";
import { UndoButton, RedoButton, NewShapeButton, ShowPaneButton } from "./buttonux.js";
import {
	Avatar,
	AvatarGroup,
	AvatarGroupItem,
	AvatarGroupPopover,
	AvatarGroupProps,
	partitionAvatarGroupItems,
	Text,
	Toolbar,
	ToolbarDivider,
	ToolbarGroup,
	Tooltip,
} from "@fluentui/react-components";
import { User, UsersManager } from "../utils/Interfaces/UsersManager.js";
import { PresenceContext } from "./PresenceContext.js";
import { DragManager } from "../utils/Interfaces/DragManager.js";
import { DragAndRotatePackage } from "../utils/drag.js";
import { PromptPane } from "./promptux.js";
import { TypedSelection } from "../utils/selection.js";
import { CommentPane } from "./commentux.js";
import { ChatFilled, ChatRegular, CommentFilled, CommentRegular } from "@fluentui/react-icons";

export function ReactApp(props: {
	tree: TreeView<typeof App>;
	selection: SelectionManager<TypedSelection>;
	users: UsersManager;
	container: IFluidContainer;
	undoRedo: undoRedo;
	drag: DragManager<DragAndRotatePackage>;
}): JSX.Element {
	const { tree, selection, users, container, undoRedo, drag } = props;
	const [connectionState, setConnectionState] = useState("");
	const [saved, setSaved] = useState(false);
	const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
	const [promptPaneHidden, setPromptPaneHidden] = useState(false);
	const [commentPaneHidden, setCommentPaneHidden] = useState(true);
	const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);

	useEffect(() => {
		const updateConnectionState = () => {
			if (container.connectionState === ConnectionState.Connected) {
				setConnectionState("connected");
			} else if (container.connectionState === ConnectionState.Disconnected) {
				setConnectionState("disconnected");
			} else if (container.connectionState === ConnectionState.EstablishingConnection) {
				setConnectionState("connecting");
			} else if (container.connectionState === ConnectionState.CatchingUp) {
				setConnectionState("catching up");
			}
		};
		updateConnectionState();
		setSaved(!props.container.isDirty);
		container.on("connected", updateConnectionState);
		container.on("disconnected", updateConnectionState);
		container.on("dirty", () => setSaved(false));
		container.on("saved", () => setSaved(true));
		container.on("disposed", updateConnectionState);
	}, []);

	/** Unsubscribe to undo-redo events when the component unmounts */
	useEffect(() => {
		return undoRedo.dispose;
	}, []);

	useEffect(() => {
		const unsubscribe = selection.events.on("localUpdated", () => {
			setSelectedItemId(
				selection.getLocalSelection().length !== 0
					? selection.getLocalSelection()[0].id
					: undefined,
			);
		});
		return unsubscribe;
	}, []);

	return (
		<PresenceContext.Provider
			value={{
				users: users,
				selection: selection,
				drag: drag,
			}}
		>
			<div
				id="main"
				className="flex flex-col bg-transparent h-screen w-full overflow-hidden overscroll-none"
			>
				<Header saved={saved} connectionState={connectionState} />
				<Toolbar className="h-[48px] shadow-lg">
					<ToolbarGroup>
						<NewShapeButton items={tree.root.items} canvasSize={canvasSize} />
					</ToolbarGroup>
					<ToolbarDivider />
					<ToolbarGroup>
						<ShowPaneButton
							hiddenIcon={<CommentRegular />}
							shownIcon={<CommentFilled />}
							hidePane={setCommentPaneHidden}
							paneHidden={commentPaneHidden}
							tooltip="Comments"
						/>
						<ShowPaneButton
							hiddenIcon={<ChatRegular />}
							shownIcon={<ChatFilled />}
							hidePane={setPromptPaneHidden}
							paneHidden={promptPaneHidden}
							tooltip="AI Chat"
						/>
					</ToolbarGroup>
					<ToolbarDivider />
					<ToolbarGroup>
						<UndoButton undo={() => undoRedo.undo()} />
						<RedoButton redo={() => undoRedo.redo()} />
					</ToolbarGroup>
				</Toolbar>
				<div className="flex h-[calc(100vh-96px)] w-full flex-row ">
					<Canvas
						items={tree.root.items}
						container={container}
						setSize={(width, height) => setCanvasSize({ width, height })}
					/>
					<CommentPane
						selectedItemId={selectedItemId}
						hidden={commentPaneHidden}
						setHidden={setCommentPaneHidden}
						app={tree.root}
					/>
					<PromptPane hidden={promptPaneHidden} setHidden={setPromptPaneHidden} />
				</div>
			</div>
		</PresenceContext.Provider>
	);
}

export function Header(props: { saved: boolean; connectionState: string }): JSX.Element {
	const { saved, connectionState } = props;

	return (
		<div className="h-[48px] flex shrink-0 flex-row items-center justify-between bg-black text-base text-white z-40 w-full text-nowrap">
			<div className="flex items-center">
				<div className="flex ml-2 mr-8">
					<Text weight="bold">Table</Text>
				</div>
			</div>
			<div className="flex flex-row items-center m-2">
				<SaveStatus saved={saved} />
				<HeaderDivider />
				<ConnectionStatus connectionState={connectionState} />
				<HeaderDivider />
				<UserCorner />
			</div>
		</div>
	);
}

export function SaveStatus(props: { saved: boolean }): JSX.Element {
	const { saved } = props;
	return (
		<div className="flex items-center">
			<Text>{saved ? "" : "not"}&nbsp;saved</Text>
		</div>
	);
}

export function ConnectionStatus(props: { connectionState: string }): JSX.Element {
	const { connectionState } = props;
	return (
		<div className="flex items-center">
			<Text>{connectionState}</Text>
		</div>
	);
}

export function UserCorner(): JSX.Element {
	return (
		<div className="flex flex-row items-center gap-4 mr-2">
			<Facepile />
			<CurrentUser />
		</div>
	);
}

export const HeaderDivider = (): JSX.Element => {
	return <ToolbarDivider />;
};

export const CurrentUser = (): JSX.Element => {
	const users = useContext(PresenceContext).users;
	return <Avatar name={users.getMyself().value.name} size={24} />;
};

export const Facepile = (props: Partial<AvatarGroupProps>) => {
	const users = useContext(PresenceContext).users;
	const [userRoster, setUserRoster] = useState(users.getConnectedUsers());

	useEffect(() => {
		// Check for changes to the user roster and update the avatar group if necessary
		const unsubscribe = users.events.on("updated", () => {
			setUserRoster(users.getConnectedUsers());
		});
		return unsubscribe;
	}, []);

	useEffect(() => {
		// Update the user roster when users disconnect
		const unsubscribe = users.clients.events.on("attendeeDisconnected", () => {
			setUserRoster(users.getConnectedUsers());
		});
		return unsubscribe;
	}, []);

	const { inlineItems, overflowItems } = partitionAvatarGroupItems<User>({
		items: userRoster,
		maxInlineItems: 3, // Maximum number of inline avatars before showing overflow
	});

	if (inlineItems.length === 0) {
		return null; // No users to display
	}

	return (
		<AvatarGroup size={24} {...props}>
			{inlineItems.map((user) => (
				<Tooltip
					key={String(user.client.sessionId ?? user.value.name)}
					content={user.value.name}
					relationship={"label"}
				>
					<AvatarGroupItem
						name={user.value.name}
						key={String(user.client.sessionId ?? user.value.name)}
					/>
				</Tooltip>
			))}
			{overflowItems && (
				<AvatarGroupPopover>
					{overflowItems.map((user) => (
						<AvatarGroupItem
							name={user.value.name}
							key={String(user.client.sessionId ?? user.value.name)}
						/>
					))}
				</AvatarGroupPopover>
			)}
		</AvatarGroup>
	);
};
