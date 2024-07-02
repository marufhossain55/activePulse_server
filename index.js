// /**
//  * --------------------------------
//  *      NAMING CONVENTION
//  * --------------------------------
//  * app.get('/users')
//  * app.get('/users/:id')
//  * app.post('/users')
//  * app.put('/users/:id')
//  * app.patch('/users/:id')
//  * app.delete('/users/:id')
//  *
//  */
// ////////////////////////////dumb//////////////////////////

const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;

const corsOptions = {
  origin: ['http://localhost:5173'],
  // origin: ['https://bright-custard-f0624f.netlify.app'],
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.va5jejf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const userCollection = client.db('activePulse').collection('users');
    const newsletterCollection = client
      .db('activePulse')
      .collection('newsletter');
    const classCollection = client.db('activePulse').collection('classes');
    const applicationCollection = client
      .db('activePulse')
      .collection('appliedTrainers');
    const rejectionCollection = client
      .db('activePulse')
      .collection('rejection');
    const slotCollection = client.db('activePulse').collection('slots');
    const trainerCollection = client.db('activePulse').collection('trainers');
    const trainerApplicationCollection = client
      .db('activePulse')
      .collection('trainerApplications');
    const bookingCollection = client.db('activePulse').collection('bookings');
    const postsCollection = client.db('activePulse').collection('posts');
    const voteCollection = client.db('activePulse').collection('vote');

    //jwt related api
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h',
      });
      res.send({ token });
    });

    // const verifyToken = (req, res, next) => {
    //   if (!req.headers.authorization) {
    //     return res.status(401).send({ message: 'unauthorized access' });
    //   }
    //   const token = req.headers.authorization.split(' ')[1];
    //   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    //     if (err) {
    //       return res.status(401).send({ message: 'forbidden access' });
    //     }
    //     req.decoded = decoded;
    //     next();
    //   });
    // };
    const verifyToken = (req, res, next) => {
      // console.log('inside verify token', req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access' });
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'unauthorized access' });
        }
        req.decoded = decoded;
        next();
      });
    };

    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    //<------------------------------------------------->
    // app.get('/users/admin/:email', verifyToken, async (req, res) => {
    //   const email = req.params.email;
    //   if (email != req.decoded.email) {
    //     return res.status(403).send({ message: 'unauthorized access' });
    //   }
    //   const query = { email: email };
    //   const user = await userCollection.findOne(query);
    //   let admin = false;
    //   if (user) {
    //     admin = user?.role === 'admin';
    //   }
    //   res.send({ admin });
    // });

    //-------------------forum post------------------->

    app.post('/forumData', async (req, res) => {
      const data = req.body;
      const { email } = data;
      console.log(email);

      // const result = await postsCollection.insertOne(data);
      try {
        const UserRole = await userCollection.findOne({ email });

        const { role } = UserRole;
        const dataPost = await postsCollection.insertOne({ ...data, role });
        res.send(dataPost);
      } catch (error) {
        console.log(error);
      }
    });

    //-----------------------------------/
    app.get('/forumPost', async (req, res) => {
      const result = await postsCollection.find().toArray();
      res.send(result);
    });

    //-----------------------------------/

    // forum post

    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;

      // if (email !== req.decoded.email) {
      //   return res.status(403).send({ message: 'forbidden access' });
      // }

      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === 'admin';
      }
      res.send({ admin });
    });

    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role == 'admin';
      if (!isAdmin) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      next();
    };
    //<------------------------------------------>
    app.get('/users/trainer/:email', async (req, res) => {
      const email = req.params.email;
      // if (email != req.decoded.email) {
      //   return res.status(403).send({ message: 'unauthorized access' });
      // }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let trainer = false;
      if (user) {
        trainer = user.role === 'trainer';
      }
      res.send({ trainer });
    });

    const verifyTrainer = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isTrainer = user?.role == 'trainer';
      if (!isTrainer) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      next();
    };
    //<------------------------------------------>
    app.get('/users/member/:email', async (req, res) => {
      const email = req.params.email;
      // if (email != req.decoded.email) {
      //   return res.status(403).send({ message: 'unauthorized access' });
      // }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let member = false;
      if (user) {
        member = user.role === 'member';
      }
      res.send({ member });
    });

    const verifyMember = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isMember = user?.role == 'member';
      if (!isMember) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      next();
    };
    //<------------------------------------------>
    app.post('/newsLetter', async (req, res) => {
      const data = req.body;
      const result = await newsletterCollection.insertOne(data);
      res.send(result);
    });

    app.get('/subcribeNewsLetter', async (req, res) => {
      const result = await newsletterCollection.find().toArray();
      res.send(result);
    });

    app.get('/allTrainers', async (req, res) => {
      const query = { role: 'trainer' };
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });

    app.patch('/allTrainers/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = { $set: { role: 'member' } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.post('/addedClass', async (req, res) => {
      const data = req.body;
      const result = await classCollection.insertOne(data);
      res.send(result);
    });
    app.get('/addedClass', async (req, res) => {
      const result = await classCollection.find().toArray();
      res.send(result);
    });

    app.get('/applyForTrainer', async (req, res) => {
      const result = await applicationCollection.find().toArray();
      res.send(result);
    });

    app.post('/confirmTrainer/:email', async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.updateOne(
        { email },
        { $set: { role: 'trainer' } }
      );
      await applicationCollection.deleteOne({ email });
      res.send(result);
    });

    app.post('/rejectTrainer/:email', async (req, res) => {
      const email = req.params.email;
      const result = await applicationCollection.deleteOne({ email });
      res.send(result);
    });

    app.get('/appliedForTrainer', async (req, res) => {
      const result = await applicationCollection.find().toArray();
      res.send(result);
    });
    app.post('/appliedForTrainer', async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await applicationCollection.insertOne(data);
      res.send(result);
    });

    // New Endpoint to Get Trainer Data
    app.get('/getTrainerData', verifyToken, async (req, res) => {
      const email = req.decoded.email;
      const trainer = await userCollection.findOne({ email });
      if (!trainer) {
        return res.status(404).send({ message: 'Trainer not found' });
      }
      res.send(trainer);
    });

    // New Endpoint to Get Classes
    app.get('/getClasses', verifyToken, async (req, res) => {
      const result = await classCollection.find().toArray();
      res.send(result);
    });

    // New Endpoint to Add New Slot
    app.post('/addNewSlot', verifyToken, async (req, res) => {
      const { slotName, slotTime, days, classes } = req.body;
      const email = req.decoded.email;
      const result = await slotCollection.insertOne({
        slotName,
        slotTime,
        days,
        classes,
        trainerEmail: email,
      });
      res.send(result);
    });

    app.get('/getAllSlots', verifyToken, async (req, res) => {
      try {
        const slots = await slotCollection.find().toArray();
        res.send(slots);
      } catch (error) {
        console.error('Error fetching slots:', error);
        res.status(500).send({ message: 'Internal server error' });
      }
    });

    // Delete a slot by ID
    app.delete('/deleteSlot/:id', async (req, res) => {
      // const { slotId } = req.params;
      const id = req.params.id;
      console.log(id);
      try {
        const result = await slotCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 1) {
          res.send({
            message: 'Slot deleted successfully',
            deletedCount: result.deletedCount,
          });
        } else {
          res.status(404).send({ message: 'Slot not found' });
        }
      } catch (error) {
        console.error('Error deleting slot:', error);
        res.status(500).send({ message: 'Internal server error' });
      }
    });

    // Get slot info including booked details
    app.get('/getSlotInfo/:slotId', verifyToken, async (req, res) => {
      const { slotId } = req.params;
      try {
        const slot = await slotCollection.findOne({ _id: ObjectId(slotId) });
        if (!slot) {
          return res.status(404).send({ message: 'Slot not found' });
        }
        // Implement logic to fetch booked details if needed
        res.send(slot);
      } catch (error) {
        console.error('Error fetching slot info:', error);
        res.status(500).send({ message: 'Internal server error' });
      }
    });

    /////////////////////////////////////////////////////////////////
    app.get('/trainers', async (req, res) => {
      const result = await trainerCollection.find().toArray();
      res.send(result);
    });
    app.get('/trainers/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      console.log(query);
      const result = await trainerCollection.find(query).toArray();
      res.send(result);
    });

    /////////////////////////////////////////////////////////////////

    ////////////////////////////forums/////////////////////////////////////
    app.get('/posts', async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 6;
      const skip = (page - 1) * limit;

      try {
        const posts = await postsCollection
          .collection('posts')
          .find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray();
        console.log(posts);

        const totalPosts = await postsCollection
          .collection('posts')
          .countDocuments();
        const totalPages = Math.ceil(totalPosts / limit);

        res.json({
          posts,
          currentPage: page,
          totalPages,
        });
      } catch (error) {
        res.status(500).json({ error: 'Error fetching posts' });
      }
    });

    // Handle votes
    app.post('/vote', async (req, res) => {
      const { postId, voteType } = req.body;
      const userId = req.user ? req.user.id : 'anonymous';

      try {
        const post = await db
          .collection('posts')
          .findOne({ _id: ObjectId(postId) });
        if (!post) {
          return res
            .status(404)
            .json({ success: false, error: 'Post not found' });
        }

        let updateOperation;
        if (voteType === 'up') {
          updateOperation = {
            $inc: { votes: 1 },
            $set: { [`userVotes.${userId}`]: 'up' },
          };
        } else if (voteType === 'down') {
          updateOperation = {
            $inc: { votes: -1 },
            $set: { [`userVotes.${userId}`]: 'down' },
          };
        } else if (voteType === 'none') {
          const currentVote = post.userVotes[userId];
          updateOperation = {
            $inc: { votes: currentVote === 'up' ? -1 : 1 },
            $unset: { [`userVotes.${userId}`]: '' },
          };
        }

        const result = await voteCollection
          .collection('posts')
          .findOneAndUpdate({ _id: ObjectId(postId) }, updateOperation, {
            returnDocument: 'after',
          });

        res.json({
          success: true,
          postId,
          newVoteCount: result.value.votes,
          userVote: result.value.userVotes[userId] || null,
        });
      } catch (error) {
        res
          .status(500)
          .json({ success: false, error: 'Error processing vote' });
      }
    });

    ///////////////reject trainer/////////////

    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('ActivePulse is running');
});

app.listen(port, () => {
  console.log(`ActivePulse is running on port ${port}`);
});

// Get posts with pagination
