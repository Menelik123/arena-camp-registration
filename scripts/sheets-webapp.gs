const SHEET_NAME = "Sheet1";
const ORGANIZER_EMAIL = "robohanna4@gmail.com";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    // Add header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Date", "Parent Name", "Email", "Address", "Phone (Mom)", "Phone (Dad)",
        "Child Name", "DOB", "Age", "School", "Sports",
        "Week", "Session", "Session Time", "Price", "Payment ID", "Paid At",
        "Emergency Contact", "Emergency Phone",
        "Has Allergies", "Allergy Details", "Has Medical Conditions", "Medical Details",
        "Parent Instagram", "Child Instagram", "Food Restrictions",
        "Pickup Authorized", "Pickup Restricted",
        "Goal: Improve Skills", "Goal: Fun", "Goal: Active", "Goal: Teamwork",
        "How Heard", "Referred By", "Comments"
      ]);
    }

    sheet.appendRow([
      data.date, data.parentName, data.email, data.address, data.phoneMom, data.phoneDad,
      data.childName, data.dob, data.age, data.school, data.sports,
      data.weekLabel, data.sessionLabel, data.sessionTime, data.price,
      data.paymentId, data.paidAt,
      data.emergencyContactName, data.emergencyContactPhone,
      data.hasAllergies, data.allergyDetails, data.hasMedicalConditions, data.medicalDetails,
      data.parentInstagram, data.childInstagram, data.foodRestrictions,
      data.pickupAuthorized, data.pickupRestricted,
      data.goalImproveSkills, data.goalFun, data.goalActive, data.goalTeamwork,
      data.howHeard, data.referredBy, data.comments
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Runs daily via a time-based trigger — set it up in Triggers
function sendDailySummary() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    // No registrations yet
    MailApp.sendEmail({
      to: ORGANIZER_EMAIL,
      subject: "Camp Signups — 0 Total | " + Utilities.formatDate(new Date(), "America/New_York", "MMM d"),
      body: "No registrations yet."
    });
    return;
  }

  const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  const total = data.length;

  // Count by week (column 12, index 11)
  const weekCounts = {};
  for (const row of data) {
    const week = row[11] || "Unknown";
    weekCounts[week] = (weekCounts[week] || 0) + 1;
  }

  let body = "Total Registrations: " + total + "\n\n";
  body += "Breakdown by Week:\n";
  for (const [week, count] of Object.entries(weekCounts)) {
    body += "  " + week + ": " + count + "\n";
  }

  MailApp.sendEmail({
    to: ORGANIZER_EMAIL,
    subject: "Camp Signups — " + total + " Total | " + Utilities.formatDate(new Date(), "America/New_York", "MMM d"),
    body: body
  });
}
