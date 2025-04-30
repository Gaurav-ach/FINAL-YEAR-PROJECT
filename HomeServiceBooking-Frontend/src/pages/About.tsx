import { Star, Shield, CheckCircle, MessageCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { teamMembers } from "../lib/data";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

// Benefits data
const benefits = [
  {
    id: 1,
    title: "Verified Professionals",
    description:
      "All service providers undergo thorough background checks and verification",
    icon: <Shield className="w-10 h-10 text-primary" />,
  },
  {
    id: 2,
    title: "Quality Guarantee",
    description:
      "We stand behind the quality of every service booked through our platform",
    icon: <CheckCircle className="w-10 h-10 text-primary" />,
  },
  {
    id: 3,
    title: "Secure Payments",
    description:
      "Your payment information is protected with industry-leading encryption",
    icon: <Star className="w-10 h-10 text-primary" />,
  },
  {
    id: 4,
    title: "Direct Communication",
    description:
      "Chat directly with service providers to discuss your specific needs",
    icon: <MessageCircle className="w-10 h-10 text-primary" />,
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="text-white bg-gradient-to-r from-purple-600 to-indigo-700">
        <div className="container px-4 py-16 mx-auto md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="mb-6 text-3xl font-bold md:text-5xl">
              About Our Platform
            </h1>
            <p className="mb-8 text-lg text-purple-100 md:text-xl">
              Connecting quality service providers with customers since 2018
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container px-4 py-16 mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Our Mission</h2>
            <div className="w-20 h-1 mx-auto mb-6 bg-primary"></div>
          </div>

          <div className="p-8 mb-12 bg-white rounded-lg shadow-md">
            <p className="mb-6 text-lg leading-relaxed text-gray-700">
              Our mission is to revolutionize how people find and book home
              services by creating a platform that connects skilled
              professionals with customers seeking quality service. We believe
              everyone deserves access to reliable, vetted service providers at
              transparent prices.
            </p>
            <p className="text-lg leading-relaxed text-gray-700">
              We're committed to empowering service professionals to grow their
              businesses while helping customers save time and reduce stress
              when booking essential services. Through our platform, we aim to
              create a community built on trust, quality, and exceptional
              customer experiences.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-gray-100">
        <div className="container px-4 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Meet Our Team</h2>
            <div className="w-20 h-1 mx-auto mb-6 bg-primary"></div>
            <p className="max-w-2xl mx-auto text-gray-600">
              The passionate people behind our platform
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="overflow-hidden transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg"
              >
                <img
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  className="object-cover w-full h-64"
                />
                <div className="p-6">
                  <h3 className="mb-1 text-xl font-bold">{member.name}</h3>
                  <p className="mb-3 font-medium text-primary">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container px-4 py-16 mx-auto">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Why Choose Us</h2>
          <div className="w-20 h-1 mx-auto mb-6 bg-primary"></div>
          <p className="max-w-2xl mx-auto text-gray-600">
            We're committed to providing the best experience for both customers
            and service providers
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              className="p-6 text-center transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg"
            >
              <div className="inline-flex items-center justify-center mb-4">
                {benefit.icon}
              </div>
              <h3 className="mb-2 text-xl font-bold">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 text-white bg-gradient-to-r from-purple-600 to-indigo-700">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            <div>
              <div className="mb-2 text-4xl font-bold">10,000+</div>
              <p className="text-purple-200">Service Providers</p>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">50,000+</div>
              <p className="text-purple-200">Happy Customers</p>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">100,000+</div>
              <p className="text-purple-200">Completed Jobs</p>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">4.8/5</div>
              <p className="text-purple-200">Average Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Join Us Section */}
      <div className="container px-4 py-16 mx-auto text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="mb-4 text-3xl font-bold">Join Our Community</h2>
          <p className="mb-8 text-lg text-gray-600">
            Whether you're looking for services or want to offer your
            professional skills, we welcome you to join our growing community
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to={"/Services"}>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Find a Service
              </Button>
            </Link>

            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
            >
              Become a Provider
            </Button>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-gray-100">
        <div className="container px-4 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">What People Say</h2>
            <div className="w-20 h-1 mx-auto mb-6 bg-primary"></div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="mb-4 text-gray-600">
                "I found an amazing plumber through this platform. The booking
                process was simple, and the service was excellent. Highly
                recommend!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 mr-3 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="font-medium">Jennifer L.</p>
                  <p className="text-sm text-gray-500">Customer</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="mb-4 text-gray-600">
                "As a professional electrician, this platform has helped me grow
                my business significantly. The direct messaging feature makes it
                easy to understand client needs."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 mr-3 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="font-medium">Robert T.</p>
                  <p className="text-sm text-gray-500">Service Provider</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="mb-4 text-gray-600">
                "The secure payment system gives me peace of mind. I've used
                this platform for multiple home services and have always been
                satisfied with the results."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 mr-3 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="font-medium">Maria G.</p>
                  <p className="text-sm text-gray-500">Customer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
