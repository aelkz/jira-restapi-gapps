function getRESTJiraFields() {
    return JSON.parse(getDataForAPI("field"));
}

function getAllFields() {
    var theFields = getRESTJiraFields();
    var allFields = new Object();
    allFields.ids = new Array();
    allFields.names = new Array();

    for (var i = 0; i < theFields.length; i++) {
        allFields.ids.push(theFields[i].id);
        allFields.names.push(theFields[i].name.toLowerCase());
    }

    return allFields;
}

function getDataForAPI(path) {
    var url = "https://" + PropertiesService.getUserProperties().getProperty("host") + "/rest/api/2/" + path;
    var digestfull = PropertiesService.getUserProperties().getProperty("digest");
    var params = { "Accept":"application/json", "Content-Type":"application/json", "method": "GET", "headers": {"Authorization": digestfull}, "muteHttpExceptions": true};
    var resp = UrlFetchApp.fetch(url,params);
    if (resp.getResponseCode() != 200) {
        Browser.msgBox("Error retrieving data for url:\n" + url + "\n\n\n" + resp.getContentText() + "\nResponse code status:" + resp.getResponseCode());
        return "";
    }else {
        return resp.getContentText();
    }
}

function getProjectComponents() {
    // https://jira.mycompany.com/rest/api/2/project/MEBAMG/components
    var url = "https://" + PropertiesService.getUserProperties().getProperty("host") + "/rest/api/2/project/" + PropertiesService.getUserProperties().getProperty("prefix") + "/components";
    var digestfull = PropertiesService.getUserProperties().getProperty("digest");
    var params = { "Accept":"application/json", "Content-Type":"application/json", "method": "GET", "headers": {"Authorization": digestfull}, "muteHttpExceptions": true};
    var resp = UrlFetchApp.fetch(url,params);
    if (resp.getResponseCode() != 200) {
        return "";
    }else {
        //return resp.getContentText();
        return JSON.parse(resp.getContentText());
    }
}

function getUserSession() {
    // https://jira.mycompany.com/rest/auth/1/session
    var url = "https://" + PropertiesService.getUserProperties().getProperty("host") + "/rest/auth/1/session";
    var digestfull = PropertiesService.getUserProperties().getProperty("digest");
    var params = { "Accept":"application/json", "Content-Type":"application/json", "method": "GET", "headers": {"Authorization": digestfull}, "muteHttpExceptions": true};
    var resp = UrlFetchApp.fetch(url,params);
    if (resp.getResponseCode() != 200) {
        return "";
    }else {
        //return resp.getContentText();
        return JSON.parse(resp.getContentText());
    }
}

// obtem os tipos de issues formatado em JQL
function getJQLIssueTypes() {
    //var issueTypes = "%22Functional%20Support%22";
    var temp = PropertiesService.getUserProperties().getProperty("backlog_params");
    var backlogParams = {};
    if (temp != null && temp != undefined && temp != '') {
        backlogParams = JSON.parse(temp);
    }

    var issueTypes = '';
    if (contains.call(backlogParams.featureTypes, '1')) {
        issueTypes = issueTypes+'%22Big%20Feature%20Request%22';
    }
    if (contains.call(backlogParams.featureTypes, '2')) {
        if (issueTypes != null && issueTypes != undefined && issueTypes != '') {
            issueTypes = issueTypes+'%2C';
        }
        issueTypes = issueTypes+'%22Feature%20Request%22';
    }
    if (contains.call(backlogParams.featureTypes, '3')) {
        if (issueTypes != null && issueTypes != undefined && issueTypes != '') {
            issueTypes = issueTypes+'%2C';
        }
        issueTypes = issueTypes+'%22Functional%20Support%22';
    }

    return issueTypes;
}

// obtem os tipos de issues formatado em JQL
function getJQLReporters() {
    var temp = PropertiesService.getUserProperties().getProperty("backlog_params");
    var backlogParams = {};
    if (temp != null && temp != undefined && temp != '') {
        backlogParams = JSON.parse(temp);
    }

    var reporters = '';
    if (contains.call(backlogParams.reporters, '1')) {
        reporters = reporters+'%22goliveiraa%22';
    }
    if (contains.call(backlogParams.reporters, '2')) {
        if (reporters != null && reporters != undefined && reporters != '') {
            reporters = reporters+'%2C';
        }
        reporters = reporters+'%22frfeitosa%22';
    }
    if (contains.call(backlogParams.reporters, '3')) {
        Logger.log('eu aqui');
        if (reporters != null && reporters != undefined && reporters != '') {
            reporters = reporters+'%2C';
        }
        reporters = reporters+'%22rasilvaa%22';
    }

    return reporters;
}

// obtem os componentes do projeto default formatado em JQL
function getJQLComponents() {
    return "";
}

// informe os status das issues separados por vírgula
function getJQLIssueStatus(values) {
    var obj = values.split(',');
    var jql = '';
    for (var i=0; i<obj.length; i++) {
        jql = jql + '%22';
        jql = jql + obj[i].replace(new RegExp(escapeRegExp(' '), 'g'), '%20');
        jql = jql + '%22';
        if (i < (obj.length-1)) {
            jql = jql+'%2C';
        }
    }
    return jql;
}

function getStories(type) {
    var allData = {issues:[]};
    var data = {startAt:0,maxResults:0,total:1};
    var startAt = 0;

    if (type == 0) {
        while (data.startAt + data.maxResults < data.total) {
            var query = "search?jql=";
            // param:project
            query = query + "project%20%3D%20" + PropertiesService.getUserProperties().getProperty("prefix");
            // param:type
            query = query + "%20";
            query = query + "and%20type%20in%20("+ getJQLIssueTypes() + ")";
            query = query + "%20";
            // param:reporter
            query = query + "and%20reporter%20in%20("+ getJQLReporters() + ")";
            query = query + "%20";
            // param:current year
            //created > "2011/01/15" and created < "2011/01/16"
            query = query + "and%20created%20";
            query = query + "%3E";
            query = query + "%20";
            query = query + "%22"+new Date().getYear()+"/01/01"+"%22";
            query = query + "%20";
            query = query + "and%20created%20";
            query = query + "%3C";
            query = query + "%20";
            query = query + "%22"+new Date().getYear()+"/12/31"+"%22";
            // param:order by and pagination
            query = query + "%20order%20by%20rank%20";
            query = query + "&maxResults=" + C_MAX_RESULTS;
            query = query + "&startAt=" + startAt;

            Logger.log(query);
            data =  JSON.parse(getDataForAPI(query));
            allData.issues = allData.issues.concat(data.issues);
            startAt = data.startAt + data.maxResults;
        }
    }else if (type == 1) {
        while (data.startAt + data.maxResults < data.total) {
            Logger.log("Making request for %s entries", C_MAX_RESULTS);

            var query = "search?jql=";
            // param:project
            query = query + "project%20%3D%20" + PropertiesService.getUserProperties().getProperty("prefix");
            // param:status
            query = query + "%20and%20status%20IN%20%28";
            query = query + getJQLIssueStatus('NEW,PREVIOUS STUDY,PLANNED,PENDING PLAN APPROVAL,APPROVED PLAN,TESTING,DELIVERED,REOPENED,TECHNICAL ESTIMATED,ESTIMATED,APPROVED ESTIMATE,ANALYSIS IN APPROVAL,WORKING ON IT');
            query = query + "%29";
            query = query + "%20";
            // param:type
            query = query + "and%20type%20in%20("+ getJQLIssueTypes() + ")";
            query = query + "%20";
            //query = query + "and%20component%20in%20("+ getJQLComponents() + ")";
            query = query + "and%20reporter%20in%20("+ getJQLReporters() + ")";
            //query = query + "%20and%20assignee%20%3D%20goliveiraa%20";
            // param:order by and pagination
            query = query + "%20order%20by%20rank%20";
            query = query + "&maxResults=" + C_MAX_RESULTS;
            query = query + "&startAt=" + startAt;

            Logger.log(query);
            data =  JSON.parse(getDataForAPI(query));
            allData.issues = allData.issues.concat(data.issues);
            startAt = data.startAt + data.maxResults;
        }
    }else if (type == 2) {
        getMyselfData();
        while (data.startAt + data.maxResults < data.total) {
            Logger.log("Making request for %s entries", C_MAX_RESULTS);

            var query = "search?jql=";
            // parameters
            query = query + "project%20%3D%20" + PropertiesService.getUserProperties().getProperty("prefix"); // MEBAMG
            query = query + "%20and%20status%20IN%20%28%22In%20Progress%22%2C%22Open%22%2C%22Reopened%22%29"; // In Progress, Open, Reopened
            query = query + "%20and%20type%20in%20("+ PropertiesService.getUserProperties().getProperty("issueTypes") + ")";
            query = query + "%20and%20assignee%20%3D%20"+PropertiesService.getUserProperties().getProperty("current_user")+"%20";
            // order by and pagination parameters
            query = query + "%20order%20by%20rank%20";
            query = query + "&maxResults=" + C_MAX_RESULTS;
            query = query + "&startAt=" + startAt;

            Logger.log(query);
            data =  JSON.parse(getDataForAPI(query));
            allData.issues = allData.issues.concat(data.issues);
            startAt = data.startAt + data.maxResults;
        }
    }

    return allData;
}

// where 'epicName' == customfield_15001
function getEpic(epicName) {
    var name = epicName.replace(new RegExp(escapeRegExp(' '), 'g'), '%20');
    var url = "https://" + PropertiesService.getUserProperties().getProperty("host") + "/rest/api/2/search?jql=issuetype=EPIC%20AND%20cf%5B15001%5D%3D%22"+name+"%22";
    Logger.log(url);

    var digestfull = PropertiesService.getUserProperties().getProperty("digest");
    var params = { "Accept":"application/json", "Content-Type":"application/json", "method": "GET", "headers": {"Authorization": digestfull}, "muteHttpExceptions": true};

    try {
        var resp = UrlFetchApp.fetch(url,params);
        if (resp.getResponseCode() != 200) {
            Browser.msgBox("Error fetching EPIC <"+epicName+"> - aborting now.");
            return;
        }else {
            // RETORNA A EPIC
            return JSON.parse(resp.getContentText());
        }
    }catch(e) {
        Browser.msgBox("Exception.\\n\\nStack trace bellow:\\n"+e);
        return "";
    }
    return "";
}