// ielts-1984 using Amplitude
const keyAmplitudeProductYoupass = "5b9375dca6952d4310999853468b185d";
const keyAmplitudeProduct1984 = "84e722030151bd14a16b3951485747ea";
const keyAmplitudeStag = "84e722030151bd14a16b3951485747ea";

const keyAmplitudeProd = import.meta.env.VITE_CENTER === "youpass" ? keyAmplitudeProductYoupass : keyAmplitudeProduct1984;
export const keyAmplitude = import.meta.env.VITE_CMS.includes("stg") ? keyAmplitudeStag : keyAmplitudeProd;
const ENVName = import.meta.env.VITE_CMS.includes("stg") ? "STAGING" : "PRODUCTION";
const isStaging = import.meta.env.VITE_CMS.includes("stg");
const isProduction = !import.meta.env.VITE_CMS.includes("stg");

const config = {
  keyAmplitude,
  ENVName,
  isStaging,
  isProduction,
};

export default config;

const enumTypeQuiz = {
  0: "Unknown",
  1: "Exercise",
  2: "Homework",
  3: "Quiz",
};

const enumTypeLesson = {
  0: "Unknown",
  1: "Lesson",
  2: "Video",
  3: "Extra video",
  4: "Extra material",
};

export const enumClass = {
  enumTypeQuiz,
  enumTypeLesson,
};

export const TypeSkill = {
  1: "reading",
  2: "listening",
  3: "writing",
  4: "speaking",
  5: "writing-self-practice",
};
