export default function Header() {
  return (
    <div className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
      
      {/* LEFT */}
      <div>
        <h1 className="text-lg font-bold">Health New Zealand</h1>
        <p className="text-sm text-green-300">Te Whatu Ora</p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        <span className="text-sm">Dr. J. Doe</span>

        {/* Profile Circle */}
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
      </div>

    </div>
  );
}