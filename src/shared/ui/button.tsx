import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border border-primary/60 bg-transparent text-primary hover:bg-primary/10",
        ghost: "text-primary hover:bg-primary/10",
        secondary: "bg-secondary text-foreground hover:bg-secondary/80",
      },
      size: {
        default: "min-h-10 px-5 py-2",
        sm: "min-h-9 px-3 py-1",
        icon: "size-10",
        lg: "min-h-12 px-7 py-3",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);
export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    />
  ),
);
Button.displayName = "Button";
export { buttonVariants };
