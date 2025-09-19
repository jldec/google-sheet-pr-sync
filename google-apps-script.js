// from https://grok.com/share/bGVnYWN5_4c0782ef-c362-477f-b20b-2c0c995e2e37
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");

    // Get header row (assumes headers are in row 1)
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var lowerHeaders = headers.map(function(h) { return h.toString().toLowerCase(); });

    // Get all data (excluding headers)
    var data = sheet.getDataRange().getValues();
    var rows = data.slice(1); // Exclude header row

    // Convert rows to JSON array of objects
    var jsonData = rows.map(function(row) {
      var obj = {};
      for (var i = 0; i < headers.length; i++) {
        obj[lowerHeaders[i]] = row[i];
      }
      return obj;
    });

    return ContentService.createTextOutput(
      JSON.stringify(jsonData)
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    // Parse incoming JSON data (expecting an array of objects)
    var paramsArray = JSON.parse(e.postData.contents);
    if (!Array.isArray(paramsArray)) {
      throw new Error("Input must be an array of objects");
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");

    // Get header row (assumes headers are in row 1)
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var lowerHeaders = headers.map(function(h) { return h.toString().toLowerCase(); });

    var idColumnIndex = lowerHeaders.indexOf("id");
    if (idColumnIndex === -1) {
      throw new Error("Header 'ID' (case-insensitive) not found in sheet");
    }

    // Get existing data
    var data = sheet.getDataRange().getValues();
    var existingRows = data.slice(1); // Exclude header row
    var newRows = [];
    var updatedIds = [];
    var insertedIds = [];

    // Process each object in the array
    paramsArray.forEach(params => {
      var found = false;
      // Look for existing row with matching ID
      for (var i = 0; i < existingRows.length; i++) {
        if (existingRows[i][idColumnIndex] == params.id) {
          // Update only cells with different values
          var rowData = existingRows[i].slice(); // Copy existing row
          var hasChanges = false;
          for (var key in params) {
            var lowerKey = key.toLowerCase();
            var colIndex = lowerHeaders.indexOf(lowerKey);
            if (colIndex !== -1 && rowData[colIndex] != params[key]) {
              rowData[colIndex] = params[key];
              hasChanges = true;
            }
          }
          // Update timestamp if column exists and changes were made
          var timestampIndex = lowerHeaders.indexOf("timestamp");
          if (timestampIndex !== -1 && hasChanges) {
            rowData[timestampIndex] = new Date();
          }
          // Only update sheet if changes were made
          if (hasChanges) {
            sheet.getRange(i + 2, 1, 1, headers.length).setValues([rowData]);
            updatedIds.push(params.id);
          }
          found = true;
          break;
        }
      }

      // If ID not found, prepare new row
      if (!found) {
        var newRow = new Array(headers.length).fill("");
        for (var key in params) {
          var lowerKey = key.toLowerCase();
          var colIndex = lowerHeaders.indexOf(lowerKey);
          if (colIndex !== -1) {
            newRow[colIndex] = params[key];
          }
        }
        // Set timestamp if column exists
        var timestampIndex = lowerHeaders.indexOf("timestamp");
        if (timestampIndex !== -1) {
          newRow[timestampIndex] = new Date();
        }
        newRows.push(newRow);
        insertedIds.push(params.id);
      }
    });

    // Append new rows to sheet
    if (newRows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, headers.length).setValues(newRows);
    }

    // Sort the entire data range by ID (excluding header row)
    if (sheet.getLastRow() > 1) { // Only sort if there is data
      var rangeToSort = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length);
      rangeToSort.sort({ column: idColumnIndex + 1, ascending: true });
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        message: "Data processed and sorted",
        updatedIds: updatedIds,
        insertedIds: insertedIds
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}