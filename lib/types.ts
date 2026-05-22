export interface RegistrationData {
  // Parent
  parentName: string;
  email: string;
  address: string;
  phoneMom: string;
  phoneDad: string;

  // Child
  childName: string;
  dob: string;
  age: string;
  school: string;
  sports: string[];

  // Camp selection
  isBundle: boolean;
  campId: string;
  campLabel: string;
  weekId: number;
  weekLabel: string;
  camp2Id: string;
  camp2Label: string;
  week2Id: number;
  week2Label: string;
  session: string;
  sessionLabel: string;
  sessionTime: string;
  price: number;

  // Medical & emergency
  emergencyContactName: string;
  emergencyContactPhone: string;
  hasAllergies: string;
  allergyDetails: string;
  hasMedicalConditions: string;
  medicalDetails: string;

  // Additional
  parentInstagram: string;
  childInstagram: string;
  foodRestrictions: string;
  pickupAuthorized: string;
  pickupRestricted: string;

  // Goals & referral
  goalImproveSkills: string;
  goalFun: string;
  goalActive: string;
  goalTeamwork: string;
  howHeard: string;
  referredBy: string;
  comments: string;

  // Waiver
  waiverAccepted: boolean;
}
