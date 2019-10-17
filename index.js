const express = require('express')
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
    mongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
        .then( client => {
            let db = client.db(dbName)
            let collection = db.collection(collectionName)
            collection.find({}).toArray()
                .then((docs) => {
                    return composeResponseJson(res, 200, true, 'Data retrieved successfully', docs)
                })
                .catch (err => {
                    console.log(err)
                    return composeResponseJson(res, 500, false, 'Error getting data from database.', [])
                })
                .finally( () => {
                    client.close()
                })
        }).catch( err => {
            console.log(err)
            return composeResponseJson(res, 500, false, 'Server error.', [])
        })
})

app.post('/dogs/:id/wins', (req, res) => {
    const id = req.params.id
    const regex = RegExp('[0-9a-f]{24}')
    if (regex.exec(id) === null) {
        return composeResponseJson(res, 400, false, 'Invalid winner ID.', [])
    }
    mongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
        .then( client => {
            const db = client.db(dbName)
            const collection = db.collection(collectionName)
            declareChampion(collection, id, function (result) {
                client.close()
                if (result.success === true) {
                    return composeResponseJson(res, 200, true, 'Dog victory recorded', [result.result.result])
                } else {
                    return composeResponseJson(res, 400, false, 'Not able to update record.', [])
                }
            })
        }).catch( err => {
            console.log(err)
            return composeResponseJson(res, 500, false, 'Server error.', [])
        })
})

const declareChampion = function (collection, id, callback) {
    const winnerID = ObjectId(id)
    collection.updateOne(
        {"_id": winnerID},
        {$inc: {"winCount": 1}})
        .then( result => {
            let success = false
            if (result.modifiedCount === 1) {
                    success = true
                }
            callback({
                success: success,
                result: result
            })
        }).catch( err => {
            return err
        })
}

function composeResponseJson(res, status, success, message, data) {
    return res.status(status).json({
        success: success,
        message: message,
        data: data
    })
}
