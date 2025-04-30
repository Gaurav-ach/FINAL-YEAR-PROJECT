import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { useContext, useRef } from "react";
import { AppContext } from "../context/AppContext";

const Hero = () => {
  const { setIsSearched, setSearchFilter } = useContext(AppContext);
  const titleRef = useRef<HTMLInputElement>(null!);

  const onSearch = () => {
    setSearchFilter({
      title: titleRef.current.value,
    });
    setIsSearched(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 pt-14 pb-7">
      <h2 className="font-bold text-[46px] text-center">
        Find Home <span className="text-primary">Service/Repair</span> <br />
        Near You
      </h2>
      <h2 className="text-xl text-gray-400">
        Search by service name, category, or provider
      </h2>
      <div className="flex items-center w-full max-w-2xl gap-4 mt-4">
        <Input
          ref={titleRef}
          placeholder="Search services, categories, or providers..."
          className="rounded-full md:flex-1"
          onKeyPress={handleKeyPress}
        />
        <Button onClick={onSearch} className="h-10 px-6 rounded-full">
          <Search className="w-2 h-2 mr-2" />
          Search
        </Button>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        Popular: Cleaning, Repair, Plumbing, Electrical
      </div>
    </div>
  );
};

export default Hero;
