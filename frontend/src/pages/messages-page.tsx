import { useMemo, useState } from "react";

import { useAppContext } from "../app/app-context";
import { Button } from "../shared/ui/button";
import { Input } from "../shared/ui/input";
import { PageTopBar } from "../shared/ui/page-top-bar";
import { SectionCard } from "../shared/ui/section-card";
import { Surface } from "../shared/ui/surface";
import { TabGroup } from "../shared/ui/tab-group";

export function MessagesPage() {
  const { data } = useAppContext();
  const [activeChatId, setActiveChatId] = useState(data.chats[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const dialogs = useMemo(
    () =>
      data.chats.filter((chat) =>
        `${chat.title} ${chat.subtitle}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [data.chats, query],
  );
  const activeChat = dialogs.find((chat) => chat.id === activeChatId) ?? dialogs[0];

  return (
    <div className="page-enter space-y-6">
      <PageTopBar
        title="Сообщения"
        subtitle="Единый центр переписки по вакансиям, откликам и интервью: список диалогов, активный чат и контекст разговора собраны на одном экране."
        actions={<TabGroup tabs={["Все диалоги", "Новые", "Архив"]} activeTab="Все диалоги" />}
      />

      <div className="grid gap-6 2xl:grid-cols-[360px_minmax(0,1fr)]">
        <SectionCard title="Диалоги" eyebrow="Список переписок" className="gold-glow-soft h-fit">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} className="mb-4 rounded-full" placeholder="Поиск по сообщениям, компаниям и кандидатам" />
          <div className="space-y-3">
            {dialogs.map((chat, index) => (
              <button
                type="button"
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={[
                  "w-full rounded-[20px] border p-4 text-left transition",
                  chat.id === activeChat?.id || index === 0 ? "border-gold/50 bg-gold/10 shadow-glow" : "border-white/8 bg-soft/60 hover:border-white/15",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-primary">{chat.title}</p>
                    <p className="mt-1 text-sm text-secondary">{chat.subtitle}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.18em] text-secondary">{chat.lastMessageAt}</span>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Чат"
          eyebrow="Активный диалог"
          action={
            <div className="flex gap-2">
              <Button variant="secondary" className="px-4 py-2">
                Файл
              </Button>
              <Button className="px-4 py-2">Позвонить</Button>
            </div>
          }
        >
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="flex min-h-[560px] flex-col justify-between gap-6">
              <div className="space-y-4">
                {activeChat?.messages.map((message) =>
                  message.sender === "employer" ? (
                    <div key={message.id} className="ml-auto max-w-md rounded-[20px] border border-gold/20 bg-gold/10 p-4 text-sm text-primary">
                      {message.text}
                      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-gold-soft/80">{message.sentAt}</p>
                    </div>
                  ) : (
                    <Surface key={message.id} className="max-w-md" subtitle={message.text}>
                      <p className="text-xs uppercase tracking-[0.2em] text-secondary">
                        {message.author} • {message.sentAt}
                      </p>
                    </Surface>
                  ),
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1 rounded-[22px] border border-white/8 bg-soft/70 px-4 py-4 text-sm text-muted">
                  Написать сообщение...
                </div>
                <Button>Отправить</Button>
              </div>
            </div>

            <div className="space-y-4">
              <Surface title="Контекст диалога" subtitle={activeChat ? `Диалог привязан к вакансии “${activeChat.subtitle}”` : "Выбери диалог"} />
              <Surface title="Следующие шаги">
                <div className="space-y-3 text-sm text-secondary">
                  <p>• {activeChat?.nextStep ?? "Определить следующий шаг"}</p>
                  <p>• Зафиксировать статус воронки в applications API</p>
                  <p>• Подготовить realtime delivery/read status после подключения WebSocket</p>
                </div>
              </Surface>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
