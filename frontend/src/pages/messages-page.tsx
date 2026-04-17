import { useEffect, useMemo, useState, type FormEvent } from "react";

import { useAppContext, type Message } from "../app/app-context";
import { Button } from "../shared/ui/button";
import { Input } from "../shared/ui/input";
import { PageTopBar } from "../shared/ui/page-top-bar";
import { SectionCard } from "../shared/ui/section-card";
import { Surface } from "../shared/ui/surface";

export function MessagesPage() {
  const { data, sessionUser, loadChatMessages, sendChatMessage, markChatRead, refreshData } = useAppContext();
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedChats = useMemo(
    () => [...data.chats].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
    [data.chats],
  );

  const activeChat = useMemo(
    () => sortedChats.find((chat) => chat.id === activeChatId) ?? null,
    [activeChatId, sortedChats],
  );

  useEffect(() => {
    if (!activeChatId && sortedChats.length > 0) {
      setActiveChatId(sortedChats[0].id);
    }
  }, [activeChatId, sortedChats]);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentChat() {
      if (!activeChatId) {
        setMessages([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const nextMessages = await loadChatMessages(activeChatId);
        if (cancelled) {
          return;
        }
        setMessages(nextMessages);
        await markChatRead(activeChatId);
      } catch (nextError) {
        if (cancelled) {
          return;
        }
        setError(nextError instanceof Error ? nextError.message : "Failed to load chat.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCurrentChat();
    return () => {
      cancelled = true;
    };
  }, [activeChatId, loadChatMessages, markChatRead]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refreshData();
      if (activeChatId) {
        void loadChatMessages(activeChatId).then(setMessages).catch(() => undefined);
      }
    }, 10000);

    return () => {
      window.clearInterval(interval);
    };
  }, [activeChatId, loadChatMessages, refreshData]);

  const chatTitle = useMemo(() => {
    if (!activeChat || !sessionUser) {
      return "Диалог";
    }

    const peerId = activeChat.participantIds.find((id) => id !== sessionUser.id);
    if (!peerId) {
      return "Диалог";
    }

    return activeChat.participantNames[peerId] ?? "Собеседник";
  }, [activeChat, sessionUser]);

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeChat || !draft.trim()) {
      return;
    }

    try {
      setSending(true);
      setError(null);
      await sendChatMessage(activeChat.id, draft.trim());
      const nextMessages = await loadChatMessages(activeChat.id);
      setMessages(nextMessages);
      setDraft("");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="page-enter space-y-6">
      <PageTopBar
        title="Сообщения"
        subtitle="Чаты подключены к backend API. Обновление списка идет автоматически каждые 10 секунд."
      />

      <div className="grid gap-6 2xl:grid-cols-[360px_minmax(0,1fr)]">
        <SectionCard title="Диалоги" eyebrow="/api/v1/chats">
          <div className="space-y-3">
            {sortedChats.length === 0 ? (
              <Surface subtitle="У вас пока нет чатов. Откликнитесь на вакансию, чтобы открыть диалог." />
            ) : (
              sortedChats.map((chat) => {
                const peerId = chat.participantIds.find((id) => id !== sessionUser?.id);
                const peerName = peerId ? chat.participantNames[peerId] : "Собеседник";
                return (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => setActiveChatId(chat.id)}
                    className={[
                      "w-full rounded-[20px] border p-4 text-left transition",
                      activeChatId === chat.id
                        ? "border-gold/40 bg-gold/10"
                        : "border-white/10 bg-soft/55 hover:border-white/20",
                    ].join(" ")}
                  >
                    <p className="font-display text-lg text-primary">{peerName || "Собеседник"}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-secondary">{chat.lastMessageText || "Нет сообщений"}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-gold-soft/80">
                      Непрочитано: {chat.unreadCount}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </SectionCard>

        <SectionCard title={chatTitle} eyebrow={activeChat ? `Chat ID: ${activeChat.id}` : "Выберите диалог"}>
          <div className="space-y-4">
            {error ? <Surface subtitle={error} className="border-rose-500/50" /> : null}

            <Surface className="max-h-[440px] overflow-y-auto">
              {loading ? (
                <p className="text-sm text-secondary">Загружаем сообщения...</p>
              ) : messages.length === 0 ? (
                <p className="text-sm text-secondary">Пока нет сообщений.</p>
              ) : (
                <div className="space-y-3">
                  {messages.map((item) => {
                    const isOwn = item.senderId === sessionUser?.id;
                    return (
                      <div
                        key={item.id}
                        className={[
                          "max-w-[82%] rounded-[18px] px-4 py-3 text-sm",
                          isOwn
                            ? "ml-auto border border-gold/40 bg-gold/10 text-primary"
                            : "border border-white/10 bg-soft/60 text-primary",
                        ].join(" ")}
                      >
                        <p>{item.body}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.12em] text-muted">
                          {item.sentAt ? new Date(item.sentAt).toLocaleString() : "Just now"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </Surface>

            <form className="flex gap-3" onSubmit={handleSendMessage}>
              <Input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Введите сообщение"
                disabled={!activeChat || sending}
              />
              <Button type="submit" disabled={!activeChat || sending || !draft.trim()}>
                {sending ? "Отправка..." : "Отправить"}
              </Button>
            </form>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
