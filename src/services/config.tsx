export const variants = {
  hidden: { opacity: 0, height: 0 },
  enter: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
};
export const variantsHeight = {
  hidden: { height: 0 },
  enter: { opacity: 1, height: "auto" },
  exit: { height: 0 },
};

export const variantsHidden = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};
export const variantsScale = {
  visible: { opacity: 1, scale: 1 },
  hidden: { opacity: 0, scale: 0.96 },
  exit: { opacity: 0, scale: 0.96 },
};

export const variantsOpacity = {
  hidden: { opacity: 0 },
  enter: { opacity: 1 },
  exit: { opacity: 0 },
};

export const variantsToast = {
  visible: { opacity: 1, y: -70 },
  hidden: { opacity: 0, y: -0 },
  exit: { opacity: 0, y: -20 },
};

export const orderDifficult = {
  easy: 0,
  medium: 1,
  hard: 2,
  very_hard: 3,
};

export const timeCache = 10 * 60 * 60 * 1000;
export const statusStudentSession = { CANCELED: "CANCELED", REGISTERED: "REGISTERED" };
export const tinyKey = "6x8r5d5f32gnc03o4wf4pvu66vjl9tlo07w36t9dinmtyrl2";
export const center = import.meta.env.VITE_CENTER;

