import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { PopularBusinessListType } from "../lib/type";
import BusinessInfo from "../components/BusinessInfo";
import BusinessDescription from "../components/BusinessDescription";
import SuggestedBusinessList from "../components/SuggestedBusinessList";
import Loader from "../components/Loader";
import axios from "axios";
import { toast } from "sonner";

const BusinessDetails = () => {
  const { id } = useParams();

  //scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  //Extracting the data from context
  const {
    businessByCategory,
    fetchBusinessByCategory,
    setIsLoading,
    backendUrl,
  } = useContext(AppContext);

  // storing the businessData in state
  const [businessData, setBusinessData] =
    useState<PopularBusinessListType | null>(null);

  //calling the data in overall page
  useEffect(() => {
    // fetching the business data by id
    const fetchBusinessData = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(
          `${backendUrl}/api/requiter/getBusinessDataById/${id}`
        );

        if (data.success) {
          console.log(data.businessData);
          setBusinessData(data.businessData);
        } else {
          toast.error(data.error);
        }
      } catch (error) {
        console.log("BusinessDatabyId fetching error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBusinessData();
  }, [id, setIsLoading, backendUrl]);

  useEffect(() => {
    if (businessData?.category) {
      fetchBusinessByCategory(businessData?.category);
    }
  }, [businessData, fetchBusinessByCategory]);
  return businessData ? (
    <div className="min-h-screen px-10 py-8 mx-6 md:py-20 md:px-26 lg:px-36 md:mx-16">
      <BusinessInfo business={businessData} />

      <div className="grid grid-cols-4 mt-16">
        <div className="col-span-4 md:col-span-3">
          <BusinessDescription business={businessData} />
        </div>
        <div className="hidden md:block">
          <SuggestedBusinessList
            business={businessByCategory.filter(
              (b) => b.id !== businessData.id
            )}
            selectedBusinessId={businessData.id}
          />
        </div>
      </div>
    </div>
  ) : (
    <Loader />
  );
};

export default BusinessDetails;
