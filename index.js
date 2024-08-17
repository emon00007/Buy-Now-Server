const  express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT||5000

// middleware
app.use(cors());
app.use (express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x8jkuyh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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


    const productCollection= client.db('BuyNow').collection('productCollection')

    // app.get('/product',async(req,res)=>{
    //     const result =await productCollection.find().toArray();
    //     res.send(result)
    // })

    // app.get('/product',async(req,res)=>{
    //     const result = await productCollection.find().toArray();
    //     res.send(result);
    // })

    // app.get('/product', async (req, res) => {
    //     try {
    //         const page = parseInt(req.query.page) || 1;
    //         const search = req.query.search || "";
    //         const sortValue = req.query.sort || "";
    //         const brand = req.query.brand || "";
    //         const category = req.query.category || "";
    //         const minimum = parseFloat(req.query.minimum) || 0;
    //         const maximum = parseFloat(req.query.maximum) || Number.MAX_VALUE;
    //         const limit = 11;
        
    //         const query = {};
        
    //         if (search) {
    //             query.productName = { $regex: search, $options: "i" };
    //         }
        
    //         if (brand) {
    //             query.brand = { $regex: brand, $options: "i" };
    //         }
        
    //         if (category) {
    //             query.category = { $regex: category, $options: "i" };
    //         }
        
    //         if (!isNaN(minimum) || !isNaN(maximum)) {
    //             query.price = {
    //                 $gte: minimum,
    //                 $lte: maximum
    //             };
    //         }
        
    //         let sort = { createdAt: -1 }; 
    //         if (sortValue === 'Low to High') {
    //             sort = { price: 1, createdAt: -1 };
    //         } else if (sortValue === 'High to Low') {
    //             sort = { price: -1, createdAt: -1 };
    //         }
        
    //         const skip = (page - 1) * limit;
    //         const result = await productCollection.find(query).sort(sort).skip(skip).limit(limit).toArray();
    //         const totalProducts = await productCollection.countDocuments(query);
        
    //         res.send({
    //             data: result,
    //             currentPage: page,
    //             totalPages: Math.ceil(totalProducts / limit),
    //             totalProducts
    //         });
    //     } catch (error) {
    //         console.error("Error fetching products:", error);
    //         res.status(500).send({ error: "An error occurred while fetching products." });
    //     }
    // });
    app.get('/product', async (req, res) => {
        const { brand, category, minPrice, maxPrice } = req.query;
    
        const query = {};
    
        if (brand) {
            query.brand_name = { $in: brand.split(',') };
        }
        if (category) {
            query.category_name = { $in: category.split(',') };
        }
        if (minPrice && maxPrice) {
            query.price = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
        }
    
        try {
            const count = await productCollection.countDocuments(query);
            res.send({ count });
        } catch (error) {
            res.status(500).send({ error: 'Error fetching count' });
        }
    });

    app.get('/pagination', async (req, res) => {
        const size = parseInt(req.query.size);
        const page = parseInt(req.query.page) - 1;
    
        // Filters
        const { brand, category, minPrice, maxPrice, filter } = req.query;
    
        const query = {};
    
        if (brand) {
            query.brand_name = { $in: brand.split(',') };
        }
    
        if (category) {
            query.category_name = { $in: category.split(',') };
        }
    
        if (minPrice && maxPrice) {
            query.price = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
        }
    
        if (filter) {
            query.name = { $regex: filter, $options: 'i' }; // Case-insensitive searc
        }
    
        try {
            // Fetch paginated and filtered data
            const items = await productCollection.find(query)
                .skip(page * size)
                .limit(size)
                .toArray();
    
            // Get the total count for pagination
            const totalCount = await productCollection.countDocuments(query);
    
            // Send both items and totalCount as a response
            res.send({ products: items, totalCount });
        } catch (error) {
            res.status(500).send({ error: 'Error fetching products' });
        }
    });

    

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req, res)=>{
    res.send('business started')
})

app.listen(port,()=>{
    console.log(`business started on port ${port}`);
})