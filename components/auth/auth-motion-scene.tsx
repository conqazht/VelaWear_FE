"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers/i18n-provider";

export type AuthSceneFocus = "none" | "email" | "password";
export type AuthSceneStatus = "idle" | "success" | "error";

interface AuthMotionSceneProps {
  focus: AuthSceneFocus;
  passwordVisible: boolean;
  status: AuthSceneStatus;
  mode: "sign-in" | "register" | "forgot-password";
}

type SceneStyle = React.CSSProperties & {
  "--mx": string;
  "--my": string;
};

export function AuthMotionScene({ focus, passwordVisible, status, mode }: AuthMotionSceneProps) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const sceneRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  // Store focus and passwordVisible in a ref to read in the 60fps loop without re-running useEffect
  const stateRef = useRef({ focus, passwordVisible });
  useEffect(() => {
    stateRef.current = { focus, passwordVisible };
  }, [focus, passwordVisible]);

  useEffect(() => {
    const node = sceneRef.current;
    if (!node || reduceMotion) return;

    let frame = 0;

    const updatePointer = (event: PointerEvent) => {
      // Normalize mouse coordinates to [-1, 1] across the entire window width/height
      target.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      target.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const animate = () => {
      let targetX = target.current.x;
      let targetY = target.current.y;

      const currentFocus = stateRef.current.focus;
      const currentPasswordVisible = stateRef.current.passwordVisible;

      // Force target coordinates when focused, matching the vanilla JS state machine
      if (currentFocus === "email") {
        targetX = 1.0;
        targetY = 0.2;
      } else if (currentFocus === "password") {
        if (currentPasswordVisible) {
          targetX = 1.0;
          targetY = 0.1;
        } else {
          targetX = -1.0;
          targetY = 0.8;
        }
      }

      // Smooth physical interpolation (lerping)
      const prevX = current.current.x;
      const prevY = current.current.y;
      current.current.x += (targetX - current.current.x) * 0.08;
      current.current.y += (targetY - current.current.y) * 0.08;

      // Only write to DOM if coordinates changed significantly to avoid style recalculations when stationary
      if (
        Math.abs(current.current.x - prevX) > 0.0005 ||
        Math.abs(current.current.y - prevY) > 0.0005
      ) {
        node.style.setProperty("--mx", current.current.x.toFixed(4));
        node.style.setProperty("--my", current.current.y.toFixed(4));
      }

      frame = requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", updatePointer);
    frame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", updatePointer);
      cancelAnimationFrame(frame);
    };
  }, [reduceMotion]);

  const sceneStateClass = cn(
    "scene-container relative hidden h-full overflow-hidden rounded-[24px] border border-white/35 bg-[#d9d0c3] shadow-[0_30px_90px_rgba(47,36,29,0.16)] lg:block lg:flex-[1.2]",
    focus === "email" && "focus-email",
    focus === "password" && (passwordVisible ? "focus-password-visible" : "focus-password-hidden"),
    status === "success" && "login-success",
    status === "error" && "login-fail",
  );

  return (
    <motion.aside
      ref={sceneRef}
      style={{ "--mx": "0", "--my": "0" } as SceneStyle}
      className={sceneStateClass}
      initial={false}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden="true"
    >
      <style>{`
        /* GPU Acceleration */
        .arc-anim, .drop-anim, .jelly-anim, .breathe {
          will-change: transform, opacity;
        }

        /* Characters base transformations and transitions */
        .char {
          transform-box: fill-box;
          transform-origin: bottom center;
          transition: none;
        }

        /* Enable transition only during focus states to prevent requestAnimationFrame conflict in idle */
        .focus-email .char,
        .focus-password-hidden .char,
        .focus-password-visible .char {
          transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Ambient Breathing */
        .breathe {
          transform-box: fill-box;
          transform-origin: bottom center;
          animation: breatheAnim 4s infinite ease-in-out;
        }
        @keyframes breatheAnim {
          0%, 100% { transform: scaleY(1); }
          50%      { transform: scaleY(1.02) translateY(-2px); }
        }

        /* Eye Blinking */
        .eye-blink {
          transform-box: fill-box;
          transform-origin: center;
          animation: blinkAnim 4.5s infinite;
        }
        @keyframes blinkAnim {
          0%, 96%, 100% { transform: scaleY(1); }
          98%           { transform: scaleY(0.1); }
        }

        /* Idle Body skew and stretch based on --mx and --my */
        #purple {
          transform: skewX(calc(var(--mx, 0) * -5deg)) scaleY(calc(1 + var(--my, 0) * -0.04));
        }
        #black {
          transform: skewX(calc(var(--mx, 0) * -4deg)) scaleY(calc(1 + var(--my, 0) * -0.03));
        }
        #orange {
          transform: skewX(calc(var(--mx, 0) * -4deg)) scaleY(calc(1 + var(--my, 0) * -0.03));
        }
        #yellow {
          transform: skewX(calc(var(--mx, 0) * 3deg)) scaleY(calc(1 + var(--my, 0) * -0.03));
        }

        /* Faces Default State */
        .face {
          transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .face-hidden, .face-visible, .face-happy { opacity: 0; pointer-events: none; }
        .face-default { opacity: 1; }

        /* Pupils translation based on mouse --mx and --my */
        .eye-tracker {
          transform: translate(calc(var(--mx, 0) * 5px), calc(var(--my, 0) * 3px));
          transition: transform 0.1s ease-out;
        }
        .pupil {
          transform-box: fill-box;
          transform-origin: center;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* State: Email Focus (lean right) */
        .focus-email #purple { transform: skewX(-12deg) scaleY(1.04); }
        .focus-email #black  { transform: skewX(-8deg) scaleY(1.05); }
        .focus-email #yellow { transform: skewX(-6deg) scaleY(1.02); }
        .focus-email #orange { transform: skewX(-6deg) scaleY(1.03); }

        /* State: Password Hidden (lean left, look away, change face) */
        .focus-password-hidden #purple { transform: skewX(12deg) scaleY(0.95); }
        .focus-password-hidden #black  { transform: skewX(8deg) scaleY(0.88); }
        .focus-password-hidden #yellow { transform: skewX(10deg) scaleY(0.95); }
        .focus-password-hidden #orange { transform: skewX(6deg) scaleY(0.92); }

        .focus-password-hidden .faces {
          transform: translateX(-8px);
          transition: transform 0.5s ease-in-out;
        }
        .focus-password-hidden .face-default,
        .focus-password-hidden .face-visible { opacity: 0; }
        .focus-password-hidden .face-hidden  { opacity: 1; }

        /* State: Password Visible (lean extreme right, eyes pop/widen, look right) */
        .focus-password-visible #purple { transform: skewX(-18deg) scaleY(1.08); }
        .focus-password-visible #black  { transform: skewX(-14deg) scaleY(1.1); }
        .focus-password-visible #yellow { transform: skewX(-10deg) scaleY(1.06); }
        .focus-password-visible #orange { transform: skewX(-12deg) scaleY(1.07); }

        .focus-password-visible .eye-tracker {
          transform: translate(10px, -2px) !important;
        }
        .focus-password-visible .face-default,
        .focus-password-visible .face-hidden  { opacity: 0; }
        .focus-password-visible .face-visible { opacity: 1; }
        .focus-password-visible .pupil { transform: scale(1.5); }

        /* State: Error (fail shake) */
        .login-fail .char {
          transition: none !important;
          animation: charShake 0.15s ease-in-out 4;
        }
        .login-fail #purple { transform: scaleY(0.9); }
        .login-fail #black  { transform: scaleY(0.85); }
        .login-fail #yellow { transform: scaleY(0.9); }
        .login-fail #orange { transform: scaleY(0.88); }

        .login-fail .face-default,
        .login-fail .face-visible { opacity: 0; }
        .login-fail .face-hidden  { opacity: 1; }

        @keyframes charShake {
          0%, 100% { transform: translateX(0); }
          25%      { transform: translateX(-6px); }
          75%      { transform: translateX(6px); }
        }

        /* State: Success (exit bounce down) */
        .login-success .face-default,
        .login-success .face-hidden,
        .login-success .face-visible { opacity: 0; }
        .login-success .face-happy { opacity: 1; }

        .login-success .char {
          transition: none !important;
          animation: bounceDown 0.8s cubic-bezier(0.6, -0.28, 0.74, 0.05) forwards;
        }
        .login-success #purple { animation-delay: 0.1s; }
        .login-success #black  { animation-delay: 0.2s; }
        .login-success #orange { animation-delay: 0.3s; }
        .login-success #yellow { animation-delay: 0.4s; }

        @keyframes bounceDown {
          0%   { transform: scaleY(1) translateY(0); opacity: 1; }
          15%  { transform: scaleY(1.15) translateY(-20px); opacity: 1; }
          35%  { transform: scaleY(0.8) translateY(0); opacity: 1; }
          100% { transform: scaleY(0.5) translateY(250%); opacity: 0; }
        }

        /* Entrance Animations */
        .arc-anim {
          opacity: 0;
          transform-box: fill-box;
          transform-origin: bottom center;
          animation: growUp 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes growUp {
          0%   { opacity: 0; transform: scaleY(0) scaleX(1.2); }
          15%  { opacity: 1; transform: scaleY(0.05) scaleX(1.15); }
          100% { opacity: 1; transform: scaleY(1) scaleX(1); }
        }

        .drop-anim {
          opacity: 0;
          transform-box: fill-box;
          transform-origin: center center;
          animation: portalOpen 1.4s ease-in-out forwards;
        }
        @keyframes portalOpen {
          0% { opacity: 0; transform: translateY(-250px) scale(0); }
          8% { opacity: 1; transform: translateY(-230px) scale(0.5); }
          16% { transform: translateY(-200px) scale(1); }
          42% { transform: translateY(0) scaleY(1) scaleX(1); }
          50% { transform: translateY(0) scaleY(0.78) scaleX(1.16); }
          60% { transform: translateY(-12px) scaleY(1.08) scaleX(0.95); }
          70% { transform: translateY(0) scaleY(0.93) scaleX(1.05); }
          80% { transform: translateY(-3px) scaleY(1.03) scaleX(0.98); }
          90% { transform: translateY(0) scaleY(0.99) scaleX(1.01); }
          100% { opacity: 1; transform: translateY(0) scaleY(1) scaleX(1); }
        }

        .jelly-anim {
          opacity: 0;
          transform-box: fill-box;
          transform-origin: bottom center;
          animation: jellyBlobUp 1.8s ease-in-out forwards;
        }
        @keyframes jellyBlobUp {
          0% { opacity: 0; transform: scaleY(0.02) scaleX(1.4); }
          15% { opacity: 1; transform: scaleY(0.08) scaleX(1.3); }
          40% { transform: scaleY(1.15) scaleX(0.9); }
          55% { transform: scaleY(0.88) scaleX(1.06); }
          70% { transform: scaleY(1.05) scaleX(0.98); }
          85% { transform: scaleY(0.97) scaleX(1.01); }
          100% { opacity: 1; transform: scaleY(1) scaleX(1); }
        }
      `}</style>

      {/* Primary Atmospheric Background */}
      <Image
        src="/auth/fashion-auth-editorial.png"
        alt=""
        fill
        sizes="(min-width: 1024px) 58vw, 100vw"
        priority
        className="absolute inset-0 scale-[1.04] object-cover opacity-88"
        suppressHydrationWarning
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(21,18,15,0.34),rgba(246,240,231,0.12)_42%,rgba(246,240,231,0.38)),radial-gradient(circle_at_26%_18%,rgba(255,255,255,0.58),transparent_28%),radial-gradient(circle_at_76%_72%,rgba(151,64,37,0.2),transparent_33%)]" />

      {/* Decorative text */}
      <div className="absolute top-[8%] left-[8%] max-w-[240px] text-white/88">
        <p className="font-serif text-[42px] leading-[0.98]">
          Vela
          <br />
          {t("auth.scene.member")}
        </p>
        <p className="mt-4 max-w-[190px] text-xs leading-5 text-white/70">
          {mode === "register"
            ? t("auth.scene.register")
            : mode === "forgot-password"
              ? t("auth.scene.forgotPassword")
              : t("auth.scene.signIn")}
        </p>
      </div>

      {/* Active Characters Layer */}
      <div className="absolute inset-x-0 top-[8%] bottom-[18%] flex items-end justify-center">
        <svg
          className="h-full max-h-[450px] w-full max-w-[500px]"
          viewBox="0 0 450 400"
          preserveAspectRatio="xMidYMax meet"
          xmlns="http://www.w3.org/2000/svg"
          overflow="visible"
          fill="none"
          style={{ overflow: "visible", background: "transparent" }}
        >
          <defs>
            <clipPath id="black-clip">
              <rect x="0" y="0" width="450" height="390" />
            </clipPath>

            {/* Premium gradients matching the fashion design */}
            <linearGradient id="atelier-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5efe6" />
              <stop offset="100%" stopColor="#d9cebf" />
            </linearGradient>
            <linearGradient id="tailor-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3c3833" />
              <stop offset="100%" stopColor="#1a1816" />
            </linearGradient>
            <linearGradient id="linen-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e6d7b5" />
              <stop offset="100%" stopColor="#bfa370" />
            </linearGradient>
            <linearGradient id="drape-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c06e53" />
              <stop offset="100%" stopColor="#8d4a34" />
            </linearGradient>

            {/* Soft shadows for three-dimensional cutout effect */}
            <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="12"
                stdDeviation="16"
                floodColor="#2c1f18"
                floodOpacity="0.14"
              />
            </filter>
            <filter id="soft-shadow-dark" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="12"
                stdDeviation="16"
                floodColor="#120c08"
                floodOpacity="0.25"
              />
            </filter>
          </defs>

          {/* CHARACTER: Black (Tailor - medium pill, center) */}
          <g className="drop-anim" style={{ animationDelay: "0.2s" }}>
            <g className="breathe" style={{ animationDelay: "0.5s" }}>
              <g clipPath="url(#black-clip)">
                <g id="black" className="char" filter="url(#soft-shadow-dark)">
                  <rect x="188" y="150" width="88" height="205" rx="44" fill="url(#tailor-grad)" />
                  <g className="faces">
                    {/* face-default */}
                    <g className="face face-default">
                      <g className="eye-blink" style={{ animationDelay: "1.5s" }}>
                        <circle cx="214" cy="200" r="10" fill="#faf8f5" />
                        <g className="eye-tracker">
                          <circle cx="214" cy="200" r="4.5" fill="#221e1a" className="pupil" />
                        </g>
                      </g>
                      <g className="eye-blink" style={{ animationDelay: "1.5s" }}>
                        <circle cx="250" cy="200" r="10" fill="#faf8f5" />
                        <g className="eye-tracker">
                          <circle cx="250" cy="200" r="4.5" fill="#221e1a" className="pupil" />
                        </g>
                      </g>
                      <path
                        d="M 222 228 Q 232 238 242 228"
                        fill="none"
                        stroke="#faf8f5"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </g>

                    {/* face-hidden */}
                    <g className="face face-hidden">
                      <path
                        d="M 204 200 L 224 200"
                        fill="none"
                        stroke="#faf8f5"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 240 200 L 260 200"
                        fill="none"
                        stroke="#faf8f5"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 222 228 Q 228 226 232 228 Q 236 230 242 228"
                        fill="none"
                        stroke="#faf8f5"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </g>

                    {/* face-visible */}
                    <g className="face face-visible">
                      <g className="eye-blink" style={{ animationDelay: "1.5s" }}>
                        <circle cx="214" cy="198" r="11" fill="#faf8f5" />
                        <g className="eye-tracker">
                          <circle cx="214" cy="198" r="5" fill="#221e1a" className="pupil" />
                        </g>
                      </g>
                      <g className="eye-blink" style={{ animationDelay: "1.5s" }}>
                        <circle cx="250" cy="198" r="11" fill="#faf8f5" />
                        <g className="eye-tracker">
                          <circle cx="250" cy="198" r="5" fill="#221e1a" className="pupil" />
                        </g>
                      </g>
                      <circle
                        cx="232"
                        cy="232"
                        r="5"
                        fill="none"
                        stroke="#faf8f5"
                        strokeWidth="2.5"
                      />
                    </g>

                    {/* face-happy */}
                    <g className="face face-happy">
                      <path
                        d="M 207 196 Q 214 190 221 196"
                        fill="none"
                        stroke="#faf8f5"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 243 196 Q 250 190 257 196"
                        fill="none"
                        stroke="#faf8f5"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 218 230 Q 232 244 246 230"
                        fill="none"
                        stroke="#faf8f5"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>

          {/* CHARACTER: Purple (Atelier - tall pill, left side) */}
          <g className="arc-anim" style={{ animationDelay: "0.35s" }}>
            <g className="breathe" style={{ animationDelay: "0s" }}>
              <g id="purple" className="char" filter="url(#soft-shadow)">
                <rect x="55" y="55" width="110" height="300" rx="40" fill="url(#atelier-grad)" />
                <g className="faces">
                  {/* face-default */}
                  <g className="face face-default">
                    <g className="eye-blink" style={{ animationDelay: "0s" }}>
                      <circle cx="85" cy="120" r="12" fill="#faf8f5" />
                      <g className="eye-tracker">
                        <circle cx="85" cy="120" r="5" fill="#221e1a" className="pupil" />
                      </g>
                    </g>
                    <g className="eye-blink" style={{ animationDelay: "0s" }}>
                      <circle cx="135" cy="120" r="12" fill="#faf8f5" />
                      <g className="eye-tracker">
                        <circle cx="135" cy="120" r="5" fill="#221e1a" className="pupil" />
                      </g>
                    </g>
                    <path
                      d="M 97 155 Q 110 165 123 155"
                      fill="none"
                      stroke="#3a332d"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </g>

                  {/* face-hidden */}
                  <g className="face face-hidden">
                    <path
                      d="M 75 120 L 95 120"
                      fill="none"
                      stroke="#3a332d"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 125 120 L 145 120"
                      fill="none"
                      stroke="#3a332d"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 97 155 Q 104 152 110 155 Q 116 158 123 155"
                      fill="none"
                      stroke="#3a332d"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </g>

                  {/* face-visible */}
                  <g className="face face-visible">
                    <g className="eye-blink" style={{ animationDelay: "0s" }}>
                      <circle cx="85" cy="120" r="13" fill="#faf8f5" />
                      <g className="eye-tracker">
                        <circle cx="85" cy="120" r="5" fill="#221e1a" className="pupil" />
                      </g>
                    </g>
                    <g className="eye-blink" style={{ animationDelay: "0s" }}>
                      <circle cx="135" cy="120" r="13" fill="#faf8f5" />
                      <g className="eye-tracker">
                        <circle cx="135" cy="120" r="5" fill="#221e1a" className="pupil" />
                      </g>
                    </g>
                    <circle cx="110" cy="158" r="5" fill="none" stroke="#3a332d" strokeWidth="3" />
                  </g>

                  {/* face-happy */}
                  <g className="face face-happy">
                    <path
                      d="M 78 116 Q 85 110 92 116"
                      fill="none"
                      stroke="#3a332d"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 128 116 Q 135 110 142 116"
                      fill="none"
                      stroke="#3a332d"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 93 150 Q 110 168 127 150"
                      fill="none"
                      stroke="#3a332d"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </g>
                </g>
              </g>
            </g>
          </g>

          {/* CHARACTER: Yellow (Linen - dome shape, right) */}
          <g className="jelly-anim" style={{ animationDelay: "0.4s" }}>
            <g className="breathe" style={{ animationDelay: "1s" }}>
              <g id="yellow" className="char" filter="url(#soft-shadow)">
                <path d="M 255 390 A 90 155 0 0 1 435 390 Z" fill="url(#linen-grad)" />
                <g className="faces">
                  {/* face-default */}
                  <g className="face face-default">
                    <g className="eye-tracker">
                      <circle
                        cx="320"
                        cy="300"
                        r="6"
                        fill="#221e1a"
                        className="pupil eye-blink"
                        style={{ animationDelay: "0.8s" }}
                      />
                      <circle
                        cx="370"
                        cy="300"
                        r="6"
                        fill="#221e1a"
                        className="pupil eye-blink"
                        style={{ animationDelay: "0.8s" }}
                      />
                    </g>
                    <path
                      d="M 333 328 Q 345 338 357 328"
                      fill="none"
                      stroke="#221e1a"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </g>

                  {/* face-hidden */}
                  <g className="face face-hidden">
                    <path
                      d="M 314 300 L 326 300"
                      fill="none"
                      stroke="#221e1a"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 364 300 L 376 300"
                      fill="none"
                      stroke="#221e1a"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 333 328 Q 339 326 345 328 Q 351 330 357 328"
                      fill="none"
                      stroke="#221e1a"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </g>

                  {/* face-visible */}
                  <g className="face face-visible">
                    <g className="eye-tracker">
                      <circle cx="320" cy="297" r="7" fill="#221e1a" className="pupil" />
                      <circle cx="370" cy="297" r="7" fill="#221e1a" className="pupil" />
                    </g>
                    <circle
                      cx="345"
                      cy="330"
                      r="6"
                      fill="none"
                      stroke="#221e1a"
                      strokeWidth="2.5"
                    />
                  </g>

                  {/* face-happy */}
                  <g className="face face-happy">
                    <path
                      d="M 317 296 Q 320 290 326 296"
                      fill="none"
                      stroke="#221e1a"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 367 296 Q 370 290 376 296"
                      fill="none"
                      stroke="#221e1a"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 333 325 Q 345 340 357 325"
                      fill="none"
                      stroke="#221e1a"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </g>
                </g>
              </g>
            </g>
          </g>

          {/* CHARACTER: Orange (Drape - large dome, foreground) */}
          <g className="jelly-anim" style={{ animationDelay: "0.05s" }}>
            <g className="breathe" style={{ animationDelay: "1.5s" }}>
              <g id="orange" className="char" filter="url(#soft-shadow)">
                <path d="M 10 390 A 155 150 0 0 1 320 390 Z" fill="url(#drape-grad)" />
                <g className="faces">
                  {/* face-default */}
                  <g className="face face-default">
                    <g className="eye-tracker">
                      <circle
                        cx="130"
                        cy="310"
                        r="6"
                        fill="#221e1a"
                        className="pupil eye-blink"
                        style={{ animationDelay: "3s" }}
                      />
                      <circle
                        cx="200"
                        cy="310"
                        r="6"
                        fill="#221e1a"
                        className="pupil eye-blink"
                        style={{ animationDelay: "3s" }}
                      />
                    </g>
                    <path
                      d="M 150 345 Q 165 360 180 345"
                      fill="none"
                      stroke="#221e1a"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </g>

                  {/* face-hidden */}
                  <g className="face face-hidden">
                    <path
                      d="M 120 315 L 140 315"
                      fill="none"
                      stroke="#221e1a"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 190 315 L 210 315"
                      fill="none"
                      stroke="#221e1a"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 150 350 Q 158 347 165 350 Q 172 353 180 350"
                      fill="none"
                      stroke="#221e1a"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </g>

                  {/* face-visible */}
                  <g className="face face-visible">
                    <g className="eye-tracker">
                      <circle cx="130" cy="305" r="7" fill="#221e1a" className="pupil" />
                      <circle cx="200" cy="305" r="7" fill="#221e1a" className="pupil" />
                    </g>
                    <circle
                      cx="165"
                      cy="348"
                      r="8"
                      fill="none"
                      stroke="#221e1a"
                      strokeWidth="3.5"
                    />
                  </g>

                  {/* face-happy */}
                  <g className="face face-happy">
                    <path
                      d="M 122 306 Q 130 300 138 306"
                      fill="none"
                      stroke="#221e1a"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 192 306 Q 200 300 208 306"
                      fill="none"
                      stroke="#221e1a"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 145 342 Q 165 362 185 342"
                      fill="none"
                      stroke="#221e1a"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </g>
                </g>
              </g>
            </g>
          </g>
        </svg>
      </div>

      <AnimatePresence>
        {status === "success" && (
          <motion.div
            className="absolute inset-0 bg-[#f8f1e6]"
            initial={{ clipPath: "circle(0% at 72% 42%)", opacity: 0.7 }}
            animate={{ clipPath: "circle(135% at 72% 42%)", opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
