import React, { useState } from 'react'
import { View, Text, TextInput, Button, ScrollView, StyleSheet, SafeAreaView, Platform } from 'react-native'
import { AdsProvider, InlineAd } from '@kontextso/sdk-react-native'
// import { PUBLISHER_TOKEN, PLACEMENT_CODE } from "./constants";
export const PUBLISHER_TOKEN = 'sayloai-dev'
export const PLACEMENT_CODE = 'inlineAd'
import { create } from 'zustand'

interface Message {
  id: string
  role: string
  content: string
  createdAt: Date
}

export const useMessageStore = create((set) => ({
  messages: [] as Message[],
  setMessages: (messages: Message) => set(() => ({ messages: messages })),
}))

const getRandomId = () => {
  return Date.now() + Math.random().toString(36).substring(2, 15)
}

function MessageList() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const messages = useMessageStore((state: any) => state.messages)
  const setMessages = useMessageStore((state: any) => state.setMessages)
  const [input, setInput] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const onSubmit = () => {
    if (!input.trim()) return

    const newMessage: Message = {
      id: getRandomId(),
      role: 'user',
      content: input,
      createdAt: new Date(),
    }

    setMessages([...messages, newMessage])
    setInput('')
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      setMessages([
        ...messages,
        newMessage,
        {
          id: getRandomId(),
          role: 'assistant',
          content: 'This is a test response from the assistant.',
          createdAt: new Date(),
        },
      ])
    }, 5000)
  }

  return (
    <>
      <ScrollView style={styles.messages}>
        {messages.map((msg: Message) => (
          // <View key={msg.id} style={styles.message}>
          //   <Text style={[styles.role, theme === 'dark' && styles.darkText]}>{msg.role}:</Text>
          //   <Text style={[styles.content, theme === 'dark' && styles.darkText]}>{msg.content}</Text>

          //   <InlineAd code={PLACEMENT_CODE} messageId={msg.id} theme={theme} />
          // </View>
          // The block of code here above works properly, but the code below is functioning abnormally.
          <View key={msg.id} style={styles.message}>
            <View>
              <Text style={[styles.role, theme === 'dark' && styles.darkText]}>{msg.role}:</Text>
              <Text style={[styles.content, theme === 'dark' && styles.darkText]}>{msg.content}</Text>
            </View>
            <View style={{ height: 100, backgroundColor: '#bbffff50' }}>
              <InlineAd code={PLACEMENT_CODE} messageId={msg.id} theme={theme} />
            </View>
          </View>
        ))}
        {isLoading && <Text>Loading...</Text>}
      </ScrollView>

      <View style={styles.footer}>
        <TextInput
          style={[styles.input, theme === 'dark' && styles.darkInput]}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message here..."
          placeholderTextColor={theme === 'dark' ? '#888' : '#ccc'}
          multiline
          editable={!isLoading}
        />
        <Button title="Send" onPress={onSubmit} disabled={isLoading} />
      </View>
    </>
  )
}

export default function Home() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const [conversationId] = useState(() => getRandomId())
  const [userId] = useState(() => getRandomId())
  //   const [messages, setMessages] = useState<Message[]>([])
  const messages = useMessageStore((state: any) => state.messages)

  console.debug('messages', messages)

  return (
    <SafeAreaView style={[styles.safeArea, theme === 'dark' && styles.darkTheme]}>
      <View style={styles.container}>
        <AdsProvider
          messages={messages}
          publisherToken={PUBLISHER_TOKEN}
          userId={userId}
          conversationId={conversationId}
          enabledPlacementCodes={[PLACEMENT_CODE]}
        >
          <MessageList></MessageList>
        </AdsProvider>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  darkTheme: {
    backgroundColor: '#000',
  },
  darkText: {
    color: '#fff',
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
    fontWeight: 'bold',
  },
  content: {
    paddingBottom: 12,
  },
  footer: {
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  darkInput: {
    borderColor: '#444',
    backgroundColor: '#111',
    color: '#fff',
  },
})
