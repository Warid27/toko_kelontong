import { useEffect, useState } from "react";
import socketInstance from "@/libs/websocket"; // Adjust path

const TypeList = () => {
  const [types, setTypes] = useState([]);

  useEffect(() => {
    console.log("🌐 Frontend origin:", window.location.origin);

    const handleMessage = (message) => {
      if (message.action === "listtype" && Array.isArray(message.data)) {
        console.log("✅ Updating list with:", message.data);
        setTypes(message.data);
      }
    };

    const { disconnect } = socketInstance.connect(handleMessage);

    return () => {
      console.log("🧹 Cleaning up WebSocket listener");
      disconnect();
    };
  }, []);

  console.log("🔄 Rendering with types:", types);

  return (
    <div>
      <h2>Auto-Fetch Type List</h2>
      <ul>
        <li>DATA RECEIVED:</li>
        {types.length === 0 ? (
          <li>Loading...</li>
        ) : (
          types.map((type, index) => (
            <li key={type._id}>
              {index + 1}. {type.type}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default TypeList;
