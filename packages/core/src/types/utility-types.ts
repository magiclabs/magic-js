export type UnwrapArray<T extends any[]> = T extends Array<infer P> ? P : never;
export type ConstructorOf<C> = { new (...args: any[]): C };
