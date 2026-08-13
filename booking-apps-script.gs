const SHEET_ID = '1YQ3jd7OA8cVvz1utIPgDpTXUL0TDNWC3AXWe4ljks38';
const SHEET_NAME = 'Bookings';

function doGet(e) {
  try {
    const p = (e && e.parameter) || {};
    if (p.action === 'booking') {
      const ss = SpreadsheetApp.openById(SHEET_ID);
      const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Booking ID','Timestamp','Branch','Customer Name','Mobile','Service / Package','Appointment Date','Appointment Time','Status']);
        sheet.setFrozenRows(1);
      }
      const bookingId = 'CNC-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') + '-' + Math.floor(Math.random()*1000);
      sheet.appendRow([bookingId,new Date(),p.branch||'',p.customerName||'',p.mobile||'',p.service||'',p.appointmentDate||'',p.appointmentTime||'','New']);
      SpreadsheetApp.flush();
      const result = {success:true, bookingId:bookingId};
      return ContentService.createTextOutput((p.callback||'callback')+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput('Cut N Cute Booking API is LIVE').setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    const p=(e&&e.parameter)||{};
    const result={success:false,error:String(err)};
    if(p.callback) return ContentService.createTextOutput(p.callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
    return ContentService.createTextOutput('ERROR: '+String(err)).setMimeType(ContentService.MimeType.TEXT);
  }
}

function doPost(e) {
  return doGet({parameter:Object.assign({}, e.parameter || {})});
}
