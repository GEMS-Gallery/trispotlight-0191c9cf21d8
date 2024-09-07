import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, AppBar, Toolbar, CircularProgress, Button } from '@mui/material';
import { backend } from 'declarations/backend';

type Post = {
  id: bigint;
  title: string;
  content: string;
  author: string;
  timestamp: bigint;
};

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const [allPosts, featured] = await Promise.all([
          backend.getPosts(),
          backend.getFeaturedPosts()
        ]);
        setPosts(allPosts);
        setFeaturedPosts(featured);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const renderPosts = (postList: Post[], isFeatured: boolean = false) => (
    <Grid container spacing={3}>
      {postList.map((post) => (
        <Grid item xs={12} key={Number(post.id)}>
          <Card>
            <CardContent>
              <Typography variant={isFeatured ? 'h4' : 'h5'} component="div" gutterBottom>
                {post.title}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                By {post.author} | {new Date(Number(post.timestamp) / 1000000).toLocaleString()}
              </Typography>
              <Typography variant="body1" paragraph>
                {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
              </Typography>
              {post.content.length > 200 && (
                <Button variant="text" color="primary">
                  Read More
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My Blog
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ my: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Featured Posts
              </Typography>
              {renderPosts(featuredPosts, true)}
            </Box>
            <Box sx={{ my: 4 }}>
              <Typography variant="h4" component="h2" gutterBottom>
                Recent Posts
              </Typography>
              {renderPosts(posts.slice(0, 5))}
            </Box>
            <Box sx={{ my: 4 }}>
              <Typography variant="h4" component="h2" gutterBottom>
                All Posts
              </Typography>
              {renderPosts(posts)}
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default App;
