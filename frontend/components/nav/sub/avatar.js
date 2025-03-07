import React, { useEffect, useState } from "react";
import Image from "next/image";

import { getAvatar } from "@/libs/fetching/user";
  
const Avatar = () => {
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    const getAvatarFunction = async () => {
      const avatar = await getAvatar();
      setAvatar(avatar);
    };
    getAvatarFunction();
  }, []);

  return (
    <div
      className={`relative upload-content flex overflow-hidden w-12 h-12 rounded-full border-2 border-white`}
    >
      {/* Avatar Image */}
      {avatar ? (
        <Image
          src={avatar}
          alt="Uploaded"
          className="uploaded-image object-cover"
          width={80}
          height={80}
        />
      ) : (
        <Image
          src="/User-avatar.png"
          alt="avatar"
          width={80} // Fix size to match the container
          height={80}
          className="object-cover"
        />
      )}
    </div>
  );
};

export default Avatar;
