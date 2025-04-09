/* eslint-disable @typescript-eslint/no-empty-object-type */
// A function that creates a new DragManager instance

import {
	type IPresence as Presence,
	Latest as latestStateFactory,
	LatestValueManagerEvents as LatestStateEvents,
	PresenceStates as Workspace,
	LatestValueManager as LatestState,
	ClientSessionId,
	ClientConnectionId,
} from "@fluidframework/presence/alpha";
import { Listenable } from "fluid-framework";
import { DragManager, DragPackage } from "./Interfaces/DragManager.js";
import { PresenceManager } from "./Interfaces/PresenceManager.js";

// with the given presence and workspace.
export function createDragManager(props: {
	presence: Presence;
	workspace: Workspace<{}>;
	name: string;
}): DragManager {
	const { presence, workspace, name } = props;

	class DragManagerImpl implements PresenceManager<DragPackage | null> {
		initialState: DragPackage | null = null;
		state: LatestState<DragPackage | null>;

		constructor(
			name: string,
			workspace: Workspace<{}>,
			private presence: Presence,
		) {
			// @ts-expect-error - This is a known issue with the latestStateFactory type
			workspace.add(name, latestStateFactory<DragPackage | null>(this.initialState));
			this.state = workspace.props[name];
		}

		public clients = {
			getAttendee: (clientId: ClientConnectionId | ClientSessionId) =>
				this.presence.getAttendee(clientId),
			getAttendees: () => this.presence.getAttendees(),
			getMyself: () => this.presence.getMyself(),
			events: this.presence.events,
		};

		public get events(): Listenable<LatestStateEvents<DragPackage | null>> {
			return this.state.events;
		}

		/** Indicate that an item is being dragged */
		public setDragging(target: DragPackage) {
			this.state.local = target;
		}

		// Clear the drag data for the local client
		public clearDragging() {
			this.state.local = null;
		}
	}

	return new DragManagerImpl(name, workspace, presence);
}
