const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// Replace '<your-connection-string>' with your actual MongoDB connection string
const connectionString = 'mongodb://localhost:27017';

// Create a new MongoClient
const client = new MongoClient(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to the MongoDB server
client.connect()
    .then(() => {
        console.log('Connected to MongoDB');
        // You can perform additional actions here if needed
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
    });

const app = express();
app.use(express.urlencoded({ extended: false }));
// Use cors middleware to enable cross-origin requests
app.use(cors());
app.use(express.json())
const filePath = path.join(__dirname, 'posts.json');
const posts = JSON.parse(fs.readFileSync(filePath, 'utf-8'));


const commentsFile = path.join(__dirname, 'comments.json');
const comments = JSON.parse(fs.readFileSync(commentsFile, 'utf-8'));
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
app.get('/', (req, res) => {
  try {
    // Assuming posts is some data you want to send as a response
    if (!posts) {
      // If posts is not defined or empty, throw an error
      throw new Error("No posts found.");
    }

    res.json(posts);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/createpost', (req, res) => {
  // Assuming the data you want to store is in req.body
  const {user_id,title,body,status,date,time} = req.body;
  const newData = {
    user_id: parseInt(user_id),
    title: title,
    body: body,
    post_id: posts.length+1,
    status:status,
    date:date,
    time:time
  }
  // Update your posts array with the new data
  posts.push(newData);
  console.log(newData);
  // Save the updated data to the MOCK_DATA.json file
  fs.writeFile(filePath, JSON.stringify(posts), (err) => {
    if (err) {
      console.error('Error writing to MOCK_DATA.json:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(200).send(newData);
    }
  });
});

// Handle GET request for comments data
app.get('/comments', (req, res) => {
  try {
    // Assuming posts is some data you want to send as a response
    if (!posts) {
      // If posts is not defined or empty, throw an error
      throw new Error("No posts found.");
    }

    res.json(comments);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/createcomment', (req, res) => {
  const { body, post_id, date } = req.body;

  const newData = {
    id: comments.length + 1,
    user_id: 1, // You might need to replace this with the actual user ID
    body: body,
    post_id: post_id,
    date: date,
  };

  comments.push(newData);

  fs.writeFile(commentsFile, JSON.stringify(comments), (err) => {
    if (err) {
      console.error('Error writing to comments.json:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(200).json(newData);
    }
  });
});


app.delete('/deletecomment/:id', (req, res) => {
  const commentId = parseInt(req.params.id);

  const index = comments.findIndex(comment => comment.id === commentId);

  if (index !== -1) {
    const deletedComment = comments.splice(index, 1)[0];

    fs.writeFile(commentsFile, JSON.stringify(comments), (err) => {
      if (err) {
        console.error('Error writing to comments.json:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.status(200).json(deletedComment);
      }
    });
  } else {
    res.status(404).send('Comment not found');
  }
});



app.delete('/deletepost/:id', (req, res) => {
  const pID = parseInt(req.params.id);

  const index = posts.findIndex(p => p.post_id === pID);

  if (index !== -1) {
    const deletedPost = posts.splice(index, 1)[0];
    console.log(deletedPost);
    fs.writeFile(filePath, JSON.stringify(posts), (err) => {
      if (err) {
        console.error('Error writing to comments.json:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.status(200).json(deletedPost);
      }
    });
  } else {
    res.status(404).send('Comment not found');
  }
});

app.listen(8081, () => {
  console.log('Server is running on port 8081');
});
