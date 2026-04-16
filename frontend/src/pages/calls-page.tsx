import { useAppContext } from "../app/app-context";
import { PageTopBar } from "../shared/ui/page-top-bar";
import { SectionCard } from "../shared/ui/section-card";
import { Surface } from "../shared/ui/surface";

export function CallsPage() {
  const { data } = useAppContext();

  return (
    <div className="page-enter space-y-6">
      <PageTopBar
        title="Звонки"
        subtitle="Моковый звонок удален. Экран отражает реальный статус backend: call endpoint еще не реализован."
      />

      <SectionCard title="Call center" eyebrow="GET /api/v1/calls">
        <div className="grid gap-4 xl:grid-cols-3">
          <Surface title="Статус backend" subtitle="`/api/v1/calls` сейчас возвращает 501 Not Implemented." />
          <Surface title="Готовые сущности" subtitle={`${data.applications.length} откликов уже можно связать с будущей историей звонков.`} />
          <Surface title="Следующий шаг" subtitle="После появления signaling/call logs сюда можно подключить реальный live state без переписывания всего приложения." />
        </div>
      </SectionCard>
    </div>
  );
}
