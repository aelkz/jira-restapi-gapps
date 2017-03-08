// ---------------------------------------------------------------------------------------------------------------------------------------------------
//The MIT License (MIT)

//Copyright (c) 2017 RAPHAEL ALEX SILVA ABREU
//https://github.com/aelkz

//Permission is hereby granted, free of charge, to any person obtaining a copy
//of this software and associated documentation files (the "Software"), to deal
//in the Software without restriction, including without limitation the rights
//to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//copies of the Software, and to permit persons to whom the Software is
//furnished to do so, subject to the following conditions:

//The above copyright notice and this permission notice shall be included in all
//copies or substantial portions of the Software.

//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//SOFTWARE.

var C_MAX_RESULTS = 1000;

/*
 * This function loads added menu in the spreadsheet
 * Intialize project url and project API key while openning or refreshing spreadsheet
 */
function onOpen(){
    ScriptProperties.setProperty("APIkey", "");
    ScriptProperties.setProperty("projectURL", "");
    PropertiesService.getUserProperties().setProperty("myself", '');
    PropertiesService.getUserProperties().setProperty("app_version", "JIRA GAPPS - v1.0");

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var spread=SpreadsheetApp.getActiveSpreadsheet();

    var menuEntries = [
        {name: "Configure Jira User Login", functionName: "login"},
        {name: "Configure Jira Backlog Search Params", functionName: "params"},
        {name: "Refresh library: Feature", functionName: "libraryRefreshAction"}];
    ss.addMenu("[CONFIGURATION]", menuEntries);

    menuEntries = [
        //{name: "Contents", functionName: "helpContents"},
        {name: "User Details", functionName: "openUserDialog"},
        {name: "About", functionName: "about"}];
    ss.addMenu("[HELP]", menuEntries);
}

function formatCells() {
    setBold("A2:A1000");
    setUnBold("B2:V1000");
    formatFont("A2:V1000");
    SpreadsheetApp.flush();
}

function onEdit() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();

    setBold("A2:A1000",sheet.getActiveSheet().getName());
    setUnBold("B2:V1000",sheet.getActiveSheet().getName());
    formatFont("A2:V1000",sheet.getActiveSheet().getName());

    if (sheet.getActiveSheet().getName() == "WORKING") {
        setCreationDateSingleRow(sheet.getActiveCell().getRow(),sheet.getActiveCell().getColumn());
        setLastUpdateDateSingleRow(sheet.getActiveCell().getRow(),sheet.getActiveCell().getColumn());
        setAlign("A2:A1000",'center',sheet.getActiveSheet().getName());
    }

    SpreadsheetApp.flush();
};

// MENU: Configure Jira User Login
function login(formObject) {
    var myself = PropertiesService.getUserProperties().getProperty("myself");
    if (myself == null || myself == '' || formObject == null || formObject == undefined) {
        openDialog();
    }else {
        var prefix = "MEBAMG";
        PropertiesService.getUserProperties().setProperty("prefix", prefix.toUpperCase());
        var host = "jira.mycompany.com";
        PropertiesService.getUserProperties().setProperty("host", host);
        var userAndPassword = formObject.username+":"+formObject.password;
        var x = Utilities.base64Encode(userAndPassword);
        PropertiesService.getUserProperties().setProperty("digest", "Basic " + x);
        var issueTypes = "%22Functional%20Support%22";
        PropertiesService.getUserProperties().setProperty("issueTypes", issueTypes);
        //Browser.msgBox("Jira configuration saved successfully:\\n");
    }
}

function refreshBacklogAction() {
    var myself = PropertiesService.getUserProperties().getProperty("myself");
    if (myself == null || myself == '') {
        Browser.msgBox("User login/password incorrect.\\nPlease try again.");
        openDialog();
    }else {
        jiraPull();
    }
}

function jiraPull() {
    var spreadsheet_name = "BACKLOG";
    var allFields = getAllFields();
    var data = getStories(1);

    if (allFields === "" || data === "") {
        Browser.msgBox("Error pulling data from Jira - aborting now.");
        return;
    }

    // GENERAL BACKLOG
    var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(spreadsheet_name);
    var headings = ss.getRange(1, 1, 1, ss.getLastColumn()).getValues()[0];
    var backlog = new Array();
    var last = ss.getLastRow();

    // build array with all issues from search
    for (i=0;i<data.issues.length;i++) {
        var issue=data.issues[i];
        backlog.push(getStory(issue,headings,allFields));
    }

    // remove sheet filter
    removeFilter(spreadsheet_name);

    // check the range of the sheet to be filled into
    if (last >= 2) {
        ss.getRange(2, 1, ss.getLastRow()-1, ss.getLastColumn()).clearContent();
    }

    // fill the sheet with issues data
    if (backlog.length > 0) {
        ss.getRange(2, 1, data.issues.length, backlog[0].length).setValues(backlog);
    }

    // cleanup
    cleanCell("A",spreadsheet_name);
    cleanCell("K",spreadsheet_name);
    cleanCell("N",spreadsheet_name);
    cleanCell("U",spreadsheet_name);
}

function getStory(issue,headings,fields) {
    var story = [];
    for (var i = 0;i < headings.length;i++) {
        if (headings[i] != "" || headings[i] != null || headings[i] != undefined) {
            story.push(getDataForHeading(issue,headings[i].toLowerCase(),fields));
        }
    }

    return story;
}

function getDataForHeading(issue,heading,fields) {
    if (heading == "Planned Start Date") {
        heading = "customfield_11801";
    }else if (heading == "Planned End Date") {
        heading = "customfield_10313";
    }else if (heading == "Due Delivery Date") {
        heading = "customfield_16600";
    }else if (heading == "Real Start Date") {
        heading = "customfield_12005";
    }else if (heading == "Attended") {
        heading = "customfield_17108";
    }else if (heading == "bmc reqwo") {
        heading = "customfield_12206";
    }else if ((heading.indexOf("teh") >= 0)) {
        heading = "customfield_12362";
    }else if (heading == "epic") {
        heading = "customfield_15000";
    }

    return clean(issue,heading,fields);
}

function clean(issue,heading,fields) {
    var field_type = 0;
    var return_type = 0;

    var name = "";
    var value = "";

    var fieldName = getFieldName(heading,fields);
    var splitName = heading.split(" ");

    // first group
    if (issue.hasOwnProperty(heading)) {
        return_type = 1;
        name = heading;
        value = issue[heading];
        //return issue[heading];
    }else if (issue.fields.hasOwnProperty(heading)) {
        return_type = 2;
        name = heading;
        value = issue.fields[heading];
        //return issue.fields[heading];
    }

    if (return_type == 0) {
        // second group
        if (fieldName != "") {
            if (issue.hasOwnProperty(fieldName)) {
                return_type = 3;
                name = fieldName;
                value = issue[fieldName];
                //return issue[fieldName];
            }else if (issue.fields.hasOwnProperty(fieldName)) {
                return_type = 4;
                name = fieldName;
                value = issue.fields[fieldName];
                //return issue.fields[fieldName];
            }
        }
    }

    if (return_type == 0) {
        // third group
        if (splitName.length == 2) {
            if (issue.fields.hasOwnProperty(splitName[0]) ) {
                if (issue.fields[splitName[0]] && issue.fields[splitName[0]].hasOwnProperty(splitName[1])) {
                    return_type = 5;
                    name = splitName[1];
                    value = issue.fields[splitName[0]][splitName[1]];
                    //return issue.fields[splitName[0]][splitName[1]];
                }
                return_type = 0;
                //return "";
            }
        }
    }

    switch(name) {
        case "customfield_11801": // Planned Start Date
            Logger.log('original='+value);
            value = convertISO8601ToDate(value);
            Logger.log('modified='+value);
            break;
        case "customfield_10313": // Planned End Date
            value = convertISO8601ToDate(value);
            break;
        case "customfield_16600": // Due Delivery Date
            value = convertISO8601ToDate(value);
            break;
        case "customfield_12005": // Real Start Date
            value = convertISO8601ToDate(value);
            break;
        case "customfield_17108": // Attended
            value = convertISO8601ToDate(value);
            break;
        case "created": // Created
            value = convertISO8601ToDate(value);
            break;
        case "customfield_12362": // TEH (Estima)
            value = value;
            break;
        case "timeoriginalestimate": // Original Estimate
            value = convertValueToHours(value);
            break;
        case "customfield_12362": // Total Estimate Hours
            value = value;
            break;
        case "timespent": // Time Spent
            value = convertValueToHours(value);
            break;
        case "timeestimate": // Remaining Estimate
            value = convertValueToHours(value);
            break;
        case "components":
            var description = value[0].name;
            value = description;
            break;
        case "reporter":
            var description = value.displayName;
            value = description;
            break;
        case "customfield_15000":
            value = getEpicDescriptionByKey(value); // Epic
            break;
    }

    if (value == undefined) {
        value = "";
    }

    return value;
}