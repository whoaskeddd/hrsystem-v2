import { Button } from "../shared/ui/button";
import { PageTopBar } from "../shared/ui/page-top-bar";
import { SectionCard } from "../shared/ui/section-card";
import { Surface } from "../shared/ui/surface";
import { TabGroup } from "../shared/ui/tab-group";

const dialogs = [
  ["Анна Смирнова", "Старший frontend-разработчик • 2 мин назад"],
  ["Northwind HR", "Письмо по вакансии продуктового дизайнера"],
  ["Atlas Systems", "Приглашение на интервью"],
  ["Verve Group", "Статус отклика обновлен"],
];

export function MessagesPage() {
  return (
    <div className="page-enter space-y-6">
      <PageTopBar
        title="Сообщения"
        subtitle="Единый центр переписки по вакансиям, откликам и интервью: список диалогов, активный чат и контекст разговора собраны на одном экране."
        actions={<TabGroup tabs={["Все диалоги", "Новые", "Архив"]} activeTab="Все диалоги" />}
      />

      <div className="grid gap-6 2xl:grid-cols-[360px_minmax(0,1fr)]">
        <SectionCard title="Диалоги" eyebrow="Список переписок" className="gold-glow-soft h-fit">
          <div className="mb-4 rounded-full border border-white/8 bg-soft/70 px-4 py-3 text-sm text-muted">
            Поиск по сообщениям, компаниям и кандидатам
          </div>
          <div className="space-y-3">
            {dialogs.map(([title, subtitle], index) => (
              <div
                key={title}
                className={[
                  "rounded-[20px] border p-4 transition",
                  index === 0 ? "border-gold/50 bg-gold/10 shadow-glow" : "border-white/8 bg-soft/60 hover:border-white/15",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-primary">{title}</p>
                    <p className="mt-1 text-sm text-secondary">{subtitle}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.18em] text-secondary">12:45</span>
                </div>
              </div>
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
                <Surface className="max-w-md" subtitle="Анна, добрый день! Посмотрела описание вакансии и готова обсудить детали.">
                  <p className="text-xs uppercase tracking-[0.2em] text-secondary">12:40</p>
                </Surface>
                <div className="ml-auto max-w-md rounded-[20px] border border-gold/20 bg-gold/10 p-4 text-sm text-primary">
                  Отлично, давайте созвонимся завтра после 15:00. Могу отправить детали по стеку и команде до встречи.
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-gold-soft/80">12:43</p>
                </div>
                <Surface className="max-w-md" subtitle="Подойдет. Буду ждать приглашение в календарь и краткое описание роли.">
                  <p className="text-xs uppercase tracking-[0.2em] text-secondary">12:45</p>
                </Surface>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1 rounded-[22px] border border-white/8 bg-soft/70 px-4 py-4 text-sm text-muted">
                  Написать сообщение...
                </div>
                <Button>Отправить</Button>
              </div>
            </div>

            <div className="space-y-4">
              <Surface title="Контекст диалога" subtitle="Диалог привязан к вакансии “Старший frontend-разработчик”" />
              <Surface title="Следующие шаги">
                <div className="space-y-3 text-sm text-secondary">
                  <p>• Отправить краткое описание роли</p>
                  <p>• Назначить первичный звонок</p>
                  <p>• Зафиксировать статус воронки</p>
                </div>
              </Surface>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
