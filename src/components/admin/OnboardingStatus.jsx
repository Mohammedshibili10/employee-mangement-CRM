// Shows the employee onboarding steps as a checklist + progress bar.
// "onboarding" is an object like:
//   { created: true, idGenerated: true, whatsappSent: false, firstLogin: false, profileCompleted: false }
function OnboardingStatus({ onboarding }) {
  const steps = [
    { key: "created", label: "Employee Created" },
    { key: "idGenerated", label: "Employee ID Generated" },
    { key: "whatsappSent", label: "WhatsApp Invitation Sent" },
    { key: "firstLogin", label: "First Login Completed" },
    { key: "profileCompleted", label: "Profile Completed" },
  ];

  // How many steps are done -> percentage for the progress bar
  const doneCount = steps.filter((s) => onboarding[s.key]).length;
  const percent = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800">Onboarding Status</h3>
        <span className="text-sm font-medium text-green-600">{percent}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full bg-slate-100 rounded-full mb-5">
        <div
          className="h-2 bg-green-500 rounded-full transition-all"
          style={{ width: percent + "%" }}
        ></div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => {
          const done = onboarding[step.key];
          return (
            <div key={step.key} className="flex items-center gap-3">
              {/* Check circle */}
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                  done
                    ? "bg-green-500 text-white"
                    : "border-2 border-slate-300 text-transparent"
                }`}
              >
                ✓
              </div>
              <span className={done ? "text-slate-800" : "text-slate-400"}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OnboardingStatus;
