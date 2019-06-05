
let knn;
let video;
let predictTimeout;

function setup() {
  noCanvas();
  video = createCapture(VIDEO).parent('videoContainer');
  
  // Create a KNN Image Classifier
  knn = new ml5.KNNImageClassifier(2, 5, modelLoaded, video.elt);
  createButtons();
}

function createButtons() {
  // Train buttons
  var intervalA
  buttonA = select('#buttonA');
  buttonA.mousePressed(function() {
    clearInterval(intervalA);
    intervalA = setInterval(function() {
      train(1);
    }, 150)
  });

  buttonA.mouseReleased(function() {
    clearInterval(intervalA);
  });

  var intervalB
  buttonB = select('#buttonB');
  buttonB.mousePressed(function() {
    clearInterval(intervalB);
    intervalB = setInterval(function() {
      train(2);
    }, 150);
  });

  buttonB.mouseReleased(function() {
    clearInterval(intervalB);
  });

  // Reset buttons
  resetBtnA = select('#resetA');
  resetBtnA.mousePressed(function() {
    clearClass(1);
    updateExampleCounts();
    document.querySelector('#photo1').innerHTML = '';

  });
  

  resetBtnB = select('#resetB');
  resetBtnB.mousePressed(function() {
    clearClass(2);
    updateExampleCounts();
    document.querySelector('#photo2').innerHTML = '';
  });

  // Predict Button
  buttonPredict = select('#buttonPredict');
  buttonPredict.mousePressed(predict);


  buttonPredict = select('#buttonPredictStop');
  buttonPredict.mousePressed(stopPredict);

  buttonDownload = select('#downloadModel');
  buttonDownload.mousePressed(function() {
    var now = new Date();
    var name = now.getHours() + '' + now.getMinutes() + '' + now.getSeconds()
    knn.save();
  });

  buttonLoadUrl = select('#importModelUrl');
  
  buttonLoad = select('#importModel');
  
  buttonLoad.mousePressed(function() {
    knn.load(buttonLoadUrl.value());
  });
  
}

// A function to be called when the model has been loaded
function modelLoaded() {
  // select('#loading').html('Model loaded!');
}

// Train the Classifier on a frame from the video.
function train(category) {
  let msg;
  if (category == 1) {
    msg = 'A';
  } else if (category == 2) {
    msg = 'B';
  }
  //select('#training').html(msg);
  knn.addImageFromVideo(category);
  updateExampleCounts();
  imgFromVideo(category);
}

// Predict the current frame.
function predict() {
  knn.predictFromVideo(gotResults);
}

function stopPredict() {
  clearTimeout(predictTimeout);
}

function imgFromVideo(category) {
  var canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 48
  var ctx = canvas.getContext('2d');
  var vid = document.getElementsByClassName('video')[0]
  var vid = video.get().canvas;
  ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
  var img = new Image();
  img.src = canvas.toDataURL();

  document.getElementById('photo'+category).appendChild(img)
}


// Show the results
function gotResults(results) {
  let msg;

  if (results.classIndex == 1) {
    msg = 'A';
  } else if (results.classIndex == 2) {
    msg = 'B';
  }
  select('#result').html(msg);

  if (results.confidences[1] == "1" || results.confidences[2] == "1") {
    if (msg == 'A') {
      select('.fakeImage').attribute('src','http://127.0.0.1:8000/val=20&rnd=' + Math.random())
    } else if (msg == 'B') {
      select('.fakeImage').attribute('src','http://127.0.0.1:8000/val=175rnd=' + Math.random())
    }
  }
  // console.log(results);
  // Update confidence
  select('#confidenceA').html(results.confidences[1]);
  select('#confidenceB').html(results.confidences[2]);
document.querySelector('#graphA').style.height = 20 + (results.confidences[1] * 100) + 'px'
document.querySelector('#graphB').style.height = 20 + (results.confidences[2] * 100) + 'px'


  predictTimeout = setTimeout(function(){
    predict();
  }, 50);
}

// Clear the data in one class
function clearClass(classIndex) {
  knn.clearClass(classIndex);
}

// Update the example count for each class
function updateExampleCounts() {
  let counts = knn.getClassExampleCount();
  select('#exampleA').html(counts[1]);
  select('#exampleB').html(counts[2]);
}