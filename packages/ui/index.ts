import * as React from "react";

// ==========================================
// BUTTON COMPONENT
// ==========================================
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-sans font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#4F8CFF] disabled:opacity-50 disabled:pointer-events-none rounded-lg select-none cursor-pointer";
  
  const variantClasses =
    variant === "primary"
      ? "bg-[#4F8CFF] hover:bg-[#3b7cee] text-white shadow-[0_4px_12px_rgba(79,140,255,0.2)] hover:shadow-[0_4px_16px_rgba(79,140,255,0.35)]"
      : "bg-[#1B1B1B] hover:bg-[#262626] text-[#B5B5B5] border border-white/8 hover:text-white";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return React.createElement(
    "button",
    {
      ...props,
      className: `${baseClasses} ${variantClasses} ${sizeClasses[size]} ${className}`,
    },
    children
  );
};

// ==========================================
// ICON BUTTON COMPONENT
// ==========================================
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export const IconButton: React.FC<IconButtonProps> = ({
  variant = "secondary",
  children,
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center p-2 rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#4F8CFF] disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer";

  const variantClasses = {
    primary: "bg-[#4F8CFF] hover:bg-[#3b7cee] text-white",
    secondary: "bg-[#1B1B1B] hover:bg-[#262626] text-[#B5B5B5] border border-white/8 hover:text-white",
    ghost: "bg-transparent hover:bg-white/5 text-[#B5B5B5] hover:text-white",
  };

  return React.createElement(
    "button",
    {
      ...props,
      className: `${baseClasses} ${variantClasses[variant]} ${className}`,
    },
    children
  );
};

// ==========================================
// INPUT COMPONENT
// ==========================================
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, className = "", ...props }, ref) => {
    const baseClasses =
      "w-full px-4 py-2 rounded-lg bg-[#141414] border text-white placeholder-[#757575] font-sans text-sm focus:outline-none transition-all duration-150";
    
    const borderClasses = error
      ? "border-[#FF5F56] focus:ring-2 focus:ring-[#FF5F56]/20"
      : "border-white/8 focus:border-[#4F8CFF] focus:ring-2 focus:ring-[#4F8CFF]/20";

    return React.createElement("input", {
      ...props,
      ref,
      className: `${baseClasses} ${borderClasses} ${className}`,
    });
  }
);
Input.displayName = "Input";

// ==========================================
// CARD COMPONENT
// ==========================================
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  hoverable = false,
  children,
  className = "",
  ...props
}) => {
  const baseClasses = "bg-[#141414] border border-white/8 rounded-xl p-5 overflow-hidden transition-all duration-300";
  const hoverClasses = hoverable
    ? "hover:border-white/15 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:-translate-y-0.5"
    : "";

  return React.createElement(
    "div",
    {
      ...props,
      className: `${baseClasses} ${hoverClasses} ${className}`,
    },
    children
  );
};

// ==========================================
// SECTION COMPONENT
// ==========================================
export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: "sm" | "md" | "lg";
}

export const Section: React.FC<SectionProps> = ({
  spacing = "md",
  children,
  className = "",
  ...props
}) => {
  const paddingClasses = {
    sm: "py-8 md:py-12",
    md: "py-16 md:py-24",
    lg: "py-24 md:py-32",
  };

  return React.createElement(
    "section",
    {
      ...props,
      className: `${paddingClasses[spacing]} ${className}`,
    },
    children
  );
};

// ==========================================
// CONTAINER COMPONENT
// ==========================================
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  clean?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  clean = false,
  children,
  className = "",
  ...props
}) => {
  const baseClasses = clean ? "mx-auto w-full" : "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

  return React.createElement(
    "div",
    {
      ...props,
      className: `${baseClasses} ${className}`,
    },
    children
  );
};

// ==========================================
// BADGE COMPONENT
// ==========================================
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "error" | "info" | "muted";
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "info",
  children,
  className = "",
  ...props
}) => {
  const baseClasses = "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold select-none font-sans";
  
  const variantClasses = {
    success: "bg-[#3DDC84]/10 text-[#3DDC84] border border-[#3DDC84]/20",
    warning: "bg-[#FFB547]/10 text-[#FFB547] border border-[#FFB547]/20",
    error: "bg-[#FF5F56]/10 text-[#FF5F56] border border-[#FF5F56]/20",
    info: "bg-[#4F8CFF]/10 text-[#4F8CFF] border border-[#4F8CFF]/20",
    muted: "bg-white/5 text-[#757575] border border-white/5",
  };

  return React.createElement(
    "span",
    {
      ...props,
      className: `${baseClasses} ${variantClasses[variant]} ${className}`,
    },
    children
  );
};

// ==========================================
// TOOLTIP COMPONENT (FOUNDATION)
// ==========================================
export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  className = "",
  ...props
}) => {
  return React.createElement(
    "div",
    {
      ...props,
      className: `group relative inline-block ${className}`,
    },
    children,
    React.createElement(
      "div",
      {
        className:
          "absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-xs -translate-x-1/2 scale-95 rounded bg-[#1B1B1B] border border-white/8 px-2 py-1 text-xs text-[#B5B5B5] opacity-0 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100 pointer-events-none font-sans shadow-lg",
      },
      content
    )
  );
};

// ==========================================
// MODAL COMPONENT (FOUNDATION)
// ==========================================
export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
  ...props
}) => {
  if (!isOpen) return null;

  return React.createElement(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center p-4",
    },
    // Backdrop
    React.createElement("div", {
      className: "fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity",
      onClick: onClose,
    }),
    // Dialog Body
    React.createElement(
      "div",
      {
        ...props,
        className: `relative z-10 w-full max-w-md rounded-2xl bg-[#141414] border border-white/8 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden ${className}`,
      },
      children
    )
  );
};

// ==========================================
// LOADING SPINNER COMPONENT
// ==========================================
export interface LoadingSpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: "sm" | "md" | "lg";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
  ...props
}) => {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return React.createElement(
    "svg",
    {
      ...props,
      className: `animate-spin text-[#4F8CFF] ${sizeMap[size]} ${className}`,
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
    },
    React.createElement("circle", {
      className: "opacity-25",
      cx: "12",
      cy: "12",
      r: "10",
      stroke: "currentColor",
      strokeWidth: "4",
    }),
    React.createElement("path", {
      className: "opacity-75",
      fill: "currentColor",
      d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z",
    })
  );
};

// ==========================================
// SKELETON COMPONENT
// ==========================================
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rectangular" | "circular";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = "rectangular",
  className = "",
  ...props
}) => {
  const shapeClass =
    variant === "circular"
      ? "rounded-full"
      : variant === "text"
        ? "rounded h-4 w-full"
        : "rounded-lg";

  return React.createElement("div", {
    ...props,
    className: `animate-pulse bg-white/5 ${shapeClass} ${className}`,
  });
};

// ==========================================
// DIVIDER COMPONENT
// ==========================================
export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export const Divider: React.FC<DividerProps> = ({
  orientation = "horizontal",
  className = "",
  ...props
}) => {
  const orientationClasses =
    orientation === "horizontal"
      ? "h-[1px] w-full bg-white/8"
      : "w-[1px] h-full bg-white/8";

  return React.createElement("div", {
    ...props,
    className: `${orientationClasses} ${className}`,
  });
};
