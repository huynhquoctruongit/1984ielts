import { cva, cx } from "class-variance-authority";

const button = cva("button", {
  variants: {
    variant: {
      primary: "bg-primary-01 text-white border-transparent duration-200 hover:shadow-sm hover:bg-primary-01/80 web-button",
      secondary: ["bg-white", "text-gray-800", "border-gray-400", "hover:bg-gray-100"],
      default: [""],
    },
    size: {
      small: ["text-sm", "py-1", "px-2"],
      medium: ["text-base", "py-2", "px-4"],
    },
  },
  compoundVariants: [{ variant: "primary", size: "medium", class: "" }],
  defaultVariants: {
    variant: "primary",
    size: "medium",
  },
});

export const Button = ({ children, className, disbaled, onClick, variant = "default" }: any) => {
  const onPress = () => {
    !disbaled && onClick && onClick();
  };
  const base = "cursor-pointer h-[40px] px-5 w-fit duration-200 rounded-full flex items-center " + (disbaled ? "opacity-50 cursor-default" : "web-button");
  return (
    <button onClick={onPress} className={cx(base, button({ variant: variant, size: "medium" }), className)}>
      {children}
    </button>
  );
};
export default Button;
