import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, AppBar, Toolbar, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
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
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', author: '' });

  useEffect(() => {
    fetchPosts();
  }, []);

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

  const handleOpenDialog = (post?: Post) => {
    if (post) {
      setEditingPost(post);
      setFormData({ title: post.title, content: post.content, author: post.author });
    } else {
      setEditingPost(null);
      setFormData({ title: '', content: '', author: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPost(null);
    setFormData({ title: '', content: '', author: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (editingPost) {
        await backend.editPost(editingPost.id, formData.title, formData.content, formData.author);
      } else {
        await backend.createPost(formData.title, formData.content, formData.author);
      }
      handleCloseDialog();
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

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
              <Button variant="outlined" color="primary" onClick={() => handleOpenDialog(post)} sx={{ mt: 2 }}>
                Edit
              </Button>
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
          <Button color="inherit" onClick={() => handleOpenDialog()}>Add Post</Button>
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
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingPost ? 'Edit Post' : 'Add New Post'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            type="text"
            fullWidth
            variant="standard"
            value={formData.title}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="author"
            label="Author"
            type="text"
            fullWidth
            variant="standard"
            value={formData.author}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="content"
            label="Content"
            type="text"
            fullWidth
            variant="standard"
            multiline
            rows={4}
            value={formData.content}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default App;
