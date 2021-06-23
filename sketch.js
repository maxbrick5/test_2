let slider;
let buttonControl;
let buttonRandom;

let amp;
let fft;
let volume;
let spectrum;
let freq;

let marginX = 20;
let marginY = 30;

let choice = 1;
let font;
let backColor;
let color1;
let color2;
let color3;
let color4;
let choiceC;

let frameCounter =0;
let direction = "plus";
let colorFactor = 0.1                         //Change here the speed at wich the color changes

let totalcharWidth = 0;
let charWidth = 0;

let infoBoxThickness = 10;
let pushText = 1;
let infoFontSize = 15;
let down;

let energyMatrix = [];
let prevSpectrum = [];

let songsList = [];
let textsList = [];

let drops = []

const songPaths = SONGS                           // See the data.js files for this array content

let currentSong;
let currentText;





// The rest is for the animation and the song playing
// Upload the songs and the infos here
function preload() {
  songsList = songPaths.map(p =>  p[0])
  textsList = songPaths.map(p => p[1])
 

  font = loadFont("LazenbyCompLiquid.ttf")
}



function setup() {
  createCanvas(windowWidth, windowHeight - 40);                       //Here, change the size of the window
  smooth();

  amp = new p5.Amplitude();
  fft = new p5.FFT();

  peakDetect = new p5.PeakDetect(0, 20, 0.4);    //Here, change between wich and which Bin (0-1024) to get a peak, and the treshold (0-1.0)

  // For the "ColorChanger" changer
  color1 = color(178, 77, 178);                 // Here, change the color the background will have
  color2 = color(141, 84, 141);
  color3 = color(158, 97, 158);
  color4 = color(105, 58, 105);
  backColor = color(116, 83, 116);

  slider = createSlider(0, 1, 0.5, 0.1);

  // Set the Pause Play button
  buttonControl = createButton("Stop");
  buttonControl.mousePressed(pauseNplay);

  // Set the Songs buttons
  buttonRandom = createButton("random");
  buttonRandom.mousePressed(randomise);
 


  //Initialize the whole thing
  const index = floor(random(0, songsList.length))

  currentText = loadStrings(textsList[index]);
  currentSong = loadSound(songsList[index], soundLoaded, soundError, soundLoading);
 
}

//---------------------------------------------------------------------------------------------------------------------------------------------------

function draw() {
  //backColor = color(RbackColor, GbackColor, BbackColor);
  resizeCanvas(windowWidth, windowHeight - 40);      
  background(backColor);
      


  if (!currentSong)
    return

  currentSong.setVolume(slider.value())

  // I do not used the volume... but you never know
  volume = amp.getLevel();

  //const factor = (volume / slider.value()) * 2
  if (frameCounter < 100 && direction == "plus"){
    frameCounter += colorFactor
    if(frameCounter >= 99) {
      direction = "minus"
    }
  }
  if (frameCounter <= 100  && direction == "minus"){
    frameCounter -= colorFactor
    if(frameCounter <= 1){
      direction = "plus"
      frameCounter = 0
    }

  }
   
  backColor = getColor(frameCounter)


  spectrum = fft.analyze();
  peakDetect.update(fft);
  fft.smooth(0.9);

  // Used in the animation functions to have the letters of the song tittle separate
  let title = cleanName(currentSong.file)
  const buffer = 6
  freq = int(1024 / (title.length +buffer))
  

  // The animation choice is made when "random button" is clicked
  if (choice == 0) wallPaperLetters(title);
  if (choice == 1) normalText(title);
  if (choice == 2) rainLetters(volume)

  //textInfoSlide();                                   //Here, change the way the info text will be displayed
  textInfoAll();

 

}

//---------------Button Functions----------------

function pauseNplay() {
  if (!currentSong.isPlaying()) {
    currentSong.play();
    buttonControl.html("Stop");
  }
  else {
    currentSong.pause();
    buttonControl.html("Play");
  }
}


function randomise() {
  buttonControl.html("Stop");

  if (currentSong){
    currentSong.stop();
  }

  const index = floor(random(0, songsList.length))

  currentText = loadStrings(textsList[index]);
  currentSong = loadSound(songsList[index], soundLoaded, soundError, soundLoading);

  choice = int(random(0, 3));

  // Set the Letter rain function
  let chars = cleanName(currentSong.file)
  chars = chars.split("") 
  chars.forEach((l, i) =>{
    drops[i] = new Letter(l)
  })
  

  // Reset the position of the text when the "textInfoSlide" is the function activated
  pushText = 0;
}


// ---------------- Animation Function -------------------------
function wallPaperLetters(songName) {
  background(backColor);
  fill(0);
  strokeWeight(1);

  const lineCount = 10

  // Array with numbers from 0-9
  const lines = Array.from({length: lineCount}, (_, i) => i)
  // Array with letters
  let chars = songName.split('')

  textFont(font);

  lines.forEach(line => {

    chars.forEach((char, i) => {

      // The "i+1" is to cut out the first chunk of freq, because they are too fidgety
      textSize(spectrum[freq * (i + 1)] + 5);
      //angleRotation = PI/ i *10;
      push();
      const x = ((windowWidth - marginX * 2) / chars.length+1) * (i-1) + 2*marginX
      const y = ((height - infoBoxThickness - 2*marginY) / lineCount) * (line +2) + marginY  + infoBoxThickness
      translate(x, y);
      // rotate(angleRotation);
      textAlign(CENTER);
      text(char, 0, 0);
      pop();
    })
  })
}

function normalText(songName) {
  background(backColor);
  textFont(font);
  fill(0);
  strokeWeight(1);
  
 
  const chars = songName.split("")

  chars.forEach((char, i) => {
    
  
    charWidth += textWidth(char);
    
    push();
    translate((width - totalcharWidth) / 2, (height - infoBoxThickness) / 2 + infoBoxThickness);
    textAlign(CENTER);
    textSize(spectrum[freq * (i + 1)]*1.5 + 5);
    text(char, charWidth, 0);
    charWidth += textWidth(char);
    pop();
  })

  // This is used to recenter the text in the "translate" function
  totalcharWidth = charWidth;
  charWidth = 0;
}



function rainLetters(amp){
  background(backColor);
  textFont(font);
  fill(0);
  let speedFactor = 8;
  let velosity = amp*speedFactor

  drops.forEach((l,i) => {
    l.fall(velosity)
    l.show()
  })


}


//---------------Helper Functions----------------

function getColor(luminosity) {
  colorMode(HSL, 100);
  let saturation = map(luminosity, 0, 100, 15, 40 )
  luminosity = map(luminosity, 0, 100, 40, 90)                         // Change the spectrum of the luminosity here
  
  

  // hsl(300deg 17% 39%)

  const h = (300 / 360) * 100
  const c = color(
    h,
    saturation,
    luminosity
  )

  colorMode(RGB, 255);

  return c
}

function cleanName(entry){
  let slash = 0
  let chars = []
  entry  = entry.replace(".mp3", " ")
  chars = entry.split("")
    chars.forEach((char, charIndex) => {
      if(char == "/") {
        slash += 1
      }
      if(slash == 2) {
        entry = entry.slice(charIndex+1, chars.length)
        slash = 0

      }     
    })
    return entry
}

function soundLoaded(){
  okToPlay = true
  console.log("im in the success callback")
  currentSong.play()

}

function soundError(){
  okToPlay = false
  console.log("im in the error callback")
  // console.log(okToPlay)
}

function soundLoading(){
  // okToPlay = true
  console.log("im in the sound loading callback")
  // console.log(okToPlay)
}


// -------------------------------------- Text Display function --------------------------------------------------

function textInfoSlide() {
  noStroke();
  fill(backColor);
  rect(0, 0, width, infoBoxThickness);

  textSize(16);
  fill(0);
  color(0);

  if (mouseY < infoBoxThickness) {
    if (mouseX > width / 2) {
      text(currentText, 20 - pushText, 50);
    }

    pushText += 1;                                        // Change the rate of the moving text here
  }
  // if the mouse is not up in the window, the text is stable
  else {
    text(currentText, 20 - pushText, 50);
  }
}

function textInfoAll() {
  let lineJump = 18;                                                     // Change here the space in between each line

  noStroke();
  textFont("lucida console")
  fill(backColor);
  rect(0, 0, width, infoBoxThickness);
  textAlign(CENTER)                                                 // Change here the allignment of the text (CENTER) (RIGTH) or (LEFT)
  textSize(infoFontSize);
  fill(0);
  color(0);
  

  for (let h = 0; h < currentText.length; h++) {

    text(currentText[h], width / 2, marginX + lineJump * h);


    // Ajust the height of the info box to the size of the text
    if ((marginX + (lineJump + infoFontSize) * h) >= infoBoxThickness) {
      infoBoxThickness += 2;
    }

    if ((marginX + (lineJump + infoFontSize) * h) < infoBoxThickness) {
      infoBoxThickness -= 2;
    }
  }
}






