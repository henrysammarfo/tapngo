import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";

const BackArrow = () => {
  const router = useRouter();

  return (
    <div className="">
      <ChevronLeftIcon width={24} height={24} color="black" onClick={() => router.back()} />
    </div>
  );
};

export default BackArrow;
