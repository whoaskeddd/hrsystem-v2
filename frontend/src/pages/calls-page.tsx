import { Button } from "../shared/ui/button";
import { PageTopBar } from "../shared/ui/page-top-bar";
import { SectionCard } from "../shared/ui/section-card";
import { Surface } from "../shared/ui/surface";

export function CallsPage() {
  return (
    <div className="page-enter space-y-6">
      <PageTopBar
        title="Звонки"
        subtitle="Экран голосового звонка внутри платформы: крупный focus-блок, ключевые состояния, история событий и место под будущую WebRTC-интеграцию."
      />

      <SectionCard title="Текущий звонок" eyebrow="Интервью">
        <div className="grid gap-6 2xl:grid-cols-[1.2fr_0.8fr]">
          <div className="gold-glow-soft rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top,_rgba(218,186,121,0.18),_transparent_40%),linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0.01))] p-8">
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 py-10 text-center">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-4xl text-gold-soft">
                АС
              </div>
              <div>
                <h3 className="font-display text-4xl font-semibold">Анна Смирнова</h3>
                <p className="mt-3 text-secondary">Идет звонок • 02:14</p>
              </div>
              <div className="grid w-full max-w-2xl gap-4 md:grid-cols-3">
                <Surface title="Связь" subtitle="Соединение стабильное" />
                <Surface title="Источник" subtitle="Из чата по вакансии" />
                <Surface title="Режим" subtitle="Первичный скрининг" />
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="secondary">Выключить звук</Button>
                <Button variant="secondary">Микрофон</Button>
                <button className="rounded-full border border-red-400/30 bg-red-500/10 px-5 py-3 text-sm font-medium text-red-200 transition hover:-translate-y-0.5">
                  Завершить звонок
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Surface badge="Сводка звонка" title="Параметры звонка" subtitle="Состояния экрана под будущую WebRTC-интеграцию">
              <div className="grid gap-3 text-sm text-secondary">
                <div className="flex items-center justify-between rounded-[18px] border border-white/8 px-4 py-3">
                  <span>Статус</span>
                  <span className="text-gold-soft">Соединение стабильное</span>
                </div>
                <div className="flex items-center justify-between rounded-[18px] border border-white/8 px-4 py-3">
                  <span>Канал</span>
                  <span>Голосовой WebRTC</span>
                </div>
                <div className="flex items-center justify-between rounded-[18px] border border-white/8 px-4 py-3">
                  <span>Контекст</span>
                  <span>Сценарий вакансии</span>
                </div>
              </div>
            </Surface>

            <Surface title="История" subtitle="Последние события текущего звонка">
              <div className="space-y-3 text-sm text-secondary">
                <p>12:43 • Соединение установлено</p>
                <p>12:44 • Включен микрофон</p>
                <p>12:45 • Началась запись заметок интервью</p>
                <p>12:46 • Подготовлено follow-up сообщение в чат</p>
              </div>
            </Surface>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
