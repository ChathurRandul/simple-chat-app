const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const { sendStatus } = require('express/lib/response');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const dbUrl = 'mongodb+srv://user:user@simple-chat-app.qqgxd.mongodb.net/simple-chat-app?retryWrites=true&w=majority';

let Message = mongoose.model('Message', {
    name: String,
    message: String
});

app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages);
    });
});

app.post('/messages', (req, res) => {
    let message = new Message(req.body);

    message.save((err) => {
        if (err) sendStatus(500);

        Message.findOne({ message: 'badword' }, (err, censored) => {
            if (censored) {
                console.log('censored words found', censored);
                Message.remove({ _id: censored._id }, (err) => {
                    console.log('remove censored message');
                });
            }
        });

        io.emit('message', req.body);
        res.sendStatus(200);
    });
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