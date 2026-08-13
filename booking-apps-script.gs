// Google Apps Script for Cut N Cute Studio appointment bookings.
// 1) Create a Google Sheet in Google Drive.
// 2) Rename the first sheet to Bookings (optional; the script creates it if missing).
// 3) Extensions > Apps Script, paste this file, save.
// 4) Deploy > New deployment > Web app > Execute as Me > Who has access: Anyone.
// 5) Copy the /exec URL into script.js as GOOGLE_APPS_SCRIPT_URL.

const SHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('Bookings') || ss.insertSheet('Bookings');

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp','Branch','Name','Mobile','Service / Package','Date','Time','Status']);
    }

    sheet.appendRow([
      new Date(),
      data.branch || '',
      data.name || '',
      data.phone || '',
      data.service || '',
      data.date || '',
      data.time || '',
      'New'
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ok:true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ok:false,error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
