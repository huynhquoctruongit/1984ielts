import * as amplitude from "@amplitude/analytics-browser";
import config from "./constant";

export const getTypeByUrl = () => {
  const url = window.location.pathname;
  if (url.includes("writing")) return "Writing";
  if (url.includes("speaking")) return "Speaking";
  if (url.includes("reading")) return "Reading";
  if (url.includes("listening")) return "Listening";
  return "";
};

export const amplitudeSendTrack = (name: string, data: any) => {
  if (config.isStaging) return;
  
  const location = window.location.pathname;
  amplitude.track(name, { ...data, "Page URL": location });
};

export default amplitude;
