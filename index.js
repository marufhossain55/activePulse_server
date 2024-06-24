// const express = require('express');
// const cors = require('cors');
// const app = express();
// const jwt = require('jsonwebtoken');
// require('dotenv').config();
// const bodyParser = require('body-parser');
// app.use(bodyParser.json());
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// ////////////////////
// const port = process.env.PORT || 5000;
// //<----middleware--->
// const coresOptions = {
//   origin: ['http://localhost:5173'],
//   // origin: ['https://bright-custard-f0624f.netlify.app'],
//   credentials: true,
//   optionSuccessStatus: 200,
// };

// //............................//
// app.use(cors(coresOptions));
// app.use(express.json());
// // app.use(cookieParser());
// //<---------------middleware END--------------->//

// //<----------mongoDb----------->

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.va5jejf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// async function run() {
//   try {
//     const userCollection = client.db('activePulse').collection('users');
//     const newsletterCollection = client
//       .db('activePulse')
//       .collection('newsletter');
//     const classCollection = client.db('activePulse').collection('classes');

//     const applicationCollection = client
//       .db('activePulse')
//       .collection('appliedTrainers');

//     //<----------jwt related api---------->
//     app.post('/jwt', async (req, res) => {
//       const user = req.body;
//       const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
//         expiresIn: '1h',
//       });
//       res.send({ token });
//     });
//     //<----------jwt related api---------->

//     //<--------middlewares----------->
//     const verifyToken = (req, res, next) => {
//       console.log('inside verify token', req.headers.authorization);
//       if (!req.headers.authorization) {
//         return res.status(401).send({ message: 'unauthorize access' });
//       }
//       const token = req.headers.authorization.split(' ')[1];
//       jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//         if (err) {
//           return res.status(401).send({ message: 'forbidden access' });
//         }
//         req.decoded = decoded;
//         next();
//       });
//     };

//     //<--------middlewares end----------->

//     //<-------user related api--------->
//     app.post('/users', async (req, res) => {
//       const user = req.body;
//       //insert email if user doesn't exists:
//       //you can do this many ways (1. email unique 2. upsert 3. simple checking)
//       const query = { email: user.email };
//       const existingUser = await userCollection.findOne(query);
//       if (existingUser) {
//         return res.send({ message: 'user already exists', insertedId: null });
//       }
//       const result = await userCollection.insertOne(user);
//       res.send(result);
//     });
//     //<-------user related end--------->

//     //<----------admin related api----------->
//     app.get('/users/admin/:email', async (req, res) => {
//       const email = req.params.email;
//       if (email != req.decoded.email) {
//         return res.status(403).send({ message: 'unauthorized access' });
//       }
//       const query = { email: email };
//       const user = await userCollection.findOne(query);
//       let admin = false;
//       if (user) {
//         admin = user.role === 'admin';
//       }
//       res.send({ admin });
//     });
//     //<----------admin related api end----------->

//     //<----------use verify admin after verifyToken----------->
//     const verifyAdmin = async (req, res, next) => {
//       const email = req.decoded.email;
//       const query = { email: email };
//       const user = await userCollection.findOne(query);
//       const isAdmin = user?.role == 'admin';
//       if (!isAdmin) {
//         return res.status(403).send({ message: 'forbidden access' });
//       }
//       next();
//     };
//     //<----------verify admin end----------->

//     ///////////////////////////////////////////////////////////////////////////////

//     app.post('/newsLetter', async (req, res) => {
//       const data = req.body;
//       const result = await newsletterCollection.insertOne(data);
//       res.send(result);
//     });

//     ////////////////////////////////
//     app.get('/subcribeNewsLetter', async (req, res) => {
//       const result = await newsletterCollection.find().toArray();
//       res.send(result);
//     });

//     ///////////////////////////////////////////////////////////////////////////////

//     //<-------all trainer  , verifyToken--------->
//     app.get('/allTrainers', async (req, res) => {
//       const query = { role: 'trainer' };
//       const result = await userCollection.find(query).toArray();
//       res.send(result);
//     });
//     //<-------all trainer end--------->

//     //<-------all trainer modifier------------->
//     app.patch('/allTrainers/:id', async (req, res) => {
//       const id = req.params.id;
//       console.log(id);
//       const filter = { _id: new ObjectId(id) };
//       const updateDoc = { $set: { role: 'member' } };
//       const result = await userCollection.updateOne(filter, updateDoc);
//       res.send(result);
//     });
//     //<-------all trainer modifier end------------->

//     //<--------------added class by admin---------------->
//     app.post('/addedClass', async (req, res) => {
//       const data = req.body;
//       const result = await classCollection.insertOne(data);
//       res.send(result);
//     });
//     //<--------------added class by admin end-------------->

//     //<------------------apply for trainer----------------->
//     app.get('/applyForTrainer', async (req, res) => {
//       result = await applicationCollection.find().toArray();
//       res.send(result);
//     });
//     //<------------------apply for trainer end----------------->

//     //<------------------------aid code(apply trainer approve)----------------------->

//     app.post('/confirmTrainer/:email', async (req, res) => {
//       const email = req.params.email;
//       console.log(email);
//       result = await userCollection.updateOne(
//         { email },
//         { $set: { role: 'trainer' } }
//       );
//       await applicationCollection.deleteOne({ email });
//       res.send(result);
//     });

//     //<------------------------aid code end((apply trainer approve))-------------------->

//     //<--------------------applied For Trainer------------------------>
//     app.get('/appliedForTrainer', async (req, res) => {
//       const result = await applicationCollection.find().toArray();
//       res.send(result);
//     });

//     //<--------------------Applied for trainer end-------------------->

//     // Connect the client to the server	(optional starting in v4.7)
//     // await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db('admin').command({ ping: 1 });
//     console.log(
//       'Pinged your deployment. You successfully connected to MongoDB!'
//     );
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// run().catch(console.dir);

// //<-------------mongoDb end------------->

// app.get('/', (req, res) => {
//   res.send('ActivePulse is running');
// });

// app.listen(port, () => {
//   console.log(`active pulse is running on port ${port}`);
// });

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
    const slotCollection = client.db('activePulse').collection('slots');
    const trainerCollection = client.db('activePulse').collection('trainers');
    const trainerApplicationCollection = client
      .db('activePulse')
      .collection('trainerApplications');
    const bookingCollection = client.db('activePulse').collection('bookings');

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

    app.get('/appliedForTrainer', async (req, res) => {
      const result = await applicationCollection.find().toArray();
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
    // Get all trainers
    app.get('/api/trainers', async (req, res) => {
      try {
        const trainers = await trainerCollection.find().toArray();
        res.json(trainers);
      } catch (error) {
        res
          .status(500)
          .json({ message: 'Error fetching trainers', error: error.message });
      }
    });

    // Get a specific trainer
    app.get('/api/trainers/:id', async (req, res) => {
      try {
        const trainer = await trainerCollection.findOne({
          _id: new ObjectId(req.params.id),
        });
        if (!trainer) {
          return res.status(404).json({ message: 'Trainer not found' });
        }
        res.json(trainer);
      } catch (error) {
        res.status(500).json({
          message: 'Error fetching trainer details',
          error: error.message,
        });
      }
    });

    // Submit an application to become a trainer
    app.post('/api/become-trainer', async (req, res) => {
      try {
        const result = await trainerApplicationCollection.insertOne(req.body);
        res.status(201).json({
          message: 'Application submitted successfully',
          id: result.insertedId,
        });
      } catch (error) {
        res.status(500).json({
          message: 'Error submitting application',
          error: error.message,
        });
      }
    });

    // Get details of a specific slot
    app.get('/api/slots/:trainerId/:slotId', async (req, res) => {
      try {
        const slot = await slotCollection.findOne({
          _id: new ObjectId(req.params.slotId),
          trainerId: new ObjectId(req.params.trainerId),
        });
        if (!slot) {
          return res.status(404).json({ message: 'Slot not found' });
        }
        res.json(slot);
      } catch (error) {
        res.status(500).json({
          message: 'Error fetching slot details',
          error: error.message,
        });
      }
    });

    // Book a specific slot
    app.post('/api/book/:trainerId/:slotId', async (req, res) => {
      try {
        // Check if the slot is available
        const slot = await slotCollection.findOne({
          _id: new ObjectId(req.params.slotId),
          trainerId: new ObjectId(req.params.trainerId),
          isBooked: false,
        });

        if (!slot) {
          return res.status(400).json({ message: 'Slot is not available' });
        }

        // Create the booking
        const booking = {
          trainerId: new ObjectId(req.params.trainerId),
          slotId: new ObjectId(req.params.slotId),
          userId: req.body.userId, // Assuming you're passing the user ID in the request body
          bookingDate: new Date(),
        };

        const result = await bookingCollection.insertOne(booking);

        // Update the slot to mark it as booked
        await slotCollection.updateOne(
          { _id: new ObjectId(req.params.slotId) },
          { $set: { isBooked: true } }
        );

        res
          .status(201)
          .json({ message: 'Booking confirmed', id: result.insertedId });
      } catch (error) {
        res
          .status(500)
          .json({ message: 'Error booking slot', error: error.message });
      }
    });
    /////////////////////////////////////////////////////////////////

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
