import { Suspense } from "react";
import OrderDetailsClient from "./order-details-client";

export function generateStaticParams() {
  return [{ code: "VW-9824-BKL" }];
}

export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return (
    <Suspense fallback={<div className="py-32 text-center select-none"><span className="text-xs uppercase tracking-widest text-ink/40">Loading...</span></div>}>
      <OrderDetailsClient code={code} />
    </Suspense>
  );
}
