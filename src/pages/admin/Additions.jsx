function Additions() {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Additions</h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage salary additions such as bonuses, incentives, overtime and reimbursements.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-card p-10 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-brand-gradient-soft text-brand-600 flex items-center justify-center text-3xl font-bold mb-3">
          +
        </div>
        <h3 className="text-lg font-bold text-slate-800">No additions yet</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          This section is reserved for salary additions. Adding bonuses, incentives and other credits to payroll will be managed here.
        </p>
      </div>
    </div>
  );
}

export default Additions;
