import { NotebookPen } from "lucide-react";
import { SuggestedBusinessDetailsProps } from "../lib/type";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import noImage from "../assets/no-image.png";

const SuggestedBusinessList = ({ business }: SuggestedBusinessDetailsProps) => {
  console.log(business);
  return (
    <div className="pl-10">
      <Button className="flex w-full gap-2">
        <NotebookPen /> Book Appointment
      </Button>
      <h2 className="mt-3 mb-3 text-lg font-bold">Similar Business</h2>
      <div className="">
        {business.map((item, index) => (
          <Link
            to={`/businessDetails/${item.id}`}
            key={index}
            className="flex gap-2 p-2 mb-4 rounded-lg cursor-pointer hover:border hover:border-primary hover:shadow-md"
          >
            <img
              src={item?.images?.[0]?.url || noImage}
              alt={item.name}
              width={80}
              height={80}
              className="object-cover rounded-lg"
              loading="lazy"
              decoding="async"
            />
            <div>
              <h2 className="font-bold">{item.name}</h2>
              <h2 className="text-primary">{item.requiter.name}</h2>
              <h2 className="text-gray-400">{item.address}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SuggestedBusinessList;
