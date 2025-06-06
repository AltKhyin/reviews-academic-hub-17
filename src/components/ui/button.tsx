
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { CSS_VARIABLES, APP_COLORS } from "@/utils/colorSystem"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "",
        destructive: "",
        outline: "",
        secondary: "",
        ghost: "",
        link: "underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Get variant-specific styles
    const getVariantStyles = () => {
      switch (variant) {
        case "default":
          return {
            backgroundColor: APP_COLORS.INFO,
            color: CSS_VARIABLES.TEXT_PRIMARY,
            borderColor: APP_COLORS.INFO,
          }
        case "destructive":
          return {
            backgroundColor: APP_COLORS.ERROR,
            color: CSS_VARIABLES.TEXT_PRIMARY,
          }
        case "outline":
          return {
            backgroundColor: 'transparent',
            color: CSS_VARIABLES.TEXT_PRIMARY,
            borderColor: CSS_VARIABLES.BORDER_DEFAULT,
            border: '1px solid',
          }
        case "secondary":
          return {
            backgroundColor: CSS_VARIABLES.TERTIARY_BG,
            color: CSS_VARIABLES.TEXT_PRIMARY,
          }
        case "ghost":
          return {
            backgroundColor: 'transparent',
            color: CSS_VARIABLES.TEXT_SECONDARY,
          }
        case "link":
          return {
            backgroundColor: 'transparent',
            color: APP_COLORS.INFO,
          }
        default:
          return {
            backgroundColor: APP_COLORS.INFO,
            color: CSS_VARIABLES.TEXT_PRIMARY,
          }
      }
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        style={{
          ...getVariantStyles(),
          ...style
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
