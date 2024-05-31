export const sendGAEvent = (name: string, option?: any) => {
  if (window && (window as any)?.dataLayer) {
    const dataLayer = (window as any).dataLayer;
    dataLayer.push({ event: name, option: option || {} });
  }
};

export const sendMetaPixel = (name: string, option?: any) => {
  // @ts-ignore
  window.fbq("track", name, option);
};

export const sendEvent = (name, option?: any) => {
  sendGAEvent(name, option || {});
  sendMetaPixel(name, option || {});
};
