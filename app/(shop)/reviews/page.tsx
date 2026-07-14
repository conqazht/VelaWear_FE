import { Suspense } from "react";
import { ReviewsClient } from "./reviews-client";

export default function ReviewsPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#f7f4ef]" />}>
      <ReviewsClient />
    </Suspense>
  );
}
