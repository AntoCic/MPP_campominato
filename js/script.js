// Inizializzo variabili del DOM
// header
const header_score = document.getElementById("header_score");
const header_flag = document.getElementById("header_flag");
const rank = document.getElementById("rank");
const reload = document.getElementById("reload");
// main
const field_box = document.getElementById("field_box");
let btnSquare; // diventera un array di elementi che saranno le varie caselle cliccabili del gioco

// Inizializzo e dichiaro variabili utili
let tabsRank = [10, 9, 7]; // difficolta per ogni livello
let bombs; // verra assegnato un array di bombe
let state; // stato di gioco ? in gioco : end game

let tab = []; // sara una matrice contenente lo schema di  gioco

let ListBoxClicked = []; // lista box cliccati
let ListBoxToAutoCheck = []; // lista box non cliccati ma che vengono controllati se hanno vicino un box vuoto

// %-%-%-%-%-% AZIONE AVVIO %-%-%-%-%-%
// genera automaticamente il campo di gioco all'avvo della pg con difficolta "0" === Facile
generateTabStart(0);

reload.addEventListener("click", () => {
  generateTabStart(rank.value);
});

rank.addEventListener("change", () => {
  generateTabStart(rank.value);
});

// Main function che genera il campo di gioco e lo mostra
function generateTabStart(difficulty) {
  // svuoto la matrice contenente lo schema di  gioco
  tab = [];

  // svuoto le liste di box click ed autoclick
  ListBoxClicked = [];
  ListBoxToAutoCheck = [];

  // azzero il contatore del punteggio
  header_score.textContent = getScoreString();

  // svuoto il box
  while (field_box.firstChild) {
    field_box.firstChild.remove();
  }

  // set state in game
  state = true;

  // Creo le bombe
  bombs = getBombs(13, tabsRank[difficulty] * tabsRank[difficulty]);

  // creo la matrice di gioco grezza senza indicazione di bombe vicine
  tab = createRawTab(tabsRank[difficulty]);

  // assegno i numeri che corrispondono alla somma
  // delle bombe vicine
  tab = parseTab(tab);

  // creo la tab di gioco
  createGameTab(tab);

  // assegno gli elementi box cliccabili alla sua variabile
  btnSquare = document.getElementsByClassName("btn-square");
}

// crea un array di array che contiene lo schema di gioco
function createRawTab(n = 10) {
  let i = 0;
  let newTab = [];
  for (let y = 0; y < n; y++) {
    let row = [];
    for (let x = 0; x < n; x++) {
      if (bombs.includes(i)) {
        row.push("b");
      } else {
        row.push("-");
      }
      i++;
    }
    newTab.push(row);
  }
  return newTab;
}

// posizioni numeri
// _____________
// | 1 | 2 | 3 |
// -------------
// | 4 | 5 | 6 |
// -------------
// | 7 | 8 | 9 |
// _____________
// controlla tutta la matrice per assegnare i numeri vicini alle bombe
function parseTab(tab) {
  for (let y = 0; y < tab.length; y++) {
    for (let x = 0; x < tab[y].length; x++) {
      let n = 0;
      if (tab[y][x] !== "b") {
        // controllo riga di sopra
        // controllo posizione numero 1
        if (isBomb(y - 1, x - 1, tab)) n++;
        // controllo posizione numero 2
        if (isBomb(y - 1, x, tab)) n++;
        // controllo posizione numero 3
        if (isBomb(y - 1, x + 1, tab)) n++;

        // controllo riga attuale
        // controllo posizione numero 4
        if (isBomb(y, x - 1, tab)) n++;
        // controllo posizione numero 6
        if (isBomb(y, x + 1, tab)) n++;

        // controllo riga successiva
        // controllo posizione numero 7
        if (isBomb(y + 1, x - 1, tab)) n++;
        // controllo posizione numero 8
        if (isBomb(y + 1, x, tab)) n++;
        // controllo posizione numero 9
        if (isBomb(y + 1, x + 1, tab)) n++;

        if (n === 0) n = "-";
      }
      if (n === 0) n = "b";
      tab[y][x] = String(n);
    }
  }
  return tab;
}

// controlla se in quella posizione cé una bomba
function isBomb(y, x, tab) {
  const max = tab.length;
  if (x >= 0 && y >= 0 && x < max && y < max) {
    if (tab[y][x] === "b") {
      return true;
    } else {
      return false;
    }
  }
}

// secondary important function
// mostra la il campo di gioco e gestisce i click sui box
function createGameTab(tab) {
  field_box.style.setProperty("--n_col", String(tab.length));
  for (const y in tab) {
    for (const x in tab[y]) {
      const e = tab[y][x];
      const btnSquare = document.createElement("div");
      btnSquare.classList.add("btn-square");
      field_box.appendChild(btnSquare);
      if (e === "b") {
        btnSquare.addEventListener("click", () => {
          if (header_flag.checked) {
            btnSquare.classList.toggle("flag");
            header_flag.checked = false;
          } else if (state) {
            btnSquare.classList.add("bomb-esp");
            showBombs(bombs);
            gameOver(ListBoxClicked.length);
          }
        });
      } else {
        btnSquare.addEventListener("click", () => {
          if (state) {
            if (header_flag.checked) {
              btnSquare.classList.toggle("flag");
              header_flag.checked = false;
            } else if (!arrayIncludes(ListBoxClicked, [Number(y), Number(x)])) {
              ListBoxClicked.push([Number(y), Number(x)]);
              btnSquare.classList.add("empty-box");
              btnSquare.classList.remove("flag");
              if (e === "-") {
                ListBoxToAutoCheck.push([Number(y), Number(x)]);
                showAllColseBox(ListBoxToAutoCheck[0], tab);
              } else {
                btnSquare.textContent = e;
              }
              header_score.textContent = getScoreString();
              checkWin(
                ListBoxClicked.length,
                tabsRank[rank.value] * tabsRank[rank.value] - bombs.length
              );
            }
          }
        });
      }
      btnSquare.addEventListener("contextmenu", (e) => {
        btnSquare.classList.toggle("flag");
        e.preventDefault();
      });
    }
  }
}

// crea un array di bombe
function getBombs(quantity, maxVal) {
  let b = [];
  while (b.length < quantity) {
    const n = getRandomNum(maxVal);
    if (!b.includes(n)) {
      b.push(n);
    }
  }
  b.sort(function (a, c) {
    return a - c;
  });
  return b;
}

// mostra le bombe in gioco
function showBombs(bombs) {
  for (let index = 0; index < bombs.length; index++) {
    btnSquare[bombs[index]].classList.add("bomb");
  }
}

// mostra tutte le caselle vuote vicino alla casella cliccata
function showAllColseBox(yx, tab) {
  setTimeout(() => {
    const y = yx[0];
    const x = yx[1];

    if (!arrayIncludes(ListBoxClicked, [y, x])) {
      ListBoxClicked.push([y, x]);
    }

    showColseBox(y - 1, x, tab);

    showColseBox(y, x + 1, tab);

    showColseBox(y, x - 1, tab);

    showColseBox(y + 1, x, tab);

    ListBoxToAutoCheck.shift();

    header_score.textContent = getScoreString();

    // se trova altre caselle vicine vuote si riavvia
    if (ListBoxToAutoCheck.length > 0) {
      showAllColseBox(ListBoxToAutoCheck[0], tab);
    }
  }, 20);
}

// mostra casella vicina e controlla se sono caselle vuote per salvarle e controllarle al prossimo giro
function showColseBox(y, x, tab) {
  const max = tab.length;
  if (x >= 0 && y >= 0 && x < max && y < max) {
    const boxContent = tab[y][x];
    if (boxContent !== "b") {
      const boxIndex = getIndexFromXY(y, x, tab);
      if (boxContent !== "-") {
        btnSquare[boxIndex].textContent = boxContent;
        if (!arrayIncludes(ListBoxClicked, [y, x])) {
          ListBoxClicked.push([y, x]);
        }
      } else {
        if (
          !arrayIncludes(ListBoxClicked, [y, x]) &&
          !arrayIncludes(ListBoxToAutoCheck, [y, x])
        ) {
          ListBoxToAutoCheck.push([y, x]);
        }
      }
      btnSquare[boxIndex].classList.add("empty-box");
      btnSquare[boxIndex].classList.remove("flag");
    }
  }
}

// ritorna index dell' array di elementi box cliccabili
function getIndexFromXY(y, x, tab) {
  return Number(y) * tab.length + Number(x);
}

// modale che spunta nel caso perdi 
function gameOver(score) {
  state = false;
  const modal = document.createElement("div");
  modal.classList.add("ms_modal");
  modal.innerHTML = `
      <div class="ms_modal-box p-1 p-md-3">
        <h1>GAME OVER</h1>
        <p class="h3">score: ${String(score).padStart(2, "0")}</p>
      </div>
  `;
  field_box.appendChild(modal);
}

// modale che spunta nel caso vinci
function checkWin(score, maxScore) {
  if (score === maxScore) {
    state = false;
    const modal = document.createElement("div");
    modal.classList.add("ms_modal");
    modal.innerHTML = `
      <div class="ms_modal-box ms_win p-1 p-md-3">
        <h1>YOU WIN</h1>
        <p class="h3">score: ${getScoreString()}</p>
      </div>
  `;
    field_box.appendChild(modal);
  }
}

// genera un numero casuale da 1 a maxVal
function getRandomNum(maxVal) {
  const n = Math.round(Math.random() * (maxVal - 1)) + 1;
  return n;
}

// funzione che controlla se un array e contenuto in una lista di array
function arrayIncludes(arrOfArr, arr) {
  for (const arr1 of arrOfArr) {
    if (arr1.every((val, index) => val === arr[index])) return true;
  }
  return false;
}

// calcola il punteggio sulla base della difficoltá di gioco
function getScoreString() {
  const x = Number(rank.value) + 1;
  return String(ListBoxClicked.length * x * x).padStart(2, "0");
}
