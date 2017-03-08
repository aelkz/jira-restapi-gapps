// needed for html embeded pages (import utility)
function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getFieldName(heading,fields) {
    var index = fields.names.indexOf(heading);
    if ( index > -1) {
        return fields.ids[index];
    }
    return "";
}

function cleanCell(column,spreadsheet) {
    var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(spreadsheet);
    var sheet = ss;

    var value = column+2+':'+column+1000;
    var range = sheet.getRange(value);
    var icon_issue_value = 'J2'+':'+'J1000'; // Issue Type <icon>
    var icon_issue_range = sheet.getRange(icon_issue_value);
    var icon_priority_value = 'M2'+':'+'M1000'; // Issue Priority <icon>
    var icon_priority_range = sheet.getRange(icon_priority_value);
    var icon_status_value = 'T2'+':'+'T1000'; // Issue Status <icon>
    var icon_status_range = sheet.getRange(icon_status_value);

    var numRows = range.getNumRows();
    var numCols = range.getNumColumns();
    var countNull = 0;

    switch(column) {
        case "A":
            var host = "https://"+PropertiesService.getUserProperties().getProperty("host")+"/browse/";
            for (var i = 1; i <= numRows; i++) {
                if (countNull >= 3) {
                    break;
                }

                for (var j = 1; j <= numCols; j++) {
                    if (countNull >= 3) {
                        break;
                    }

                    if (range.getCell(i, j).getValue() == '' || range.getCell(i, j).getValue() == null || range.getCell(i, j).getValues() == null) {
                        countNull = countNull+1;
                    }else {
                        countNull = 0;

                        range.getCell(i,j).setFormula("=hyperlink(\""+host+range.getCell(i,j).getValue()+"\";\""+range.getCell(i,j).getValue()+"\")");
                    }
                }
            }
            break;
        case "K": // Issue Type
            for (var i = 1; i <= numRows; i++) {
                if (countNull >= 3) {
                    break;
                }

                for (var j = 1; j <= numCols; j++) {
                    var currentValue = range.getCell(i,j).getValue();

                    if (countNull >= 3) {
                        break;
                    }

                    if (range.getCell(i, j).getValue() == '' || range.getCell(i, j).getValue() == null || range.getCell(i, j).getValues() == null) {
                        countNull = countNull+1;
                    }else {
                        countNull = 0;

                        var data = range.getCell(i, j).getValue();
                        var description = data;
                        description = description.slice((description.indexOf("name=")+5),(description.indexOf("self=")-2));
                        var iconUrl = data;
                        iconUrl = iconUrl.slice((iconUrl.indexOf("iconUrl=")+8),(iconUrl.indexOf("subtask=")-2));
                        range.getCell(i, j).setValue(description);
                        icon_issue_range.getCell(i, j).setFormula("=image(\""+iconUrl+"\";4;16;16)");
                    }
                }
            }
            break;
        case "N": // Issue Priority
            for (var i = 1; i <= numRows; i++) {
                if (countNull >= 3) {
                    break;
                }

                for (var j = 1; j <= numCols; j++) {
                    var currentValue = range.getCell(i,j).getValue();

                    if (countNull >= 3) {
                        break;
                    }

                    if (range.getCell(i, j).getValue() == '' || range.getCell(i, j).getValue() == null || range.getCell(i, j).getValues() == null) {
                        countNull = countNull+1;
                    }else {
                        countNull = 0;

                        var data = range.getCell(i, j).getValue();
                        var description = data;
                        description = description.slice((description.indexOf("name=")+5),(description.indexOf("self=")-2));
                        var iconUrl = data;
                        iconUrl = iconUrl.slice((iconUrl.indexOf("iconUrl=")+8),(iconUrl.indexOf("id=")-2));
                        range.getCell(i, j).setValue(description);
                        icon_priority_range.getCell(i, j).setFormula("=image(\""+iconUrl+"\";4;16;16)");
                    }
                }
            }
            break;
        case "U": // Issue Status
            for (var i = 1; i <= numRows; i++) {
                if (countNull >= 3) {
                    break;
                }

                for (var j = 1; j <= numCols; j++) {
                    var currentValue = range.getCell(i,j).getValue();

                    if (countNull >= 3) {
                        break;
                    }

                    if (range.getCell(i, j).getValue() == '' || range.getCell(i, j).getValue() == null || range.getCell(i, j).getValues() == null) {
                        countNull = countNull+1;
                    }else {
                        countNull = 0;

                        var data = range.getCell(i, j).getValue();
                        var description = data;
                        description = description.slice((description.indexOf("name=")+5),(description.indexOf("self=")-2));
                        var iconUrl = data;
                        iconUrl = iconUrl.slice((iconUrl.indexOf("iconUrl=")+8),(iconUrl.indexOf("id=")-2));
                        range.getCell(i, j).setValue(description);
                        icon_status_range.getCell(i, j).setFormula("=image(\""+iconUrl+"\";4;16;16)");
                    }
                }
            }
            break;
    }
}

function formatFont(range,spreadsheet_name) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(spreadsheet_name);
    var cells = sheet.getRange(range);

    cells.setFontFamily("Verdana");
    cells.setFontSize(8);
    cells.setWrap(true);
    cells.setHorizontalAlignment("center");
};

function setAlign(range,align,spreadsheet_name) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(spreadsheet_name);
    var cells = sheet.getRange(range);

    cells.setHorizontalAlignment(align);
};

function setBold(range,spreadsheet_name) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(spreadsheet_name);
    var cells = sheet.getRange(range);

    cells.setFontWeight("bold");
};

function setUnBold(range,spreadsheet_name) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(spreadsheet_name);
    var cells = sheet.getRange(range);

    cells.setFontWeight("normal");
};

function getActiveCellValue(){
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0];

    var cell = ss.getActiveCell();
    var data = ss.getDataRange().getValues();

    var activeR = cell.getRow();
    var activeC = cell.getColumn();

    var activeCell = sheet.getRange("A"+activeR);
    //activeCell.setBackground('#ffff55');
    //activeCell.setFontSize(12);
    //activeCell.setFontColor('#ffff55');

    return activeCell.getValues();
};

function setCreationDateSingleRow(row,column) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("WORKING");
    var range = sheet.getRange(row, 18);

    var timezone = "GMT-3";
    var timestamp_format = "dd-MM-yyyy HH:mm"; // Timestamp Format.

    var currentValue = range.getValue();

    if (currentValue == '' || currentValue == null || currentValue == undefined) {
        // define a data de criação do registro
        var date = Utilities.formatDate(new Date(), timezone, timestamp_format);
        range.setValue(date);
    }else {
        // atualiza a última data de alteração (last update)
        setLastUpdateDateSingleRow(row,column);
    }

};

function setLastUpdateDateSingleRow(row,column) {
    if (row != 1) {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("WORKING");
        var range = sheet.getRange(row, 19);

        var timezone = "GMT-3";
        var timestamp_format = "dd-MM-yyyy HH:mm"; // Timestamp Format.

        var date = Utilities.formatDate(new Date(), timezone, timestamp_format);
        range.setValue(date);
    }
};

function isEmpty(value) {
    return (value == 0 || value == 0.0 || value == null || value == "" || value == "0" || value == "0.0" || value == "0" || value == undefined || value == 'undefined');
}

function valueOrEmpty(value) {
    return isEmpty(value) ? value : "";
}

function emptyJSON() {
    return JSON.parse('{}');
}

var replaceAll = function(obj,search,replacement) {
    var target = obj+'';
    return target.replace(search+'/g', replacement);
}

var contains = function(needle) {
    // Per spec, the way to identify NaN is that it is not equal to itself
    var findNaN = needle !== needle;
    var indexOf;

    if(!findNaN && typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(needle) {
            var i = -1, index = -1;

            for(i = 0; i < this.length; i++) {
                var item = this[i];

                if((findNaN && item !== item) || item === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    return indexOf.call(this, needle) > -1;
}

function isOneRecord(issues) {
    if (issues[0].length == 1) {
        return true;
    }
}

function getReporter() {
    var myself = PropertiesService.getUserProperties().getProperty("myself");
    var myJSON = JSON.parse(myself);

    if (!isEmpty(myJSON)) {
        if (!isEmpty(myJSON.name)) {
            return myJSON.name;
        }
    }
    return "";
}

function getUserName() {
    var myself = PropertiesService.getUserProperties().getProperty("myself");
    var myJSON = JSON.parse(myself);

    if (!isEmpty(myJSON)) {
        if (!isEmpty(myJSON.name)) {
            return myJSON.displayName;
        }
    }
    return "";
}

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function isTrue(value) {
    return ("Sim" == value);
}

function getEpicDescriptionByKey(key) {
    var spreadsheet_name = "LIBRARY_FEATURE";
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(spreadsheet_name);

    //sheet.getRange(row, column, numRows, numColumns)
    var dataRange = sheet.getRange(2, 5, sheet.getMaxRows(), 2); // Columns: E,F
    var header = [];
    header.push('epic');
    header.push('epicKey');
    var objects = getObjects_(dataRange.getValues(), header);

    var objectsById = {};
    var epic_str = '';

    objects.forEach(function(object) {
        if (object.epicKey == key) {
            epic_str = object.epic;
        }
    });

    return epic_str;
}

function removeFilter(spreadsheet_name) {
    var row = 1 //the row with filter
    var RowBefore = row

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(spreadsheet_name);
    sheet.insertRowBefore(row); //inserts a line before the filter
    row++;

    var line = sheet.getRange(row + ":" + row); //gets the filter line
    line.moveTo(sheet.getRange(RowBefore + ":" + RowBefore)); //move to new line
    sheet.deleteRow(row); //deletes the filter line - this clears the filter

    sheet.setFrozenRows(RowBefore); //if row was frozen before, freeze it again
    SpreadsheetApp.flush();
}