"use client";

import Link from "next/link";
import { useState } from "react";
import {
  User as UserIcon,
  CreditCard,
  Truck,
  Sliders,
  Mail,
  Eye,
  Link2,
  Shield,
  Calendar,
  ChevronDown,
  LockKeyhole,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useAuth } from "@/components/auth/auth-provider";
import { Card } from "@/components/ui/card";
import { useOtpFlow } from "@/components/auth/use-otp-flow";
import { OtpEntry } from "@/components/auth/otp-entry";
import { changeEmail } from "@/lib/auth-otp-api";
import { emailSchema } from "@/lib/validations";

const changeEmailSchema = z.object({ email: emailSchema });
type ChangeEmailFormValues = z.infer<typeof changeEmailSchema>;

export default function MemberSettings() {
  const { user, isAuthenticated, checkSession } = useAuth();
  const [requestedEmail, setRequestedEmail] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    resetField,
    formState: { errors },
  } = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(changeEmailSchema as any),
    defaultValues: { email: user?.email || "" },
  });

  const newEmail = watch("email");
  const otpEmail = requestedEmail ?? newEmail;

  const {
    showOtpStep,
    otpCode,
    setOtpCode,
    cooldown,
    isSubmitting: isOtpSubmitting,
    error: otpError,
    handleRequestOtp,
    handleVerifyOtp,
    resetFlow,
  } = useOtpFlow({
    email: otpEmail,
    purpose: "CHANGE_EMAIL",
    onVerifySuccess: async () => {
      // Step 2: Change email using verified marker
      await changeEmail({ newEmail: otpEmail });

      // Refresh session/profile
      await checkSession();

      setRequestedEmail(null);
      resetFlow();
      setSuccessMessage("Your email has been successfully updated.");
    },
  });

  const handleRequestChangeEmailOtp = async (data: ChangeEmailFormValues) => {
    setSuccessMessage(null);
    setRequestedEmail(data.email);
    const success = await handleRequestOtp();
    if (!success) {
      setRequestedEmail(null);
    }
  };

  // If user is loading or not authenticated, render login prompt
  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto w-full max-w-[1800px] px-6 py-24 min-h-[70vh] flex flex-col justify-center items-center">
        <Card className="mx-auto flex max-w-md flex-col items-center rounded-sm border-[#1c1a18]/5 bg-[#efe7dc] p-8 py-10 text-center shadow-lg">
          <LockKeyhole className="mb-6 size-12 text-[#b85a3c]" />
          <h2 className="mb-4 font-serif text-2xl font-light text-[#1c1a18]">
            Đăng nhập để xem cài đặt
          </h2>
          <p className="mb-8 text-xs leading-relaxed text-[#1c1a18]/65">
            Bạn cần đăng nhập tài khoản Vela Member để cấu hình thông tin cá nhân.
          </p>
          <Link
            href="/sign-in"
            className="inline-flex w-full justify-center rounded-sm bg-[#1c1a18] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#b85a3c]"
          >
            Đăng nhập ngay
          </Link>
        </Card>
      </div>
    );
  }

  const subTabs = [
    { id: "profile", label: "Profile", href: "/profile" },
    { id: "orders", label: "Orders", href: "/profile?tab=orders" },
    { id: "favourites", label: "Favourites", href: "/profile?tab=favourites" },
    { id: "settings", label: "Settings", href: "/profile/settings" },
  ];

  const sidebarLinks = [
    { id: "account", label: "Account Details", icon: UserIcon, active: true },
    { id: "payment", label: "Payment Methods", icon: CreditCard, active: false },
    { id: "addresses", label: "Delivery Addresses", icon: Truck, active: false },
    { id: "preferences", label: "Shop Preferences", icon: Sliders, active: false },
    { id: "communication", label: "Communication Preferences", icon: Mail, active: false },
    { id: "visibility", label: "Profile Visibility", icon: Eye, active: false },
    { id: "linked", label: "Linked Accounts", icon: Link2, active: false },
    { id: "privacy", label: "Privacy", icon: Shield, active: false },
  ];

  return (
    <div className="bg-canvas text-ink min-h-screen flex flex-col">
      {/* Sub-Navigation */}
      <div className="w-full border-b border-hairline/40 select-none">
        <div className="max-w-[1280px] mx-auto flex justify-center gap-8 py-4">
          {subTabs.map((tab) => {
            const isActive = tab.id === "settings";
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`text-sm font-medium tracking-[0.05em] transition-colors pb-1 ${
                  isActive
                    ? "text-primary border-b-2 border-primary -mb-[18px]"
                    : "text-[#55423d]/60 hover:text-ink"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow max-w-[1280px] w-full mx-auto px-6 md:px-16 py-16 flex flex-col md:flex-row gap-12">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0 text-left">
          <h1 className="font-serif text-3xl font-light text-ink mb-8">Settings</h1>
          <nav className="flex flex-col gap-2">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  className={`flex items-center gap-4 py-3 px-4 rounded-sm text-sm font-medium transition-colors text-left cursor-pointer ${
                    link.active
                      ? "bg-surface-card text-primary"
                      : "text-[#55423d]/70 hover:text-ink hover:bg-surface-card/40"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {link.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Content Area */}
        <section className="flex-grow max-w-3xl text-left">
          <h2 className="font-serif text-2xl md:text-3xl text-ink font-light mb-10">Account Details</h2>
          <div className="flex flex-col gap-8">
            {/* Email Field Form */}
            <form onSubmit={handleSubmit(handleRequestChangeEmailOtp)} className="flex flex-col gap-2">
              <div className="relative">
                <label className="absolute -top-2.5 left-3 bg-canvas px-1 text-[11px] font-medium tracking-widest text-[#55423d]/80 uppercase">
                  Email*
                </label>
                <input
                  className="w-full bg-transparent border border-hairline rounded-sm px-4 py-4 text-sm text-ink focus:outline-hidden focus:border-primary transition-all disabled:opacity-50"
                  type="email"
                  disabled={showOtpStep || isOtpSubmitting}
                  {...register("email")}
                />
              </div>

              {errors.email && !showOtpStep && (
                <p className="text-xs text-red-600 font-medium">{errors.email.message}</p>
              )}

              {otpError && !showOtpStep && (
                <p className="text-xs text-red-600 font-medium">{otpError}</p>
              )}

              {successMessage && (
                <p className="text-xs text-green-600 font-medium">{successMessage}</p>
              )}

              {newEmail !== user.email && !showOtpStep && (
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isOtpSubmitting}
                    className="px-6 py-2.5 bg-[#964025] hover:bg-[#87391f] text-white text-xs font-semibold rounded-sm tracking-wider uppercase disabled:opacity-50 cursor-pointer border-0"
                  >
                    Verify & Update Email
                  </button>
                </div>
              )}

              {showOtpStep && (
                <OtpEntry
                  inline
                  email={otpEmail}
                  otpCode={otpCode}
                  setOtpCode={setOtpCode}
                  cooldown={cooldown}
                  isSubmitting={isOtpSubmitting}
                  error={otpError}
                  onVerify={handleVerifyOtp}
                  onResend={handleRequestOtp}
                  onCancel={() => {
                    resetFlow();
                    resetField("email", { defaultValue: user.email });
                    setRequestedEmail(null);
                  }}
                  cancelLabel="Cancel"
                  actionLabel="Confirm Code"
                />
              )}
            </form>

            <form className="flex flex-col gap-8" onSubmit={(e) => e.preventDefault()}>
              {/* Password Section */}
              <div className="flex justify-between items-end border-b border-hairline/60 pb-4">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-ink">Password</span>
                  <span className="text-sm text-[#55423d]/60 tracking-[0.2em] mt-1">•••••••••••••</span>
                </div>
                <button
                  className="text-sm font-medium text-primary underline hover:text-[#964025] transition-colors"
                  type="button"
                >
                  Edit
                </button>
              </div>

              {/* Date of Birth Field */}
              <div className="relative">
                <label className="absolute -top-2.5 left-3 bg-canvas px-1 text-[11px] font-medium tracking-widest text-[#55423d]/40 uppercase select-none">
                  Date of Birth*
                </label>
                <div className="relative flex items-center">
                  <input
                    className="w-full bg-transparent border border-hairline/60 rounded-sm px-4 py-4 text-sm text-[#55423d]/60 opacity-60 focus:outline-hidden cursor-not-allowed"
                    disabled
                    type="text"
                    defaultValue={
                      user.birthDate
                        ? new Date(user.birthDate).toLocaleDateString("vi-VN")
                        : "07 / 09 / 2005"
                    }
                  />
                  <Calendar className="absolute right-4 text-[#55423d]/45 w-5 h-5 pointer-events-none" />
                </div>
              </div>

              {/* Location Dropdown */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-ink mb-4">Location</h3>
                <div className="relative">
                  <label className="absolute -top-2.5 left-3 bg-canvas px-1 text-[11px] font-medium tracking-widest text-[#55423d]/80 uppercase">
                    Country/Region*
                  </label>
                  <select className="w-full bg-transparent border border-hairline rounded-sm px-4 py-4 text-sm text-ink focus:outline-hidden focus:border-primary transition-all appearance-none cursor-pointer">
                    <option value="vn">Vietnam</option>
                    <option value="us">United States</option>
                    <option value="uk">United Kingdom</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#55423d] w-5 h-5" />
                </div>
              </div>

              {/* Delete Account */}
              <div className="mt-8 border-t border-b border-hairline/60 py-6 flex justify-between items-center">
                <span className="text-sm font-medium text-ink">Delete Account</span>
                <button
                  className="px-6 py-2 border border-hairline/80 rounded-full text-xs font-semibold text-ink hover:border-red-600 hover:text-red-600 transition-colors"
                  type="button"
                >
                  Delete
                </button>
              </div>

              {/* Save Action */}
              <div className="flex justify-end mt-8">
                <button
                  className="bg-surface-card text-[#55423d]/60 px-8 py-3 rounded-sm text-xs font-semibold cursor-not-allowed"
                  disabled
                  type="button"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
