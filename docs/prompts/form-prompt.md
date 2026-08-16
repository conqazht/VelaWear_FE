# Vela Wear Animated Auth Form Prompt

You are an expert frontend engineer specializing in premium ecommerce UI, React interaction systems, SVG/CSS motion, and tactile form micro-interactions. Build a high-end animated authentication experience for **Vela Wear** inspired by the interaction quality and state architecture of the reference `animated-login` project, but fully redesigned to match the current **Vela Wear** visual language and implemented with the **actual stack of this repo**.

The result must feel like a **luxury fashion storefront auth experience**, not a playful cartoon demo. Keep the reactive animation architecture, live focus-state feedback, and polished success/fail choreography from the reference, but translate them into a more editorial, restrained, premium direction that fits the current Vela Wear sign-in and register pages.

# 1. CORE GOAL

Create a **shared auth visual system** that can support both:

- `Sign In`
- `Create Account`

The final direction should feel consistent with the existing Vela Wear auth screens:

- warm beige surfaces
- serif-led editorial typography
- terracotta / brown brand accent
- soft luxury spacing
- minimal but rich motion
- fashion-forward rather than tech-product or cartoon-product

Do **not** simply recreate the original four blob characters. Preserve the idea of a left-side animated scene that reacts to the user, but reinterpret it in a more elevated way.

Important: the reference project is useful for its **interaction model and motion orchestration**, not for its raw implementation format. We are **not** building a static HTML/CSS/vanilla-JS clone. We are rebuilding the concept inside the current Vela Wear app architecture.

# 2. EXPERIENCE DIRECTION

Use the original project as inspiration for:

- real-time reaction to mouse movement
- distinct states for email focus, password hidden, password visible, success, and error
- layered entrance animation
- smooth CSS custom-property driven motion
- strong “alive” feeling without heavy JavaScript DOM thrashing

But rewrite the visual concept into a **premium fashion composition**:

- abstract sculptural forms instead of cute characters
- elegant “watching / shifting / leaning” behavior instead of exaggerated comedy
- subtle face-like cues only if they are extremely refined and abstract
- the scene should feel like an animated editorial installation in a luxury boutique window

Think: **soft gallery sculpture, draped silhouettes, lacquered forms, boutique display choreography**.

From the reference source code, keep these core engineering ideas:

- a tiny shared UI state model
- one global pointer-normalization + interpolation loop
- form events that only update scene state rather than manually animating many nodes
- CSS-variable driven transforms for most live motion
- success and error handled as short-lived state transitions with staged overlays

# 3. REQUIRED TECH STACK

Build this for the **current Vela Wear frontend**, not as a standalone static page.

Use:

- **Next.js 16 App Router**
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **motion** (`motion/react`) for layered entry/exit choreography where it adds value
- existing shared utilities/components already present in the repo where appropriate

Do not structure the solution as:

- `index.html`
- `css/*.css`
- `js/*.js`

Instead, align with the current project conventions:

- server components by default
- `"use client"` only where state, animation, effects, or browser APIs are required
- small focused auth components
- reusable logic extracted into hooks/helpers only when justified
- existing auth flows preserved

The implementation should fit naturally around the current files such as:

- `components/auth/sign-in-page.tsx`
- `components/auth/register-page.tsx`
- `components/auth/auth-shell.tsx`
- `components/auth/floating-input.tsx`
- `components/auth/use-otp-flow.ts`

# 4. ARCHITECTURE TO FOLLOW

Translate the reference source into a React architecture.

Recommended split:

- `AuthMotionScene` client component for the animated left panel
- small shared `useAuthSceneState` or equivalent hook for scene state transitions
- scene config/data constants in a typed helper file if needed
- auth page components continue to own form fields and business flow
- scene receives high-level state from the form layer instead of owning auth logic

Recommended state model:

- `focus: "none" | "email" | "password"`
- `passwordVisible: boolean`
- transient status for `idle | success | error`

Recommended motion plumbing:

- one pointer tracking effect using `requestAnimationFrame`
- normalized mouse values stored in refs/state
- write shared motion values to CSS custom properties on the scene root
- use `motion` for staged entrance / exit / overlays
- use Tailwind for layout, spacing, color, borders, and most static styling
- use a small amount of scoped CSS or Tailwind arbitrary values only when needed for advanced transform behavior

Do not create an over-engineered animation framework. Keep the implementation compact and legible.

# 5. PAGE LAYOUT

Build a desktop-first split layout with strong mobile fallback.

Desktop:

- full viewport auth page
- outer page padding: 16px to 24px
- two-panel layout with rounded corners
- left panel for animated visual scene
- right panel for the auth form

Panel ratio:

- left panel: visually dominant, around `1.15fr` to `1.3fr`
- right panel: narrower, around `0.9fr` to `1fr`
- right panel max-width: around `520px` to `560px`

Visual behavior:

- left panel should feel atmospheric and immersive
- right panel should feel quiet, crisp, and highly readable
- no generic SaaS card stack
- the form surface can still feel like the current Vela Wear auth card, but slightly more elevated

Mobile / tablet:

- stack vertically
- animated scene becomes a shorter hero block above the form
- preserve motion, but reduce complexity and scale
- form remains fully readable and touch-friendly

# 6. BRAND STYLE TO MATCH

Follow the current Vela Wear auth/product aesthetic.

Color direction:

- warm parchment / beige backgrounds
- ink text
- terracotta / brown primary CTA
- muted warm gray supporting copy
- optional deep espresso, clay, soft ivory, brushed gold-tinted neutrals

Suggested token family:

- `--bg-page: #f6f0e7`
- `--bg-panel: #efe7dc`
- `--bg-scene: #e9dfd2`
- `--surface-soft: rgba(255,255,255,0.38)`
- `--text-main: #1c1a18`
- `--text-muted: #55423d`
- `--border-soft: rgba(28,26,24,0.14)`
- `--brand: #964025`
- `--brand-hover: #87391f`
- `--shadow-soft: 0 24px 80px rgba(69, 43, 28, 0.08)`

Typography direction:

- serif display heading for the page title
- clean sans-serif for labels, body text, helper text
- refined letter-spacing, not loud or sporty
- keep the current Vela Wear tone: graceful, clean, understated

# 7. LEFT PANEL CONCEPT

Replace the four cartoon characters with a **set of 3 to 4 abstract vertical forms** that behave like a living composition.

Possible visual metaphors:

- draped mannequin silhouettes
- lacquered sculptural columns
- pillared fashion totems
- abstract garment forms
- arched display objects

Requirements:

- all forms live inside one shared visual scene
- the composition must react together like a system
- each form should have a distinct weight and motion personality
- forms may contain minimal inner details, cut lines, highlights, apertures, or abstract “eye-like” tracking elements
- keep it tasteful and not literal

Recommended shape mix:

- one tall narrow pillar
- one medium central anchor form
- one wider foreground dome or draped arc
- one smaller offset companion form

The scene should feel premium enough that it could sit inside a luxury brand campaign page.

# 8. IMAGE ASSET STRATEGY

Use image assets deliberately. This redesign should not discard every visual from the reference project.

Keep and reuse this existing reference asset:

- `D:/Download/Leonxlnx mybuilds d76aa5aa47363c19212bec50556e379398be0c8e animated-login/img/bg-login.webp`

Implementation guidance for this retained image:

- copy it into the Vela Wear app's public asset structure during implementation, for example `public/auth/bg-login.webp`
- use it as an atmospheric supporting image layer, panel background, or masked scene texture where it helps preserve the reference project's dreamy animated-login mood
- crop and overlay it carefully so it does not dominate the Vela Wear brand system
- use warm ivory / parchment / soft veil overlays if needed to make it harmonize with the current auth surface
- keep it visually secondary to the fashion-auth experience, not a literal cartoon-character centerpiece

For the other reference image asset:

- do not reuse the playful character-style image direction
- replace it with a fashion/editorial image direction that fits Vela Wear
- the image should feel like a premium clothing campaign, atelier detail, garment silhouette, model editorial, fabric close-up, boutique window, or refined wardrobe still life
- avoid mascot, cartoon, clay character, toy, or fantasy creature energy
- prefer natural fabric, tailored clothing, soft studio light, muted warm neutrals, and a restrained luxury mood

Fashion image prompt direction if a new image needs to be generated:

`Premium editorial fashion authentication page background for Vela Wear, refined minimalist clothing brand, warm studio light, linen and wool textures, elegant garment silhouettes on sculptural forms, boutique atelier atmosphere, parchment ivory and soft clay palette, cinematic but restrained, no text, no logo, no cartoon characters, no mascots, no exaggerated fantasy elements, high-end ecommerce campaign mood.`

# 9. REACTION SYSTEM

Preserve the original idea of stateful live reactions, but reinterpret the behavior in a subtle editorial way.

Use CSS custom properties driven by one animation loop:

- `--mx`
- `--my`

Mouse normalization stays conceptually similar:

- `x` normalized from `-1` to `1`
- `y` normalized from `-1` to `1`

Smooth interpolation:

- one `requestAnimationFrame` loop
- lerp / easing toward target values
- no per-element JS mutation beyond root custom properties / high-level scene state

Reference implementation insight to preserve:

- the original `eye-tracking.js` used a single lerped loop and wrote `--mx` / `--my` to the root
- keep that same economy, but scope it to the scene root component instead of `document.documentElement` if cleaner

Scene reactions:

- idle: forms gently track cursor with soft parallax, skew, and scale breathing
- email focus: composition subtly leans toward the form, appearing attentive and inviting
- password hidden: scene turns inward / away slightly, becoming more guarded and private
- password visible: scene opens back up with a more alert, curious posture
- success: composition resolves into a graceful celebratory release
- failure: composition tightens, compresses, and briefly shudders

# 10. ABSTRACT “GAZE” LANGUAGE

The original project used cartoon pupils. Keep the same interaction intent, but refine the implementation.

Allowed reinterpretations:

- inner cutout apertures that shift slightly
- highlight capsules that track horizontally
- glossy reflective slits that move with the cursor
- paired negative-space details suggesting attention

Avoid:

- obvious googly eyes
- childish expressions
- mascot energy

If a face-like behavior is used, it must remain:

- geometric
- minimal
- elegant
- almost architectural

# 11. DISTORTION AND BODY MOTION

Each form should respond differently to motion.

Examples:

- tall pillar: strongest vertical stretch and slight skew
- center anchor: dense grounded motion with restrained sway
- wide foreground form: softer squash and slow heavier drift
- companion form: quickest subtle response

Transform rules:

- transform-origin should usually be bottom center
- movements should feel weighted and physical
- no chaotic wobbling
- forms should never break the premium tone

Use only GPU-friendly transforms:

- translate
- scale
- skew
- rotate very sparingly
- opacity

# 12. STATE MACHINE

Implement a clean shared state model.

States:

- `idle`
- `email-focus`
- `password-hidden`
- `password-visible`
- `success`
- `error`

Behavior guidance:

`idle`

- scene follows mouse softly
- ambient breathing is active
- subtle highlight drift / aperture tracking

`email-focus`

- forms lean toward the right panel
- tracking shifts toward the form fields
- atmosphere feels open and welcoming

`password-hidden`

- scene closes slightly, as if respecting privacy
- apertures / highlights narrow
- motion compresses and lowers

`password-visible`

- scene opens and lifts a little
- details widen or brighten
- attention moves back toward the form

`success`

- forms rise, expand, or glide downward out of frame in a graceful sequence
- background bloom / wash can take over the screen
- should feel luxurious, not gamified

`error`

- brief lateral shake / pressure pulse
- small compression of the forms
- quickly recover back to the current input state

Implementation note from the reference source:

- the original project used a central `updateState(...)` function that maps form focus + password visibility into scene classes and target gaze values
- keep that concept, but express it in typed React state and derived scene props/classes

# 13. ENTRANCE ANIMATION

Keep the idea that each form has a distinct entrance style, but make them more elegant than playful.

Suggested motion vocabulary:

- rise-and-settle
- veil-unfold
- sculptural bloom
- grounded lift

Requirements:

- staggered entrances
- bottom-anchored motion
- one or two forms can overshoot slightly
- ambient breathing begins only after entrance completes
- form UI on the right also enters with its own staggered reveal

The entire page should feel intentionally art-directed on load.

# 14. FORM UI DIRECTION

The right panel must align with the current Vela Wear auth experience, not the reference project’s generic startup aesthetic.

Use:

- Vela Wear logo / brand mark
- serif page title
- muted explanatory copy
- floating label inputs consistent with current implementation
- warm beige panel surface
- brown CTA button
- understated helper links

For sign-in:

- email
- password
- forgot password link
- primary CTA
- member / register prompt

For register:

- email
- first name
- surname
- password
- shopping preference select
- date of birth fields
- email consent
- terms consent
- create account CTA
- sign-in prompt

Do not introduce a Google login button or random third-party auth unless explicitly requested later.

Keep these current-project constraints intact:

- sign-in still uses the current auth provider flow
- register still supports the existing OTP verification flow
- floating label behavior remains consistent with the current implementation
- password visibility toggle must preserve focus like the current app already does

# 15. PASSWORD TOGGLE BEHAVIOR

Keep the good interaction behavior from the current app and the reference:

- password toggle should not blur the input on mousedown
- focus should remain on the password field
- animation state should switch instantly between hidden and visible

When hidden:

- scene becomes more closed / protective

When visible:

- scene becomes more alert / exposed / attentive

Reference behavior to preserve:

- the original source prevented blur on toggle `mousedown`
- it flipped visible/hidden scene state immediately
- we should keep the same UX, but implemented inside the existing React input pattern using refs and local state

# 16. SUCCESS SEQUENCE

Reinterpret the original splashy success animation into a fashion-luxury finish.

Possible direction:

- forms transition into a harmonious “happy” arrangement
- a warm ivory or champagne light bloom expands across the layout
- a soft editorial wipe or veil sweep passes over the page
- the scene clears into a premium success state or route transition

Keep the sequence multi-stage:

1. immediate scene reaction
2. atmospheric bloom / color wash
3. graceful screen transition

Reference sequencing worth preserving:

- success is not a single class flash; it is phased
- first the scene reacts
- then atmospheric overlays expand
- then a final wipe / wash resolves the screen

Use `motion` for this sequence where appropriate instead of imperative DOM node creation.

Avoid:

- confetti
- playful stickers
- loud neon splashes

# 17. ERROR SEQUENCE

On invalid credentials or failed validation:

- brief class-based error animation
- compact lateral shake
- slight vertical compression of the forms
- tension should be noticeable but still polished
- recover automatically after a short duration

The form itself can also show:

- clean inline error message
- soft red-tinted warning surface if needed

Do not overdo red effects or make it feel alarmist.

Reference behavior worth preserving:

- short-lived error state around ~700ms to 900ms
- scene tension resets automatically
- no permanent broken state after one invalid submit

# 18. BACKGROUNDS AND ATMOSPHERE

The original project used image-backed panels. For this rewrite, keep the selected `bg-login.webp` asset, but make the total visual environment more premium and fashion-oriented.

Preferred background treatment:

- layered warm gradients
- subtle texture or grain
- soft radial light pools
- faint shadow falloff behind the forms
- optional blurred editorial fashion shapes
- retained `bg-login.webp` used through careful crop, veil overlay, masking, or low-contrast atmospheric treatment
- new/replacement fashion image used where the old playful character image would otherwise appear

Avoid:

- loud illustrations
- cartoon backdrops
- over-busy photo collages
- using both reference images unchanged

The left panel should feel rich through a mix of image texture, abstract motion, and fashion editorial restraint.

# 19. PERFORMANCE REQUIREMENTS

- one animation loop only
- CSS custom properties for shared motion values
- `will-change: transform, opacity` on animated layers
- no layout-thrashing animation strategy
- keep DOM structure disciplined
- prefer opacity / transform transitions over costly filters everywhere
- ensure the motion still feels smooth on mid-range laptops

React-specific performance guardrails:

- keep animated pointer values in refs where possible to avoid re-rendering on every frame
- avoid storing live mouse positions in top-level React state if that would trigger 60fps component renders
- reserve React state for discrete scene mode changes, not frame-by-frame motion
- keep client boundaries tight so auth pages do not become unnecessarily heavy

# 20. RESPONSIVENESS REQUIREMENTS

Desktop:

- premium split-panel composition
- strong left visual presence
- right panel remains clean and narrow

Tablet:

- composition simplifies
- panel proportions rebalance

Mobile:

- stacked scene over form
- animated scene height reduced
- preserve identity of the concept
- maintain comfortable input spacing and button sizing

# 21. IMPLEMENTATION NOTES

The implementation must use modern frontend architecture appropriate for the Vela Wear codebase:

- Next.js app router compatible
- React components where needed
- small client components for animation/stateful parts
- Tailwind-first styling consistent with this repo
- `motion/react` for staged choreography
- typed props and explicit interfaces
- no `any`
- keep imports narrow and bundle-conscious
- motion should integrate cleanly with the existing auth components rather than replacing the whole brand system with a foreign style

If building directly inside the current Vela Wear repo:

- keep the existing auth information architecture
- preserve current field set and existing flows
- preserve OTP-based registration flow
- preserve current password toggle focus behavior
- improve only the visual composition and interactive motion layer

Recommended implementation shape:

- a reusable animated auth layout or scene component shared by sign-in and register
- scene state passed from each form page based on focus/toggle/submission state
- sign-in and register continue to render their distinct fields and flows
- OTP step can remain its own focused screen unless there is a clear premium animated treatment that does not interfere with usability

Avoid:

- rewriting auth business logic just to support animation
- moving everything into one giant client component
- duplicating sign-in/register field logic between pages
- importing large data or unrelated storefront code into auth client components

# 22. FINAL BAR

The finished result should feel like:

- Vela Wear
- premium
- editorial
- atmospheric
- tactile
- confident

It should **not** feel like:

- a children’s animation demo
- a startup SaaS login
- a bright cartoon mascot landing page
- an overdesigned gimmick

Build it as a polished animated auth experience where the visual scene quietly reacts to the customer throughout sign-in and registration, making the form feel alive, elegant, and unmistakably part of the Vela Wear brand.
