import Nat "mo:base/Nat";

import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Int "mo:base/Int";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";

actor {
  type Post = {
    id: Nat;
    title: Text;
    content: Text;
    timestamp: Int;
  };

  stable var nextPostId: Nat = 0;
  let postsBuffer = Buffer.Buffer<Post>(10);
  stable var featuredPostIds: [Nat] = [];

  public func createPost(title: Text, content: Text) : async Result.Result<Nat, Text> {
    let post: Post = {
      id = nextPostId;
      title = title;
      content = content;
      timestamp = Time.now();
    };
    postsBuffer.add(post);
    nextPostId += 1;
    #ok(post.id)
  };

  public query func getPosts() : async [Post] {
    Buffer.toArray(postsBuffer)
  };

  public query func getFeaturedPosts() : async [Post] {
    let featuredPosts = Buffer.Buffer<Post>(featuredPostIds.size());
    for (id in featuredPostIds.vals()) {
      switch (Buffer.find<Post>(postsBuffer, func(p) { p.id == id })) {
        case (?post) { featuredPosts.add(post); };
        case (null) {};
      };
    };
    Buffer.toArray(featuredPosts)
  };

  public func setFeaturedPost(id: Nat) : async Result.Result<(), Text> {
    switch (Buffer.find<Post>(postsBuffer, func(p) { p.id == id })) {
      case (?post) {
        featuredPostIds := Array.append(featuredPostIds, [id]);
        #ok(())
      };
      case (null) {
        #err("Post not found")
      };
    }
  };
}
