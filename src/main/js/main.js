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
const {
    dialog
} = require('electron').remote

const app = remote.app;

const dir = path.join(app.getPath('userData'), "icons")
window.$ = window.jQuery = require('jquery');
const gameColorStyle = document.getElementById('gameColorStyle');
const tinyView = document.getElementById('tinyView');
const appendTiny = document.getElementById('appendTiny');
const toggleViewButton = document.getElementById('toggleViewButton');
const bigViewTop = document.getElementById('bigViewTop');
const searchBox = document.getElementById('searchBox');
const launchers = document.getElementById('launchers')
const themeLink = document.getElementById('themeLink');
const cp = require("child_process");
let launchersStore = store.get('launchers')
let games = store.get('games')
let config = store.get('config')
let theme = store.get('theme')
let tinyViewStatus = true;

appendTinyList();

ipcRenderer.on('reloadList', () => {
    games = store.get('games')
    if (searchBox.value.trim() == "" && tinyViewStatus == false){
        search(searchBox.value);
        return;
    }
    if (tinyViewStatus == true) {
        appendTinyList();
    } else {
        appendExpandedList();
    }
})

ipcRenderer.on('reload-theme', () => {
    config = store.get('config');
    loadTheme()
    if (config.changeBackground === false) {
        tinyView.removeAttribute('style')
    }
})
function loadTheme() {
    theme = store.get('theme')
    if (theme == undefined) {
        themeLink.removeAttribute('href')
        return;
    }
    themeLink.setAttribute('href', "../../themes/" + theme.folderName+"/" +theme.config.fileName )
}
loadTheme();

launchers.addEventListener('click', (event) => {
    const closest = event.target.closest('.launcher')
    const name = closest.classList[1];
    if (closest) {
        if (launchersStore === undefined || launchersStore[closest.classList[1]] === undefined) {

            let launcherPath = dialog.showOpenDialog({
                filters: [{
                    name: 'Executable',
                    extensions: ['exe']
                }],
                properties: ['openFile']
            });
            if (launcherPath === undefined) return;
            store.set('launchers.' + closest.classList[1] + '.path', launcherPath[0]);
            launchersStore = store.get('launchers')
            alert("Launcher added!")
        } else{
            cp.exec( `cd "${path.join(launchersStore[name].path, "../")}" && "${launchersStore[name].path}"`, function(error,stdout,stderr){
                if (error) throw error;
                console.log(stdout)
            });
        }
    }
})

function appendTinyList() {
    searchBox.value = "";
    let append = document.createElement('div');
    let gamesToArray = [];
    let totalIndexed = 0;
    let dir = path.join(app.getPath('userData'), "icons")
    for (let game in games){
        const element = games[game];
        element.id = game;
        gamesToArray.push(element);
    }
    let pinnedGamesArray = gamesToArray.filter(game => {
        return game.pinned == true
    })

    for (let index = 0; index < pinnedGamesArray.length; index++) {
        const element = pinnedGamesArray[index];
        totalIndexed++;
        append.innerHTML += `
        <div class="game gameID-${element.id}">
            <div class="game-icon" style="background-image: url(${slash(path.join(dir,element.icon)).replace(' ', "%20")})"></div>
            <div class="game-name">${element.nickname}</div>
        </div>
        `
        Vibrant.from(path.join(dir, element.icon)).getPalette().then((palette) => {

            gameColorStyle.innerHTML +=
                `
            .gameID-${element.id} {background-color: rgba( ${palette.Vibrant.getRgb().join(",")}, 0.100 )}
            .gameID-${element.id}:hover {background-color: rgba( ${palette.Vibrant.getRgb().join(",")}, 0.500 )}
            `

        })
        
    }

    for (let game in games) {
        if (totalIndexed >= 7) {
            break;
        }
        const element = games[game];

        if (element.pinned === undefined || element.pinned === false) {
            totalIndexed++;
            append.innerHTML += `
            <div class="game gameID-${game}">
                <div class="game-icon" style="background-image: url(${slash(path.join(dir,element.icon)).replace(' ', "%20")})"></div>
                <div class="game-name">${element.nickname}</div>
            </div>
        `
        }
        Vibrant.from(path.join(dir, element.icon)).getPalette().then((palette) => {

            gameColorStyle.innerHTML +=
                `
            .gameID-${game} {background-color: rgba( ${palette.Vibrant.getRgb().join(",")}, 0.100 )}
            .gameID-${game}:hover {background-color: rgba( ${palette.Vibrant.getRgb().join(",")}, 0.500 )}
            `

        })
    }
    if (tinyViewStatus == true) appendTiny.innerHTML = append.innerHTML;
}

function appendExpandedList() {
    let append = document.createElement('div');
    let gamesToArray = [];

    for (let game in games){
        const element = games[game];
        element.id = game;
        gamesToArray.push(element);
    }
    let pinnedGamesArray = gamesToArray.filter(game => {
        return game.pinned == true
    })

    append.innerHTML = `<div class="category">Pinned games</div>`
    for (let index = 0; index < pinnedGamesArray.length; index++) {
        const element = pinnedGamesArray[index];

        append.innerHTML += `
        <div class="game gameID-${element.id}">
            <div class="game-icon" style="background-image: url(${slash(path.join(dir,element.icon)).replace(' ', "%20")})"></div>
            <div class="game-name">${element.nickname}</div>
        </div>
        `
        Vibrant.from(path.join(dir, element.icon)).getPalette().then((palette) => {

            gameColorStyle.innerHTML +=
                `
            .gameID-${element.id} {background-color: rgba( ${palette.Vibrant.getRgb().join(",")}, 0.100 )}
            .gameID-${element.id}:hover {background-color: rgba( ${palette.Vibrant.getRgb().join(",")}, 0.500 )}
            `
        })
    }
    append.innerHTML += `<div class="category">All games</div>`
    for (let game in games) {

        const element = games[game];

        if (element.pinned === undefined || element.pinned === false) {
            append.innerHTML += `
            <div class="game gameID-${game}">
                <div class="game-icon" style="background-image: url(${slash(path.join(dir,element.icon)).replace(' ', "%20")})"></div>
                <div class="game-name">${element.nickname}</div>
            </div>
        `
        }
        Vibrant.from(path.join(dir, element.icon)).getPalette().then((palette) => {

            gameColorStyle.innerHTML +=
                `
            .gameID-${game} {background-color: rgba( ${palette.Vibrant.getRgb().join(",")}, 0.100 )}
            .gameID-${game}:hover {background-color: rgba( ${palette.Vibrant.getRgb().join(",")}, 0.500 )}
            `

        })
    }
    if (tinyViewStatus == false) appendTiny.innerHTML = append.innerHTML;
}


window.addEventListener("blur", function(event) { 

    if (tinyViewStatus == false) {
        tinyViewStatus = true;
        appendTiny.style.opacity = 0;
        tinyView.style.height = "130px";
        bigViewTop.style.transform = "translateY(-90px)";
        setTimeout(() => {
            appendTinyList();
            appendTiny.style = ""

            bigViewTop.style.display = "none";
        }, 400);

        setTimeout(() => {
            appendTiny.style.opacity = 1;
            ipcRenderer.send("shrink-main-window");
        }, 450);

    }
},false);

toggleViewButton.addEventListener('click', () => {
    tinyViewStatus = !tinyViewStatus;
    // if expanded view is enabled

    if (tinyViewStatus == false) {
        ipcRenderer.send("expand-main-window");
        tinyView.style.height = "calc(100% - 40px)";
        appendTiny.style.opacity = 0;
        setTimeout(() => {
            appendExpandedList()
            bigViewTop.style.display = "block";
            appendTiny.style.paddingTop = "10px"
            appendTiny.style.overflow = "overlay";
            appendTiny.style.height = "calc(100% - 90px)";
        }, 450);

        setTimeout(() => {
            appendTiny.style.opacity = 1;
            bigViewTop.style.transform = "translateY(0px)";
        }, 500);

    // if tiny view is enabled
    } else {
        appendTiny.style.opacity = 0;
        tinyView.style.height = "130px";
        bigViewTop.style.transform = "translateY(-90px)";
        setTimeout(() => {
            appendTinyList();
            appendTiny.style = ""

            bigViewTop.style.display = "none";
        }, 400);

        setTimeout(() => {
            appendTiny.style.opacity = 1;
            ipcRenderer.send("shrink-main-window");
        }, 450);
    }

})

searchBox.addEventListener('keyup', () => {
    search(searchBox.value);
})


$('#tinyView').on('dblclick', '.game', (event) => {
    const gameID = event.target.closest('.game').classList[1].split('-')[1];
    cp.exec( `cd "${path.join(games[gameID].gamePath, "../")}" && "${games[gameID].gamePath}"`, function(error,stdout,stderr){
        if (error) throw error;
        console.log(stdout)
    }); 
})

$('#tinyView').on('click', '.game', (event) => {

    const gameID = event.target.closest('.game').classList[1].split('-')[1];
    const element = $('.gameID-' + gameID);
    if (config !== undefined && config.changeBackground === false) return;
    tinyView.style.backgroundColor = element.css('background-color').replace(/[^,]+(?=\))/, '0.5');

})

function search(value){

    if (value.trim() == ""){
        if (tinyViewStatus == false){
            appendExpandedList();
        }else {
            appendTinyList();
        }
        return;
    }

    const append = document.createElement("div");
    let gamesFound = 0;
    for(let gameID in games) {
        const element = games[gameID];
        const nickname = element.nickname;
        if (nickname.toLowerCase().includes(value.toLowerCase())){
            gamesFound++;
            
            append.innerHTML += `
            <div class="game gameID-${element.id}">
                <div class="game-icon" style="background-image: url(${slash(path.join(dir,element.icon)).replace(' ', "%20")})"></div>
                <div class="game-name">${element.nickname}</div>
            </div>
            `
        }
    }
    if (gamesFound == 0){
        append.innerHTML = "<div class='message'>Uh oh! No games were found.</div>"
    }
    if (tinyViewStatus == false) appendTiny.innerHTML = append.innerHTML;
}