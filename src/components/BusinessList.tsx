import { useContext, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BusinessListProps } from "../lib/type";
import noImage from "../assets/no-image.png";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const BusinessList = ({ businessList, title, pagehref }: BusinessListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { isLoading, setIsLoading } = useContext(AppContext);

  useEffect(() => {
    if (businessList.length > 0) {
      setIsLoading(false); // Stop loading once data is available
    } else {
      setTimeout(() => setIsLoading(false), 2000); // Simulate a loading state
    }
  }, [businessList]);

  //calculate total pages
  const totalpages = Math.ceil(businessList.length / 8);

  //function to go back in previous page
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  //function to go into next page
  const handleNextPage = () => {
    if (currentPage < totalpages) {
      setCurrentPage(currentPage + 1);
    }
  };
  return (
    <div className="mt-5">
      <h2 className="text-2xl font-bold scroll-mt-0" id={pagehref}>
        {title}
      </h2>

      {/* Show Skeleton if Loading */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-6 mt-5 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex flex-col space-y-3">
              <Skeleton className="w-full h-[250px] rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : businessList.length > 0 ? (
        <div className="grid grid-cols-2 gap-6 mt-5 md:grid-cols-3 lg:grid-cols-4">
          {businessList
            .slice((currentPage - 1) * 8, currentPage * 8)
            .map((item, index) => (
              <Link
                to={`/businessDetails/${item.id}`}
                key={index}
                className="transition-all ease-in-out rounded-lg shadow-md cursor-pointer hover:shadow-lg hover:shadow-primary hover:scale-105"
              >
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[0].url}
                    alt={item.name}
                    width={500}
                    height={200}
                    loading="lazy"
                    decoding="async"
                    className="object-cover h-[150px] md:h-[200px] rounded-lg shadow-sm transition-opacity duration-300 ease-in-out"
                  />
                ) : (
                  <img
                    src={noImage}
                    alt="No image available"
                    className="w-[80%] h-auto object-cover rounded-lg shadow-sm mx-auto"
                  />
                )}

                <div className="flex flex-col items-baseline gap-1 p-3">
                  <h2 className="px-2 py-1 text-sm bg-purple-200 rounded-full text-primary">
                    {item.category}
                  </h2>
                  <h2 className="text-lg font-bold">{item.name}</h2>
                  <h2 className="text-primary">{item.requiter.name}</h2>
                  <h2 className="text-sm text-gray-500">{item.address}</h2>
                  <Button className="mt-3">Book now</Button>
                </div>
              </Link>
            ))}
        </div>
      ) : (
        <div className="mt-5 text-lg text-center text-gray-500">
          No list available
        </div>
      )}

      {/* Pagination */}
      {!isLoading && businessList.length > 0 && (
        <div className="flex items-center justify-center mt-10 space-x-2">
          <a onClick={handlePreviousPage} href={`#${pagehref}`}>
            <button
              disabled={currentPage === 1}
              className="disabled:opacity-50"
            >
              <ChevronLeft />
            </button>
          </a>
          {Array.from({ length: totalpages }).map((_, index) => (
            <a key={index} href={`#${pagehref}`}>
              <button
                onClick={() => setCurrentPage(index + 1)}
                className={`w-10 h-10 items-center justify-center border border-gray-300 text-xl ${
                  currentPage === index + 1
                    ? "bg-purple-200 text-primary font-semibold"
                    : "text-gray-500"
                }`}
              >
                {index + 1}
              </button>
            </a>
          ))}
          <a onClick={handleNextPage} href={`#${pagehref}`}>
            <button
              disabled={currentPage === totalpages}
              className="disabled:opacity-50"
            >
              <ChevronRight />
            </button>
          </a>
        </div>
      )}
    </div>
  );
};

export default BusinessList;
