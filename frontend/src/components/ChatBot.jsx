import { X } from 'lucide-react';
import { useState } from 'react';

export default function ChatBot({ onClose }) {
  const [text, setText] = useState('');

  return (
    <div className="fixed bottom-6 left-6 bg-white shadow-2xl rounded-xl w-80 p-3 z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold">SmartHelper AI</h3>
        <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
          <X />
        </button>
      </div>
      <div className="mb-2 text-sm text-gray-600">Ask anything about jobs, payments, or profiles.</div>
      <textarea value={text} onChange={(e)=>setText(e.target.value)} rows={3} className="border p-2 w-full rounded mb-2" placeholder="Ask me..." />
      <div className="flex gap-2">
        <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded" onClick={()=>{ /* placeholder for chat action */ setText(''); }}>Send</button>
        <button className="px-3 py-2 border rounded" onClick={()=>setText('')}>Clear</button>
      </div>
    </div>
  );
}
