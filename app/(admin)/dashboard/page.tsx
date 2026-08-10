import { redirect } from "next/navigation";
import { ADMIN_HOME_PATH } from "@/lib/auth/roles";

export default function Page() {
  redirect(ADMIN_HOME_PATH);
}
