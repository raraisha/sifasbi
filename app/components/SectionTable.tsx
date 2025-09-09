export default function SectionTable({ title, headers, rows }: { title: string; headers: string[]; rows: any[][] }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {headers.map((header, i) => (
                <th key={i} className="py-2 px-3 text-left border-b">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {row.map((cell, j) => (
                  <td key={j} className="py-2 px-3 border-b">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="mt-4 w-full py-2 text-white font-semibold rounded-md bg-gradient-to-r from-[#B36FF2] to-[#273B98] hover:opacity-90">
        Lihat Selengkapnya
      </button>
    </div>
  )
}
