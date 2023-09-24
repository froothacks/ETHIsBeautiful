import clsx from "clsx";
import React from "react";

export default function Button({
  kind = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  kind?: "default" | "error";
}) {
  return (
    <button
      type="button"
      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      {...props}
    />
  );
}
