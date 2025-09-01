"use client";
import React from "react";

export function Input({
  label,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label && (
        <span className="text-gray-600 dark:text-gray-300">{label}</span>
      )}
      <input
        {...props}
        className={`px-3 py-2 rounded-xl border border-gray-300 bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-black ${className}`}
      />
    </label>
  );
}
