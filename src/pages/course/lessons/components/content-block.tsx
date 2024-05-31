import Vimeo from "@u-wave/react-vimeo";
import WistiaPlayer from "@/components/system/wistia";
import { useEffect, useState, useRef } from "react";
import Viewer, { Worker } from "@phuocng/react-pdf-viewer";
import "@phuocng/react-pdf-viewer/cjs/react-pdf-viewer.css";

const ContentBlock = ({ data = [] }: any) => {
  return (
    <div className="py-5 md:py-10">
      {data.map((item, index) => {
        if (item.content_type === "text") return <TextComponent key={"content + " + index} data={item}></TextComponent>;
        if (item.content_type === "video") return <Video key={"content + " + index} data={item}></Video>;
        if (item.content_type === "image") return <Image key={"content + " + index} data={item}></Image>;
        if (item.content_type === "pdf") return <PDFComponent key={"content + " + index} data={item}></PDFComponent>;
      })}
    </div>
  );
};
export default ContentBlock;
const TextComponent = ({ data }: any) => {
  return <div dangerouslySetInnerHTML={{ __html: data?.content }}></div>;
};

const PDFComponent = ({ data }: any) => {
  return (
    <div>
      <div style={{ height: "750px" }}>
        <Viewer fileUrl={data?.value} />
      </div>
    </div>
  );
};

const Image = ({ data }: any) => {
  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: data?.content }}></div>
      <div className="w-full h-[500px] object-cover">
        <img src={data?.value} className="w-full h-full object-cover"></img>
      </div>
    </div>
  );
};
const Video = ({ data }: any) => {
  function getIdYoutube(url: any) {
    if (url) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      const videoId = match && match[2].length === 11 ? match[2] : null;
      return '<iframe width="560" height="515" src="//www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe>';
    }
  }
  const VimeoVideo = ({ src }) => {
    const [w, setWidth] = useState(0);
    useEffect(() => {
      const el: any = document.getElementById("vimeo-video");
      setWidth(el.offsetWidth);
    }, []);

    const width = Math.floor(w);
    const height = Math.floor((width * 9) / 16);

    return (
      <div className="w-full aspect-video rounded-md overflow-hidden" id="vimeo-video">
        {width && <Vimeo video={src} width={width} height={height} />}
      </div>
    );
  };

  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: data.content }}></div>
      {data?.value?.includes("youtube") && (
        <div className="content-cms w-full aspect-video rounded-md overflow-hidden" dangerouslySetInnerHTML={{ __html: getIdYoutube(data?.value || "") as any }}></div>
      )}
      {data?.value?.includes("wistia") && <WistiaPlayer videoId={data?.value} wrapper={"player-wistia"} />}
      {data?.value?.includes("vimeo") && <VimeoVideo src={data.value} />}
    </div>
  );
};
