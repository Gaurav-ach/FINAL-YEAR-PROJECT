import { useContext, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Calendar, Clock, DollarSign } from "lucide-react";
import CategoryList from "../components/CategoryList";
import BusinessList from "../components/BusinessList";
import { AppContext } from "../context/AppContext";

// How it works steps
const howItWorks = [
  {
    id: 1,
    title: "Find a Service",
    description: "Browse through our wide range of professional services",
    icon: <Search className="w-10 h-10 text-primary" />,
  },
  {
    id: 2,
    title: "Book Appointment",
    description: "Choose a convenient date and time for your service",
    icon: <Calendar className="w-10 h-10 text-primary" />,
  },
  {
    id: 3,
    title: "Get it Done",
    description: "Our verified professionals will complete the job",
    icon: <Clock className="w-10 h-10 text-primary" />,
  },
  {
    id: 4,
    title: "Pay Securely",
    description: "Pay online with our secure payment system",
    icon: <DollarSign className="w-10 h-10 text-primary" />,
  },
];

const Services = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { business } = useContext(AppContext);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="text-white bg-gradient-to-r from-purple-600 to-indigo-700">
        <div className="container px-4 py-16 mx-auto md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="mb-6 text-3xl font-bold md:text-5xl">
              Find the Perfect Service Provider
            </h1>
            <p className="mb-8 text-lg text-purple-100 md:text-xl">
              Book trusted professionals for all your home service needs
            </p>

            <div className="flex flex-col gap-2 p-4 bg-white rounded-lg shadow-lg md:flex-row">
              <Input
                type="text"
                placeholder="What service do you need?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow"
              />
              <div className="flex gap-2">
                <Input type="text" placeholder="Location" className="md:w-48" />
                <Button className="bg-primary hover:bg-primary/90">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="container px-4 py-16 mx-auto">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Browse Service Categories</h2>
          <p className="max-w-2xl mx-auto text-gray-600">
            Find the perfect service provider for all your needs from our wide
            range of categories
          </p>
        </div>

        <CategoryList />
      </div>

      {/* Featured Services */}
      <div className="py-16 bg-gray-100">
        <div className="container px-4 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Featured Services</h2>
            <p className="max-w-2xl mx-auto text-gray-600">
              Top-rated services from our trusted providers
            </p>
          </div>

          <BusinessList
            businessList={business}
            title={"Popular Business"}
            pagehref="Popular_Business"
          />
        </div>
      </div>

      {/* How It Works */}
      <div className="container px-4 py-16 mx-auto">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">How It Works</h2>
          <p className="max-w-2xl mx-auto text-gray-600">
            Book a service in just a few simple steps
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-4">
          {howItWorks.map((step) => (
            <div key={step.id} className="text-center">
              <div className="inline-flex p-6 mx-auto mb-4 bg-purple-100 rounded-full">
                {step.icon}
              </div>
              <h3 className="mb-2 text-xl font-bold">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 text-white bg-gradient-to-r from-purple-600 to-indigo-700">
        <div className="container px-4 mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
          <p className="max-w-2xl mx-auto mb-8 text-xl">
            Join thousands of satisfied customers who book services through our
            platform
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-gray-100"
            >
              Book a Service
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-black border-white bg-primary hover:bg-white/10"
            >
              Become a Provider
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
