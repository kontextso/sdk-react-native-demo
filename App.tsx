import React, { useState } from "react";
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

const getRandomId = () => {
  return Date.now() + Math.random().toString(36).substring(2, 15);
};

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(() => getRandomId());
  const [userId] = useState(() => getRandomId());
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

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
    }, 5000);
  };

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
          // adServerUrl="http://192.168.18.48:3002"
          messages={messages}
          publisherToken={PUBLISHER_TOKEN}
          userId={userId}
          userEmail="test@test.com"
          conversationId={conversationId}
          enabledPlacementCodes={[PLACEMENT_CODE]}
          onDebugEvent={(event, data) => {
            // console.log(event, data);
          }}
        >
          <ScrollView style={styles.messages}>
            {messages.map((msg) => (
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
