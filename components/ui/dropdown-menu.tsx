"use client"

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
const DropdownMenuGroup = DropdownMenuPrimitive.Group
const DropdownMenuPortal = DropdownMenuPrimitive.Portal
const DropdownMenuSub = DropdownMenuPrimitive.Sub
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

function DropdownMenuSubTrigger({ className, inset, children, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & { inset?: boolean }) {
  return <DropdownMenuPrimitive.SubTrigger data-slot="dropdown-menu-sub-trigger" data-inset={inset} className={cn("focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none [&_svg:not([class*='text-'])]:text-muted-foreground", inset && "pl-8", className)} {...props}>{children}<ChevronRight className="ml-auto size-4" /></DropdownMenuPrimitive.SubTrigger>
}

function DropdownMenuSubContent({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return <DropdownMenuPrimitive.SubContent data-slot="dropdown-menu-sub-content" className={cn("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 min-w-32 origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg", className)} {...props} />
}

function DropdownMenuContent({ className, sideOffset = 4, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return <DropdownMenuPortal><DropdownMenuPrimitive.Content data-slot="dropdown-menu-content" sideOffset={sideOffset} className={cn("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 min-w-48 origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg", className)} {...props} /></DropdownMenuPortal>
}

function DropdownMenuItem({ className, inset, variant = "default", ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & { inset?: boolean; variant?: "default" | "destructive" }) {
  return <DropdownMenuPrimitive.Item data-slot="dropdown-menu-item" data-inset={inset} data-variant={variant} className={cn("focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 flex min-h-10 cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none", inset && "pl-8", className)} {...props} />
}

function DropdownMenuCheckboxItem({ className, children, checked, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return <DropdownMenuPrimitive.CheckboxItem data-slot="dropdown-menu-checkbox-item" className={cn("focus:bg-accent focus:text-accent-foreground flex min-h-10 cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none", className)} checked={checked} {...props}><span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center"><DropdownMenuPrimitive.ItemIndicator><Check className="size-4" /></DropdownMenuPrimitive.ItemIndicator></span>{children}</DropdownMenuPrimitive.CheckboxItem>
}

function DropdownMenuRadioItem({ className, children, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return <DropdownMenuPrimitive.RadioItem data-slot="dropdown-menu-radio-item" className={cn("focus:bg-accent focus:text-accent-foreground flex min-h-10 cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none", className)} {...props}><span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center"><DropdownMenuPrimitive.ItemIndicator><Circle className="size-2 fill-current" /></DropdownMenuPrimitive.ItemIndicator></span>{children}</DropdownMenuPrimitive.RadioItem>
}

function DropdownMenuLabel({ className, inset, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }) {
  return <DropdownMenuPrimitive.Label data-slot="dropdown-menu-label" data-inset={inset} className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)} {...props} />
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return <DropdownMenuPrimitive.Separator data-slot="dropdown-menu-separator" className={cn("bg-border -mx-1 my-1 h-px", className)} {...props} />
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) { return <span data-slot="dropdown-menu-shortcut" className={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)} {...props} /> }

export { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger }
