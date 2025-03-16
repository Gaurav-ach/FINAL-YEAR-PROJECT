import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Category from "./pages/Category";
import BusinessDetails from "./pages/BusinessDetails";

const App = () => {
  const location = useLocation();
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/About" element={<About />} />
        <Route path="/Services" element={<Services />} />
        <Route path="/category/:id" element={<Category />} />
        <Route
          path="/businessDetails/:businessDetailsid"
          element={<BusinessDetails />}
        />
      </Routes>
      {!location.pathname.startsWith("/category/") && <Footer />}
    </div>
  );
};

export default App;
