const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const mongoose = require('mongoose')
const { sendStatus } = require('express/lib/response')
const res = require('express/lib/response')

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

mongoose.Promise = Promise

const dbUrl = 'mongodb://localhost/simple-chat-app'

let Message = mongoose.model('Message', {
    name: String,
    message: String
})

app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages)
    })
})

app.get('/messages/:user', (req, res) => {
    let user = req.params.user
    Message.find({ name: user }, (err, messages) => {
        res.send(messages)
    })
})

app.post('/messages', async (req, res) => {

    try {
        let message = new Message(req.body)

        let savedMessage = await message.save()
        console.log('saved')
        let censored = await Message.findOne({ message: 'badword' })

        if (censored)
            await Message.remove({ _id: censored._id })

        else
            io.emit('message', req.body)
        res.sendStatus(200)

    } catch (error) {

        res.sendStatus(500)
        return console.error(error)
    } finally {
        console.log('message post called')
    }
})

io.on('connection', (socket) => {
    console.log('a user connected')
})

mongoose.connect(dbUrl, (err) => {
    console.log('mongo db connection', err)
})

const server = http.listen(3000, () => {
    console.log('server is listening on port', server.address().port)
})