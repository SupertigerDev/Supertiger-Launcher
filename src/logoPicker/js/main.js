const {
    ipcRenderer
} = require('electron');
const {
    dialog
} = require('electron').remote

const remote = require('electron').remote;
const app = remote.app;
const Store = require('electron-store');
const store = new Store();


const path = require('path');
const fs = require('fs');
const Vibrant = require('node-vibrant')
const fii = require('file-icon-info');
const ws = require('windows-shortcuts');


const closeAppButton = document.getElementById('closeButton');
const doneButton = document.getElementById('doneButton');
const browseButton = document.getElementById('browseButton');
const iconElement = document.getElementById('icon');
const iconContainer = document.getElementById('iconContainer')
const nickname = document.getElementById('nickname')
const loadingWindow = document.getElementById('loadingWindow')


let logoPath;
let closeButtonClicked = false;
let filePath;
let shortcutExePath;
let gameID;


ipcRenderer.on('gameID', (event, _gameID) => {
    gameID = _gameID;

    const dir = path.join(app.getPath('userData'), "icons")

    const game = store.get('games.' + gameID);
    const nick = game.nickname;
    const icon = game.icon;
    nickname.value = nick
    
    fs.readFile(path.join(dir, icon), function(err, base64) {
        displaychanges(icon, dir, base64.toString('base64'))
    })
    
})


ipcRenderer.on('path', (event, _filePath) => {
    filePath = _filePath;


    const name = path.parse(path.basename(filePath)).name;
    document.getElementById('game-name').innerText = name;
    nickname.value = name

    if (path.extname(filePath).toLowerCase() === ".lnk") {

        ws.query(filePath, (err, details) => {
            if (err) throw err;

            shortcutExePath = details.target;
            console.log(details)
            selectImage(shortcutExePath, true);
        })
        return;
    }
    selectImage(filePath, true);

})

browseButton.addEventListener('click', () => {

    let imgPath = dialog.showOpenDialog({
        filters: [{
            name: 'Images',
            extensions: ['jpg', 'png', 'gif']
        }],
        properties: ['openFile']
    });



    if (imgPath === undefined) return;


    selectImage(imgPath[0], false);

})


function selectImage(iconPath, isExePath) {

    let _img;
    if(isExePath) {
        fii.getIcon(iconPath, (data) => {
            saveAndShow(data);
        })
    } else {
        _img = fs.readFileSync(iconPath).toString('base64');
        saveAndShow(_img);
    }


    function saveAndShow (base64) {


        let fileName = Date.now().toString() + ".png";

        let dir = path.join(app.getPath('userData'), "icons")
    
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    
        fs.writeFile(path.join(dir, fileName), base64, {
            encoding: 'base64'
        }, function (err) {
            if (err) throw err;
            displaychanges(fileName, dir, base64)
        });
    }

}

function displaychanges(logoFile, dir, base64) {

    logoPath = logoFile;
    iconElement.style.backgroundImage = `url(data:image/png;base64,${base64})`

    Vibrant.from(path.join(dir, logoFile)).getPalette().then((palette) => {
        iconContainer.style.backgroundColor = "rgba(" + palette.Vibrant.getRgb().join(",") + ",0.100)"
        loadingWindow.style.display = "none";
        doneButton.style.display = "inline-block";
    }).catch(err => {
        console.error(err)
        loadingWindow.style.display = "none";
        doneButton.style.display = "inline-block";
    })
}



doneButton.addEventListener('click', () => {
    if (logoPath === undefined) {
        alert("You must browse for an image before continuing!")
        return;
    }
    if (gameID === undefined){
        ipcRenderer.send('close-logo-picker', filePath, logoPath, nickname.value);
    }else {
        ipcRenderer.send('close-logo-picker', filePath, logoPath, nickname.value, gameID);
    }
})




closeAppButton.addEventListener('click', () => {
    closeButtonClicked = true;
    document.body.style.opacity = 0;

});


// css event end transitions
document.body.addEventListener('webkitTransitionEnd', event => {

    // close app on opacity 0
    if (event.target.tagName === "BODY" && closeButtonClicked) {
        ipcRenderer.send('close-me-logo-picker');
    }

}, false);