import Bool "mo:base/Bool";
import Nat "mo:base/Nat";
import Order "mo:base/Order";

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
    author: Text;
    timestamp: Int;
    starred: Bool;
  };

  stable var nextPostId: Nat = 0;
  let postsBuffer = Buffer.Buffer<Post>(10);

  func addMockArticles() {
    let mockArticles = [
      {
        title = "The Future of Artificial Intelligence";
        content = "Artificial Intelligence (AI) is rapidly evolving, transforming industries and our daily lives. From self-driving cars to advanced medical diagnostics, AI is pushing the boundaries of what's possible. However, as we embrace this technology, we must also consider the ethical implications and potential risks. This article explores the current state of AI, its future prospects, and the challenges we face as we navigate this exciting new frontier.";
        author = "Dr. Sarah Johnson";
      },
      {
        title = "Sustainable Living: Small Changes, Big Impact";
        content = "In the face of climate change, many people feel overwhelmed and unsure of how they can make a difference. This article discusses simple yet effective ways to adopt a more sustainable lifestyle. From reducing plastic use to embracing renewable energy sources, we'll explore how small changes in our daily habits can contribute to a healthier planet. Learn practical tips and insights on how you can reduce your carbon footprint and inspire others to do the same.";
        author = "Emma Green";
      },
      {
        title = "The Rise of Remote Work: Challenges and Opportunities";
        content = "The COVID-19 pandemic has accelerated the shift towards remote work, fundamentally changing how we view the traditional office environment. This article examines the pros and cons of remote work, its impact on productivity and work-life balance, and how companies are adapting to this new normal. We'll also look at the technologies enabling this transition and discuss the potential long-term effects on urban planning, real estate, and social interactions.";
        author = "Mark Thompson";
      }
    ];

    for (article in mockArticles.vals()) {
      let post: Post = {
        id = nextPostId;
        title = article.title;
        content = article.content;
        author = article.author;
        timestamp = Time.now();
        starred = false;
      };
      postsBuffer.add(post);
      nextPostId += 1;
    };
  };

  addMockArticles();

  public func createPost(title: Text, content: Text, author: Text) : async Result.Result<Nat, Text> {
    let post: Post = {
      id = nextPostId;
      title = title;
      content = content;
      author = author;
      timestamp = Time.now();
      starred = false;
    };
    postsBuffer.add(post);
    nextPostId += 1;
    #ok(post.id)
  };

  public func editPost(id: Nat, title: Text, content: Text, author: Text) : async Result.Result<(), Text> {
    let index = Buffer.indexOf<Post>({ id = id; title = ""; content = ""; author = ""; timestamp = 0; starred = false }, postsBuffer, func(a, b) { a.id == b.id });
    switch (index) {
      case (?i) {
        let updatedPost: Post = {
          id = id;
          title = title;
          content = content;
          author = author;
          timestamp = Time.now();
          starred = postsBuffer.get(i).starred;
        };
        postsBuffer.put(i, updatedPost);
        #ok(())
      };
      case null {
        #err("Post not found")
      };
    }
  };

  public func deletePost(id: Nat) : async Result.Result<(), Text> {
    let index = Buffer.indexOf<Post>({ id = id; title = ""; content = ""; author = ""; timestamp = 0; starred = false }, postsBuffer, func(a, b) { a.id == b.id });
    switch (index) {
      case (?i) {
        ignore postsBuffer.remove(i);
        #ok(())
      };
      case null {
        #err("Post not found")
      };
    }
  };

  public query func getPosts() : async [Post] {
    let sortedPosts = Buffer.toArray(postsBuffer);
    Array.sort(sortedPosts, func(a: Post, b: Post) : Order.Order {
      Int.compare(b.timestamp, a.timestamp)
    })
  };

  public query func getFeaturedPosts() : async [Post] {
    let featuredPosts = Buffer.Buffer<Post>(10);
    for (post in postsBuffer.vals()) {
      if (post.starred) {
        featuredPosts.add(post);
      };
    };
    let sortedFeaturedPosts = Buffer.toArray(featuredPosts);
    Array.sort(sortedFeaturedPosts, func(a: Post, b: Post) : Order.Order {
      Int.compare(b.timestamp, a.timestamp)
    })
  };

  public func starPost(id: Nat) : async Result.Result<(), Text> {
    let index = Buffer.indexOf<Post>({ id = id; title = ""; content = ""; author = ""; timestamp = 0; starred = false }, postsBuffer, func(a, b) { a.id == b.id });
    switch (index) {
      case (?i) {
        let post = postsBuffer.get(i);
        let updatedPost: Post = {
          id = post.id;
          title = post.title;
          content = post.content;
          author = post.author;
          timestamp = post.timestamp;
          starred = true;
        };
        postsBuffer.put(i, updatedPost);
        #ok(())
      };
      case null {
        #err("Post not found")
      };
    }
  };

  public func unstarPost(id: Nat) : async Result.Result<(), Text> {
    let index = Buffer.indexOf<Post>({ id = id; title = ""; content = ""; author = ""; timestamp = 0; starred = false }, postsBuffer, func(a, b) { a.id == b.id });
    switch (index) {
      case (?i) {
        let post = postsBuffer.get(i);
        let updatedPost: Post = {
          id = post.id;
          title = post.title;
          content = post.content;
          author = post.author;
          timestamp = post.timestamp;
          starred = false;
        };
        postsBuffer.put(i, updatedPost);
        #ok(())
      };
      case null {
        #err("Post not found")
      };
    }
  };
}
