import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { useContext, useRef } from "react";
import { AppContext } from "../context/AppContext";

const Hero = () => {
  const { setIsSearched, setSearchFilter } = useContext(AppContext);

  //ref value for input
  const titleRef = useRef<HTMLInputElement>(null!);

  //onsearch function
  const onSearch = () => {
    setSearchFilter({
      title: titleRef.current.value,
    });
    setIsSearched(true);
  };
  return (
    <div className="flex flex-col items-center justify-center gap-3 pt-14 pb-7">
      <h2 className="font-bold text-[46px] text-center">
        Find Home <span className="text-primary">Service/Repair</span> <br />
        Near You
      </h2>
      <h2 className="text-xl text-gray-400">
        Explore Best Home Service & Repair Near you
      </h2>
      <div className="flex items-center gap-4 mt-4">
        <Input
          ref={titleRef}
          placeholder="Search"
          className="rounded-full md:w-[350px]"
        />
        <Button onClick={onSearch} className="h-12 rounded-full">
          <Search className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Hero;
