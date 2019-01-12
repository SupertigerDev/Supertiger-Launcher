const {
    ipcRenderer
} = require('electron');
const remote = require('electron').remote;
const path = require('path');
const fs = require('fs');
const os = require('os')
const Vibrant = require('node-vibrant')
const Store = require('electron-store');
const store = new Store();
const slash = require('slash')
const app = remote.app;

let games = store.get("games");

const closeAppButton = document.getElementById('closeButton');
const pinOption = document.getElementById('pinOption');
const rightClickMenu = document.getElementById('rightClickMenu');
const gameList = document.getElementById('gameList');
const menu = document.querySelector(".menu");
const totalGamesSpan = document.getElementById('totalGamesSpan')
const totalpinnedSpan = document.getElementById('totalPinnedSpan')
const addGameButton = document.getElementById('addGame');

let menuVisible = false;
let closeButtonClicked = false;
let lastGameClickedID;
let totalGames = 0;
let totalPinned = 0;



loadGames()



function loadGames() {
    totalGames = 0;
    totalPinned = 0;

    let gamesToArray = [];

    for (index in games) {
        const game = games[index];
        game.id = index
        gamesToArray.push(game)
    }
    let append = document.createElement('div');
    for (let index = gamesToArray.length - 1; index > -1; index--) {
        totalGames += 1;
        const element = gamesToArray[index];
        const id = element.id

        if (element.pinned === undefined || element.pinned === false) {
            append.innerHTML += `
            <div class="game gameID-${id}">${element.nickname}<span class="game-path">${element.gamePath}</span></div>
            `
        }else {
            totalPinned += 1;
            append.innerHTML = `
            <div class="game gameID-${id} pinned">${element.nickname}<span class="game-path">${element.gamePath}</span></div>
            ` + append.innerHTML;
        }

    }
    totalGamesSpan.innerText = totalGames;
    totalPinnedSpan.innerText = totalPinned;
    gameList.innerHTML = append.innerHTML;
}


ipcRenderer.on('reload', () => {
    games = store.get("games");
    loadGames();
})

function toggleMenu(command) {
    menu.style.display = command === "show" ? "block" : "none";
    menuVisible = !menuVisible;
};

function setPosition ({top,left}) {
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    toggleMenu('show');
};


addGame.addEventListener('click', () => {
    ipcRenderer.send('open-file-browser-manage')
})


gameList.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    let game = e.target.closest('.game');
    if (game) {
        lastGameClickedID = game.classList[1].split('-')[1];
        if (games[lastGameClickedID].pinned === true){
            pinOption.innerText = "Unpin from top"
        } else {
            pinOption.innerText = "Pin to top"
        }
        const origin = {
            left: e.pageX,
            top: e.pageY
          };
          setPosition(origin);
          return false;
    }
})

rightClickMenu.addEventListener('click', (e) => {
    const target = e.target.closest('.menu-option');

    if (target) {
        if(target.id == "pinOption"){
            if (games[lastGameClickedID].pinned === undefined || games[lastGameClickedID].pinned === false) {
                if (totalPinned >= 7) {
                    alert("You have reached the max limit!")
                    return
                }
                store.set('games.' + lastGameClickedID + '.pinned', true)
                console.log("pinned")
            } else {
                store.set('games.' + lastGameClickedID + '.pinned', false)
                console.log("unpined")
            }
            games = store.get("games");
            loadGames();
            ipcRenderer.send('reloadList');
        } else if (target.id == "deleteOption") {
            console.log("deleted")
            store.delete('games.' + lastGameClickedID);

            document.querySelector('.gameID-' + lastGameClickedID).outerHTML = "";

            games = store.get("games");
            loadGames();
            ipcRenderer.send('reloadList');
        } else if(target.id == "editOption"){
            ipcRenderer.send('open-icon-picker', lastGameClickedID);
        }
    }
})

window.addEventListener("click", e => {
    toggleMenu("hide");
});


closeAppButton.addEventListener('click', () => {
    closeButtonClicked = true;
    document.body.style.opacity = 0;

});

// css event end transitions
document.body.addEventListener('webkitTransitionEnd', event => {

    // close app on opacity 0
    if (event.target.tagName === "BODY" && closeButtonClicked) {
        ipcRenderer.send('close-me-manage');
    }

}, false);