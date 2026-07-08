"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { NavigationMenu as BaseNavigationMenu } from "@base-ui/react/navigation-menu";

import { cn } from "@/lib/utils";
import styles from "./navigation-menu.module.css";

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof BaseNavigationMenu.Root>,
  React.ComponentPropsWithoutRef<typeof BaseNavigationMenu.Root>
>(({ className, children, ...props }, ref) => (
  <BaseNavigationMenu.Root
    ref={ref}
    delay={50}
    closeDelay={80}
    className={cn("relative z-10 flex max-w-max flex-1 items-center justify-center", className)}
    {...props}
  >
    {children}
    <BaseNavigationMenu.Portal keepMounted>
      <BaseNavigationMenu.Positioner
        align="start"
        sideOffset={8}
        className={cn("z-50", styles.Positioner)}
      >
        <BaseNavigationMenu.Popup className={styles.Popup}>
          <BaseNavigationMenu.Viewport className={styles.Viewport} />
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
  return "inline-flex h-10 items-center justify-center rounded-full px-2.5 py-2 text-sm font-medium transition-colors focus:outline-none";
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
        styles.Content,
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
      "inline-flex w-full items-start rounded-2xl px-4 py-3 text-left transition-colors focus:outline-none",
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
