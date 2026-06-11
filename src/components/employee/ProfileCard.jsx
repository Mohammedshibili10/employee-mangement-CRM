// Shows the employee's basic profile information.
function ProfileCard({ employee }) {
  // small helper to show one row of info
  const Row = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-800 font-medium">{value}</span>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-4 mb-5">
        <div className="h-16 w-16 rounded-full bg-green-600 text-white flex items-center justify-center text-2xl font-bold">
          {employee.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{employee.name}</h2>
          <p className="text-sm text-slate-500">{employee.designation}</p>
        </div>
      </div>

      <Row label="Email" value={employee.email} />
      <Row label="Phone" value={employee.phone} />
      <Row label="Department" value={employee.department} />
      <Row label="Joining Date" value={employee.joiningDate} />
    </div>
  );
}

export default ProfileCard;
