"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
const SearchFilter = () => {
  const router = useRouter(); //Read the current URL (pathname, query params).
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const query = formData.get("query")?.toString().trim();
    if (query) router.push(`/?q=${encodeURIComponent(query)}`); ///?q=red%20shoes
  };
  const clearSearch = () => {
    setText("");
  };
  const [text, setText] = useState("");
  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-5 h-5 text-gray-400  hover:text-white transition-all duration-200" />

        <input
          name="query"
          value={text}
          type="text"
          onChange={(e) => setText(e.target.value)}
          placeholder="Search...."
          className=" w-full px-10 py-2 border border-gray-400 rounded-full "
        />
        <X
          onClick={clearSearch}
          className="absolute right-3 w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-all duration-200"
        />
      </div>
    </form>
  );
};

export default SearchFilter;
