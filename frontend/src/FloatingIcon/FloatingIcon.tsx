import { useEffect, useRef, useState } from 'react'
import axios from 'axios'

type Message = {
  id: number | string
  text: string
  sender: 'USER' | 'AI'
}

type StoredMessage = {
  id: string
  role: 'USER' | 'AI'
  content: string
}

type ChatResponse = {
  aiResponse: string
  conversation_id: string
}

type ConversationMessagesResponse = {
  conversation_id: string
  messages: StoredMessage[]
}

type CreateConversationResponse = {
  conversation_id: string
}

const initialMessages: Message[] = [
  {
    id: 1,
    text: 'Hi, welcome to Spur Chat. How can I help?',
    sender: 'AI',
  },
]

const api = axios.create({
  baseURL: 'http://localhost:3000',
})

function DocumentIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 3.75h6.5L19 9.25v11A1.75 1.75 0 0 1 17.25 22H7a1.75 1.75 0 0 1-1.75-1.75V5.5A1.75 1.75 0 0 1 7 3.75Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4v5.25H19" />
      <path strokeLinecap="round" d="M8.5 13h7M8.5 16.5h5" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4.75 5.75 14.5 6.25-14.5 6.25 3.25-6.25-3.25-6.25Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h11" />
    </svg>
  )
}

function TypingIndicator() {
  return (
    <div
      aria-label="AI is generating a response"
      className="flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-[0_10px_28px_rgba(0,0,0,0.12)] ring-1 ring-zinc-200"
      role="status"
    >
      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-zinc-950 [animation-delay:-0.24s]" />
      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-zinc-700 [animation-delay:-0.12s]" />
      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-zinc-500" />
    </div>
  )
}

export default function FloatingIcon() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const latestMessageRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>(initialMessages)

  useEffect(() => {
    latestMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen, isSending])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const loadMessages = async () => {
      const conversationId = localStorage.getItem('conversationId')

      if (!conversationId) {
        setMessages(initialMessages)
        return
      }

      setIsLoadingMessages(true)

      try {
        const conversation = await api.get<ConversationMessagesResponse>(`/chat/${conversationId}`)
        const loadedMessages = conversation.data.messages.map((chatMessage) => ({
          id: chatMessage.id,
          text: chatMessage.content,
          sender: chatMessage.role,
        }))

        setMessages(loadedMessages.length > 0 ? loadedMessages : initialMessages)
      } catch {
        setMessages([
          ...initialMessages,
          {
            id: 'load-error',
            text: 'Sorry, I could not load your previous messages.',
            sender: 'AI',
          },
        ])
      } finally {
        setIsLoadingMessages(false)
      }
    }

    loadMessages()
  }, [isOpen])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedMessage = message.trim()

    if (!trimmedMessage || isSending) {
      return
    }

    const userMessage: Message = {
      id: Date.now(),
      text: trimmedMessage,
      sender: 'USER',
    }

    setMessages((currentMessages) => [...currentMessages, userMessage])
    setMessage('')
    setIsSending(true)

    try {
      let conversationId = localStorage.getItem('conversationId')

      if (!conversationId) {
        const createConversation = await api.post<CreateConversationResponse>('/chat/createConversation')
        conversationId = createConversation.data.conversation_id
        localStorage.setItem('conversationId', conversationId)
      }

      const supportReply = await api.post<ChatResponse>('/chat/message', {
        userPrompt: userMessage.text,
        conversation_id: conversationId,
      })

      const aiMessage: Message = {
        id: Date.now() + 1,
        text: supportReply.data.aiResponse,
        sender: 'AI',
      }

      setMessages((currentMessages) => [...currentMessages, aiMessage])
    } catch {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          text: 'Sorry, I could not connect to the server. Please try again.',
          sender: 'AI',
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <section className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-4 sm:bottom-6 sm:right-6">
      {isOpen && (
        <div className="flex h-[540px] w-[380px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
          <header className="border-b border-zinc-200 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 px-5 py-5 text-center text-white">
            <h2 className="text-xl font-semibold tracking-normal">Customer Support</h2>
            <p className="mt-1 text-xs font-medium text-zinc-300">Spur Chat assistant</p>
          </header>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-gradient-to-b from-white via-zinc-50 to-zinc-100 px-4 py-5">
            {isLoadingMessages && (
              <div className="max-w-[78%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm leading-5 text-zinc-900 shadow-[0_10px_28px_rgba(0,0,0,0.12)] ring-1 ring-zinc-200">
                Loading previous messages...
              </div>
            )}
            {messages.map((chatMessage) => (
              <div
                className={
                  chatMessage.sender === 'USER'
                    ? 'ml-auto max-w-[78%] rounded-2xl rounded-br-md bg-zinc-100 px-4 py-3 text-sm leading-5 text-zinc-950 shadow-[0_10px_28px_rgba(0,0,0,0.12)] ring-1 ring-zinc-200'
                    : 'max-w-[78%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm leading-5 text-zinc-900 shadow-[0_10px_28px_rgba(0,0,0,0.12)] ring-1 ring-zinc-200'
                }
                key={chatMessage.id}
              >
                {chatMessage.text}
              </div>
            ))}
            {isSending && <TypingIndicator />}
            <div ref={latestMessageRef} />
          </div>

          <form
            className="flex items-center gap-2 border-t border-zinc-200 bg-white px-4 py-3"
            onSubmit={handleSubmit}
          >
            <input
              aria-label="Type your query"
              className="min-w-0 flex-1 rounded-xl bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-500 focus:bg-white focus:ring-2 focus:ring-zinc-300"
              disabled={isSending || isLoadingMessages}
              placeholder={
                isLoadingMessages
                  ? 'Loading messages...'
                  : isSending
                    ? 'Waiting for response...'
                    : 'Type your query here...'
              }
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <button
              aria-label="Send message"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-zinc-950 text-white transition hover:-translate-y-0.5 hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-300 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSending || isLoadingMessages}
              type="submit"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}

      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close customer support chat' : 'Open customer support chat'}
        className="grid h-16 w-16 place-items-center rounded-full border border-white bg-gradient-to-br from-zinc-950 via-zinc-800 to-zinc-600 text-white shadow-[0_18px_44px_rgba(0,0,0,0.28)] transition hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-zinc-300"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        <DocumentIcon />
      </button>
    </section>
  )
}
