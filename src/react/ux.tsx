/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { JSX, useContext, useEffect, useState } from "react";
import { App } from "../schema/app_schema.js";
import "../output.css";
import { ConnectionState, IFluidContainer } from "fluid-framework";
import { Canvas } from "./canvasux.js";
import type { SelectionManager } from "../utils/Interfaces/SelectionManager.js";
import { undoRedo } from "../utils/undo.js";
import { NewShapeButton, ShowPaneButton, NewNoteButton, TooltipButton } from "./buttonux.js";
import {
	Avatar,
	AvatarGroup,
	AvatarGroupItem,
	AvatarGroupPopover,
	AvatarGroupProps,
	MessageBar,
	MessageBarBody,
	MessageBarTitle,
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
import { TypedSelection } from "../utils/selection.js";
import { CommentPane } from "./commentux.js";
import {
	ArrowRedoFilled,
	ArrowUndoFilled,
	BotFilled,
	BotRegular,
	CommentFilled,
	CommentRegular,
	DeleteRegular,
} from "@fluentui/react-icons";
import { TreeViewAlpha } from "@fluidframework/tree/alpha";
import { useTree } from "./useTree.js";
import { TaskPane } from "./taskux.js";

export function ReactApp(props: {
	tree: TreeViewAlpha<typeof App>;
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
	const [taskPaneHidden, setTaskPaneHidden] = useState(true);
	const [commentPaneHidden, setCommentPaneHidden] = useState(true);
	const [selectedItemId, setSelectedItemId] = useState<string>("");
	const [view, setView] = useState<TreeViewAlpha<typeof App>>(tree);

	useTree(tree.root);
	useTree(view.root.items);
	useTree(view.root.comments);

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
		setSaved(!container.isDirty);
		container.on("connected", updateConnectionState);
		container.on("disconnected", updateConnectionState);
		container.on("dirty", () => setSaved(false));
		container.on("saved", () => setSaved(true));
		container.on("disposed", updateConnectionState);
	}, [container]);

	/** Unsubscribe to undo-redo events when the component unmounts */
	useEffect(() => {
		return undoRedo.dispose;
	}, []);

	useEffect(() => {
		const unsubscribe = selection.events.on("localUpdated", () => {
			const itemId =
				selection.getLocalSelection().length !== 0
					? selection.getLocalSelection()[0].id
					: undefined;

			const selectedItem = view.root.items.find((item) => item.id === itemId);

			setSelectedItemId(selectedItem?.id ?? "");
		});
		return unsubscribe;
	}, [view, selection]);

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
						<TooltipButton
							tooltip="Undo"
							onClick={() => undoRedo.undo()}
							icon={<ArrowUndoFilled />}
							disabled={!undoRedo.canUndo()}
						/>
						<TooltipButton
							tooltip="Redo"
							onClick={() => undoRedo.redo()}
							icon={<ArrowRedoFilled />}
							disabled={!undoRedo.canRedo()}
						/>
					</ToolbarGroup>
					<ToolbarDivider />
					<ToolbarGroup>
						<NewShapeButton items={view.root.items} canvasSize={canvasSize} />
						<NewNoteButton items={view.root.items} canvasSize={canvasSize} />
					</ToolbarGroup>
					<ToolbarDivider />
					<ToolbarGroup>
						<TooltipButton
							tooltip="Clear canvas"
							icon={<DeleteRegular />}
							onClick={() => view.root.items.removeRange()}
							disabled={view.root.items.length === 0}
						/>
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
							hiddenIcon={<BotRegular />}
							shownIcon={<BotFilled />}
							hidePane={setTaskPaneHidden}
							paneHidden={taskPaneHidden}
							tooltip="AI Chat"
						/>
					</ToolbarGroup>
				</Toolbar>
				{view !== tree ? (
					<MessageBarComponent message="While viewing a Task, others will not see your changes (and you will not see theirs) until you complete the task." />
				) : (
					<></>
				)}
				<div className="flex h-[calc(100vh-96px)] w-full flex-row ">
					<Canvas
						items={view.root.items}
						container={container}
						setSize={(width, height) => setCanvasSize({ width, height })}
					/>
					<CommentPane
						hidden={commentPaneHidden}
						setHidden={setCommentPaneHidden}
						itemId={selectedItemId}
						app={tree.root}
					/>
					<TaskPane
						hidden={taskPaneHidden}
						setHidden={setTaskPaneHidden}
						view={tree}
						setRenderView={setView}
					/>
				</div>
			</div>
		</PresenceContext.Provider>
	);
}

export function createBranch(
	main: TreeViewAlpha<typeof App>,
	currentView: TreeViewAlpha<typeof App>,
	setView: (view: TreeViewAlpha<typeof App>) => void,
) {
	// if the current view is not the same as the tree, return the current view
	// otherwise, create a new branch from the tree and return it
	if (currentView !== main) return currentView;
	setView(main.fork());
}

export function mergeBranch(
	main: TreeViewAlpha<typeof App>,
	currentView: TreeViewAlpha<typeof App>,
	setView: (view: TreeViewAlpha<typeof App>) => void,
) {
	// if the current view is the same as main, return the current view
	// otherwise, merge the current view into main and dispose of the current view
	if (currentView === main) return currentView;
	main.merge(currentView);
	setView(main);
	currentView.dispose();
}

export function Header(props: { saved: boolean; connectionState: string }): JSX.Element {
	const { saved, connectionState } = props;

	return (
		<div className="h-[48px] flex shrink-0 flex-row items-center justify-between bg-black text-base text-white z-40 w-full text-nowrap">
			<div className="flex items-center">
				<div className="flex ml-2 mr-8">
					<Text weight="bold">Fluid Framework Demo</Text>
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
		const unsubscribe = users.events.on("remoteUpdated", () => {
			setUserRoster(users.getConnectedUsers());
		});
		return unsubscribe;
	}, []);

	useEffect(() => {
		// Update the user roster when users disconnect
		// TODO: NICK
		// const unsubscribe = users.clients.events.on("attendeeDisconnected", () => {
		// 	setUserRoster(users.getConnectedUsers());
		// });
		// return unsubscribe;
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
					key={String(user.client.attendeeId ?? user.value.name)}
					content={user.value.name}
					relationship={"label"}
				>
					<AvatarGroupItem
						name={user.value.name}
						key={String(user.client.attendeeId ?? user.value.name)}
					/>
				</Tooltip>
			))}
			{overflowItems && (
				<AvatarGroupPopover>
					{overflowItems.map((user) => (
						<AvatarGroupItem
							name={user.value.name}
							key={String(user.client.attendeeId ?? user.value.name)}
						/>
					))}
				</AvatarGroupPopover>
			)}
		</AvatarGroup>
	);
};

export function MessageBarComponent(props: { message: string }): JSX.Element {
	const { message } = props;
	return (
		<MessageBar className="shadow-lg">
			<MessageBarBody>
				<MessageBarTitle>{message}</MessageBarTitle>
			</MessageBarBody>
		</MessageBar>
	);
}
