import {
	ClientConnectionId,
	AttendeeId,
	Attendee,
	Latest,
	LatestEvents,
	LatestMap,
	LatestMapEvents,
	AttendeesEvents,
} from "@fluidframework/presence/alpha";
import { Listenable } from "fluid-framework";

export interface PresenceClients {
	getAttendee: (clientId: ClientConnectionId | AttendeeId) => Attendee;
	getAttendees: () => ReadonlySet<Attendee>;
	getMyself: () => Attendee;
	events: Listenable<AttendeesEvents>;
}

export interface PresenceManager<TState> {
	initialState: TState;
	state: Latest<TState>;
	clients: PresenceClients;
	events: Listenable<LatestEvents<TState>>;
}

export interface PresenceMapManager<TState> {
	state: LatestMap<TState>;
	clients: PresenceClients;
	events: Listenable<LatestMapEvents<TState, string>>;
}
