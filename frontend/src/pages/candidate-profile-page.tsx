import { Button } from "../shared/ui/button";
import { PageTopBar } from "../shared/ui/page-top-bar";
import { SectionCard } from "../shared/ui/section-card";
import { SidebarNav } from "../shared/ui/sidebar-nav";
import { Surface } from "../shared/ui/surface";
import { TabGroup } from "../shared/ui/tab-group";
import { Tag } from "../shared/ui/tag";

const sidebarItems = ["Профиль", "Резюме", "Отклики", "Избранное", "Подписки", "Чаты", "Звонки", "Уведомления", "Настройки"];

export function CandidateProfilePage() {
  return (
    <div className="page-enter space-y-6">
      <PageTopBar
        title="Личный кабинет соискателя"
        subtitle="Профиль, резюме, отклики и коммуникации собраны в одном спокойном интерфейсе с темной навигацией и золотыми акцентами только в ключевых действиях."
        actions={<TabGroup tabs={["Профиль", "Резюме", "Отклики"]} activeTab="Профиль" />}
      />

      <div className="grid gap-6 2xl:grid-cols-[300px_minmax(0,1fr)]">
        <SidebarNav title="Навигация" eyebrow="Личный кабинет" items={sidebarItems} activeItem="Профиль" />

        <div className="space-y-6">
          <SectionCard title="Анна Смирнова" eyebrow="Профиль кандидата">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Tag>Старший frontend-разработчик</Tag>
                  <Tag>6 лет опыта</Tag>
                  <Tag>Москва</Tag>
                  <Tag>Открыта к предложениям</Tag>
                </div>
                <p className="max-w-4xl text-sm leading-7 text-secondary">
                  Специализируется на B2B-интерфейсах, сложных таблицах, фильтрах и внутренней продуктовой аналитике. Ищет зрелую продуктовую команду с вниманием к архитектуре интерфейсов и качеству дизайна.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button>Редактировать профиль</Button>
                  <Button variant="secondary">Настроить видимость резюме</Button>
                </div>
              </div>

              <Surface title="Контакты" subtitle="Публичная информация профиля">
                <div className="grid gap-3 text-sm text-secondary">
                  <div className="flex items-center justify-between rounded-[18px] border border-white/8 px-4 py-3">
                    <span>Почта</span>
                    <span className="text-gold-soft">anna@hrplatform.dev</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[18px] border border-white/8 px-4 py-3">
                    <span>Профиль</span>
                    <span>/anna-smirnova</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[18px] border border-white/8 px-4 py-3">
                    <span>Готовность</span>
                    <span>2 недели</span>
                  </div>
                </div>
              </Surface>
            </div>
          </SectionCard>

          <SectionCard title="Мои резюме" eyebrow="Карточки резюме">
            <div className="grid gap-4 xl:grid-cols-2">
              {[
                { title: "Старший frontend-разработчик", level: "Senior", visibility: "Открыто", updated: "Обновлено 2 дня назад" },
                { title: "Продуктовый дизайнер", level: "Middle+", visibility: "По ссылке", updated: "Обновлено 5 дней назад" },
              ].map((resume) => (
                <article key={resume.title} className="rounded-[22px] border border-white/8 bg-soft/60 p-5 transition hover:border-gold/20">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-primary">{resume.title}</h3>
                      <p className="mt-2 text-sm text-secondary">{resume.updated}</p>
                    </div>
                    <span className="text-gold-soft">★</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Tag>{resume.level}</Tag>
                    <Tag>{resume.visibility}</Tag>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button variant="secondary" className="px-4 py-2 text-xs">
                      Редактировать
                    </Button>
                    <Button variant="ghost" className="px-4 py-2 text-xs">
                      Дублировать
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Рекомендации" eyebrow="Следующий блок">
            <div className="grid gap-4 xl:grid-cols-3">
              {["Подходящие вакансии", "Статусы откликов", "Сохраненные компании"].map((item) => (
                <Surface key={item} title={item} subtitle="После подключения API сюда лягут персонализированные данные профиля." />
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
