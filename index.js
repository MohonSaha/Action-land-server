const express = require('express');
const cors = require('cors');
require("dotenv").config();
const { } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

//middleware:-
app.use(cors())
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Zoo Land sarver is running...')
})

app.listen(port, () => {
  console.log(`Zoo Land sarver is running ${port}`)
})