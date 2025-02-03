import React, { useEffect, useState } from "react"
import { BoolItem, TextFieldItem, TextItemPart, LongTextFieldItem, SelectItem, TextWithButtonItem } from "./components";

import KeyIcon from '@mui/icons-material/Key';
import InfoIcon from '@mui/icons-material/Info';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SecurityIcon from '@mui/icons-material/Security';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import SettingsIcon from '@mui/icons-material/Settings';
import WalletIcon from '@mui/icons-material/Wallet';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import NotesIcon from '@mui/icons-material/Notes';
import FolderIcon from '@mui/icons-material/Folder';
import PersonIcon from '@mui/icons-material/Person';
import { NestCamWiredStandTwoTone } from "@mui/icons-material";
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import SaveIcon from '@mui/icons-material/Save';
import AccessibleForwardIcon from '@mui/icons-material/AccessibleForward';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import DataObjectIcon from '@mui/icons-material/DataObject';
import LinkIcon from '@mui/icons-material/Link';
import LanguageIcon from '@mui/icons-material/Language';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';

import { SettingsRegular } from "@fluentui/react-icons";

import { LLMModel } from "../dialog/api";
import { StyleNameContext } from "../style/styleContext";

import { SoVITSConfig, xfConfig } from "../dialog/types";
import { set } from "zod";
import { config } from "process";

interface expressionConfig {
  name: string,
  explaination: string
}

interface motionConfig {
  group: string,
  name: string[],
}



export default function App() {

  const [activeChat, setActiveChat] = useState(false) // 未对接
  const [llmModelName, setLlmModelName] = useState("chatGPT")
  const [llmConfigs, setLlmConfigs] = useState({
    "chatGPT": { model: "gpt-4o-mini", api_key: "", sdk: "openai", jsonMode: true },
    "Gemini-pro": { model: "Gemini-pro", api_key: "", sdk: "google", jsonMode: true },
    "chatGLM": { model: "glm-4v", api_key: "", sdk: "openai", jsonMode: true },
  })
  const [currentLLMConfig, setCurrentLLMConfig] = useState<LLMModel>(llmConfigs[llmModelName])
  const [enableClickThrough, setEnableClickThrough] = useState(false)
  const [tokenSaveMode, setTokenSaveMode] = useState(true)
  const [prompt, setPrompt] = useState("")
  const [modelPath, setModelPath] = useState("")
  const [modelName, setModelName] = useState("")

  // privacy
  const [saveOnDelete, setSaveOnDelete] = useState(false)
  const [enableMicrophone, setEnableMicrophone] = useState(false)

  const [tabNum, setTabNum] = useState(0)

  const [modelDesc, setModelDesc] = useState("")
  const [modelExpressionConfig, setModelExpressionConfig] = useState<expressionConfig[]>([])
  const [modelMotionConfig, setModelMotionConfig] = useState<motionConfig[]>([])

  const [styleName, setStyleName] = useState("default")

  const [SoVitsConfigs, setSoVitsConfigs] = useState<any>({
    current: "default",
    configs: {
      default: {
        "text_lang": "zh",
        "ref_audio_path": "C:/fakepath/audio.wav",
        "aux_ref_audio_paths": [],
        "prompt_text": "",
        "prompt_lang": "zh",
        "top_k": 5,
        "top_p": 1,
        "temperature": 1,
        "text_split_method": "cut0",  // fixed
        "batch_size": 1,  // fixed
        "batch_threshold": 0.75, // fixed
        "split_bucket": true, // fixed
        "return_fragment": false, // fixed
        "speed_factor": 1.0, // fixed
        "streaming_mode": false, // fixed
        "seed": -1, // fixed
        "parallel_infer": true, // fixed
        "repetition_penalty": 1.35, // fixed
        "media_type": "wav",    // not supported for now
      }
    }
  })
  const [currentSoVitsConfig, setCurrentSoVitsConfig] = useState<SoVITSConfig>(SoVitsConfigs.configs[SoVitsConfigs.current])
  const [newSoVitsConfigName, setNewSoVitsConfigName] = useState<string>("")
  const [xfVoiceConfig, setXfVoiceConfig] = useState<xfConfig>({
    APPID: "",
    APIKey: "",
    APISecret: ""
  })

  // const [lappAdapter, setLappAdapter] = useState(undefined)

  // const [on, setOn] = useState(false)


  // useEffect(() => {
  //   window.api.getStore("apikey").then((value: string) => {
  //     setApikey(value ? value : "")
  //   })
  // }, [])
  useEffect(() => {
    window.api.getStore("llmConfigs").then((value: any) => {
      setLlmConfigs(value ? value : {
        "chatGPT": { model: "GPT-4o-mini", api_key: "", sdk: "openai", jsonMode: true },
        "Gemini-pro": { model: "gemini-1.5-pro", api_key: "", sdk: "google", jsonMode: true },
        "chatGLM": { model: "glm-4v", api_key: "", sdk: "openai", jsonMode: true, baseUrl: "https://open.bigmodel.cn/api/paas/v4/" },
      })
      window.api.getStore("llmModelName").then((value2: string) => {
        setLlmModelName(value2 ? value2 : "chatGPT")
        setCurrentLLMConfig(value[value2 ? value2 : "chatGPT"])
      })
    })
  }, [])

  useEffect(() => {
    window.api.getStore("SoVitsConfigs").then((value: any) => {
      if (value !== undefined) {
        setSoVitsConfigs(value)
        setCurrentSoVitsConfig(value.configs[value.current])
        console.log(value.configs[value.current])
      }
    })
  }, [])
  useEffect(() => {
    window.api.getStore("xfVoiceConfig").then((value: any) => {
      if (value !== undefined) {
        setXfVoiceConfig(value)
      }
    })
  }, [])

  useEffect(() => {
    window.api.getStore("tokenSaveMode").then((value: boolean) => {
      setTokenSaveMode(value === undefined ? true : value)
    })
  }, [])

  useEffect(() => {
    window.api.getStore("enableClickThrough").then((value: boolean) => {
      setEnableClickThrough(value === undefined ? false : value)
    })
  }, [])

  useEffect(() => {
    window.api.getStore("prompt").then((value: string) => {
      setPrompt(value ? value : "")
    })
  }, [])


  useEffect(() => {
    window.api.getStore("modelPath").then((value: string) => {
      setModelPath(value ? value : "")
    })
  }, [])

  useEffect(() => {
    window.api.getStore("modelName").then((value: string) => {
      setModelName(value ? value : "")
    })
  }, [])

  useEffect(() => {
    window.api.getStore("saveOnDelete").then((value: boolean) => {
      setSaveOnDelete(value ? value : false)
    })
  }, [])

  useEffect(() => {
    window.api.getStore("enableMicrophone").then((value: boolean) => {
      setEnableMicrophone(value ? value : false)
    })
  }, [])

  useEffect(() => {
    window.api.getStore("styleName").then((value: string) => {
      setStyleName(value ? value : "default")
    })
  }, [])

  useEffect(() => {
    window.api.getStore(modelName + ".desc").then((value) => {
      if (value === undefined) {
        setModelDesc("")
      } else {
        setModelDesc(value)
      }
    })
  }, [modelName])

  useEffect(() => {
    window.api.onModelValueReceived((value: any) => {
      console.log("config/App.tsx useEffect onModelValueReceived value: ", value)
      switch (value.name.body.name) {
        case "exps":
          let expConfig = value.value.map((expName) => {
            return { name: expName, explaination: "" }
          })
          for (let i = 0; i < expConfig.length; i++) {
            for (let j = 0; j < modelExpressionConfig.length; j++) {
              if (expConfig[i].name == modelExpressionConfig[j].name) {
                expConfig[i].explaination = modelExpressionConfig[j].explaination
              }
            }
          }
          setModelExpressionConfig(expConfig)
          break
        case "motions":
          let temp = value.value.map((item) => {
            return { group: item.group, name: (new Array(item.num)).fill("") }
          })

          setModelMotionConfig(temp)
          break
        default:
          break
      }
    })

    return () => {
      window.api.requestModel({ method: "debug", body: "return of useEffect onModelValueReceived" })
      window.api.onModelValueReceived(() => { })
    }
  }, [modelExpressionConfig, modelMotionConfig])

  useEffect(() => {
    if (modelName === "") return
    window.api.getStore(modelName + ".exps").then((value) => {
      if (value === undefined) {
        window.api.requestModel(
          {
            method: "get",
            body: { name: "exps" }
          }
        )
      } else {
        console.log("config/App.tsx useEffect getStore(modelName): setModelExpressionConfig: ", value)
        setModelExpressionConfig(() => value)
      }
    })
  }, [modelName])

  useEffect(() => {
    if (modelName === "") return
    window.api.getStore(modelName + ".motions").then((value) => {
      if (value === undefined) {
        window.api.requestModel(
          {
            method: "get",
            body: { name: "motions" }
          }
        )
      }
      else {
        console.log("config/App.tsx useEffect getStore(modelName): setModelMotionConfig: ", value)
        setModelMotionConfig(() => value)
      }
    })

  }, [modelName])

  return <div id="totalContainer">
    <StyleNameContext.Provider value={styleName}>
      <div id="leftContainer">

        <div className={"leftContainerItem" + ((tabNum == 0) ? " highlight" : "")} onClick={() => setTabNum(0)}>
          <div className="highlightBar" />
          <SettingsIcon />
          {/* {styleName === "default" && <SettingsIcon />} */}
          {/* {styleName === "fluent" && <SettingsRegular />} */}
          <div>common</div>
        </div>

        <div className={"leftContainerItem" + ((tabNum == 1) ? " highlight" : "")} onClick={() => setTabNum(1)}>
          <div className="highlightBar" />
          <SecurityIcon />
          <div>privacy</div>
        </div>

        <div className={"leftContainerItem" + ((tabNum == 2) ? " highlight" : "")} onClick={() => setTabNum(2)}>
          <div className="highlightBar" />
          <EmojiPeopleIcon />
          <div>Model</div>
        </div>

        <div className={"leftContainerItem" + ((tabNum == 3) ? " highlight" : "")} onClick={() => setTabNum(3)}>
          <div className="highlightBar" />
          <RecordVoiceOverIcon />
          <div>TTS & Voice</div>
        </div>

        <div className={"leftContainerItem" + ((tabNum == 4) ? " highlight" : "")} onClick={() => setTabNum(4)}>
          <div className="highlightBar" />
          <InfoIcon />
          <div>info</div>
        </div>

      </div>
      <div id="rightContainer" >
        <div hidden={tabNum !== 0}>
          <div className="rightContainerTitle">通用设置</div>
          <BoolItem icon={<AdsClickIcon />} mainText="启用点击穿透" description="UI元素点击不穿透; 模型 hitArea 缺失会导致穿透面积增大; " type="bool" callback={(val) => { setEnableClickThrough(val); window.api.setStore("enableClickThrough", val); window.api.setEnableClickThrough(val) }} content={enableClickThrough} />

          <BoolItem icon={<WalletIcon />} mainText="发送图片时节省 token" description="开启后发送图片时不发送历史聊天图片" type="bool" callback={(val) => { setTokenSaveMode(val); window.api.setStore("tokenSaveMode", val) }} content={tokenSaveMode} />

          {/* <TextFieldItem icon={<KeyIcon />} mainText="API Key" description="API Key 用于访问 GPT-SoVits 服务" type="input" callback={(val) => { }} content={apiKey} /> */}

          <SelectItem icon={<SwapHorizIcon />} mainText="风格" description="选择界面风格" type="selection" callback={(val) => { setStyleName(val); window.api.setStore("styleName", val) }} content={{ default: styleName, options: ["default", "fluent"] }} />

          <SelectItem icon={<SwapHorizIcon />} mainText="模型" description="选择使用的模型" type="selection" callback={(val) => {
            setLlmModelName(val);
            setCurrentLLMConfig(llmConfigs[val]);
            window.api.setStore("llmModelName", val)
          }} content={{ default: llmModelName, options: Object.keys(llmConfigs) }} />

          <TextFieldItem icon={<SmartToyIcon />} mainText="model" description="使用的模型(请注意模型是否支持视觉功能)" type="input" callback={(val) => {
            setLlmConfigs(() => {
              return {
                ...llmConfigs,
                [llmModelName]: { ...currentLLMConfig, model: val }
              }
            })
            setCurrentLLMConfig(() => {
              return { ...currentLLMConfig, model: val }
            })
            window.api.setStore("llmConfigs", {
              ...llmConfigs,
              [llmModelName]: { ...currentLLMConfig, model: val }
            })
          }}
            content={currentLLMConfig.model} />

          <TextFieldItem icon={<KeyIcon />} mainText="API Key" description="API Key 用于访问大语言模型" type="input" callback={(val) => {
            setLlmConfigs(() => {
              return {
                ...llmConfigs,
                [llmModelName]: { ...currentLLMConfig, api_key: val }
              }
            })
            setCurrentLLMConfig(() => {
              return { ...currentLLMConfig, api_key: val }
            })
            window.api.setStore("llmConfigs", {
              ...llmConfigs,
              [llmModelName]: { ...currentLLMConfig, api_key: val }
            })
          }}
            content={currentLLMConfig.api_key} />

          <TextFieldItem icon={<LinkIcon />} mainText="base url" description="base url" type="input" callback={(val) => {
            setLlmConfigs(() => {
              return {
                ...llmConfigs,
                [llmModelName]: { ...currentLLMConfig, baseUrl: (val === "") ? undefined : val }
              }
            })
            setCurrentLLMConfig(() => {
              return { ...currentLLMConfig, baseUrl: (val === "") ? undefined : val }
            })
            window.api.setStore("llmConfigs", {
              ...llmConfigs,
              [llmModelName]: { ...currentLLMConfig, baseUrl: (val === "") ? undefined : val }
            })
          }}
            content={currentLLMConfig.baseUrl ?? ""} />

          <SelectItem icon={<HomeRepairServiceIcon />} mainText="sdk" description="选择使用的 sdk" type="selection" callback={(val) => {
            setCurrentLLMConfig(() => {
              return { ...currentLLMConfig, sdk: val }
            })
            setLlmConfigs(() => {
              return {
                ...llmConfigs,
                [llmModelName]: { ...currentLLMConfig, sdk: val }
              }
            })
            window.api.setStore("llmConfigs", {
              ...llmConfigs,
              [llmModelName]: { ...currentLLMConfig, sdk: val }
            })
          }} content={{ default: currentLLMConfig.sdk, options: ["openai", "google"] }} />

          <BoolItem icon={<DataObjectIcon />} mainText="jsonMode" description="json mode 下模型可以调用表情动作" type="bool" callback={(val) => {
            setCurrentLLMConfig(() => {
              return { ...currentLLMConfig, jsonMode: val }
            })
            setLlmConfigs(() => {
              return {
                ...llmConfigs,
                [llmModelName]: { ...currentLLMConfig, jsonMode: val }
              }
            })
            window.api.setStore("llmConfigs", {
              ...llmConfigs,
              [llmModelName]: { ...currentLLMConfig, jsonMode: val }
            })
          }} content={currentLLMConfig.jsonMode} />

          <LongTextFieldItem icon={<NotesIcon />} mainText="prompt" description="prompt 用于提示模型回复" type="input" callback={(val) => { setPrompt(val); window.api.setStore("prompt", val) }} content={prompt} />

          <TextWithButtonItem icon={<FolderIcon />} mainText="live2d 模型库文件夹" description="存放 live2d 模型的文件夹路径" type="input" callback={(val) => { setModelPath(val); window.api.setStore("modelPath", val) }} content={{
            value: modelPath, buttonText: "选择文件夹", action: () => {
              window.api.openFolder().then((value: string) => {
                if (value === "") return
                setModelPath(() => { return value })
                window.api.setStore("modelPath", value)
              })
            }
          }} />

          <TextWithButtonItem icon={<PersonIcon />} mainText="live2d 模型名" description="模型文件夹名称，一般一个模型为一个文件夹" type="input" callback={(val) => { setModelName(val); window.api.setStore("modelName", val) }} content={{
            value: modelName, buttonText: "应用", action: () => {
              // LAppAdapter.getInstance().setChara(modelPath, modelName)
              window.api.setChara(modelPath, modelName)
            }
          }} />


        </div>

        <div hidden={tabNum !== 1}>
          <div className="rightContainerTitle">隐私</div>
          <BoolItem icon={<ChatBubbleIcon />} mainText="启用主动对话" description="启用后 AI 会不定时主动发起对话，可能会消耗更多 token" type="bool" callback={() => { setActiveChat((val) => { !val }) }} content={activeChat} />
          <BoolItem icon={<SaveIcon />} mainText="保存对话摘要" description="会增加 token 消耗" type="bool" callback={(val) => { setSaveOnDelete(val); window.api.setStore("saveOnDelete", val); }} content={saveOnDelete} />
          {/* <BoolItem icon={<RecordVoiceOverIcon />} mainText="启用麦克风" description="启用后可以使用语音功能" type="bool" callback={(val) => { setEnableMicrophone(val); window.api.setStore("enableMicrophone", val); }} content={enableMicrophone} /> */}
        </div>

        <div hidden={tabNum !== 2}>
          <div className="rightContainerTitle">模型适配</div>

          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ fontSize: "24px" }}>
              基础信息
            </div>
          </div>
          <LongTextFieldItem icon={<NotesIcon />} mainText="character" description="模型的描述" type="input" callback={(val) => { setModelDesc(val); window.api.setStore(modelName + ".desc", val); window.api.requestModel({ method: "post", body: { command: "setModelDesc", value: val } }) }} content={modelDesc} />

          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "10px", marginTop: "20px" }}>
            <div style={{ fontSize: "24px" }}>
              表情
            </div>
            <div>
              <button
                style={{
                  backgroundColor: "#3c3c3c",
                  color: "white",
                  marginRight: "20px",
                  border: "1px solid #303030",
                  borderRadius: "5px",
                  height: "100%"
                }}
                onClick={() => {
                  window.api.requestModel(
                    {
                      method: "get",
                      body: { name: "exps" }
                    }
                  )
                }}>刷新</button>
              {/* <button
              style={{
                backgroundColor: "#3c3c3c",
                color: "white",
                marginRight: "20px",
                border: "1px solid #303030",
                borderRadius: "5px",
                height: "100%"
              }}
              onClick={() => {
                // window.api.setStore(modelName, undefined)
                // window.api.setStore(modelName, [])
                window.api.deleteStore(modelName)
                setModelExpressionConfig([])
              }}>清空</button> */}
            </div>
          </div>

          {
            modelExpressionConfig.map((config, index) => {
              return <TextWithButtonItem
                key={index}
                icon={<EmojiEmotionsIcon />}
                mainText={config.name}
                description={""}
                type="input"
                callback={
                  (val) => {
                    setModelExpressionConfig(
                      [...modelExpressionConfig.slice(0, index),
                      { name: config.name, explaination: val },
                      ...modelExpressionConfig.slice(index + 1)]
                    )

                    const newModelExpressionConfig = [...modelExpressionConfig.slice(0, index),
                    { name: config.name, explaination: val },
                    ...modelExpressionConfig.slice(index + 1)]

                    window.api.setStore(modelName + ".exps", newModelExpressionConfig)

                    window.api.requestModel({
                      method: "post",
                      body: {
                        command: "setExpressionDesc",
                        value: newModelExpressionConfig
                      }
                    })
                  }
                }
                content={{
                  value: config.explaination,
                  buttonText: "测试",
                  action: () => {
                    window.api.requestModel({
                      method: "post",
                      body: {
                        command: "setExpression",
                        value: config.name
                      }
                    })
                  }
                }} />
            })
          }
          {
            (modelExpressionConfig.length === 0) && <div>该模型没有内置表情</div>
          }

          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "10px", marginTop: "20px" }}>
            <div style={{ fontSize: "24px" }}>
              动作
            </div>
            <div>
              <button
                style={{
                  backgroundColor: "#3c3c3c",
                  color: "white",
                  marginRight: "20px",
                  border: "1px solid #303030",
                  borderRadius: "5px",
                  height: "100%"
                }}
                onClick={() => {
                  window.api.requestModel(
                    {
                      method: "get",
                      body: { name: "motions" }
                    }
                  )
                }}>重置</button>
            </div>
          </div>
          {
            (modelExpressionConfig.length === 0) && <div>该模型没有内置表情</div>
          }
          {
            modelMotionConfig.map((config, groupIndex) => {
              return <>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "10px", marginTop: "20px" }}>
                  <div>动作组：{config.group}</div>
                </div>

                {
                  config.name.map((motion, index) => {
                    return <TextWithButtonItem
                      key={index}
                      icon={<AccessibleForwardIcon />}
                      mainText={index.toString()}
                      description=""
                      type="input"
                      callback={(val) => {
                        const newConfig = (
                          [
                            ...modelMotionConfig.slice(0, groupIndex),
                            {
                              group: config.group,
                              name: [...config.name.slice(0, index), val, ...config.name.slice(index + 1)]
                            },
                            ...modelMotionConfig.slice(groupIndex + 1)
                          ]
                        )
                        setModelMotionConfig(newConfig)
                        window.api.setStore(modelName + ".motions", newConfig)
                        window.api.requestModel({
                          method: "post",
                          body: {
                            command: "setMotionDesc",
                            value: newConfig
                          }
                        })
                      }}
                      content={{
                        value: motion,
                        buttonText: "测试",
                        action: () => {
                          window.api.requestModel({
                            method: "post",
                            body: {
                              command: "setMotion",
                              value: { group: config.group, num: index }
                            }
                          })
                        }
                      }}
                    />
                  })
                }
              </>
            })
          }
        </div>

        <div hidden={tabNum !== 3}>
          <div className="rightContainerTitle">语音合成</div>

          <SelectItem icon={<SwapHorizIcon />} mainText="SoVits 配置" description="选择使用的 SoVits 配置" type="selection" callback={(val) => {
            setCurrentSoVitsConfig(SoVitsConfigs.configs[val])
            setSoVitsConfigs(() => {
              return { ...SoVitsConfigs, current: val }
            })
            window.api.setStore("SoVitsConfigs", { ...SoVitsConfigs, current: val })
          }} content={{ default: SoVitsConfigs.current, options: Object.keys(SoVitsConfigs.configs) }} />

          <SelectItem icon={<LanguageIcon />} mainText="语言" description="选择语言" type="selection" callback={(val) => {
            setCurrentSoVitsConfig(() => {
              return { ...currentSoVitsConfig, text_lang: val }
            })
            setSoVitsConfigs(() => {
              return {
                ...SoVitsConfigs,
                configs: {
                  ...SoVitsConfigs.configs,
                  [SoVitsConfigs.current]: { ...currentSoVitsConfig, text_lang: val }
                }
              }
            })
            window.api.setStore("SoVitsConfigs", {
              ...SoVitsConfigs,
              configs: {
                ...SoVitsConfigs.configs,
                [SoVitsConfigs.current]: { ...currentSoVitsConfig, text_lang: val }
              }
            })
          }} content={{ default: currentSoVitsConfig.text_lang, options: ["all_zh", "en", "all_ja", "all_yue", "all_ko", "zh", "ja", "yue", "ko", "auto", "auto_yue"] }} />

          <TextWithButtonItem icon={<FolderIcon />} mainText="参考音频路径" description="音色参考音频" type="input" callback={(val) => {
            setCurrentSoVitsConfig(() => {
              return { ...currentSoVitsConfig, ref_audio_path: val }
            })
            setSoVitsConfigs(() => {
              return {
                ...SoVitsConfigs,
                configs: {
                  ...SoVitsConfigs.configs,
                  [SoVitsConfigs.current]: { ...currentSoVitsConfig, ref_audio_path: val }
                }
              }
            })
            window.api.setStore("SoVitsConfigs", {
              ...SoVitsConfigs,
              configs: {
                ...SoVitsConfigs.configs,
                [SoVitsConfigs.current]: { ...currentSoVitsConfig, ref_audio_path: val }
              }
            })
          }} content={{
            value: currentSoVitsConfig.ref_audio_path, buttonText: "选择文件", action: () => {
              window.api.openFile().then((value: string) => {
                if (value === "") return
                // TODO: add auto detection for file type
                setCurrentSoVitsConfig(() => {
                  return { ...currentSoVitsConfig, ref_audio_path: value }
                })
                setSoVitsConfigs(() => {
                  return {
                    ...SoVitsConfigs,
                    configs: {
                      ...SoVitsConfigs.configs,
                      [SoVitsConfigs.current]: { ...currentSoVitsConfig, ref_audio_path: value }
                    }
                  }
                })
                window.api.setStore("SoVitsConfigs", {
                  ...SoVitsConfigs,
                  configs: {
                    ...SoVitsConfigs.configs,
                    [SoVitsConfigs.current]: { ...currentSoVitsConfig, ref_audio_path: value }
                  }
                })
              })
            }
          }} />

          {/* TODO: aux_ref_audio_paths */}

          <TextFieldItem icon={<NotesIcon />} mainText="参考音频文本" description="" type="input" callback={(val) => {
            setCurrentSoVitsConfig(() => {
              return { ...currentSoVitsConfig, prompt_text: val }
            })
            setSoVitsConfigs(() => {
              return {
                ...SoVitsConfigs,
                configs: {
                  ...SoVitsConfigs.configs,
                  [SoVitsConfigs.current]: { ...currentSoVitsConfig, prompt_text: val }
                }
              }
            })
            window.api.setStore("SoVitsConfigs", {
              ...SoVitsConfigs,
              configs: {
                ...SoVitsConfigs.configs,
                [SoVitsConfigs.current]: { ...currentSoVitsConfig, prompt_text: val }
              }
            })
          }} content={currentSoVitsConfig.prompt_text} />

          <SelectItem icon={<LanguageIcon />} mainText="prompt 语言" description="选择 prompt 语言" type="selection" callback={(val) => {
            setCurrentSoVitsConfig(() => {
              return { ...currentSoVitsConfig, prompt_lang: val }
            })
            setSoVitsConfigs(() => {
              return {
                ...SoVitsConfigs,
                configs: {
                  ...SoVitsConfigs.configs,
                  [SoVitsConfigs.current]: { ...currentSoVitsConfig, prompt_lang: val }
                }
              }
            })
            window.api.setStore("SoVitsConfigs", {
              ...SoVitsConfigs,
              configs: {
                ...SoVitsConfigs.configs,
                [SoVitsConfigs.current]: { ...currentSoVitsConfig, prompt_lang: val }
              }
            })
          }} content={{ default: currentSoVitsConfig.prompt_lang, options: ["all_zh", "en", "all_ja", "all_yue", "all_ko", "zh", "ja", "yue", "ko", "auto", "auto_yue"] }} />

          <TextWithButtonItem icon={<PlaylistAddIcon />} mainText="增加选项" description="" type="input" callback={(val) => {
            setNewSoVitsConfigName(val)
          }} content={{
            value: newSoVitsConfigName, buttonText: "增加", action: () => {
              if (newSoVitsConfigName === "") return
              const newConfig = {
                current: newSoVitsConfigName,
                configs: {
                  ...SoVitsConfigs.configs,
                  [newSoVitsConfigName]: {
                    "text_lang": "zh",
                    "ref_audio_path": "C:/fakepath/audio.wav",
                    "aux_ref_audio_paths": [],
                    "prompt_text": "",
                    "prompt_lang": "zh",
                    "top_k": 5,
                    "top_p": 1,
                    "temperature": 1,
                    "text_split_method": "cut0",  // fixed
                    "batch_size": 1,  // fixed
                    "batch_threshold": 0.75, // fixed
                    "split_bucket": true, // fixed
                    "return_fragment": false, // fixed
                    "speed_factor": 1.0, // fixed
                    "streaming_mode": false, // fixed
                    "seed": -1, // fixed
                    "parallel_infer": true, // fixed
                    "repetition_penalty": 1.35, // fixed
                    "media_type": "wav",    // not supported for now
                  }
                }
              }
              setSoVitsConfigs(newConfig)
              setCurrentSoVitsConfig(newConfig.configs[newSoVitsConfigName])
              setNewSoVitsConfigName("")
              window.api.setStore("SoVitsConfigs", newConfig)
            }
          }} />

          <div className="rightContainerTitle">语音识别</div>

          <TextFieldItem icon={<KeyIcon />} mainText="APPID" description="APPID" type="input" callback={(val) => {
            const newConfig = { ...xfVoiceConfig, APPID: val }
            setXfVoiceConfig(newConfig)
            window.api.setStore("xfVoiceConfig", newConfig)
          }} content={xfVoiceConfig.APPID} />

          <TextFieldItem icon={<KeyIcon />} mainText="API Key" description="API Key" type="input" callback={(val) => {
            const newConfig = { ...xfVoiceConfig, APIKey: val }
            setXfVoiceConfig(newConfig)
            window.api.setStore("xfVoiceConfig", newConfig)
          }} content={xfVoiceConfig.APIKey} />

          <TextFieldItem icon={<KeyIcon />} mainText="API Secret" description="API Secret" type="input" callback={(val) => {
            const newConfig = { ...xfVoiceConfig, APISecret: val }
            setXfVoiceConfig(newConfig)
            window.api.setStore("xfVoiceConfig", newConfig)
          }} content={xfVoiceConfig.APISecret} />


          {/* <TextFieldItem icon={<KeyIcon />} mainText="top_k" description="top_k" type="input" callback={(val) => {
            setCurrentSoVitsConfig(() => {
              return { ...currentSoVitsConfig, top_k: parseInt(val) }
            })
            setSoVitsConfigs(() => {
              return {
                ...SoVitsConfigs,
                configs: {
                  ...SoVitsConfigs.configs,
                  [SoVitsConfigs.current]: { ...currentSoVitsConfig, top_k: parseInt(val) }
                }
              }
            })
            window.api.setStore("SoVitsConfigs", SoVitsConfigs)
          }} content={currentSoVitsConfig.top_k.toString()} /> */}


        </div>

        <div hidden={tabNum !== 4}>
          <div className="rightContainerTitle">信息</div>
          <div> Serika 是一款基于 live2d 的桌宠项目。配合 GPT-SoVits 使用 api_v2.py 启动的后台服务程序体验更佳。</div>
          {/* <div>Serika Enchance 包括文字转语音等功能，您也可以自定义语音转文字服务 api 路径</div> */}
          <br></br>
          <div>项目地址：<a href="https://github.com/rouVling/Live2d-LLM-friend">https://github.com/rouVling/Live2d-LLM-friend</a></div>
        </div>

      </div>
    </StyleNameContext.Provider>
  </div>
}

