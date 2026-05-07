import { useAppContext } from "../app/app-context";
import { Button } from "../shared/ui/button";
import { PageTopBar } from "../shared/ui/page-top-bar";
import { SectionCard } from "../shared/ui/section-card";
import { SidebarNav } from "../shared/ui/sidebar-nav";
import { Surface } from "../shared/ui/surface";
import { TabGroup } from "../shared/ui/tab-group";

const adminSections = ["Пользователи", "Компании", "Вакансии", "Резюме", "Жалобы", "Логи"];

export function AdminPage() {
  const { data } = useAppContext();

  return (
    <div className="page-enter space-y-6">
      <PageTopBar
        title="Административная панель"
        subtitle="Панель модерации теперь опирается на backend admin endpoints и реальные отчеты."
        actions={<TabGroup tabs={["Модерация", "Логи", "Настройки"]} activeTab="Модерация" />}
      />

      <div className="grid gap-6 2xl:grid-cols-[300px_minmax(0,1fr)]">
        <SidebarNav title="Разделы" eyebrow="Админка" items={adminSections} activeItem="Жалобы" />

        <div className="space-y-6">
          <SectionCard title="Отчеты и жалобы" eyebrow="GET /admin/reports">
            <div className="mb-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_180px]">
              <div className="rounded-full border border-white/8 bg-soft/70 px-4 py-3 text-sm text-muted">
                В этом разделе отображаются реальные backend reports.
              </div>
              <div className="rounded-full border border-white/8 bg-soft/70 px-4 py-3 text-sm text-secondary">
                Жалоб: {data.adminCases.length}
              </div>
              <Button variant="secondary">Экспорт</Button>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {data.adminCases.map((item) => (
                <Surface key={item.id} title={item.title} subtitle={`${item.subtitle} • ${item.priority}`}>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="secondary" className="px-4 py-2 text-xs">
                      Просмотр
                    </Button>
                    <Button variant="ghost" className="px-4 py-2 text-xs">
                      {item.actionLabel}
                    </Button>
                  </div>
                </Surface>
              ))}
              {data.adminCases.length === 0 ? <Surface title="Отчеты отсутствуют" subtitle="Backend не вернул активных кейсов." /> : null}
            </div>
          </SectionCard>

          <SectionCard title="Сводка" eyebrow="Админ overview">
            <div className="grid gap-4 xl:grid-cols-3">
              <Surface title="Жалоб в очереди" subtitle={`${data.adminCases.length} активных кейсов`} />
              <Surface title="Работодателей" subtitle={`${data.users.filter((user) => user.role === "employer").length} аккаунтов`} />
              <Surface title="Пользователей" subtitle={`${data.users.length} записей из /admin/users`} />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
