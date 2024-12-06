const canvas = document.querySelector("canvas");
const wCanvas = (canvas.width = 960);
const hCanvas = (canvas.height = 600);
const ctx = canvas.getContext("2d");
let scoreHtml = document.querySelector(".score");
let timerHtml = document.querySelector(".timer");
let btnRewind = document.querySelector(".btn-rewind");
let btnCancel = document.querySelector(".btn-cancel");
let btnColVolume = document.querySelector(".col-volume");
let btnRestart = document.querySelector(".btn-restart");
let popupPlay = document.querySelector(".popup-play");
let popupGameOver = document.querySelector(".popup-gameover");
let numberHighScore = document.querySelector(".numberHighScore");
let jam = 0;
let menit = 0;
let detik = 0;
let score = 6;
let audioUtama = document.querySelector("#audio-utama");
let audioClick = document.querySelector("#audio-click");
let audioEaten = document.querySelector("#audio-eaten");
let audioGameOver = document.querySelector("#audio-game-over");
let intervalFood;
let range = document.querySelector(".range");
timerHtml.innerHTML = `${jam} : ${menit.toString().padStart(2, "0")} : ${detik
  .toString()
  .padStart(2, "0")}`;

let intervalTimeVar;

let xRect = 20;
let yRect = 20;
let arah = "kanan";
let snake = [
  { x: 24, y: 15 },
  { x: 23, y: 15 },
  { x: 22, y: 15 },
  { x: 21, y: 15 },
  { x: 20, y: 15 },
  { x: 19, y: 15 },
];
let food = [];
let interval;
function drawBoard() {
  for (let i = 0; i < 30; i++) {
    for (let j = 0; j < 48; j++) {
      ctx.beginPath();
      if ((i + j) % 2 == 0) {
        ctx.fillStyle = "#1E4D69";
      } else {
        ctx.fillStyle = "#123952";
      }
      ctx.rect(j * xRect, i * yRect, xRect, yRect);
      ctx.fill();
    }
  }
}
let snakeHistory = [];
let detikHistory = [];
let menitHistory = [];
let jamHistory = [];
let foodHistory = [];
let scoreHistory = [];
let snakeDirectionHistory = [];
let originalSnake = [];
let originalfood = [];
let originalDirection = null;
let originalScore = null;
let originalDetik = null;
let originalMenit = null;
let originalJam = null;

let intervalHistory;
function updateSnakeHistory() {
  intervalHistory = setInterval(() => {
    if (snakeHistory.length >= 50) {
      snakeHistory.shift();
      snakeDirectionHistory.shift();
      foodHistory.shift();
      scoreHistory.shift();
      detikHistory.shift();
      menitHistory.shift();
      jamHistory.shift();
    }

    snakeHistory.push(JSON.parse(JSON.stringify(snake)));
    snakeDirectionHistory.push(arah);
    foodHistory.push(JSON.parse(JSON.stringify(food)));
    scoreHistory.push(score);
    detikHistory.push(detik);
    menitHistory.push(menit);
    jamHistory.push(jam);
  }, 100);
}
function stopSnakeHistory() {
  clearInterval(intervalHistory);
}
let isRewindActive = false;

btnRewind.addEventListener("click", function () {
  audioClick.currentTime = 0;
  audioClick.play();

  if (isRewindActive) {
    isRewindActive = false;
    range.style.display = "none";

    btnRewind.classList.remove("active");
    btnCancel.style.display = "none";

    intervalTime();
    startIntervalFood();
    startIntervalRemoveFood();
    intervalSnake();
    updateSnakeHistory()
  } else {
    isRewindActive = true;
    range.style.display='flex'
    btnRewind.classList.add("active");
    btnCancel.style.display = "flex";

    originalSnake = JSON.parse(JSON.stringify(snake));
    originalfood = JSON.parse(JSON.stringify(food));
    originalDirection = arah;
    originalScore = score;
    originalDetik = detik;
    originalMenit = menit;
    originalJam = jam;

    stopRemoveInterval();
    stopIntervalTime();
    stopIntervalSnake();
    stopSnakeHistory();
    stopIntervalFood();

    range.max = snakeHistory.length - 1;
    range.value = range.max;
  }
});

btnCancel.addEventListener("click", function () {
  if (isRewindActive) {
    isRewindActive = false;
    range.style.display = "none";

    btnRewind.classList.remove("active");
    btnCancel.style.display = "none";

    audioClick.currentTime = 0;
    audioClick.play();

    snake = JSON.parse(JSON.stringify(originalSnake));
    food = JSON.parse(JSON.stringify(originalfood));
    arah = originalDirection;
    score = originalScore;
    detik = originalDetik;
    menit = originalMenit;
    jam = originalJam;
    timerHtml.innerHTML = `${jam} : ${menit
      .toString()
      .padStart(2, "0")} : ${detik.toString().padStart(2, "0")}`;
    scoreHtml.innerHTML = score;

    ctx.clearRect(0, 0, wCanvas, hCanvas);
    drawBoard();
    drawSnake();
    drawFood();
    updateSnakeHistory();
    intervalTime();
    startIntervalFood();
    startIntervalRemoveFood();

    intervalSnake();
  }
});
range.addEventListener("input", function () {
  if (isRewindActive) {
    let index = parseInt(range.value);

    if (index >= 0 && index < snakeHistory.length) {
      snake = JSON.parse(JSON.stringify(snakeHistory[index]));
      food = JSON.parse(JSON.stringify(foodHistory[index]));
      arah = snakeDirectionHistory[index];
      score = scoreHistory[index];
      detik = detikHistory[index];
      menit = menitHistory[index];
      jam = jamHistory[index];
         timerHtml.innerHTML = `${jam} : ${menit
           .toString()
           .padStart(2, "0")} : ${detik.toString().padStart(2, "0")}`;
      scoreHtml.innerHTML = score;

      ctx.clearRect(0, 0, wCanvas, hCanvas);
      drawBoard();
      drawSnake();
      drawFood();
    }
  }
});


btnColVolume.addEventListener("click", function () {
  const line = document.querySelector(".line-volume");
  const lineActive = document.querySelector(".line-volume.active");
  if (lineActive) {
    lineActive.classList.toggle("active");
    audioUtama.currentTime = 0;

    audioUtama.play();
  } else {
    line.classList.toggle("active");
    audioUtama.pause();
  }
});
document.addEventListener("keydown", function (e) {
  if (e.keyCode == 88) {
    popupPlay.classList.add("active");
    audioClick.currentTime = 0;
    audioClick.play();
    main();
  }
});
function drawSnake() {
  snake.forEach((s) => {
    ctx.beginPath();
    ctx.fillStyle = "#7B5919";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.rect(s.x * xRect, s.y * yRect, xRect, yRect);
    ctx.stroke();
    ctx.fill();
  });
}

let maxFood = 5;
let removeFoodInterval;
function createFood() {
  for (let i = 0; i < 3; i++) {
    let xRand;
    let yRand;
    let posisiTrue;
    do {
      xRand = Math.floor(Math.random() * 47);
      yRand = Math.floor(Math.random() * 29);
      posisiTrue = snake.some((s) => s.x === xRand && s.y === yRand);
    } while (posisiTrue);

    food.push({ x: xRand, y: yRand });
  }
}
function startIntervalFood() {
  intervalFood = setInterval(() => {
    if (food.length < maxFood) {
      let xRand;
      let yRand;
      let posisiTrue;
      do {
        xRand = Math.floor(Math.random() * 47);
        yRand = Math.floor(Math.random() * 29);
        posisiTrue = snake.some((s) => s.x === xRand && s.y === yRand);
      } while (posisiTrue);

      food.push({ x: xRand, y: yRand });
    }
  }, 3000);
}
function startIntervalRemoveFood() {
  removeFoodInterval = setInterval(() => {
    if (food.length > 3) {
      food.shift();
    }
  }, 5000);
}

function stopRemoveInterval() {
  clearInterval(removeFoodInterval);
}
function stopIntervalFood() {
  clearInterval(intervalFood);
}
function drawFood() {
  food.forEach((f) => {
    ctx.beginPath();
    ctx.fillStyle = "#83A2E3";
    ctx.rect(f.x * xRect, f.y * yRect, xRect, yRect);
    ctx.fill();
  });
}

function intervalTime() {
  intervalTimeVar = setInterval(() => {
    detik += 1;
    if (detik > 59) {
      detik = 0;
      menit += 1;
      if (menit > 59) {
        menit = 0;
        jam += 1;
      }
    }
    timerHtml.innerHTML = `${jam} : ${menit
      .toString()
      .padStart(2, "0")} : ${detik.toString().padStart(2, "0")}`;
  }, 1000);
}

function stopIntervalTime() {
  clearInterval(intervalTimeVar);
}

function update(e) {
  if (e.keyCode == 65) {
    if (arah == "kanan") {
      arah = "kanan";
    } else {
      arah = "kiri";
    }
  }
  if (e.keyCode == 87) {
    if (arah == "bawah") {
      arah = "bawah";
    } else {
      arah = "atas";
    }
  }
  if (e.keyCode == 68) {
    if (arah == "kiri") {
      arah = "kiri";
    } else {
      arah = "kanan";
    }
  }
  if (e.keyCode == 83) {
    if (arah == "atas") {
      arah = "atas";
    } else {
      arah = "bawah";
    }
  }
}

function intervalSnake() {
  interval = setInterval(() => {
    ctx.clearRect(0, 0, wCanvas, hCanvas);

    drawBoard();
    let head;
    if (snake.length > 0) {
      head = { x: snake[0].x, y: snake[0].y };

      if (arah == "kanan") {
        head.x += 1;
      } else if (arah == "kiri") {
        head.x -= 1;
      } else if (arah == "atas") {
        head.y -= 1;
      } else if (arah == "bawah") {
        head.y += 1;
      }
      if (head.x > 47) {
        head.x = 0;
      }
      if (head.x < 0) {
        head.x = 48;
      }
      if (head.y > 29) {
        head.y = 0;
      }
      if (head.y < 0) {
        head.y = 30;
      }
      drawSnake();
      snake.forEach((s) => {
        if (head.x === s.x && head.y === s.y) {
          audioGameOver.currentTime = 0;
          audioUtama.pause();
          audioGameOver.play();
          popupGameOver.classList.add("active");
          let highscore = localStorage.getItem("highscore");

          if (highscore) {
            if (score > highscore) {
              localStorage.setItem("highscore", score);
              numberHighScore.innerHTML = score;
            } else {
              localStorage.setItem("highscore", highscore);
              numberHighScore.innerHTML = highscore;
            }
          } else {
            localStorage.setItem("highscore", score);
            numberHighScore.innerHTML = score;
          }
          stopIntervalTime();

          stopIntervalFood();
          snake = [];

          food = [];
          arah = "kanan";
          jam = 0;
          menit = 0;
          detik = 0;
          score = 6;
          scoreHtml.innerHTML = score;
          timerHtml.innerHTML = `${jam} : ${menit
            .toString()
            .padStart(2, "0")} : ${detik.toString().padStart(2, "0")}`;
        }
        drawSnake();
      });
      snake.unshift(head);

      let makan = false;
      food.forEach((f, i) => {
        if (head.x === f.x && head.y == f.y) {
          audioEaten.currentTime = 0;

          audioEaten.play();
          score += 1;

          scoreHtml.innerHTML = score;
          food.splice(i, 1);
          makan = true;
        }
      });
      if (!makan) {
        snake.pop();
      }
      drawFood();
    }
  }, 100);
}

btnRestart.addEventListener("click", function () {
  audioClick.currentTime = 0;
  audioClick.play();
  let popupGameOverActive = document.querySelector(".popup-gameover.active");
  audioUtama.currentTime = 0;
  audioUtama.play();
  popupGameOverActive.classList.remove("active");
  arah = "kanan";
  snake = [
    { x: 24, y: 15 },
    { x: 23, y: 15 },
    { x: 22, y: 15 },
    { x: 21, y: 15 },
    { x: 20, y: 15 },
    { x: 19, y: 15 },
  ];
  intervalTime();
  createFood();
  startIntervalFood();
  startIntervalRemoveFood();
});
function stopIntervalSnake() {
  clearInterval(interval);
}
function main() {
  ctx.clearRect(0, 0, wCanvas, hCanvas);
  updateSnakeHistory();
  startIntervalFood();
  startIntervalRemoveFood();
  drawBoard();
  createFood();
  drawFood();
  intervalSnake();
  intervalTime();
  document.addEventListener("keydown", update);
}
