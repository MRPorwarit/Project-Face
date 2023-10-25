let transcript;
let socket;
let isListening = false;
let isSandeGreetingReceived = false;
let disconnectTimeout;

function startRecognition() {
    if (!isListening) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'th-TH';
        recognition.addEventListener('result', (event) => {
            transcript = event.results[0][0].transcript;

            if (!isSandeGreetingReceived) {
                if (transcript === "สวัสดีแสนดี") {
                    console.log('Received "สวัสดีแสนดี", เริ่มเชื่อมต่อ WebSocket');
                    createWebSocket();
                    isSandeGreetingReceived = true;
                }
            }

            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(transcript);
            }
        });
        recognition.addEventListener('end', () => {
            isListening = false;
            startRecognition();
        });
        recognition.start();
        isListening = true;
    }
}

function createWebSocket() {
    socket = new WebSocket('ws://localhost:9090');
    socket.addEventListener('open', () => {
        console.log('Connected to server');
        disconnectTimeout = setTimeout(() => {
            socket.close();
            console.log("พูดคำว่า'สวัสดีแสนดี'เพื่อเปิดการเชื่อมต่ออีกครั้ง");
        }, 60000); // 1 นาที เช็คว่าถ้าไม่มี event เกิดขึ้นให้หยุดการเชื่อมต่อ
        isSandeGreetingReceived = false;
        stt();
    });
    socket.addEventListener('close', () => {
        console.log('WebSocket closed');
        clearTimeout(disconnectTimeout);
        startRecognition();
    });
    socket.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
    });
    socket.addEventListener('message', (event) => {
        console.log('Received message from server:', event.data);
    });
}

function stt() {
    const text = transcript
    nlp(text);
    // tts(text);
    console.log(text);

    async function nlp(text) {
        const form = new FormData()
        form.append("userId", "newsandee")
        form.append("device", "A02")
        form.append("language", "th")
        form.append("query", text)
        const result = await fetch(`http://3.1.123.125/chatbot`, {
            method: "POST",
            body: form
        })
        const data = await result.json()
        console.log(data);
        console.log(data.Content.Answer)
    }
}

async function tts(text) {
    const form = new FormData();
    form.append("text", text);

    try {
        const response = await fetch('http://boonchuai-eks-ingress-799182153.ap-southeast-1.elb.amazonaws.com/tts', {
            method: 'POST',
            body: form,
            headers: {
                'x-access-token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImNwY2FsbGNlbnRlckBraW5wby5jb20udGgiLCJleHAiOjE5MzkxMjY3NDl9.0UIschPQwJp1euUk3el3WFyY_AC2_wO5jq9F4yjdJeo' // แทน YOUR_ACCESS_TOKEN ด้วยโทเคนของคุณ
            }
        });

        if (response.ok) {
            const wavData = await response.blob();
            const wavFile = 'tts.wav';
            const audioUrl = URL.createObjectURL(wavData);
            const audio = new Audio(audioUrl);
            audio.play();
            console.log('เล่นเสียง');
        } else {
            console.error('ไม่สามารถเรียก API TTS ได้:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการเรียก API TTS:', error);
    }
}

startRecognition();