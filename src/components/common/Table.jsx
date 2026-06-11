// A basic table.
// "headers" is an array of column titles.
// "children" should be the table rows (<tr>...</tr>).
function Table({ headers, children }) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
      {/* cells stay on one line so the table scrolls sideways on small screens
          instead of squashing columns into tall, wrapped rows */}
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
