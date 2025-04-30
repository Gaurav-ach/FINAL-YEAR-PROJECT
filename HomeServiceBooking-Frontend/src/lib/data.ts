import mop from "../assets/mop.png";
import cargo from "../assets/cargo-truck.png";
import electricity from "../assets/electricity.png";
import brush from "../assets/paintbrush.png";
import repair from "../assets/repairing.png";
import support from "../assets/support.png";

export const BusinessCategories = [
  {
    id: 1,
    name: "Cleaning",
    icon: mop,
  },
  {
    id: 2,
    name: "Repair",
    icon: repair,
  },
  {
    id: 3,
    name: "Painting",
    icon: brush,
  },
  {
    id: 4,
    name: "Shifting",
    icon: cargo,
  },
  {
    id: 5,
    name: "Plumbing",
    icon: support,
  },
  {
    id: 6,
    name: "Electric",
    icon: electricity,
  },
];

// Team members data
export const teamMembers = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "CEO & Founder",
    image:
      "https://plus.unsplash.com/premium_photo-1672239496290-5061cfee7ebb?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    bio: "With over 15 years of experience in the service industry, Sarah founded the platform to connect quality service providers with customers.",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "CTO",
    image:
      "https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    bio: "Michael leads our technology team, ensuring a seamless and secure platform experience for all users.",
  },
  {
    id: 3,
    name: "Priya Patel",
    role: "Head of Operations",
    image:
      "https://images.unsplash.com/photo-1590649880765-91b1956b8276?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    bio: "Priya oversees day-to-day operations and ensures service quality standards are maintained across the platform.",
  },
  {
    id: 4,
    name: "David Wilson",
    role: "Marketing Director",
    image:
      "https://images.unsplash.com/photo-1508243771214-6e95d137426b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    bio: "David drives our marketing strategies to connect more customers with quality service providers.",
  },
];
