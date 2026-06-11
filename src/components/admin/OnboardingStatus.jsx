function OnboardingStatus({ onboarding }) {
  const steps = [
    { key: "created", label: "Employee Created" },
    { key: "idGenerated", label: "Employee ID Generated" },
    { key: "whatsappSent", label: "WhatsApp Invitation Sent" },
    { key: "firstLogin", label: "First Login Completed" },
    { key: "profileCompleted", label: "Profile Completed" },
  ];

  const doneCount = steps.filter((s) => onboarding[s.key]).length;
  const percent = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-card p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-800">Onboarding Status</h3>
        <span className="text-sm font-bold text-brand-600">{percent}%</span>
      </div>

      <div className="h-2.5 w-full bg-slate-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-2.5 bg-brand-gradient rounded-full transition-all duration-700 ease-out"
          style={{ width: percent + "%" }}
        ></div>
      </div>

      <div className="space-y-3.5">
        {steps.map((step) => {
          const done = onboarding[step.key];
          return (
            <div key={step.key} className="flex items-center gap-3">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs transition-all ${
                  done
                    ? "bg-brand-gradient text-white shadow-glow-sm"
                    : "border-2 border-slate-200 text-transparent"
                }`}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className={`text-sm ${done ? "text-slate-800 font-medium" : "text-slate-400"}`}>
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
