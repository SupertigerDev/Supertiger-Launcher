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


const closeAppButton = document.getElementById('closeButton');
const themesBox = document.getElementById('themesBox');
const generalBox = document.getElementById('generalBox');
const startupButton = document.getElementById('startup');
const changeBackgroundButton = document.getElementById('changeBackground');

let themeSettings = store.get('theme');
let config = store.get('config');

let closeButtonClicked = false;

themesBox.addEventListener('click', (event) => {
    const closest = event.target.closest('.theme');

    if (closest) {
        const folderName = closest.innerText;
        if (folderName == "Default"){
            store.delete('theme')
            themeSettings = store.get('theme');
            ipcRenderer.send("reload-theme");
            loadThemes()
            return;
        }
        let obj;
        fs.readFile(path.join(__dirname, "../" , "../","themes", folderName, "config.json"), 'utf8', function (err, data) {
            if (err) throw err;
            obj = JSON.parse(data);
            store.set('theme', {
                folderName,
                config: obj
            })
            themeSettings = store.get('theme');
            ipcRenderer.send("reload-theme")
            loadThemes()
        });
    }
})

loadThemes()
function loadThemes() {
    fs.readdir(path.join(__dirname, "../" , "../","themes"), function (err, items) {

        const appendThemes = document.createElement("div");
        appendThemes.innerHTML += `<div class="theme">Default</div>` 
        if (themeSettings === undefined) {
            appendThemes.children[0].classList.add('selected')
        }
    
        if (typeof items == "undefined") {
            return
        }
    
        for (var i = 0; i < items.length; i++) {
            const name = items[i];
            let isDirectory;
            try {
                isDirectory = fs.lstatSync(path.join(__dirname, "../" , "../","themes", items[i])).isDirectory();
            } catch (err) {
                console.log(err);
            }
            
            if (isDirectory && fs.existsSync(path.join(__dirname, "../" , "../","themes", name, "config.json"))) {
                appendThemes.innerHTML += `<div class="theme ${themeSettings !== undefined && themeSettings.folderName === name ? "selected": ""}">${name}</div>` 
            }
        }
        themesBox.innerHTML = appendThemes.innerHTML
     
    
    
    
    });
}
loadConfig()

function loadConfig() {
    config = store.get('config');

    if (config === undefined) return;

    if (config.changeBackground === undefined || config.changeBackground == true) {
        changeBackgroundButton.children[0].innerText = "On"
    }else {
        changeBackgroundButton.children[0].innerText = "Off" 
    }
    if (config.startup === undefined || config.startup == true) {
        startupButton.children[0].innerText = "On"
    }else {
        startupButton.children[0].innerText = "Off" 
    }
    ipcRenderer.send("reload-theme")

}

generalBox.addEventListener('click', (event) => {
    const closest = event.target.closest('.toggle');
    if (closest) {
        const name = closest.id;
        if(config === undefined || config[name] === undefined || config[name] === true) {
            store.set('config.' + name, false)
        } else {
            store.set('config.' + name, true)
        }
        loadConfig()
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
        ipcRenderer.send('close-me-options');
    }

}, false);