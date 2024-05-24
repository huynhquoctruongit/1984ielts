import { Variants } from "framer-motion";
const visible = { opacity: 1, y: 0, transition: { duration: 0.1, type: "spring", stiffness: 100 } };
export const itemVariants = {
  hidden: { opacity: 0, y: -4, transition: { duration: 0.2, type: "spring", stiffness: 100 } },
  visible,
};

export const oapcityVariants = {
  hidden: { opacity: 0, y: 0, transition: { duration: 0.1, type: "spring" } },
  visible,
};

export const animatParentOpacity = {
  open: {
    opacity: 1,
    transition: { duration: 0.2, staggerChildren: 0.07, delayChildren: 0.1 },
  },
  closed: {
    opacity: 0,
    transition: { duration: 0.2, staggerChildren: 0.05, staggerDirection: -1 },
  },
};
export const childrentSelect = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.02,
      // y: { stiffness: 10, velocity: -10 },
    },
  },
  closed: {
    y: 10,
    opacity: 0,
    transition: {
      duration: 0.1,
      y: { stiffness: 1000 },
    },
  },
};

export const transition = { duration: 100, type: "spring", stiffness: 100 };
export const tabContentVariants: Variants = {
  initial: {
    y: 10,
    opacity: 0,
  },
  enter: {
    y: 0,
    opacity: 1,
  },
  exit: {
    y: -10,
    opacity: 0,
  },
};
