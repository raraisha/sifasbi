import React from "react";

export default function StatBox({ title, value, icon }: { title: string; value: number; icon: React.ReactElement }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#EEE7FF] text-[#6C3BD9] text-xl">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-gray-600">{title}</div>
      </div>
    </div>
  )
}
