import { useState } from "react";
import { motion } from "framer-motion";
import { SubmitButton } from "@/components/form/button";
import { InputText } from "@/components/form/input";
import { FaLock, FaLightbulb } from "react-icons/fa";
import useUserStore from "@/stores/user-store";
import { toast } from "react-toastify";
import { updateUserData } from "@/libs/fetching/user";

export const ActivateAccount = ({ onSubmit }) => {
  const { userData } = useUserStore();
  const id_user = userData?.id;
  const [creditCard, setCreditCard] = useState({
    credit_card: "",
    security_code: "",
    expiration_date: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCreditCard((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const reqBody = { status: 0 };

      const response = await updateUserData(reqBody, id_user);

      if (response.status === 200) {
        toast.success("User Activated Successfully");
        useUserStore.getState().updateUserProfile({ status: 0 });
        onSubmit();
      }
    } catch (error) {
      toast.error("Failed to update user");
      console.error("ERROR BOLO", error);
    }
  };

  const benefits = [
    {
      title: "All themes",
      description: "Access to our complete library of premium themes",
    },
    {
      title: "1000+ Subscribers",
      description: "Grow your audience with expanded subscriber limits",
    },
    {
      title: "Robust Analytics",
      description: "Gain deep insights with advanced reporting tools",
    },
    {
      title: "Marketing Tools",
      description: "Powerful tools to reach and engage your audience",
    },
    {
      title: "Advanced Integrations",
      description: "Connect with all your favorite services seamlessly",
    },
    {
      title: "Custom Filters",
      description: "Create personalized filters for better data management",
    },
    {
      title: "Theme Customization",
      description: "Unlimited customization options for your brand",
    },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto p-6 bg-gray-900 text-gray-100 rounded-xl shadow-xl">
      {/* Left Side */}
      <div className="md:w-1/2">
        <motion.h1
          className="text-3xl font-bold mb-4 text-emerald-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Why You Should Activate Your Company and Account
        </motion.h1>

        <p className="text-lg mb-6 text-gray-300">
          By upgrading, you'll get all features from Demo, plus:
        </p>

        <ul className="space-y-6">
          {benefits.map((benefit, index) => (
            <motion.li
              key={index}
              className="flex items-start gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <span className="p-2 bg-emerald-500 rounded-full text-white mt-1">
                <FaLightbulb />
              </span>
              <span>
                <h3 className="text-xl font-semibold text-emerald-300">
                  {benefit.title}
                </h3>
                <p className="text-gray-400">{benefit.description}</p>
              </span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Right Side */}
      <div className="md:w-1/2 bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          Activate now
        </h2>

        <div className="bg-gray-700/50 p-4 rounded-lg mb-6">
          <span className="text-emerald-400 font-medium">Lifetime Plans</span>
          <h3 className="text-3xl font-bold text-white mt-2">$100</h3>
          <p className="text-gray-300 mt-2">
            One-time payment — lifetime access. No renewals, no hidden fees.
          </p>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-xl font-semibold mb-4 text-white">
            Billing Information
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-4 relative">
              <InputText
                id="credit_card"
                label="Credit Card Number"
                name="credit_card"
                value={creditCard.credit_card}
                text_color="text-white"
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                className="pl-10 bg-gray-800/70 border-gray-700 hover:border-emerald-500 focus:border-green-500 transition-all rounded-lg w-full"
              />
              <div className="absolute left-3 top-9 text-gray-500">
                <FaLock />
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <div className="w-1/2 relative">
                <InputText
                  id="security_code"
                  label="Security Code"
                  name="security_code"
                  value={creditCard.security_code}
                  text_color="text-white"
                  onChange={handleInputChange}
                  placeholder="123"
                  className="pl-10 bg-gray-800/70 border-gray-700 hover:border-emerald-500 focus:border-green-500 transition-all rounded-lg w-full"
                />
                <div className="absolute left-3 top-9 text-gray-500">
                  <FaLock />
                </div>
              </div>

              <div className="w-1/2">
                <InputText
                  id="expiration_date"
                  label="Expiration Date"
                  name="expiration_date"
                  value={creditCard.expiration_date}
                  text_color="text-white"
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  className="pl-3 bg-gray-800/70 border-gray-700 hover:border-emerald-500 focus:border-green-500 transition-all rounded-lg w-full"
                />
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <SubmitButton
                content="Activate Now"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-all"
              />
            </motion.div>
          </form>

          <p className="flex items-center justify-center gap-2 mt-4 text-gray-400 text-sm">
            <FaLock className="text-emerald-500" /> Card Information is Stored
            on a Secure Server
          </p>
        </div>
      </div>
    </div>
  );
};
