let transcript;
let socket;
let isListening = false;
let isSandeGreetingReceived = false;
let disconnectTimeout;
let BotAnswer;
let recognition;
let audio = new Audio();
const playButton = document.getElementById('play-button');

playButton.addEventListener('click', () => {
  if (audio.src) {
    audio.pause();
    audio.currentTime = 0;
    audio.play().catch((error) => {
      console.error('Failed to play audio:', error);
    });
  }
});

async function playAudio(wavUrl) {
  clearAudio();
  if (audio.src) {
    audio.pause();
    audio.currentTime = 0;
  }

  audio.src = wavUrl;
  audio.play().catch((error) => {
    console.error('Failed to play audio:', error);
  });
}

function clearAudio() {
  if (audio.src) {
    URL.revokeObjectURL(audio.src);
    audio.src = '';
  }
}

function createWebSocket() {
  socket = new WebSocket('ws://localhost:9090');
  socket.addEventListener('open', () => {
    console.log('Connected to server');
    disconnectTimeout = setTimeout(() => {
      socket.close();
      console.log("พูดคำว่า 'สวัสดีแสนดี' เพื่อเปิดการเชื่อมต่ออีกครั้ง");
    }, 60000); // 1 นาที เช็คว่าถ้าไม่มี event เกิดขึ้นให้หยุดการเชื่อมต่อ
    isSandeGreetingReceived = false;
    handleTranscript();
    // setTimeout(() => {
    //   changeImage('image', 'eye5.png');
    // }, 3000);

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
    stt();
  });
}

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
      recognition.start();
      handleTranscript(transcript);
    });
    recognition.start();
    isListening = true;
  }
}

function stt() {
  const text = transcript;
  nlp(text);
}

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

  if (data && data.Content && data.Content.Answer) {
    console.log(data);
    BotAnswer = data.Content.Answer;
    if(BotAnswer === 'detected'){
      BotAnswer = data.Content.Text
      console.log(data.Content.Text);
    }
    tts(BotAnswer);
  } else {
    console.error('โครงสร้างข้อมูลไม่ตรงตามที่คาดหวัง');
  }
}

async function tts(BotAnswer) {
  const form = new FormData();
  form.append("text", BotAnswer);

  try {
    const response = await fetch('http://boonchuai-eks-ingress-799182153.ap-southeast-1.elb.amazonaws.com/tts', {
      method: 'POST',
      body: form,
      headers: {
        'x-access-token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImNwY2FsbGNlbnRlckBraW5wby5jb20udGgiLCJleHAiOjE5MzkxMjY3NDl9.0UIschPQwJp1euUk3el3WFyY_AC2_wO5jq9F4yjdJeo' // แทน YOUR_ACCESS_TOKEN ด้วยโทเคนของคุณ
      }
    });

    if (response.ok) {
      const wavBlob = await response.blob();
      const wavUrl = URL.createObjectURL(wavBlob);
      playAudio(wavUrl);
    } else {
      console.error('Failed to call the TTS API:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error calling the TTS API:', error);
  }
}

function handleTranscript(transcript) {
  if (transcript === 'สวัสดี') {
    changeImage('image', 'eye5.png');

    setTimeout(() => {
      changeImage('image', 'facebot.gif');
    }, 3000);
  }
}

function changeImage(imageId, newImageSrc) {
  const image = document.getElementById(imageId);
  if (image) {
    image.src = newImageSrc;
  }
}

startRecognition();
