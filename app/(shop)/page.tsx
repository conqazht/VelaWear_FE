import { HomePage } from "@/components/shop/home-page";
import { cacheLife } from "next/cache";

export default async function Home() {
  "use cache";
  cacheLife("max");

  return <HomePage />;
}
