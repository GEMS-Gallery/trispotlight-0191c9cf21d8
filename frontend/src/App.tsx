import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, AppBar, Toolbar, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { backend } from 'declarations/backend';

type Post = {
  id: bigint;
  title: string;
  content: string;
  author: string;
  timestamp: bigint;
  starred: boolean;
};

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', author: '' });
  const [expandedPosts, setExpandedPosts] = useState<Set<bigint>>(new Set());
  const [deleteConfirmation, setDeleteConfirmation] = useState<Post | null>(null);

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

  const toggleExpandPost = (postId: bigint) => {
    setExpandedPosts((prevExpanded) => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(postId)) {
        newExpanded.delete(postId);
      } else {
        newExpanded.add(postId);
      }
      return newExpanded;
    });
  };

  const handleDeleteConfirmation = (post: Post) => {
    setDeleteConfirmation(post);
  };

  const handleDeletePost = async () => {
    if (deleteConfirmation) {
      try {
        await backend.deletePost(deleteConfirmation.id);
        setDeleteConfirmation(null);
        fetchPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleStarPost = async (post: Post) => {
    try {
      if (post.starred) {
        await backend.unstarPost(post.id);
      } else {
        await backend.starPost(post.id);
      }
      fetchPosts();
    } catch (error) {
      console.error('Error starring/unstarring post:', error);
    }
  };

  const renderPosts = (postList: Post[], isFeatured: boolean = false) => (
    <Grid container spacing={3}>
      {postList.map((post) => {
        const isExpanded = expandedPosts.has(post.id);
        return (
          <Grid item xs={12} key={Number(post.id)}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant={isFeatured ? 'h4' : 'h5'} component="div" gutterBottom>
                    {post.title}
                  </Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleStarPost(post)}>
                      {post.starred ? <StarIcon color="primary" /> : <StarBorderIcon />}
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenDialog(post)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteConfirmation(post)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  By {post.author} | {new Date(Number(post.timestamp) / 1000000).toLocaleString()}
                </Typography>
                <Typography variant="body1" paragraph>
                  {isExpanded ? post.content : `${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}`}
                </Typography>
                {post.content.length > 200 && (
                  <Button variant="text" color="primary" onClick={() => toggleExpandPost(post.id)}>
                    {isExpanded ? 'Read Less' : 'Read More'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '120px' }}>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', letterSpacing: 1, color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            Dylan Waxes Lyrical
          </Typography>
          <Button color="inherit" variant="outlined" onClick={() => handleOpenDialog()} sx={{ borderRadius: 20, borderColor: 'white', color: 'white' }}>
            Add Post
          </Button>
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
      <Dialog
        open={deleteConfirmation !== null}
        onClose={() => setDeleteConfirmation(null)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the post "{deleteConfirmation?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmation(null)}>Cancel</Button>
          <Button onClick={handleDeletePost} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default App;
