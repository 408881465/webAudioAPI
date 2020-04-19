window.URL = window.URL;
navigator.getUserMedia = navigator.webkitGetUserMedia;
var audioContext;
if (navigator.getUserMedia) {
    navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true
    }).then(function (localMediaStream) {
        audioContext = new AudioContext();
        var mediaStreamSource = audioContext.createMediaStreamSource(localMediaStream);
        window.MediaStreamSource = mediaStreamSource;
        var rec = new Recorder(window.MediaStreamSource);
        window.rec = rec;
        main();
    })
} else {
    Ext.Msg.alert('消息提示', '你的浏览器不支持录音');
}

function main(){
    $('#record_btn').mousedown(function () {
        window.rec.record();
        setTimeout(function () {
            window.rec.stop();
            window.rec.getBuffer(function (buffer) {
                // $('#result').html('录制到声音长度为： ' + buffer.length + ' 个 buffer 大小<br>每个 buffer 大小为： ' + buffer[0].length)
                // var array = new Uint8Array(buffer);
                // $('#result').html('处理后的声音长度为： ' + array.length)
                audioContext.decodeAudioData(buffer).
                then(function (decodedData) {
                    var audioBufferSouceNode = audioContext.createBufferSource();
                    var analyser = audioContext.createAnalyser();
                    audioBufferSouceNode.connect(analyser);
                    analyser.connect(audioContext.destination);
                    audioBufferSouceNode.buffer = decodedData;
                    audioBufferSouceNode.start(0);
                    // 添加 ↓
                    var cnt = 0;
                    var fileContentArray = [];
                    var drawMeter = function () {
                        var array = new Uint8Array(analyser.frequencyBinCount);
                        analyser.getByteFrequencyData(array);
                        fileContentArray.push(array.toString() + '\n');
                        cnt++;
                        if (cnt < 100) {
                            requestAnimationFrame(drawMeter);
                        } else {
                            var file = new File(fileContentArray, "voice.txt", {
                                type: "text/plain;charset=utf-8"
                            });
                            saveAs(file);
                        }
                    }
                    requestAnimationFrame(drawMeter);
                    // 添加 ↑
                });dow.rec.clear();
            });
        }, 1000);
    });
}