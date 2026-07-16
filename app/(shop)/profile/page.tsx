"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LockKeyhole, User, MapPin, X, Check, Heart, Eye, Mail, Shield, PencilLine, CalendarDays } from "lucide-react";

import { ProductCard } from "@/components/shop/product-card";
import { StorefrontApiStatus } from "@/components/errors/storefront-api-status";
import { useFavorites } from "@/components/shop/favorites-provider";
import { useCart } from "@/components/shop/cart-provider";
import { useNotification } from "@/components/shop/notification-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { money } from "@/lib/vela-data";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { formatDate } from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n";
import { createEmailSchema, createStrongPasswordSchema } from "@/lib/validations";
import {
  useOrdersByUserQuery,
  useUpdateProfileMutation,
  useUserAddressesQuery,
} from "@/lib/queries/commerce";
import type { Gender, UserAddress } from "@/lib/api/types";

const profileTabIds = ["profile", "orders", "favourites", "coupons", "reviews"] as const;
type ProfileTabId = (typeof profileTabIds)[number];

const getProfileTabId = (tab: string | null): ProfileTabId =>
  profileTabIds.includes(tab as ProfileTabId) ? (tab as ProfileTabId) : "profile";

const formatDisplayDate = (value: string | null | undefined, locale: Locale) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return formatDate(date, locale);
};

const formatMemberSince = (value: string | null | undefined, locale: Locale) => {
  if (!value) return formatDate("2026-06-01", locale, { month: "long", year: "numeric" });
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatDate("2026-06-01", locale, { month: "long", year: "numeric" });
  return formatDate(date, locale, { month: "long", year: "numeric" });
};

const formatAddress = (address: UserAddress) =>
  [
    address.addressDetail,
    address.ward,
    address.province,
  ]
    .filter(Boolean)
    .join(", ");

const orderStatusMeta: Record<string, { badge: string; dot: string }> = {
  PENDING: {
    badge: "bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
  },
  CONFIRMED: {
    badge: "bg-sky-100 text-sky-800",
    dot: "bg-sky-500",
  },
  SHIPPING: {
    badge: "bg-indigo-100 text-indigo-800",
    dot: "bg-indigo-500",
  },
  COMPLETED: {
    badge: "bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-500",
  },
  CANCELLED: {
    badge: "bg-rose-100 text-rose-800",
    dot: "bg-rose-500",
  },
  REFUNDED: {
    badge: "bg-violet-100 text-violet-800",
    dot: "bg-violet-500",
  },
};

const orderStatusLabelKeys = {
  PENDING: "account.orders.status.pending",
  CONFIRMED: "account.orders.status.confirmed",
  SHIPPING: "account.orders.status.shipping",
  COMPLETED: "account.orders.status.completed",
  CANCELLED: "account.orders.status.cancelled",
  REFUNDED: "account.orders.status.refunded",
} as const;

const orderStatusOrder = [
  "PENDING",
  "CONFIRMED",
  "SHIPPING",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
] as const;

export default function MemberProfile() {
  const { user, isAuthenticated, isLoading: isAuthLoading, checkSession } = useAuth();
  const { locale, t } = useI18n();
  const {
    favorites,
    toggleFavorite,
    isLoading: favoritesLoading,
    error: favoritesError,
    retry: retryFavorites,
  } = useFavorites();
  const { addToCart } = useCart();
  const { showAddedToBag } = useNotification();
  const updateProfileMutation = useUpdateProfileMutation();
  const userId = user?.id;
  const ordersQuery = useOrdersByUserQuery(userId, {
    size: 100,
    sort: "createdAt,desc",
  });
  const addressesQuery = useUserAddressesQuery({ userId, size: 100 });
  const orders = ordersQuery.data?.result ?? [];
  const orderStats = orderStatusOrder.map((status) => ({
    status,
    ...orderStatusMeta[status],
    label: t(orderStatusLabelKeys[status]),
    count: orders.filter((order) => order.status === status).length,
  }));
  const addresses = addressesQuery.data?.result ?? [];

  const searchParams = useSearchParams();
  const activeSubTab = getProfileTabId(searchParams.get("tab"));
  const [activeProfileSidebarTab, setActiveProfileSidebarTab] = useState("account");

  const [isEditPasswordOpen, setIsEditPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordTouched, setPasswordTouched] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordModified, setPasswordModified] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [editFormDraft, setEditForm] = useState({
    fullName: "",
    email: "",
    gender: "",
    dob: ""
  });
  const [formTouched, setFormTouched] = useState({ fullName: false, email: false, gender: false, dob: false });
  const [formModified, setFormModified] = useState({ fullName: false, email: false, gender: false, dob: false });
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isDobOpen, setIsDobOpen] = useState(false);
  const [profileSaveMessage, setProfileSaveMessage] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);

  const editForm = {
    fullName: formModified.fullName ? editFormDraft.fullName : user?.fullName ?? "",
    email: user?.email ?? "",
    gender: formModified.gender ? editFormDraft.gender : user?.gender ?? "",
    dob: formModified.dob ? editFormDraft.dob : user?.birthDate ?? "",
  };
  const genderOptions: { value: Gender; label: string }[] = [
    { value: "MALE", label: t("account.profile.gender.male") },
    { value: "FEMALE", label: t("account.profile.gender.female") },
    { value: "OTHER", label: t("account.profile.gender.other") },
  ];
  const emailValidation = createEmailSchema(locale).safeParse(editForm.email);
  const passwordValidation = createStrongPasswordSchema(locale).safeParse(passwordForm.newPassword);
  const isStrongPassword = passwordValidation.success;
  const passwordValidationMessage = passwordValidation.success
    ? null
    : passwordValidation.error.issues[0]?.message;

  const isFormDirty = user ? (
    editForm.fullName.trim() !== (user.fullName || "") ||
    editForm.gender !== (user.gender || "") ||
    editForm.dob !== (user.birthDate || "")
  ) : false;
  const isProfileFormValid =
    editForm.fullName.trim() !== "" &&
    editForm.gender !== "" &&
    editForm.dob.trim() !== "";

  const getApiErrorMessage = (error: unknown) => {
    const apiError = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };

    return apiError.response?.data?.message ?? apiError.message ?? t("account.profile.saveError");
  };

  const handleSaveProfile = async () => {
    setProfileSaveMessage(false);
    setProfileSaveError(null);

    if (!user || !isProfileFormValid) {
      setFormTouched({ fullName: true, email: false, gender: true, dob: true });
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        id: user.id,
        request: {
          fullName: editForm.fullName.trim(),
          birthDate: editForm.dob,
          avatar: user.avatar,
          gender: editForm.gender as Gender,
        },
      });
      await checkSession();
      setEditForm({ fullName: "", email: "", gender: "", dob: "" });
      setFormTouched({ fullName: false, email: false, gender: false, dob: false });
      setFormModified({ fullName: false, email: false, gender: false, dob: false });
      setProfileSaveMessage(true);
    } catch (error) {
      setProfileSaveError(getApiErrorMessage(error));
    }
  };

  // Mock settings state
  const [reviewVisibility, setReviewVisibility] = useState("social");
  const [locationSharing, setLocationSharing] = useState("dont_share");
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    personalisedAds: true,
    profileAds: true,
    workoutData: true
  });



  if (isAuthLoading) {
    return <ProfileTabLoading tab={activeSubTab} />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto w-full max-w-[1800px] px-6 py-24 min-h-[70vh] flex flex-col justify-center items-center">
        <Card className="mx-auto flex max-w-md flex-col items-center rounded-sm border-[#1c1a18]/5 bg-[#efe7dc] p-8 py-10 text-center shadow-lg">
          <LockKeyhole className="mb-6 size-12 text-[#b85a3c]" />
          <h2 className="mb-4 font-serif text-2xl font-light text-[#1c1a18]">
            {t("account.signIn.profileTitle")}
          </h2>
          <p className="mb-8 text-xs leading-relaxed text-[#1c1a18]/65">
            {t("account.signIn.profileDescription")}
          </p>
          <Link
            href="/sign-in"
            className="inline-flex w-full justify-center rounded-sm bg-[#1c1a18] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#b85a3c]"
          >
            {t("account.signIn.action")}
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-canvas text-ink min-h-screen flex flex-col">
      {/* Main Content Area */}
      <main className="flex-grow w-full px-6 md:px-16 py-10 md:py-16 flex flex-col gap-10">

        {/* PROFILE TAB CONTENT */}
        {activeSubTab === "profile" && (
          <section className="flex flex-col gap-6 text-left">
            <div className="border-b border-hairline pb-4 flex justify-between items-end">
              <h2 className="font-serif text-2xl md:text-3xl text-[#1c1a18] font-light tracking-tight">
                {t("account.profile.title")}
              </h2>
              <span className="text-xs text-[#55423d]/65">
                {t("account.member")}
              </span>
            </div>

            {/* Redesigned Profile Section */}
            <div className="flex flex-col md:flex-row gap-12 md:gap-40 lg:gap-56 mt-2 text-left">
              {/* Sidebar */}
              <aside className="w-full md:w-52 flex-shrink-0">
                <nav className="flex flex-col gap-2">
                  <button 
                    onClick={() => setActiveProfileSidebarTab("account")}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      activeProfileSidebarTab === "account" 
                        ? "bg-surface-card text-ink" 
                        : "text-ink/70 hover:bg-surface-card/50 hover:text-ink"
                    }`}
                  >
                    <User className="size-4" />
                    {t("account.sidebar.account")}
                  </button>
                  <button 
                    onClick={() => setActiveProfileSidebarTab("delivery")}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      activeProfileSidebarTab === "delivery" 
                        ? "bg-surface-card text-ink" 
                        : "text-ink/70 hover:bg-surface-card/50 hover:text-ink"
                    }`}
                  >
                    <MapPin className="size-4" />
                    {t("account.sidebar.addresses")}
                  </button>
                  <button 
                    onClick={() => setActiveProfileSidebarTab("visibility")}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      activeProfileSidebarTab === "visibility" 
                        ? "bg-surface-card text-ink" 
                        : "text-ink/70 hover:bg-surface-card/50 hover:text-ink"
                    }`}
                  >
                    <Eye className="size-4" />
                    {t("account.sidebar.visibility")}
                  </button>
                  <button 
                    onClick={() => setActiveProfileSidebarTab("communication")}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      activeProfileSidebarTab === "communication" 
                        ? "bg-surface-card text-ink" 
                        : "text-ink/70 hover:bg-surface-card/50 hover:text-ink"
                    }`}
                  >
                    <Mail className="size-4" />
                    {t("account.sidebar.communication")}
                  </button>
                  <button 
                    onClick={() => setActiveProfileSidebarTab("privacy")}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      activeProfileSidebarTab === "privacy" 
                        ? "bg-surface-card text-ink" 
                        : "text-ink/70 hover:bg-surface-card/50 hover:text-ink"
                    }`}
                  >
                    <Shield className="size-4" />
                    {t("account.sidebar.privacy")}
                  </button>
                </nav>
              </aside>

              {/* Content */}
              <div className="flex-1 max-w-xl">
                {activeProfileSidebarTab === "account" && (
                  <div>
                    <h2 className="text-2xl font-serif text-ink font-light tracking-tight mb-8">{t("account.sidebar.account")}</h2>
                    
                    <div className="flex flex-col gap-8">
                      {/* Name Input */}
                      <div>
                        <div className="relative">
                          <input 
                            type="text"
                            id="fullName"
                            placeholder={t("account.profile.fullName")}
                            value={editForm.fullName}
                            onChange={(e) => {
                              setEditForm(prev => ({ ...prev, fullName: e.target.value }));
                              setFormModified(prev => ({...prev, fullName: true}));
                              setFormTouched(prev => ({...prev, fullName: false}));
                            }}
                            onBlur={() => setFormTouched(prev => ({...prev, fullName: true}))}
                            className={`peer w-full px-4 py-3.5 rounded-lg border bg-transparent text-sm text-ink placeholder-transparent focus:outline-none transition-colors duration-500 ease-out ${
                              formTouched.fullName && formModified.fullName && editForm.fullName.trim() === ""
                                ? "border-red-600 focus:border-red-600"
                                : "border-[#1c1a18]/20 focus:border-ink/60"
                            }`}
                          />
                          <label 
                            htmlFor="fullName"
                            className={`absolute left-3 -top-2 bg-canvas px-1 text-xs transition-all duration-200 ease-out peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs cursor-text ${
                              formTouched.fullName && formModified.fullName && editForm.fullName.trim() === ""
                                ? "text-red-600 peer-focus:text-red-600"
                                : "text-ink/70 peer-focus:text-ink/70"
                            }`}
                          >
                            {t("account.profile.fullName")}
                          </label>
                        </div>
                        {formTouched.fullName && formModified.fullName && editForm.fullName.trim() === "" && (
                          <p className="text-red-600 text-xs mt-1.5 transition-opacity duration-500">{t("account.profile.fullNameRequired")}</p>
                        )}
                      </div>

                      {/* Email Input */}
                      <div>
                        <div className="relative">
                          <input 
                            type="email"
                            id="email"
                            placeholder={t("account.profile.email")}
                            value={editForm.email}
                            readOnly
                            onChange={(e) => {
                              setEditForm(prev => ({ ...prev, email: e.target.value }));
                              setFormModified(prev => ({...prev, email: true}));
                              setFormTouched(prev => ({...prev, email: false}));
                            }}
                            onBlur={() => setFormTouched(prev => ({...prev, email: true}))}
                            className={`peer w-full px-4 py-3.5 rounded-lg border bg-transparent text-sm text-ink placeholder-transparent focus:outline-none transition-colors duration-500 ease-out ${
                              formTouched.email && formModified.email && !emailValidation.success
                                ? "border-red-600 focus:border-red-600"
                                : "border-[#1c1a18]/20 focus:border-ink/60"
                            }`}
                          />
                          <label 
                            htmlFor="email"
                            className={`absolute left-3 -top-2 bg-canvas px-1 text-xs transition-all duration-200 ease-out peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs cursor-text ${
                              formTouched.email && formModified.email && !emailValidation.success
                                ? "text-red-600 peer-focus:text-red-600"
                                : "text-ink/70 peer-focus:text-ink/70"
                            }`}
                          >
                            {t("account.profile.email")}
                          </label>
                        </div>
                        {formTouched.email && formModified.email && editForm.email.trim() === "" && (
                          <p className="text-red-600 text-xs mt-1.5 transition-opacity duration-500">{t("account.profile.emailRequired")}</p>
                        )}
                        {formTouched.email && formModified.email && editForm.email.trim() !== "" && !emailValidation.success && (
                          <p className="text-red-600 text-xs mt-1.5 transition-opacity duration-500">{t("account.profile.emailInvalid")}</p>
                        )}
                        <p className="text-xs text-ink/45 mt-1.5">
                          {t("account.profile.emailSettingsNote")}
                        </p>
                      </div>
                      
                      {/* Password block (Readonly) */}
                      <div>
                        <p className="text-sm font-medium text-ink mb-1">{t("account.profile.password")}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-2xl tracking-widest text-ink">................</p>
                          <button 
                            onClick={() => setIsEditPasswordOpen(true)}
                            className="text-sm font-medium text-ink underline underline-offset-4 hover:text-primary transition-colors cursor-pointer"
                          >
                            {t("account.profile.edit")}
                          </button>
                        </div>
                      </div>
                      
                      {/* Gender Input */}
                      <div>
                        <div className="relative">
                          <Select
                            value={editForm.gender}
                            onValueChange={(val) => {
                              setEditForm(prev => ({ ...prev, gender: val ?? "" }));
                              setFormModified(prev => ({...prev, gender: true}));
                              setFormTouched(prev => ({...prev, gender: false}));
                            }}
                            onOpenChange={(open) => {
                              setIsGenderOpen(open);
                              if (!open) {
                                setFormTouched(prev => ({...prev, gender: true}));
                              }
                            }}
                          >
                            <SelectTrigger
                              id="gender"
                              className={`!w-full !h-[52px] px-4 rounded-lg border bg-transparent text-sm text-ink focus:ring-0 focus:outline-none transition-colors duration-500 ease-out flex items-center justify-between ${
                                formTouched.gender && formModified.gender && editForm.gender === ""
                                  ? "border-red-600 focus:border-red-600"
                                  : (isGenderOpen ? "border-ink/60" : "border-[#1c1a18]/20")
                              }`}
                            >
                              <SelectValue placeholder="" />
                            </SelectTrigger>
                            <SelectContent alignItemWithTrigger={false} className="bg-canvas border-hairline rounded-lg shadow-sm">
                              {genderOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <label 
                            htmlFor="gender"
                            className={`absolute left-3 transition-all duration-200 ease-out pointer-events-none bg-canvas px-1 ${
                              editForm.gender === "" && !isGenderOpen
                                ? "top-[15px] text-sm" 
                                : "-top-2 text-xs"
                            } ${
                              formTouched.gender && formModified.gender && editForm.gender === ""
                                ? "text-red-600"
                                : "text-ink/70"
                            }`}
                          >
                            {t("account.profile.gender")}
                          </label>
                        </div>
                        {formTouched.gender && formModified.gender && editForm.gender === "" && (
                          <p className="text-red-600 text-xs mt-1.5 transition-opacity duration-500">{t("account.profile.genderRequired")}</p>
                        )}
                      </div>
                      
                      {/* Date of Birth Input */}
                      <div>
                        <div className="relative">
                          <input 
                            type="text"
                            id="dob"
                            placeholder=""
                            value={editForm.dob ? formatDate(editForm.dob, locale, { day: "2-digit", month: "2-digit", year: "numeric" }) : ""}
                            readOnly
                            onBlur={() => setFormTouched(prev => ({...prev, dob: true}))}
                            className={`peer !w-full !h-[52px] px-4 rounded-lg border bg-transparent text-sm text-ink placeholder-transparent focus:outline-none transition-colors duration-500 ease-out cursor-default ${
                              formTouched.dob && formModified.dob && editForm.dob.trim() === ""
                                ? "border-red-600 focus:border-red-600"
                                : (isDobOpen ? "border-ink/60" : "border-[#1c1a18]/20 focus:border-ink/60")
                            }`}
                          />
                          <Popover open={isDobOpen} onOpenChange={setIsDobOpen}>
                            <PopoverTrigger
                              aria-label={t("account.profile.openCalendar")}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-[#1c1a18]/5 rounded-md transition-colors cursor-pointer text-ink/70 hover:text-ink outline-none"
                            >
                              <CalendarDays className="size-4" />
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={editForm.dob ? new Date(editForm.dob) : undefined}
                                onSelect={(date) => {
                                  if (date) {
                                    const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                                    setEditForm(prev => ({ ...prev, dob: formatted }));
                                    setFormModified(prev => ({...prev, dob: true}));
                                    setFormTouched(prev => ({...prev, dob: false}));
                                    setIsDobOpen(false);
                                  }
                                }}
                                className="rounded-md border-hairline shadow-sm"
                                captionLayout="dropdown"
                              />
                            </PopoverContent>
                          </Popover>
                          <label 
                            htmlFor="dob"
                            className={`absolute left-3 transition-all duration-200 ease-out pointer-events-none bg-canvas px-1 ${
                              editForm.dob === "" && !isDobOpen
                                ? "top-[15px] text-sm" 
                                : "-top-2 text-xs"
                            } ${
                              formTouched.dob && formModified.dob && editForm.dob.trim() === ""
                                ? "text-red-600"
                                : "text-ink/70"
                            }`}
                          >
                            {t("account.profile.birthDate")}
                          </label>
                        </div>
                        {formTouched.dob && formModified.dob && editForm.dob.trim() === "" && (
                          <p className="text-red-600 text-xs mt-1.5 transition-opacity duration-500">{t("account.profile.birthDateRequired")}</p>
                        )}
                      </div>
                      
                      {/* Delete Account */}
                      <div className="flex justify-between items-center border-t border-[#1c1a18]/10 pt-8">
                        <p className="text-sm font-medium text-ink">{t("account.profile.deleteAccount")}</p>
                        <button className="px-6 py-2 rounded-full border border-[#1c1a18]/30 text-sm font-medium text-ink hover:border-[#1c1a18] transition-colors cursor-pointer">
                          {t("account.profile.delete")}
                        </button>
                      </div>

                      {profileSaveError && (
                        <p className="text-sm text-red-600">{profileSaveError}</p>
                      )}
                      {profileSaveMessage && (
                        <p className="text-sm text-emerald-700">{t("account.profile.saveSuccess")}</p>
                      )}
                      
                      {/* Save Button */}
                      <div className="flex justify-end border-t border-[#1c1a18]/10 pt-8">
                        <button 
                          onClick={handleSaveProfile}
                          disabled={!isFormDirty || !isProfileFormValid || updateProfileMutation.isPending}
                          className={`px-6 py-2 rounded-full border text-sm font-medium transition-colors ${
                            isFormDirty && isProfileFormValid && !updateProfileMutation.isPending
                              ? "bg-[#1c1a18] text-white border-[#1c1a18] hover:bg-[#1c1a18]/90 cursor-pointer"
                              : "border-[#1c1a18]/20 text-ink/40 bg-transparent cursor-not-allowed"
                          }`}
                        >
                          {updateProfileMutation.isPending ? t("account.profile.saving") : t("account.profile.save")}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeProfileSidebarTab === "delivery" && (
                  <div>
                    <h2 className="text-2xl font-serif text-ink font-light tracking-tight mb-8">{t("account.addresses.title")}</h2>
                    {addressesQuery.isLoading ? (
                      <ProfileAddressesLoadingFallback />
                    ) : addressesQuery.isError ? (
                      <StorefrontApiStatus
                        error={addressesQuery.error}
                        onRetry={() => void addressesQuery.refetch()}
                        resourceLabel={t("account.addresses.resource")}
                        returnHref="/collection"
                        variant="panel"
                      />
                    ) : addresses.length === 0 ? (
                      <div className="py-16 text-center flex flex-col items-center gap-6 bg-surface-card/30 border border-[#1c1a18]/15 rounded-md">
                        <p className="text-sm text-ink/70 font-light max-w-md">
                          {t("account.addresses.empty")}
                        </p>
                        <button className="inline-flex py-3.5 px-10 rounded-sm border border-[#1c1a18] text-xs font-semibold uppercase tracking-widest text-[#1c1a18] hover:bg-[#1c1a18] hover:text-white transition-colors cursor-pointer">
                          {t("account.addresses.add")}
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            className="rounded-md border border-[#1c1a18]/15 bg-surface-card/30 p-5"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-sm font-semibold text-ink">
                                    {address.receiverName}
                                  </h3>
                                  {address.isDefault && (
                                    <span className="rounded bg-[#1c1a18] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                                      {t("account.addresses.default")}
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-sm text-ink/65">
                                  {address.phone ?? t("account.addresses.noPhone")}
                                </p>
                                <p className="mt-2 text-sm leading-relaxed text-ink/70">
                                  {formatAddress(address) || t("account.addresses.noAddress")}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {activeProfileSidebarTab === "visibility" && (
                  <div>
                    <h2 className="text-2xl font-serif text-ink font-light tracking-tight mb-8">{t("account.visibility.title")}</h2>
                    <p className="text-sm text-ink/70 font-light mb-8 max-w-md">
                      {t("account.visibility.description")}
                    </p>
                    
                    <div className="flex items-center gap-5 md:gap-6 text-left mb-12">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#efe7dc] border border-hairline flex items-center justify-center text-ink text-2xl md:text-3xl font-serif font-light shadow-inner flex-shrink-0 relative">
                        {user.fullName ? user.fullName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "U"}
                        <button aria-label={t("account.visibility.editAvatar")} className="absolute bottom-0 right-0 bg-white border border-hairline rounded-full p-1.5 shadow-sm hover:scale-105 transition-transform flex items-center justify-center">
                          <PencilLine className="size-3.5 text-ink" />
                        </button>
                      </div>
                      <div className="flex flex-col justify-center">
                        <h3 className="text-sm font-medium text-ink mb-1">{t("account.visibility.display")}</h3>
                        <p className="text-sm text-ink/60 mb-1.5">{user.fullName}</p>
                        <p className="text-xs text-ink/50 font-light">
                          {t("account.visibility.memberSince", { date: formatMemberSince(user.createdAt, locale) })}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-[#1c1a18]/10 pt-8 mb-8">
                      <h3 className="text-base font-medium text-ink mb-4">{t("account.visibility.reviewTitle")}</h3>
                      <p className="text-sm text-ink/70 font-light mb-6">
                        {t("account.visibility.reviewDescription")} <button className="font-semibold underline underline-offset-4">{t("account.visibility.learnMore")}</button>
                      </p>
                      <div className="flex flex-col gap-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className={`size-5 rounded-full border flex items-center justify-center transition-colors ${reviewVisibility === "private" ? "border-ink" : "border-ink/30 group-hover:border-ink/60"}`}>
                            {reviewVisibility === "private" && <div className="size-2.5 bg-ink rounded-full" />}
                          </div>
                          <span className="text-sm text-ink">{t("account.visibility.private")}</span>
                          <input type="radio" className="hidden" checked={reviewVisibility === "private"} onChange={() => setReviewVisibility("private")} />
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className={`size-5 rounded-full border flex items-center justify-center transition-colors ${reviewVisibility === "social" ? "border-ink" : "border-ink/30 group-hover:border-ink/60"}`}>
                            {reviewVisibility === "social" && <div className="size-2.5 bg-ink rounded-full" />}
                          </div>
                          <span className="text-sm text-ink">{t("account.visibility.social")}</span>
                          <input type="radio" className="hidden" checked={reviewVisibility === "social"} onChange={() => setReviewVisibility("social")} />
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className={`size-5 rounded-full border flex items-center justify-center transition-colors ${reviewVisibility === "public" ? "border-ink" : "border-ink/30 group-hover:border-ink/60"}`}>
                            {reviewVisibility === "public" && <div className="size-2.5 bg-ink rounded-full" />}
                          </div>
                          <span className="text-sm text-ink">{t("account.visibility.public")}</span>
                          <input type="radio" className="hidden" checked={reviewVisibility === "public"} onChange={() => setReviewVisibility("public")} />
                        </label>
                      </div>
                    </div>

                    <div className="pt-2 mb-8">
                      <h3 className="text-base font-medium text-ink mb-4">{t("account.visibility.locationTitle")}</h3>
                      <div className="flex flex-col gap-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className={`size-5 rounded-full border flex items-center justify-center transition-colors ${locationSharing === "friends" ? "border-ink" : "border-ink/30 group-hover:border-ink/60"}`}>
                            {locationSharing === "friends" && <div className="size-2.5 bg-ink rounded-full" />}
                          </div>
                          <span className="text-sm text-ink">{t("account.visibility.locationFriends")}</span>
                          <input type="radio" className="hidden" checked={locationSharing === "friends"} onChange={() => setLocationSharing("friends")} />
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className={`size-5 rounded-full border flex items-center justify-center transition-colors ${locationSharing === "dont_share" ? "border-ink" : "border-ink/30 group-hover:border-ink/60"}`}>
                            {locationSharing === "dont_share" && <div className="size-2.5 bg-ink rounded-full" />}
                          </div>
                          <span className="text-sm text-ink">{t("account.visibility.locationNone")}</span>
                          <input type="radio" className="hidden" checked={locationSharing === "dont_share"} onChange={() => setLocationSharing("dont_share")} />
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button className="px-8 py-2.5 rounded-full bg-ink text-sm font-medium text-white hover:bg-[#b85a3c] transition-colors">
                        {t("account.profile.save")}
                      </button>
                    </div>
                  </div>
                )}

                {activeProfileSidebarTab === "communication" && (
                  <div>
                    <h2 className="text-2xl font-serif text-ink font-light tracking-tight mb-8">{t("account.communication.title")}</h2>
                    
                    <div className="mb-8">
                      <h3 className="text-base font-medium text-ink mb-3">{t("account.communication.general")}</h3>
                      <p className="text-sm text-ink/70 font-light mb-6">
                        {t("account.communication.description")}
                      </p>
                      
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`size-5 rounded-sm border flex items-center justify-center transition-colors ${emailUpdates ? "border-ink bg-ink" : "border-ink/30 group-hover:border-ink/60"}`}>
                          {emailUpdates && <Check className="size-3.5 text-white" />}
                        </div>
                        <span className="text-sm text-ink">{t("account.communication.email")}</span>
                        <input type="checkbox" className="hidden" checked={emailUpdates} onChange={() => setEmailUpdates(!emailUpdates)} />
                      </label>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button className="px-8 py-2.5 rounded-full bg-ink text-sm font-medium text-white hover:bg-[#b85a3c] transition-colors">
                        {t("account.profile.save")}
                      </button>
                    </div>
                  </div>
                )}

                {activeProfileSidebarTab === "privacy" && (
                  <div>
                    <h2 className="text-2xl font-serif text-ink font-light tracking-tight mb-8">{t("account.privacy.title")}</h2>
                    
                    <p className="text-sm text-ink/70 font-light mb-4 max-w-lg">
                      {t("account.privacy.description")}
                    </p>
                    <p className="text-sm text-ink/70 font-light mb-8">
                      {t("account.privacy.policyLead")} <button className="font-medium underline underline-offset-4 text-ink">{t("account.privacy.policy")}</button>
                    </p>
                    
                    <div className="border-t border-[#1c1a18]/10 pt-6 mb-6">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`mt-0.5 size-5 flex-shrink-0 rounded-sm border flex items-center justify-center transition-colors ${privacySettings.personalisedAds ? "border-ink bg-ink" : "border-ink/30 group-hover:border-ink/60"}`}>
                          {privacySettings.personalisedAds && <Check className="size-3.5 text-white" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-ink mb-1.5">{t("account.privacy.personalisedAds")}</span>
                          <span className="text-sm text-ink/60 font-light mb-2">{t("account.privacy.personalisedAdsDescription")}</span>
                          <button className="text-sm font-medium underline underline-offset-4 text-ink/70 hover:text-ink text-left w-fit">{t("account.privacy.personalisedAdsLearn")}</button>
                        </div>
                        <input type="checkbox" className="hidden" checked={privacySettings.personalisedAds} onChange={() => setPrivacySettings(prev => ({...prev, personalisedAds: !prev.personalisedAds}))} />
                      </label>
                    </div>

                    <div className="border-t border-[#1c1a18]/10 pt-6 mb-6">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`mt-0.5 size-5 flex-shrink-0 rounded-sm border flex items-center justify-center transition-colors ${privacySettings.profileAds ? "border-ink bg-ink" : "border-ink/30 group-hover:border-ink/60"}`}>
                          {privacySettings.profileAds && <Check className="size-3.5 text-white" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-ink mb-1.5">{t("account.privacy.profileAds")}</span>
                          <span className="text-sm text-ink/60 font-light mb-2">{t("account.privacy.profileAdsDescription")}</span>
                          <button className="text-sm font-medium underline underline-offset-4 text-ink/70 hover:text-ink text-left w-fit">{t("account.privacy.profileAdsLearn")}</button>
                        </div>
                        <input type="checkbox" className="hidden" checked={privacySettings.profileAds} onChange={() => setPrivacySettings(prev => ({...prev, profileAds: !prev.profileAds}))} />
                      </label>
                    </div>

                    <div className="border-t border-[#1c1a18]/10 pt-6 mb-8">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`mt-0.5 size-5 flex-shrink-0 rounded-sm border flex items-center justify-center transition-colors ${privacySettings.workoutData ? "border-ink bg-ink" : "border-ink/30 group-hover:border-ink/60"}`}>
                          {privacySettings.workoutData && <Check className="size-3.5 text-white" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-ink mb-1.5">{t("account.privacy.workoutData")}</span>
                          <span className="text-sm text-ink/60 font-light mb-2">{t("account.privacy.workoutDataDescription")}</span>
                        </div>
                        <input type="checkbox" className="hidden" checked={privacySettings.workoutData} onChange={() => setPrivacySettings(prev => ({...prev, workoutData: !prev.workoutData}))} />
                      </label>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button className="px-8 py-2.5 rounded-full bg-ink text-sm font-medium text-white hover:bg-[#b85a3c] transition-colors">
                        {t("account.profile.save")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ORDERS TAB CONTENT */}
        {activeSubTab === "orders" && (
          <section className="flex flex-col gap-6 text-left">
            <div className="border-b border-hairline pb-4 flex justify-between items-end">
              <h2 className="font-serif text-2xl md:text-3xl text-[#1c1a18] font-light tracking-tight">
                {t("account.orders.title")}
              </h2>
              <span className="text-xs text-[#55423d]/65">
                {t(orders.length === 1 ? "account.orders.count.one" : "account.orders.count.many", { count: orders.length })}
              </span>
            </div>

            {!ordersQuery.isLoading && !ordersQuery.isError && orders.length > 0 && (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                {orderStats.map((stat) => {
                  const percentage = Math.round((stat.count / orders.length) * 100);
                  return (
                    <div
                      key={stat.status}
                      className="rounded-sm border border-hairline/45 bg-white/65 p-4"
                    >
                      <div className="mb-4 flex items-center gap-2">
                        <span className={`size-2 rounded-full ${stat.dot}`} aria-hidden="true" />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/50">
                          {stat.label}
                        </span>
                      </div>
                      <div className="flex items-end justify-between gap-2">
                        <span className="font-serif text-2xl text-ink">{stat.count}</span>
                        <span className="pb-0.5 text-[10px] font-medium text-ink/40">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {ordersQuery.isLoading ? (
              <ProfileOrdersLoading />
            ) : ordersQuery.isError ? (
              <StorefrontApiStatus
                error={ordersQuery.error}
                onRetry={() => void ordersQuery.refetch()}
                resourceLabel={t("account.orders.resource")}
                returnHref="/collection"
                variant="panel"
              />
            ) : orders.length === 0 ? (
              <div className="py-12 text-center select-none bg-surface-card/10 border border-hairline/20 rounded-sm">
                <p className="text-sm text-[#1c1a18]/50 mb-6">{t("account.orders.empty")}</p>
                <Link
                  href="/collection"
                  className="inline-flex items-center rounded-sm bg-[#1c1a18] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#b85a3c] transition-colors"
                >
                  {t("account.orders.shopNow")}
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {orders.map((order) => {
                  const statusMeta = orderStatusMeta[order.status] ?? {
                    badge: "bg-slate-100 text-slate-800",
                    dot: "bg-slate-500",
                  };
                  const statusKey = orderStatusLabelKeys[order.status as keyof typeof orderStatusLabelKeys];
                  const statusLabel = statusKey ? t(statusKey) : order.status;

                  return (
                    <Link
                      key={order.id}
                      href={`/profile/orders/${order.orderCode}`}
                      className="border border-hairline/60 rounded-sm bg-surface-card/30 p-6 flex flex-col md:flex-row gap-6 justify-between hover:bg-surface-card/65 transition-colors cursor-pointer"
                    >
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-surface-card overflow-hidden rounded-sm flex-shrink-0 border border-hairline/25 relative flex items-center justify-center bg-[#efebe4]">
                          <span className="font-serif text-xl font-light text-ink/40">V</span>
                        </div>
                        <div className="flex flex-col justify-center">
                          <h3 className="font-sans text-sm font-semibold text-ink">{t("account.orders.order", { code: order.orderCode })}</h3>
                          <p className="text-xs text-[#55423d]/75 mt-0.5">
                            {t("account.orders.receiver", {
                              name: order.receiverName ?? t("account.order.notAvailable"),
                              phone: order.receiverPhone ?? t("account.order.notAvailable"),
                            })}
                          </p>
                          <p className="text-xs text-[#55423d]/75">
                            {t("account.orders.address", { address: order.receiverAddress ?? t("account.order.notAvailable") })}
                          </p>
                          <p className="text-xs text-[#55423d]/50 mt-1">
                            {t("account.orders.placedOn", { date: formatDisplayDate(order.createdAt, locale) })}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col justify-between md:justify-center md:items-end gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-hairline/40">
                        <div className="text-sm font-bold text-ink">{money(Number(order.finalAmount ?? order.subtotal ?? 0), locale)}</div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${statusMeta.badge}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* FAVOURITES TAB CONTENT */}
        {activeSubTab === "favourites" && (
          <section className="flex flex-col gap-6 text-left">
            <div className="border-b border-hairline pb-4 flex justify-between items-end">
              <h2 className="font-serif text-2xl md:text-3xl text-ink font-light tracking-tight">
                {t("account.favourites.title")}
              </h2>
              <span className="text-xs text-[#55423d]/65">
                {t(favorites.length === 1 ? "account.favourites.count.one" : "account.favourites.count.many", { count: favorites.length })}
              </span>
            </div>
            {favoritesLoading ? (
              <ProfileFavouritesLoading />
            ) : favoritesError ? (
              <StorefrontApiStatus
                error={favoritesError}
                onRetry={retryFavorites}
                resourceLabel={t("account.favourites.resource")}
                returnHref="/collection"
                variant="panel"
              />
            ) : favorites.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center gap-6">
                <p className="text-sm text-on-surface-variant/80 font-light max-w-md">
                  {t("account.favourites.empty")}
                </p>
                <Link
                  href="/collection"
                  className="inline-flex bg-primary-container text-on-primary text-xs font-semibold uppercase tracking-widest py-3.5 px-8 hover:bg-[#964025] transition-colors duration-200 rounded-sm shadow-sm"
                >
                  {t("account.favourites.explore")}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {favorites.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    imageAction={
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(product);
                        }}
                        aria-label={t("account.favourites.remove", { product: product.name })}
                        className="flex items-center justify-center size-8 rounded-full bg-white shadow-sm hover:scale-110 transition-transform"
                      >
                        <Heart className="size-4 text-[#b85a3c] fill-[#b85a3c]" />
                      </button>
                    }
                    footerAction={
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(product);
                          showAddedToBag(product, product.size || "M", product.color || t("account.favourites.defaultOption"));
                        }}
                        className="w-full py-3 rounded-sm border border-[#1c1a18] text-xs font-semibold uppercase tracking-widest text-[#1c1a18] hover:bg-[#1c1a18] hover:text-white transition-colors"
                      >
                        {t("account.favourites.addToBag")}
                      </button>
                    }
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Edit Password Modal */}
        {isEditPasswordOpen && (
          <div 
            className="fixed inset-0 bg-[#1c1a18]/40 z-50 flex items-center justify-center p-4"
            onClick={() => setIsEditPasswordOpen(false)}
          >
            <div 
              className="bg-canvas rounded-2xl w-full max-w-[500px] p-6 md:p-8 relative shadow-xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="password-dialog-title"
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsEditPasswordOpen(false)}
                aria-label={t("account.password.close")}
                className="absolute top-6 right-6 p-2 bg-[#1c1a18]/5 rounded-full hover:bg-[#1c1a18]/10 transition-colors cursor-pointer"
              >
                <X className="size-5 text-ink" />
              </button>

              <h2 id="password-dialog-title" className="text-2xl font-serif font-light text-ink tracking-tight mb-8">
                {user?.hasPassword !== false ? t("account.password.editTitle") : t("account.password.createTitle")}
              </h2>

              <div className="flex flex-col gap-6">
                {/* Current Password */}
                {user?.hasPassword !== false && (
                <div>
                  <div className="relative">
                    <input 
                      type="password"
                      id="currentPassword"
                      placeholder={t("account.password.current")}
                      value={passwordForm.currentPassword}
                      onChange={(e) => {
                        setPasswordForm(prev => ({...prev, currentPassword: e.target.value}));
                        setPasswordModified(prev => ({...prev, current: true}));
                        setPasswordTouched(prev => ({...prev, current: false}));
                      }}
                      onBlur={() => setPasswordTouched(prev => ({...prev, current: true}))}
                      className={`peer w-full px-4 py-3.5 rounded-lg border bg-transparent text-sm text-ink placeholder-transparent focus:outline-none transition-colors duration-500 ease-out ${
                        passwordTouched.current && passwordModified.current && passwordForm.currentPassword.length === 0
                          ? "border-red-600 focus:border-red-600"
                          : "border-[#1c1a18]/20 focus:border-ink/60"
                      }`}
                    />
                    <label 
                      htmlFor="currentPassword"
                      className={`absolute left-3 -top-2 bg-canvas px-1 text-xs transition-all duration-300 ease-out peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs cursor-text ${
                        passwordTouched.current && passwordModified.current && passwordForm.currentPassword.length === 0
                          ? "text-red-600 peer-focus:text-red-600"
                          : "text-ink/70 peer-focus:text-ink/70"
                      }`}
                    >
                      {t("account.password.current")}
                    </label>
                  </div>
                  {passwordTouched.current && passwordModified.current && passwordForm.currentPassword.length === 0 && (
                    <p className="text-red-600 text-xs mt-1.5 transition-opacity duration-500">{t("account.password.currentRequired")}</p>
                  )}
                </div>
                )}
                
                {/* New Password */}
                <div>
                  <div className="relative">
                    <input 
                      type="password"
                      id="newPassword"
                      placeholder={t("account.password.new")}
                      value={passwordForm.newPassword}
                      onChange={(e) => {
                        setPasswordForm(prev => ({...prev, newPassword: e.target.value}));
                        setPasswordModified(prev => ({...prev, new: true}));
                        setPasswordTouched(prev => ({...prev, new: false}));
                      }}
                      onBlur={() => setPasswordTouched(prev => ({...prev, new: true}))}
                      className={`peer w-full px-4 py-3.5 rounded-lg border bg-transparent text-sm text-ink placeholder-transparent focus:outline-none transition-colors duration-500 ease-out ${
                        passwordTouched.new && passwordModified.new && !isStrongPassword
                          ? "border-red-600 focus:border-red-600"
                          : "border-[#1c1a18]/20 focus:border-ink/60"
                      }`}
                    />
                    <label 
                      htmlFor="newPassword"
                      className={`absolute left-3 -top-2 bg-canvas px-1 text-xs transition-all duration-300 ease-out peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs cursor-text ${
                        passwordTouched.new && passwordModified.new && !isStrongPassword
                          ? "text-red-600 peer-focus:text-red-600"
                          : "text-ink/70 peer-focus:text-ink/70"
                      }`}
                    >
                      {t("account.password.new")}
                    </label>
                  </div>
                  {passwordTouched.new && passwordModified.new && !isStrongPassword && (
                    <p className="text-red-600 text-xs mt-1.5 transition-opacity duration-500">{passwordValidationMessage ?? t("account.password.newRequired")}</p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <div className="relative">
                    <input 
                      type="password"
                      id="confirmPassword"
                      placeholder={t("account.password.confirm")}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => {
                        setPasswordForm(prev => ({...prev, confirmPassword: e.target.value}));
                        setPasswordModified(prev => ({...prev, confirm: true}));
                        setPasswordTouched(prev => ({...prev, confirm: false}));
                      }}
                      onBlur={() => setPasswordTouched(prev => ({...prev, confirm: true}))}
                      className={`peer w-full px-4 py-3.5 rounded-lg border bg-transparent text-sm text-ink placeholder-transparent focus:outline-none transition-colors duration-500 ease-out ${
                        passwordTouched.confirm && passwordModified.confirm && (passwordForm.confirmPassword.length === 0 || passwordForm.confirmPassword !== passwordForm.newPassword)
                          ? "border-red-600 focus:border-red-600"
                          : "border-[#1c1a18]/20 focus:border-ink/60"
                      }`}
                    />
                    <label 
                      htmlFor="confirmPassword"
                      className={`absolute left-3 -top-2.5 bg-canvas px-1 text-xs transition-all duration-300 ease-out peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs cursor-text ${
                        passwordTouched.confirm && passwordModified.confirm && (passwordForm.confirmPassword.length === 0 || passwordForm.confirmPassword !== passwordForm.newPassword)
                          ? "text-red-600 peer-focus:text-red-600"
                          : "text-ink/70 peer-focus:text-ink/70"
                      }`}
                    >
                      {t("account.password.confirm")}
                    </label>
                  </div>
                  {passwordTouched.confirm && passwordModified.confirm && passwordForm.confirmPassword.length > 0 && passwordForm.confirmPassword !== passwordForm.newPassword && (
                    <p className="text-red-600 text-xs mt-1.5 transition-opacity duration-300">{t("account.password.mismatch")}</p>
                  )}
                  {passwordTouched.confirm && passwordModified.confirm && passwordForm.confirmPassword.length === 0 && (
                    <p className="text-red-600 text-xs mt-1.5 transition-opacity duration-300">{t("account.password.confirmRequired")}</p>
                  )}
                </div>
              </div>

              <div className="mt-8 mb-12 pl-2">
                <p className="text-ink/70 text-sm mb-2">{t("account.password.requirements")}</p>
                <div className={`flex items-center gap-2 text-sm ${isStrongPassword ? "text-green-700" : "text-ink/70"}`}>
                  {isStrongPassword ? <Check className="size-4" /> : <X className="size-4" />}
                  <span>{t("account.password.strongRequirement")}</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  disabled={
                    user?.hasPassword !== false 
                      ? passwordForm.currentPassword.length === 0 || !isStrongPassword || passwordForm.newPassword !== passwordForm.confirmPassword
                      : !isStrongPassword || passwordForm.newPassword !== passwordForm.confirmPassword
                  }
                  className={`px-8 py-2.5 rounded-full border text-sm font-medium transition-colors cursor-pointer ${
                    (user?.hasPassword !== false 
                      ? passwordForm.currentPassword.length > 0 && isStrongPassword && passwordForm.newPassword === passwordForm.confirmPassword
                      : isStrongPassword && passwordForm.newPassword === passwordForm.confirmPassword)
                      ? "bg-[#1c1a18] text-white border-[#1c1a18] hover:bg-[#1c1a18]/90"
                      : "border-[#1c1a18]/20 text-ink/40 bg-transparent cursor-not-allowed pointer-events-none"
                  }`}
                >
                  {user?.hasPassword !== false ? t("account.profile.save") : t("account.password.create")}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

function ProfileAddressesLoadingFallback() {
  return (
    <div className="grid gap-4 md:grid-cols-2" aria-hidden="true">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="min-h-36 rounded-md border border-hairline/45 bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-16 rounded-sm" />
          </div>
          <Skeleton className="mt-4 h-3 w-24" />
          <Skeleton className="mt-3 h-3 w-full max-w-72" />
          <Skeleton className="mt-2 h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

function ProfileTabLoading({ tab }: { tab: ProfileTabId }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink" aria-busy="true">
      <main className="flex w-full flex-grow flex-col gap-10 px-6 py-10 md:px-16 md:py-16">
        <section className="flex flex-col gap-6 text-left">
          <div className="flex items-end justify-between border-b border-hairline pb-4">
            <Skeleton className="h-8 w-44 md:h-9 md:w-56" />
            <Skeleton className="h-3 w-20" />
          </div>
          {tab === "orders" ? (
            <ProfileOrdersLoading />
          ) : tab === "favourites" ? (
            <ProfileFavouritesLoading />
          ) : (
            <ProfileOverviewLoading />
          )}
        </section>
      </main>
    </div>
  );
}

function ProfileOverviewLoading() {
  return (
    <div className="mt-2 flex flex-col gap-12 text-left md:flex-row md:gap-40 lg:gap-56" aria-hidden="true">
      <aside className="w-full flex-shrink-0 space-y-2 md:w-52">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-4 rounded-sm" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </aside>
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex items-center gap-5">
          <Skeleton className="size-20 rounded-full" />
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-11 w-full rounded-sm" />
            </div>
          ))}
        </div>
        <div className="flex justify-end border-t border-hairline pt-8">
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function ProfileOrdersLoading() {
  return (
    <div className="flex flex-col gap-8" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col justify-between gap-6 rounded-sm border border-hairline/60 bg-surface-card/30 p-6 md:flex-row"
        >
          <div className="flex min-w-0 gap-4">
            <Skeleton className="size-20 flex-shrink-0 rounded-sm" />
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
              <Skeleton className="h-4 w-44 max-w-full" />
              <Skeleton className="h-3 w-56 max-w-full" />
              <Skeleton className="h-3 w-72 max-w-full" />
              <Skeleton className="h-3 w-32 max-w-full" />
            </div>
          </div>
          <div className="flex flex-row items-center justify-between gap-3 border-t border-hairline/40 pt-4 md:flex-col md:items-end md:justify-center md:border-t-0 md:pt-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-20 rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileFavouritesLoading() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-full overflow-hidden rounded-md border border-transparent bg-white">
          <div className="relative aspect-square">
            <Skeleton className="absolute inset-0 size-full rounded-none" />
            <Skeleton className="absolute right-4 top-4 size-8 rounded-full bg-white/80" />
          </div>
          <div className="flex flex-col items-start px-4 pb-6 pt-5">
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="mt-4 h-4 w-24" />
            <Skeleton className="mt-5 h-10 w-full rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}
