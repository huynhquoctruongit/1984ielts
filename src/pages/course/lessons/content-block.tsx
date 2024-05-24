import Vimeo from "@u-wave/react-vimeo";
import WistiaPlayer from "@/components/system/wistia";
import { useEffect, useState, useRef } from "react";
import { Viewer } from '@react-pdf-viewer/core';
const ContentBlock = ({ data }: any) => {
    const dataType = data.content_type
    switch (dataType) {
        case "text":
            return <TextComponent data={data}></TextComponent>
        case "video":
            return <Video data={data}></Video>
        case "image":
            return <Image data={data}></Image>
        case "pdf":
            return <PDFComponent data={data}></PDFComponent>
        default:
            break;
    }
}
export default ContentBlock
const TextComponent = ({ data }: any) => {
    return (
        <div dangerouslySetInnerHTML={{ __html: data?.content }}></div >
    )
}

const PDFComponent = ({ data }: any) => {

    return (
        <div className="m-[20px]">

            <div
                style={{
                    border: '1px solid rgba(0, 0, 0, 0.3)',
                    height: '750px',
                }}
            >
                <Viewer fileUrl={data?.value} />
            </div>
        </div>

    )
}

const Image = ({ data }: any) => {
    return (
        <div>
            <div dangerouslySetInnerHTML={{ __html: data?.content }}></div>
            <div className="w-full h-[500px] object-cover">
                <img src={data?.value} className="w-full h-full object-cover"></img>
            </div>
        </div>
    )
}
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
            {data?.value?.includes("youtube") && <div className="content-cms w-full aspect-video rounded-md overflow-hidden" dangerouslySetInnerHTML={{ __html: getIdYoutube(data?.value || "") as any }}></div>}
            {data?.value?.includes("wistia") && <WistiaPlayer videoId={data?.value} wrapper={"player-wistia"} />}
            {data?.value?.includes("vimeo") && <VimeoVideo src={data.value} />}
        </div>
    )
}