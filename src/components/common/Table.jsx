function Table({ headers, children }) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">

      <table className="w-full text-left text-sm [&_td]:whitespace-nowrap">
        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
          <tr>
            {headers.map((head, index) => (
              <th key={index} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

export default Table;
