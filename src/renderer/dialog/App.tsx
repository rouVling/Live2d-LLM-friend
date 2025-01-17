import React, { useEffect } from "react"
import { DialogMessage, SoVITSConfig, xfConfig } from "./types"
import DialogBubble from "./components"

import LinearProgress from "@mui/material/LinearProgress"

import { client } from "@gradio/client"
import { prepare_files, handle_file } from "@gradio/client"

// import { Collapse, Paper, Box, TextField, Button } from "@mui/material"
import { StyleNameContext } from "../style/styleContext"
import { promiseHooks } from "v8"
import { resolve } from "path"

import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ScreenshotIcon from '@mui/icons-material/Screenshot';
import ScreenshotMonitorIcon from '@mui/icons-material/ScreenshotMonitor';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';
import SaveIcon from '@mui/icons-material/Save';
import MicNoneIcon from '@mui/icons-material/MicNone';
import MicIcon from '@mui/icons-material/Mic';

import { SendRegular, MoreHorizontalRegular, ChevronUpRegular, ScreenCutRegular, DeleteRegular, SettingsRegular, QuestionRegular, MicRegular } from "@fluentui/react-icons"

import { getResponse, getVoiceLocal, getVoiceOTTO, LLMModel, getVoiceSoVits } from "./api"
import { ExponentialTimer } from "./utils"
import { dialog } from "electron"
import { LAppAdapter } from "../live2d/lappadapter"
import * as LappDefine from "../live2d/lappdefine"
import { windowsStore } from "process"

import { ButtonGroup, Slider } from "@mui/material"
import { ContactlessOutlined } from "@mui/icons-material"
import { set } from "zod"

import { XfVoiceDictation } from "@muguilin/xf-voice-dictation"

let tmp: any = null
// let voiceTimeout: any = null

const lappAdapter = LAppAdapter.getInstance()

export default function App(): JSX.Element {

  //@ts-ignore
  // const classes = defaultStyle()

  const [input, setInput] = React.useState<string>("")
  const [messages, setMessages] = React.useState<DialogMessage[]>([])
  const [disableInput, setDisableInput] = React.useState<boolean>(false)
  const [voiceUrl, setVoiceUrl] = React.useState<any>(undefined)
  const [replayVoice, setReplayVoice] = React.useState<boolean>(false)
  const [hideChat, setHideChat] = React.useState<boolean>(false)
  const [expTimer, setExpTimer] = React.useState<ExponentialTimer | null>(null)
  const [img, setImg] = React.useState<string>("")

  const [tokenSaveMode, setTokenSaveMode] = React.useState<boolean>(true)
  const [prompt, setPrompt] = React.useState<string>("")
  const [hiddenPrompt, setHiddenPrompt] = React.useState<string>("")

  const [saveOnDelete, setSaveOnDelete] = React.useState<boolean>(false)
  const [enableMicrophone, setEnableMicrophone] = React.useState<boolean>(false)

  const [slideValue, setSlideValue] = React.useState<number>(1)

  const [llmModelName, setLlmModelName] = React.useState("chatGPT")
  const [llmConfigs, setLlmConfigs] = React.useState({
    "chatGPT": { model: "GPT-4o-mini", api_key: "", sdk: "openai", jsonMode: true },
    "Gemini-pro": { model: "gemini-1.5-pro", api_key: "", sdk: "google", jsonMode: true },
    "chatGLM": { model: "glm-4v", api_key: "", sdk: "openai", jsonMode: true },
  })

  const [SoVitsConfig, setSoVitsConfig] = React.useState<SoVITSConfig>({
    "text_lang": "zh",
    "ref_audio_path": "",
    "aux_ref_audio_paths": [],
    "prompt_text": "",
    "prompt_lang": "zh",
    "top_k": 5,
    "top_p": 1,
    "temperature": 1,
    "text_split_method": "cut0",
    "batch_size": 1,
    "batch_threshold": 0.75,
    "split_bucket": true,
    "return_fragment": false,
    "speed_factor": 1.0,
    "streaming_mode": false,
    "seed": -1,
    "parallel_infer": true,
    "repetition_penalty": 1.35,
    "media_type": "wav",
  })

  const [xfVoiceConfig, setXfVoiceConfig] = React.useState<xfConfig>({
    APPID: "",
    APISecret: "",
    APIKey: "",
  })

  const [modelExpressionDesc, setModelExpressionDesc] = React.useState<string>("")
  const [modelMotionDesc, setModelMotionDesc] = React.useState<string>("")
  const [modelDesc, setModelDesc] = React.useState<string>("")

  const [styleName, setStyleName] = React.useState<string>("default")

  // private state
  const [voiceOn, setVoiceOn] = React.useState<boolean>(false)

  // variables
  let xfVoice = React.useRef<XfVoiceDictation | null>(null)
  let voiceTimeout = React.useRef<any>(null)
  useEffect(() => {
    xfVoice.current = new XfVoiceDictation({
      ...xfVoiceConfig,
      onWillStatusChange: (oldStatus, newStatus) => {
        console.log("识别状态: ", oldStatus, newStatus)
        if (newStatus === "init") {
          setDisableInput(true)
          // setVoiceOn(true)
          // voiceTimeout.current = setTimeout(() => { xfVoice.current!.stop(); setDisableInput(false); setVoiceOn(false) }, 10000)
        } else if (newStatus === "ing") {

        } else if (newStatus === "end") {
          if (voiceOn) {
            xfVoice.current!.start()
          } else {
            setDisableInput(false)
          }
          // setDisableInput(false)
          // setVoiceOn(false)
          // if (voiceTimeout.current) {
          //   clearTimeout(voiceTimeout.current)
          //   voiceTimeout.current = null
          // }
        }
      },
      onTextChange: (text) => {
        if (text) {
          console.log(voiceTimeout.current)
          if (voiceTimeout.current) {
            clearTimeout(voiceTimeout.current)
          }
          console.log("cleared, ", voiceTimeout.current)
          voiceTimeout.current = null
        }
        // voiceTimeout.current = setTimeout(() => { xfVoice.current!.stop(); setDisableInput(false); setVoiceOn(false) }, 10000)
        setInput(text)
      }
    })
  }, [xfVoiceConfig])

  // IPC event listeners

  useEffect(() => {
    window.api.onUpdateScreenShotResult((value: string) => {
      setImg(value)
      console.log(value)
    })
    return () => {
      window.api.onUpdateScreenShotResult(() => { })
    }
  }, [])

  useEffect(() => {
    window.api.onUpdateLLMConfigs((value: string) => {
      setLlmConfigs(value)
    })
    window.api.onUpdateLLMModelName((value: string) => {
      setLlmModelName(value)
    })
    return () => {
      window.api.onUpdateLLMConfigs(() => { })
      window.api.onUpdateLLMModelName(() => { })
    }
  }, [])

  useEffect(() => {
    window.api.onUpdateSoVitsConfigs((value: any) => {
      if (value.current !== undefined) {
        setSoVitsConfig(value.configs[value.current])
      }
    })
    return () => {
      window.api.onUpdateSoVitsConfigs(() => { })
    }
  }, [])

  useEffect(() => {
    window.api.onUpdate("enableMicrophone", (value: boolean) => {
      setEnableMicrophone(value)
      if (!value) {
        xfVoice.stop()
      }
    })
    window.api.onUpdate("xfVoiceConfig", (value: any) => {
      setXfVoiceConfig(value)
    })
  }, [])

  useEffect(() => {
    window.api.onUpdateTokenSaveMode((value: boolean) => {
      setTokenSaveMode(value)
    })
    return () => {
      window.api.onUpdateTokenSaveMode(() => { })
    }
  }, [])

  useEffect(() => {
    window.api.onUpdatePrompt((value: string) => {
      setPrompt(value)
    })
    return () => {
      window.api.onUpdatePrompt(() => { })
    }
  }, [])

  useEffect(() => {
    window.api.onUpdateChara((folder: string, chara: string) => {
      lappAdapter.setChara(folder, chara)
    })
    return () => {
      window.api.onUpdateChara(() => { })
    }
  }, [])

  useEffect(() => {
    window.api.onModelValueRequested((value) => {

      if (value.method === "get") {
        switch (value.body.name) {
          case "exps":
            let exps = []
            for (let i = 0; i < lappAdapter.getExpressionCount(); i++) {
              exps.push(lappAdapter.getExpressionName(i))
            }
            window.api.sendModelValue({ name: value, value: exps })
            break
          case "motions":
            const retval = {
              name: value, value: lappAdapter.getMotionGroups().map((name) => {
                return { group: name, num: lappAdapter.getMotionCount(name) }
              })
            }
            console.log("dialog/App.tsx: get motions")
            window.api.sendModelValue(retval)
            break
          default:
            break
        }
      } else if (value.method === "post") {
        switch (value.body.command) {
          case "setExpression":
            lappAdapter.setExpression(value.body.value)
            break
          case "setExpressionDesc":
            setModelExpressionDesc(JSON.stringify(value.body.value))
            break
          case "setMotion":
            lappAdapter.startMotion(value.body.value.group, value.body.value.num, LappDefine.PriorityForce)
            break
          // case "setMotionDesc":
          //   setModelMotionDesc(value.body.value)
          //   break
          case "setModelDesc":
            setModelDesc(value.body.value)
            break
          case "setMotionDesc":
            setModelMotionDesc(JSON.stringify(value.body.value))
            break
          default:
            break
        }
      } else {
        console.log("dialog/App.tsx: model value requested: ", value)
      }
      return () => {
        window.api.onModelValueRequested(() => { })
      }
    })
  }, [])

  useEffect(() => {
    window.api.onUpdateStyleName((value: string) => {
      setStyleName(value)
    })
    return () => {
      window.api.onUpdateStyleName(() => { })
    }
  }, [])

  // init store
  useEffect(() => {
    window.api.getStore("llmConfigs").then((value: any) => {
      setLlmConfigs(value)
    })
  }, [])
  useEffect(() => {
    window.api.getStore("llmModelName").then((value: string) => {
      setLlmModelName(value)
    })
  }, [])
  useEffect(() => {
    window.api.getStore("tokenSaveMode").then((value: boolean) => {
      setTokenSaveMode(value === undefined ? true : value)
    })
  }, [])
  useEffect(() => {
    window.api.getStore("prompt").then((value: string) => {
      setPrompt(value ? value : "")
    })
  }, [])
  useEffect(() => {
    window.api.getStore("hiddenPrompt").then((value: string) => {
      setHiddenPrompt(value ? value : "")
    })
  }, [])
  useEffect(() => {
    window.api.getStore("saveOnDelete").then((value: boolean) => {
      setSaveOnDelete(value === undefined ? false : value)
    })
  }, [])
  useEffect(() => {
    window.api.getStore("modelPath").then((value: string) => {
      window.api.getStore("modelName").then((value2: string) => {
        lappAdapter.setChara(value, value2)
        window.api.getStore(value2 + ".exps").then((value3) => {
          if (value3) {
            setModelExpressionDesc(JSON.stringify(value3))
          }
        })
        window.api.getStore(value2 + ".motions").then((value3) => {
          if (value3) {
            setModelMotionDesc(JSON.stringify(value3))
          }
        })
        window.api.getStore(value2 + ".desc").then((value3) => {
          if (value3) {
            setModelDesc(value3)
          }
        })
      })
    })
  }, [])
  useEffect(() => {
    window.api.getStore("SoVitsConfigs").then((value: any) => {
      setSoVitsConfig(value.configs[value.current])
    })
  }, [])
  useEffect(() => {
    window.api.getStore("xfVoiceConfig").then((value: any) => {
      setXfVoiceConfig(value)
    })
  }, [])

  useEffect(() => {
    window.api.getStore("styleName").then((value: string) => {
      setStyleName(value ?? "default")
    })
  }, [])

  // useEffect(() => {
    // const audio = new Audio(voiceUrl)
    // audio.oncanplay = () => {
    // if (voiceUrl) { voiceUrl.play() }
    // }
  // }, [voiceUrl, replayVoice])

  // JavaScript event listeners

  useEffect(() => {
    // automatically scroll to the bottom
    const dialogContainer = document.getElementById("dialog-container")
    if (dialogContainer !== null) {
      // dialogContainer.scrollTop = dialogContainer.scrollHeight
      dialogContainer.scrollTo({ top: dialogContainer.scrollHeight, behavior: "smooth" })
    }
  }, [messages])

  useEffect(() => {
    const dragBar = document.getElementById("dragBarEdge")
    dragBar?.addEventListener("pointerover", (e: PointerEvent) => {
      const bar = dragBar.children[0] as HTMLElement
      bar.style.borderLeftColor = "#cecece"
      bar.style.borderTopColor = "#cecece"
      setIgnoreMouseEvent(false)
    })
    dragBar?.addEventListener("pointerleave", (e: PointerEvent) => {
      if (e.relatedTarget === null) {
        return
      } else {
        const bar = dragBar.children[0] as HTMLElement
        bar.style.borderLeftColor = "var(--border-color)"
        bar.style.borderTopColor = "var(--border-color)"
        setIgnoreMouseEvent(true)
      }
    })
    return () => {
      dragBar?.removeEventListener("pointerover", () => { })
      dragBar?.removeEventListener("pointerout", () => { })
    }
  }, [])

  useEffect(() => {
    const expTimer = new ExponentialTimer(() => {
      // console.log("interval")

      getResponse(
        [
          ...messages,
          { content: "用户已经一段时间没理你了，作为桌宠，请结合前面聊天内容，说点什么引起他的注意吧", role: "user" }  // modify it later
        ],
        llmConfigs[llmModelName],
        prompt + "以往对话总结:\n" + hiddenPrompt,
        "请在 responseText 中回复用户的对话，回复时请注意 prompt。" + "你使用live2d 作为形象，其描述如下:\n" + modelDesc + "\n请在 expression 中选择合适的表情（可为空）。表情选项及描述如下：\n" + modelExpressionDesc + "\n请在delayTime中填写表情持续时间(毫秒)\n" + "\n请选择合适的动作组，以及动作在组中的序号(可为空)。动作选项及描述如下:\n" + modelMotionDesc,
        tokenSaveMode
      ).then((response) => {
        // console.log("interval response: ", response)
        setMessages((prev) => [...prev, { content: response, role: "assistant" }])
        // getVoiceLocal(response).then((url) => {
        // getVoiceOTTO(response).then((url) => {
        //   setVoiceUrl(url)
        //   setMessages((prev) => [...prev, { content: response, role: "assistant", voiceUrl: new Audio(url), voiceType: "element" }])
        // })
      }).catch((err) => {
        console.log(err)
      })
    }, 1 / 60, 180)

    // expTimer.start()

    setExpTimer(expTimer)

    return () => {
      expTimer?.stop()
    }
  }, [messages])

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (input === "") {
        return
      }
      if (input.split(" ").join("") === "") {
        setInput("")
        return
      }
      setMessages((prev) => [...prev, { content: input, role: "user", img: img === "" ? undefined : img }])
      // console.log(img)
      // console.log(messages)  // not updated yet

      // getResponseGPT(
      // getResponseGemini(
      // getJsonResponseGemini(
      // getJsonResponseGPT(
      // getTextResponseGPT(
      //   (img === "") ? [...messages, { content: input, role: "user" }] : [...messages, { content: input, role: "user", img: img }],
      //   llmConfigs[llmModelName].api_key,
      //   prompt + "以往对话总结:\n" + hiddenPrompt,
      //   // prompt,
      //   // undefined,
      //   "请在 responseText 中回复用户的对话，回复时请注意 prompt。" + "你使用live2d 作为形象，其描述如下:\n" + modelDesc + "\n请在 expression 中选择合适的表情（可为空）。表情选项及描述如下：\n" + modelExpressionDesc + "\n请在delayTime中填写表情持续时间(毫秒)\n" + "\n请选择合适的动作组，以及动作在组中的序号(可为空)。动作选项及描述如下:\n" + modelMotionDesc,
      //   // "https://api.openai-sb.com/v1/",
      //   // undefined,
      //   "https://open.bigmodel.cn/api/paas/v4/",
      //   "glm-4v",
      //   tokenSaveMode
      //   // getResponse(
      getResponse(
        (img === "") ? [...messages, { content: input, role: "user" }] : [...messages, { content: input, role: "user", img: img }],
        llmConfigs[llmModelName],
        // prompt + ((hiddenPrompt === "") ? "" : "\n以往对话总结:\n" + hiddenPrompt),
        "",
        // "请在 responseText 中回复用户的对话，回复时请注意 prompt。" + "你使用live2d 作为形象，其描述如下:\n" + modelDesc + "\n请在 expression 中选择合适的表情（可为空）。表情选项及描述如下：\n" + modelExpressionDesc + "\n请在delayTime中填写表情持续时间(毫秒)\n" + "\n请选择合适的动作组，以及动作在组中的序号(可为空)。动作选项及描述如下:\n" + modelMotionDesc,
        "",
        tokenSaveMode
      ).then((response) => {

        try {
          const jsonResponse = JSON.parse(response)
          if (jsonResponse.expression !== null && jsonResponse.expression !== undefined) {
            lappAdapter.setExpression(jsonResponse.expression)
            setTimeout(() => {
              lappAdapter.setExpression(lappAdapter.getExpressionName(0))
            }, jsonResponse.delayTime)
          }
          if (jsonResponse.motion !== null && jsonResponse.motion !== undefined) { lappAdapter.startMotion(jsonResponse.motion.group, jsonResponse.motion.index, LappDefine.PriorityForce) }
          response = jsonResponse.responseText
        }
        catch (err) {
          console.log("failed to parse json response: ", err)
          response = response
        }

        // getVoiceLocal(response).then((url) => {
        // getVoiceOTTO(response).then((url) => {
        //   setVoiceUrl(url)
        //   setMessages((prev) => [...prev, { content: response, role: "assistant", voiceUrl: new Audio(url), voiceType: "element" }])
        // }).catch((err) => {
        //   console.log(err)
        //   setMessages((prev) => [...prev, { content: response, role: "assistant", voiceUrl: undefined }])
        // })
        getVoiceSoVits("http://localhost:9880", response, SoVitsConfig)
          .then(response => response.arrayBuffer())
          .then(arrayBuffer => {
            // 创建 AudioContext
            const context = new AudioContext();

            // 解码音频流
            context.decodeAudioData(arrayBuffer, buffer => {
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
              setMessages((prev) => [...prev, { content: response, role: "assistant", voiceUrl: arrayBuffer, voiceType: "buffer" }])
              audio.play();
              // setVoiceUrl(audio)
            });
          }).catch((err) => {
            setMessages((prev) => [...prev, { content: response, role: "assistant", voiceUrl: undefined }])
          });

      }).catch((err) => { console.log(err) })

      setInput("")
      setImg("")
    }
  }

  const setIgnoreMouseEvent = (ignore: boolean) => {
    window.api.setIgnoreMouseEvent(ignore)
  }

  return (<>
    <center>
      <div
        id="dialog-container"
        className={styleName + "-dialogContainer"}
        hidden={hideChat}
        onPointerOver={() => { setIgnoreMouseEvent(false) }}
        onPointerOut={() => { setIgnoreMouseEvent(true) }}
      >
        {
          img !== "" ? <img src={"data:image/png;base64," + img} style={{ width: "inherit", borderRadius: "5px" }} /> : <></>
        }
        {
          <StyleNameContext.Provider value={styleName}>
            {messages.map((message, index) => {
              return (
                <DialogBubble key={index} {...message} />
              )
            })
            }
          </StyleNameContext.Provider>
        }
      </div>
    </center>
    <div className={styleName + "-inputContainer"}>
      <center>
        <div className={styleName + "-buttonGroup"}>
          <button
            className={styleName + "-miniButton " + styleName + "-hideChatButton"}
            // id="hideChatButton"
            onClick={() => { setHideChat(!hideChat) }}
            onPointerOver={() => { setIgnoreMouseEvent(false) }}
            onPointerOut={() => { setIgnoreMouseEvent(true) }}
            title="Hide/Show Chat"
          >
            {styleName === "fluent" && <ChevronUpRegular style={{ transform: "rotateX(" + (hideChat ? "0deg" : "180deg") }}
            />}
            {styleName === "default" &&
              <ArrowDropDownIcon style={{
                transform: "rotateX(" + (hideChat ? "0deg" : "180deg"),
              }} />}
          </button>

          <button
            className={styleName + "-miniButton"}
            onClick={() => window.api.getScreenShot()}
            onPointerOver={() => { setIgnoreMouseEvent(false) }}
            onPointerOut={() => { setIgnoreMouseEvent(true) }}
            title="Screenshot"
          >
            {/* <ScreenshotMonitorIcon /> */}
            {styleName === "fluent" && <ScreenCutRegular />}
            {styleName === "default" && <ContentCutIcon />}
          </button>


          <button
            className={styleName + "-miniButton"}
            onClick={() => {
              setMessages(() => []); setImg("")
              if (saveOnDelete && messages.length > 0) {
                getResponse(
                  [...messages, { role: "user", content: "你是一个智能桌面助手内置的AI。这条消息发送自智能助手系统。用户即将关闭此次对话，并且，用户可能会隔较长时间再进行对话。你的目标是对以往对话内容进行提炼，总结自己的形象，用户的形象，以及在回答中需要注意的内容，以及你想提醒自己的内容作为下一次prompt。请你作为一个总结系统和 prompt 专家，撰写下一次对话时的prompt。请保持描述简洁精确，内容精要。注意，你这次回答的是所有内容会直接记录为下一次prompt" }],
                  { ...llmConfigs[llmModelName], jsonMode: false },
                  prompt + "以往对话总结:\n" + hiddenPrompt,
                  undefined,
                  tokenSaveMode
                ).then((response) => {
                  window.api.setStore("hiddenPrompt", response)
                })
              }
            }}
            onPointerOver={() => { setIgnoreMouseEvent(false) }}
            onPointerOut={() => { setIgnoreMouseEvent(true) }}
            title="Clear Chat"
          >
            {styleName === "fluent" && <DeleteRegular />}
            {styleName === "default" && <DeleteIcon />}
          </button>

          <button
            className={styleName + "-miniButton " + styleName + "-settingButton"}
            // id="settingButton"
            onClick={() => { window.api.openConfigWindow() }}
            onPointerOver={() => { setIgnoreMouseEvent(false) }}
            onPointerOut={() => { setIgnoreMouseEvent(true) }}
            title="Settings"
          >
            {styleName === "fluent" && <SettingsRegular />}
            {styleName === "default" && <SettingsIcon />}
          </button>

          <button
            className={styleName + "-miniButton"}
            // id="settingButton"
            onClick={() => {
              setVoiceOn((on) => !on)
              if (voiceOn) {
                xfVoice.current!.stop()
              } else {
                xfVoice.current!.start()
              }
            }}
            onPointerOver={() => { setIgnoreMouseEvent(false) }}
            onPointerOut={() => { setIgnoreMouseEvent(true) }}
            title="Voice"
          >
            {styleName === "fluent" && <MicRegular />}
            {styleName === "default" && (voiceOn ? <MicIcon /> : <MicNoneIcon />)}
          </button>

          {/* <button
            className={styleName + "-miniButton"}
            onClick={() => {
              // navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
              //   // save the stream
              //   tmp = stream
              //   // create a media recorder
              //   const mediaRecorder = new MediaRecorder(stream)
              //   // tmp = mediaRecorder
              //   // create a data array
              //   const chunks: any = []
              //   // when the media recorder receives data
              //   mediaRecorder.ondataavailable = (e) => {
              //     // add the data to the array
              //     chunks.push(e.data)
              //   }
              //   // when the media recorder stops
              //   mediaRecorder.onstop = () => {
              //     // create a blob from the data
              //     const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" })
              //     // create a url from the blob
              //     const url = URL.createObjectURL(blob)
              //     // set the url to the audio element
              //     setVoiceUrl(url)
              //     // create a new audio element
              //     const audio = new Audio(url)
              //     // play the audio
              //     audio.play()
              //   }

              //   setTimeout(() => {
              //     // stop the media recorder
              //     mediaRecorder.stop()
              //     // stop the stream
              //     stream.getTracks().forEach((track) => {
              //       track.stop()
              //     })
              //   }, 5000)
              // })

              // fetch("http://localhost:")
              // import { client } from "@gradio/client";
            }}

            onPointerOver={() => { setIgnoreMouseEvent(false) }}
            onPointerOut={() => { setIgnoreMouseEvent(true) }}
            title="Model"
          >
            {styleName === "fluent" && <QuestionRegular />}
            {styleName === "default" && <QuestionMarkIcon />}
          </button>

          <button
            className={styleName + "-miniButton"}
            onClick={() => {

              // tmp.stop()

            }}
            onPointerOver={() => { setIgnoreMouseEvent(false) }}
            onPointerOut={() => { setIgnoreMouseEvent(true) }}
            title="Model"
          >
            {styleName === "fluent" && <PsychologyAltIcon />}
            {styleName === "default" && <PsychologyAltIcon />}
          </button> */}

        </div>
        {/* {
          styleName === "default" &&
          <div style={{
            marginTop: "-5px",
            marginBottom: "5px",
            height: "0px",
            width: "90%",
          }}><LinearProgress variant="determinate" value={30} /></div>
        } */}
        <div
          className={styleName + "-inputGroup"}
          style={{ display: "flex", flexDirection: "row" }}
          onPointerOver={() => { setIgnoreMouseEvent(false) }}
          onPointerOut={() => { setIgnoreMouseEvent(true) }}
        >
          {
            styleName === "fluent" && <button
              style={{ backgroundColor: "transparent", color: "white", border: "none", height: "inherit" }}
            >
              <MoreHorizontalRegular />
              {/* <ChevronUpRegular /> */}
            </button>
          }
          <input
            className={styleName + "-userInput"}
            // id="UserInput"
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); }}
            onKeyDown={handleEnter}
            disabled={disableInput}
            onPaste={(e) => {
              if (
                e.clipboardData.files[0].type === "image/png" ||
                e.clipboardData.files[0].type === "image/jpeg"
              ) {
                e.clipboardData.files[0].arrayBuffer().then((buffer) => {
                  setImg(getBase64(new Uint8Array(buffer)))
                })
              }
              else {
                e.preventDefault()
              }
            }}
          ></input>
          {
            styleName === "fluent" && <button
              style={{ backgroundColor: "transparent", color: "white", border: "none", height: "inherit" }}
              onClick={() => { handleEnter({ key: "Enter" } as React.KeyboardEvent<HTMLInputElement>) }}
            ><SendRegular /></button>
          }
        </div>

      </center>
    </div>
  </>
  )
}

function getBase64(unit8Array) {
  let keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var output = "";
  var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  var i = 0;
  while (i < unit8Array.length) {
    chr1 = unit8Array[i++];
    chr2 = unit8Array[i++];
    chr3 = unit8Array[i++];

    enc1 = chr1 >> 2;
    enc2 = (chr1 & 3) << 4 | chr2 >> 4;
    enc3 = (chr2 & 15) << 2 | chr3 >> 6;
    enc4 = chr3 & 63;

    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
  }
  return output;
}