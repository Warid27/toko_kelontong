import { useState } from "react";
import { IoIosArrowDropdown } from "react-icons/io";
import PaymentGroup from "./paymentGroup";

const PaymentMethod = ({
  groupedPayments,
  selectedMethod,
  setSelectedMethod,
}) => {
  const [expandedPayments, setExpandedPayments] = useState({});

  const togglePayments = (payment) => {
    setExpandedPayments((prev) => ({
      ...prev,
      [payment]: !prev[payment],
    }));
  };

  return (
    <div className="border rounded-lg mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <div className="bg-[var(--bg-primary)] text-white p-3 rounded-t-lg font-bold">
        Payment Method
      </div>
      <div className="p-2 space-y-1">
        {Object.keys(groupedPayments).map((payments) => (
          <PaymentGroup
            key={payments}
            groupName={payments}
            payments={groupedPayments[payments]}
            expanded={expandedPayments[payments]}
            togglePayments={() => togglePayments(payments)}
            selectedMethod={selectedMethod}
            setSelectedMethod={setSelectedMethod}
          />
        ))}
      </div>
    </div>
  );
};

export default PaymentMethod;
