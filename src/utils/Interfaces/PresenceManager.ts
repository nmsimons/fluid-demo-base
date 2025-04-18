import {
	ClientConnectionId,
	AttendeeId,
	Attendee as SessionClient,
	PresenceEvents as ClientEvents,
	Latest as LatestState,
	LatestEvents as LatestStateEvents,
	LatestMap,
	LatestMapEvents,
} from "@fluidframework/presence/alpha";
import { Listenable } from "fluid-framework";

export interface PresenceClients {
	getAttendee: (clientId: ClientConnectionId | AttendeeId) => SessionClient;
	getAttendees: () => ReadonlySet<SessionClient>;
	getMyself: () => SessionClient;
	events: Listenable<ClientEvents>;
}

export interface PresenceManager<TState> {
	initialState: TState;
	state: LatestState<TState>;
	clients: PresenceClients;
	events: Listenable<LatestStateEvents<TState>>;
}

export interface PresenceMapManager<TState> {
	state: LatestMap<TState>;
	clients: PresenceClients;
	events: Listenable<LatestMapEvents<TState, string>>;
}
