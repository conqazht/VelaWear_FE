"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, PlusCircle, LockKeyhole, User, MapPin, ChevronDown, X, Check, Heart, Eye, Mail, Shield, PencilLine, CalendarDays } from "lucide-react";

import { FashionImage } from "@/components/shop/fashion-image";
import { ProductCard } from "@/components/shop/product-card";
import { useFavorites } from "@/components/shop/favorites-provider";
import { useCart } from "@/components/shop/cart-provider";
import { useNotification } from "@/components/shop/notification-provider";
import { useAuth } from "@/components/auth/auth-provider";
import apiClient from "@/lib/api-client";
import { money } from "@/lib/vela-data";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface Order {
  id: number;
  userId: number;
  userFullName: string;
  userEmail: string;
  orderCode: string;
  status: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export default function MemberProfile() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [activeSubTab, setActiveSubTab] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && ["profile", "orders", "favourites", "settings"].includes(tab)) {
        return tab;
      }
    }
    return "profile";
  });
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

  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    gender: "",
    dob: "2005-09-07"
  });
  const [formTouched, setFormTouched] = useState({ fullName: false, email: false, gender: false, dob: false });
  const [formModified, setFormModified] = useState({ fullName: false, email: false, gender: false, dob: false });
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isDobOpen, setIsDobOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setEditForm({
        fullName: user.fullName || "",
        email: user.email || "",
        gender: "Female",
        dob: "2005-09-07"
      });
    }
  }, [user]);

  const isFormDirty = user ? (
    editForm.fullName !== (user.fullName || "") || 
    editForm.email !== (user.email || "") || 
    editForm.gender !== "Female" ||
    editForm.dob !== "2005-09-07"
  ) : false;
  const carouselContainerRef = useRef<HTMLDivElement>(null);
  const { favorites, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { showAddedToBag } = useNotification();

  // Mock settings state
  const [reviewVisibility, setReviewVisibility] = useState("social");
  const [locationSharing, setLocationSharing] = useState("dont_share");
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    personalisedAds: true,
    profileAds: true,
    workoutData: true
  });

  // Load user order history
  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    async function loadOrders() {
      setLoadingOrders(true);
      try {
        const response = await apiClient.get(`/orders/user/${userId}?size=100`);
        if (response.data?.data?.result) {
          setOrders(response.data.data.result);
        }
      } catch (err) {
        console.error("Failed to load user orders", err);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadOrders();
  }, [user]);

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselContainerRef.current) {
      const scrollAmount = 420; // card width + gap
      carouselContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const subTabs = [
    { id: "profile", label: "Profile" },
    { id: "orders", label: "Orders" },
    { id: "favourites", label: "Favourites" },
    { id: "coupons", label: "Coupons" },
    { id: "reviews", label: "Reviews" },
  ];



  const recommendedProducts = [
    {
      id: "rec-1",
      name: "The Structure Blazer",
      category: "Women's Premium Outerwear",
      price: "$380.00",
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxzCLSuFXV2BaU_SI-C_UwGVCKl_C5oG7VQ2x4d2AYRhiEPCQc038hB1fHURu_8AyqSm8ehgRf7EhvZwpFfrGcM0Pu4SQy9V3NSP7j2SSYp2l-jEoj_TfgJ3OYKBuscMy758AcU-4C3xzqrcQnxKPi8SR5Bw_wDhtEPhm_MXuY-q8xJxzKaAo0qnerVZ42QkfLEYBKqmTfqi8Pqum4CI0uDru7lreW5oGv4YKS4vMH5V09P233xozoG0Es9dZjx95QfW1RPBxZ_G1U",
    },
    {
      id: "rec-2",
      name: "Essential Ribbed Knit",
      category: "Women's Lifestyle Dress",
      price: "$195.00",
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuGuT1MGV0s-GET9OLrNCIAqJ5bWclXZ2FF3tmfnLh7RDnUfaVGgI7VL3cPfVFuFA0sXCB73hKuUJHIebB3g_Iyo65Ohk6m4Do4dklPwbCsO55eNH4YiE_N8ou-uUCsxs4J4IzyCtMqwhStDk-QLTEeG3XH26_XEPVbI2fuospCTfuH6jabINPv4AEw0lhTd7Jl7PRs9qYKjw66nx8jTmwnzIleXOpvwEPrOrdnZ1Z3ZXXn2xqBTNeppJasQj3Iufsw0OXp39xBzZEL",
    },
    {
      id: "rec-3",
      name: "Artisan Chelsea Boot",
      category: "Men's Premium Footwear",
      price: "$450.00",
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuB8BUrYe4sh5K3HlJx6vFaK4p3MbI90KdEks40-fb3Srz0p8yWIRP6VhInTRF7dF-gVHjOF3dJZm-nOZ-exwrim-sQ5h1tu85BK4_TrwmsVSw9O1s_5QUyQ4FpyJ4gurcZTJumdU5iycxYZ1NROVRs0lFHDWMWPJb9boNfQEvvLJILCLfrydP5rT1RY-kVazb5FBuZZm6NqsSW-7tXyJyTzhn8oahWVu7dLiELgH4kdSx6aR5yXI1NnB1_58sWm87F3eCHEk2DGBDa4",
    },
  ];

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto w-full max-w-[1800px] px-6 py-24 min-h-[70vh] flex flex-col justify-center items-center">
        <Card className="mx-auto flex max-w-md flex-col items-center rounded-sm border-[#1c1a18]/5 bg-[#efe7dc] p-8 py-10 text-center shadow-lg">
          <LockKeyhole className="mb-6 size-12 text-[#b85a3c]" />
          <h2 className="mb-4 font-serif text-2xl font-light text-[#1c1a18]">
            Đăng nhập để xem hồ sơ
          </h2>
          <p className="mb-8 text-xs leading-relaxed text-[#1c1a18]/65">
            Bạn cần đăng nhập tài khoản Vela Member để xem lịch sử đơn hàng, sản phẩm yêu thích và cài đặt tài khoản.
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

  return (
    <div className="bg-canvas text-ink min-h-screen flex flex-col pt-[104px] md:pt-[120px]">
      {/* Sub-Navigation */}
      <div className="w-full select-none overflow-x-auto no-scrollbar">
        <div className="w-full min-w-max flex justify-center gap-8 md:gap-12 px-6 md:px-16 py-4 mx-auto">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "settings") {
                  router.push("/profile/settings");
                } else {
                  setActiveSubTab(tab.id);
                }
              }}
              className={`relative text-sm font-medium tracking-[0.05em] transition-colors cursor-pointer pb-0.5 group ${
                tab.id === activeSubTab
                  ? "text-[#b5573a]"
                  : "text-[#55423d]/60 hover:text-ink"
              }`}
            >
              {tab.label}
              <span 
                className={`absolute bottom-[-1px] left-[10%] h-[1.5px] w-[80%] bg-[#b5573a] transition-transform duration-300 ease-out origin-center ${
                  tab.id === activeSubTab ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`} 
              />
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow w-full px-6 md:px-16 py-10 md:py-16 flex flex-col gap-10">

        {/* PROFILE TAB CONTENT */}
        {activeSubTab === "profile" && (
          <>
            {/* Redesigned Profile Section */}
            <section className="flex flex-col md:flex-row gap-12 md:gap-40 lg:gap-56 mt-2 text-left">
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
                    Account Details
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
                    Delivery Addresses
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
                    Profile Visibility
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
                    Communication
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
                    Privacy
                  </button>
                </nav>
              </aside>

              {/* Content */}
              <div className="flex-1 max-w-xl">
                {activeProfileSidebarTab === "account" && (
                  <div>
                    <h2 className="text-2xl font-serif text-ink font-light tracking-tight mb-8">Account Details</h2>
                    
                    <div className="flex flex-col gap-8">
                      {/* Name Input */}
                      <div>
                        <div className="relative">
                          <input 
                            type="text"
                            id="fullName"
                            placeholder="Full Name*"
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
                            className={`absolute left-3 -top-2 bg-canvas px-1 text-xs transition-all duration-300 ease-out peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs cursor-text ${
                              formTouched.fullName && formModified.fullName && editForm.fullName.trim() === ""
                                ? "text-red-600 peer-focus:text-red-600"
                                : "text-ink/70 peer-focus:text-ink/70"
                            }`}
                          >
                            Full Name*
                          </label>
                        </div>
                        {formTouched.fullName && formModified.fullName && editForm.fullName.trim() === "" && (
                          <p className="text-red-600 text-xs mt-1.5 transition-opacity duration-500">Please enter your full name.</p>
                        )}
                      </div>

                      {/* Email Input */}
                      <div>
                        <div className="relative">
                          <input 
                            type="email"
                            id="email"
                            placeholder="Email*"
                            value={editForm.email}
                            onChange={(e) => {
                              setEditForm(prev => ({ ...prev, email: e.target.value }));
                              setFormModified(prev => ({...prev, email: true}));
                              setFormTouched(prev => ({...prev, email: false}));
                            }}
                            onBlur={() => setFormTouched(prev => ({...prev, email: true}))}
                            className={`peer w-full px-4 py-3.5 rounded-lg border bg-transparent text-sm text-ink placeholder-transparent focus:outline-none transition-colors duration-500 ease-out ${
                              formTouched.email && formModified.email && (editForm.email.trim() === "" || !editForm.email.includes("@"))
                                ? "border-red-600 focus:border-red-600"
                                : "border-[#1c1a18]/20 focus:border-ink/60"
                            }`}
                          />
                          <label 
                            htmlFor="email"
                            className={`absolute left-3 -top-2 bg-canvas px-1 text-xs transition-all duration-300 ease-out peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs cursor-text ${
                              formTouched.email && formModified.email && (editForm.email.trim() === "" || !editForm.email.includes("@"))
                                ? "text-red-600 peer-focus:text-red-600"
                                : "text-ink/70 peer-focus:text-ink/70"
                            }`}
                          >
                            Email*
                          </label>
                        </div>
                        {formTouched.email && formModified.email && editForm.email.trim() === "" && (
                          <p className="text-red-600 text-xs mt-1.5 transition-opacity duration-500">Please enter your email.</p>
                        )}
                        {formTouched.email && formModified.email && editForm.email.trim() !== "" && !editForm.email.includes("@") && (
                          <p className="text-red-600 text-xs mt-1.5 transition-opacity duration-500">Please enter a valid email address.</p>
                        )}
                      </div>
                      
                      {/* Password block (Readonly) */}
                      <div>
                        <p className="text-sm font-medium text-ink mb-1">Password</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-2xl tracking-widest text-ink">................</p>
                          <button 
                            onClick={() => setIsEditPasswordOpen(true)}
                            className="text-sm font-medium text-ink underline underline-offset-4 hover:text-primary transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                      
                      {/* Gender Input */}
                      <div>
                        <div className="relative">
                          <Select
                            value={editForm.gender}
                            onValueChange={(val) => {
                              setEditForm(prev => ({ ...prev, gender: val }));
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
                              <SelectItem value="Male" className="cursor-pointer">Male</SelectItem>
                              <SelectItem value="Female" className="cursor-pointer">Female</SelectItem>
                              <SelectItem value="Other" className="cursor-pointer">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <label 
                            htmlFor="gender"
                            className={`absolute left-3 transition-all duration-300 ease-out pointer-events-none bg-canvas px-1 ${
                              editForm.gender === "" && !isGenderOpen
                                ? "top-[15px] text-sm" 
                                : "-top-2 text-xs"
                            } ${
                              formTouched.gender && formModified.gender && editForm.gender === ""
                                ? "text-red-600"
                                : "text-ink/70"
                            }`}
                          >
                            Gender*
                          </label>
                        </div>
                        {formTouched.gender && formModified.gender && editForm.gender === "" && (
                          <p className="text-red-600 text-xs mt-1.5 transition-opacity duration-500">Please select your gender.</p>
                        )}
                      </div>
                      
                      {/* Date of Birth Input */}
                      <div>
                        <div className="relative">
                          <input 
                            type="text"
                            id="dob"
                            placeholder=""
                            value={editForm.dob ? format(new Date(editForm.dob), "dd/MM/yyyy") : ""}
                            readOnly
                            onBlur={() => setFormTouched(prev => ({...prev, dob: true}))}
                            className={`peer !w-full !h-[52px] px-4 rounded-lg border bg-transparent text-sm text-ink placeholder-transparent focus:outline-none transition-colors duration-500 ease-out cursor-default ${
                              formTouched.dob && formModified.dob && editForm.dob.trim() === ""
                                ? "border-red-600 focus:border-red-600"
                                : (isDobOpen ? "border-ink/60" : "border-[#1c1a18]/20 focus:border-ink/60")
                            }`}
                          />
                          <Popover open={isDobOpen} onOpenChange={setIsDobOpen}>
                            <PopoverTrigger asChild>
                              <button 
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-[#1c1a18]/5 rounded-md transition-colors cursor-pointer text-ink/70 hover:text-ink outline-none"
                              >
                                <CalendarDays className="size-4" />
                              </button>
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
                                fromYear={1900}
                                toYear={new Date().getFullYear()}
                              />
                            </PopoverContent>
                          </Popover>
                          <label 
                            htmlFor="dob"
                            className={`absolute left-3 transition-all duration-300 ease-out pointer-events-none bg-canvas px-1 ${
                              editForm.dob === "" && !isDobOpen
                                ? "top-[15px] text-sm" 
                                : "-top-2 text-xs"
                            } ${
                              formTouched.dob && formModified.dob && editForm.dob.trim() === ""
                                ? "text-red-600"
                                : "text-ink/70"
                            }`}
                          >
                            Date of Birth*
                          </label>
                        </div>
                        {formTouched.dob && formModified.dob && editForm.dob.trim() === "" && (
                          <p className="text-red-600 text-xs mt-1.5 transition-opacity duration-500">Please enter your date of birth.</p>
                        )}
                      </div>
                      
                      {/* Delete Account */}
                      <div className="flex justify-between items-center border-t border-[#1c1a18]/10 pt-8">
                        <p className="text-sm font-medium text-ink">Delete Account</p>
                        <button className="px-6 py-2 rounded-full border border-[#1c1a18]/30 text-sm font-medium text-ink hover:border-[#1c1a18] transition-colors cursor-pointer">
                          Delete
                        </button>
                      </div>
                      
                      {/* Save Button */}
                      <div className="flex justify-end border-t border-[#1c1a18]/10 pt-8">
                        <button 
                          disabled={!isFormDirty}
                          className={`px-6 py-2 rounded-full border text-sm font-medium transition-colors ${
                            isFormDirty
                              ? "bg-[#1c1a18] text-white border-[#1c1a18] hover:bg-[#1c1a18]/90 cursor-pointer"
                              : "border-[#1c1a18]/20 text-ink/40 bg-transparent cursor-not-allowed"
                          }`}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeProfileSidebarTab === "delivery" && (
                  <div>
                    <h2 className="text-2xl font-serif text-ink font-light tracking-tight mb-8">Delivery Addresses</h2>
                    <div className="py-16 text-center flex flex-col items-center gap-6 bg-surface-card/30 border border-[#1c1a18]/15 rounded-md">
                      <p className="text-sm text-ink/70 font-light max-w-md">
                        Bạn chưa có địa chỉ giao hàng nào.
                      </p>
                      <button className="inline-flex py-3.5 px-10 rounded-sm border border-[#1c1a18] text-xs font-semibold uppercase tracking-widest text-[#1c1a18] hover:bg-[#1c1a18] hover:text-white transition-colors cursor-pointer">
                        Thêm địa chỉ mới
                      </button>
                    </div>
                  </div>
                )}
                
                {activeProfileSidebarTab === "visibility" && (
                  <div>
                    <h2 className="text-2xl font-serif text-ink font-light tracking-tight mb-8">Profile Visibility</h2>
                    <p className="text-sm text-ink/70 font-light mb-8 max-w-md">
                      Your Vela Wear profile represents you on product reviews and across the Vela family of apps.
                    </p>
                    
                    <div className="flex items-center gap-5 md:gap-6 text-left mb-12">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#efe7dc] border border-hairline flex items-center justify-center text-ink text-2xl md:text-3xl font-serif font-light shadow-inner flex-shrink-0 relative">
                        {user.fullName ? user.fullName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "U"}
                        <button className="absolute bottom-0 right-0 bg-white border border-hairline rounded-full p-1.5 shadow-sm hover:scale-105 transition-transform flex items-center justify-center">
                          <PencilLine className="size-3.5 text-ink" />
                        </button>
                      </div>
                      <div className="flex flex-col justify-center">
                        <h3 className="text-sm font-medium text-ink mb-1">Profile Display</h3>
                        <p className="text-sm text-ink/60 mb-1.5">{user.fullName}</p>
                        <p className="text-xs text-ink/50 font-light">
                          Vela Member Since {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "June 2026"}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-[#1c1a18]/10 pt-8 mb-8">
                      <h3 className="text-base font-medium text-ink mb-4">Product Review Visibility</h3>
                      <p className="text-sm text-ink/70 font-light mb-6">
                        Choose how you will appear on any Vela product reviews you complete. Changing these settings will also affect your visibility for connecting with friends. <button className="font-semibold underline underline-offset-4">Learn More</button>
                      </p>
                      <div className="flex flex-col gap-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className={`size-5 rounded-full border flex items-center justify-center transition-colors ${reviewVisibility === "private" ? "border-ink" : "border-ink/30 group-hover:border-ink/60"}`}>
                            {reviewVisibility === "private" && <div className="size-2.5 bg-ink rounded-full" />}
                          </div>
                          <span className="text-sm text-ink">Private: Profile visible to only you</span>
                          <input type="radio" className="hidden" checked={reviewVisibility === "private"} onChange={() => setReviewVisibility("private")} />
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className={`size-5 rounded-full border flex items-center justify-center transition-colors ${reviewVisibility === "social" ? "border-ink" : "border-ink/30 group-hover:border-ink/60"}`}>
                            {reviewVisibility === "social" && <div className="size-2.5 bg-ink rounded-full" />}
                          </div>
                          <span className="text-sm text-ink">Social: Profile visible to friends</span>
                          <input type="radio" className="hidden" checked={reviewVisibility === "social"} onChange={() => setReviewVisibility("social")} />
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className={`size-5 rounded-full border flex items-center justify-center transition-colors ${reviewVisibility === "public" ? "border-ink" : "border-ink/30 group-hover:border-ink/60"}`}>
                            {reviewVisibility === "public" && <div className="size-2.5 bg-ink rounded-full" />}
                          </div>
                          <span className="text-sm text-ink">Public: Everyone can view profile</span>
                          <input type="radio" className="hidden" checked={reviewVisibility === "public"} onChange={() => setReviewVisibility("public")} />
                        </label>
                      </div>
                    </div>

                    <div className="pt-2 mb-8">
                      <h3 className="text-base font-medium text-ink mb-4">Location Sharing</h3>
                      <div className="flex flex-col gap-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className={`size-5 rounded-full border flex items-center justify-center transition-colors ${locationSharing === "friends" ? "border-ink" : "border-ink/30 group-hover:border-ink/60"}`}>
                            {locationSharing === "friends" && <div className="size-2.5 bg-ink rounded-full" />}
                          </div>
                          <span className="text-sm text-ink">Share my location with friends only</span>
                          <input type="radio" className="hidden" checked={locationSharing === "friends"} onChange={() => setLocationSharing("friends")} />
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className={`size-5 rounded-full border flex items-center justify-center transition-colors ${locationSharing === "dont_share" ? "border-ink" : "border-ink/30 group-hover:border-ink/60"}`}>
                            {locationSharing === "dont_share" && <div className="size-2.5 bg-ink rounded-full" />}
                          </div>
                          <span className="text-sm text-ink">Don't share my location</span>
                          <input type="radio" className="hidden" checked={locationSharing === "dont_share"} onChange={() => setLocationSharing("dont_share")} />
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button className="px-8 py-2.5 rounded-full bg-ink text-sm font-medium text-white hover:bg-[#b85a3c] transition-colors">
                        Save
                      </button>
                    </div>
                  </div>
                )}

                {activeProfileSidebarTab === "communication" && (
                  <div>
                    <h2 className="text-2xl font-serif text-ink font-light tracking-tight mb-8">Communication Preferences</h2>
                    
                    <div className="mb-8">
                      <h3 className="text-base font-medium text-ink mb-3">General Communication</h3>
                      <p className="text-sm text-ink/70 font-light mb-6">
                        Get updates on products, offers and your Member benefits.
                      </p>
                      
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`size-5 rounded-sm border flex items-center justify-center transition-colors ${emailUpdates ? "border-ink bg-ink" : "border-ink/30 group-hover:border-ink/60"}`}>
                          {emailUpdates && <Check className="size-3.5 text-white" />}
                        </div>
                        <span className="text-sm text-ink">Yes, send me emails.</span>
                        <input type="checkbox" className="hidden" checked={emailUpdates} onChange={() => setEmailUpdates(!emailUpdates)} />
                      </label>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button className="px-8 py-2.5 rounded-full bg-ink text-sm font-medium text-white hover:bg-[#b85a3c] transition-colors">
                        Save
                      </button>
                    </div>
                  </div>
                )}

                {activeProfileSidebarTab === "privacy" && (
                  <div>
                    <h2 className="text-2xl font-serif text-ink font-light tracking-tight mb-8">Privacy</h2>
                    
                    <p className="text-sm text-ink/70 font-light mb-4 max-w-lg">
                      We use your data to serve you relevant ads and measure how well they perform. This includes data about how you use our site and apps. You can control how your data is used for advertising by adjusting your privacy settings below.
                    </p>
                    <p className="text-sm text-ink/70 font-light mb-8">
                      For more information, see our Privacy Policy. <button className="font-medium underline underline-offset-4 text-ink">Vela Privacy Policy</button>
                    </p>
                    
                    <div className="border-t border-[#1c1a18]/10 pt-6 mb-6">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`mt-0.5 size-5 flex-shrink-0 rounded-sm border flex items-center justify-center transition-colors ${privacySettings.personalisedAds ? "border-ink bg-ink" : "border-ink/30 group-hover:border-ink/60"}`}>
                          {privacySettings.personalisedAds && <Check className="size-3.5 text-white" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-ink mb-1.5">Personalised advertising</span>
                          <span className="text-sm text-ink/60 font-light mb-2">Allows sharing of data about how you use our site and apps with advertising partners.</span>
                          <button className="text-sm font-medium underline underline-offset-4 text-ink/70 hover:text-ink text-left w-fit">Learn more about personalised advertising</button>
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
                          <span className="text-sm font-medium text-ink mb-1.5">Profile-based personalised advertising</span>
                          <span className="text-sm text-ink/60 font-light mb-2">Allows sharing of your email address and phone number with advertising partners to personalise advertising based on your interests.</span>
                          <button className="text-sm font-medium underline underline-offset-4 text-ink/70 hover:text-ink text-left w-fit">Learn more about profile-based advertising</button>
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
                          <span className="text-sm font-medium text-ink mb-1.5">Use workout data</span>
                          <span className="text-sm text-ink/60 font-light mb-2">Use my workout data to give me adaptive training plans, personalised product recommendations and special event invitations.</span>
                        </div>
                        <input type="checkbox" className="hidden" checked={privacySettings.workoutData} onChange={() => setPrivacySettings(prev => ({...prev, workoutData: !prev.workoutData}))} />
                      </label>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button className="px-8 py-2.5 rounded-full bg-ink text-sm font-medium text-white hover:bg-[#b85a3c] transition-colors">
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>


          </>
        )}

        {/* ORDERS TAB CONTENT */}
        {activeSubTab === "orders" && (
          <section className="flex flex-col gap-6 text-left">
            <div className="border-b border-hairline pb-4 flex justify-between items-end">
              <h2 className="font-serif text-2xl md:text-3xl text-[#1c1a18] font-light tracking-tight">
                Order History
              </h2>
              <span className="text-xs text-[#55423d]/65">
                {orders.length} {orders.length === 1 ? "order" : "orders"} placed
              </span>
            </div>
            
            {loadingOrders ? (
              <div className="py-8 text-center text-xs uppercase tracking-widest text-[#1c1a18]/45">
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center select-none bg-surface-card/10 border border-hairline/20 rounded-sm">
                <p className="text-sm text-[#1c1a18]/50 mb-6">Bạn chưa thực hiện đơn đặt hàng nào.</p>
                <Link
                  href="/collection"
                  className="inline-flex items-center rounded-sm bg-[#1c1a18] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#b85a3c] transition-colors"
                >
                  Mua sắm ngay
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {orders.map((order) => {
                  const statusColors: Record<string, string> = {
                    DELIVERED: "bg-emerald-100 text-emerald-800",
                    PENDING: "bg-yellow-100 text-yellow-800",
                    CANCELLED: "bg-red-100 text-red-800",
                  };
                  const statusBadge = statusColors[order.status] || "bg-blue-100 text-blue-800";

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
                          <h3 className="font-sans text-sm font-semibold text-ink">Đơn hàng {order.orderCode}</h3>
                          <p className="text-xs text-[#55423d]/75 mt-0.5">
                            Người nhận: {order.receiverName} • SĐT: {order.receiverPhone}
                          </p>
                          <p className="text-xs text-[#55423d]/75">
                            Địa chỉ: {order.receiverAddress}
                          </p>
                          <p className="text-xs text-[#55423d]/50 mt-1">
                            Đặt ngày {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col justify-between md:justify-center md:items-end gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-hairline/40">
                        <div className="text-sm font-bold text-ink">{money(order.finalAmount || order.subtotal)}</div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${statusBadge}`}>
                          {order.status}
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
            <div className="border-b border-hairline pb-4">
              <h2 className="font-serif text-2xl md:text-3xl text-ink font-light tracking-tight">
                Your Favourites
              </h2>
            </div>
            {favorites.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center gap-6">
                <p className="text-sm text-on-surface-variant/80 font-light max-w-md">
                  Danh sách yêu thích của bạn đang trống. Hãy khám phá các sản phẩm tuyệt vời của Vela Wear để thêm vào danh sách yêu thích.
                </p>
                <Link
                  href="/collection"
                  className="inline-flex bg-primary-container text-on-primary text-xs font-semibold uppercase tracking-widest py-3.5 px-8 hover:bg-[#964025] transition-colors duration-200 rounded-sm shadow-sm"
                >
                  Khám phá Collections
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
                          showAddedToBag(product, product.sizes?.[0] || "M", product.colors?.[0] || "Default");
                        }}
                        className="w-full py-3 rounded-sm border border-[#1c1a18] text-xs font-semibold uppercase tracking-widest text-[#1c1a18] hover:bg-[#1c1a18] hover:text-white transition-colors"
                      >
                        Add to Bag
                      </button>
                    }
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* COUPONS TAB CONTENT */}
        {activeSubTab === "coupons" && (
          <section className="flex flex-col gap-6 text-left">
            <div className="border-b border-hairline pb-4">
              <h2 className="font-serif text-2xl md:text-3xl text-ink font-light tracking-tight">
                Your Coupons
              </h2>
            </div>
            <div className="py-16 text-center flex flex-col items-center gap-6 bg-surface-card/10 border border-hairline/20 rounded-sm">
              <p className="text-sm text-on-surface-variant/80 font-light max-w-md">
                Bạn chưa có mã giảm giá nào.
              </p>
            </div>
          </section>
        )}

        {/* REVIEWS TAB CONTENT */}
        {activeSubTab === "reviews" && (
          <section className="flex flex-col gap-6 text-left">
            <div className="border-b border-hairline pb-4">
              <h2 className="font-serif text-2xl md:text-3xl text-ink font-light tracking-tight">
                Your Reviews
              </h2>
            </div>
            <div className="py-16 text-center flex flex-col items-center gap-6 bg-surface-card/10 border border-hairline/20 rounded-sm">
              <p className="text-sm text-on-surface-variant/80 font-light max-w-md">
                Bạn chưa có đánh giá nào.
              </p>
            </div>
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
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsEditPasswordOpen(false)}
                className="absolute top-6 right-6 p-2 bg-[#1c1a18]/5 rounded-full hover:bg-[#1c1a18]/10 transition-colors cursor-pointer"
              >
                <X className="size-5 text-ink" />
              </button>

              <h2 className="text-2xl font-serif font-light text-ink tracking-tight mb-8">Edit Password</h2>

              <div className="flex flex-col gap-6">
                {/* Current Password */}
                <div>
                  <div className="relative">
                    <input 
                      type="password"
                      id="currentPassword"
                      placeholder="Current Password*"
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
                      Current Password*
                    </label>
                  </div>
                  {passwordTouched.current && passwordModified.current && passwordForm.currentPassword.length === 0 && (
                    <p className="text-red-600 text-xs mt-1.5 transition-opacity duration-500">Please enter your current password.</p>
                  )}
                </div>
                
                {/* New Password */}
                <div>
                  <div className="relative">
                    <input 
                      type="password"
                      id="newPassword"
                      placeholder="New Password*"
                      value={passwordForm.newPassword}
                      onChange={(e) => {
                        setPasswordForm(prev => ({...prev, newPassword: e.target.value}));
                        setPasswordModified(prev => ({...prev, new: true}));
                        setPasswordTouched(prev => ({...prev, new: false}));
                      }}
                      onBlur={() => setPasswordTouched(prev => ({...prev, new: true}))}
                      className={`peer w-full px-4 py-3.5 rounded-lg border bg-transparent text-sm text-ink placeholder-transparent focus:outline-none transition-colors duration-500 ease-out ${
                        passwordTouched.new && passwordModified.new && passwordForm.newPassword.length < 8
                          ? "border-red-600 focus:border-red-600"
                          : "border-[#1c1a18]/20 focus:border-ink/60"
                      }`}
                    />
                    <label 
                      htmlFor="newPassword"
                      className={`absolute left-3 -top-2 bg-canvas px-1 text-xs transition-all duration-300 ease-out peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs cursor-text ${
                        passwordTouched.new && passwordModified.new && passwordForm.newPassword.length < 8
                          ? "text-red-600 peer-focus:text-red-600"
                          : "text-ink/70 peer-focus:text-ink/70"
                      }`}
                    >
                      New Password*
                    </label>
                  </div>
                  {passwordTouched.new && passwordModified.new && passwordForm.newPassword.length > 0 && passwordForm.newPassword.length < 8 && (
                    <p className="text-red-600 text-xs mt-1.5 transition-opacity duration-500">Password must be at least 8 characters.</p>
                  )}
                  {passwordTouched.new && passwordModified.new && passwordForm.newPassword.length === 0 && (
                    <p className="text-red-600 text-xs mt-1.5 transition-opacity duration-500">Please enter a new password.</p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <div className="relative">
                    <input 
                      type="password"
                      id="confirmPassword"
                      placeholder="Confirm New Password*"
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
                      Confirm New Password*
                    </label>
                  </div>
                  {passwordTouched.confirm && passwordModified.confirm && passwordForm.confirmPassword.length > 0 && passwordForm.confirmPassword !== passwordForm.newPassword && (
                    <p className="text-red-600 text-xs mt-1.5 transition-opacity duration-300">Passwords do not match.</p>
                  )}
                  {passwordTouched.confirm && passwordModified.confirm && passwordForm.confirmPassword.length === 0 && (
                    <p className="text-red-600 text-xs mt-1.5 transition-opacity duration-300">Please confirm your new password.</p>
                  )}
                </div>
              </div>

              <div className="mt-8 mb-12 pl-2">
                <p className="text-ink/70 text-sm mb-2">Password requirements:</p>
                <div className={`flex items-center gap-2 text-sm ${passwordForm.newPassword.length >= 8 ? "text-green-700" : "text-ink/70"}`}>
                  {passwordForm.newPassword.length >= 8 ? <Check className="size-4" /> : <X className="size-4" />}
                  <span>Minimum of 8 characters</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  disabled={passwordForm.currentPassword.length === 0 || passwordForm.newPassword.length < 8 || passwordForm.newPassword !== passwordForm.confirmPassword}
                  className={`px-8 py-2.5 rounded-full border text-sm font-medium transition-colors ${
                    passwordForm.currentPassword.length > 0 && passwordForm.newPassword.length >= 8 && passwordForm.newPassword === passwordForm.confirmPassword
                      ? "bg-[#1c1a18] text-white border-[#1c1a18] hover:bg-[#1c1a18]/90 cursor-pointer"
                      : "border-[#1c1a18]/20 text-ink/40 bg-transparent cursor-not-allowed"
                  }`}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
