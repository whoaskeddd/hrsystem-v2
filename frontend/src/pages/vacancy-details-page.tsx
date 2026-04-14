import { Button } from "../shared/ui/button";
import { PageTopBar } from "../shared/ui/page-top-bar";
import { SectionCard } from "../shared/ui/section-card";
import { Surface } from "../shared/ui/surface";
import { Tag } from "../shared/ui/tag";

export function VacancyDetailsPage() {
  const sections = [
    {
      title: "Описание вакансии",
      points: [
        "Развитие интерфейсов поиска, откликов и рабочих процессов внутри HR-платформы.",
        "Работа с темной дизайн-системой и построение устойчивого UI-kit.",
        "Тесная связка с продуктом, аналитикой и backend-контрактами.",
      ],
    },
    {
      title: "Обязанности",
      points: [
        "Проектировать новые экраны для кандидатов, работодателей и администраторов.",
        "Поддерживать качество, доступность и адаптивность интерфейсов на desktop и mobile.",
        "Собирать сложные списки, фильтры, формы и коммуникационные сценарии.",
      ],
    },
    {
      title: "Требования",
      points: [
        "Уверенный React и TypeScript.",
        "Опыт проектирования сложных продуктовых интерфейсов.",
        "Понимание UX, дизайн-систем и продуктовых метрик.",
      ],
    },
    {
      title: "Будет плюсом",
      points: [
        "Опыт в HRTech или B2B SaaS.",
        "Навыки работы с WebSocket/WebRTC UI.",
        "Умение строить системный frontend, а не только отдельные страницы.",
      ],
    },
  ];

  return (
    <div className="page-enter space-y-6">
      <PageTopBar
        title="Старший frontend-инженер"
        subtitle="Вакансия для продуктовой команды, которая строит премиальную HR-платформу с сильным акцентом на поиск, коммуникацию и внутренние рабочие процессы."
        actions={
          <div className="flex flex-wrap gap-2">
            <Tag>280 000 ₽</Tag>
            <Tag>5+ лет</Tag>
            <Tag>Гибрид</Tag>
            <Tag>Москва</Tag>
            <Tag>Полная занятость</Tag>
          </div>
        }
      />

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <SectionCard title="О роли" eyebrow="Aurum Labs" className="gold-glow-soft overflow-hidden">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-6">
                <p className="max-w-4xl text-sm leading-7 text-secondary">
                  Команда строит HR-платформу с акцентом на качество поиска, прозрачный процесс найма и premium dark UI. На этой роли важны системное мышление, аккуратная работа с интерфейсной архитектурой и умение превращать сложные сценарии в спокойный, дорогой по ощущению продукт.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button>Откликнуться</Button>
                  <Button variant="secondary">Сохранить</Button>
                  <Button variant="ghost">Поделиться</Button>
                </div>
              </div>

              <Surface title="Ключевые параметры" subtitle="То, что важно команде" className="h-fit">
                <div className="grid gap-3 text-sm text-secondary">
                  <div className="flex items-center justify-between rounded-[18px] border border-white/8 px-4 py-3">
                    <span>Команда</span>
                    <span className="text-gold-soft">12 frontend-инженеров</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[18px] border border-white/8 px-4 py-3">
                    <span>Релизный цикл</span>
                    <span>1 неделя</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[18px] border border-white/8 px-4 py-3">
                    <span>Формат</span>
                    <span>Гибрид / Москва</span>
                  </div>
                </div>
              </Surface>
            </div>
          </SectionCard>

          {sections.map((section) => (
            <SectionCard key={section.title} title={section.title}>
              <ul className="grid gap-3 text-sm leading-7 text-secondary">
                {section.points.map((point) => (
                  <li key={point} className="rounded-[18px] border border-white/8 bg-soft/55 px-4 py-3">
                    {point}
                  </li>
                ))}
              </ul>
            </SectionCard>
          ))}
        </div>

        <div className="space-y-6">
          <SectionCard title="Компания" eyebrow="Сайд-карта" className="h-fit">
            <div className="space-y-4 text-sm text-secondary">
              <Surface title="Aurum Labs" subtitle="B2B SaaS для HR и talent operations. 250+ сотрудников, продуктовая команда в Москве." />
              <Surface title="О компании">
                <p className="text-sm leading-6 text-secondary">
                  Компания строит спокойные, data-driven интерфейсы для найма и внутренних HR-операций. Сильный упор на продуктовую дисциплину и качество реализации.
                </p>
              </Surface>
              <Surface title="Другие вакансии компании">
                <div className="space-y-2 text-sm text-secondary">
                  <p>Продуктовый дизайнер</p>
                  <p>Руководитель дизайн-системы</p>
                  <p>Партнер по подбору персонала</p>
                </div>
              </Surface>
            </div>
          </SectionCard>

          <SectionCard title="Похожие вакансии" eyebrow="Рекомендации">
            <div className="space-y-3">
              {["Инженер frontend-платформы", "Старший продуктовый дизайнер", "Технический рекрутер"].map((item) => (
                <Surface key={item} title={item} subtitle="Сильная продуктовая среда, удаленка/гибрид, премиальный B2B сегмент." />
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
