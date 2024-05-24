import { motion, AnimatePresence } from "framer-motion";
import { variantsToast } from "@/services/config";
import { CheckBadgeIcon, ExclamationTriangleIcon, XCircleIcon } from "@heroicons/react/20/solid";

const Toast = ({ toast }: any) => {
  const { message, status, show, closeToast } = toast;
  const getStatus: any = {
    warning: "#D8A408",
    fail: "#DC3B8A",
    success: "#01A446",
  };
  const getIcon: any = {
    warning: <ExclamationTriangleIcon fill={getStatus[status]} className="w-[28px]" />,
    fail: <XCircleIcon fill={getStatus[status]} className="w-[28px]" />,
    success: <CheckBadgeIcon fill={getStatus[status]} className="w-[28px]" />,
  };
  return (
    <AnimatePresence mode="wait">
      <div className="w-full flex justify-center">
        <div className="fixed z-[1111111] top-[100px]">
          {show && (
            <motion.div variants={variantsToast} initial="hidden" animate="visible" exit={"exit"} transition={{ duration: 0.3, type: "spring", stiffness: 100 }}>
              <div className={`message flex items-center justify-between shadow-box p-4 rounded toast-${status}`}>
                <div className="flex items-center">
                  <div className="mr-[5px]">{getIcon[status] as any}</div>
                  <span className="text-[14px] body-18-bold">{message}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
};

export default Toast;
