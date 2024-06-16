const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
////////////////////
const port = process.env.PORT || 5000;
//<----middleware--->
const coresOptions = {
  origin: ['http://localhost:5173'],
  credentials: true,
  optionSuccessStatus: 200,
};
//............................//\
app.use(cors(coresOptions));
app.use(express.json());
// app.use(cookieParser());
//<---------------middleware--------------->//

app.get('/', (req, res) => {
  res.send('ActivePulse is running');
});

app.listen(port, () => {
  console.log(`active pulse is running on port ${port}`);
});
