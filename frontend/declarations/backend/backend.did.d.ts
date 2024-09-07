import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Post {
  'id' : bigint,
  'title' : string,
  'content' : string,
  'author' : string,
  'timestamp' : bigint,
}
export type Result = { 'ok' : null } |
  { 'err' : string };
export type Result_1 = { 'ok' : bigint } |
  { 'err' : string };
export interface _SERVICE {
  'createPost' : ActorMethod<[string, string, string], Result_1>,
  'deletePost' : ActorMethod<[bigint], Result>,
  'editPost' : ActorMethod<[bigint, string, string, string], Result>,
  'getFeaturedPosts' : ActorMethod<[], Array<Post>>,
  'getPosts' : ActorMethod<[], Array<Post>>,
  'setFeaturedPost' : ActorMethod<[bigint], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
