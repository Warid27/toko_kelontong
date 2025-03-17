import { IoIosArrowDropdown } from "react-icons/io";
import { motion } from "framer-motion";
import PaymentOption from "./paymentOptions";

const PaymentGroup = ({
  groupName,
  payments,
  expanded,
  togglePayments,
  selectedMethod,
  setSelectedMethod,
}) => {
  return (
    <div>
      {/* Payment Group Header */}
      <div
        className="flex items-center justify-between cursor-pointer p-2 bg-gray-100 rounded-md hover:bg-gray-200"
        onClick={togglePayments}
      >
        <span className="font-semibold">{groupName}</span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <IoIosArrowDropdown />
        </motion.span>
      </div>

      {/* Payment Options Dropdown */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="pl-4 mt-2 space-y-2">
          {payments.map((payment) => (
            <PaymentOption
              key={payment._id}
              payment={payment}
              selectedMethod={selectedMethod}
              setSelectedMethod={setSelectedMethod}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentGroup;
