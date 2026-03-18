import Link from "next/link";

export default function Buttons() {
  return (
    <div className="flex gap-4 mt-6">
      
      <Link href="/search/searchPage">
        <button className="px-5 py-2 border border-[#3E4A67] text-[#3E4A67] font-medium rounded hover:bg-gray-100">
          Search Patient
        </button>
      </Link>

      <Link href="/patients/newPatientPage">
        <button className="px-5 py-2 bg-[#3E4A67] text-white font-medium rounded hover:bg-[#2f3a55]">
          + New Patient
        </button>
      </Link>

    </div>
  );
}