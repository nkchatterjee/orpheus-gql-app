const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');
const cors = require('cors');
const NetworkConstructor = require('./orpheus/ping');
const reqTracker = require('./orpheus/trackResolver');
const dataPoints = require('./orpheus/dataPoints');
require('dotenv').config();
const app = express();

// allow cross-origin requests
app.use(cors());

mongoose.connect(process.env.DB_HOST, { useNewUrlParser: true })

mongoose.connection.once('open', () => {
  console.log('connected to database');
})

let netStats = new NetworkConstructor();

// when someone goes to below route, express will look and see that you want to interact with graphQL. the control of this request will be hand-offed to the middleware. (graphqlHTTP)
// need a schema to be created and passed into middleware function; to describe how the data on our graph will look
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true // set this to be true so we can use graphiql on our local host
}));

app.get('/resolvers', (req, res) => { res.json(resolverCounter) })

app.get('/requests', (req, res) => { res.json(reqTracker) })

app.get('/reset', (req, res) => { 
  reqTracker.reset();
  res.json(reqTracker);
})

app.get('/netStats', (req, res)=>{
  res.json(netStats)
})

let resolverCounter = schema.resolverCounter;

setInterval(function () { 
  netStats.ping();
  console.log(netStats.history);
}, 3000);

app.listen(3500, () => {
  console.log('now listening for requests on port 3500')
});
