export default function ReliabilityCard({ score }) {
  const color =
    score > 80 ? "bg-green-500" :
    score > 60 ? "bg-yellow-400" :
    "bg-red-500";

  return (
    <div className="bg-white p-6 rounded-xl shadow text-center">
      <h3 className="font-semibold mb-2">Reliability Score</h3>
      <div className="text-4xl font-bold mb-2">{score}%</div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div className={`${color} h-3 rounded-full`} style={{ width: `${score}%` }}></div>
      </div>
    </div>
  );
}
