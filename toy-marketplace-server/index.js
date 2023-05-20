const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;


// middleware

app.use(cors())
app.use(express.json())

app.get('/', (req, res)=>{
    res.send('toy server is running......')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fudiykq.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();


    const categoryDataCollection = client.db('toyMarketplace').collection('categoryData');
// find all  data
    app.get('/allToys', async(req, res)=>{
        const cursor = categoryDataCollection.find().limit(20);
        const result = await cursor.toArray();
        res.send(result);
    })
// find category title base  data
    app.get('/category/:title', async(req, res)=>{
        const title= req.params.title;
        const query = {category : title}
        const result = await categoryDataCollection.find(query).limit(4).toArray();
        res.send(result)
    })
// show details data get
    app.get('/shopDetails/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id  : new ObjectId(id)};
        const result = await categoryDataCollection.findOne(query);
        res.send(result)
    })

    // find my toys data

    app.get('/myToys/:email', async(req, res)=>{
      const email = req.params.email;
      const query = {email : email}
      const result = await categoryDataCollection.find(query).toArray();
      res.send(result)
    })

        // search by name

        const indexKeys = {name : 1}
        const indexOptions = {search  : "nameSearch"}
    
        const result = await categoryDataCollection.createIndex(indexKeys , indexOptions)
    
        app.get("/searchByName/:text", async (req, res) => {
          const text = req.params.text;
          const result = await categoryDataCollection
            .find({
              $or: [
                { name: { $regex: text, $options: "i" }}
              ],
            })
            .toArray();
          res.send(result);
        });
    //  new data post

    app.post('/addAToy' , async(req, res)=>{
        const body = req.body
        const result = await categoryDataCollection.insertOne(body)
        res.send(result)
    })


    // delete a toy

    app.delete('/myToys/toyRemove/:id' , async(req, res)=>{
      const id = req.params.id
      const query = {_id : new ObjectId(id) }
      const result = await categoryDataCollection.deleteOne(query)
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


app.listen(port, ()=>{
    console.log(`toy server is running on port : ${port}`);
})
