const { uuid } = require('uuidv4')
const express = require('express')
const cors = require('cors')
global.fetch = require('node-fetch');
const toxicity = require('@tensorflow-models/toxicity')
const tf = require('@tensorflow/tfjs');
const { model } = require('@tensorflow/tfjs');

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri, { useNewUrlParser: true });

client.on('open', () => {
    console.log('Connected to MongoDB');
});
client.connect();

const labelsToInclude = ['insult']
let threshold = 0.5;
global.toxicity_model = null;

(async() => {
    console.log("Loading ML Model...")
    global.toxicity_model = await toxicity.load(threshold, labelsToInclude)
    console.log("Loading complete...")
})().then(async()=>{

    async function getToxicity(text) {
        let classifications =  await toxicity_model.classify(text);
        console.log(classifications);
        let insult = classifications.filter(e => e["label"] == "insult")[0];
        return insult["results"][0]["probabilities"]["1"];
    }
const app = express()
const custUtils = require('./utils/utilityFuncs');
const errorViews = require('./Views/Errors')
const morgan = require('morgan');

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true })); 

app.use(morgan('combined'))

app.post("/api/articles/new" ,async(req, res) => {
    try {
        const payload = req.body;
        let hasAllKeys = custUtils.checkifhaskeys(payload, ["name", "duration", "age", "email", "title", "prof", "body"])
        if (!hasAllKeys) { res.send(errorViews.EntityMalformed("Required keys missing", null)); return;  }
        let tox = await getToxicity(payload["body"].replace(/<[^>]*>?/gm, ''));
        if (tox >= 0.5) {
            res.send(errorViews.Forbidded("You content seems to be toxic!"));
            return;
        }
        
        let oneInsert = await client.db("main").collection("arts").insertOne({...payload, "_id": uuid(), "timestamp": Date.now()});
        let insertedCount = oneInsert.result.ok;
        if (insertedCount < 1) {
            res.send(errorViews.Forbidded("Unable to insert!"));
            return;
        }
        
    } catch (e) {
        res.send(errorViews.EntityMalformed(`Error: ${e}`, null))
        return
    }
    res.send({code: 200, error: false, message: "Successfull!"})
})

app.get("/api/articles/popular", async(req, res) => {
    let entities = await client.db("main").collection("arts").find({}).toArray();
    entities.reverse();
    let payloadView = {
        data: entities.slice(0, 5),
    }
    res.send(payloadView)
})

app.get("/api/article", async(req, res) => {
    let {id} = req.query;
    let entities = await client.db("main").collection("arts").find({_id: id}).toArray();
    if (entities.length == 0) {
        res.sendStatus(404)
    } else {
        res.send({data: entities[0]})
    }

})

app.get("/api/articles", async(req, res) => {
    let {size, page} = req.query;
    page = parseInt(page); size = parseInt(size);

    if ((!page) || (!size)) {
        res.send(errorViews.EntityMalformed("paramets missing! page and size required!", null))
        return
    }
    let entities = await client.db("main").collection("arts").find({}).toArray();
    entities.sort((a, b) => {
        return b.timestamp - a.timestamp
    })

    let arr = entities.map( e => {
        try{delete e["body"]} catch(e) {}
        return e;
    })

    let hasNext = (page-1)*size < arr.length;
    let payloadView = {
        length: arr.length,
        page,
        size,
        pages: Math.ceil(arr.length/size),
        hasNext,
        data: arr.slice((page-1)*size, (page)*size),
    }

        res.send(payloadView)
    })

app.listen(8080, () => console.log("listening to port 8080..."))
}).catch(err => {
    console.log(`Error occured ${err}`)
})























// const uri = "mongodb+srv://main:Sx4gpcPG0CEEaelq@maincluster.jjjnn.mongodb.net/main?retryWrites=true&w=majority";
