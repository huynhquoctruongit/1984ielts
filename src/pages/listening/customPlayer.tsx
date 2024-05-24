import { useEffect, useState } from "react";
import { VolumeIcon } from "@/components/icons/svg";
import axiosClient, { fetcherClient } from "@/libs/api/axios-client.ts";
import useSWR from "swr";
const cms = import.meta.env.VITE_CMS;
const CustomPlayer = ({ isUrl, isStart, type, src, size, className, index }: any) => {
  const indexNum = index;
  const [duraTime, setDura]: any = useState("");
  const [isVolume, setVolume]: any = useState(false);
  const [fileAudio, setFileAudio]: any = useState(false);

  useEffect(() => {
    const typeBlob = isUrl ? `${cms}/assets/${src}` : src;

    const audio = new Audio(typeBlob) as any;
    const audioPlayer = document.querySelector(`.audio-player-${indexNum}`) as any;

    let getSize: any = null;
    if (isUrl) {
      const response: any = axiosClient.get(`/files/${src}?fields=*`);
      const data = response.json();
      const file = data?.data?.data;
      getSize = (file?.filesize * 8) / 128000;
    } else {
      getSize = (size * 8) / 128000;
    }
    const dura: any = (audio.duration || getSize) * 1;
    setDura(getTimeCodeFromNum(dura * 1));

    const audioPlayer1 = document.querySelector(`.audio-player-${indexNum}`) as any;
    var getCurrentTime: any = null;

    audio.addEventListener("timeupdate", function () {
      getCurrentTime = audio.currentTime;
      audioPlayer.querySelector(".lengthTime").textContent = getTimeCodeFromNum(dura - audio.currentTime);
      audio.volume = 0.75;
    });

    //click on timeline to skip around
    const timeline = audioPlayer.querySelector(".timeline") as any;
    timeline.addEventListener(
      "click",
      (e: any) => {
        const timelineWidth = window.getComputedStyle(timeline).width;
        const timeToSeek = (e.offsetX / parseInt(timelineWidth)) * dura;
        audio.currentTime = timeToSeek;
      },
      false,
    );

    // const volumeSlider = audioPlayer.querySelector(".volume-slider") as any;
    // volumeSlider.addEventListener(
    //   "click",
    //   (e: any) => {
    //     const sliderWidth = window.getComputedStyle(volumeSlider).width;
    //     const newVolume = e.offsetX / parseInt(sliderWidth);
    //     audio.volume = newVolume;
    //     // let vid = document.querySelector(".audio-file");
    //     // vid.volume = newVolume;
    //     // console.log(vid, "vid");

    //     audioPlayer.querySelector(".volume-percentage").style.width = Math.round(newVolume * 100) + "%";
    //     if (audioPlayer.querySelector(".current-volume")) {
    //       audioPlayer.querySelector(".current-volume").textContent = Math.round(newVolume * 100) + "%";
    //     }
    //   },
    //   false,
    // );

    // const volumeIcon = audioPlayer.querySelector(".volume-icon");
    // volumeIcon.addEventListener(
    //   "click",
    //   (e: any) => {
    //     const sliderWidth = window.getComputedStyle(volumeSlider).width;
    //     const newVolume = e.offsetX / parseInt(sliderWidth);

    //     // if (audioPlayer.querySelector(".current-volume")) {
    //     //   audioPlayer.querySelector(".current-volume").textContent = newVolume * 100 + "%";
    //     // }
    //   },
    //   false,
    // );
    var slider: any = document.getElementById("myRange");
    let currentVolume = slider.value / 100;
    let isVolume = false;
    const volumeIcon = audioPlayer.querySelector(".volume-icon");
    const volumeIconClick = (e: any) => {
      isVolume = !isVolume;
      if (isVolume) {
        volumeIcon.style.opacity = "0.5";
        audio.volume = 0;
        slider.innerHTML = 0;
      } else {
        volumeIcon.style.opacity = "1";
        audio.volume = currentVolume;
        slider.innerHTML = slider?.value;
      }
    };
    let volumePercent = audioPlayer.querySelector(".volume-percentage");
    slider.oninput = function () {
      audio.volume = slider?.value / 100;
      isVolume = false;
      volumeIcon.style.opacity = "1";
      volumePercent.innerHTML = slider?.value + "%";
      volumePercent.style.left = slider?.value - 7 + "px";
    };

    volumeIcon.addEventListener("click", volumeIconClick, false);

   
    setInterval(() => {
      const progressBar = audioPlayer.querySelector(".progress") as any;
      if (audio.currentTime == audio.duration) {
        progressBar.style.width = 0 + "%";
        const iconPlayBtn = audioPlayer.querySelector(".toggle-play") as any;
        iconPlayBtn.classList.remove("pause") as any;
        iconPlayBtn.classList.add("play") as any;
        audio.pause();
        if (audioPlayer.querySelector(".current")) {
          audioPlayer.querySelector(".current").textContent = getTimeCodeFromNum(0);
        }
      } else {
        progressBar.style.width = (audio.currentTime / dura) * 100 + "%";
        if (audioPlayer.querySelector(".current")) {
          audioPlayer.querySelector(".current").textContent = getTimeCodeFromNum(audio.currentTime);
        }
      }
    }, 500);

    const playBtn = audioPlayer.querySelector(".play-container") as any;
    const iconPlayBtn = audioPlayer.querySelector(".toggle-play") as any;
    playBtn.addEventListener(
      "click",
      () => {
        if (audio) {
          if (audio.paused) {
            iconPlayBtn.classList.remove("play") as any;
            iconPlayBtn.classList.add("pause") as any;
            audio.play();
          } else {
            iconPlayBtn.classList.remove("pause") as any;
            iconPlayBtn.classList.add("play") as any;
            audio.pause();
          }
        }
      },
      false,
    );

    audioPlayer.querySelector(".volume-button").addEventListener("click", () => {
      const volumeEl = audioPlayer.querySelector(".volume-container .volume") as any;
      audio.muted = !audio.muted;
      if (audio.muted) {
        volumeEl.classList.remove("icono-volumeMedium") as any;
        volumeEl.classList.add("icono-volumeMute") as any;
      } else {
        volumeEl.classList.add("icono-volumeMedium") as any;
        volumeEl.classList.remove("icono-volumeMute") as any;
      }
    });

    //turn 128 seconds into 2:08
    function getTimeCodeFromNum(num: any) {
      let seconds: any = parseInt(num as any);
      let minutes: any = parseInt(((seconds as any) / 60) as any) as any;
      seconds -= minutes * 60;
      const hours: any = parseInt(((minutes as any) / 60) as any) as any;
      minutes -= hours * 60;

      if (hours === 0) return `${minutes?.length === 1 || minutes == "0" ? "0" + minutes : minutes}:${String(((seconds as any) % 60) as any).padStart(2 as any, 0 as any) as any}`;
      return `${String(hours?.length === 1 ? "0" + hours : hours).padStart(2 as any, 0 as any) as any}:${minutes?.length === 1 ? "0" + minutes : minutes}:${
        String(seconds % 60).padStart(2 as any, 0 as any) as any
      }`;
    }
    if (isStart == false) {
      const playBtn = audioPlayer.querySelector(".play-container") as any;
      if (playBtn && type !== "review") {
        playBtn.click();
      }
    }

    return () => {
      const playBtn = audioPlayer.querySelector(".play-container") as any;
      playBtn.click();
      audio.pause();
    };
  }, [isStart, size, isUrl]);

  return (
    <div className={className}>
      <audio className="audio-file" controls style={{ display: "none" }}>
        <source src={src} type="audio/mp3" />
      </audio>
      <div className={`audio-player flex items-center audio-player-${indexNum} ${type === "review" ? "flex items-center" : ""}`}>
        <div className={`timeline-wrap`}>
          <div className="play-container">
            <div className="toggle-play play"></div>
          </div>
          <div className="timeline">
            <div className="progress">
              <span className="current"></span>
            </div>
          </div>
          <div className="time text-neu1 ml-[8px]">
            <div className="lengthTime" id="duraTime">
              {duraTime}
            </div>
          </div>
        </div>

        <div className={`controls ${type === "review" ? "ld:ml-[20px] ml-[10px]" : ""}`}>
          <VolumeIcon onClick={() => setVolume(!isVolume)} className={`volume-icon lg:mr-[12px] mr-[8px] ${isVolume ? "opacity-[0.5]" : "opacity-[1]"}`} />
          <div className="volume-container">
            <div className="volume-button">
              <div className="volume icono-volumeMedium"></div>
            </div>
            <div className="current-volume slider volume-slider">
              <input type="range" min="0" max="100" className="value-volume" id="myRange" />
              <span className="volume-percentage"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CustomPlayer;
