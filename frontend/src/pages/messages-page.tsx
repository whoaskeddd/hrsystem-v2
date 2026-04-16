import { useAppContext } from "../app/app-context";
import { PageTopBar } from "../shared/ui/page-top-bar";
import { SectionCard } from "../shared/ui/section-card";
import { Surface } from "../shared/ui/surface";
import { TabGroup } from "../shared/ui/tab-group";

export function MessagesPage() {
  const { data } = useAppContext();

  return (
    <div className="page-enter space-y-6">
      <PageTopBar
        title="Сообщения"
        subtitle="Фейковые диалоги убраны. Этот экран теперь честно показывает текущее состояние backend: messaging endpoint еще не реализован."
        actions={<TabGroup tabs={["Статус", "Контекст"]} activeTab="Статус" />}
      />

      <div className="grid gap-6 2xl:grid-cols-[360px_minmax(0,1fr)]">
        <SectionCard title="Backend status" eyebrow="GET /api/v1/chats">
          <div className="space-y-3 text-sm text-secondary">
            <p>Backend сейчас отвечает `501 not implemented` для чатов.</p>
            <p>Поэтому вместо моковых переписок экран показывает реальное состояние интеграции.</p>
          </div>
        </SectionCard>

        <SectionCard title="Что уже готово" eyebrow="Контекст для будущего messaging">
          <div className="grid gap-4 xl:grid-cols-2">
            <Surface title="Отклики" subtitle={`${data.applications.length} записей уже доступны через /applications`} />
            <Surface title="Уведомления" subtitle={`${data.notifications.length} событий уже доступны через /notifications`} />
            <Surface title="Каталог вакансий" subtitle={`${data.vacancies.length} вакансий уже можно использовать как основу для чатов`} />
            <Surface title="Следующий шаг" subtitle="После появления messaging API сюда можно безопасно подцепить реальные диалоги без возврата к заглушкам." />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
