/* eslint-disable @typescript-eslint/no-empty-object-type */
// A function that creates a new DragManager instance

import {
	type Presence,
	StateFactory as latestStateFactory,
	LatestEvents as LatestStateEvents,
	StatesWorkspace as Workspace,
	Latest as LatestState,
	AttendeeId,
	ClientConnectionId,
} from "@fluidframework/presence/alpha";
import { Listenable } from "fluid-framework";
import { DragManager } from "./Interfaces/DragManager.js";

// with the given presence and workspace.
export function createDragManager(props: {
	presence: Presence;
	workspace: Workspace<{}>;
	name: string;
}): DragManager<DragAndRotatePackage> {
	const { presence, workspace, name } = props;

	class DragManagerImpl implements DragManager<DragAndRotatePackage> {
		initialState: DragAndRotatePackage | null = null;
		state: LatestState<DragAndRotatePackage | null>;

		constructor(
			name: string,
			workspace: Workspace<{}>,
			private presence: Presence,
		) {
			workspace.add(
				name,
				// TODO: NICK
				latestStateFactory.latest<DragAndRotatePackage | null>(this.initialState),
			);
			this.state = workspace.props[name];
		}

		public clients = {
			getAttendee: (clientId: ClientConnectionId | AttendeeId) =>
				this.presence.attendees.getAttendee(clientId),
			getAttendees: () => this.presence.attendees.getAttendees(),
			getMyself: () => this.presence.attendees.getMyself(),
			events: this.presence.events,
		};

		public get events(): Listenable<LatestStateEvents<DragAndRotatePackage | null>> {
			return this.state.events;
		}

		/** Indicate that an item is being dragged */
		public setDragging(target: DragAndRotatePackage) {
			this.state.local = target;
		}

		// Clear the drag data for the local client
		public clearDragging() {
			this.state.local = null;
		}
	}

	return new DragManagerImpl(name, workspace, presence);
}

export type DragAndRotatePackage = {
	id: string;
	x: number;
	y: number;
	rotation: number;
};
