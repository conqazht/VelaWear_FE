"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { NavigationMenu as BaseNavigationMenu } from "@base-ui/react/navigation-menu";

import { cn } from "@/lib/utils";

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof BaseNavigationMenu.Root>,
  React.ComponentPropsWithoutRef<typeof BaseNavigationMenu.Root>
>(({ className, children, ...props }, ref) => (
  <BaseNavigationMenu.Root
    ref={ref}
    delay={0}
    closeDelay={80}
    className={cn("relative z-10 flex max-w-max flex-1 items-center justify-center", className)}
    {...props}
  >
    {children}
    <BaseNavigationMenu.Portal keepMounted>
      <BaseNavigationMenu.Positioner
        align="start"
        sideOffset={8}
        className="z-50 transition-[width,height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[width,height]"
      >
        <BaseNavigationMenu.Popup className="origin-top-left overflow-visible outline-none transition-[width,height,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[width,height,transform,opacity] data-[ending-style]:scale-[0.985] data-[ending-style]:opacity-0 data-[ending-style]:-translate-y-0.5 data-[starting-style]:scale-[0.985] data-[starting-style]:opacity-0 data-[starting-style]:translate-y-0.5">
          <BaseNavigationMenu.Viewport className="relative overflow-hidden transition-[width,height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[width,height]" />
        </BaseNavigationMenu.Popup>
      </BaseNavigationMenu.Positioner>
    </BaseNavigationMenu.Portal>
  </BaseNavigationMenu.Root>
));
NavigationMenu.displayName = "NavigationMenu";

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof BaseNavigationMenu.List>,
  React.ComponentPropsWithoutRef<typeof BaseNavigationMenu.List>
>(({ className, ...props }, ref) => (
  <BaseNavigationMenu.List ref={ref} className={cn("flex flex-1 list-none items-center justify-center gap-1", className)} {...props} />
));
NavigationMenuList.displayName = "NavigationMenuList";

const NavigationMenuItem = React.forwardRef<
  React.ElementRef<typeof BaseNavigationMenu.Item>,
  React.ComponentPropsWithoutRef<typeof BaseNavigationMenu.Item>
>(({ className, ...props }, ref) => <BaseNavigationMenu.Item ref={ref} className={cn("relative", className)} {...props} />);
NavigationMenuItem.displayName = "NavigationMenuItem";

function navigationMenuTriggerStyle() {
  return "inline-flex h-10 items-center justify-center rounded-full px-2.5 py-2 text-sm font-medium transition-colors hover:bg-[#efe7dc] hover:text-[#b5573a] focus:bg-[#efe7dc] focus:text-[#b5573a] focus:outline-none";
}

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof BaseNavigationMenu.Trigger>,
  React.ComponentPropsWithoutRef<typeof BaseNavigationMenu.Trigger>
>(({ className, children, ...props }, ref) => (
  <BaseNavigationMenu.Trigger ref={ref} className={cn(navigationMenuTriggerStyle(), className)} {...props}>
    {children}
    <BaseNavigationMenu.Icon
      className={(state) =>
        cn("ml-1 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center transition-transform duration-200", state.open && "rotate-180")
      }
    >
      <ChevronDown className="h-3.5 w-3.5" />
    </BaseNavigationMenu.Icon>
  </BaseNavigationMenu.Trigger>
));
NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof BaseNavigationMenu.Content>,
  React.ComponentPropsWithoutRef<typeof BaseNavigationMenu.Content>
>(({ className, ...props }, ref) => (
  <BaseNavigationMenu.Content
    ref={ref}
    keepMounted
    className={(state) =>
      cn(
        "overflow-hidden rounded-xl border border-[#e3dccf] bg-[#f7f4ef] text-[#1c1a18] shadow-[0_6px_18px_rgba(28,26,24,0.06)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[transform,opacity]",
        state.transitionStatus === "starting" && "opacity-0",
        state.transitionStatus === "ending" && "opacity-0",
        state.activationDirection === "left" &&
          (state.transitionStatus === "starting"
            ? "translate-x-4"
            : state.transitionStatus === "ending"
              ? "-translate-x-4"
              : "translate-x-0"),
        state.activationDirection === "right" &&
          (state.transitionStatus === "starting"
            ? "-translate-x-4"
            : state.transitionStatus === "ending"
              ? "translate-x-4"
              : "translate-x-0"),
        (!state.activationDirection || state.activationDirection === "down") &&
          (state.transitionStatus === "starting"
            ? "translate-y-2"
            : state.transitionStatus === "ending"
              ? "-translate-y-2"
              : "translate-y-0"),
        typeof className === "function" ? className(state) : className
      )
    }
    {...props}
  />
));
NavigationMenuContent.displayName = "NavigationMenuContent";

const NavigationMenuLink = React.forwardRef<
  React.ElementRef<typeof BaseNavigationMenu.Link>,
  React.ComponentPropsWithoutRef<typeof BaseNavigationMenu.Link>
>(({ className, ...props }, ref) => (
  <BaseNavigationMenu.Link
    ref={ref}
    className={cn(
      "inline-flex w-full items-start rounded-2xl px-4 py-3 text-left transition-colors hover:bg-white/70 focus:bg-white/70 focus:outline-none",
      className
    )}
    {...props}
  />
));
NavigationMenuLink.displayName = "NavigationMenuLink";

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
};
