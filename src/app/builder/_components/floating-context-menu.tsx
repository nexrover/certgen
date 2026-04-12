"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

/* ── Types ────────────────────────────────────────────── */

interface SelectionBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface FloatingContextMenuProps {
  bounds: SelectionBounds;
  isLocked: boolean;
  hasCopied: boolean;
  onDuplicate: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onBringToFront: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onSendToBack: () => void;
  onLock: () => void;
}

/* ── Platform helpers ─────────────────────────────────── */

const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);
const mod = isMac ? "⌘" : "Ctrl";

/* ── Component ────────────────────────────────────────── */

export function FloatingContextMenu({
  bounds,
  isLocked,
  hasCopied,
  onDuplicate,
  onDelete,
  onCopy,
  onPaste,
  onBringToFront,
  onBringForward,
  onSendBackward,
  onSendToBack,
  onLock,
}: FloatingContextMenuProps) {
  const [showMore, setShowMore] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ left: number; top: number } | null>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* Close dropdown when clicking outside */
  useEffect(() => {
    if (!showMore) return;
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        moreRef.current &&
        !moreRef.current.contains(e.target as Node)
      ) {
        setShowMore(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMore]);

  /* Close dropdown when selection changes */
  useEffect(() => {
    setShowMore(false);
  }, [bounds.left, bounds.top, bounds.width, bounds.height]);

  /* Calculate dropdown position: the dialog's left edge aligns with
     the floating toolbar's right edge, opening to the right of the
     3-dot button — matching the reference design exactly. */
  const openDropdown = useCallback(() => {
    if (moreRef.current) {
      const toolbarEl = moreRef.current.closest('[class*="rounded-lg"]') as HTMLElement | null;
      const anchor = toolbarEl || moreRef.current;
      const rect = anchor.getBoundingClientRect();
      const btnRect = moreRef.current.getBoundingClientRect();
      setDropdownPos({
        left: rect.right - 30,
        top: btnRect.top + 36,
      });
    }
    setShowMore((v) => !v);
  }, []);

  /* ── Menu position ──────────────────────────────────── */

  const menuLeft = bounds.left + bounds.width / 2;
  let menuTop = bounds.top - 10;
  let above = true;
  // If the element is very close to the top, show menu below it
  if (menuTop < 40) {
    menuTop = bounds.top + bounds.height + 10;
    above = false;
  }

  /* ── Render ──────────────────────────────────────────── */

  return (
    <>
      {/* Floating mini-toolbar */}
      <div
        className="absolute z-30 pointer-events-auto"
        style={{
          left: `${menuLeft}px`,
          top: `${menuTop}px`,
          transform: above
            ? "translateX(-50%) translateY(-100%)"
            : "translateX(-50%)",
          animation: "context-menu-pop 0.15s ease-out",
        }}
      >
        <div className="flex items-center gap-0.5 rounded-lg bg-white p-1 shadow-lg ring-1 ring-black/[0.08]">
          {/* Duplicate */}
          <button
            id="ctx-duplicate"
            onClick={onDuplicate}
            className="flex h-7 w-7 items-center justify-center rounded text-gray-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
            title="Duplicate"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>

          {/* Delete */}
          <button
            id="ctx-delete"
            onClick={onDelete}
            className="flex h-7 w-7 items-center justify-center rounded text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
            title="Delete"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>

          {/* 3-dot More */}
          <button
            id="ctx-more"
            ref={moreRef}
            onClick={openDropdown}
            className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${showMore
              ? "bg-indigo-100 text-indigo-700"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
            title="More options"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="12" cy="19" r="1.8" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── More Options Dropdown (via portal) ────────── */}
      {showMore &&
        dropdownPos &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] w-56 rounded-xl bg-white py-1.5 shadow-2xl ring-1 ring-black/[0.08]"
            style={{
              left: `${dropdownPos.left}px`,
              top: `${dropdownPos.top}px`,
              animation: "dropdown-fade 0.12s ease-out",
            }}
          >
            {/* Copy */}
            <DropdownItem
              id="ctx-copy"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              }
              label="Copy"
              shortcut={`${mod}+C`}
              onClick={() => { onCopy(); setShowMore(false); }}
            />
            {/* Paste */}
            <DropdownItem
              id="ctx-paste"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" />
                </svg>
              }
              label="Paste"
              shortcut={`${mod}+V`}
              disabled={!hasCopied}
              onClick={() => { onPaste(); setShowMore(false); }}
            />

            <Separator />

            {/* Bring to Front */}
            <DropdownItem
              id="ctx-bring-to-front"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="17 11 12 6 7 11" />
                  <polyline points="17 18 12 13 7 18" />
                </svg>
              }
              label="Bring to Front"
              shortcut="]"
              onClick={() => { onBringToFront(); setShowMore(false); }}
            />
            {/* Bring Forward */}
            <DropdownItem
              id="ctx-bring-forward"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              }
              label="Bring Forward"
              shortcut={`${mod}+]`}
              onClick={() => { onBringForward(); setShowMore(false); }}
            />
            {/* Send Backward */}
            <DropdownItem
              id="ctx-send-backward"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              }
              label="Send Backward"
              shortcut={`${mod}+[`}
              onClick={() => { onSendBackward(); setShowMore(false); }}
            />
            {/* Send to Back */}
            <DropdownItem
              id="ctx-send-to-back"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="7 13 12 18 17 13" />
                  <polyline points="7 6 12 11 17 6" />
                </svg>
              }
              label="Send to Back"
              shortcut="["
              onClick={() => { onSendToBack(); setShowMore(false); }}
            />

            <Separator />

            {/* Lock */}
            <DropdownItem
              id="ctx-lock"
              icon={
                isLocked ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                  </svg>
                )
              }
              label={isLocked ? "Unlock" : "Lock"}
              shortcut={`${mod}+L`}
              onClick={() => { onLock(); setShowMore(false); }}
              accent={isLocked}
            />
          </div>,
          document.body
        )}
    </>
  );
}

/* ── Sub-components ────────────────────────────────────── */

function Separator() {
  return <div className="my-1 mx-2 h-px bg-gray-100" />;
}

interface DropdownItemProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  shortcut: string;
  onClick: () => void;
  disabled?: boolean;
  accent?: boolean;
}

function DropdownItem({
  id,
  icon,
  label,
  shortcut,
  onClick,
  disabled,
  accent,
}: DropdownItemProps) {
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-between px-3 py-[7px] text-[13px] transition-colors ${disabled
        ? "cursor-not-allowed text-gray-300"
        : accent
          ? "text-amber-600 hover:bg-amber-50"
          : "text-gray-700 hover:bg-gray-50"
        }`}
    >
      <span className="flex items-center gap-2.5">
        <span className={disabled ? "opacity-40" : "opacity-70"}>{icon}</span>
        {label}
      </span>
      <kbd
        className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${disabled
          ? "bg-gray-50 text-gray-300"
          : "bg-gray-100 text-gray-400"
          }`}
      >
        {shortcut}
      </kbd>
    </button>
  );
}
