const columns = 20;
const rows = 10;
const tileCount = columns * rows;
const teamColors = ["#38bdf8", "#fb7185", "#a3e635", "#c084fc", "#f97316", "#2dd4bf"];

const grid = document.querySelector("#tile-grid");
const teamCountSelect = document.querySelector("#team-count");
const scoreboard = document.querySelector("#scoreboard");
const resetButton = document.querySelector("#reset-board");

let teamCount = Number(teamCountSelect.value);
let activeTeam = 0;
let revealedByTeam = Array.from({ length: teamCount }, () => 0);

function renderScoreboard() {
  scoreboard.innerHTML = "";

  revealedByTeam.forEach((revealedTiles, index) => {
    const team = document.createElement("div");
    team.className = `team-pill${index === activeTeam ? " active" : ""}`;
    team.style.setProperty("--accent", teamColors[index]);
    team.innerHTML = `<span>Tým ${index + 1}</span><strong>${revealedTiles}</strong>`;
    scoreboard.append(team);
  });
}

function revealTile(tile) {
  if (tile.classList.contains("revealed")) {
    return;
  }

  tile.classList.add("revealed");
  revealedByTeam[activeTeam] += 1;
  activeTeam = (activeTeam + 1) % teamCount;
  renderScoreboard();
}

function buildBoard() {
  grid.innerHTML = "";

  for (let index = 0; index < tileCount; index += 1) {
    const tile = document.createElement("button");
    tile.className = "tile";
    tile.type = "button";
    tile.setAttribute("aria-label", `Odkrýt políčko ${index + 1}`);
    tile.addEventListener("click", () => revealTile(tile));
    grid.append(tile);
  }
}

function resetGame() {
  activeTeam = 0;
  revealedByTeam = Array.from({ length: teamCount }, () => 0);
  buildBoard();
  renderScoreboard();
}

teamCountSelect.addEventListener("change", (event) => {
  teamCount = Number(event.target.value);
  resetGame();
});

resetButton.addEventListener("click", resetGame);

resetGame();
