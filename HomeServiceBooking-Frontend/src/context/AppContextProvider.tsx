import { AppContext } from "./AppContext";
import { useCallback, useEffect, useState } from "react";
import {
  PopularBusinessListType,
  requiterDataProps,
  requiterTokenCheck,
  TotalUsersState,
  userDataProps,
  usersState,
  userTokenCheck,
} from "../lib/type";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [searchFilter, setSearchFilter] = useState({
    title: "",
  });

  const [isSearched, setIsSearched] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>("");

  //show requiter login context
  const [showRequiterLogin, setShowRequiterLogin] = useState(false);

  //show user login context
  const [showUserLogin, setShowUserLogin] = useState(false);

  //get all business list
  const [business, setBusiness] = useState<PopularBusinessListType[]>([]);

  //get business list by category
  const [businessByCategory, setBusinessByCategory] = useState<
    PopularBusinessListType[]
  >([]);

  //get requiter token
  const [requiterToken, setRequiterToken] = useState<string | null>(
    localStorage.getItem("requiterToken")
  );
  const [requiterData, setRequiterData] = useState<requiterDataProps | null>(
    null
  );

  //get user token
  const [userData, setUserData] = useState<userDataProps | null>(null);
  const [userToken, setUserToken] = useState<string | null>(
    localStorage.getItem("userToken")
  );

  //get all users states
  const [totalUsers, setTotalUsers] = useState<TotalUsersState>({
    total: 0,
    user: 0,
    requiter: 0,
  });
  const [users, setUsers] = useState<usersState>({
    total: [],
    user: [],
    requiter: [],
  });

  const fetchAllUsers = async (role = "") => {
    setIsLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/getAllUsers`, {
        params: { role },
        headers: {
          Authorization: requiterToken,
        },
      });
      if (data.success) {
        setUsers((prev) => ({
          ...prev,
          [role || "total"]: data.users,
        }));
        setTotalUsers((prev) => ({
          ...prev,
          [role || "total"]: data.totalUsers,
        }));
        console.log(data.totalUsers);
      } else {
        setError(data.message);
      }
    } catch (error) {
      //Axios error
      if (error instanceof AxiosError && error.response) {
        setError(error.response.data.message);
      } else if (error instanceof Error) {
        setError(error.message || "An error occoured while fetching data");
      } else {
        setError("Internal Server Error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (requiterToken) {
      fetchAllUsers("");
      fetchAllUsers("user");
      fetchAllUsers("requiter");
    }
  }, [requiterToken]);

  //function to fetch business by category
  const fetchBusinessByCategory = useCallback(
    (categoryName: string) => {
      if (business.length === 0) return;
      const filteredBusinessList = business.filter(
        (business) =>
          business.category.toLowerCase() === categoryName.toLowerCase()
      );
      setBusinessByCategory(filteredBusinessList);
    },
    [business]
  );

  useEffect(() => {
    //function to fetch businessdata
    const fetchBusiness = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(
          `${backendUrl}/api/requiter/getBusinessData`
        );

        if (data.success) {
          console.log(data.businessData);
          setBusiness(data.businessData);
        } else {
          setError(data.message);
        }
      } catch (error) {
        console.error("User data fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusiness();
  }, [backendUrl]);

  //fetch requiterdata
  useEffect(() => {
    const fetchRequiterData = async () => {
      if (requiterToken) {
        try {
          const { data } = await axios.get<requiterTokenCheck>(
            `${backendUrl}/api/requiter/getrequiterData`,
            { headers: { Authorization: requiterToken } }
          );

          if (data.success) {
            setRequiterData(data.requiter);
          } else {
            setError(data.message);
            logout();
          }
        } catch (error) {
          console.error("User data fetch error:", error);
          logout();
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchRequiterData();
  }, [requiterToken, backendUrl]);

  //fetch userData
  useEffect(() => {
    const fetchUserData = async () => {
      if (userToken) {
        try {
          const { data } = await axios.get<userTokenCheck>(
            `${backendUrl}/api/user/getUserData`,
            { headers: { Authorization: userToken } }
          );

          if (data.success) {
            setUserData(data.user);
          } else {
            setError(data.message);
            logout();
          }
        } catch (error) {
          console.error("User data fetch error:", error);
          logout();
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [userToken, backendUrl]);

  //Logout function
  const logout = () => {
    setRequiterToken(null);
    localStorage.removeItem("requiterToken");
    setUserToken(null);
    localStorage.removeItem("userToken");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const value = {
    searchFilter,
    setSearchFilter,
    isSearched,
    setIsSearched,
    business,
    setBusiness,
    businessByCategory,
    fetchBusinessByCategory,
    showRequiterLogin,
    setShowRequiterLogin,
    requiterToken,
    setRequiterToken,
    requiterData,
    setRequiterData,
    backendUrl,
    logout,
    isLoading,
    setIsLoading,
    users,
    setUsers,
    totalUsers,
    setTotalUsers,
    error,
    setError,
    fetchAllUsers,
    userData,
    setUserData,
    userToken,
    setUserToken,
    showUserLogin,
    setShowUserLogin,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
