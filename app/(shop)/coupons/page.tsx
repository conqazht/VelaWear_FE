import { Suspense } from "react";
import { CouponsClient } from "./coupons-client";

export default function CouponsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f4ef]" />}>
      <CouponsClient />
    </Suspense>
  );
}
