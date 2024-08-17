const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors())
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x8jkuyh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // await client.connect();
        const productCollection = client.db('BuyNow').collection('productCollection');


        // get api 
        app.get('/product', async (req, res) => {
            const search = req.query.search || '';
            const brand = req.query.brand || '';
            const category = req.query.category || '';
            const page = parseInt(req.query.page, 10) || 1;
            const sortValue = req.query.sort || 'Newest first';
            const minimum = req.query.minimum || ''
            const maximum = req.query.maximum || ''
            const limit = 10;
            // query for fiending data  use search brand and category
            const query = {};
            if (search) {
                query.product_name = { $regex: search, $options: "i" };
            }
            if (brand) {
                query.brand_name = { $regex: brand, $options: "i" };
            }
            if (category) {
                query.category = { $regex: category, $options: "i" };
            }
            if (minimum && maximum) {
                query.price = {
                    $gte: minimum,
                    $lte: maximum
                };
            }
            // sortValue hight lowest , oldest current 
            // let sort = { listing_date: -1 };
            if (sortValue === 'Low to High') {
                sort = { price_range: 1 };
            } else if (sortValue === 'High to Low') {
                sort = {price_range: -1 };
            } else if (sortValue === 'Newest first') {
                sort = { listing_date: -1 };
            } else if (sortValue === 'Oldest first') {
                sort = { listing_date: 1 };
            }

            const skip = (page - 1) * limit;

            try {
                const result = await productCollection.find(query).sort(sort).skip(skip).limit(limit).toArray();
                const totalProducts = await productCollection.countDocuments(query);

                res.json({
                    data: result,
                    currentPage: page,
                    totalPages: Math.ceil(totalProducts / limit),
                    totalProducts
                });

            } catch (error) {
                console.error('Error fetching products:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Business started');
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
