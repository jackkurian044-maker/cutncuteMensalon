// Cut N Cute Studio Booking API
const SHEET_ID = '1YQ3jd7OA8cVvz1utIPgDpTXUL0TDNWC3AXWe4ljks38';
const SHEET_NAME = 'Bookings';

function doGet(e) {
  try {
    const p = (e && e.parameter) ? e.parameter : {};

    if (p.action === 'book') {
      const result = saveBooking_(p);

      if (p.callback) {
        return ContentService
          .createTextOutput(p.callback + '(' + JSON.stringify(result) + ');')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }

      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (p.test === '1') {
      const result = saveBooking_({
        branch:'TEST',
        customerName:'Google Apps Script Test',
        mobile:'0000000000',
        service:'Test Booking',
        appointmentDate:'TEST',
        appointmentTime:'TEST',
        branchPhone:'',
        branchAddress:''
      });
      return ContentService
        .createTextOutput('TEST BOOKING WRITTEN TO GOOGLE SHEETS')
        .setMimeType(ContentService.MimeType.TEXT);
    }

    return ContentService
      .createTextOutput('Cut N Cute Booking API is LIVE')
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
    const result = {success:false,error:String(err)};
    if (e && e.parameter && e.parameter.callback) {
      return ContentService
        .createTextOutput(e.parameter.callback + '(' + JSON.stringify(result) + ');')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    let data = {};
    if (e && e.parameter && Object.keys(e.parameter).length) {
      data = e.parameter;
    } else if (e && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch (_) { data = {}; }
    }

    const result = saveBooking_(data);

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({success:false,error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function saveBooking_(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Booking ID','Timestamp','Branch','Customer Name','Mobile',
      'Service / Package','Appointment Date','Appointment Time',
      'Status','Branch Phone','Branch Address'
    ]);
    sheet.setFrozenRows(1);
  }

  const branch = data.branch || '';
  const name = data.customerName || data.name || '';
  const mobile = data.mobile || data.phone || '';
  const service = data.service || '';
  const appointmentDate = data.appointmentDate || data.date || '';
  const appointmentTime = data.appointmentTime || data.time || '';
  const branchPhone = data.branchPhone || '';
  const branchAddress = data.branchAddress || '';

  if (!branch || !name || !mobile || !service || !appointmentDate || !appointmentTime) {
    throw new Error('Missing required booking fields.');
  }

  const bookingId =
    'CNC-' +
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') +
    '-' + Math.floor(Math.random() * 1000);

  sheet.appendRow([
    bookingId,
    new Date(),
    branch,
    name,
    mobile,
    service,
    appointmentDate,
    appointmentTime,
    'Confirmed',
    branchPhone,
    branchAddress
  ]);

  SpreadsheetApp.flush();

  return {
    success:true,
    bookingId:bookingId
  };
}
