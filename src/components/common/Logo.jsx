// App brand logo: a green square icon + the name and subtitle.
// "subtitle" changes per section (e.g. "Admin Panel" or "Employee").
function Logo({ subtitle = "CRM" }) {
  return (
    <div className="flex items-center gap-2">
      {/* Green square with the brand letter */}
      <div className="h-9 w-9 rounded-lg bg-green-500 text-white flex items-center justify-center font-bold text-lg">
        R
      </div>
      <div className="leading-tight">
        <p className="font-bold text-slate-800">RAC</p>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

export default Logo;
