export const idlFactory = ({ IDL }) => {
  const Result_1 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const Post = IDL.Record({
    'id' : IDL.Nat,
    'title' : IDL.Text,
    'content' : IDL.Text,
    'author' : IDL.Text,
    'timestamp' : IDL.Int,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  return IDL.Service({
    'createPost' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [Result_1], []),
    'getFeaturedPosts' : IDL.Func([], [IDL.Vec(Post)], ['query']),
    'getPosts' : IDL.Func([], [IDL.Vec(Post)], ['query']),
    'setFeaturedPost' : IDL.Func([IDL.Nat], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
