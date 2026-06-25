const columns = 10;
const rows = 5;
const teamColors = ["#38bdf8", "#fb7185", "#a3e635", "#c084fc", "#f97316", "#2dd4bf"];

const QUESTIONS = {
  who: "Kdo je na fotce?",
  "who-and-where": "Kdo je na fotce a kde byla fotka pořízena?",
};

const grid = document.querySelector("#tile-grid");
const photo = document.querySelector("#photo");
const questionText = document.querySelector("#question-text");
const startScreen = document.querySelector("#start-screen");
const gamePanel = document.querySelector("#game-panel");
const teamCountSelect = document.querySelector("#team-count");
const teamSummary = document.querySelector("#team-summary");
const startGameButton = document.querySelector("#start-game");
const scoreboard = document.querySelector("#scoreboard");
const guessActions = document.querySelector("#guess-actions");
const resetButton = document.querySelector("#reset-board");
const resetOrderButton = document.querySelector("#reset-order");
const revealAllButton = document.querySelector("#reveal-all");
const nextPhotoButton = document.querySelector("#next-photo");
const sessionStatus = document.querySelector("#session-status");

let teamCount = 2;
let activeTeam = 0;
let teamPoints = [];
let revealedByTeam = [];
let photoQueue = [];
let currentPhoto = null;
let roundActive = true;

function photoUrl(path) {
  return path.split("/").map((segment) => encodeURIComponent(segment)).join("/");
}

function shuffle(array) {
  const copy = [...array];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function teamCountLabel(count) {
  if (count === 1) {
    return "1 tým";
  }

  if (count >= 2 && count <= 4) {
    return `${count} týmy`;
  }

  return `${count} týmů`;
}

function updateTeamSummary() {
  teamSummary.textContent = teamCountLabel(teamCount);
}

function startGame() {
  teamCount = Number(teamCountSelect.value);
  updateTeamSummary();
  startScreen.hidden = true;
  startScreen.classList.add("hidden");
  gamePanel.hidden = false;
  gamePanel.classList.remove("hidden");
  initSession();
}

function initTeamState() {
  teamPoints = Array.from({ length: teamCount }, () => 0);
  revealedByTeam = Array.from({ length: teamCount }, () => 0);
}

function resetPhotoOrder() {
  photoQueue = shuffle(window.PHOTO_CATALOG);
  activeTeam = 0;
  loadNextPhoto();
}

function initSession() {
  photoQueue = shuffle(window.PHOTO_CATALOG);
  initTeamState();
  activeTeam = 0;
  loadNextPhoto();
}

function updateSessionStatus() {
  const total = window.PHOTO_CATALOG.length;
  const remaining = photoQueue.length + (currentPhoto ? 1 : 0);
  const used = total - remaining;

  if (!currentPhoto && photoQueue.length === 0) {
    sessionStatus.textContent = "Všechny fotky v sezení byly použity.";
    return;
  }

  sessionStatus.textContent = `Sezení: ${used + 1}. fotka · zbývá ${photoQueue.length} dalších`;
}

function setRoundActive(isActive) {
  roundActive = isActive;
  grid.classList.toggle("locked", !roundActive);
  revealAllButton.disabled = !currentPhoto || isFullyRevealed();
  nextPhotoButton.disabled = !currentPhoto;
}

function isFullyRevealed() {
  return grid.querySelector(".tile:not(.revealed)") === null;
}

function renderScoreboard() {
  scoreboard.innerHTML = "";

  teamPoints.forEach((points, index) => {
    const team = document.createElement("div");
    team.className = `team-pill${index === activeTeam && roundActive ? " active" : ""}`;
    team.style.setProperty("--accent", teamColors[index]);
    team.innerHTML = `
      <span>Tým ${index + 1}</span>
      <strong>${points} ${points === 1 ? "bod" : points >= 2 && points <= 4 ? "body" : "bodů"}</strong>
      <em>${revealedByTeam[index]} políček</em>
    `;
    scoreboard.append(team);
  });
}

function renderGuessActions() {
  guessActions.innerHTML = "";

  if (!roundActive || !currentPhoto) {
    return;
  }

  teamPoints.forEach((_points, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "guess-button";
    button.style.setProperty("--accent", teamColors[index]);
    button.textContent = `Tým ${index + 1} uhodl`;
    button.addEventListener("click", () => awardGuess(index));
    guessActions.append(button);
  });
}

function awardGuess(teamIndex) {
  if (!roundActive || !currentPhoto) {
    return;
  }

  teamPoints[teamIndex] += 1;
  setRoundActive(false);
  renderScoreboard();
  renderGuessActions();
}

function revealTile(tile) {
  if (!roundActive || tile.classList.contains("revealed")) {
    return;
  }

  tile.classList.add("revealed");
  revealedByTeam[activeTeam] += 1;
  activeTeam = (activeTeam + 1) % teamCount;
  renderScoreboard();

  if (isFullyRevealed()) {
    setRoundActive(false);
    renderGuessActions();
  }
}

function tileLabel(column, row) {
  return `${String.fromCharCode(65 + column)}${rows - row}`;
}

function buildBoard() {
  grid.innerHTML = "";
  grid.style.setProperty("--cols", columns);
  grid.style.setProperty("--rows", rows);

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const label = tileLabel(column, row);
      const tile = document.createElement("button");
      tile.className = "tile";
      tile.type = "button";
      tile.textContent = label;
      tile.dataset.label = label;
      tile.setAttribute("aria-label", `Odkrýt políčko ${label}`);
      tile.addEventListener("click", () => revealTile(tile));
      grid.append(tile);
    }
  }
}

function revealAllTiles() {
  grid.querySelectorAll(".tile").forEach((tile) => tile.classList.add("revealed"));
  setRoundActive(false);
  renderScoreboard();
  renderGuessActions();
}

function resetCurrentRound() {
  if (!currentPhoto) {
    return;
  }

  activeTeam = 0;
  revealedByTeam = Array.from({ length: teamCount }, () => 0);
  buildBoard();
  setRoundActive(true);
  renderScoreboard();
  renderGuessActions();
}

function whenPhotoReady(callback) {
  const run = () => requestAnimationFrame(callback);

  if (typeof photo.decode === "function") {
    photo.decode().then(run).catch(run);
    return;
  }

  photo.addEventListener("load", run, { once: true });
  photo.addEventListener("error", run, { once: true });
}

function loadNextPhoto() {
  if (photoQueue.length === 0) {
    currentPhoto = null;
    photo.removeAttribute("src");
    photo.alt = "Žádná další fotka";
    questionText.textContent = "Sezení skončilo";
    grid.innerHTML = "";
    setRoundActive(false);
    renderScoreboard();
    renderGuessActions();
    updateSessionStatus();
    return;
  }

  currentPhoto = photoQueue.shift();
  photo.alt = "Zakrytá fotografie pro hru";
  questionText.textContent = QUESTIONS[currentPhoto.type];
  activeTeam = 0;
  revealedByTeam = Array.from({ length: teamCount }, () => 0);

  const finishPhotoLoad = () => {
    if (!photo.naturalWidth) {
      return;
    }

    buildBoard();
    setRoundActive(true);
    renderScoreboard();
    renderGuessActions();
    updateSessionStatus();
  };

  photo.src = photoUrl(currentPhoto.file);
  whenPhotoReady(finishPhotoLoad);
}

startGameButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetCurrentRound);
resetOrderButton.addEventListener("click", resetPhotoOrder);
revealAllButton.addEventListener("click", revealAllTiles);
nextPhotoButton.addEventListener("click", loadNextPhoto);
