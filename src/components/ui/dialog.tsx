"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./button";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  /** Replaces default footer with custom content */
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeMap = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg" } as const;

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: DialogProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Trap scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        ref={ref}
        className={cn(
          "relative w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-6",
          sizeMap[size],
        )}
      >
        <div className="mb-4">
          <h2 id="dialog-title" className="text-lg font-bold text-gray-900">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>

        {children && <div className="mb-5">{children}</div>}

        {footer !== undefined ? (
          footer
        ) : (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Confirm dialog — yes/no variant */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  danger = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            size="sm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    />
  );
}
