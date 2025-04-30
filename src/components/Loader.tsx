import { ClipLoader } from "react-spinners";

const Loader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <ClipLoader size={60} color="#0075b6" />
    </div>
  );
};

export default Loader;
