import { useContext, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BusinessListProps } from "../lib/type";
import noImage from "../assets/no-image.png";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { Badge } from "./ui/badge";

const BusinessList = ({ businessList, title, pagehref }: BusinessListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { isLoading, setIsLoading } = useContext(AppContext);

  useEffect(() => {
    if (businessList.length > 0) {
      setIsLoading(false);
    } else {
      setTimeout(() => setIsLoading(false), 2000);
    }
  }, [businessList, setIsLoading]);

  const totalpages = Math.ceil(businessList.length / 8);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

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

                <div className="flex items-start justify-between p-4 mb-2">
                  <div className="flex flex-col">
                    <h2 className="mb-1 text-lg font-bold">{item.name}</h2>
                    <Badge className="mb-2 bg-primary w-fit">
                      {item.category}
                    </Badge>
                    <h2 className="text-primary">{item.requiter.name}</h2>
                    <h2 className="text-sm text-gray-600 line-clamp-2">
                      {item.address}
                    </h2>
                    <Button className="mt-3">Book now</Button>
                  </div>

                  <div>
                    <Badge
                      variant="outline"
                      className="text-green-800 bg-green-100 border-green-200"
                    >
                      ${item.amount.toFixed(2)}/hr
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      ) : (
        <div className="p-8 mt-5 text-center border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-lg text-gray-500">No services found</p>
          <p className="mt-2 text-sm text-gray-400">
            Try different search terms or browse categories
          </p>
        </div>
      )}

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
