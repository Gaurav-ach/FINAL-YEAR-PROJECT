import Hero from "../components/Hero";
import CategoryList from "../components/CategoryList";
import BusinessList from "../components/BusinessList";
import { AppContext } from "../context/AppContext";
import { useContext, useState, useEffect } from "react";
import { PopularBusinessListType } from "../lib/type";

const Home = () => {
  const { business, searchFilter } = useContext(AppContext);
  const [filteredBusiness, setFilteredBusiness] =
    useState<PopularBusinessListType[]>(business);

  useEffect(() => {
    if (searchFilter.title) {
      const filtered = business.filter((item) => {
        const searchTerm = searchFilter.title.toLowerCase();
        return (
          item.name.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm) ||
          item.requiter.name.toLowerCase().includes(searchTerm)
        );
      });
      setFilteredBusiness(filtered);
    } else {
      setFilteredBusiness(business);
    }
  }, [searchFilter.title, business]);

  return (
    <div className="min-h-screen mx-6 md:mx-16">
      <Hero />
      <CategoryList />
      <BusinessList
        businessList={filteredBusiness}
        title={"Popular Business"}
        pagehref="Popular_Business"
      />
    </div>
  );
};

export default Home;
