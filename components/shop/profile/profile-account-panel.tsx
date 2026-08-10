import { useState, useTransition } from "react";
import Link from "next/link";
import { User as UserIcon, MapPin, Eye, Mail, Shield, PencilLine, CalendarDays, LayoutDashboard } from "lucide-react";
import { canAccessManagement, getUserRoleNames } from "@/lib/auth/roles";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { formatDate } from "@/lib/i18n/format";
import { createEmailSchema } from "@/lib/validations";
import { deleteAccount } from "@/lib/api/auth";
import { EditPasswordModal } from "@/components/shop/edit-password-modal";
import { EditEmailModal } from "@/components/shop/edit-email-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StorefrontApiStatus } from "@/components/errors/storefront-api-status";
import { useI18n } from "@/components/providers/i18n-provider";
import { useUpdateProfileMutation } from "@/lib/queries/commerce";
import type { Gender, User, UserAddress } from "@/lib/api/types";
import {
  formatMemberSince,
  formatAddress,
} from "./profile-formatters";
import { ProfileAddressesLoadingFallback } from "./profile-loading";

interface ProfileAccountPanelProps {
  user: User;
  checkSession: () => Promise<void>;
  addressesQuery: {
    data?: { result: UserAddress[] };
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
  };
  activeSidebarTab: string;
  setActiveSidebarTab: (tab: string) => void;
}

export function ProfileAccountPanel({
  user,
  checkSession,
  addressesQuery,
  activeSidebarTab,
  setActiveSidebarTab,
}: ProfileAccountPanelProps) {
  const { locale, t } = useI18n();
  const updateProfileMutation = useUpdateProfileMutation();
  const addresses = addressesQuery.data?.result ?? [];

  const [isEditPasswordOpen, setIsEditPasswordOpen] = useState(false);
  const [isEditEmailOpen, setIsEditEmailOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const [editFormDraft, setEditForm] = useState({
    fullName: "",
    email: "",
    gender: "",
    dob: "",
  });
  const [formTouched, setFormTouched] = useState({ fullName: false, email: false, gender: false, dob: false });
  const [formModified, setFormModified] = useState({ fullName: false, email: false, gender: false, dob: false });
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isDobOpen, setIsDobOpen] = useState(false);
  const [profileSaveMessage, setProfileSaveMessage] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);

  const editForm = {
    fullName: formModified.fullName ? editFormDraft.fullName : user.fullName ?? "",
    email: user.email ?? "",
    gender: formModified.gender ? editFormDraft.gender : user.gender ?? "",
    dob: formModified.dob ? editFormDraft.dob : user.birthDate ?? "",
  };

  const genderOptions: { value: Gender; label: string }[] = [
    { value: "MALE", label: t("account.profile.gender.male") },
    { value: "FEMALE", label: t("account.profile.gender.female") },
    { value: "OTHER", label: t("account.profile.gender.other") },
  ];
  const emailValidation = createEmailSchema(locale).safeParse(editForm.email);

  const isFormDirty =
    editForm.fullName.trim() !== (user.fullName || "") ||
    editForm.gender !== (user.gender || "") ||
    editForm.dob !== (user.birthDate || "");

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

    if (!isProfileFormValid) {
      setFormTouched({ fullName: true, email: false, gender: true, dob: true });
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        fullName: editForm.fullName.trim(),
        birthDate: editForm.dob,
        gender: editForm.gender as Gender,
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
    workoutData: true,
  });

  const handleDeleteAccount = () => {
    startDeleteTransition(async () => {
      try {
        await deleteAccount();
        window.location.href = "/";
      } catch (error) {
        console.error("Failed to delete account:", error);
      }
    });
  };

  return (
    <section className="flex flex-col gap-6 text-left">
      {canAccessManagement(user) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-md border border-[#1c1a18]/10 bg-[#efe7dc]/40 p-4.5 text-[#1c1a18] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-full bg-[#1c1a18] text-white flex-shrink-0">
              <Shield className="size-5 text-[#e2a898]" />
            </div>
            <div className="space-y-0.5 text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-[#1c1a18]">
                {t("admin.shell.auth.currentRole", { roles: getUserRoleNames(user).join(", ") }) || "Quyền Quản Trị Hệ Thống"}
              </p>
              <p className="text-xs text-[#1c1a18]/70">
                Tài khoản của bạn có quyền quản trị. Bạn có thể quay lại Bảng điều khiển Admin bất cứ lúc nào.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#1c1a18] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#f7f4ef] transition-all hover:bg-[#b5573a] flex-shrink-0 active:scale-[0.97]"
          >
            <LayoutDashboard className="size-4" />
            <span>{t("common.adminDashboard")}</span>
          </Link>
        </div>
      )}

      <div className="border-b border-hairline pb-4 flex justify-between items-end">
        <h2 className="font-serif text-2xl md:text-3xl text-[#1c1a18] font-light tracking-tight">
          {t("account.profile.title")}
        </h2>
        <span className="text-xs text-[#55423d]/65">
          {t("account.member")}
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-12 md:gap-40 lg:gap-56 mt-2 text-left">
        {/* Sidebar */}
        <aside className="w-full md:w-52 flex-shrink-0">
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveSidebarTab("account")}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                activeSidebarTab === "account"
                  ? "bg-surface-card text-ink"
                  : "text-ink/70 hover:bg-surface-card/50 hover:text-ink"
              }`}
            >
              <UserIcon className="size-4" />
              {t("account.sidebar.account")}
            </button>
            <button
              onClick={() => setActiveSidebarTab("delivery")}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                activeSidebarTab === "delivery"
                  ? "bg-surface-card text-ink"
                  : "text-ink/70 hover:bg-surface-card/50 hover:text-ink"
              }`}
            >
              <MapPin className="size-4" />
              {t("account.sidebar.addresses")}
            </button>
            <button
              onClick={() => setActiveSidebarTab("visibility")}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                activeSidebarTab === "visibility"
                  ? "bg-surface-card text-ink"
                  : "text-ink/70 hover:bg-surface-card/50 hover:text-ink"
              }`}
            >
              <Eye className="size-4" />
              {t("account.sidebar.visibility")}
            </button>
            <button
              onClick={() => setActiveSidebarTab("communication")}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                activeSidebarTab === "communication"
                  ? "bg-surface-card text-ink"
                  : "text-ink/70 hover:bg-surface-card/50 hover:text-ink"
              }`}
            >
              <Mail className="size-4" />
              {t("account.sidebar.communication")}
            </button>
            <button
              onClick={() => setActiveSidebarTab("privacy")}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                activeSidebarTab === "privacy"
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
          {activeSidebarTab === "account" && (
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
                        formTouched.fullName && editForm.fullName.trim() === ""
                          ? "border-red-600 focus:border-red-600"
                          : "border-[#1c1a18]/20 focus:border-ink/60"
                      }`}
                    />
                    <label 
                      htmlFor="fullName"
                      className={`absolute left-3 -top-2 bg-canvas px-1 text-xs transition-all duration-200 ease-out peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs cursor-text ${
                        formTouched.fullName && editForm.fullName.trim() === ""
                          ? "text-red-600 peer-focus:text-red-600"
                          : "text-ink/70 peer-focus:text-ink/70"
                      }`}
                    >
                      {t("account.profile.fullName")}
                    </label>
                  </div>
                  {formTouched.fullName && editForm.fullName.trim() === "" && (
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
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-ink/45">
                      {t("account.profile.emailSettingsNote")}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsEditEmailOpen(true)}
                      className="text-sm font-medium text-ink underline underline-offset-4 hover:text-primary transition-colors cursor-pointer"
                    >
                      {t("account.profile.edit")}
                    </button>
                  </div>
                </div>

                {/* Password block (Readonly) */}
                <div>
                  <p className="text-sm font-medium text-ink mb-1">{t("account.profile.password")}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-2xl tracking-widest text-ink">................</p>
                    <button 
                      type="button"
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
                          formTouched.gender && editForm.gender === ""
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
                        formTouched.gender && editForm.gender === ""
                          ? "text-red-600"
                          : "text-ink/70"
                      }`}
                    >
                      {t("account.profile.gender")}
                    </label>
                  </div>
                  {formTouched.gender && editForm.gender === "" && (
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
                        formTouched.dob && editForm.dob.trim() === ""
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
                          onSelect={(date: Date | undefined) => {
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
                        formTouched.dob && editForm.dob.trim() === ""
                          ? "text-red-600"
                          : "text-ink/70"
                      }`}
                    >
                      {t("account.profile.birthDate")}
                    </label>
                  </div>
                  {formTouched.dob && editForm.dob.trim() === "" && (
                    <p className="text-red-600 text-xs mt-1.5 transition-opacity duration-500">{t("account.profile.birthDateRequired")}</p>
                  )}
                </div>

                {/* Delete Account */}
                <div className="flex justify-between items-center border-t border-[#1c1a18]/10 pt-8">
                  <p className="text-sm font-medium text-ink">{t("account.profile.deleteAccount")}</p>
                  <AlertDialog>
                    <AlertDialogTrigger className="px-6 py-2 rounded-full border border-red-600/30 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                      {t("account.profile.deleteAccount")}
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-canvas border-[#1c1a18]/10 max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-serif font-light text-xl text-ink">
                          {t("account.profile.deleteAccountTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-ink/70">
                          {t("account.profile.deleteAccountConfirm")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="mt-6">
                        <AlertDialogCancel className="border-[#1c1a18]/20 text-ink hover:bg-[#1c1a18]/5">
                          {t("account.settings.cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={isDeleting}
                          className="bg-red-600 text-white hover:bg-red-700 border-0"
                        >
                          {isDeleting ? t("account.profile.deleting") : t("account.profile.deleteAccount")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
                    disabled={!isFormDirty || updateProfileMutation.isPending}
                    className={`px-6 py-2 rounded-full border text-sm font-medium transition-colors ${
                      isFormDirty && !updateProfileMutation.isPending
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

          {activeSidebarTab === "delivery" && (
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

          {activeSidebarTab === "visibility" && (
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
                </div>
              </div>
            </div>
          )}

          {activeSidebarTab === "communication" && (
            <div>
              <h2 className="text-2xl font-serif text-ink font-light tracking-tight mb-8">{t("account.communication.title")}</h2>
              <div className="border-t border-[#1c1a18]/10 pt-6">
                <div className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="text-sm font-medium text-ink mb-1">Email Updates</h3>
                    <p className="text-xs text-ink/60">Receive email updates about your orders and promotions.</p>
                  </div>
                  <button 
                    onClick={() => setEmailUpdates(!emailUpdates)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${emailUpdates ? "bg-[#1c1a18]" : "bg-[#1c1a18]/20"}`}
                  >
                    <div className={`size-4 rounded-full bg-white transition-transform ${emailUpdates ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSidebarTab === "privacy" && (
            <div>
              <h2 className="text-2xl font-serif text-ink font-light tracking-tight mb-8">{t("account.privacy.title")}</h2>
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-[#1c1a18]/10 pb-6">
                  <div>
                    <h3 className="text-sm font-medium text-ink mb-1">{t("account.privacy.personalisedAds")}</h3>
                    <p className="text-xs text-ink/60">Personalised advertising preferences</p>
                  </div>
                  <button 
                    onClick={() => setPrivacySettings(prev => ({ ...prev, personalisedAds: !prev.personalisedAds }))}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${privacySettings.personalisedAds ? "bg-[#1c1a18]" : "bg-[#1c1a18]/20"}`}
                  >
                    <div className={`size-4 rounded-full bg-white transition-transform ${privacySettings.personalisedAds ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between border-b border-[#1c1a18]/10 pb-6">
                  <div>
                    <h3 className="text-sm font-medium text-ink mb-1">Location Data</h3>
                    <p className="text-xs text-ink/60">Manage location data sharing preferences</p>
                  </div>
                  <select 
                    value={locationSharing}
                    onChange={(e) => setLocationSharing(e.target.value)}
                    className="text-xs bg-transparent border border-[#1c1a18]/20 rounded-md px-3 py-2 text-ink focus:outline-none"
                  >
                    <option value="dont_share">Don&apos;t Share</option>
                    <option value="approximate">Approximate Location</option>
                    <option value="precise">Precise Location</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <EditPasswordModal
        isOpen={isEditPasswordOpen}
        onClose={() => setIsEditPasswordOpen(false)}
      />
      <EditEmailModal
        isOpen={isEditEmailOpen}
        onClose={() => setIsEditEmailOpen(false)}
      />
    </section>
  );
}
