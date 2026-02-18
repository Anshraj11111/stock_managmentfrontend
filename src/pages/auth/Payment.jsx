// import { useEffect } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import axios from "../../services/axiosInstance";
// import toast from "react-hot-toast";

// const Payment = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const plan = searchParams.get("plan");

//   useEffect(() => {
//     initiatePayment();
//   }, []);

//   const initiatePayment = async () => {
//     try {
//       const { data } = await axios.post("/payment/create-order", { plan });

//       const options = {
//         key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//         amount: data.amount,
//         currency: "INR",
//         name: "StockSaaS",
//         description: "Subscription Payment",
//         order_id: data.id,
//         handler: async function (response) {

//           await axios.post("/payment/verify", {
//             ...response,
//             plan,
//           });

//           toast.success("Payment Successful 🎉");
//           navigate("/dashboard");
//         },
//         theme: {
//           color: "#6366F1",
//         },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();

//     } catch (error) {
//       toast.error("Payment failed");
//     }
//   };

//   return <div className="text-center mt-20">Processing payment...</div>;
// };

// export default Payment;
