import Hero from "../components/Hero";
import CategoryList from "../components/CategoryList";
import BusinessList from "../components/BusinessList";
import { AppContext } from "../context/AppContext";
import { useContext } from "react";

const Home = () => {
  const { business } = useContext(AppContext);

  return (
    <div className="min-h-screen mx-6 md:mx-16">
      <Hero />
      <CategoryList />
      <BusinessList
        businessList={business}
        title={"Popular Business"}
        pagehref="Popular_Business"
      />
    </div>
  );
};

export default Home;
