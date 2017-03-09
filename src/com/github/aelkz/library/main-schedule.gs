function removeTriggers() {
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
        ScriptApp.deleteTrigger(triggers[i]);
    }

    Browser.msgBox("Spreadsheet will no longer refresh automatically.");
}

function scheduleRefresh() {
    var myself = PropertiesService.getUserProperties().getProperty("myself");
    if (myself == null || myself == '') {
        Browser.msgBox("User login/password incorrect.\\nPlease try again.");
        openDialog();
    }else {
        var triggers = ScriptApp.getProjectTriggers();
        for (var i = 0; i < triggers.length; i++) {
            ScriptApp.deleteTrigger(triggers[i]);
        }

        ScriptApp.newTrigger("jiraPull").timeBased().everyHours(1).create();
        Browser.msgBox("Spreadsheet will refresh automatically every 1 hour.");
    }
}
