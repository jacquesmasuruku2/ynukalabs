import * as React from "react";

import { cn } from "@/lib/utils";
import { toControlledString } from "@/lib/safe-input";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, value, defaultValue, ...props }, ref) => {
    // Avoid passing uncontrolled values like undefined/null to React inputs.
    const isCheckbox = type === "checkbox" || type === "radio";
    const inputProps: any = { ...props };
    if (!isCheckbox) {
      if (value !== undefined) {
        inputProps.value = toControlledString(value);
      } else if (defaultValue != null) {
        inputProps.defaultValue = toControlledString(defaultValue);
      } else {
        inputProps.value = "";
      }
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...inputProps}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
