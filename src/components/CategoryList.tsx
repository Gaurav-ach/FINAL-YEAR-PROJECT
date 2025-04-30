import { Link } from "react-router-dom";
import { BusinessCategories } from "../lib/data";

const CategoryList = () => {
  return (
    <div className="mx-4 md:mx-22 lg:mx-52 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {BusinessCategories.length > 0
        ? BusinessCategories.map((item) => (
            <Link
              to={`/category/${item.name}`}
              key={item.id}
              className="flex flex-col items-center justify-center gap-2 bg-purple-100 p-5 rounded-lg cursor-pointer hover:scale-110 transition-all ease-in-out"
            >
              <img
                src={item.icon}
                alt="icon"
                width={35}
                height={35}
                loading="lazy"
                decoding="async"
              />
              <h2 className="text-primary">{item.name}</h2>
            </Link>
          ))
        : [1, 2, 3, 4, 5, 6].map(() => (
            <div className="h-[120px] w-full bg-slate-200 animate-pulse rounded-lg"></div>
          ))}
    </div>
  );
};

export default CategoryList;
