function params() {
    var myself = PropertiesService.getUserProperties().getProperty("myself");
    if (myself == null || myself == '') {
        Browser.msgBox("User session not defined.\\nPlease login.");
        openDialog();
    }else {
        var htmlForm = HtmlService.createTemplateFromFile('params-gui').evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);
        htmlForm.setHeight(500);
        htmlForm.setWidth(540);
        SpreadsheetApp.getUi().showModelessDialog(htmlForm, PropertiesService.getUserProperties().getProperty("app_version"));
    }
}

function saveBacklogParamsAction(formObject) {
    Utilities.sleep(2 * 1000); // some delay to not look so fast for user
    var components=formObject.components;
    var featureType=formObject.featureType;
    var reporters=formObject.reporter;

    // montar JSON na mão é foda!
    // http://www.jsoneditoronline.org/
    var backlogParams = "{"+
        "\"featureTypes\":\""+featureType+"\","+
        "\"components\":\""+components+"\","+
        "\"reporters\":\""+reporters+"\","+
        "\"loadParams\":\""+true+"\""+
        "}";

    PropertiesService.getUserProperties().setProperty("backlog_params", backlogParams);
    return true;
}

function getBacklogParamsData() {
    var backlogParams = {};
    backlogParams = PropertiesService.getUserProperties().getProperty("backlog_params");

    if (backlogParams != null && backlogParams != undefined && backlogParams != '') {
        return JSON.parse(backlogParams);
    }

    return "";
}
