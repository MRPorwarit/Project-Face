export default socket => {
    //================= Start: SOCKET IO =================
    const socket_events = [
        { name: 'connected', listener: socket_connect },
        { name: 'disconnect', listener: socket_disconnect },
       
    ];

    function socket_connect() {
        try {
            console.log('webchat connected.');
            window.data.conversation = null;
            updateMessages(true);

            isConnected = true;
            if (isRecording) {
                stopRecording().then(() => {
                    startRecording();
                });
            }
        } catch (e) {
            log('connection has failure.', e);
        }
    }
    function socket_disconnect() {
        isConnected = false;
        log('webchat disconnected.');
    }
    

    function init(newData, newSocket) {
        if (newData) {
            window.data = newData;
        }
        if (newSocket) {
            socket = newSocket;
            socket_connect();
        } 
        // socket.removeAllListeners();
        socket_events.forEach(e => socket.on(e.name, e.listener));
    }

    init(window.data, socket);
    

}
