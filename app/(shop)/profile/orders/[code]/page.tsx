import { Suspense } from "react";
import OrderDetailsClient, { OrderDetailsLoadingFallback } from "./order-details-client";

export function generateStaticParams() {
  return [{ code: "VW-9824-BKL" }];
}

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-[1280px] px-6 py-16 md:px-16">
          <OrderDetailsLoadingFallback />
        </div>
      }
    >
      <OrderDetailsClient code={code} />
    </Suspense>
  );
}
