const video = document.getElementById("video");

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    faceapi.nets.ageGenderNet.loadFromUri("/models"),
]).then(webCam);

function webCam() {
    navigator.mediaDevices
        .getUserMedia({
            video: {
                facingMode: "user" // Use "environment" for rear camera
            },
            audio: false,
        })
        .then((stream) => {
            video.srcObject = stream;
        })
        .catch((error) => {
            console.log("Error accessing camera: ", error);
        });
}

video.addEventListener("play", () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);

    faceapi.matchDimensions(canvas, { height: video.videoHeight, width: video.videoWidth });

    setInterval(async () => {
        const options = new faceapi.TinyFaceDetectorOptions({
            inputSize: 160,
            scoreThreshold: 0.5
        });

        const detection = await faceapi
            .detectAllFaces(video, options)
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender();

        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

        const resizedWindow = faceapi.resizeResults(detection, {
            height: video.videoHeight,
            width: video.videoWidth,
        });

        faceapi.draw.drawDetections(canvas, resizedWindow);
        faceapi.draw.drawFaceLandmarks(canvas, resizedWindow);
        faceapi.draw.drawFaceExpressions(canvas, resizedWindow);

        resizedWindow.forEach((detection) => {
            const box = detection.detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, {
                label: Math.round(detection.age) + " year old " + detection.gender,
            });
            drawBox.draw(canvas);
        });

        console.log(detection);
    }, 200);
});