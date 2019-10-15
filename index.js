const express = require('express')
const jsonParser = require('body-parser').json()
const mongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId
const cors = require('cors')

const app = express()
const port = 3000
app.listen(port, () => console.log(`Hot Dog API listening on ${port}`))
app.use(cors())

const mongoUrl = 'mongodb://localhost:27017/'
const dbName = 'hot-dog'
const collectionName = 'dogs'

app.get('/dogs', (req, res) => {
    mongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error connecting to database.',
                data: []
            })
        }
        let db = client.db(dbName)
        let collection = db.collection(collectionName)
        collection.find({}).toArray((err, docs) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error getting data from database.',
                    data: []
                })
            }
            res.status(200).json({
                success: true,
                message: 'Data has been successfully retrieved and sent.',
                data: docs
            })
            client.close()
        })
    })
})

app.put('/dogs', jsonParser, (req, res) => {
    mongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error conencting to database.',
                data: []
            })
        }
        let db = client.db(dbName)
        console.log(req.body.winnerID)
        declareChampion(db, req.body, function (result) {
            res.status(200).json({
                success: true,
                message: 'Your selection has been.....noted.',
                data: result
            })
        })
    })
})

const declareChampion = function (db, details, callback) {
    var collection = db.collection(collectionName)
    newCount = details.winCount + 1
    collection.updateOne(
        {"_id": details.winnerID},
        {$set: {"winCount": newCount}},
        function (err, result) {
            console.log('I have made your dog......A WINNER!')
            callback(result)
    })
}
