import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
} from "react-native";
import { AdsProvider, InlineAd } from "@kontextso/sdk-react-native";
import { PUBLISHER_TOKEN, PLACEMENT_CODE } from "./constants";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
}

export type AdState = 'init' | 'loading' | 'success' | 'fail'

export const KontextAdSensorInfo = {
  ad_message_id: '',
  ad_state: 'init' as AdState,
  // 定时器
  ad_state_timer: null as unknown as NodeJS.Timeout,
  ad_start_loading_time: -1,
  last_ad_show_time: -1,
  chat_rounds_current_plot: -1,
  is_fresh: true,
  ad_type: '',
  plot_id: '',
  ad_text: '',
  ad_media_id: '',
}

const getRandomId = () => {
  return Date.now() + Math.random().toString(36).substring(2, 15);
};

const startLoadingAd = (callback: () => void, timeout: number) => {
  // setTimeout(callback, timeout);
};

const updateKontextAdsStatusToBackEnd = (status: boolean, characterId: number) => {
  console.log("updateKontextAdsStatusToBackEnd", status, characterId);
};

export const setKontextAdSensorInfoState = (newState: AdState) => {
  const currentState = KontextAdSensorInfo.ad_state
  const validTransitions: Record<AdState, AdState[]> = {
    init: [],
    loading: ['success', 'fail'],
    success: ['init'],
    fail: ['init'],
  }
  if (validTransitions[currentState]?.includes(newState)) {
    KontextAdSensorInfo.ad_state = newState
    if (newState == 'success' || newState == 'fail') {
      clearTimeout(KontextAdSensorInfo.ad_state_timer)
    }

    return true
  }
  return false
}


export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState(() => getRandomId());
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const [kontextAdsMsgListShouldUpdate, setKontextAdsMsgListShouldUpdate] = useState(false);
  const [loadKontextAdsEnable, setLoadKontextAdsEnable] = useState(false);
  const [msgForKontextAds, setMsgForKontextAds] = useState<Message[]>([]);
  const [isShowLoadingText, setIsShowLoadingText] = useState(false);

  const character={
    name: 'John Doe',
    avatarUrl: 'https://via.placeholder.com/150',
    isNsfw: false,
    id: 123,
    greeting: 'Hello, how are you?',
    persona: 'I am a test persona',
    tags: ['test', 'persona'],
  }

  const sendSSEEvent = () => {
    console.log("SSE event");
    setKontextAdsMsgListShouldUpdate(true)
    setLoadKontextAdsEnable(true)
    startLoadingAd(() => {
      setKontextAdSensorInfoState('init')
      setLoadKontextAdsEnable(false)
    }, 30 * 1000)
  }

  const onSubmit = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: getRandomId(),
      role: "user",
      content: input,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          id: getRandomId(),
          role: "assistant",
          content: "This is a test response from the assistant.",
          createdAt: new Date(),
        },
      ]);
      sendSSEEvent();
    }, 5000);
  };


  useEffect(() => {
    if (!isShowLoadingText && kontextAdsMsgListShouldUpdate) {
      const messagesForAds: { id: string; role: string; content: string; createdAt: Date }[] = []
      messages.forEach((msg) => {
        if (msg.role == 'assistant') {
          // 角色回复的信息
          const pushItem = {
            id: msg.id,
            role: 'assistant',
            content: msg.content,
            createdAt: new Date(),
          }
          messagesForAds.push(pushItem)
        }
        if (msg.role == 'user') {
          // 用户输入的信息
          const pushItem = {
            id: msg.id,
            role: 'user',
            content: msg.content,
            createdAt: new Date(),
          }
          messagesForAds.push(pushItem)
        }
      })
      const newList = messagesForAds.slice(-10)
      // 这里开始拉取广告
      setMsgForKontextAds(newList)
      setKontextAdsMsgListShouldUpdate(false)
    }
  }, [
    messages.length,
    setMsgForKontextAds,
    isShowLoadingText,
    kontextAdsMsgListShouldUpdate,
    setKontextAdsMsgListShouldUpdate,
  ])

  return (
    <SafeAreaView style={[styles.safeArea, theme === "dark" && styles.darkTheme]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} theme`}
            onPress={() => setTheme(theme === "light" ? "dark" : "light")}
          />
        </View>

        <AdsProvider
          messages={messages}
          publisherToken={PUBLISHER_TOKEN}
          userId={userId}
          conversationId={getRandomId()}
          enabledPlacementCodes={[PLACEMENT_CODE]}
          isDisabled={!loadKontextAdsEnable && !kontextAdsMsgListShouldUpdate}
          staleAdsHandling="preserve"
          character={{
            name: character.name,
            avatarUrl: character.avatarUrl,
            isNsfw: false,
            id: character.id.toString(),
            greeting: character.greeting,
            persona: character.persona,
            tags: character.tags,
          }}
          onEvent={(ad: any) => {
            // 广告事件的回调。
            const PublicAd = ad.payload
            if (ad.name == 'ad.error' || ad.name == 'ad.no-fill') {
              // 广告错误
              if (setKontextAdSensorInfoState('fail')) {
                setKontextAdSensorInfoState('init')
                updateKontextAdsStatusToBackEnd(false, character.id)
                const errorMsg = ad.name == 'ad.error' ? 'llm_error' : 'no_fill'
              }
            } else if (ad.name == 'ad.clicked') {
              // 点击广告
              KontextAdSensorInfo.ad_type = PublicAd.format
              KontextAdSensorInfo.plot_id = character.id.toString()
              KontextAdSensorInfo.ad_text = PublicAd.content
              KontextAdSensorInfo.ad_media_id = PublicAd.id
            } else if (ad.name == 'ad.viewed') {
              // 广告展示
              setLoadKontextAdsEnable(false)
              if (setKontextAdSensorInfoState('success')) {
                setKontextAdSensorInfoState('init')
                const nowTime = new Date().getTime()
                KontextAdSensorInfo.is_fresh = false
                KontextAdSensorInfo.last_ad_show_time = nowTime
                updateKontextAdsStatusToBackEnd(true, 123)
              }
            }
          }}
        >
          <ScrollView style={styles.messages}>
            {msgForKontextAds.map((msg) => (
              <View key={msg.id} style={styles.message}>
                <Text style={[styles.role, theme === "dark" && styles.darkText]}>
                  {msg.role}:
                </Text>
                <Text style={[styles.content, theme === "dark" && styles.darkText]}>
                  {msg.content}
                </Text>

                <InlineAd
                  code={PLACEMENT_CODE}
                  messageId={msg.id}
                  theme={theme}
                />
              </View>
            ))}
            {isLoading && <Text>Loading...</Text>}
          </ScrollView>

          <View style={styles.footer}>
            <TextInput
              style={[styles.input, theme === "dark" && styles.darkInput]}
              value={input}
              onChangeText={setInput}
              placeholder="Type your message here..."
              placeholderTextColor={theme === "dark" ? "#888" : "#ccc"}
              multiline
              editable={!isLoading}
            />
            <Button title="Send" onPress={onSubmit} disabled={isLoading} />
          </View>
        </AdsProvider>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  darkTheme: {
    backgroundColor: "#000",
  },
  darkText: {
    color: "#fff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  header: {
    marginBottom: 16,
  },
  messages: {
    flex: 1,
  },
  message: {
    marginBottom: 12,
    paddingBottom: 8,
  },
  role: {
    fontWeight: "bold",
  },
  content: {
    paddingBottom: 12,
  },
  footer: {
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    minHeight: 80,
    textAlignVertical: "top",
  },
  darkInput: {
    borderColor: "#444",
    backgroundColor: "#111",
    color: "#fff",
  },
});
