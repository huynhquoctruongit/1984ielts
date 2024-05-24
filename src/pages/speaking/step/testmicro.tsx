import { useState, useEffect } from "react";
import { TabIcon, ArrowIcon, MicroIcon, PauseIcon, RefeshIcon, Play2Icon } from "@/components/icons/index";
import Button from "@/components/ui/button/index";
import { Link, useParams, useNavigate } from "react-router-dom";
import CustomPlayer from "../../listening/customPlayer";
import SkipTestmic from "@/components/layouts/modal/skip-testmic/index";
import Modal from "@/components/layouts/modal/template";

export const TestMicro = () => {
  const [isRec, setRec]: any = useState(null);
  const [isSkip, setSkip]: any = useState(false);
  const navigate = useNavigate();
  const [audioUrl, setAudioUrl]: any = useState(null);
  const { quizId } = useParams();

  const onRecording: any = () => {
    setRec(!isRec);
  };
  useEffect(() => {
    var microphoneButton: any = document.getElementsByClassName("start-recording-button")[0];
    var stopRecordingButton: any = document.getElementsByClassName("stop-recording-button")[0];
    var cancelRecordingButton: any = document.getElementsByClassName("cancel-recording-button")[0];
    var elapsedTimeTag: any = document.getElementsByClassName("elapsed-time")[0];
    var closeBrowserNotSupportedBoxButton: any = document.getElementsByClassName("close-browser-not-supported-box")[0];
    var overlay: any = document.getElementsByClassName("overlay")[0];
    var audioElement: any = document.getElementsByClassName("audio-element")[0];
    var audioElementSource: any = document.getElementsByClassName("audio-element")[0]?.getElementsByTagName("source")[0];
    var textIndicatorOfAudiPlaying: any = document.getElementsByClassName("text-indication-of-audio-playing")[0];
    if (microphoneButton) {
      microphoneButton.onclick = startAudioRecording;
    }
    if (stopRecordingButton) {
      stopRecordingButton.onclick = stopAudioRecording;
    }
    if (cancelRecordingButton) {
      cancelRecordingButton.onclick = cancelAudioRecording;
    }
    if (closeBrowserNotSupportedBoxButton) {
      closeBrowserNotSupportedBoxButton.onclick = hideBrowserNotSupportedOverlay;
    }
    if (audioElement) {
      audioElement.onended = hideTextIndicatorOfAudioPlaying;
    }

    function handleDisplayingRecordingControlButtons() {
      handleElapsedRecordingTime();
    }

    function handleHidingRecordingControlButtons() {
      clearInterval(elapsedTimeTimer);
    }

    function displayBrowserNotSupportedOverlay() {
      // overlay.classList.remove("hide");
    }

    function hideBrowserNotSupportedOverlay() {
      // overlay.classList.add("hide");
    }

    function createSourceForAudioElement() {
      let sourceElement = document.createElement("source");
      audioElement.appendChild(sourceElement);

      audioElementSource = sourceElement;
    }

    function displayTextIndicatorOfAudioPlaying() {
      // textIndicatorOfAudiPlaying.classList.remove("hide");
    }

    function hideTextIndicatorOfAudioPlaying() {
      // textIndicatorOfAudiPlaying.classList.add("hide");
    }

    var audioRecordStartTime: any;
    var maximumRecordingTimeInHours: any = 1;
    var elapsedTimeTimer: any;

    function startAudioRecording() {
      let recorderAudioIsPlaying = !audioElement.paused; // the paused property tells whether the media element is paused or not
      if (recorderAudioIsPlaying) {
        audioElement.pause();
        hideTextIndicatorOfAudioPlaying();
      }

      audioRecorder
        .start()
        .then(() => {
          audioRecordStartTime = new Date();
          handleDisplayingRecordingControlButtons();
        })
        .catch((error: any) => {
          if (error.message.includes("mediaDevices API or getUserMedia method is not supported in this browser.")) {
            displayBrowserNotSupportedOverlay();
          }

          switch (error.name) {
            case "AbortError": //error from navigator.mediaDevices.getUserMedia
              console.log("An AbortError has occured.");
              break;
            case "NotAllowedError": //error from navigator.mediaDevices.getUserMedia
              console.log("A NotAllowedError has occured. User might have denied permission.");
              break;
            case "NotFoundError": //error from navigator.mediaDevices.getUserMedia
              console.log("A NotFoundError has occured.");
              break;
            case "NotReadableError": //error from navigator.mediaDevices.getUserMedia
              console.log("A NotReadableError has occured.");
              break;
            case "SecurityError": //error from navigator.mediaDevices.getUserMedia or from the MediaRecorder.start
              console.log("A SecurityError has occured.");
              break;
            case "TypeError": //error from navigator.mediaDevices.getUserMedia
              console.log("A TypeError has occured.");
              break;
            case "InvalidStateError": //error from the MediaRecorder.start
              console.log("An InvalidStateError has occured.");
              break;
            case "UnknownError": //error from the MediaRecorder.start
              console.log("An UnknownError has occured.");
              break;
            default:
              console.log("An error occured with the error name " + error.name);
          }
        });
    }
    function stopAudioRecording() {
      audioRecorder
        .stop()
        .then((audioAsblob: any) => {
          playAudio(audioAsblob);
          handleHidingRecordingControlButtons();
        })
        .catch((error: any) => {
          switch (error.name) {
            case "InvalidStateError": //error from the MediaRecorder.stop
              console.log("An InvalidStateError has occured.");
              break;
            default:
              console.log("An error occured with the error name " + error.name);
          }
        });
    }

    function cancelAudioRecording() {
      audioRecorder.cancel();
      handleHidingRecordingControlButtons();
    }
    function playAudio(recorderAudioAsBlob: any) {
      let reader = new FileReader();
      reader.onload = (e: any) => {
        let base64URL: any = e.target.result;
        if (!audioElementSource) createSourceForAudioElement();
        audioElementSource.src = base64URL;
        setAudioUrl({
          base64: base64URL,
          size: recorderAudioAsBlob.size,
        });
        let BlobType = recorderAudioAsBlob.type.includes(";") ? recorderAudioAsBlob.type.substr(0, recorderAudioAsBlob.type.indexOf(";")) : recorderAudioAsBlob.type;
        audioElementSource.type = BlobType;
        audioElement.load();
        // audioElement.play();
        displayTextIndicatorOfAudioPlaying();
      };

      reader.readAsDataURL(recorderAudioAsBlob);
    }

    function handleElapsedRecordingTime() {
      displayElapsedTimeDuringAudioRecording("00:00");
      elapsedTimeTimer = setInterval(() => {
        let elapsedTime: any = computeElapsedTime(audioRecordStartTime); //pass the actual record start time
        displayElapsedTimeDuringAudioRecording(elapsedTime);
      }, 1000); //every second
    }

    function displayElapsedTimeDuringAudioRecording(elapsedTime: any) {
      elapsedTimeTag.innerHTML = elapsedTime;

      if (elapsedTimeReachedMaximumNumberOfHours(elapsedTime)) {
        stopAudioRecording();
      }
    }

    function elapsedTimeReachedMaximumNumberOfHours(elapsedTime: any) {
      let elapsedTimeSplitted = elapsedTime.split(":");
      let maximumRecordingTimeInHoursAsString = maximumRecordingTimeInHours < 10 ? "0" + maximumRecordingTimeInHours : maximumRecordingTimeInHours.toString();
      if (elapsedTimeSplitted.length === 3 && elapsedTimeSplitted[0] === maximumRecordingTimeInHoursAsString) return true;
      else return false;
    }

    function computeElapsedTime(startTime: any) {
      let endTime: any = new Date();

      let timeDiff: any = endTime - startTime;

      timeDiff = timeDiff / 1000;

      let seconds: any = Math.floor(timeDiff % 60); //ignoring uncomplete seconds (floor)

      seconds = seconds < 10 ? "0" + seconds : seconds;

      timeDiff = Math.floor(timeDiff / 60);

      let minutes: any = timeDiff % 60; //no need to floor possible incomplete minutes, becase they've been handled as seconds
      minutes = minutes < 10 ? "0" + minutes : minutes;

      timeDiff = Math.floor(timeDiff / 60);

      let hours: any = timeDiff % 24; //no need to floor possible incomplete hours, becase they've been handled as seconds

      timeDiff = Math.floor(timeDiff / 24);

      let days: any = timeDiff; //add days to hours

      let totalHours: any = hours + days * 24;
      totalHours = totalHours < 10 ? "0" + totalHours : totalHours;

      if (totalHours === "00") {
        return minutes + ":" + seconds;
      } else {
        return totalHours + ":" + minutes + ":" + seconds;
      }
    }

    var audioRecorder: any = {
      audioBlobs: [] /*of type Blob[]*/,
      mediaRecorder: null /*of type MediaRecorder*/,
      streamBeingCaptured: null /*of type MediaStream*/,

      start: function () {
        if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
          return Promise.reject(new Error("mediaDevices API or getUserMedia method is not supported in this browser."));
        } else {
          return navigator.mediaDevices.getUserMedia({ audio: true } /*of type MediaStreamConstraints*/).then((stream) /*of type MediaStream*/ => {
            audioRecorder.streamBeingCaptured = stream;
            //create a media recorder instance by passing that stream into the MediaRecorder constructor
            audioRecorder.mediaRecorder = new MediaRecorder(stream); /*the MediaRecorder interface of the MediaStream Recording
                  API provides functionality to easily record media*/

            audioRecorder.audioBlobs = [];

            audioRecorder.mediaRecorder.addEventListener("dataavailable", (event: any) => {
              audioRecorder.audioBlobs.push(event.data);
            });

            audioRecorder.mediaRecorder.start();
          });
        }
      },

      stop: function () {
        return new Promise((resolve) => {
          let mimeType = audioRecorder.mediaRecorder.mimeType;

          audioRecorder.mediaRecorder.addEventListener("stop", () => {
            let audioBlob = new Blob(audioRecorder.audioBlobs, { type: mimeType });
            resolve(audioBlob);
          });
          audioRecorder.cancel();
        });
      },
      cancel: function () {
        audioRecorder.mediaRecorder.stop();

        audioRecorder.stopStream();

        audioRecorder.resetRecordingProperties();
      },

      stopStream: function () {
        audioRecorder.streamBeingCaptured
          .getTracks() //get all tracks from the stream
          .forEach((track: any) /*of type MediaStreamTrack*/ => track.stop()); //stop each one
      },
      resetRecordingProperties: function () {
        audioRecorder.mediaRecorder = null;
        audioRecorder.streamBeingCaptured = null;
      },
    };
  }, []);
  const onSkip = () => {
    setSkip(!isSkip);
    let content = document.getElementsByClassName("content-speaking")[0];
    if (content) {
      setTimeout(() => {
        content.classList.add("trans-testmic");
        setTimeout(() => {
          navigate(`${window.location.pathname}?step=exam`);
        }, 700);
      }, 1000);
    }
  };
  const startExam = () => {
    let content = document.getElementsByClassName("content-speaking")[0];
    if (content) {
      setTimeout(() => {
        content.classList.add("trans-testmic");
        setTimeout(() => {
          navigate(`${window.location.pathname}?step=exam`);
        }, 700);
      }, 1000);
    }
  };
  useEffect(() => {
    var refCount: any = null;
    var circleBorder = document.getElementById("circle-border");
    var stopRecordingButton: any = document.getElementsByClassName("stop-recording-button")[0];
    if (circleBorder) {
      var countdown = 21;
      refCount = setInterval(function () {
        countdown = --countdown <= 0 ? 21 : countdown;
        if (countdown === 1) {
          stopRecordingButton.click();
        }
      }, 1000);
      circleBorder.style.animation = "countdown 20s linear infinite forwards";
    }
    return () => {
      clearInterval(refCount);
    };
  }, [isRec]);
  return (
    <div className="p-[20px] lg:p-0 h-screen content-speaking overflow-hidden">
      <Modal open={isSkip}>
        <SkipTestmic
          onSubmit={() => onSkip()}
          onClose={() => {
            setSkip(false);
          }}
        />
      </Modal>
      <div className="text-center zoomin-content overflow-y-hidden flex justify-center mt-[60px]">
        <div>
          <p className="lg:big-title headline1 mb-[20px] text-primary1">Test your microphone</p>
          <div className="max-w-[800px] m-auto text-left">
            {(audioUrl?.base64 && isRec === false && (
              <div className="w-full m-auto bg-neu7 lg:px-[35px] px-[12px] py-[22px] rounded-[20px]">
                <CustomPlayer type="review" isStart={isRec} size={audioUrl?.size} src={audioUrl?.base64} />
              </div>
            )) || (
              <div id="countdown" className={isRec ? "pulse" : ""}>
                <div className="bg-neu7 p-[20px] rounded-full w-fit m-auto border-[5px] border-neu5">
                  <MicroIcon />
                </div>
                <svg id="svg-border">
                  <circle id={isRec ? "circle-border" : "circle-border-notrec"} r="42" cx="45" cy="45"></circle>
                </svg>
              </div>
            )}
            <audio controls className={`audio-element hide ${isRec != false ? "audio-element-hidden" : "audio-element-block"}`}></audio>
            {isRec === false ? (
              <div className="text-center my-[20px]">
                <div className="flex items-center justify-center">
                  Click
                  <div className="bg-neu7 p-[15px] rounded-full w-fit mx-[10px]">
                    <Play2Icon className="m-auto w-[20px] h-[20px]" />
                  </div>
                  the button below to Start
                </div>
                <p>If your microphone works properly, please click the “Start Exam” button to begin.</p>
              </div>
            ) : (
              <div className="text-center my-[20px]">
                <p className="ml-[24px]">You have 20 seconds to speak....</p>
                <p>To complete ths activity, you must allow access to your system’s microphone.</p>
                <div className="flex items-center justify-center">
                  Click
                  <div className="bg-neu7 p-[15px] rounded-full w-fit mx-[10px]">
                    <MicroIcon className="m-auto w-[20px] h-[20px]" />
                  </div>
                  the button below to Start
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <div className="start-recording-button" onClick={() => onRecording()}>
                {(isRec === null && (
                  <Button className="bg-primary2 text-white mr-[20px]">
                    <div className="flex items-center lg:body3 caption">
                      Test Microphone <MicroIcon fill="white" className="m-auto w-[20px] h-[20px] ml-[10px]" />
                    </div>
                  </Button>
                )) ||
                  (isRec === false && (
                    <div
                      className="cursor-pointer h-[40px] px-[20px] w-fit rounded-full flex items-center bg-primary1 text-white lg:body3 caption bg-primary2 text-white mr-[20px]"
                      onClick={() => {
                        onRecording("");
                        setAudioUrl("");
                      }}
                    >
                      <div className="flex items-center lg:body3 caption">
                        Test Mic Again <RefeshIcon fill="white" className="m-auto h-[20px] ml-[10px] w-[18px]" />
                      </div>
                    </div>
                  ))}
              </div>
              <div className="stop-recording-button" onClick={() => onRecording()}>
                {isRec && (
                  <Button className="bg-primary2 text-white mr-[20px] lg:body3 caption">
                    <div className="flex items-center">
                      Stop <PauseIcon className="ml-[10px]" />
                    </div>
                  </Button>
                )}
              </div>

              {isRec === false ? (
                <Button onClick={startExam} className="bg-primary1 text-white lg:body3 caption">
                  Start Exam <ArrowIcon fill="white" className="rotate-180 ml-[8px]" />
                </Button>
              ) : (
                <Button onClick={() => setSkip(true)} className="bg-primary1 text-white lg:body3 caption">
                  Skip <ArrowIcon fill="white" className="rotate-180 ml-[8px]" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
