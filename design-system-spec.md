# HR Platform Design System

## Direction

Продукт: HR-платформа для кандидатов, компаний и администраторов.

Визуальная идея:
- тёмная базовая среда без глянца и кислотных акцентов;
- золотой цвет используется только как маркер действия, статуса и ключевых чисел;
- интерфейс строится на крупных отступах, спокойной типографике и карточной структуре;
- основная эмоция: премиальный, сдержанный, уверенный B2B/B2C-сервис.

## Core Tokens

### Colors

- `bg/base`: `#0D0F13`
- `bg/elevated`: `#191C21`
- `bg/soft`: `#21242A`
- `text/primary`: `#F5F3EC`
- `text/secondary`: `#B4B5BA`
- `text/muted`: `#7D808A`
- `accent/gold`: `#DABA79`
- `accent/gold-soft`: `#F5E3BB`
- `border/subtle`: `#3B3D46`
- `status/success`: `#65B795`

### Typography

- Display: `Geist Bold`, 56/62
- H1: `Geist SemiBold`, 36/42
- H2: `Geist SemiBold`, 28/34
- Body Large: `DM Sans Medium`, 18/28
- Body Medium: `DM Sans Regular`, 15/24
- Label Small: `Geist SemiBold`, 12/16, slight tracking

### Radius and Spacing

- Radii: `12 / 16 / 20 / 24`
- Base spacing scale: `12 / 16 / 20 / 24 / 32 / 48 / 64`
- Max content width on desktop: `1280-1360`

### Effects

- Card shadow: `0 16 32 rgba(0,0,0,0.28)`
- Hover glow for gold actions: soft outer highlight with low opacity

## Components

### Button

- Height: `48`
- Shape: rounded `14-16`
- Primary:
  - background: translucent gold overlay
  - border: gold
  - text: soft gold
- Secondary/Ghost:
  - background: elevated dark
  - border: subtle or gold at hover
  - text: primary

### Input / Select

- Height: `56-60`
- Background: elevated
- Border: subtle
- Focus: gold outline or gold-tinted glow
- Placeholder: secondary text

### Badge / Tag

- Pill shape
- Gold-tinted translucent fill
- Gold-soft text
- Use for salary, format, skill, status

### Card

- Background: elevated
- Border: subtle
- Radius: `20`
- Strong internal spacing
- Gold only on highlighted metrics and CTA states

### Sidebar

- Width desktop: `248-272`
- Elevated surface
- Active item:
  - gold border or left accent
  - tinted gold background
  - gold-soft label

## Screen Blueprints

### 1. Landing `/`

Composition:
- Header with logo, main nav, auth CTA
- Hero block with large headline and dual search action
- Quick filters row
- Featured vacancies grid
- "How it works" 3-step strip

Header:
- logo left: `HR Platform`
- nav center: вакансии, кандидаты, компаниям, соискателям
- CTA right: `Вход / Регистрация`

Hero:
- headline on 2 lines
- supporting copy with calm tone
- wide search input
- two actions side by side:
  - `Найти вакансии`
  - `Найти кандидатов`
- optional abstract background glow behind hero, very subtle

Featured vacancies:
- 4 cards in desktop row or 2x2 grid
- each card shows:
  - title
  - company
  - salary badge
  - experience badge
  - location
  - saved icon in corner

How it works:
- 3 dark cards
- each with icon, short title, 1-line description

### 2. Vacancy Search `/vacancies`

Layout:
- 2-column desktop shell
- left fixed filter rail
- right results stream

Top bar:
- title `Вакансии`
- search field
- result count

Filter rail:
- salary range
- experience
- work format
- employment type
- education
- region
- save search button

Result cards:
- horizontal or stacked cards with:
  - vacancy title
  - company identity
  - salary and experience chips
  - short description
  - `Откликнуться`
  - favorite icon

### 3. Vacancy Details `/vacancies/:id`

Layout:
- main content column + side company card

Top block:
- job title
- CTA row:
  - `Откликнуться`
  - `Сохранить`
- compact metadata line with salary, experience, format, location

Content sections:
- Description
- Responsibilities
- Requirements
- Nice to have

Company card:
- logo
- company name
- 2-3 sentence description
- list of other vacancies

Bottom:
- similar vacancies row

### 4. Candidate Profile `/candidate/profile`

Layout:
- persistent sidebar left
- content right with stacked blocks

Sidebar items:
- Профиль
- Резюме
- Отклики
- Избранное
- Подписки
- Чаты
- Звонки
- Уведомления
- Настройки

Main blocks:
- profile summary card
- resumes list
- recommendation placeholder section

Profile summary:
- name
- desired role
- experience
- city
- contact / LinkedIn
- actions:
  - `Редактировать профиль`
  - `Видимость резюме`

Resume cards:
- title
- level
- visibility status
- actions:
  - edit
  - duplicate
  - delete

### 5. Resume Search `/resumes`

Layout similar to vacancies, but optimized for scanning candidates.

Top:
- title `Поиск кандидатов`
- search field
- result count

Left filters:
- experience
- salary
- location
- remote
- education
- skill tags

Candidate cards:
- full name
- desired role
- experience
- salary expectation
- skill tags
- actions:
  - `Просмотреть`
  - `Пригласить`
  - `Отклонить`

### 6. Messages and Calls `/messages`, `/calls`

Layout:
- left dialog list
- right active conversation

Dialog list:
- avatar
- name
- latest message
- time
- read state
- active row highlighted with gold-accent border

Chat area:
- header with participant identity
- call button in gold-accent state
- messages:
  - own messages right-aligned
  - incoming left-aligned
  - both use dark bubbles with subtle tonal difference
- composer:
  - message field
  - attachment
  - send

Call modal / page:
- large avatar
- name
- call state
- timer
- answer / decline / end controls

### 7. Admin `/admin`

Layout:
- admin sidebar left
- content panel right

Sidebar:
- Пользователи
- Компании
- Вакансии
- Резюме
- Жалобы
- Категории
- Логи
- Настройки

Content:
- top search and status filters
- table or dense cards depending on section

Tables/cards should emphasize:
- moderation state
- important labels
- quick action buttons

## Responsive Rules

### Desktop

- Sidebar stays on the left
- Two-column pages keep filters or meta panels visible
- Cards use multi-column grids where appropriate

### Tablet

- Filters collapse into top drawer
- Card grids drop from 4 to 2 columns
- Side panels move below content when necessary

### Mobile

- Single-column content
- Cards use full width
- Header nav collapses to drawer
- Account navigation becomes bottom bar or top segmented drawer
- Sticky bottom CTA is acceptable on vacancy detail and chat screens

## Motion

- Fade-up entrance for hero and cards
- Hover transitions `180-220ms`
- Gold glow on interactive states should stay soft, not neon
- Avoid excessive scale or bounce

## What Was Already Created In Figma

In the Figma file below, foundation work has already been started:
- file: `HR Platform Dark Gold Design System`
- link: `https://www.figma.com/design/0WsqbpeSPTZztaranjcUFc`

Created there:
- base pages `Foundation` and `Screens`
- dark/gold color token set
- foundation board
- first component set direction:
  - buttons
  - search input
  - vacancy card
  - sidebar items

Limitation:
- дальнейшая сборка экранов остановилась из-за лимита вызовов Figma MCP на Starter-плане.
