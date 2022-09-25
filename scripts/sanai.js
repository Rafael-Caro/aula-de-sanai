var canvasW = 1000;
var canvasH = 1600;
var margin = 20;
var tempo = 120;
var pulDur = 60/tempo*1000;

var sanaiList;
var tubuList;
var mawazinList;

var sana;
var tab;
var mizan;
var title;

var lineH = 200;
var lineW = canvasW-2*margin;
var lineStart = 80;
var lineSep = 50;

var notas;
var notaH = 9;
var do4 = 261.6256;

var startTime;
var currentTime;

var selectMenu;
var playButton;

var lang;
var dic = {
  "es": {
    "select": "Elige una ṣan‘a",
    "play": "Toca",
    "stop": "Para"
  }
}

function preload() {
  sanaiList = loadJSON("files/sanai.json");
  tubuList = loadJSON("files/tubu.json");
  mawazinList = loadJSON("files/mawazin.json");
}

function setup () {
  var canvas = createCanvas(canvasW, canvasH);
  var div = select("#sketch-holder");
  div.style("width: " + width + "px; margin: 10px auto; position: relative;");
  canvas.parent("sketch-holder");

  strokeJoin(ROUND);
  strokeCap(ROUND);

  lang = select("html").elt.lang;

  selectMenu = createSelect()
    .size(120, 25)
    .position(margin, margin)
    .changed(start)
    .parent("sketch-holder");
  selectMenu.option(dic[lang]["select"]);
  var noRec = selectMenu.child();
  noRec[0].setAttribute("selected", "true");
  noRec[0].setAttribute("disabled", "true");
  noRec[0].setAttribute("hidden", "true");
  noRec[0].setAttribute("style", "display: none");
  var sanai = Object.keys(sanaiList)
  for (var i = 0; i < sanai.length; i++) {
    var sana = sanaiList[sanai[i]];
    var title = sana.title.trans;
    selectMenu.option(title, sanai[i]);
  }
  playButton = createButton(dic[lang]["play"])
    .size(120, 25)
    .position(canvasW - 120 - margin, margin)
    .mouseClicked(player)
    .attribute("disabled", "true")
    .parent("sketch-holder");
  //
  // showTheka = createCheckbox(' ṭhekā', true)
  //   .position(extraSpaceW + margin, talY + talRadius)
  //   .parent("sketch-holder");
  // showTal = createCheckbox(' tāl', true)
  //   .position(extraSpaceW + margin, showTheka.position()["y"] + showTheka.height)
  //   .changed(function() {
  //     showTheka.checked(showTal.checked());
  //     if (showTal.checked()) {
  //       showTheka.removeAttribute("disabled");
  //     } else {
  //       showTheka.attribute("disabled", "true");
  //     }
  //   })
  //   .parent("sketch-holder");
  // showCursor = createCheckbox(' cursor', true)
  //   .position(margin, showTal.position()["y"]+showTal.height)
  //   .parent("sketch-holder");
  // showTheka.attribute("disabled", "true");
  // showTheka.attribute("style", "color:rgba(120, 0, 0, 0.5);");
  // showTal.attribute("disabled", "true");
  // showTal.attribute("style", "color:rgba(120, 0, 0, 0.5);");
  // showCursor.attribute("disabled", "true");
  // showCursor.attribute("style", "color:rgba(120, 0, 0, 0.5);");
}

function draw () {
  background(254, 249, 231);

  if (title != undefined) {
    textAlign(CENTER, TOP);
    textSize(20);
    noStroke();
    fill(0);
    // text(title, selectMenu.width + 2 * margin, margin);
    text(title, canvasW/2, margin);

    for (var i = 0; i < 6; i++) {
      var y1 = i*(lineH+lineSep)+lineStart;
      var y2 = y1 + lineH;
      fill(255);
      stroke(0);
      strokeWeight(1);
      rect(margin, y1, canvasW-(2*margin), lineH);
      stroke(255, 0, 0);
      strokeWeight(3);
      var y = map(tab.fun, tab.max, tab.min, y1, y2);
      line(margin, y, canvasW-margin, y);
      stroke(0, 255, 0);
      strokeWeight(2);
      y = map(tab.per, tab.max, tab.min, y1, y2);
      line(margin, y, canvasW-margin, y);
      for (var j = 0; j < tab.prin.length; j++) {
        stroke(0, 0, 255);
        strokeWeight(1);
        y = map(tab.prin[j], tab.max, tab.min, y1, y2);
        line(margin, y, canvasW-margin, y);
      }
      for (var k = 0; k < tab.escala.length; k++) {
        stroke(150);
        strokeWeight(1);
        y = map(tab.escala[k], tab.max, tab.min, y1, y2);
        line(margin, y, canvasW-margin, y);
      }
      for (var l = 0; l < mizan.golpes.length; l++) {
        textAlign(LEFT, BOTTOM);
        noStroke();
        fill(0);
        textSize(15);
        var x = map(mizan.golpes[l].pos, 0, mizan.pul, 2*margin, canvasW-2*margin);
        text(mizan.golpes[l].gol, x, y1);
        stroke(200);
        strokeWeight(1);
        line(x, y1, x, y2);
      }
    }
    for (var n = 0; n < notas.length; n++) {
      notas[n].display();
    }
  }

  currentTime = millis() - startTime;
}

function start () {
  notas = [];
  sana = sanaiList[selectMenu.value()];
  tab = tubuList[sana.tab];
  mizan = mawazinList[sana.mizan];
  title = sana.title.trans;
  var melodia = sana.melodia;
  for (var i = 0; i < melodia.length; i++) {
    var nota = new CreateNota(melodia[i]);
    notas.push(nota);
  }

  playButton.removeAttribute("disabled");
  startTime = undefined;
}

function CreateNota (preNota) {
  this.x1 = map(preNota.ini[1], 0, mizan.pul, 2*margin, canvasW-2*margin);
  this.x2 = map(preNota.ini[1]+preNota.dur, 0, mizan.pul, 2*margin, canvasW-2*margin);
  this.w = this.x2-this.x1;
  this.lineY1 = preNota.ini[0]*(lineH+lineSep)+lineStart;
  this.lineY2 = this.lineY1 + lineH;
  this.y1 = map(preNota.cents, tab.max, tab.min, this.lineY1, this.lineY2)-notaH/2;
  this.y2 = this.y1 + notaH;
  this.lyric = preNota.trans;
  this.ini = (preNota.ini[0]*mizan.pul + preNota.ini[1]) * pulDur;
  this.end = this.ini + preNota.dur*pulDur;
  // this.fill;
  this.isPlaying = false;
  this.isPressed = false;

  this.pitch = do4 * (2 ** (preNota.cents / 1200));
  this.sound = new p5.Oscillator();
  // this.sound.setType("sawtooth");
  this.sound.freq(this.pitch);


  this.display = function () {
    stroke(0);
    strokeWeight(1);
    if (currentTime > this.ini && currentTime < this.end) {
      // fill(255, 0, 0);
      if (!this.isPlaying) {
        this.sound.start();
        this.isPlaying = true;
      }
    } else {
      // fill(100);
      if (this.isPlaying) {
        this.sound.stop();
        this.isPlaying = false;
      }
    }
    if (this.isPlaying || this.isPressed) {
      fill(255, 0, 0);
    } else {
      fill(100);
    }
    rect(this.x1, this.y1, this.w, notaH);
    textAlign(LEFT, BOTTOM);
    fill(255);
    stroke(0);
    strokeWeight(5);
    textSize(15);
    text(this.lyric, this.x1, this.y1);
  }

  this.start = function () {
    if (mouseX > this.x1 && mouseX < this.x2 && mouseY > this.y1 && mouseY < this.y2) {
      this.sound.start();
      this.isPressed = true;
    }
  }
}

function player () {
  // console.log(playButton.html());
  if (playButton.html() == dic[lang]["play"]) {
    startTime = millis();
    console.log(startTime);
    playButton.html(dic[lang]["stop"]);
  } else {
    startTime = undefined;
    console.log(startTime);
    playButton.html(dic[lang]["play"]);
  }
}

function mousePressed () {
  for (var i = 0; i < notas.length; i++) {
    notas[i].start();
  }
}

function mouseReleased () {
  for (var i = 0; i < notas.length; i++) {
    notas[i].sound.stop();
    notas[i].isPressed = false;
  }
}
