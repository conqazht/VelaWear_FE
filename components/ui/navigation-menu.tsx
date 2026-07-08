"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { NavigationMenu as BaseNavigationMenu } from "@base-ui/react/navigation-menu";

import { cn } from "@/lib/utils";

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof BaseNavigationMenu.Root>,
  React.ComponentPropsWithoutRef<typeof BaseNavigationMenu.Root>
>(({ children, ...props }, ref) => (
  <BaseNavigationMenu.Root ref={ref} {...props}>
    {children}
    <BaseNavigationMenu.Portal>
      <BaseNavigationMenu.Positioner align="start" sideOffset={12} className="z-50">
        <BaseNavigationMenu.Popup className="z-50 overflow-visible outline-none transition-all duration-200 ease-out data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:scale-95">
          <BaseNavigationMenu.Viewport className="relative overflow-hidden" />
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
  <BaseNavigationMenu.List
    ref={ref}
    className={cn("flex flex-1 list-none items-center justify-center gap-1", className)}
    {...props}
  />
));
NavigationMenuList.displayName = "NavigationMenuList";

const NavigationMenuItem = React.forwardRef<
  React.ElementRef<typeof BaseNavigationMenu.Item>,
  React.ComponentPropsWithoutRef<typeof BaseNavigationMenu.Item>
>(({ className, ...props }, ref) => (
  <BaseNavigationMenu.Item ref={ref} className={cn("relative", className)} {...props} />
));
NavigationMenuItem.displayName = "NavigationMenuItem";

const navigationMenuTriggerStyle =
  "inline-flex h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-[#efe7dc] hover:text-[#b5573a] focus:bg-[#efe7dc] focus:text-[#b5573a] focus:outline-none data-[popup-open]:bg-[#efe7dc] data-[popup-open]:text-[#b5573a]";

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof BaseNavigationMenu.Trigger>,
  React.ComponentPropsWithoutRef<typeof BaseNavigationMenu.Trigger> & {
    unstyled?: boolean;
  }
>(({ className, children, unstyled = false, ...props }, ref) => (
  <BaseNavigationMenu.Trigger
    ref={ref}
    className={unstyled ? className : cn(navigationMenuTriggerStyle, className)}
    {...props}
  >
    {children}
    <ChevronDown className="ml-1 h-3.5 w-3.5 transition duration-200 data-[popup-open]:rotate-180" />
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
    className={cn(
      "overflow-hidden rounded-2xl border border-[#e3dccf] bg-[#f7f4ef] text-[#1c1a18] shadow-[0_18px_50px_rgba(28,26,24,0.12)]",
      className
    )}
    {...props}
  />
));
NavigationMenuContent.displayName = "NavigationMenuContent";

const NavigationMenuLink = React.forwardRef<
  React.ElementRef<typeof BaseNavigationMenu.Link>,
  React.ComponentPropsWithoutRef<typeof BaseNavigationMenu.Link> & {
    unstyled?: boolean;
  }
>(({ className, unstyled = false, ...props }, ref) => (
  <BaseNavigationMenu.Link
    ref={ref}
    className={
      unstyled
        ? className
        : cn(
            "inline-flex w-full items-start rounded-2xl px-4 py-3 text-left transition-colors hover:bg-white/70 focus:bg-white/70 focus:outline-none",
            className
          )
    }
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
