const express = require('express');
const cors = require('cors');
require("dotenv").config();
const { ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

//middleware:-
app.use(cors())
app.use(express.json());




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.grqmol8.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect();

        const toysCollection = client.db("zooLand").collection("toys");
        const herosCollection = client.db("zooLand").collection("herosGallary");


        // creating index on the toy name field:
        const indexKeys = {name: 1};
        const indexOptions = {name: "toyName"};

        const result = await toysCollection.createIndex(indexKeys, indexOptions);

        app.get('/jobSearchByName/:text', async(req, res)=>{
            const searchText = req.params.text;
            const result = await toysCollection.find({
                $or: [
                    {name: {$regex : searchText, $options: "i"}}
                ]
            }).toArray()
            res.send(result)
        })




        //Read or show all data of  toys:-
        app.get('/allToys', async (req, res) => {
            const cursor = toysCollection.find()
            const result = await cursor.toArray();
            res.send(result)
        })

        //Read or show limited toys data:-
        app.get('/showToys', async (req, res) => {
            const cursor = toysCollection.find();
            const result = await cursor.limit(20).toArray();
            res.send(result)

        })


        //Read or show all data of heros and show in photo gallery:-
        app.get('/allHeors', async (req, res) => {
            const cursor = herosCollection.find()
            const result = await cursor.toArray();
            res.send(result)
        })


        app.get('/allToys/:category', async (req, res) => {
            if (req.params.category == "Marvel" || req.params.category == "Star-wars" || req.params.category == "Transformers") {
                const query = { sub_category: req.params.category };
                const result = await toysCollection.find(query).limit(4).toArray()
                console.log(result);
                return res.send(result)
            }

            // const cursor = toysCollection.find()
            // const result = await cursor.toArray();
            // res.send(result)
        })



        // Read or show toy data :-
        app.get('/toyDetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.findOne(query);
            res.send(result)
        })

        // get some data through email
        app.get('/myToys', async (req, res) => {

            const sort = parseInt(req.query.sort)


            let query = {};
            if (req.query?.sEmail) {
                query = { sEmail: req.query.sEmail }
            }

            const options = {
                sort: { "price": sort }
              }

            const result = await toysCollection.find(query).sort(options.sort).toArray()
            res.send(result)
        })



        // get some data of toys in update page
        app.get('/update/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const options = {
                projection: { price: 1, quantity: 1, details: 1 }
            };
            const result = await toysCollection.findOne(query, options)
            res.send(result)
        })






        // Create or add or insert new toys data:- 
        app.post('/addToys', async (req, res) => {
            const newServices = req.body;
            const result = await toysCollection.insertOne(newServices)
            res.send(result)
        })



        // Update existing toyss data :-

        // Receive data from UI:-
        app.put('/updateToys/:id', async (req, res) => {
            const id = req.params.id;
            const toys = req.body;

            //send update data to the database:-
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedToys = {
                $set: {
                    price: toys.price,
                    quantity: toys.quantity,
                    details: toys.details
                }
            }
            const result = await toysCollection.updateOne(filter, updatedToys, options);
            res.send(result);
        })






        // delete toy
        app.delete('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.deleteOne(query);
            res.send(result)
        })




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('Zoo Land sarver is running...')
})

app.listen(port, () => {
    console.log(`Zoo Land sarver is running ${port}`)
})