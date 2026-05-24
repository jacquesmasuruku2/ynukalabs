import * as React from "react";

import { cn } from "@/lib/utils";
import { toControlledString } from "@/lib/safe-input";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, value, defaultValue, ...props }, ref) => {
    // Ensure textarea never receives undefined or null as value
    const textareaProps: any = { ...props };
    if (value !== undefined) {
      textareaProps.value = toControlledString(value);
    } else if (defaultValue != null) {
      textareaProps.defaultValue = toControlledString(defaultValue);
    } else {
      textareaProps.value = "";
    }

    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...textareaProps}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
