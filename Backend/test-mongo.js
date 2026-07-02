const mongoose = require('mongoose');

// The generic replica set name is often atlas-something-shard-0, but if we just omit replicaSet, it might work? Let's try.
const uri = "mongodb://sagarchauhan:Sagar420@cluster0-shard-00-00.o5c6l.mongodb.net:27017,cluster0-shard-00-01.o5c6l.mongodb.net:27017,cluster0-shard-00-02.o5c6l.mongodb.net:27017/?ssl=true&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(() => {
    console.log("Connected successfully using standard string");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection failed", err);
    process.exit(1);
  });
