import React from 'react';

function range(n) { return Array.from({ length: n }, (_, i) => i); }

export default function AttendanceCalendar({ attendance = [] }) {
  // attendance: array of rows with createdAt timestamps
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-based

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstDay.getDay(); // 0 Sun .. 6 Sat

  // map day -> present boolean
  const presentSet = new Set((attendance || []).map((a) => {
    const d = new Date(a.createdAt);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }));

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <div className="bg-white rounded-2xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Attendance</div>
        <div className="text-xs text-gray-500">{today.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-xs text-center">
        {['S','M','T','W','T','F','S'].map((d) => (
          <div key={d} className="text-gray-500">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 mt-2">
        {cells.map((c, idx) => {
          if (!c) return <div key={idx} className="h-10" />;
          const key = `${c.getFullYear()}-${c.getMonth()}-${c.getDate()}`;
          const present = presentSet.has(key);
          const isToday = c.toDateString() === new Date().toDateString();
          return (
            <div key={key} className={`h-10 flex items-center justify-center rounded ${isToday ? 'ring-1 ring-blue-200' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${present ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-400'}`}>
                {present ? '✓' : '✕'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
