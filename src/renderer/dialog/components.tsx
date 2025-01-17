import React from "react";
import { DialogMessage } from "./types";
import { Paper, TextField } from "@mui/material";
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { StyleNameContext } from "../style/styleContext";

export default function DialogBubble(props: DialogMessage): JSX.Element {
  // if (props.role === "user") {
  const styleName = React.useContext(StyleNameContext)
  if (props.role === "user") {
    // if (props.role === "assistant") {
    return <div
     className={styleName + "-dialogBubble " + styleName + "-userBubble" }
    //  sx={{ backgroundColor: "rgba(30, 30, 30, 0.9)", color: "rgb(200, 200, 200)", borderRadius: "5px" }}
    >
      <div>
        {props.img ? <img src={"data:image/png;base64," + props.img} /> : undefined}
        {props.content}
      </div>
    </div>
  }

  else if (props.role === "assistant") {
    return <div className={styleName + "-dialogBubble " + styleName + "-assistantBubble" }
    // sx={{ backgroundColor: "rgba(30, 30, 30, 0.9)", color: "rgb(200, 200, 200)", borderRadius: "5px" }}
    >{props.content}

      {props.voiceUrl ? <VolumeUpIcon onClick={() => {
        // play voice
        if (props.voiceType === "string") {
          const audio = new Audio(props.voiceUrl as string)
          audio.oncanplay = () => {
            audio.play()
          }
        }
        else if (props.voiceType === "element") {
          (props.voiceUrl as HTMLAudioElement).play()
        }
        else if (props.voiceType === "buffer") {
          // (props.voiceUrl as AudioContext).resume()
          const context: AudioContext = new AudioContext();
            context.decodeAudioData(props.voiceUrl, buffer => {
              // 创建 AudioBufferSourceNode
              const source = context.createBufferSource();
              source.buffer = buffer;

              // 创建 AudioDestinationNode
              const destination = context.createMediaStreamDestination();

              // 将 AudioBufferSourceNode 连接到 AudioDestinationNode
              source.connect(destination);

              // 播放音频
              source.start();

              // 获取媒体流
              const mediaStream = destination.stream;

              // 创建 Audio 标签并播放媒体流
              // const audio = document.createElement('audio');
              const audio = new Audio();
              audio.srcObject = mediaStream;
              console.log("audio: ", audio.srcObject)
              // setMessages((prev) => [...prev, { content: response, role: "assistant", voiceUrl: context, voiceType: "context" }])
              audio.play();
              // setVoiceUrl(audio)
            });
        }
      }} /> : undefined}
    </div>
  } else {
    return <Paper sx={{ display: "flex", justifyContent: "center" }}>{props.content}</Paper>
  }
}

// backgroundColor: "rgba(50, 50, 100, 0.5)", color:"rgb(200, 200, 200)" ,display: "flex", justifyContent: "flex-end", margin: "3px", marginRight:"10px", marginLeft:"30%" ,padding: "3px", borderRadius: "10px", pointerEvents:"none", lineBreak:"anywhere"
// rgba(50, 50, 100, 0.5)