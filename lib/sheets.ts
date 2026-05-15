import { RegistrationData } from "./types";

export async function appendRegistration(reg: RegistrationData, paymentId: string, paidAt: string) {
  const url = process.env.SHEETS_WEBAPP_URL!;

  const payload = {
    date: new Date().toLocaleDateString("en-US"),
    campLabel: reg.campLabel,
    parentName: reg.parentName,
    email: reg.email,
    address: reg.address,
    phoneMom: reg.phoneMom,
    phoneDad: reg.phoneDad,
    childName: reg.childName,
    dob: reg.dob,
    age: reg.age,
    school: reg.school,
    sports: reg.sports.join(", "),
    weekLabel: reg.weekLabel,
    sessionLabel: reg.sessionLabel,
    sessionTime: reg.sessionTime,
    price: `$${reg.price}`,
    paymentId,
    paidAt,
    emergencyContactName: reg.emergencyContactName,
    emergencyContactPhone: reg.emergencyContactPhone,
    hasAllergies: reg.hasAllergies,
    allergyDetails: reg.allergyDetails,
    hasMedicalConditions: reg.hasMedicalConditions,
    medicalDetails: reg.medicalDetails,
    parentInstagram: reg.parentInstagram,
    childInstagram: reg.childInstagram,
    foodRestrictions: reg.foodRestrictions,
    pickupAuthorized: reg.pickupAuthorized,
    pickupRestricted: reg.pickupRestricted,
    goalImproveSkills: reg.goalImproveSkills,
    goalFun: reg.goalFun,
    goalActive: reg.goalActive,
    goalTeamwork: reg.goalTeamwork,
    howHeard: reg.howHeard,
    referredBy: reg.referredBy,
    comments: reg.comments,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Sheets webapp returned ${res.status}`);
  }
}
