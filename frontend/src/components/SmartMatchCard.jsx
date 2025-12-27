export default function SmartMatchCard({ name, skill, score, distance }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h3 className="font-bold text-lg">{name}</h3>
      <p className="text-sm text-gray-500">{skill}</p>
      <p className="mt-2">Reliability: <b>{score}%</b></p>
      <p>Distance: {distance} km</p>
      <button className="bg-blue-600 text-white px-4 py-1 rounded mt-3">
        Assign Helper
      </button>
    </div>
  );
}
