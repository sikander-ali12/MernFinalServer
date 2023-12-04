const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// Replace '<your-connection-string>' with your actual MongoDB connection string
const connectionString = 'mongodb+srv://sikandera279:L1F20BSSE0452@cluster0.j0pro0e.mongodb.net/?retryWrites=true&w=majority';

// Create a new MongoClient
const client = new MongoClient(connectionString);
client.connect()
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
    });

const app = express();
app.use(express.urlencoded({ extended: false }));
// Use cors middleware to enable cross-origin requests
app.use(cors());
app.use(express.json())

const db = client.db('BlogApp');
// Handle POST request to fetch the image
app.post('/header-image', (req, res) => {
  const imagePath = path.join(__dirname, 'header_img.jpg');

  // Read the image file and send it in the response
  fs.readFile(imagePath, (err, data) => {
    if (err) {
      console.error('Error reading image:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(data);
    }
  });
});
app.post('/about_us', (req, res) => {
  const imagePath = path.join(__dirname, 'aboutus_person.jpg');
  // Read the image file and send it in the response
  fs.readFile(imagePath, (err, data) => {
    if (err) {
      console.error('Error reading image:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(data);
    }
  });
});

// Handle GET request for posts data
app.get('/', async (req, res) => {
  try {
    const postsCollection = db.collection('posts');
    const posts = await postsCollection.find({}).toArray();
    res.json(posts);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/getreplies', async (req, res) => {
  try {
    
    const postsCollection = db.collection('replied_comments');
    const posts = await postsCollection.find({}).toArray();
    res.json(posts);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/suggestions', async (req, res) => {
  try {
    
    const postsCollection = db.collection('suggestions');
    const posts = await postsCollection.find({}).toArray();
    res.json(posts);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Handle to get Reported Post
app.get('/reportedposts', async (req, res) => {
  try {
    
    const reportedPostCollection = db.collection('postreports');
    const reportedPosts = await reportedPostCollection.find({}).toArray();
    res.json(reportedPosts);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Handle to Create a new Post
app.post('/createpost', async (req, res) => {
  try {
    const { user_id, title, body, status, date, time } = req.body;
    
    const postsCollection = db.collection('posts');

    // Fetch all posts and find the length of the array
    const allPosts = await postsCollection.find({}).toArray();
    const nextPostId = allPosts.length + 1;

    // Create the new post with the dynamically determined post_id
    const newPost = {
      user_id: parseInt(user_id),
      title: title,
      body: body,
      post_id: nextPostId,
      status: status,
      date: date,
      time: time,
      likeCount:0
    };

    // Insert the new post into the collection
    const result = await postsCollection.insertOne(newPost);

    res.status(200).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Handle to approve post 
app.post('/posts/:id/approve', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    const postsCollection = db.collection('posts');
    const post = await postsCollection.findOne({ post_id: postId });

    if (!post) {
      throw new Error('Post not found.');
    }

    // Check if the post is already approved
    if (post.status === 'approved') {
      return res.status(400).json({ error: 'Post is already approved.' });
    }

    // Update the post status to 'approved'
    const result = await postsCollection.updateOne(
      { post_id: postId },
      { $set: { status: 'approved' } }
    );

    res.status(200).json({ message: 'Post approved successfully.' });
  } catch (error) {
    console.error('Error approving post:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Handle GET request for comments data
app.get('/comments', async(req, res) => {
  try {
    
    const postsCollection = db.collection('comments');
    const posts = await postsCollection.find({}).toArray();
    res.json(posts);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
//Handle to get comment likes 
app.get('/commentlikes', async(req, res) => {
  try {
    
    const postsCollection = db.collection('comments_like');
    const posts = await postsCollection.find({}).toArray();
    res.json(posts);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Handle to get psot likes
app.get('/postlikes', async(req, res) => {
  try {
    
    const postsCollection = db.collection('posts_likes');
    const posts = await postsCollection.find({}).toArray();

    res.json(posts);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Handles to fetch particular post comments
app.get('/comments/:postId', async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const commentsCollection = db.collection('comments');
    const comments = await commentsCollection.find({ post_id: postId }).toArray();

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Handle to create a new comment
app.post('/createcomment', async(req, res) => {
  try {
    const { body, post_id, date, time } = req.body;
    
    const commentsCollection = db.collection('comments');

    // Fetch all posts and find the length of the array
    const allComments = await commentsCollection.find({}).toArray();
    const nectCommentId = allComments.length + 1;

    // Create the new post with the dynamically determined post_id
    const newComment = {
     body:body,
     post_id:post_id,
     date:date,
     time:time,
     comment_id:nectCommentId
    };

    // Insert the new post into the collection
    const result = await commentsCollection.insertOne(newComment);

    res.status(200).json(newComment);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Handle to delete a particular comment
app.delete('/deletecomment/:id', async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    const commentsCollection = db.collection('comments');
    // Find the comment by id
    const deletedComment = await commentsCollection.findOneAndDelete({ comment_id: commentId });

    if (deletedComment) {
      res.status(200).json(deletedComment);
    } else {
      res.status(404).send('Comment not found');
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Handle to delete a aparticular Post
app.delete('/deletepost/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const postsCollection = db.collection('posts');
    const commentsCollection = db.collection('comments');

    // Find and delete the post by post_id
    const deletedPost = await postsCollection.findOneAndDelete({ post_id: postId });

    if (deletedPost.value) {
      // Delete all comments associated with the deleted post
      await commentsCollection.deleteMany({ post_id: postId });

      res.status(200).json({
        deletedPost: deletedPost.value,
        deletedComments: `All comments for post_id ${postId} deleted.`
      });
    } else {
      res.status(404).send('Post not found');
    }
  } catch (error) {
    console.error('Error deleting post and comments:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Handle for new user registration
app.post('/createuser', async (req, res) => {
  try {
    const {name,email,pass,status } = req.body;
    const usersCollection = db.collection('users');
    // Fetch all posts and find the length of the array
    const allusers = await usersCollection.find({}).toArray();
    const newctUserID = allusers.length + 1;
    // Create the new post with the dynamically determined post_id
    const newUser = {
      user_id: newctUserID,
      name: name,
      email: email,
      pass: pass,
      status: status || 'user'
    };
    // Insert the new post into the collection
    const result = await usersCollection.insertOne(newUser);
    res.status(200).json(newUser);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Handle Get Request To authenticate user
app.get('/users', async (req, res) => {
  try {
    const { email, pass } = req.query;
    const usersCollection=db.collection('users');
    // Your authentication logic goes here
    const user = await usersCollection.findOne({ email: email, pass: pass });

    if (user) {
      // User exists, send a success response with user details
      res.status(200).json({ userId: user.user_id, message: 'User exists' });
    } else {
      // User does not exist, send a not found response
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error checking user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Delete User Request 
app.delete('/deleteuser/:id', async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    const commentsCollection = db.collection('users');
    // Find the comment by id
    const deletedComment = await commentsCollection.findOneAndDelete({ user_id: commentId });

    if (deletedComment) {
      res.status(200).json(deletedComment);
    } else {
      res.status(404).send('user not found');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Handle Post reqquest to update likes of the post

app.post('/likePost/:postId/:userid', async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const userid = parseInt(req.params.userid);
    const { liked } = req.body;
    const postsCollection = db.collection('posts');
    const psotlikeCollection = db.collection('posts_likes');
    // Find the post by post_id
    const likeData={
      post_id:postId,
      user_id:userid
    }
    const post = await postsCollection.findOne({ post_id: postId });

    if (!post) {
      res.status(404).send('Post not found');
      return;
    }

    // Increment the like count if liked is true
    if (liked) {
      await postsCollection.updateOne({ post_id: postId }, { $inc: { likeCount: 1 } });
      await psotlikeCollection.insertOne(likeData);
    }

    res.status(200).json({ liked: liked, likeCount: liked ? post.likeCount + 1 : post.likeCount });
  } catch (error) {
    console.error('Error updating like status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Handle post request to handle comment like 

app.post('/likecomment/:commentID/:userid', async (req, res) => {
  try {
    const commentID = parseInt(req.params.commentID);
    const userid = parseInt(req.params.userid);
    const { liked } = req.body;
    const commentsCollection = db.collection('comments');
    const commentlikeCollection = db.collection('comments_like');
    // Find the post by post_id
    const likeData={
      comment_id:commentID,
      user_id:userid
    }
    const post = await commentsCollection.findOne({ comment_id: commentID });

    if (!post) {
      res.status(404).send('Comment not found');
      return;
    }

    // Increment the like count if liked is true
    if (liked) {
      await commentsCollection.updateOne({ post_id: commentID }, { $inc: { likeCount: 1 } });
      await commentlikeCollection.insertOne(likeData);
    }

    res.status(200).json({ liked: liked, likeCount: liked ? post.likeCount + 1 : post.likeCount });
  } catch (error) {
    console.error('Error updating like status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Handle GET request for user data by user ID
app.get('/users/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    console.log(userId);
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ user_id: userId });
      res.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Handle to get post 
app.get('/post/:postID', async (req, res) => {
  try {
    const postID = parseInt(req.params.postID);
    console.log(postID);
    const postsCollection = db.collection('posts');
    const post = await postsCollection.findOne({ post_id: parseInt(postID) });
      res.json(post);
  } catch (error) {
    console.error('Error fetching Post data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Handle PUT request to update profile information by user ID
app.put('/updateuser/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { name, email, pass } = req.body;
    const usersCollection = db.collection('users');

    // Find the user by user_id
    const user = await usersCollection.findOne({ user_id: userId });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Update the user information
    const result = await usersCollection.updateOne(
      { user_id: userId },
      { $set: { name: name, email: email, pass: pass } }
    );

    res.status(200).json({ message: 'User information updated successfully' });
  } catch (error) {
    console.error('Error updating user information:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Handle to report a particular post
app.post('/reportpost/:postId', async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const { reason } = req.body;

    // Check if the post with the given post_id exists
    const postsCollection = db.collection('posts');
    const post = await postsCollection.findOne({ post_id: postId });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // Store the report in a new collection (e.g., postreports)
    const postReportsCollection = db.collection('postreports');
    const report = {
      post_id: postId,
      reason: reason,
    };

    // Insert the report into the postreports collection
    await postReportsCollection.insertOne(report);

    res.status(200).json({ message: 'Post reported successfully' });
  } catch (error) {
    console.error('Error reporting post:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//Handle to report a particular comment
app.post('/reportcomment/:commentID', async (req, res) => {
  try {
    const commentID = parseInt(req.params.commentID);
    const { reason } = req.body;

    // Check if the post with the given post_id exists
    const commentsCollection = db.collection('comments');
    const comment = await commentsCollection.findOne({ comment_id: commentID });

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    // Store the report in a new collection (e.g., postreports)
    const commentReportsCollection = db.collection('commentsreports');
    const report = {
      comment_id: commentID,
      reason: reason,
    };

    // Insert the report into the postreports collection
    await commentReportsCollection.insertOne(report);

    res.status(200).json({ message: 'Post reported successfully' });
  } catch (error) {
    console.error('Error reporting post:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Handle to check post is liked or not
app.post('/checklikePost/:postId/:userId', async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const userId = parseInt(req.params.userId);
    const { liked } = req.body;
    const postsLikesCollection = db.collection('posts_likes');
    const existingLike = await postsLikesCollection.findOne({ post_id: postId, user_id: userId });
    if (existingLike) {
      const liked={
        liked:"liked"
      }
      res.status(200).json(liked);
    } else {
      const liked={
        liked:"unliked"
      }
      res.status(500).json(liked)
    }

    
  } catch (error) {
    console.error('Error updating like status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Handle to get liked comments 
app.get('/likedComment', async (req, res) => {
  try {
    
    const likedCommentsCollection = db.collection('comments_like');
    const likedcomments = await likedCommentsCollection.find({}).toArray();
    res.json(likedcomments);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Handle to reply a comment
app.post('/replycomment/:commentId', (req, res) => {
  const { commentId } = req.params;
  const { body, user_id } = req.body;
  if (!body || !user_id) {
    return res.status(400).json({ error: 'Invalid request. Missing required fields.' });
  }
  const commentsCollection = db.collection('comments');
  const comment=commentsCollection.findOne({comment_id:commentId});
  if (!comment) {
    return res.status(404).json({ error: 'Comment not found.' });
  }
  const reply = {
    body:body,
    user_id:parseInt(user_id),
    realcomment_id:parseInt(commentId)
  };
  const replyedCommentsCollection=db.collection('replied_comments')
  replyedCommentsCollection.insertOne(reply);
  res.status(200).json({ message: 'Reply added successfully'});
});

//Handle to Submit a suggestion
app.post('/submitsuggestion/:userID/:postID', async (req, res) => {
  try {
    const { userID, postID } = req.params;
    const { body } = req.body;

    if (!body || !userID || !postID) {
      return res.status(400).json({ error: 'Invalid request. Missing required fields.' });
    }
    const postsCollection = db.collection('posts');
    const suggestionsCollection = db.collection('suggestions');
    const suggestions=suggestionsCollection.find({}).toArray();
    // Use MongoDB aggregation to find the user associated with the postID
    const userAssociatedWithPost = await postsCollection.aggregate([
      { $match: { post_id: parseInt(postID) } },
      { $project: { _id: 0, to: '$user_id' } }
    ]).toArray();

    if (userAssociatedWithPost.length === 0) {
      return res.status(404).json({ error: 'User not found for the provided postID.' });
    }

    // Create the suggestion object with the found user
    const newSuggestion = {
      sug_id:(await suggestions).length,
      from: parseInt(userID),
      to: userAssociatedWithPost[0].to,
      post_id: parseInt(postID),
      body: body,
      status: 'pending'
    };

    // Insert the suggestion into the suggestions collection
    const result = await suggestionsCollection.insertOne(newSuggestion);

    res.status(200).json({ message: 'Suggestion added successfully'});
  } catch (error) {
    console.error('Error creating suggestion:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Handle Suggestions which are given by a user
app.get('/mysuggestions/:userID', async (req, res) => {
  try {
    const { userID } = req.params;
    const suggestionCollection = db.collection('suggestions');
    const suggestions = await suggestionCollection.find({ from: parseInt(userID) }).toArray();
    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Handle Suggestions which are given by other users to you
app.get('/givensuggestions/:userID', async (req, res) => {
  try {
    const { userID } = req.params;
    const suggestionCollection = db.collection('suggestions');
    const suggestions = await suggestionCollection.find({ to: parseInt(userID) }).toArray();

   

    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Handle for a reject request
app.put('/rejectsuggestion/:sugID', (req, res) => {
  try {
      const { sugID } = req.params;
      const { status } = req.body;

      if (!sugID || !status) {
          return res.status(400).json({ error: 'Invalid request. Missing required fields.' });
      }

      const suggestionCollection = db.collection('suggestions');
      suggestionCollection.updateOne(
          { sug_id: parseInt(sugID) },
          { $set: { status } }
      );

      res.status(200).json({ message: 'Suggestion status updated successfully' });
  } catch (error) {
      console.error('Error updating suggestion status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Handle for reply suggestions
app.post('/replysuggestion/:sug_id', async (req, res) => {
  const { sug_id } = req.params;
  const { body, from } = req.body;

  if (!body || !from) {
    return res.status(400).json({ error: 'Invalid request. Missing required fields.' });
  }

  const suggestionCollection = db.collection('suggestions');
  const suggestion = await suggestionCollection.findOne({ sug_id: parseInt(sug_id) });
  if (!suggestion) {
    return res.status(404).json({ error: 'suggestion not found.' });
  }

  const reply = {
    body: body,
    from: parseInt(from),
    to: parseInt(suggestion.from),
    realsug_id: parseInt(sug_id),
  };

  const repliedsuggestionsCollection = db.collection('replied_suggestions');
  repliedsuggestionsCollection.insertOne(reply);

  res.status(200).json({ message: 'Reply added successfully' });
});

//Handled to see replies
app.get('/seereplies/:to', async (req, res) => {
  try {
    const {to}=req.params;
    console.log(to);
    const replyCollection = db.collection('replied_suggestions');
    const replies = await replyCollection.find({to:parseInt(to)}).toArray();
    res.json(replies);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Handles to authenticate moderator 
app.get('/moderator', async (req, res) => {
  try {
    const { email, pass } = req.query;
    const usersCollection=db.collection('moderators');
    // Your authentication logic goes here
    const user = await usersCollection.findOne({ email: email, pass: pass });

    if (user) {
      // User exists, send a success response with user details
      res.status(200).json({ userId: user.user_id, message: 'Moderator exists' });
    } else {
      // User does not exist, send a not found response
      res.status(404).json({ message: 'Moderator not found' });
    }
  } catch (error) {
    console.error('Error checking user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Hadnles to put unpublish request to the posts 
// Handle to Unpublish a Post
app.put('/posts/:id/unpublish', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    const postsCollection = db.collection('posts');
    const post = await postsCollection.findOne({ post_id: postId });

    if (!post) {
      throw new Error('Post not found.');
    }

    // Check if the post is already unpublished
    if (post.status === 'unpublished') {
      return res.status(400).json({ error: 'Post is already unpublished.' });
    }

    // Update the post status to 'unpublished'
    const result = await postsCollection.updateOne(
      { post_id: postId },
      { $set: { status: 'unpublished' } }
    );

    res.status(200).json({ message: 'Post unpublished successfully.' });
  } catch (error) {
    console.error('Error unpublishing post:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Handle to get Reported Post
app.get('/getusers', async (req, res) => {
  try {
    
    const reportedPostCollection = db.collection('users');
    const reportedPosts = await reportedPostCollection.find({}).toArray();
    res.json(reportedPosts);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update user status endpoint
app.put('/updatestatus/:userId', async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  try {
    const usersCollection=db.collection('users')
      // Update user status in the database
      const result = await usersCollection.updateOne({ user_id: parseInt(userId) }, { $set: { status } });

      if (result.modifiedCount > 0) {
          res.status(200).json({ message: 'User status updated successfully' });
      } else {
          res.status(404).json({ message: 'User not found' });
      }
  } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

//Handle to update posts 
app.put('/posts/:id/update', async (req, res) => {
  const postId = req.params.id;
  const {title,body} = req.body;
  console.log(postId);
  try {
    const result = await db.collection('posts').updateOne(
      { post_id: parseInt(postId)},
      { $set: { title: title, body: body }}
    );

    if (result.modifiedCount === 1) {
      res.status(200).json({ message: 'Post updated successfully' });
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Delete End point for my suggestion 
// Handle DELETE request to delete a suggestion by sug_id
app.delete('/suggestions/:sugId', async (req, res) => {
  try {
    const sugId = parseInt(req.params.sugId);
    const suggestionsCollection = db.collection('suggestions');
    
    // Find the suggestion by sug_id and delete it
    const deletedSuggestion = await suggestionsCollection.findOneAndDelete({ sug_id: sugId });

    if (deletedSuggestion.value) {
      res.status(200).json(deletedSuggestion.value);
    } else {
      res.status(404).send('Suggestion not found');
    }
  } catch (error) {
    console.error('Error deleting suggestion:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Handle PUT request to update the body of a suggestion by sug_id
app.put('/suggestions/:sugId', async (req, res) => {
  try {
    const sugId = parseInt(req.params.sugId);
    const { body } = req.body;
    const suggestionsCollection = db.collection('suggestions');
    
    // Find the suggestion by sug_id and update its body
    const updatedSuggestion = await suggestionsCollection.findOneAndUpdate(
      { sug_id: sugId },
      { $set: { body: body } },
      { returnDocument: 'after' }
    );

    if (updatedSuggestion.value) {
      res.status(200).json(updatedSuggestion.value);
    } else {
      res.status(404).send('Suggestion not found');
    }
  } catch (error) {
    console.error('Error updating suggestion body:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Handle PUT request to update the body of a comment by comment_id
app.put('/comments/:commentId', async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const { body } = req.body;
    const commentsCollection = db.collection('comments');
    
    // Find the comment by comment_id and update its body
    const updatedComment = await commentsCollection.findOneAndUpdate(
      { comment_id: commentId },
      { $set: { body: body } },
      { returnDocument: 'after' }
    );
      res.status(200).json(updatedComment.value);
  } catch (error) {
    console.error('Error updating comment body:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/commentlikes/:commentLikeId', async (req, res) => {
  try {
    const commentLikeId = req.params.commentLikeId;
    const commentLikesCollection = db.collection('commentlikes');

    // Assuming commentLikesCollection is your MongoDB collection for comment likes
    const deletedCommentLike = await commentLikesCollection.findOneAndDelete({ comment_like_id: commentLikeId });

    if (deletedCommentLike) {
      res.status(200).json(deletedCommentLike);
    } else {
      res.status(404).send('Comment like not found');
    }
  } catch (error) {
    console.error('Error deleting comment like:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/postlikes/:postLikeId', async (req, res) => {
  try {
    const postLikeId = req.params.postLikeId;
    const postLikesCollection = db.collection('postlikes');

    // Assuming postLikesCollection is your MongoDB collection for post likes
    const deletedPostLike = await postLikesCollection.findOneAndDelete({ post_like_id: postLikeId });

    if (deletedPostLike) {
      // Decrement the likeCount in the corresponding post
      const postId = deletedPostLike.value.post_id;
      const postsCollection = db.collection('posts');

      // Assuming postsCollection is your MongoDB collection for posts
      await postsCollection.updateOne(
        { post_id: postId },
        { $inc: { likeCount: -1 } }
      );

      res.status(200).json(deletedPostLike);
    } else {
      res.status(404).send('Post like not found');
    }
  } catch (error) {
    console.error('Error deleting post like:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const port = process.env.PORT || 8081;
app.listen(port, () => {
    console.log("Server started at port:", port);
});
