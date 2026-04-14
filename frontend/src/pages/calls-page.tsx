import { useState, type ReactNode } from "react";

import { useAppContext } from "../app/app-context";
import { PageTopBar } from "../shared/ui/page-top-bar";
import { SectionCard } from "../shared/ui/section-card";
import { Surface } from "../shared/ui/surface";

function HeadphonesIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={["h-5 w-5", active ? "text-gold-soft" : "text-secondary"].join(" ")} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 13a8 8 0 1 1 16 0" />
      <path d="M4 13v4a2 2 0 0 0 2 2h2v-8H6a2 2 0 0 0-2 2Z" />
      <path d="M20 13v4a2 2 0 0 1-2 2h-2v-8h2a2 2 0 0 1 2 2Z" />
    </svg>
  );
}

function MicrophoneIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={["h-5 w-5", active ? "text-gold-soft" : "text-secondary"].join(" ")} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z" />
      <path d="M19 11a7 7 0 0 1-14 0" />
      <path d="M12 18v3" />
      <path d="M8 21h8" />
      {!active ? <path d="M4 4l16 16" /> : null}
    </svg>
  );
}

function ControlToggle({
  active,
  activeLabel,
  inactiveLabel,
  onClick,
  icon,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex min-w-[164px] items-center justify-center gap-3 rounded-full border px-5 py-3 text-sm font-medium transition hover:-translate-y-0.5",
        active
          ? "border-gold/40 bg-gold/10 text-primary shadow-glow"
          : "border-white/10 bg-white/5 text-secondary hover:border-white/20 hover:bg-white/8",
      ].join(" ")}
    >
      {icon}
      <span>{active ? activeLabel : inactiveLabel}</span>
    </button>
  );
}

export function CallsPage() {
  const { data } = useAppContext();
  const activeCall = data.calls[0];
  const [headphonesEnabled, setHeadphonesEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const callChat = [
    { id: "call-note-1", sender: "candidate", author: activeCall?.participant ?? "Кандидат", text: "Добрый день. Готова коротко пройтись по опыту и текущим задачам.", time: "12:43" },
    { id: "call-note-2", sender: "employer", author: "Игорь Беляев", text: "Отлично, сначала расскажу про команду и роль, потом перейдем к стеку и процессу найма.", time: "12:44" },
    { id: "call-note-3", sender: "system", author: "Система", text: "Во время звонка зафиксирован контекст: вакансия “Старший frontend-инженер”, этап “Первичный скрининг”.", time: "12:45" },
    { id: "call-note-4", sender: "candidate", author: activeCall?.participant ?? "Кандидат", text: "Мне особенно интересны архитектурные задачи и работа с дизайн-системой.", time: "12:46" },
  ];

  if (!activeCall) {
    return (
      <div className="page-enter space-y-6">
        <SectionCard title="Звонков пока нет" eyebrow="Call center">
          <p className="text-sm text-secondary">История звонков появится здесь после подключения signaling и call logs со стороны backend.</p>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="page-enter space-y-6">
      <PageTopBar
        title="Звонки"
        subtitle="Экран voice-call сценария уже собран на реальных mock-данных приложения и готов к подключению signaling/WebRTC слоя."
      />

      <SectionCard title="Текущий звонок" eyebrow="Интервью">
        <div className="grid gap-6 2xl:grid-cols-[1.2fr_0.8fr]">
          <div className="gold-glow-soft rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top,_rgba(218,186,121,0.18),_transparent_40%),linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0.01))] p-8">
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 py-10 text-center">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-4xl text-gold-soft">
                {activeCall.participant
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </div>
              <div>
                <h3 className="font-display text-4xl font-semibold">{activeCall.participant}</h3>
                <p className="mt-3 text-secondary">Идет звонок • {activeCall.duration}</p>
              </div>
              <div className="grid w-full max-w-2xl gap-4 md:grid-cols-3">
                <Surface title="Связь" subtitle={activeCall.status} />
                <Surface title="Источник" subtitle={activeCall.context} />
                <Surface title="Режим" subtitle={activeCall.role} />
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <ControlToggle
                  active={headphonesEnabled}
                  activeLabel="Наушники включены"
                  inactiveLabel="Звук выключен"
                  onClick={() => setHeadphonesEnabled((current) => !current)}
                  icon={<HeadphonesIcon active={headphonesEnabled} />}
                />
                <ControlToggle
                  active={microphoneEnabled}
                  activeLabel="Микрофон включен"
                  inactiveLabel="Микрофон выключен"
                  onClick={() => setMicrophoneEnabled((current) => !current)}
                  icon={<MicrophoneIcon active={microphoneEnabled} />}
                />
                <button className="rounded-full border border-red-400/30 bg-red-500/10 px-5 py-3 text-sm font-medium text-red-200 transition hover:-translate-y-0.5">
                  Завершить звонок
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Surface badge="Live companion" title="Чат звонка" subtitle="Сообщения, заметки и системные события прямо во время разговора">
              <div className="flex max-h-[420px] flex-col gap-3 overflow-auto pr-1">
                {callChat.map((message) =>
                  message.sender === "employer" ? (
                    <div key={message.id} className="ml-auto max-w-[88%] rounded-[20px] border border-gold/20 bg-gold/10 p-4 text-sm text-primary">
                      <p>{message.text}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-gold-soft/75">
                        {message.author} • {message.time}
                      </p>
                    </div>
                  ) : message.sender === "system" ? (
                    <div key={message.id} className="rounded-[18px] border border-white/8 bg-white/5 px-4 py-3 text-sm text-secondary">
                      <p>{message.text}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-secondary/80">{message.author} • {message.time}</p>
                    </div>
                  ) : (
                    <div key={message.id} className="max-w-[88%] rounded-[20px] border border-white/8 bg-soft/70 p-4 text-sm text-primary">
                      <p>{message.text}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-secondary">{message.author} • {message.time}</p>
                    </div>
                  ),
                )}
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <div className="flex-1 rounded-[20px] border border-white/8 bg-soft/70 px-4 py-4 text-sm text-muted">
                  Добавить заметку по звонку или отправить сообщение после завершения...
                </div>
                <button className="rounded-full border border-gold/40 bg-gold/10 px-5 py-3 text-sm font-medium text-gold-soft transition hover:-translate-y-0.5">
                  Добавить
                </button>
              </div>
            </Surface>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
