import { domainCMS } from "@/services/helper";
import { useEffect, useState } from "react";
import { VolumeIcon } from "@/components/icons/svg";
import getBlobDuration from "get-blob-duration";

export const AudioPlayerId = ({ partId, id, className, index, refAudio, ...rest }: any) => {
  const url = domainCMS + "/assets/" + id;
  return (
    <div className={"w-full m-auto bg-neu7 lg:px-[20px] px-[12px] py-[22px] rounded-[20px] " + className}>
      <CustomPlayer partId={partId} {...rest} refAudio={refAudio} type="review" src={url} id={id + index} index={id + index} />
    </div>
  );
  index;
};

export const AudioPlayer = ({ index, src, ...rest }: any) => {
  return (
    <div className="w-full m-auto bg-neu7 lg:px-[35px] px-[12px] py-[22px] rounded-[20px]">
      <CustomPlayer {...rest} type="review" src={src} index={index} />
    </div>
  );
};

const CustomPlayer = ({ partId, isStart, type, src, className, index, refAudio = { current: null }, onPause = () => { }, onPlay = () => { } }: any) => {
  const indexNum = index;

  useEffect(() => {
    const audioPlayer = document.querySelector(`.audio-player-${indexNum}`) as any;
    const audio = new Audio(src) as any;
    let duration = 0;
    refAudio.current = audio;
    const durationchange = async () => {
      audio.volume = 0.75;
      duration = await getBlobDuration(src);
      audioPlayer.querySelector(".length").textContent = getTimeCodeFromNum(duration);
    };
    audio.addEventListener("durationchange", durationchange, false);
    const progressBar = audioPlayer.querySelector(".progress") as any;
    progressBar.style.width = 0 + "%"
    const timeupdate = (e: any) => {
      onPlay(e);
      if (audio?.currentTime == duration) {
        progressBar.style.width = 0 + "%";
        const iconPlayBtn = audioPlayer.querySelector(".toggle-play") as any;
        iconPlayBtn.classList.remove("pause") as any;
        iconPlayBtn.classList.add("play") as any;
        if (audioPlayer.querySelector(".current")) {
          audioPlayer.querySelector(".current").textContent = getTimeCodeFromNum(0);
        }
      } else {
        progressBar.style.width = (audio?.currentTime / duration) * 100 + "%";
        if (audioPlayer.querySelector(".current")) {
          audioPlayer.querySelector(".current").textContent = getTimeCodeFromNum(audio?.currentTime);
        }
      }
      if (iconPlayBtn.classList.contains("play")) {
        iconPlayBtn.classList.add("pause") as any;
        iconPlayBtn.classList.remove("play") as any;
      }
    };
    audio.addEventListener("timeupdate", timeupdate, false);
    const iconPlayBtn = audioPlayer.querySelector(".toggle-play") as any;
    audio.onpause = (e: any) => {
      onPause(e);
      iconPlayBtn.classList.remove("pause") as any;
      iconPlayBtn.classList.add("play") as any;
    };

    //click on timeline to skip around
    const timeline = audioPlayer.querySelector(".timeline") as any;
    const clickTimeLine = (e: any) => {
      const timelineWidth = window.getComputedStyle(timeline).width;
      const timeToSeek = (e.offsetX / parseInt(timelineWidth)) * duration;
      audio.currentTime = timeToSeek;
    };
    timeline.addEventListener("click", clickTimeLine, false);
    const volumeIcon = audioPlayer.querySelector(".volume-icon");
    var slider: any = audioPlayer.querySelector(".value-volume");
    let isVolume = false;
    let currentVolume = slider.value / 100;
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
    const playBtn = audioPlayer.querySelector(".play-container") as any;
    const playBtnClick = () => {
      if (audio.paused) {
        iconPlayBtn.classList.remove("play") as any;
        iconPlayBtn.classList.add("pause") as any;
        audio.play();
      } else {
        iconPlayBtn.classList.remove("pause") as any;
        iconPlayBtn.classList.add("play") as any;
        audio.pause();
      }
    };
    playBtn.addEventListener("click", playBtnClick);

    const volumButton = audioPlayer.querySelector(".volume-button");
    const volumButtonClick = () => {
      const volumeEl = audioPlayer.querySelector(".volume-container .volume") as any;
      audio.muted = !audio.muted;
      if (audio.muted) {
        volumeEl.classList.remove("icono-volumeMedium") as any;
        volumeEl.classList.add("icono-volumeMute") as any;
      } else {
        volumeEl.classList.add("icono-volumeMedium") as any;
        volumeEl.classList.remove("icono-volumeMute") as any;
      }
    };
    volumButton.addEventListener("click", volumButtonClick);

    //turn 128 seconds into 2:08
    function getTimeCodeFromNum(num: any) {
      if (num <= 1) return "00:01";
      let seconds: any = parseInt(num as any);
      let minutes: any = parseInt(((seconds as any) / 60) as any) as any;
      seconds -= minutes * 60;
      const hours: any = parseInt(((minutes as any) / 60) as any) as any;
      minutes -= hours * 60;

      if (hours === 0) return `${minutes?.length === 1 || minutes == "0" ? "0" + minutes : minutes}:${String(((seconds as any) % 60) as any).padStart(2 as any, 0 as any) as any}`;
      return `${String(hours?.length === 1 ? "0" + hours : hours).padStart(2 as any, 0 as any) as any}:${minutes?.length === 1 ? "0" + minutes : minutes}:${String(seconds % 60).padStart(2 as any, 0 as any) as any
        }`;
    }
    if (isStart == false) {
      if (playBtn) {
        playBtn.click();
      }
    }
    return () => {
      audio.pause();
      audio.removeEventListener("durationchange", durationchange);
      audio.removeEventListener("timeupdate", timeupdate);
      // volumeSlider.removeEventListener("click", volumClick);
      timeline.removeEventListener("click", clickTimeLine);
      volumeIcon.removeEventListener("click", volumeIconClick);
      playBtn.removeEventListener("click", playBtnClick);
      volumButton.removeEventListener("click", volumButtonClick);
    };
  }, [isStart, src]);

  return (
    <div className={className}>
      <audio controls style={{ display: "none" }}>
        <source src={src} type="audio/mp3" />
      </audio>
      <div className={`audio-player audio-player-${indexNum} ${type === "review" ? "flex items-center" : ""}`}>
        <div className={`timeline-wrap ${type === "review" ? "" : "mb-[10px]"}`}>
          <div className="play-container">
            <div className="toggle-play play"></div>
          </div>
          <div className="timeline ">
            <div className="progress">
              <span className="current"></span>
            </div>
          </div>
          <div className="time text-neu1 ml-[8px]">
            <div className="length" id={`duraTime-${partId}`}></div>
          </div>
        </div>
        <div className={`controls ${type === "review" ? "lg:ml-[12px] ml-[10px]" : ""}`}>
          <VolumeIcon className={`md:w-[20px] w-[18px] volume-icon lg:mr-[8px] mr-[8px]`} />
          <div className="volume-container">
            <div className="volume-button">
              <div className="volume icono-volumeMedium"></div>
            </div>
            <div className="current-volume slider volume-slider">
              <input type="range" min="0" max="100" className="value-volume" />
              <span className="volume-percentage"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CustomPlayer;
