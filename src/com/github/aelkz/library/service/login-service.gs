function openDialog() {
    var htmlForm = HtmlService.createTemplateFromFile('login-gui').evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);
    htmlForm.setHeight(400);
    htmlForm.setWidth(540);
    SpreadsheetApp.getUi().showModelessDialog(htmlForm, PropertiesService.getUserProperties().getProperty("app_version"));
}

function closeDialog() {
    app.close();
    google.script.host.close();
}

function process() {
    // do something here...
    return true;
}

function loginAction(formObject) {
    Utilities.sleep(2 * 1000); // some delay to not look so fast for user
    // Session.getActiveUser().getEmail();
    var password=formObject.password;
    var username=formObject.username;

    var prefix = "MEBAMG";
    var host = "jira.mycompany.com";
    var userAndPassword = username+":"+password;
    var x = Utilities.base64Encode(userAndPassword);
    var digest = "Basic " + x;

    var url = "https://" + host + "/rest/api/2/myself";
    var headers = { "Accept":"application/json", "Content-Type":"application/json", "method": "GET", "headers": {"Authorization": digest}, "muteHttpExceptions": true};

    var resp = UrlFetchApp.fetch(url,headers);

    if (resp.getResponseCode() != 200) {
        PropertiesService.getUserProperties().setProperty("myself", '');
        Browser.msgBox("User login/password incorrect.\\nPlease try again. ["+resp.getResponseCode()+"]");
        openDialog();
        return false;
    }else {
        PropertiesService.getUserProperties().setProperty("myself", resp);
        login(formObject);
        return true;
    }
}
