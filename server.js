const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const dbUrl = 'mongodb+srv://user:user@simple-chat-app.qqgxd.mongodb.net/simple-chat-app?retryWrites=true&w=majority';

let messages = [
    { name: 'Tim', message: 'Hi' },
    { name: 'Jane', message: 'Hello' }
];

app.get('/messages', (req, res) => {
    res.send(messages);
});

app.post('/messages', (req, res) => {
    messages.push(req.body);
    io.emit('message', req.body);
    res.sendStatus(200);
});

io.on('connection', (socket) => {
    console.log('a user connected');
});

mongoose.connect(dbUrl, (err) => {
    console.log('mongo db connection', err);
});

const server = http.listen(3000, () => {
    console.log('server is listening on port', server.address().port)
});