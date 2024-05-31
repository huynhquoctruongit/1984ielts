import { useMediaQuery } from "usehooks-ts";

const useResponsive = () => {
  const isXs = useMediaQuery("(max-width: 639px)");
  const isSm = useMediaQuery("(max-width: 767px)");
  const isMd = useMediaQuery("(max-width: 1023px)");
  const isLg = useMediaQuery("(max-width: 1279px)");
  const isXl = useMediaQuery("(max-width: 1535px)");
  const is2xl = useMediaQuery("(min-width: 1536px)");
  return { isSm, isMd, isLg, isXl, is2xl, isXs };
};

export default useResponsive;

export const RenderIUByMedia = ({ xs, sm, md, lg, xl, xl2, children, isLoading, skeleton = null }: any) => {
  const { isSm, isMd, isLg, isXl, is2xl, isXs } = useResponsive();
  if (isLoading) return skeleton;
  if (isXs && xs) return xs;
  if (isSm && sm) return sm;
  if (isMd && md) return md;
  if (isLg && lg) return lg;
  if (isXl && xl) return xl;
  if (is2xl && xl2) return xl2;
  return children;
};
