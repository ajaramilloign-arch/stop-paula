let roomId = "";

let playerName = "";

let isHost = false;

let timerInterval = null;

const letters =
"ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";

// ===================================
// FIREBASE
// ===================================



// ===================================
// LETRA RANDOM
// ===================================

function randomLetter(){

  return letters[
    Math.floor(Math.random() * letters.length)
  ];

}

// ===================================
// CODIGO SALA
// ===================================

function roomCode(){

  return Math.random()
    .toString(36)
    .substring(2,7)
    .toUpperCase();

}

// ===================================
// CREAR SALA
// ===================================

function createRoom(){

  playerName =
    document.getElementById("playerName")
    .value
    .trim();

  if(!playerName){

    alert("Escribe tu nombre");

    return;
  }

  roomId = roomCode();

  isHost = true;

  db.ref("rooms/" + roomId).set({

    host: playerName,

    started:false,

    currentLetter:"-",

    timer:60,

    players:{
      [playerName]:true
    },

    scores:{
      [playerName]:0
    },

    answers:{}

  });

  enterRoom();

}

// ===================================
// UNIRSE SALA
// ===================================

function joinRoom(){

  playerName =
    document.getElementById("playerName")
    .value
    .trim();

  roomId =
    document.getElementById("roomCode")
    .value
    .trim()
    .toUpperCase();

  if(!playerName || !roomId){

    alert("Completa todo");

    return;
  }

  db.ref("rooms/" + roomId + "/players/" + playerName)
    .set(true);

  db.ref("rooms/" + roomId + "/scores/" + playerName)
    .set(0);

  enterRoom();

}

// ===================================
// ENTRAR
// ===================================

function enterRoom(){

  document.getElementById("home")
    .classList.add("hidden");

  document.getElementById("game")
    .classList.remove("hidden");

  document.getElementById("welcome")
    .innerHTML =
    `Hola ${playerName} 👋`;

  document.getElementById("roomInfo")
    .innerHTML =
    `🎮 Sala: <b>${roomId}</b>`;

  if(!isHost){

    document.getElementById("startBtn")
      .style.display = "none";

  }

  listenRoom();

}

// ===================================
// ESCUCHAR FIREBASE
// ===================================

function listenRoom(){

  db.ref("rooms/" + roomId)
    .on("value", snapshot=>{

      const data = snapshot.val();

      if(!data) return;

      document.getElementById("currentLetter")
        .textContent =
        data.currentLetter;

      document.getElementById("timer")
        .textContent =
        data.timer;

      const scores =
        Object.values(data.scores || {});

      document.getElementById("score1")
        .textContent =
        scores[0] || 0;

      document.getElementById("score2")
        .textContent =
        scores[1] || 0;

      if(data.started){

        document.getElementById("status")
          .innerHTML =
          "🎮 Juego iniciado";

      }

    });

}

// ===================================
// INICIAR
// ===================================

function startGame(){

  if(!isHost) return;

  clearInterval(timerInterval);

  const letter = randomLetter();

  db.ref("rooms/" + roomId)
    .update({

      started:true,

      currentLetter:letter,

      timer:60,

      answers:{}

    });

  clearInputs();

  startTimer();

}

// ===================================
// TIMER
// ===================================

function startTimer(){

  if(!isHost) return;

  timerInterval =
  setInterval(async ()=>{

    const snapshot =
      await db.ref(
        "rooms/" + roomId + "/timer"
      ).get();

    let time = snapshot.val();

    if(time <= 0){

      clearInterval(timerInterval);

      compareAnswers();

      return;

    }

    db.ref("rooms/" + roomId)
      .update({

        timer: time - 1

      });

  },1000);

}

// ===================================
// LIMPIAR INPUTS
// ===================================

function clearInputs(){

  document.getElementById("animal").value="";
  document.getElementById("country").value="";
  document.getElementById("city").value="";
  document.getElementById("food").value="";
  document.getElementById("color").value="";
  document.getElementById("name").value="";
  document.getElementById("object").value="";

}

// ===================================
// ENVIAR RESPUESTAS
// ===================================

function submitAnswers(){

  const answers = {

    animal:
    document.getElementById("animal")
    .value
    .trim(),

    country:
    document.getElementById("country")
    .value
    .trim(),

    city:
    document.getElementById("city")
    .value
    .trim(),

    food:
    document.getElementById("food")
    .value
    .trim(),

    color:
    document.getElementById("color")
    .value
    .trim(),

    name:
    document.getElementById("name")
    .value
    .trim(),

    object:
    document.getElementById("object")
    .value
    .trim()

  };

  db.ref(
    "rooms/" +
    roomId +
    "/answers/" +
    playerName
  ).set(answers);

  document.getElementById("status")
    .innerHTML =
    "✅ Respuestas enviadas";

}

// ===================================
// COMPARAR RESPUESTAS
// ===================================

async function compareAnswers(){

  const snapshot =
    await db.ref(
      "rooms/" + roomId + "/answers"
    ).get();

  const allAnswers =
    snapshot.val();

  if(!allAnswers) return;

  const players =
    Object.keys(allAnswers);

  if(players.length < 2){

    alert("Falta un jugador");

    return;
  }

  const p1 =
    allAnswers[players[0]];

  const p2 =
    allAnswers[players[1]];

  let score1 = 0;
  let score2 = 0;

  let html = `

  <table class="stopTable">

  <tr>

    <th>Categoría</th>

    <th>${players[0]}</th>

    <th>${players[1]}</th>

  </tr>

  `;

  Object.keys(p1).forEach(category=>{

    const a1 =
      p1[category]
      .toLowerCase();

    const a2 =
      p2[category]
      .toLowerCase();

    if(a1 && a2){

      if(a1 === a2){

        score1 += 50;
        score2 += 50;

      }else{

        score1 += 100;
        score2 += 100;

      }

    }else if(a1){

      score1 += 100;

    }else if(a2){

      score2 += 100;

    }

    html += `

    <tr>

      <td>${category}</td>

      <td>${p1[category]}</td>

      <td>${p2[category]}</td>

    </tr>

    `;

  });

  html += "</table>";

  db.ref("rooms/" + roomId + "/scores")
    .set({

      [players[0]]:score1,

      [players[1]]:score2

    });

  document.getElementById("results")
    .innerHTML = html;

}