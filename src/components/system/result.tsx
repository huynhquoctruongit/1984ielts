import { oapcityVariants } from "@/services/motion";
import { motion } from "framer-motion";
const Loading = ({ className }: any) => {
  return (
    <motion.div variants={oapcityVariants} initial="hidden" animate="visible" exit={"hidden"} className={"w-full flex items-center justify-center " + className}>
      <img className="w-16" src="/images/patato.png" alt="" />
    </motion.div>
  );
};

export default Loading;

export const NotFound = ({ className, message }: any) => {
  return (
    <motion.div variants={oapcityVariants} initial="hidden" animate="visible" exit={"hidden"} className={"w-full flex rounded-xl flex-col items-center justify-center " + className}>
      <img className="w-16" src=" /images/patato.png" alt="" />
      <div className="mt-6 font-medium text-xl text-black/40">{message}</div>
    </motion.div>
  );
};
