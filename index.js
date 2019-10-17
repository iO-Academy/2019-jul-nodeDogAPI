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
            client.close()
            return composeJSON(res, 500, false, 'Error connecting to database.', [])
        }
        let db = client.db(dbName)
        let collection = db.collection(collectionName)
        collection.find({}).toArray((err, docs) => {
            if (err) {
                client.close()
                return composeJSON(res, 500, false, 'Error getting data from database.', [])
            } else {
                client.close()
                return composeJSON(res, 200, true, 'Data retrieved successfully', docs)
            }
        })
    })
})

app.post('/dogs/:id/win', (req, res) => {
    const id = req.param('id')
    const regex = RegExp('[0-9a-f]{24}')
    if (regex.exec(id) === null) {
        return composeJSON(res, 400, false, 'Invalid winner ID.', [])
    }
    mongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
        if (err) {
            client.close()
            return composeJSON(res, 500, false, 'Error connecting to database.', [])
        }
        const db = client.db(dbName)
        const collection = db.collection(collectionName)
        try {
            declareChampion(collection, id, function (result) {
                if (result.success === true) {
                    client.close()
                    return composeJSON(res, 200, true, 'Dog victory recorded', [result.result.result])
                } else {
                    client.close()
                    return composeJSON(res, 400, false, 'Not able to update records.', [])
                }
            })
        }
        catch (err) {
            client.close()
            return composeJSON(res, 500, false, 'Failure attempting to update records.', [])
        }
    })
})

const declareChampion = function (collection, id, callback) {
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
            }
        )
    }
    catch (err) {
        console.log(err)
    }
}

function composeJSON(res, status, success, message, data) {
    return res.status(status).json({
        success: success,
        message: message,
        data: data
    })
}