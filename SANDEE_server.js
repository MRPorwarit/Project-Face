const express = require('express');
const app = express();
const http = require('http');
const WebSocket = require('ws');
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const fs = require('fs')

const { Server } = require('socket.io');
const { disconnect } = require('process');
const io = new Server(server);
wss.on('connection', (ws) => {
    // console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);

        ws.send(`${message}`);
    });

    ws.on('close', () => {
        // console.log('Client disconnected');
    });
});

io.on('connection', (socket) => {
    console.log('a user connect socket io');
    socket.on('message', async (message) => {
        console.log(`Received: ${message}`);
        const path = await createWav(message)
        console.log(path)
        stt(filePath);

    });
    socket.on('disconnect', () => {
        console.log('a user disconnect socket io')
    })
})

app.use(express.static('D:/Screen_Face/bot_eyes'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/SANDEE_index.html');
});
// app.get('/style.css', (req, res) => {
//     res.sendFile(__dirname + '/style.css');
// });
app.get('/mic-recorder.js', (req, res) => {
    res.sendFile(__dirname + '/SANDEE_index.js');
});
app.post('/', async (req, res) => {
    // const path = await createWav(req.body)
    console.log(req.body)
})
server.listen(9090, () => {
    console.log('listening on port 9090');
})

socket.on('message', (data) => {
    console.log(data);
});


async function createWav(data) {
    var audioSize = data.byteLength;
    var sampleRateInHz = 8000;
    var bitDepth = 16;
    var channels = 1;
    var byteRate = (sampleRateInHz * bitDepth * channels) / 8;
    var totalDataLen = audioSize + 36;
    var header = new Int8Array(44);
    header[0] = 'R'.charCodeAt(0);  // RIFF/WAVE header
    header[1] = 'I'.charCodeAt(0);
    header[2] = 'F'.charCodeAt(0);
    header[3] = 'F'.charCodeAt(0);
    header[4] = (totalDataLen & 0xff);
    header[5] = ((totalDataLen >> 8) & 0xff);
    header[6] = ((totalDataLen >> 16) & 0xff);
    header[7] = ((totalDataLen >> 24) & 0xff);
    header[8] = 'W'.charCodeAt(0);
    header[9] = 'A'.charCodeAt(0);
    header[10] = 'V'.charCodeAt(0);
    header[11] = 'E'.charCodeAt(0);
    header[12] = 'f'.charCodeAt(0);  // 'fmt ' chunk
    header[13] = 'm'.charCodeAt(0);
    header[14] = 't'.charCodeAt(0);
    header[15] = ' '.charCodeAt(0);
    header[16] = 16;  // 4 bytes: size of 'fmt ' chunk
    header[17] = 0;
    header[18] = 0;
    header[19] = 0;
    header[20] = 1;  // format = 1
    header[21] = 0;
    header[22] = channels;
    header[23] = 0;
    header[24] = (sampleRateInHz & 0xff);
    header[25] = ((sampleRateInHz >> 8) & 0xff);
    header[26] = ((sampleRateInHz >> 16) & 0xff);
    header[27] = ((sampleRateInHz >> 24) & 0xff);
    header[28] = (byteRate & 0xff);
    header[29] = ((byteRate >> 8) & 0xff);
    header[30] = ((byteRate >> 16) & 0xff);
    header[31] = ((byteRate >> 24) & 0xff);
    header[32] = (2 * 16 / 8);  // block align
    header[33] = 0;
    header[34] = 16;  // bits per sample
    header[35] = 0;
    header[36] = 'd'.charCodeAt(0);
    header[37] = 'a'.charCodeAt(0);
    header[38] = 't'.charCodeAt(0);
    header[39] = 'a'.charCodeAt(0);
    header[40] = (audioSize & 0xff);
    header[41] = ((audioSize >> 8) & 0xff);
    header[42] = ((audioSize >> 16) & 0xff);
    header[43] = ((audioSize >> 24) & 0xff);

    var fileName = `tts_.wav`;
    var filePath = './tts_.wav'

    await fs.promises.writeFile(filePath, header);
    await fs.promises.appendFile(filePath, data);
    // logger.debug(`created WAV file "${filePath}".`);

    return filePath;
}

// async function stt() {
//     const form  = new FormData()
//     form.appendFile("wav", File)
//     const result = await fetch('http://boonchuai-eks-ingress-799182153.ap-southeast-1.elb.amazonaws.com/api/sttinfer/th', {
//         method: "POST",
//         body: form
//     })
//     const data_stt = await result.json()

//     if(data_stt && data_stt.prediction) {
//         console.log(data_stt);
//     }
//   }

// async function stt(filePath) {
//     try {
//         console.log('do this');
//         var form = new FormData();
//         var header = { 'x-access-token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImNwY2FsbGNlbnRlckBraW5wby5jb20udGgiLCJleHAiOjE5MzkxMjY2NTh9.MrZLIMnoWBNYc-eXQEIVLO7YC9hPW2e0WiIB2CrdhEM' };

//         form.append('wav', fs.readFileSync(filePath), 'tts_.wav');

//         var response = await request('http://boonchuai-eks-ingress-799182153.ap-southeast-1.elb.amazonaws.com/api/sttinfer/th', form, header);

//         if (response.status === 200) {
//             var data = await response.json();
//             console.log(data);
//             return {
//                 type: 'text',
//                 message: data.prediction
//             };
//         }
//         else {
//             console.error('Failed to get a successful response from the API:', response.status);
//             return null;
//         }
//     } 
//     catch (e) {
//         return Promise.reject(e);
//     } 
//     finally {
//         fs.unlink(filePath, err => {
//             if (err) {
//                 logger.error(`cannot remove file "${filePath}".`, err);
//             } else {
//                 logger.debug(`remove file "${filePath}" successfully.`);
//             }
//         });
//     }
// }

async function stt(filePath) {
    try {
        console.log('do this');
        var form = new FormData();
        var header = { 'x-access-token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImNwY2FsbGNlbnRlckBraW5wby5jb20udGgiLCJleHAiOjE5MzkxMjY2NTh9.MrZLIMnoWBNYc-eXQEIVLO7YC9hPW2e0WiIB2CrdhEM' };

        form.append('wav', fs.readFileSync(filePath), 'file.wav');

        var response = await request('http://boonchuai-eks-ingress-799182153.ap-southeast-1.elb.amazonaws.com/api/sttinfer/th', form, header);

        if (response.status === 200) {
            var data = await response.json();
            return {
                type: 'text',
                message: data.prediction
            };
        }
        else {
            console.error('Failed to get a successful response from the API:', response.status);
            return null;
        }
    } catch (e) {
        return Promise.reject(e);
    } finally {
        fs.unlink(filePath, err => {
            if (err) {
                logger.error(`cannot remove file "${filePath}".`, err);
            } else {
                logger.debug(`remove file "${filePath}" successfully.`);
            }
        });
    }
}
