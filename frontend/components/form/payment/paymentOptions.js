import { motion } from "framer-motion";

const PaymentOption = ({ payment, selectedMethod, setSelectedMethod }) => {
  return (
    <label
      className="flex items-center cursor-pointer w-full p-2 gap-3 rounded-md hover:bg-orange-50 peer-checked:bg-orange-50"
      onClick={() => setSelectedMethod(payment)}
    >
      {/* Animated Radio Button */}
      <motion.div
        className="relative w-6 h-6 flex items-center justify-center"
        whileTap={{ scale: 0.9 }}
      >
        <div className="absolute w-5 h-5 bg-white rounded-full border-2 border-gray-400"></div>
        <motion.input
          type="radio"
          name="paymentMethod"
          value={payment._id}
          checked={selectedMethod?._id === payment._id}
          onChange={() => setSelectedMethod(payment)}
          className="peer relative w-5 h-5 rounded-full border-2 border-gray-400 appearance-none checked:border-orange-500 transition-all duration-200"
          aria-label={payment.payment_name}
        />
        <motion.div
          className="absolute w-3 h-3 bg-[var(--bg-primary)] rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: selectedMethod?._id === payment._id ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>

      {/* Payment Name & Image */}
      <div className="flex items-center justify-center gap-5">
        <img
          src={payment.image}
          alt={`${payment.payment_name} logo`}
          className="object-contain w-8 h-8"
        />
        <span>{payment.payment_name}</span>
      </div>
    </label>
  );
};

export default PaymentOption;
