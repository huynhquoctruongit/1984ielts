import { useWindowSize } from "usehooks-ts";
import Vimeo from "@u-wave/react-vimeo";

const VimeoVideo = ({ src, aspect = 16 / 9 }) => {
  const size = useWindowSize();
  const width = Math.floor(size.width);
  const height = Math.floor(width / aspect);
  console.log(width, height);

  return (
    <div className="w-full lg:aspect-video md:rounded-md overflow-hidden" id="vimeo-video">
      {width && <Vimeo video={src} width={width} height={height} />}
    </div>
  );
};

export default VimeoVideo;
