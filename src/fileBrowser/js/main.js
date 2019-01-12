window.$ = window.jQuery = require('jquery');
const {
    ipcRenderer
} = require('electron');
const Store = require('electron-store');
const store = new Store();

const fs = require('fs');
const os = require('os')
const path = require('path');
const ws = require('windows-shortcuts');
const iconExtractor = require('icon-extractor');
const slash = require('slash');
var diskInfo = require('diskinfo');

const closeAppButton = document.getElementById('closeButton');
const filesArea = document.getElementById('filesArea')
const backButton = document.getElementById('backButton');
const doneButton = document.getElementById('doneButton');


let closeButtonClicked = false;
let currentLocation = "D:/";
let clickedFile;

doneButton.addEventListener('click', () => {
    if (clickedFile === undefined) {
        alert("You must choose a game before you can continue.")
        return;
    }
    ipcRenderer.send('close-file-browser', path.join(currentLocation, clickedFile));
})

backButton.addEventListener('click', () => {

    let split = currentLocation.split("/");

    if (split.length === 2 && split[1] === ""){
        return;
    }

    if(split[split.length - 1] === "") {
        currentLocation = currentLocation.substr(0, currentLocation.lastIndexOf("/") + 1);


    } else {
        currentLocation = currentLocation.substr(0, currentLocation.lastIndexOf("/"));
        split = currentLocation.split("/");
        if (split.length === 1 && split[1] === undefined){
            console.log("test")
            currentLocation += "/"
        }
    }

    loadDir(currentLocation)
})

diskInfo.getDrives(function(err, aDrives) {
    const drives = document.getElementById('drives')
    const appendDrives = document.createElement("div");
    for (var i = 0; i < aDrives.length; i++) {
          appendDrives.innerHTML += `
            <div class="drive-list">
                ${aDrives[i].mounted} Drive
            </div>
          `
    }
    drives.innerHTML = appendDrives.innerHTML;

});

$('#drives').on('click', '.drive-list', (event) => {
    const element = event.target.closest('.drive-list');
    const driveLetter = element.innerText.split(":")[0]
    currentLocation = driveLetter + ":/";
    loadDir(currentLocation);

})


filesArea.addEventListener('click', event => {
    file = event.target.closest('.file');
    if (!file) return;

    document.querySelectorAll('.file').forEach(function(el) {
        el.removeAttribute("style");
    })

    if(file.children[0].innerText !== 'insert_drive_file') {
        currentLocation = path.join(currentLocation, file.children[1].innerText);
        loadDir(currentLocation)
        clickedFile = undefined;
        return;
    }
    clickedFile = file.children[1].innerText;
    file.style.backgroundColor = "rgba(57, 143, 255, 0.863)"

})


loadDir(currentLocation)


function loadDir(dirPath) {
    currentLocation = slash(currentLocation);
    filesArea.innerHTML = "";
    var toAppend = document.createElement("toAppend");

    fs.readdir(dirPath, function (err, items) {


        if (typeof items == "undefined") {
            return
        }
        for (var i = 0; i < items.length; i++) {
            const name = items[i];
            let isDirectory;
            try {
                isDirectory = fs.lstatSync(path.join(dirPath, items[i])).isDirectory();
            } catch (err) {

            }
            
            if (!isDirectory) {
                if (name.toLowerCase().endsWith('.lnk') || name.toLowerCase().endsWith('.exe')) {
                    toAppend.innerHTML += template(name, isDirectory);
                }
            } else {
                toAppend.innerHTML += template(name, isDirectory);
            }
        }
        filesArea.innerHTML = toAppend.innerHTML;

        function template(name, isFolder) {

            return `
            <div class="file"><i class="material-icons ${ (isFolder) ? "folder-icon" : "file-icon" }">${ (isFolder) ? "folder" : "insert_drive_file" }</i>
            <div class="file-name">${name}</div>
        </div>
            `
        }

    });
}







closeAppButton.addEventListener('click', () => {
    closeButtonClicked = true;
    document.body.style.opacity = 0;

});


// css event end transitions
document.body.addEventListener('webkitTransitionEnd', event => {

    // close app on opacity 0
    if (event.target.tagName === "BODY" && closeButtonClicked) {
        ipcRenderer.send('close-me-file-browser');
    }

}, false);