let nbCols = 7
let nbRows = 6
let diameter, spacing;
let spaceOnTop = 1 / 4;
let gravity = 0
let TokenPosX = 0;
let TokenPosY = 0;
let speed = 0;
let placedTokensPos = new Array(nbCols);
let placedTokens = [];
let activeToken;
let connect4 = [];

function onMouseLeave() {
  noLoop();
}

function onMouseEnter() {
  loop();
}

function setup() {
  createCanvas(windowWidth, windowHeight)
  spacing = min(width / nbCols, (height * (1 - spaceOnTop)) / nbRows);
  diameter = .4 * spacing;
  tokenSize = diameter * 2 * 1.1;
  redBeingPlayed = random([true, false])
  activeToken = new Token(0, 0, redBeingPlayed, true);
  placedTokensPos.fill([])
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  spacing = min(width / nbCols, (height * (1 - spaceOnTop)) / nbRows);
  diameter = .4 * spacing;
  tokenSize = diameter * 2 * 1.1;
  draw()
}

function draw() {
  background(220);
  // draw active token
  activeToken.moveToken();
  //draw placed tokens
  drawPlacedTokens()
  // draw board
  drawBoard();
  stroke(0)
  strokeWeight(10)
  for(let i=0;i<connect4.length;i++){
  line(connect4[i][0],connect4[i][1],connect4[i][2],connect4[i][3]);
}
}

function drawBoard() {
  noStroke();
  beginShape();
  fill(0, 0, 200)
  vertex(0, height - nbRows * spacing);
  vertex(width, height - nbRows * spacing);
  vertex(width, height);
  vertex(0, height);
  // Interior part of shape, counter-clockwise winding
  for (let x = width / 2 - nbCols / 2 * spacing + spacing / 2; x < width / 2 + nbCols / 2 * spacing + spacing / 2; x += spacing) {
    for (let y = height - spacing / 2; y > height - nbRows * spacing; y -= spacing) {
      beginContour();
      for (let theta = 0; theta >= -TWO_PI; theta -= TWO_PI / (PI * diameter)) {
        vertex(x + diameter * cos(theta), y + diameter * sin(theta));
      }

      endContour();
    }
  }
  endShape(CLOSE);
  // shadows
  noFill();
  for (let x = width / 2 - nbCols / 2 * spacing + spacing / 2; x < width / 2 + nbCols / 2 * spacing + spacing / 2; x += spacing) {
    for (let y = height - spacing / 2; y > height - nbRows * spacing; y -= spacing) {
      stroke(120, 150, 255)
      strokeWeight(1)
      arc(x, y, diameter * 2.15, diameter * 2.15, PI, TWO_PI / 3 + PI)
      stroke(0, 0, 20)
      arc(x, y, diameter * 2.25, diameter * 2.25, PI + PI, TWO_PI / 3 + PI + PI)

    }
  }
}

function drawPlacedTokens() {
  for (let i = 0; i < placedTokens.length; i++) {
    placedTokens[i].updateXY();
    placedTokens[i].moveToken();
  }
}

class Token {
  constructor(x, y, isRed, moveWithMouse = false) {
    this.angle = random(TWO_PI);
    this.x = x;
    this.y = y;
    this.isRed = isRed;
    this.colorMain = (this.isRed ? color(200, 0, 0) : color(220, 200, 0));
    this.colorDark = (this.isRed ? color(160, 0, 0) : color(180, 160, 0));
    this.colorLite = (this.isRed ? color(230, 0, 0) : color(240, 220, 0));
    this.moveWithMouse = moveWithMouse;
    this.dropped = false;
    this.landingHeight = height - spacing / 2;
    this.speed = 0;
    this.gravity = height / 3000;
    this.columnNb = 0;
    this.columnHeight = 0;
  }
  drawToken() {
    if (this.moveWithMouse) {
      this.x = minMouseX();
      this.y = minMouseY();
    }
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    // write token disc
    noStroke();
    fill(this.colorMain);
    ellipse(0, 0, tokenSize);
    // draw shadows
    noFill();
    stroke(this.colorDark)
    strokeWeight(1)
    arc(0, 0, diameter * 1.8, diameter * 1.8, -this.angle + PI, -this.angle + TWO_PI / 3 + PI)
    stroke(this.colorLite)
    arc(0, 0, diameter * 1.8, diameter * 1.8, -this.angle, -this.angle + TWO_PI / 3)

    // write number '4'
    textAlign(CENTER, CENTER)
    textSize(tokenSize * .6);
    noStroke();
    fill(this.colorDark)
    text("4", 1.2 * cos(this.angle), -1.2 * sin(this.angle));
    fill(this.colorLite)
    text("4", -1.2 * cos(this.angle), 1.2 * sin(this.angle));
    fill(this.colorMain)
    text("4", 0, 0);
    pop();
  }
  drawCursor() {
    fill(0)
    noStroke()
    textAlign(CENTER, CENTER)
    textSize(tokenSize)
    text("\u21D3", minMouseX(true), height - nbRows * spacing - spacing / 2)
  }
  moveToken() {
    if (this.dropped) {
      if (this.y >= this.landingHeight) {
        if (this.speed < 1) {
          this.y = this.landingHeight;
          this.speed = 0;
          this.dropped = false;
          this.moveWithMouse = false;
          placedTokensPos[this.columnNb] = placedTokensPos[this.columnNb].concat(this.isRed ? ["R"] : ["Y"])
          placedTokens.push(activeToken);
          if (!alignment()) {
            activeToken = new Token(0, 0, !this.isRed, true);
          }
        }
        this.speed = -this.speed * .4
      }
      this.speed += this.gravity;
      this.y += this.speed;
      this.drawToken();
    } else {
      this.drawToken();
      //this.drawCursor()
    }
  }
  updateXY(){
    this.x = width / 2 + spacing * (this.columnNb + .5 - nbCols / 2)
    this.y = height + spacing * (-.5 - this.columnHeight);

  }
}

function alignment() { // calculate alignments around last placed token
  let tokenType = (placedTokens[placedTokens.length - 1].isRed ? "R" : "Y");
  let col = placedTokens[placedTokens.length - 1].columnNb;
  let row = placedTokens[placedTokens.length - 1].columnHeight;
  let solutions = [];
  let solution = [];
  let c, r;
  for (iterC = -1; iterC <= 1; iterC++) {
    for (iterR = -1; iterR <= 1; iterR++) {
      if (!((iterC == 0) && (iterR == 0))) {
        c = col;
        r = row;
        solution = [iterC, iterR, c, r]
        while ((c + iterC >= 0) && (c + iterC < nbCols) && (r + iterR >= 0) && (r + iterR < nbRows)) {
          if (!(placedTokensPos[c + iterC][r + iterR] == tokenType)) {
            break;
          }
          c += iterC;
          r += iterR;
          solution = [iterC, iterR, c, r]
        }
        solutions.push(solution)
      }
    }
  }
  let x1, x2, y1, y2;
  let SW_NE = solutions[7][3] - solutions[0][3] + 1; // [-1,-1]-[ 1,1]
  if (SW_NE >= 4) {
    x1 = solutions[7][2];
    y1 = solutions[7][3];
    x2 = solutions[0][2];
    y2 = solutions[0][3];
  }
  let W_E = solutions[6][2] - solutions[1][2] + 1; //   [-1, 0]-[ 1,0]
  if (W_E >= 4) {
    x1 = solutions[6][2];
    y1 = solutions[6][3];
    x2 = solutions[1][2];
    y2 = solutions[1][3];
  }
  let NW_SE = solutions[5][2] - solutions[2][2] + 1; // [ 1,-1]-[-1,1]
  if (NW_SE >= 4) {
    x1 = solutions[5][2];
    y1 = solutions[5][3];
    x2 = solutions[2][2];
    y2 = solutions[2][3];
  }
  let N_S = solutions[4][3] - solutions[3][3] + 1; //   [ 0,-1]-[ 0,1]
  if (N_S >= 4) {
    x1 = solutions[4][2];
    y1 = solutions[4][3];
    x2 = solutions[3][2];
    y2 = solutions[3][3];
  }
  if ((SW_NE >= 4) || (W_E >= 4) || (NW_SE >= 4) || (N_S >= 4)) {
    barX1 = width / 2 + spacing * (x1 + .5 - nbCols / 2)
    barY1 = height + spacing * (-.5 - y1);
    barX2 = width / 2 + spacing * (x2 + .5 - nbCols / 2)
    barY2 = height + spacing * (-.5 - y2);
    connect4.push([barX1, barY1, barX2, barY2])
    //connect4=[(x1+.5)*spacing,height-(y1+.5)*spacing,(x2+.5)*spacing,height-(y2+.5)*spacing]
    return true
  }
  return false
}

function minMouseY() {
  return min(mouseY, height - nbRows * spacing - spacing / 2);
}

function minMouseX(inslot = false, returnColumn = false) {
  let mini = width / 2 - nbCols / 2 * spacing + spacing / 2;
  let maxi = width / 2 + nbCols / 2 * spacing - spacing / 2;
  let pos = min(max(mouseX, mini), maxi);
  let column = floor((pos - mini + spacing / 2) / spacing)
  if (returnColumn) {
    return column;
  } else {
    if (inslot) {
      return mini + spacing * column;
    } else {
      return pos;
    }
  }
}

function columnHeight(column) {
  return placedTokensPos[column].length
}

function mousePressed() {
  colHeight = columnHeight(minMouseX(false, true));
  if (!activeToken.dropped && colHeight < nbRows) {
    activeToken.dropped = true;
    activeToken.moveWithMouse = false;
    activeToken.columnNb = minMouseX(false, true);
    activeToken.columnHeight = colHeight;
    activeToken.landingHeight = height - spacing / 2 - spacing * activeToken.columnHeight;
    activeToken.x = minMouseX(true);
    activeToken.y = minMouseY();
    activeToken.speed = 0;
  }
}


function keyPressed() {
  if (keyCode === BACKSPACE) {
    activeToken = placedTokens.pop();
    activeToken.moveWithMouse = true;
  }
}