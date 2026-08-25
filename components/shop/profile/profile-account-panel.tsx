import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  MapPin,
  Eye,
  Mail,
  Shield,
  PencilLine,
  CalendarDays,
  LayoutDashboard,
  Loader2,
} from "lucide-react";
import { canAccessManagement, getUserRoleNames } from "@/lib/auth/roles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useI18n } from "@/components/providers/i18n-provider";
import { useUpdateProfileMutation, useUploadAvatarMutation } from "@/lib/queries/commerce";
import { resolveImageUrl } from "@/lib/vela-data";
import type { Gender, User, UserAddress } from "@/lib/api/types";
import { formatMemberSince } from "./profile-formatters";
import { ProfileAddressesPanel } from "./profile-addresses-panel";

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
  const uploadAvatarMutation = useUploadAvatarMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditPasswordOpen, setIsEditPasswordOpen] = useState(false);
  const [isEditEmailOpen, setIsEditEmailOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarImageError, setAvatarImageError] = useState(false);

  const [editFormDraft, setEditForm] = useState({
    fullName: "",
    email: "",
    gender: "",
    dob: "",
  });
  const [formTouched, setFormTouched] = useState({
    fullName: false,
    email: false,
    gender: false,
    dob: false,
  });
  const [formModified, setFormModified] = useState({
    fullName: false,
    email: false,
    gender: false,
    dob: false,
  });
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isDobOpen, setIsDobOpen] = useState(false);
  const [profileSaveMessage, setProfileSaveMessage] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);

  const editForm = {
    fullName: formModified.fullName ? editFormDraft.fullName : (user.fullName ?? ""),
    email: user.email ?? "",
    gender: formModified.gender ? editFormDraft.gender : (user.gender ?? ""),
    dob: formModified.dob ? editFormDraft.dob : (user.birthDate ?? ""),
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
    editForm.fullName.trim() !== "" && editForm.gender !== "" && editForm.dob.trim() !== "";

  const getApiErrorMessage = (error: unknown) => {
    const apiError = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return apiError.response?.data?.message ?? apiError.message ?? t("account.profile.saveError");
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";
    setAvatarMessage(null);
    setAvatarError(null);

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setAvatarError(t("account.visibility.avatarTypeError"));
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setAvatarError(t("account.visibility.avatarSizeError"));
      return;
    }

    try {
      await uploadAvatarMutation.mutateAsync(file);
      await checkSession();
      setAvatarImageError(false);
      setAvatarMessage(t("account.visibility.avatarUploadSuccess"));
    } catch (error) {
      setAvatarError(getApiErrorMessage(error) || t("account.visibility.avatarUploadError"));
    }
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

  const router = useRouter();

  const handleDeleteAccount = () => {
    startDeleteTransition(async () => {
      try {
        await deleteAccount();
        router.replace("/");
      } catch (error) {
        console.error("Failed to delete account:", error);
      }
    });
  };

  return (
    <section className="flex flex-col gap-6 text-left">
      <div className="flex items-end justify-between border-b border-[#1c1a18]/10 pb-4">
        <h2 className="font-serif text-2xl font-light tracking-tight text-[#1c1a18] md:text-3xl">
          {t("account.profile.title")}
        </h2>
        <span className="text-xs text-[#55423d]/65">{t("account.member")}</span>
      </div>

      {canAccessManagement(user) && (
        <div className="flex flex-col justify-between gap-4 rounded-md border border-[#1c1a18]/10 bg-[#efe7dc]/40 p-4.5 text-[#1c1a18] shadow-xs sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="grid size-10 flex-shrink-0 place-items-center rounded-full bg-[#1c1a18] text-white">
              <Shield className="size-5 text-[#e2a898]" />
            </div>
            <div className="space-y-0.5 text-left">
              <p className="text-xs font-bold tracking-wider text-[#1c1a18] uppercase">
                {t("account.adminRole", { roles: getUserRoleNames(user).join(", ") }) ||
                  "Quyền Quản Trị Hệ Thống"}
              </p>
              <p className="text-xs text-[#1c1a18]/70">
                Tài khoản của bạn có quyền quản trị. Bạn có thể quay lại Bảng điều khiển Admin bất
                cứ lúc nào.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-sm bg-[#1c1a18] px-4 py-2.5 text-xs font-semibold tracking-wider text-[#f7f4ef] uppercase transition-all hover:bg-[#b5573a] active:scale-[0.97]"
          >
            <LayoutDashboard className="size-4" />
            <span>{t("common.adminDashboard")}</span>
          </Link>
        </div>
      )}

      <div className="mt-2 flex flex-col gap-10 text-left md:flex-row md:gap-16 lg:gap-24">
        {/* Sidebar */}
        <aside className="w-full flex-shrink-0 md:w-64">
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveSidebarTab("account")}
              className={`flex cursor-pointer items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-medium whitespace-nowrap transition-colors ${
                activeSidebarTab === "account"
                  ? "bg-surface-card text-ink"
                  : "text-ink/70 hover:bg-surface-card/50 hover:text-ink"
              }`}
            >
              <UserIcon className="size-4 shrink-0" />
              <span>{t("account.sidebar.account")}</span>
            </button>
            <button
              onClick={() => setActiveSidebarTab("delivery")}
              className={`flex cursor-pointer items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-medium whitespace-nowrap transition-colors ${
                activeSidebarTab === "delivery"
                  ? "bg-surface-card text-ink"
                  : "text-ink/70 hover:bg-surface-card/50 hover:text-ink"
              }`}
            >
              <MapPin className="size-4 shrink-0" />
              <span>{t("account.sidebar.addresses")}</span>
            </button>
            <button
              onClick={() => setActiveSidebarTab("visibility")}
              className={`flex cursor-pointer items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-medium whitespace-nowrap transition-colors ${
                activeSidebarTab === "visibility"
                  ? "bg-surface-card text-ink"
                  : "text-ink/70 hover:bg-surface-card/50 hover:text-ink"
              }`}
            >
              <Eye className="size-4 shrink-0" />
              <span>{t("account.sidebar.visibility")}</span>
            </button>
            <button
              onClick={() => setActiveSidebarTab("communication")}
              className={`flex cursor-pointer items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-medium whitespace-nowrap transition-colors ${
                activeSidebarTab === "communication"
                  ? "bg-surface-card text-ink"
                  : "text-ink/70 hover:bg-surface-card/50 hover:text-ink"
              }`}
            >
              <Mail className="size-4 shrink-0" />
              <span>{t("account.sidebar.communication")}</span>
            </button>
            <button
              onClick={() => setActiveSidebarTab("privacy")}
              className={`flex cursor-pointer items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-medium whitespace-nowrap transition-colors ${
                activeSidebarTab === "privacy"
                  ? "bg-surface-card text-ink"
                  : "text-ink/70 hover:bg-surface-card/50 hover:text-ink"
              }`}
            >
              <Shield className="size-4 shrink-0" />
              <span>{t("account.sidebar.privacy")}</span>
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div className="max-w-xl flex-1">
          {activeSidebarTab === "account" && (
            <div>
              <h2 className="text-ink mb-8 font-serif text-2xl font-light tracking-tight">
                {t("account.sidebar.account")}
              </h2>

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
                        setEditForm((prev) => ({ ...prev, fullName: e.target.value }));
                        setFormModified((prev) => ({ ...prev, fullName: true }));
                        setFormTouched((prev) => ({ ...prev, fullName: false }));
                      }}
                      onBlur={() => setFormTouched((prev) => ({ ...prev, fullName: true }))}
                      className={`peer text-ink w-full rounded-sm border bg-transparent px-4 py-3.5 text-sm placeholder-transparent transition-colors duration-500 ease-out focus:outline-none ${
                        formTouched.fullName && editForm.fullName.trim() === ""
                          ? "border-error focus:border-error"
                          : "focus:border-ink/60 border-[#1c1a18]/20"
                      }`}
                    />
                    <label
                      htmlFor="fullName"
                      className={`bg-canvas absolute -top-2 left-3 cursor-text px-1 text-xs transition-all duration-200 ease-out peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs ${
                        formTouched.fullName && editForm.fullName.trim() === ""
                          ? "text-error peer-focus:text-error"
                          : "text-ink/70 peer-focus:text-ink/70"
                      }`}
                    >
                      {t("account.profile.fullName")}
                    </label>
                  </div>
                  {formTouched.fullName && editForm.fullName.trim() === "" && (
                    <p className="text-error mt-1.5 text-xs transition-opacity duration-500">
                      {t("account.profile.fullNameRequired")}
                    </p>
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
                        setEditForm((prev) => ({ ...prev, email: e.target.value }));
                        setFormModified((prev) => ({ ...prev, email: true }));
                        setFormTouched((prev) => ({ ...prev, email: false }));
                      }}
                      onBlur={() => setFormTouched((prev) => ({ ...prev, email: true }))}
                      className={`peer text-ink w-full rounded-sm border bg-transparent px-4 py-3.5 text-sm placeholder-transparent transition-colors duration-500 ease-out focus:outline-none ${
                        formTouched.email && formModified.email && !emailValidation.success
                          ? "border-error focus:border-error"
                          : "focus:border-ink/60 border-[#1c1a18]/20"
                      }`}
                    />
                    <label
                      htmlFor="email"
                      className={`bg-canvas absolute -top-2 left-3 cursor-text px-1 text-xs transition-all duration-200 ease-out peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs ${
                        formTouched.email && formModified.email && !emailValidation.success
                          ? "text-error peer-focus:text-error"
                          : "text-ink/70 peer-focus:text-ink/70"
                      }`}
                    >
                      {t("account.profile.email")}
                    </label>
                  </div>
                  {formTouched.email && formModified.email && editForm.email.trim() === "" && (
                    <p className="text-error mt-1.5 text-xs transition-opacity duration-500">
                      {t("account.profile.emailRequired")}
                    </p>
                  )}
                  {formTouched.email &&
                    formModified.email &&
                    editForm.email.trim() !== "" &&
                    !emailValidation.success && (
                      <p className="text-error mt-1.5 text-xs transition-opacity duration-500">
                        {t("account.profile.emailInvalid")}
                      </p>
                    )}
                  <div className="mt-1.5 flex items-center justify-between">
                    <p className="text-ink/45 text-xs">{t("account.profile.emailSettingsNote")}</p>
                    <button
                      type="button"
                      onClick={() => setIsEditEmailOpen(true)}
                      className="text-ink hover:text-primary cursor-pointer text-sm font-medium underline underline-offset-4 transition-colors"
                    >
                      {t("account.profile.edit")}
                    </button>
                  </div>
                </div>

                {/* Password block (Readonly) */}
                <div>
                  <p className="text-ink mb-1 text-sm font-medium">
                    {t("account.profile.password")}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-ink text-2xl tracking-widest">................</p>
                    <button
                      type="button"
                      onClick={() => setIsEditPasswordOpen(true)}
                      className="text-ink hover:text-primary cursor-pointer text-sm font-medium underline underline-offset-4 transition-colors"
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
                        setEditForm((prev) => ({ ...prev, gender: val ?? "" }));
                        setFormModified((prev) => ({ ...prev, gender: true }));
                        setFormTouched((prev) => ({ ...prev, gender: false }));
                      }}
                      onOpenChange={(open) => {
                        setIsGenderOpen(open);
                        if (!open) {
                          setFormTouched((prev) => ({ ...prev, gender: true }));
                        }
                      }}
                    >
                      <SelectTrigger
                        id="gender"
                        className={`text-ink flex !h-[52px] !w-full items-center justify-between rounded-sm border bg-transparent px-4 text-sm transition-colors duration-500 ease-out focus:ring-0 focus:outline-none ${
                          formTouched.gender && editForm.gender === ""
                            ? "border-error focus:border-error"
                            : isGenderOpen
                              ? "border-ink/60"
                              : "border-[#1c1a18]/20"
                        }`}
                      >
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent
                        alignItemWithTrigger={false}
                        className="bg-canvas border-hairline rounded-sm shadow-sm"
                      >
                        {genderOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="cursor-pointer"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <label
                      htmlFor="gender"
                      className={`bg-canvas pointer-events-none absolute left-3 px-1 transition-all duration-200 ease-out ${
                        editForm.gender === "" && !isGenderOpen
                          ? "top-[15px] text-sm"
                          : "-top-2 text-xs"
                      } ${
                        formTouched.gender && editForm.gender === "" ? "text-error" : "text-ink/70"
                      }`}
                    >
                      {t("account.profile.gender")}
                    </label>
                  </div>
                  {formTouched.gender && editForm.gender === "" && (
                    <p className="text-error mt-1.5 text-xs transition-opacity duration-500">
                      {t("account.profile.genderRequired")}
                    </p>
                  )}
                </div>

                {/* Date of Birth Input */}
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      id="dob"
                      placeholder=""
                      value={
                        editForm.dob
                          ? formatDate(editForm.dob, locale, {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : ""
                      }
                      readOnly
                      onBlur={() => setFormTouched((prev) => ({ ...prev, dob: true }))}
                      className={`peer text-ink !h-[52px] !w-full cursor-default rounded-sm border bg-transparent px-4 text-sm placeholder-transparent transition-colors duration-500 ease-out focus:outline-none ${
                        formTouched.dob && editForm.dob.trim() === ""
                          ? "border-error focus:border-error"
                          : isDobOpen
                            ? "border-ink/60"
                            : "focus:border-ink/60 border-[#1c1a18]/20"
                      }`}
                    />
                    <Popover open={isDobOpen} onOpenChange={setIsDobOpen}>
                      <PopoverTrigger
                        aria-label={t("account.profile.openCalendar")}
                        className="text-ink/70 hover:text-ink absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-sm p-1.5 transition-colors outline-none hover:bg-[#1c1a18]/5"
                      >
                        <CalendarDays className="size-4" />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={editForm.dob ? new Date(editForm.dob) : undefined}
                          onSelect={(date: Date | undefined) => {
                            if (date) {
                              const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                              setEditForm((prev) => ({ ...prev, dob: formatted }));
                              setFormModified((prev) => ({ ...prev, dob: true }));
                              setFormTouched((prev) => ({ ...prev, dob: false }));
                              setIsDobOpen(false);
                            }
                          }}
                          className="border-hairline rounded-sm shadow-sm"
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                    <label
                      htmlFor="dob"
                      className={`bg-canvas pointer-events-none absolute left-3 px-1 transition-all duration-200 ease-out ${
                        editForm.dob === "" && !isDobOpen ? "top-[15px] text-sm" : "-top-2 text-xs"
                      } ${
                        formTouched.dob && editForm.dob.trim() === "" ? "text-error" : "text-ink/70"
                      }`}
                    >
                      {t("account.profile.birthDate")}
                    </label>
                  </div>
                  {formTouched.dob && editForm.dob.trim() === "" && (
                    <p className="text-error mt-1.5 text-xs transition-opacity duration-500">
                      {t("account.profile.birthDateRequired")}
                    </p>
                  )}
                </div>

                {/* Delete Account */}
                <div className="flex items-center justify-between border-t border-[#1c1a18]/10 pt-8">
                  <p className="text-ink text-sm font-medium">
                    {t("account.profile.deleteAccount")}
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger className="border-error/30 text-error hover:bg-error/10 cursor-pointer rounded-sm border px-5 py-2.5 text-sm font-medium transition-colors">
                      {t("account.profile.deleteAccount")}
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-canvas max-w-md rounded-md border-[#1c1a18]/10">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-ink font-serif text-xl font-light">
                          {t("account.profile.deleteAccountTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-ink/70">
                          {t("account.profile.deleteAccountConfirm")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="mt-6">
                        <AlertDialogCancel className="text-ink rounded-sm border-[#1c1a18]/20 hover:bg-[#1c1a18]/5">
                          {t("account.settings.cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={isDeleting}
                          className="bg-error hover:bg-error/90 rounded-sm border-0 text-white"
                        >
                          {isDeleting
                            ? t("account.profile.deleting")
                            : t("account.profile.deleteAccount")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {profileSaveError && <p className="text-error text-sm">{profileSaveError}</p>}
                {profileSaveMessage && (
                  <p className="text-sm text-emerald-700">{t("account.profile.saveSuccess")}</p>
                )}

                {/* Save Button */}
                <div className="flex justify-end border-t border-[#1c1a18]/10 pt-8">
                  <button
                    onClick={handleSaveProfile}
                    disabled={!isFormDirty || updateProfileMutation.isPending}
                    className={`rounded-sm border px-6 py-2.5 text-sm font-medium transition-colors ${
                      isFormDirty && !updateProfileMutation.isPending
                        ? "cursor-pointer border-[#1c1a18] bg-[#1c1a18] text-white shadow-xs hover:bg-[#1c1a18]/90"
                        : "text-ink/40 cursor-not-allowed border-[#1c1a18]/20 bg-transparent"
                    }`}
                  >
                    {updateProfileMutation.isPending
                      ? t("account.profile.saving")
                      : t("account.profile.save")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSidebarTab === "delivery" && (
            <ProfileAddressesPanel addressesQuery={addressesQuery} />
          )}

          {activeSidebarTab === "visibility" && (
            <div>
              <h2 className="text-ink mb-8 font-serif text-2xl font-light tracking-tight">
                {t("account.visibility.title")}
              </h2>
              <p className="text-ink/70 mb-8 max-w-md text-sm font-light">
                {t("account.visibility.description")}
              </p>

              <div className="mb-12 flex items-center gap-5 text-left md:gap-6">
                <div className="relative flex-shrink-0">
                  <div className="border-hairline text-ink relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border bg-[#efe7dc] font-serif text-2xl font-light shadow-inner md:h-24 md:w-24 md:text-3xl">
                    {user.avatar && !avatarImageError ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resolveImageUrl(user.avatar)}
                        alt={user.fullName || "Avatar"}
                        className="size-full rounded-full object-cover"
                        onError={() => setAvatarImageError(true)}
                      />
                    ) : user.fullName ? (
                      user.fullName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    ) : (
                      "U"
                    )}

                    {uploadAvatarMutation.isPending && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white backdrop-blur-[1px]">
                        <Loader2 className="size-6 animate-spin" />
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadAvatarMutation.isPending}
                    aria-label={t("account.visibility.editAvatar")}
                    className="border-hairline absolute right-0 bottom-0 flex cursor-pointer items-center justify-center rounded-full border bg-white p-1.5 shadow-sm transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <PencilLine className="text-ink size-3.5" />
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  className="sr-only"
                  onChange={handleAvatarFileChange}
                  disabled={uploadAvatarMutation.isPending}
                />

                <div className="flex flex-col justify-center">
                  <h3 className="text-ink mb-1 text-sm font-medium">
                    {t("account.visibility.display")}
                  </h3>
                  <p className="text-ink/60 mb-1.5 text-sm">{user.fullName}</p>
                  <p className="text-ink/50 text-xs font-light">
                    {t("account.visibility.memberSince", {
                      date: formatMemberSince(user.createdAt, locale),
                    })}
                  </p>
                  {avatarMessage && (
                    <p className="mt-1 text-xs font-medium text-emerald-700">{avatarMessage}</p>
                  )}
                  {avatarError && (
                    <p className="text-error mt-1 text-xs font-medium">{avatarError}</p>
                  )}
                </div>
              </div>

              <div className="mb-8 border-t border-[#1c1a18]/10 pt-8">
                <h3 className="text-ink mb-4 text-base font-medium">
                  {t("account.visibility.reviewTitle")}
                </h3>
                <p className="text-ink/70 mb-6 text-sm font-light">
                  {t("account.visibility.reviewDescription")}{" "}
                  <button className="font-semibold underline underline-offset-4">
                    {t("account.visibility.learnMore")}
                  </button>
                </p>
                <div className="flex flex-col gap-4">
                  <label className="group flex cursor-pointer items-center gap-3">
                    <div
                      className={`flex size-5 items-center justify-center rounded-full border transition-colors ${reviewVisibility === "private" ? "border-ink" : "border-ink/30 group-hover:border-ink/60"}`}
                    >
                      {reviewVisibility === "private" && (
                        <div className="bg-ink size-2.5 rounded-full" />
                      )}
                    </div>
                    <span className="text-ink text-sm">{t("account.visibility.private")}</span>
                    <input
                      type="radio"
                      className="hidden"
                      checked={reviewVisibility === "private"}
                      onChange={() => setReviewVisibility("private")}
                    />
                  </label>
                  <label className="group flex cursor-pointer items-center gap-3">
                    <div
                      className={`flex size-5 items-center justify-center rounded-full border transition-colors ${reviewVisibility === "social" ? "border-ink" : "border-ink/30 group-hover:border-ink/60"}`}
                    >
                      {reviewVisibility === "social" && (
                        <div className="bg-ink size-2.5 rounded-full" />
                      )}
                    </div>
                    <span className="text-ink text-sm">{t("account.visibility.social")}</span>
                    <input
                      type="radio"
                      className="hidden"
                      checked={reviewVisibility === "social"}
                      onChange={() => setReviewVisibility("social")}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSidebarTab === "communication" && (
            <div>
              <h2 className="text-ink mb-8 font-serif text-2xl font-light tracking-tight">
                {t("account.communication.title")}
              </h2>
              <div className="border-t border-[#1c1a18]/10 pt-6">
                <div className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="text-ink mb-1 text-sm font-medium">Email Updates</h3>
                    <p className="text-ink/60 text-xs">
                      Receive email updates about your orders and promotions.
                    </p>
                  </div>
                  <button
                    onClick={() => setEmailUpdates(!emailUpdates)}
                    className={`relative h-6 w-12 cursor-pointer rounded-full p-1 transition-colors ${emailUpdates ? "bg-[#1c1a18]" : "bg-[#1c1a18]/20"}`}
                  >
                    <div
                      className={`size-4 rounded-full bg-white transition-transform ${emailUpdates ? "translate-x-6" : "translate-x-0"}`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSidebarTab === "privacy" && (
            <div>
              <h2 className="text-ink mb-8 font-serif text-2xl font-light tracking-tight">
                {t("account.privacy.title")}
              </h2>
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-[#1c1a18]/10 pb-6">
                  <div>
                    <h3 className="text-ink mb-1 text-sm font-medium">
                      {t("account.privacy.personalisedAds")}
                    </h3>
                    <p className="text-ink/60 text-xs">Personalised advertising preferences</p>
                  </div>
                  <button
                    onClick={() =>
                      setPrivacySettings((prev) => ({
                        ...prev,
                        personalisedAds: !prev.personalisedAds,
                      }))
                    }
                    className={`relative h-6 w-12 cursor-pointer rounded-full p-1 transition-colors ${privacySettings.personalisedAds ? "bg-[#1c1a18]" : "bg-[#1c1a18]/20"}`}
                  >
                    <div
                      className={`size-4 rounded-full bg-white transition-transform ${privacySettings.personalisedAds ? "translate-x-6" : "translate-x-0"}`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between border-b border-[#1c1a18]/10 pb-6">
                  <div>
                    <h3 className="text-ink mb-1 text-sm font-medium">Location Data</h3>
                    <p className="text-ink/60 text-xs">Manage location data sharing preferences</p>
                  </div>
                  <select
                    value={locationSharing}
                    onChange={(e) => setLocationSharing(e.target.value)}
                    className="text-ink rounded-md border border-[#1c1a18]/20 bg-transparent px-3 py-2 text-xs focus:outline-none"
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

      <EditPasswordModal isOpen={isEditPasswordOpen} onClose={() => setIsEditPasswordOpen(false)} />
      <EditEmailModal isOpen={isEditEmailOpen} onClose={() => setIsEditEmailOpen(false)} />
    </section>
  );
}
