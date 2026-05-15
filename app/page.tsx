"use client";

import { useState } from "react";
import { CAMP_WEEKS, CAMPS, SPORTS, HOW_HEARD_OPTIONS } from "@/lib/constants";
import { RegistrationData } from "@/lib/types";

const TOTAL_STEPS = 7;

const PRIORITY_OPTIONS = ["low", "moderate", "high"];

const emptyForm: RegistrationData = {
  parentName: "", email: "", address: "", phoneMom: "", phoneDad: "",
  childName: "", dob: "", age: "", school: "", sports: [],
  campId: "", campLabel: "",
  weekId: 0, weekLabel: "", session: "", sessionLabel: "", sessionTime: "", price: 0,
  emergencyContactName: "", emergencyContactPhone: "",
  hasAllergies: "no", allergyDetails: "",
  hasMedicalConditions: "no", medicalDetails: "",
  parentInstagram: "", childInstagram: "", foodRestrictions: "",
  pickupAuthorized: "", pickupRestricted: "",
  goalImproveSkills: "low", goalFun: "low", goalActive: "low", goalTeamwork: "low",
  howHeard: "", referredBy: "", comments: "",
  waiverAccepted: false,
};

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i < current ? "bg-yellow-400 w-6" : i === current ? "bg-yellow-400 w-8" : "bg-gray-700 w-4"
          }`}
        />
      ))}
    </div>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1.5 font-medium">
      {children} {required && <span className="text-yellow-400">*</span>}
    </label>
  );
}

function Input({ id, value, onChange, type = "text", placeholder }: {
  id: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-yellow-400 transition-colors"
    />
  );
}

function Textarea({ id, value, onChange, placeholder, rows = 3 }: {
  id: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-yellow-400 transition-colors resize-none"
    />
  );
}

function RadioGroup({ name, value, options, onChange }: {
  name: string; value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium border transition-all ${
            value === opt.value
              ? "bg-yellow-400 text-black border-yellow-400"
              : "bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function RegistrationPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<RegistrationData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof RegistrationData>(key: K, value: RegistrationData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleSport(sport: string) {
    set("sports", form.sports.includes(sport)
      ? form.sports.filter((s) => s !== sport)
      : [...form.sports, sport]
    );
  }

  function selectCamp(campId: string) {
    const c = CAMPS.find((c) => c.id === campId)!;
    setForm((prev) => ({
      ...prev,
      campId: c.id,
      campLabel: c.label,
      session: "", sessionLabel: "", sessionTime: "", price: 0,
    }));
  }

  function selectSession(sessionId: string) {
    const camp = CAMPS.find((c) => c.id === form.campId) ?? CAMPS[0];
    const s = camp.sessions.find((s) => s.id === sessionId)!;
    setForm((prev) => ({
      ...prev,
      session: s.id,
      sessionLabel: s.label,
      sessionTime: s.time,
      price: s.price,
    }));
  }

  function selectWeek(weekId: number) {
    const w = CAMP_WEEKS.find((w) => w.id === weekId)!;
    setForm((prev) => ({ ...prev, weekId: w.id, weekLabel: w.label }));
  }

  function validateStep(): string {
    switch (step) {
      case 0:
        if (!form.parentName || !form.email || !form.address || !form.phoneMom || !form.phoneDad)
          return "Please fill in all required fields.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
          return "Please enter a valid email address.";
        break;
      case 1:
        if (!form.childName || !form.dob || !form.age || !form.school)
          return "Please fill in all required fields.";
        if (form.sports.length === 0)
          return "Please select at least one sport.";
        break;
      case 2:
        if (!form.campId) return "Please select a camp.";
        if (!form.weekId || !form.session)
          return "Please select a week and session.";
        break;
      case 3:
        if (!form.emergencyContactName || !form.emergencyContactPhone)
          return "Please fill in emergency contact info.";
        break;
      case 4:
        if (!form.foodRestrictions || !form.pickupAuthorized || !form.pickupRestricted)
          return "Please fill in all required fields.";
        break;
      case 5:
        if (!form.howHeard) return "Please tell us how you heard about camp.";
        break;
      case 6:
        if (!form.waiverAccepted) return "You must accept the waiver to continue.";
        break;
    }
    return "";
  }

  function next() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      window.location.href = data.checkoutUrl;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const stepTitles = [
    "Parent Information",
    "Child Information",
    "Camp Selection",
    "Medical & Emergency",
    "Additional Details",
    "Goals & Referral",
    "Waiver & Payment",
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="bg-black border-b border-yellow-400/30 py-6 px-4 text-center">
        <p className="text-yellow-400 text-xs uppercase tracking-widest mb-1 font-medium">The Arena Lilburn</p>
        <h1 className="text-2xl font-bold text-white">Multi-Sport Summer Camp</h1>
        <p className="text-gray-500 text-sm mt-1">June 16 – August 8, 2026 &middot; Mon–Thu</p>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        <StepIndicator current={step} total={TOTAL_STEPS} />

        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest text-yellow-400 font-medium mb-1">
            Step {step + 1} of {TOTAL_STEPS}
          </p>
          <h2 className="text-xl font-bold text-white">{stepTitles[step]}</h2>
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div>
              <Label required>Parent / Guardian Full Name</Label>
              <Input id="parentName" value={form.parentName} onChange={(v) => set("parentName", v)} placeholder="Full name" />
            </div>
            <div>
              <Label required>Email Address</Label>
              <Input id="email" type="email" value={form.email} onChange={(v) => set("email", v)} placeholder="your@email.com" />
            </div>
            <div>
              <Label required>Home Address</Label>
              <Input id="address" value={form.address} onChange={(v) => set("address", v)} placeholder="Street, City, State, Zip" />
            </div>
            <div>
              <Label required>Primary Phone (Mom)</Label>
              <Input id="phoneMom" type="tel" value={form.phoneMom} onChange={(v) => set("phoneMom", v)} placeholder="(555) 000-0000" />
            </div>
            <div>
              <Label required>Secondary Phone (Dad or Other)</Label>
              <Input id="phoneDad" type="tel" value={form.phoneDad} onChange={(v) => set("phoneDad", v)} placeholder="(555) 000-0000" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label required>Child&apos;s Full Name</Label>
              <Input id="childName" value={form.childName} onChange={(v) => set("childName", v)} placeholder="Full name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label required>Date of Birth</Label>
                <Input id="dob" type="date" value={form.dob} onChange={(v) => set("dob", v)} />
              </div>
              <div>
                <Label required>Age at Camp Start</Label>
                <Input id="age" value={form.age} onChange={(v) => set("age", v)} placeholder="e.g. 10" />
              </div>
            </div>
            <div>
              <Label required>Current School</Label>
              <Input id="school" value={form.school} onChange={(v) => set("school", v)} placeholder="School name" />
            </div>
            <div>
              <Label required>Sports the Child Currently Plays</Label>
              <p className="text-xs text-gray-500 mb-2">Select all that apply</p>
              <div className="flex flex-wrap gap-2">
                {SPORTS.map((sport) => (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => toggleSport(sport)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      form.sports.includes(sport)
                        ? "bg-yellow-400 text-black border-yellow-400"
                        : "bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500"
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <Label required>Which Camp?</Label>
              <div className="space-y-2">
                {CAMPS.map((camp) => (
                  <button
                    key={camp.id}
                    type="button"
                    onClick={() => selectCamp(camp.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      form.campId === camp.id
                        ? "bg-yellow-400/10 border-yellow-400"
                        : "bg-gray-900 border-gray-700 hover:border-gray-500"
                    }`}
                  >
                    <p className={`text-sm font-semibold ${form.campId === camp.id ? "text-yellow-400" : "text-gray-300"}`}>{camp.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{camp.tagline}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label required>Choose Your Week</Label>
              <div className="space-y-2">
                {CAMP_WEEKS.map((week) => (
                  <button
                    key={week.id}
                    type="button"
                    onClick={() => selectWeek(week.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                      form.weekId === week.id
                        ? "bg-yellow-400/10 border-yellow-400 text-yellow-400"
                        : "bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500"
                    }`}
                  >
                    {week.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label required>Choose Your Session</Label>
              <div className="space-y-2">
                {(CAMPS.find((c) => c.id === form.campId) ?? CAMPS[0]).sessions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => selectSession(s.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      form.session === s.id
                        ? "bg-yellow-400/10 border-yellow-400"
                        : "bg-gray-900 border-gray-700 hover:border-gray-500"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className={`text-sm font-medium ${form.session === s.id ? "text-yellow-400" : "text-gray-300"}`}>{s.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.time} &middot; Mon–Thu</p>
                      </div>
                      <span className={`text-base font-bold ${form.session === s.id ? "text-yellow-400" : "text-gray-400"}`}>${s.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {form.session && form.weekId > 0 && (
              <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Your selection</p>
                <p className="text-white text-sm font-medium mt-1">{form.weekLabel}</p>
                <p className="text-gray-400 text-sm">{form.sessionLabel} &middot; {form.sessionTime}</p>
                <p className="text-yellow-400 font-bold text-lg mt-1">${form.price}.00</p>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <Label required>Emergency Contact Name</Label>
              <p className="text-xs text-gray-500 mb-1.5">Other than parent/guardian</p>
              <Input id="emergencyName" value={form.emergencyContactName} onChange={(v) => set("emergencyContactName", v)} placeholder="Full name" />
            </div>
            <div>
              <Label required>Emergency Contact Phone</Label>
              <Input id="emergencyPhone" type="tel" value={form.emergencyContactPhone} onChange={(v) => set("emergencyContactPhone", v)} placeholder="(555) 000-0000" />
            </div>
            <div>
              <Label required>Does the child have allergies or known injuries?</Label>
              <RadioGroup
                name="allergies"
                value={form.hasAllergies}
                options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]}
                onChange={(v) => set("hasAllergies", v)}
              />
              {form.hasAllergies === "yes" && (
                <div className="mt-3">
                  <Label>Allergy / Injury Details</Label>
                  <Textarea id="allergyDetails" value={form.allergyDetails} onChange={(v) => set("allergyDetails", v)} placeholder="Describe allergies or injuries..." />
                </div>
              )}
            </div>
            <div>
              <Label required>Does the child have any ongoing medical conditions?</Label>
              <p className="text-xs text-gray-500 mb-1.5">e.g. Asthma, Diabetes, required medication</p>
              <RadioGroup
                name="medical"
                value={form.hasMedicalConditions}
                options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]}
                onChange={(v) => set("hasMedicalConditions", v)}
              />
              {form.hasMedicalConditions === "yes" && (
                <div className="mt-3">
                  <Label>Medical Condition Details</Label>
                  <Textarea id="medicalDetails" value={form.medicalDetails} onChange={(v) => set("medicalDetails", v)} placeholder="Describe conditions and required care..." />
                </div>
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <Label>Parent Instagram Handle <span className="text-gray-600 normal-case tracking-normal text-xs">(optional)</span></Label>
              <Input id="parentIg" value={form.parentInstagram} onChange={(v) => set("parentInstagram", v)} placeholder="@handle" />
            </div>
            <div>
              <Label>Child Instagram Handle <span className="text-gray-600 normal-case tracking-normal text-xs">(optional)</span></Label>
              <Input id="childIg" value={form.childInstagram} onChange={(v) => set("childInstagram", v)} placeholder="@handle" />
            </div>
            <div>
              <Label required>Food Restrictions / Dietary Needs</Label>
              <Input id="food" value={form.foodRestrictions} onChange={(v) => set("foodRestrictions", v)} placeholder="None, Vegetarian, Gluten-Free..." />
            </div>
            <div>
              <Label required>Pickup Authorization</Label>
              <p className="text-xs text-gray-500 mb-1.5">List all individuals authorized to pick up the child (besides you)</p>
              <Textarea id="pickupAuth" value={form.pickupAuthorized} onChange={(v) => set("pickupAuthorized", v)} placeholder="Name, relationship — Name, relationship..." />
            </div>
            <div>
              <Label required>Pickup Restrictions</Label>
              <p className="text-xs text-gray-500 mb-1.5">List anyone NOT authorized. Enter &quot;None&quot; if not applicable.</p>
              <Textarea id="pickupRestrict" value={form.pickupRestricted} onChange={(v) => set("pickupRestricted", v)} placeholder="Name — or None" />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <div>
              <Label required>Primary Goals for This Camp</Label>
              <p className="text-xs text-gray-500 mb-3">Rate each goal&apos;s priority for your child</p>
              <div className="space-y-3">
                {[
                  { key: "goalImproveSkills" as const, label: "Improve specific sports skills" },
                  { key: "goalFun" as const, label: "Have fun and socialize" },
                  { key: "goalActive" as const, label: "Stay active during the break" },
                  { key: "goalTeamwork" as const, label: "Learn teamwork and sportsmanship" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <p className="text-sm text-gray-300 mb-1.5">{label}</p>
                    <RadioGroup
                      name={key}
                      value={form[key]}
                      options={PRIORITY_OPTIONS.map((p) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))}
                      onChange={(v) => set(key, v)}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label required>How did you hear about our camp?</Label>
              <div className="flex flex-wrap gap-2">
                {HOW_HEARD_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set("howHeard", opt)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      form.howHeard === opt
                        ? "bg-yellow-400 text-black border-yellow-400"
                        : "bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Who referred you? <span className="text-gray-600 normal-case tracking-normal text-xs">(optional)</span></Label>
              <Input id="referredBy" value={form.referredBy} onChange={(v) => set("referredBy", v)} placeholder="Name or organization" />
            </div>
            <div>
              <Label>Additional Comments <span className="text-gray-600 normal-case tracking-normal text-xs">(optional)</span></Label>
              <Textarea id="comments" value={form.comments} onChange={(v) => set("comments", v)} placeholder="Anything else the staff should know..." />
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-5">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-2">
              <p className="text-xs uppercase tracking-widest text-yellow-400 font-medium mb-3">Registration Summary</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Child</span>
                <span className="text-white font-medium">{form.childName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Week</span>
                <span className="text-white">{form.weekLabel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Session</span>
                <span className="text-white">{form.sessionLabel} &middot; {form.sessionTime}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
                <span className="text-gray-400 font-medium">Total</span>
                <span className="text-yellow-400 font-bold text-lg">${form.price}.00</span>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
              <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">Waiver & Liability Release</p>
              <div className="h-40 overflow-y-auto text-xs text-gray-400 space-y-2 mb-4 pr-1">
                <p>By registering for The Arena Lilburn Multi-Sport Summer Camp, I acknowledge and agree to the following terms:</p>
                <p><strong className="text-gray-300">Assumption of Risk:</strong> I understand that participation in sports activities involves inherent risks of injury, and I voluntarily assume those risks on behalf of my child.</p>
                <p><strong className="text-gray-300">Release of Liability:</strong> I hereby release, waive, discharge, and covenant not to sue The Arena Lilburn, its owners, officers, employees, volunteers, and agents from any and all claims arising from participation in camp activities, including negligence.</p>
                <p><strong className="text-gray-300">Medical Authorization:</strong> In the event of an emergency, I authorize camp staff to seek medical treatment for my child if I cannot be reached.</p>
                <p><strong className="text-gray-300">Photo/Media Release:</strong> I grant The Arena Lilburn the right to photograph and record my child during camp activities for promotional use unless I provide written notice to the contrary.</p>
                <p><strong className="text-gray-300">Conduct Policy:</strong> I agree that my child will adhere to the camp&apos;s code of conduct. The Arena Lilburn reserves the right to dismiss any camper without refund for serious misconduct.</p>
                <p><strong className="text-gray-300">No Refunds:</strong> Registration fees are non-refundable. In the event of a cancellation due to circumstances beyond our control, a credit toward a future session will be offered.</p>
              </div>
              <button
                type="button"
                onClick={() => set("waiverAccepted", !form.waiverAccepted)}
                className="flex items-start gap-3 text-left w-full group"
              >
                <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  form.waiverAccepted ? "bg-yellow-400 border-yellow-400" : "border-gray-600 group-hover:border-gray-400"
                }`}>
                  {form.waiverAccepted && (
                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-300">
                  I confirm that I have read and agree to the camp&apos;s Terms and Conditions, including the Waiver and Release of Liability.
                </span>
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              After submitting you&apos;ll be redirected to Square to complete payment. A confirmation email will be sent to <span className="text-gray-400">{form.email}</span> once payment is confirmed.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              type="button"
              onClick={back}
              className="flex-1 py-3.5 rounded-xl border border-gray-700 text-gray-400 text-sm font-medium hover:border-gray-500 hover:text-gray-300 transition-all"
            >
              Back
            </button>
          )}
          {step < TOTAL_STEPS - 1 ? (
            <button
              type="button"
              onClick={next}
              className="flex-1 py-3.5 rounded-xl bg-yellow-400 text-black text-sm font-bold hover:bg-yellow-300 transition-all"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="flex-1 py-3.5 rounded-xl bg-yellow-400 text-black text-sm font-bold hover:bg-yellow-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Redirecting to payment..." : `Pay $${form.price}.00 →`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
