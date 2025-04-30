import { useContext, useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Calendar } from "./ui/calendar";
import { Button } from "./ui/button";
import { AppContext } from "../context/AppContext";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Map } from "./Map";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = STRIPE_PUBLISHABLE_KEY
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null;

interface BookingSectionProps {
  children: React.ReactNode;
  businessId: string;
}

interface TimeSlot {
  time: string;
  isBooked: boolean;
}

const BookingSection = ({ children, businessId }: BookingSectionProps) => {
  const { backendUrl, userToken, isLoading, setIsLoading, business, userData } =
    useContext(AppContext);

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeSlot, setTimeSlot] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [paymentId, setPaymentId] = useState<string>("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [location, setLocation] = useState({
    latitude: 0,
    longitude: 0,
    locationName: "",
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "stripe" | "khalti"
  >("stripe");

  const currentBusiness = business.find((b) => b.id === businessId);
  const amountInDollars = currentBusiness
    ? currentBusiness?.amount?.toFixed(2)
    : "0.00";

  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleLocationSelect = (lat: number, lng: number, name: string) => {
    setLocation({
      latitude: lat,
      longitude: lng,
      locationName: name,
    });
  };

  useEffect(() => {
    if (
      !stripePromise &&
      showPaymentForm &&
      selectedPaymentMethod === "stripe"
    ) {
      setStripeError(
        "Stripe could not be initialized. Please check your configuration."
      );
    } else {
      setStripeError(null);
    }
  }, [showPaymentForm, selectedPaymentMethod]);

  useEffect(() => {
    if (date && businessId) {
      fetchBookedTimeSlots();
    } else {
      setBookedSlots([]);
    }
  }, [date, businessId]);

  useEffect(() => {
    getTime();
  }, [bookedSlots]);

  useEffect(() => {
    if (!isOpen) {
      setShowPaymentForm(false);
      setBookingComplete(false);
      setClientSecret("");
      setPaymentId("");
      setStripeError(null);
    }
  }, [isOpen]);

  const fetchBookedTimeSlots = async () => {
    if (!date) return;

    try {
      setIsLoading(true);
      const formattedDate = formatLocalDate(date);
      const { data } = await axios.get(
        `${backendUrl}/api/booking/booked-slots?businessId=${businessId}&date=${formattedDate}`,
        { headers: { Authorization: userToken } }
      );

      if (data.success) {
        setBookedSlots(data.bookedSlots || []);
      } else {
        setBookedSlots([]);
      }
    } catch (error) {
      console.error("Error fetching booked slots:", error);
      setBookedSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getTime = () => {
    const timeList: TimeSlot[] = [];
    for (let i = 10; i <= 12; i++) {
      timeList.push({
        time: i + ":00 AM",
        isBooked: bookedSlots.includes(i + ":00 AM"),
      });
      timeList.push({
        time: i + ":30 AM",
        isBooked: bookedSlots.includes(i + ":30 AM"),
      });
    }
    for (let i = 1; i <= 6; i++) {
      timeList.push({
        time: i + ":00 PM",
        isBooked: bookedSlots.includes(i + ":00 PM"),
      });
      timeList.push({
        time: i + ":30 PM",
        isBooked: bookedSlots.includes(i + ":30 PM"),
      });
    }
    setTimeSlot(timeList);
  };

  const initiatePayment = async () => {
    if (!date || !selectedTime || !businessId || !currentBusiness) {
      toast.error("Please select date and time");
      return;
    }

    setIsLoading(true);

    try {
      if (selectedPaymentMethod === "stripe") {
        if (!stripePromise) {
          toast.error(
            "Stripe is not properly configured. Please contact support."
          );
          return;
        }

        const { data } = await axios.post(
          `${backendUrl}/api/payment/stripe/create-payment`,
          {
            amount: Number.parseFloat(amountInDollars),
            businessName: currentBusiness.name,
          },
          {
            headers: {
              Authorization: userToken,
              "Content-Type": "application/json",
            },
          }
        );

        if (data.success) {
          setPaymentId(data.paymentId);
          setClientSecret(data.clientSecret);
          setShowPaymentForm(true);
        } else {
          toast.error(data.message || "Failed to initiate payment");
        }
      } else {
        const payload = {
          return_url: import.meta.env.VITE_FRONEND_URL,
          website_url: import.meta.env.VITE_FRONEND_URL,
          amount: Number.parseFloat(amountInDollars),
          purchase_order_id: Date.now().toString(),
          purchase_order_name: business || "Service Booking",
          customer_info: {
            name: userData?.firstName,
            email: userData?.email,
          },
        };
        // Khalti payment initiation
        const { data } = await axios.post(
          `${backendUrl}/api/payment/khalti/create-payment`,
          {
            payload,
          },
          { headers: { Authorization: userToken } }
        );

        if (data.success) {
          // Store payment details in localStorage for verification after redirect
          localStorage.setItem(
            "pendingPayment",
            JSON.stringify({
              paymentId: data.paymentId,
              businessId,
              date: formatLocalDate(date),
              time: selectedTime,
              latitude: location.latitude,
              longitude: location.longitude,
              locationName: location.locationName,
            })
          );

          // Redirect to Khalti payment page
          window.location.href = data.paymentUrl;
        } else {
          toast.error(data.message || "Failed to initiate Khalti payment");
        }
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      if (error instanceof AxiosError && error.response) {
        toast.error(
          error.response.data.message || "Failed to initiate payment"
        );
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Khalti payment verification after redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pidx = params.get("pidx");
    const status = params.get("status");

    if (pidx && status) {
      const pendingPayment = localStorage.getItem("pendingPayment");

      if (pendingPayment) {
        const paymentDetails = JSON.parse(pendingPayment);

        const verifyPayment = async () => {
          try {
            const { data } = await axios.post(
              `${backendUrl}/api/payment/khalti/verify-payment`,
              {
                pidx,
                paymentId: paymentDetails.paymentId,
              }
            );

            if (data.success && data.khaltiStatus === "Completed") {
              const bookingResponse = await axios.post(
                `${backendUrl}/api/booking/create`,
                {
                  ...paymentDetails,
                  paymentId: paymentDetails.paymentId,
                },
                {
                  headers: {
                    Authorization: userToken,
                  },
                }
              );

              if (bookingResponse.data.success) {
                toast.success("Payment successful and booking created!");
                handleBookingSuccess();
              }
            } else {
              toast.error("Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Failed to verify payment");
          } finally {
            localStorage.removeItem("pendingPayment");
          }
        };

        verifyPayment();
      }
    }
  }, []);

  const handleBookingSuccess = () => {
    setBookingComplete(true);
    fetchBookedTimeSlots();
  };

  const createBookingWithoutPayment = async () => {
    if (
      !date ||
      !selectedTime ||
      !businessId ||
      !currentBusiness ||
      !userToken
    ) {
      toast.error("Please select date and time");
      return;
    }

    setIsLoading(true);

    try {
      const bookingResponse = await axios.post(
        `${backendUrl}/api/booking/create`,
        {
          businessId,
          date: formatLocalDate(date),
          time: selectedTime,
          latitude: location.latitude,
          longitude: location.longitude,
          locationName: location.locationName,
        },
        { headers: { Authorization: userToken } }
      );

      if (bookingResponse.data.success) {
        toast.success("Booking created successfully!");
        handleBookingSuccess();
      } else {
        toast.error(bookingResponse.data.message || "Failed to create booking");
      }
    } catch (error) {
      console.error("Booking error:", error);
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message || "Failed to create booking");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger onClick={() => setIsOpen(true)}>{children}</SheetTrigger>
        <SheetContent className="overflow-auto">
          <SheetHeader>
            <SheetTitle>Book a Service</SheetTitle>
            <SheetDescription>
              Select Date and Time Slot to book a service
            </SheetDescription>
          </SheetHeader>

          {bookingComplete ? (
            <div className="flex flex-col items-center justify-center mt-10 text-center">
              <div className="flex items-center justify-center w-16 h-16 mb-4 bg-green-100 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-2xl font-bold">Booking Confirmed!</h2>
              <p className="mb-6 text-gray-600">
                Your booking has been successfully confirmed for{" "}
                {date?.toLocaleDateString()} at {selectedTime}.
              </p>
              <Button onClick={() => setIsOpen(false)}>Close</Button>
            </div>
          ) : !showPaymentForm ? (
            <div>
              <div className="flex flex-col items-baseline gap-s5">
                <h2 className="mt-5 font-bold text-gray-600">Select Date</h2>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate);
                    setSelectedTime(undefined);
                  }}
                  className="border rounded-md"
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                />
              </div>

              <div>
                <h2 className="my-5 font-bold text-gray-600">
                  Select Time Slot
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {timeSlot.map((item, index) => (
                    <Button
                      className={`p-2 px-3 border rounded-full 
                        ${
                          item.isBooked
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "hover:bg-primary hover:text-white"
                        } 
                        ${
                          selectedTime === item.time && !item.isBooked
                            ? "bg-primary text-white"
                            : ""
                        }`}
                      key={index}
                      variant={"outline"}
                      onClick={() =>
                        !item.isBooked && setSelectedTime(item.time)
                      }
                      disabled={item.isBooked}
                    >
                      {item.time}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <h2 className="font-bold text-gray-600">Your Location</h2>
                <div className="mt-2 overflow-hidden border rounded-lg">
                  <Map
                    latitude={location.latitude}
                    longitude={location.longitude}
                    locationName={location.locationName}
                    onLocationSelect={handleLocationSelect}
                  />
                </div>
              </div>

              <div className="mt-5">
                <h2 className="font-bold text-gray-600">Payment Details</h2>
                <div className="p-4 mt-2 border rounded-md">
                  <p className="text-sm text-gray-600">
                    Service Fee: ${amountInDollars}
                  </p>
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-700">
                      Select Payment Method
                    </label>
                    <Select
                      value={selectedPaymentMethod}
                      onValueChange={(value: "stripe" | "khalti") =>
                        setSelectedPaymentMethod(value)
                      }
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stripe">Stripe</SelectItem>
                        <SelectItem value="khalti">Khalti</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <SheetFooter className="mt-5">
                <div className="flex w-full gap-5">
                  <Button
                    variant="destructive"
                    onClick={() => setIsOpen(false)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  {stripePromise || selectedPaymentMethod === "khalti" ? (
                    <Button
                      disabled={
                        !(selectedTime && date && location.latitude) ||
                        isLoading ||
                        !currentBusiness
                      }
                      onClick={initiatePayment}
                      className="flex-1"
                    >
                      {isLoading
                        ? "Processing..."
                        : `Pay with ${
                            selectedPaymentMethod === "stripe"
                              ? "Stripe"
                              : "Khalti"
                          }`}
                    </Button>
                  ) : (
                    <Button
                      disabled={
                        !(selectedTime && date && location.latitude) ||
                        isLoading ||
                        !currentBusiness
                      }
                      onClick={createBookingWithoutPayment}
                      className="flex-1"
                    >
                      {isLoading ? "Processing..." : "Book Now (Test)"}
                    </Button>
                  )}
                </div>
              </SheetFooter>
            </div>
          ) : (
            <div className="mt-5">
              <h2 className="mb-4 font-bold text-gray-600">Complete Payment</h2>
              {stripeError ? (
                <div className="p-4 mb-4 border border-red-200 rounded-md bg-red-50">
                  <p className="text-red-600">{stripeError}</p>
                  <Button
                    variant="outline"
                    onClick={() => setShowPaymentForm(false)}
                    className="w-full mt-4"
                  >
                    Back to Booking Details
                  </Button>
                </div>
              ) : clientSecret && stripePromise ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm
                    paymentId={paymentId}
                    bookingDetails={{
                      businessId,
                      date: formatLocalDate(date!),
                      time: selectedTime || "",
                      latitude: location.latitude,
                      longitude: location.longitude,
                      locationName: location.locationName,
                    }}
                    onSuccess={handleBookingSuccess}
                    backendUrl={backendUrl}
                    userToken={userToken}
                  />
                </Elements>
              ) : (
                <div className="p-4 border border-yellow-200 rounded-md bg-yellow-50">
                  <p className="text-yellow-600">Loading payment form...</p>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => setShowPaymentForm(false)}
                className="w-full mt-4"
              >
                Back to Booking Details
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

interface CheckoutFormProps {
  paymentId: string;
  bookingDetails: {
    businessId: string;
    date: string;
    time: string;
    latitude: number;
    longitude: number;
    locationName: string;
  };
  onSuccess: () => void;
  backendUrl: string;
  userToken: string | null;
}

const CheckoutForm = ({
  paymentId,
  bookingDetails,
  onSuccess,
  backendUrl,
  userToken,
}: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !userToken) {
      return;
    }

    setIsProcessing(true);

    try {
      const result = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: { return_url: window.location.origin },
      });

      if (result.error) {
        toast.error(result.error.message || "Payment failed");
      } else if (result.paymentIntent) {
        const verifyResponse = await axios.post(
          `${backendUrl}/api/payment/stripe/verify-payment`,
          { paymentIntentId: result.paymentIntent.id, paymentId }
        );

        if (verifyResponse.data.success) {
          const { data } = await axios.post(
            `${backendUrl}/api/booking/create`,
            { ...bookingDetails, paymentId },
            { headers: { Authorization: userToken } }
          );

          if (data.success) {
            toast.success(data.message);
            onSuccess();
          } else {
            toast.error(data.message);
          }
        } else {
          toast.error("Payment verification failed");
        }
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      toast.error("An error occurred while processing your payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full mt-4"
      >
        {isProcessing ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  );
};

export default BookingSection;
