const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
////////////////////
const port = process.env.PORT || 5000;
//<----middleware--->
const coresOptions = {
  origin: ['http://localhost:5173'],
  // origin: ['https://bright-custard-f0624f.netlify.app'],
  credentials: true,
  optionSuccessStatus: 200,
};

//............................//
app.use(cors(coresOptions));
app.use(express.json());
// app.use(cookieParser());
//<---------------middleware END--------------->//

//<----------mongoDb----------->

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.va5jejf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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

    //<----------jwt related api---------->
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h',
      });
      res.send({ token });
    });
    //<----------jwt related api---------->

    //<--------middlewares----------->
    const verifyToken = (req, res, next) => {
      console.log('inside verify token', req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorize access' });
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'forbidden access' });
        }
        req.decoded = decoded;
        next();
      });
    };

    //<--------middlewares end----------->

    //<-------user related api--------->
    app.post('/users', async (req, res) => {
      const user = req.body;
      //insert email if user doesn't exists:
      //you can do this many ways (1. email unique 2. upsert 3. simple checking)
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    //<-------user related end--------->

    //<----------admin related api----------->
    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      if (email != req.decoded.email) {
        return res.status(403).send({ message: 'unauthorized access' });
      }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user.role === 'admin';
      }
      res.send({ admin });
    });
    //<----------admin related api end----------->

    //<----------use verify admin after verifyToken----------->
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
    //<----------verify admin end----------->

    ///////////////////////////////////////////////////////////////////////////////

    app.post('/newsLetter', async (req, res) => {
      const data = req.body;
      const result = await newsletterCollection.insertOne(data);
      res.send(result);
    });

    ////////////////////////////////
    app.get('/subcribeNewsLetter', async (req, res) => {
      const result = await newsletterCollection.find().toArray();
      res.send(result);
    });

    ///////////////////////////////////////////////////////////////////////////////

    //<-------all trainer  , verifyToken--------->
    app.get('/allTrainers', async (req, res) => {
      const query = { role: 'trainer' };
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });
    //<-------all trainer end--------->

    //<-------all trainer modifier------------->
    app.patch('/allTrainers/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = { $set: { role: 'member' } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    //<-------all trainer modifier end------------->

    //<--------------added class by admin---------------->
    app.post('/addedClass', async (req, res) => {
      const data = req.body;
      const result = await classCollection.insertOne(data);
      res.send(result);
    });
    //<--------------added class by admin end-------------->

    //<------------------apply for trainer----------------->
    app.get('/applyForTrainer', async (req, res) => {
      result = await applicationCollection.find().toArray();
      res.send(result);
    });
    //<------------------apply for trainer end----------------->

    //<------------------------aid code(apply trainer approve)----------------------->

    app.post('/confirmTrainer/:email', async (req, res) => {
      const email = req.params.email;
      console.log(email);
      result = await userCollection.updateOne(
        { email },
        { $set: { role: 'trainer' } }
      );
      await applicationCollection.deleteOne({ email });
      res.send(result);
    });

    //<------------------------aid code end((apply trainer approve))-------------------->

    //<--------------------applied For Trainer------------------------>
    app.get('/appliedForTrainer', async (req, res) => {
      const result = await applicationCollection.find().toArray();
      res.send(result);
    });

    //<--------------------Applied for trainer end-------------------->

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//<-------------mongoDb end------------->

app.get('/', (req, res) => {
  res.send('ActivePulse is running');
});

app.listen(port, () => {
  console.log(`active pulse is running on port ${port}`);
});

/**
 * --------------------------------
 *      NAMING CONVENTION
 * --------------------------------
 * app.get('/users')
 * app.get('/users/:id')
 * app.post('/users')
 * app.put('/users/:id')
 * app.patch('/users/:id')
 * app.delete('/users/:id')
 *
 */
////////////////////////////dumb//////////////////////////
