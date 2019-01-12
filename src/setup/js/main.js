const {
    ipcRenderer
} = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os')
const Vibrant = require('node-vibrant')
const Store = require('electron-store');
const store = new Store();
const slash = require('slash')

const remote = require('electron').remote;
const app = remote.app;

const closeAppButton = document.getElementById('closeButton');
const addGameButton = document.getElementById('addGameButton');
const doneButton = document.getElementById('doneButton');

let closeButtonClicked = false;





ipcRenderer.on('get-game', (event, details) => {

    const {gamePath, icon, nickname} = details

    let gameList = document.getElementById('gameList');
    let append = document.createElement("div");
    append.classList.add("game")

    append.innerHTML = `
        <div class="icon image"></div>
        <div class="name">${nickname}</div>
    `
    let dir = path.join(app.getPath('userData'), "icons")

    Vibrant.from(path.join(dir, icon)).getPalette().then((palette) => {
        append.style.backgroundColor = "rgba(" + palette.Vibrant.getRgb().join(",") + ",0.100)"
    })


    append.children[0].style.backgroundImage = `url(${"file://" + slash(path.join(dir,icon)).replace(' ', "%20") })`
    gameList.insertBefore(append, gameList.firstChild)

})


closeAppButton.addEventListener('click', () => {
    closeButtonClicked = true;
    document.body.style.opacity = 0;

});


doneButton.addEventListener('click', () => {
    if ( store.get().games === undefined || store.get().games == "") {
        alert('You must choose at least one game before you can continue.')
        return;
    }
    ipcRenderer.send('close-me-setup');
})

// Add Game
addGameButton.addEventListener('click', () => {
    ipcRenderer.send('open-file-browser');
})

// css event end transitions
document.body.addEventListener('webkitTransitionEnd', event => {

    // close app on opacity 0
    if (event.target.tagName === "BODY" && closeButtonClicked) {
        ipcRenderer.send('close-me');
    }

}, false);