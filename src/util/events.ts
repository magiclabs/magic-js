import EventEmitter from 'eventemitter3';

export type EventsDefinition = { [K in string | symbol]: (...args: any[]) => void } | void;

/**
 * An extension of `EventEmitter` (provided by `eventemitter3`) with an adjusted
 * type interface that supports the unique structure of Magic SDK modules.
 */
export class TypedEmitter<Events extends EventsDefinition = void> extends EventEmitter<
  Events extends void ? string | symbol : Events
> {}
