function loadTheme() {
    theme = store.get('theme')
    if (theme == undefined) {
        themeLink.removeAttribute('href')
        return;
    }
    themeLink.setAttribute('href', "../../themes/" + theme.folderName+"/" +theme.config.fileName )
}