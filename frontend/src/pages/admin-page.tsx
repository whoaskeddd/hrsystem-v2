import { Button } from "../shared/ui/button";
import { PageTopBar } from "../shared/ui/page-top-bar";
import { SectionCard } from "../shared/ui/section-card";
import { SidebarNav } from "../shared/ui/sidebar-nav";
import { Surface } from "../shared/ui/surface";
import { TabGroup } from "../shared/ui/tab-group";

const adminSections = ["Пользователи", "Компании", "Вакансии", "Резюме", "Жалобы", "Категории", "Логи", "Настройки"];

export function AdminPage() {
  return (
    <div className="page-enter space-y-6">
      <PageTopBar
        title="Административная панель"
        subtitle="Интерфейс для модерации, контроля контента и просмотра ключевых системных сущностей. Все собрано в плотную, но чистую dark-сетку."
        actions={<TabGroup tabs={["Модерация", "Логи", "Настройки"]} activeTab="Модерация" />}
      />

      <div className="grid gap-6 2xl:grid-cols-[300px_minmax(0,1fr)]">
        <SidebarNav title="Разделы" eyebrow="Админка" items={adminSections} activeItem="Пользователи" />

        <div className="space-y-6">
          <SectionCard title="Управление пользователями" eyebrow="Модерация">
            <div className="mb-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_180px]">
              <div className="rounded-full border border-white/8 bg-soft/70 px-4 py-3 text-sm text-muted">
                Поиск по пользователям и компаниям...
              </div>
              <div className="rounded-full border border-white/8 bg-soft/70 px-4 py-3 text-sm text-secondary">Статус: все</div>
              <Button variant="secondary">Экспорт</Button>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {[
                ["Пользователь #1024", "Активен • кандидат • Москва"],
                ["Компания Northwind HR", "На модерации • работодатель"],
                ["Жалоба #88", "Ожидает разбора • вакансия"],
                ["Лог события #5412", "Обновление ролей • админ"],
              ].map(([title, subtitle]) => (
                <Surface key={title} title={title} subtitle={subtitle}>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="secondary" className="px-4 py-2 text-xs">
                      Просмотр
                    </Button>
                    <Button variant="ghost" className="px-4 py-2 text-xs">
                      Действие
                    </Button>
                  </div>
                </Surface>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Сводка модерации" eyebrow="Административная сводка">
            <div className="grid gap-4 xl:grid-cols-3">
              <Surface title="Жалоб в очереди" subtitle="18 активных кейсов" />
              <Surface title="Новых компаний" subtitle="6 ожидают проверки" />
              <Surface title="Системные события" subtitle="24 предупреждения / 0 критических" />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
