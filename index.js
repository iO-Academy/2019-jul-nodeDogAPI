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

app.post('/dogs/:id/wins', (req, res) => {
    const id = req.param('id')
    const regex = RegExp('[0-9a-f]{24}')
    if (regex.exec(id) === null) {
        return res.status(400).json({
            success: false,
            message: 'Invalid winner ID.',
            data: []
        })
    }
    mongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error connecting to database.',
                data: []
            })
        }
        const db = client.db(dbName)
        const collection = db.collection(collectionName)
        try {
            declareChampion(collection, id, client, function (result) {
                if (result.success === true) {
                    res.status(200).json({
                        success: true,
                        message: 'Your choice has been received and the database has been updated.',
                        data: [result.result.result]
                    })
                } else {
                    res.status(400).json({
                        success: false,
                        message: 'Not able to update records.',
                        data: []
                    })
                }
            })
        }
        catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Failure attempting to update records.',
                data: []
            })
        }
    })
})

const declareChampion = function (collection, id, client, callback) {
    const winnerID = ObjectId(id)
    try {
        collection.updateOne(
            {"_id": winnerID},
            {$inc: {"winCount": 1}},
            function (err, result) {
                if (result.modifiedCount === 0){
                    console.log('No entries modified!')
                    callback({
                        success: false,
                        result: result
                    })
                } else {
                    console.log('Database has been updated')
                    callback({
                        success: true,
                        result: result
                    })
                }
                client.close()
            }
        )
    }
    catch (err) {
        console.log(err)
    }
}
