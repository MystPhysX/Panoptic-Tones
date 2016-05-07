var hash, fingerprint, synth;
var selectedSound = 1;
var waveform = new Tone.Analyser(1024, "waveform");
var waveContext = 0;
var tonemap = ["A0", "B0", "C1", "D1", "E1", "F1", "G1", "A1", "B1", "C2", "D2", "E2", "F2", "G2", "A2", "B2", "C3", "D3", "E3", "F3", "G3", "A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5", "B5", "C6", "D6", "E6", "F6", "G6", "A6", "B6", "C7", "D7", "E7", "F7", "G7", "A7", "B7", "C8"];

//This function leverages fingerprint.js in order to generate the browser fingerprint and display it.
function generateFingerprint() {
      
      //Excluding Canvas and WebGL fingerprinting to reduce size massively.
      var options = {excludeCanvas: true, excludeWebGL: true};
      
      //Generate the fingerprint and make an HTML table with it.
      var fp = new Fingerprint2(options);
      fp.get(function(result, components) {
        
        //Storing the result in a global variable "hash" for later.
        hash = result;
        
        //Creating the new page and table.
        var table = '<div id="soundgroup" class="text-center"><button class="btn btn-default" onclick="synthType(1)">Default Sound</button>' + 
        '<button class="btn btn-default" onclick="synthType(2)">Sound Type 2</button>' +
        '<button class="btn btn-default" onclick="synthType(3)">Sound Type 3</button></div>' +
        '<br><button id="short" class="btn btn-default center-block" onclick="texttoMusic(hash)">Listen to the hash</button>' +
        '<br><button id="long" class="btn btn-default center-block" onclick="texttoMusic(fingerprint)">Listen to the entire fingerprint</button>' +
        '<br><br><p class="text-center">Your browser fingerprint: <strong>' + result + '</strong></p>' +
        '<br><br><div class="table-responsive"><table class="table table-hover table-bordered table-condensed"><thead><th class="text-center">Key:</th><th class="text-center">Value:</th></thead><tbody id="fp">';
        for(i = 0; i < components.length; i++) {
          //Storing the fingerprint as one long string.
          fingerprint = fingerprint + components[i].value;
          table = table +
          '<tr>' +
          '<td>' +
          components[i].key +
          '</td>' +
          '<td>' +
          components[i].value +
          '</td>' +
          '</tr>';
        }
        table = table + '</tbody></table></div>';
        
        //Delete the text from the front page.
        var element = document.getElementById("primarytext");
        element.parentNode.removeChild(element);
        
        //Display the generated table.
        document.getElementById("btn").insertAdjacentHTML('beforebegin', table);
      });
}

//Converts an incoming string to a tune using a Tone.js synth and the tonemap.
function texttoMusic(string) {
  
  //There are three different synths users can choose.
  if(selectedSound == 1) {
    synth = new Tone.SimpleSynth().fan(waveform).toMaster();
  }
  else if(selectedSound == 2) {
    synth = new Tone.MonoSynth().fan(waveform).toMaster();
  }
  else {
    synth = new Tone.SimpleFM().fan(waveform).toMaster();
  }
  
  //Generates a waveform to add to the novelty.
  //If a waveform already exists this skips creation.
  if(waveContext == 0) {
  //the waveform HTML generation.
  waveContext = $("<canvas>", {
    "id" : "waveform"
    }).appendTo("#soundgroup").get(0).getContext("2d");
  }
	
  var waveformGradient;

  //Analyses and draws the waveform based on incoming data from the synth
  function drawWaveform(values){
    //draw the waveform
    waveContext.clearRect(0, 0, canvasWidth, canvasHeight);
    var values = waveform.analyse();
		waveContext.beginPath();
		waveContext.lineJoin = "round";
		waveContext.lineWidth = 6;
		waveContext.strokeStyle = waveformGradient;
		waveContext.moveTo(0, (values[0] / 255) * canvasHeight);
		for (var i = 1, len = values.length; i < len; i++){
  		var val = values[i] / 255;
		  var x = canvasWidth * (i / len);
		  var y = val * canvasHeight;
		  waveContext.lineTo(x, y);
		}
		waveContext.stroke();
	 }

  //Calculates the size the waveform canvas element should be.
  var canvasWidth, canvasHeight;
  function sizeCanvases(){
	  canvasWidth = $("#page").width();
	  canvasHeight = 255;
	  waveContext.canvas.width = canvasWidth;
	  waveContext.canvas.height = canvasHeight;

	  //Form the gradient the waveform will use.
	  waveformGradient = waveContext.createLinearGradient(0, 0, canvasWidth, canvasHeight);
	  waveformGradient.addColorStop(0, "#ddd");
	  waveformGradient.addColorStop(1, "#000");   
  }

  sizeCanvases();
	  
  //Loops while the synth is outputting in order to draw the waveform.
  function loop(){
    requestAnimationFrame(loop);
    //Get waveform values in order to draw it.
    var waveformValues = waveform.analyse();
    drawWaveform(waveformValues);
  }
  loop();
  
  var j = 0.0;
  var k = "";
  
  //Converts ASCII to a note based on the tonemap.
  for(i = 0; i  < string.length; i++) {
    var ascii = string[i].charCodeAt();
    if (ascii > 31 && ascii < 84) {
      ascii = ascii - 32;
    }
    else {
      ascii = ascii - 84;
    }
    k = "+" + j;
    
    //Triggers the note at the set interval k.
    synth.triggerAttack(tonemap[ascii], k);
    j += 0.25;
  }
  //Stops the synth after all notes have been played.
  synth.triggerRelease(k);
}

//Denotes which sound type the user has chosen.
function synthType(type) {
  selectedSound = type;
}
