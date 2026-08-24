"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import * as React from "react"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) { return <DialogPrimitive.Overlay data-slot="dialog-overlay" className={cn("fixed inset-0 z-50 bg-[#24130c]/45 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} {...props} /> }
function DialogContent({ className, children, showCloseButton = true, ...props }: React.ComponentProps<typeof DialogPrimitive.Content> & { showCloseButton?: boolean }) { return <DialogPortal><DialogOverlay /><DialogPrimitive.Content data-slot="dialog-content" className={cn("fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-[1.75rem] border border-white/70 bg-[#fffaf0]/95 p-6 shadow-[0_28px_80px_rgba(36,19,12,.35)] backdrop-blur-2xl duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 sm:p-7", className)} {...props}>{children}{showCloseButton && <DialogPrimitive.Close className="absolute top-4 right-4 grid size-10 place-items-center rounded-xl text-[#725b4c] transition hover:bg-[#f5dfba] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#934817]"><X className="size-4" /><span className="sr-only">Close</span></DialogPrimitive.Close>}</DialogPrimitive.Content></DialogPortal> }
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="dialog-header" className={cn("space-y-2 text-left", className)} {...props} /> }
function DialogFooter({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="dialog-footer" className={cn("flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end", className)} {...props} /> }
function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) { return <DialogPrimitive.Title data-slot="dialog-title" className={cn("text-xl font-extrabold tracking-[-.02em] text-[#2c1911]", className)} {...props} /> }
function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) { return <DialogPrimitive.Description data-slot="dialog-description" className={cn("text-sm leading-6 text-[#725b4c]", className)} {...props} /> }
export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogPortal, DialogTitle, DialogTrigger }
