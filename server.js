const express = require('express');
const app = express();
const http = require('http');
const WebSocket = require('ws');
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);

        ws.send(`${message}`);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

app.use(express.static('D:/Screen_Face/bot_eyes'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.get('/index.js', (req, res) => {
    res.sendFile(__dirname + '/index.js');
});

server.listen(9090, () => {
    console.log('listening on port 9090');
})