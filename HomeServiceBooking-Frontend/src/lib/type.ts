export interface PopularBusinessListType {
  id: string;
  name: string;
  about: string;
  amount: number;
  address: string;
  category: string;
  requiter: {
    name: string;
    email: string;
    contactNumber: string;
  };
  email: string;
  images: imageUrl[];
}

export interface imageUrl {
  url: string;
}

export interface BusinessListProps {
  businessList: PopularBusinessListType[];
  title: string;
  pagehref: string;
}

export interface BusinessDetailsProps {
  business: PopularBusinessListType | null;
}

export interface SuggestedBusinessDetailsProps {
  business: PopularBusinessListType[];
}

export interface requiterDataProps {
  role: string;
  id: string;
  email: string;
  password: string;
  name: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  requiterProfileImage: string;
}

export interface userDataProps {
  id: string;
  email: string;
  password: string;
  name: string;
  firstName: string;
  lastName: string;
  userProfileImage: string;
}

export interface loginForm {
  email: string;
  password: string;
}

export interface requiterLoginResponse {
  success: boolean;
  requiter: requiterDataProps;
  token: string;
  message: string;
}

export interface userLoginResponse {
  success: boolean;
  user: userDataProps;
  token: string;
  message: string;
}

export interface requiterTokenCheck {
  success: boolean;
  requiter: requiterDataProps;
  message: string;
}

export interface userTokenCheck {
  success: boolean;
  user: userDataProps;
  message: string;
}

export interface businessDataProps {
  name: string;
  category: string;
  address: number;
  about: number;
}

export interface businessDataResponse {
  success: boolean;
  message: string;
  product: businessDataProps;
  token: string;
  images: string[];
}

export interface TotalUsersState {
  total: number;
  user: number;
  requiter: number;
}

export interface user {
  id: string;
  name: string;
  email: string;
  userProfileImage: string;
  role: string;
  password: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  requiterProfileImage: string;
}

export interface total {
  id: string;
  name: string;
  email: string;
  userProfileImage: string;
}

export interface usersState {
  total: total[];
  user: user[];
  requiter: requiterDataProps[];
}

export interface userData {
  role: string;
  id: string;
  email: string;
  name: string;
  contactNumber: string;
}

export interface viewUserDataProps {
  user: userData[];
}

export interface businessList {
  amount: number;
  address: string;
  name: string;
  category: string;
  images: BusinessImage[];
  requiter: requiterDataProps;
}

export interface BusinessImage {
  url: string;
}

export interface Booking {
  moment(): import("react").ReactNode;
  id: string;
  userId: string;
  businessId: string;
  date: string;
  time: string;
  amount: string;
  bookingStatus: "COMPLETED" | "CANCELLED" | "PENDING";
  createdAt: string;
  updateaAt: string;
  business: businessList;
}
