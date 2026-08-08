# Vela Wear Animated Auth Login Prompt

You are an expert frontend engineer specializing in premium ecommerce UI, React interaction systems, SVG/CSS motion, and tactile form micro-interactions. Build a high-end animated authentication experience for **Vela Wear** inspired by the interaction quality and state architecture of the reference `animated-login` project, but fully redesigned to match the current **Vela Wear** visual language and implemented with the **actual stack of this repo**.

The result must feel like a **luxury fashion storefront auth experience**, not a playful cartoon demo. Keep the reactive animation architecture, live focus-state feedback, and polished success/fail choreography from the reference, but translate them into a more editorial, restrained, premium direction that fits the current Vela Wear sign-in and register pages.


# 1. CORE GOAL

Create a **shared auth visual system** that can support both:
- `Sign In`
- `Create Account`

The final direction should feel consistent with the existing Vela Wear auth screens:
- warm parchment/beige surfaces
- serif display typography
- terracotta / brown brand accent
- soft luxury spacing
- minimal but rich motion
- fashion-forward rather than tech-product or cartoon-product

Recreate the original four characters (Purple, Black, Yellow, Orange) inside a single SVG (`viewBox="0 0 450 400"`), but style them with premium linear gradients and materials matching the Vela Wear brand:
- **Purple (Atelier)**: Sand/parchment beige gradient.
- **Black (Tailor)**: Deep espresso/charcoal black.
- **Yellow (Linen)**: Warm brushed gold/ochre gradient.
- **Orange (Drape)**: Burnt terracotta/rust gradient.

The reference project is useful for its **interaction model, keyframes, and motion orchestration**. We are rebuilding the concept inside the current Vela Wear app architecture.


# 2. EXPERIENCE DIRECTION

Use the original project as inspiration for:
- real-time reaction to mouse position (document-wide)
- distinct states for email focus, password hidden, password visible, success, and error
- layered entrance animations
- smooth CSS custom-property driven motion
- strong “alive” feeling without heavy JavaScript DOM thrashing
- ambient breathing and blinking animations

But rewrite the visual concept into a **premium fashion composition**:
- abstract sculptural forms in linear gradients instead of flat cartoon colors
- elegant “watching / shifting / leaning” behavior
- the scene should feel like an animated editorial installation in a luxury boutique window
- soft gallery sculpture, draped silhouettes, lacquered forms, boutique display choreography


# 3. REQUIRED TECH STACK

Build this for the **current Vela Wear frontend**, not as a standalone static page.

Use:
- **Next.js 16 App Router**
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **motion** (`motion/react`) for layered entry/exit choreography where it adds value
- existing shared utilities/components already present in the repo where appropriate

The implementation should fit naturally around the current files:
- `components/auth/sign-in-page.tsx`
- `components/auth/register-page.tsx`
- `components/auth/animated-auth-shell.tsx`
- `components/auth/auth-motion-scene.tsx`


# 4. SVG CHARACTER COORDINATES & GRADIENTS

Four characters inside a single SVG (viewBox="0 0 450 400", overflow visible):

### Character 1 — Purple (Atelier, tall pill, left side):
- Shape: rect at (55, 55), width 110, height 300, rx 40, fill: linear-gradient from `#f5efe6` to `#d9cebf`.
- Eyes: soft-white (`#faf8f5`) circles r=12 at cx=85/135, cy=120, with charcoal (`#221e1a`) pupils r=5.
- Mouth: curved path (smile), stroke `#3a332d`, width 3.
- Entry animation: growUp (1.4s, cubic-bezier 0.34,1.56,0.64,1), delay 0.35s.

### Character 2 — Black (Tailor, medium pill, center):
- Shape: rect at (188, 150), width 88, height 205, rx 44, fill: linear-gradient from `#3c3833` to `#1a1816`.
- Eyes: soft-white (`#faf8f5`) circles r=10 at cx=214/250, cy=200, with charcoal (`#221e1a`) pupils r=4.5.
- Entry animation: portalOpen (1.4s, drop from -250px with multi-stage bounce squash), delay 0.2s.

### Character 3 — Yellow (Linen, dome shape, right):
- Shape: SVG arc path creating a dome from (255,390) to (435,390), fill: linear-gradient from `#e6d7b5` to `#bfa370`.
- Eyes: charcoal (`#221e1a`) dot pupils r=6 at cx=320/370, cy=300 (no white sclera — dark eyes on light body).
- Entry animation: jellyBlobUp (1.8s, starts squished flat then bounces up), delay 0.4s.

### Character 4 — Orange (Drape, large dome, foreground):
- Shape: SVG arc path creating a wide dome from (10,390) to (320,390), fill: linear-gradient from `#c06e53` to `#8d4a34`.
- Eyes: charcoal (`#221e1a`) dot pupils r=6 at cx=130/200, cy=310 (no white sclera).
- Entry animation: jellyBlobUp (1.8s), delay 0.05s.

Each character has exactly 4 face states:
- face-default: normal expression with eye-tracking pupils, gentle smile.
- face-hidden: closed eyes (horizontal lines), wavy/flat mouth — used when password is hidden.
- face-visible: wide-open eyes (larger radius), surprised "O" mouth — used when password is visible.
- face-happy: upward curved eye arcs (closed happy eyes), big open smile — used on login success.


# 5. REACTION SYSTEM & STATE MACHINE

Interpolate `--mx` and `--my` custom properties on the scene root using a document-wide mouse move listener.

States:
- **Idle**:
  - Eye target follows actual mouse position.
  - Body skews and scales based on `--mx` and `--my`.
- **Email Focus**:
  - Eye target forced to x=1.0, y=0.2.
  - All characters lean hard right toward the form:
    - Purple skewX(-12deg) scaleY(1.04)
    - Black skewX(-8deg) scaleY(1.05)
    - Yellow skewX(-6deg) scaleY(1.02)
    - Orange skewX(-6deg) scaleY(1.03)
- **Password Hidden**:
  - Eye target forced to x=-1.0, y=0.8.
  - All characters lean left, looking away:
    - Purple skewX(12deg) scaleY(0.95)
    - Black skewX(8deg) scaleY(0.88)
    - Yellow skewX(10deg) scaleY(0.95)
    - Orange skewX(6deg) scaleY(0.92)
  - Face groups shift left by translateX(-8px).
  - closed-eyes/hidden face active.
- **Password Visible**:
  - Eye target forced to x=1.0, y=0.1.
  - All characters lean extremely hard right, curious:
    - Purple skewX(-18deg) scaleY(1.08)
    - Black skewX(-14deg) scaleY(1.1)
    - Yellow skewX(-10deg) scaleY(1.06)
    - Orange skewX(-12deg) scaleY(1.07)
  - Pupils scale to 1.5x.
  - Eye-tracker translation overridden to `translate(10px, -2px)`.
  - surprised face active.
- **Success**:
  - face-happy active.
  - Characters play `bounceDown` exit animation (bounce up, then fall down out of frame to `translateY(250%)` and fade out).
  - Background cream-beige bloom expands.
- **Error**:
  - Characters shake (`charShake` keyframe animation) and compress vertically.
  - face-hidden active.
  - Resets to idle/current focus after 800ms.
