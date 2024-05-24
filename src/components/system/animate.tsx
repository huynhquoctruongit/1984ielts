import { oapcityVariants } from "@/services/motion";
import { motion } from "framer-motion";
export const WrapAnimateOpacity = ({ children }: any) => {
  return (
    <motion.div variants={oapcityVariants} initial="hidden" animate="visible" exit="hidden">
      {children}
    </motion.div>
  );
};
