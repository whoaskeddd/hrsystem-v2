import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";

import { useAppContext, type Message } from "../app/app-context";
import { Button } from "../shared/ui/button";
import { Input } from "../shared/ui/input";
import { PageTopBar } from "../shared/ui/page-top-bar";
import { SectionCard } from "../shared/ui/section-card";
import { Surface } from "../shared/ui/surface";
import { Tag } from "../shared/ui/tag";

function formatMessageTime(value: string) {
  if (!value) {
    return "Сейчас";
  }

  const date = new Date(value);
  const isToday = new Date().toDateString() === date.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return date.toLocaleDateString([], { day: "2-digit", month: "2-digit" });
}

function areMessagesEqual(left: Message[], right: Message[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((item, index) => {
    const other = right[index];
    return item.id === other.id && item.body === other.body && item.status === other.status && item.sentAt === other.sentAt && item.readAt === other.readAt;
  });
}

function playIncomingMessageSound() {
  try {
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      return;
    }

    const context = new AudioContextCtor();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    gainNode.gain.setValueAtTime(0.0001, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.18);
    void context.close().catch(() => undefined);
  } catch {
    return;
  }
}

export function MessagesPage() {
  const { data, loadChatMessages, markChatRead, refreshData, sendChatMessage, sessionUser } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeChatId, setActiveChatId] = useState(searchParams.get("chat") ?? "");
  const [chatSearch, setChatSearch] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightIncoming, setHighlightIncoming] = useState(false);
  const [blinkingChatId, setBlinkingChatId] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const prevChatIdRef = useRef("");
  const prevMessageCountRef = useRef(0);
  const shouldStickToBottomRef = useRef(true);
  const loadChatMessagesRef = useRef(loadChatMessages);
  const markChatReadRef = useRef(markChatRead);
  const refreshDataRef = useRef(refreshData);
  const sendChatMessageRef = useRef(sendChatMessage);
  const lastNotifiedMessageIdRef = useRef("");

  useEffect(() => {
    loadChatMessagesRef.current = loadChatMessages;
    markChatReadRef.current = markChatRead;
    refreshDataRef.current = refreshData;
    sendChatMessageRef.current = sendChatMessage;
  }, [loadChatMessages, markChatRead, refreshData, sendChatMessage]);

  const sortedChats = useMemo(() => [...data.chats].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)), [data.chats]);
  const filteredChats = useMemo(() => {
    const query = chatSearch.trim().toLowerCase();
    if (!query) {
      return sortedChats;
    }

    return sortedChats.filter((chat) => [chat.peerName, chat.companyName, chat.vacancyTitle, chat.lastMessageText].join(" ").toLowerCase().includes(query));
  }, [chatSearch, sortedChats]);
  const activeChat = useMemo(() => sortedChats.find((chat) => chat.id === activeChatId) ?? null, [activeChatId, sortedChats]);

  useEffect(() => {
    const requestedChatId = searchParams.get("chat") ?? "";
    if (requestedChatId && requestedChatId !== activeChatId) {
      setActiveChatId(requestedChatId);
    }
  }, [activeChatId, searchParams]);

  useEffect(() => {
    if (!activeChatId && filteredChats.length > 0) {
      setActiveChatId(filteredChats[0].id);
      return;
    }

    if (activeChatId && sortedChats.length > 0 && !sortedChats.some((chat) => chat.id === activeChatId)) {
      setActiveChatId(sortedChats[0].id);
    }
  }, [activeChatId, filteredChats, sortedChats]);

  useEffect(() => {
    if (!activeChatId) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("chat");
      setSearchParams(nextParams, { replace: true });
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("chat", activeChatId);
    setSearchParams(nextParams, { replace: true });
  }, [activeChatId, searchParams, setSearchParams]);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentChat() {
      if (!activeChatId) {
        setMessages([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const nextMessages = await loadChatMessagesRef.current(activeChatId);
        if (cancelled) {
          return;
        }
        setMessages(nextMessages);
        shouldStickToBottomRef.current = true;
        lastNotifiedMessageIdRef.current = nextMessages[nextMessages.length - 1]?.id ?? "";
        setLoading(false);
        void markChatReadRef.current(activeChatId).catch(() => undefined);
        void refreshDataRef.current().catch(() => undefined);
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : "Не удалось загрузить сообщения.");
          setLoading(false);
        }
      }
    }

    void loadCurrentChat();
    return () => {
      cancelled = true;
    };
  }, [activeChatId]);

  useEffect(() => {
    if (!activeChatId) {
      return;
    }

    const interval = window.setInterval(() => {
      setRefreshing(true);
      void loadChatMessagesRef.current(activeChatId)
        .then((nextMessages) => {
          const lastMessage = nextMessages[nextMessages.length - 1];
          const hasNewIncoming =
            lastMessage &&
            lastMessage.id !== lastNotifiedMessageIdRef.current &&
            lastMessage.senderId !== sessionUser?.id;

          if (hasNewIncoming) {
            lastNotifiedMessageIdRef.current = lastMessage.id;
            setHighlightIncoming(true);
            setBlinkingChatId(activeChatId);
            playIncomingMessageSound();
            window.setTimeout(() => setHighlightIncoming(false), 1400);
            window.setTimeout(() => setBlinkingChatId(""), 1800);
          }

          setMessages((current) => (areMessagesEqual(current, nextMessages) ? current : nextMessages));
        })
        .catch(() => undefined)
        .finally(() => {
          setRefreshing(false);
        });
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [activeChatId, sessionUser?.id]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const handleScroll = () => {
      const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      shouldStickToBottomRef.current = distanceToBottom < 80;
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [activeChatId]);

  useEffect(() => {
    const chatChanged = prevChatIdRef.current !== activeChatId;
    const newMessageAdded = messages.length > prevMessageCountRef.current;

    if (chatChanged || (newMessageAdded && shouldStickToBottomRef.current && !draft.trim())) {
      scrollAnchorRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    }

    prevChatIdRef.current = activeChatId;
    prevMessageCountRef.current = messages.length;
  }, [activeChatId, draft, messages]);

  const chatTitle = activeChat?.peerName || activeChat?.candidateName || activeChat?.companyName || "Сообщения";

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeChat || !draft.trim()) {
      return;
    }

    try {
      setSending(true);
      setError(null);
      const messageBody = draft.trim();
      setDraft("");
      shouldStickToBottomRef.current = true;
      await sendChatMessageRef.current(activeChat.id, messageBody);
      const nextMessages = await loadChatMessagesRef.current(activeChat.id);
      lastNotifiedMessageIdRef.current = nextMessages[nextMessages.length - 1]?.id ?? "";
      setMessages((current) => (areMessagesEqual(current, nextMessages) ? current : nextMessages));
      await Promise.allSettled([markChatReadRef.current(activeChat.id), refreshDataRef.current()]);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не удалось отправить сообщение.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="page-enter space-y-6">
      <PageTopBar title="Сообщения" subtitle="Переписка с компаниями и кандидатами в одном встроенном мессенджере." />

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <SectionCard title="Диалоги" eyebrow={`${sortedChats.length} чатов`} className="flex flex-col overflow-hidden p-0 xl:h-[calc(100vh-230px)]">
          <div className="border-b border-white/8 px-5 py-4 sm:px-6">
            <Input value={chatSearch} onChange={(event) => setChatSearch(event.target.value)} placeholder="Поиск по компании, вакансии или сообщению" />
          </div>

          <div className="max-h-[720px] overflow-y-auto p-3 sm:p-4 xl:min-h-0 xl:flex-1 xl:max-h-none">
            {filteredChats.length === 0 ? (
              <Surface
                title={sortedChats.length === 0 ? "Пока нет чатов" : "Ничего не найдено"}
                subtitle={sortedChats.length === 0 ? "После отклика на вакансию здесь появится отдельный чат." : "Попробуйте изменить запрос, чтобы найти нужный диалог."}
                className="border-dashed"
              />
            ) : (
              <div className="space-y-2">
                {filteredChats.map((chat) => {
                  const isActive = activeChatId === chat.id;
                  const showUnreadDot = chat.unreadCount > 0;
                  const isBlinking = blinkingChatId === chat.id && !isActive;

                  return (
                    <button
                      key={chat.id}
                      type="button"
                      onClick={() => setActiveChatId(chat.id)}
                      className={[
                        "w-full rounded-[22px] border px-4 py-4 text-left transition",
                        isActive ? "border-gold/40 bg-gold/10 shadow-glow" : "border-white/8 bg-soft/45 hover:border-white/20 hover:bg-soft/70",
                        isBlinking ? "message-arrival-blink" : "",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-display text-lg text-primary">{chat.peerName || chat.candidateName || "Чат"}</p>
                            {showUnreadDot ? <span className="attention-dot" aria-hidden="true" /> : null}
                          </div>
                          <p className="mt-1 truncate text-sm text-secondary">{chat.companyName || chat.vacancyTitle || "Личный диалог"}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs uppercase tracking-[0.14em] text-muted">{formatMessageTime(chat.lastMessageAt)}</p>
                          {chat.unreadCount > 0 ? (
                            <div className="mt-2">
                              <Tag>{chat.unreadCount}</Tag>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm text-secondary">{chat.lastMessageText || "Сообщений пока нет"}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title={chatTitle}
          eyebrow={activeChat ? activeChat.vacancyTitle || activeChat.companyName || "Открытый диалог" : "Выберите диалог"}
          className={["flex flex-col overflow-hidden p-0 xl:h-[calc(100vh-230px)]", highlightIncoming ? "message-arrival-blink" : ""].join(" ")}
        >
          {!activeChat ? (
            <div className="flex min-h-[720px] items-center justify-center p-8">
              <Surface title="Выберите чат" subtitle="История переписки появится здесь. Слева можно переключаться между диалогами." className="max-w-xl border-dashed text-center" />
            </div>
          ) : (
            <div className="flex h-full min-h-[720px] min-w-0 flex-col xl:min-h-0">
              <div className="border-b border-white/8 px-5 py-4 sm:px-6">
                <div className="flex flex-wrap gap-2">
                  {activeChat.companyName ? <Tag>{activeChat.companyName}</Tag> : null}
                  {activeChat.vacancyTitle ? <Tag>{activeChat.vacancyTitle}</Tag> : null}
                  {activeChat.applicationStatus ? <Tag>{activeChat.applicationStatus}</Tag> : null}
                </div>
              </div>

              {error ? (
                <div className="px-5 pt-4 sm:px-6">
                  <Surface subtitle={error} className="border-rose-500/50" />
                </div>
              ) : null}

              <div
                ref={scrollContainerRef}
                className="min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] px-5 py-5 sm:px-6"
              >
                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-secondary">Загружаем сообщения...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <Surface title="Сообщений пока нет" subtitle="Начните переписку, и вся история будет храниться здесь." className="max-w-lg border-dashed text-center" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((item) => {
                      const isOwn = item.senderId === sessionUser?.id;
                      return (
                        <div key={item.id} className={isOwn ? "flex justify-end" : "flex justify-start"}>
                          <div
                            className={[
                              "max-w-[78%] rounded-[22px] px-4 py-3 shadow-[0_14px_30px_rgba(0,0,0,0.12)]",
                              isOwn ? "rounded-br-md border border-gold/35 bg-gold/12 text-primary" : "rounded-bl-md border border-white/10 bg-soft/80 text-primary",
                            ].join(" ")}
                          >
                            <p className="whitespace-pre-wrap break-words text-sm leading-6">{item.body}</p>
                            <p className="mt-2 text-right text-[11px] uppercase tracking-[0.12em] text-muted">{formatMessageTime(item.sentAt)}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={scrollAnchorRef} />
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t border-white/8 bg-base px-5 py-4 sm:px-6">
                <div className="mb-3 text-xs text-muted">{refreshing ? "Обновляем сообщения..." : "Диалог обновляется автоматически"}</div>
                <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSendMessage}>
                  <div className="w-full flex-1">
                    <Input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Введите сообщение" disabled={sending} />
                  </div>
                  <Button type="submit" disabled={sending || !draft.trim()} className="w-full sm:w-auto sm:shrink-0">
                    {sending ? "Отправка..." : "Отправить"}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

