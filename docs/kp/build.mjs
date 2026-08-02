/**
 * Генератор КП для салона ПЕРФЕКТ ТОН.
 * Запуск: node docs/kp/build.mjs
 * Результат: docs/kp-perfect-ton.html
 *
 * Правки цен и состава пакетов — в PACKAGES и BLOCKS ниже, верстку не трогать.
 */
import { writeFileSync, readFileSync } from 'node:fs';

const PACKAGES = [
  { id: 's', name: 'Старт',    price: '30 000 ₽', month: '12 000 ₽/мес',
    monthNote: 'ведение рекламы после запуска', prepay: '15 000 ₽', term: '7 рабочих дней',
    pitch: 'Базовый минимум, который нужен в любом случае: услуги, мастера, цены, запись.' },
  { id: 'o', name: 'Оптимум',  price: '38 000 ₽', month: '12 000 ₽/мес',
    monthNote: 'ведение рекламы после запуска', prepay: '19 000 ₽', term: '10 рабочих дней',
    pitch: 'Полностью покрывает структуру, которую вы согласовывали раньше — все двенадцать блоков вашего списка на месте.',
    pick: true },
  { id: 'k', name: 'Комплекс', price: '48 000 ₽', month: '12 000 ₽/мес',
    monthNote: 'ведение рекламы после запуска', prepay: '24 000 ₽', term: '15 рабочих дней',
    pitch: 'То же плюс отдельные страницы под каждое направление — под рекламу.' },
];

// Прайс на доработки после сдачи
const EDITS = [
  ['Правки текста, цен, контактов — до 10 штук за раз', '1 500 ₽'],
  ['Обновить прайс целиком', '2 500 ₽'],
  ['Добавить или заменить фотографии в галерее, до 20 штук', '2 000 ₽'],
  ['Новая акция: баннер и текст', '2 500 ₽'],
  ['Добавить мастера в блок «Мастера»', '1 000 ₽'],
  ['Новый блок на существующей странице', 'от 6 000 ₽'],
  ['Новая страница под услугу', 'от 12 000 ₽'],
  ['Плановое обновление раз в полгода: акции, прайс, фото, работы', '8 000 ₽'],
];

// layout: как выглядит мини-макет блока
const BLOCKS = [
  { t: 'Главный продающий экран', d: 'Фото салона, заголовок с оффером, кнопка записи', l: 'hero', p: 'sok' },
  { t: 'Направления услуг', d: 'Ногти, брови, ресницы, солярий — карточками с фото', l: 'cards4', p: 'sok' },
  { t: 'О салоне', d: 'Кто вы, сколько лет, чем отличаетесь от соседей', l: 'textphoto', p: 'sok' },
  { t: 'Наши мастера', d: 'Фото, имя, специализация, опыт', l: 'team', p: 'sok' },
  { t: 'Прайс', d: 'Цены по направлениям, из вашего списка', l: 'pricelist', p: 'sok' },
  { t: 'Контакты', d: 'Карта, ориентиры, парковка, пандус, режим работы', l: 'map', p: 'sok' },
  { t: 'Виджет записи yclients', d: 'Запись прямо на сайте: мастер, дата, время — не уходя со страницы', l: 'widget', p: 'sok' },
  { t: 'Подвал и политика данных', d: 'Контакты, реквизиты, отдельная страница с политикой обработки данных', l: 'footer', p: 'sok' },
  { t: 'Атмосфера салона', d: 'Фото и видео интерьера — тот самый вайб, о котором вы писали', l: 'video', p: 'ok' },
  { t: 'Галерея работ', d: 'Сетка фотографий по направлениям', l: 'gallery', p: 'ok' },
  { t: 'Отзывы', d: 'Отзывы с Яндекс Карт со ссылкой на источник', l: 'reviews', p: 'ok' },
  { t: 'Акции', d: 'Текущие предложения, обновляются по ходу', l: 'promo', p: 'ok' },
  { t: 'Подарочные сертификаты', d: 'Номиналы и как купить — к вам ходят семьями', l: 'cert', p: 'ok' },
  { t: 'Обратная связь', d: 'Форма для тех, кто не хочет звонить и писать в мессенджер', l: 'form', p: 'ok' },
  { t: 'Стерильность и материалы', d: 'Ответ на три вопроса, которые задают перед записью. Этого нет у конкурентов', l: 'trust', p: 'ok' },
  { t: 'Страница «Ногтевой сервис»', d: 'Отдельная посадочная под рекламу этого направления', l: 'landing', p: 'k' },
  { t: 'Страница «Брови и ресницы»', d: 'Отдельная посадочная под рекламу этого направления', l: 'landing', p: 'k' },
  { t: 'Страница «Солярий»', d: 'Отдельная посадочная под рекламу этого направления', l: 'landing', p: 'k' },
  { t: 'Два первых экрана на проверку', d: 'Две версии заголовка, смотрим по цифрам, какая записывает лучше', l: 'ab', p: 'k' },
];

const ph = (h) => `<div class="ph" style="height:${h}px"></div>`;
const tx = (n, w = []) => Array.from({ length: n }, (_, i) =>
  `<div class="tx" style="width:${w[i] || 100}%"></div>`).join('');
const btn = () => `<div class="wbtn"></div>`;

const LAYOUTS = {
  hero: `<div class="row"><div class="col"><div class="tx big" style="width:85%"></div>${tx(2, [95, 70])}${btn()}</div><div class="col">${ph(78)}</div></div>`,
  cards4: `<div class="grid4">${[1, 2, 3, 4].map(() => `<div class="card">${ph(34)}<div class="tx" style="width:80%"></div></div>`).join('')}</div>`,
  textphoto: `<div class="row"><div class="col">${ph(72)}</div><div class="col"><div class="tx big" style="width:70%"></div>${tx(4, [100, 96, 100, 60])}</div></div>`,
  video: `<div class="video">${ph(92)}<div class="play"></div></div>`,
  team: `<div class="grid4">${[1, 2, 3, 4].map(() => `<div class="card center"><div class="ava"></div><div class="tx" style="width:70%"></div><div class="tx" style="width:50%"></div></div>`).join('')}</div>`,
  gallery: `<div class="grid6">${Array.from({ length: 6 }, () => ph(42)).join('')}</div>`,
  trust: `<div class="grid3">${[1, 2, 3].map(() => `<div class="card"><div class="ico"></div><div class="tx" style="width:85%"></div><div class="tx" style="width:65%"></div></div>`).join('')}</div>`,
  pricelist: `<div class="plist">${Array.from({ length: 5 }, () => `<div class="prow"><div class="tx" style="width:55%"></div><div class="tx pr" style="width:16%"></div></div>`).join('')}</div>`,
  promo: `<div class="grid2">${[1, 2].map(() => `<div class="card">${ph(38)}<div class="tx" style="width:75%"></div><div class="tx" style="width:45%"></div></div>`).join('')}</div>`,
  cert: `<div class="row"><div class="col"><div class="tx big" style="width:60%"></div>${tx(3, [100, 85, 55])}${btn()}</div><div class="col">${ph(70)}</div></div>`,
  reviews: `<div class="grid3">${[1, 2, 3].map(() => `<div class="card"><div class="stars"></div>${tx(3, [100, 92, 70])}</div>`).join('')}</div>`,
  map: `<div class="maprow"><div class="mapbox">Карта</div><div class="col">${tx(4, [90, 100, 75, 60])}</div></div>`,
  widget: `<div class="widget"><div class="wtitle">Виджет онлайн-записи yclients</div><div class="grid3">${[1, 2, 3].map(() => `<div class="card center"><div class="ava sm"></div><div class="tx" style="width:70%"></div></div>`).join('')}</div><div class="slots">${Array.from({ length: 6 }, () => `<div class="slot"></div>`).join('')}</div></div>`,
  form: `<div class="row"><div class="col"><div class="tx big" style="width:65%"></div>${tx(2, [95, 60])}</div><div class="col"><div class="fld"></div><div class="fld"></div><div class="fld"></div>${btn()}</div></div>`,
  footer: `<div class="foot"><div class="col">${tx(3, [70, 55, 45])}</div><div class="col">${tx(3, [60, 75, 40])}</div></div>`,
  landing: `<div class="row"><div class="col"><div class="tx big" style="width:80%"></div>${tx(2, [95, 65])}${btn()}</div><div class="col">${ph(56)}</div></div><div class="grid3" style="margin-top:6px">${[1, 2, 3].map(() => `<div class="card">${ph(24)}</div>`).join('')}</div>`,
  ab: `<div class="row"><div class="ab"><div class="ablab">Вариант А</div><div class="tx big" style="width:80%"></div>${tx(2, [95, 60])}${btn()}</div><div class="ab"><div class="ablab">Вариант Б</div><div class="tx big" style="width:70%"></div>${tx(2, [90, 70])}${btn()}</div></div>`,
};

function screens(pkgId) {
  return BLOCKS.filter(b => b.p.includes(pkgId)).map((b, i) => `
      <div class="screen">
        <div class="shead"><span class="snum">Экран ${i + 1}</span><b>${b.t}</b></div>
        <div class="sbody">${LAYOUTS[b.l]}</div>
        <div class="sdesc">${b.d}</div>
      </div>`).join('');
}

function pkgSection(p) {
  const n = BLOCKS.filter(b => b.p.includes(p.id)).length;
  return `
<section class="pkg${p.pick ? ' pick' : ''}">
  <div class="pkg-head">
    <div>
      ${p.pick ? '<div class="badge">Рекомендуем</div>' : ''}
      <h2>${p.name}</h2>
      <p class="small muted" style="max-width:420px">${p.pitch}</p>
    </div>
    <div class="pkg-price">
      <div class="pp">${p.price}</div>
      <div class="pm">+ ${p.month}</div>
      <div class="pn">${p.monthNote}</div>
      <div class="pn">${n} экранов · ${p.term}</div>
    </div>
  </div>
  <div class="screens">${screens(p.id)}</div>
</section>`;
}


const FONTS = readFileSync(new URL('./fonts.css', import.meta.url), 'utf-8');

const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Коммерческое предложение — сайт для салона ПЕРФЕКТ ТОН</title>
<style>
${FONTS}
:root{
  --black:#16130f; --cream:#f6f2e9; --paper:#fbf8f2;
  --ink:#1e1b17; --muted:#6b6459; --line:#ddd6c8; --hair:#e7e1d5;
  --copper:#b0733a; --copper-lt:#c99155;
  --wire:#ded8cc; --wire2:#c8c0b0; --wirebg:#efeade;
  --serif:"Playfair Display",Georgia,"Times New Roman",serif;
  --sans:"Inter",-apple-system,"Segoe UI",Roboto,Arial,sans-serif;
}
*{box-sizing:border-box}
body{margin:0;background:#d9d3c8;color:var(--ink);font-family:var(--sans);
font-size:14.5px;line-height:1.65;-webkit-font-smoothing:antialiased}
h1,h2,h3{font-family:var(--serif);font-weight:400;line-height:1.15}
p{margin:0 0 12px}
b,strong{font-weight:600}

/* ===== Обложка ===== */
.cover{background:var(--black);color:var(--cream);padding:64px 60px 56px;
position:relative;max-width:880px;margin:0 auto;display:flex;flex-direction:column;min-height:520px}
.cover::before{content:"";position:absolute;left:50%;top:0;bottom:0;width:1px;
background:linear-gradient(180deg,transparent,rgba(176,115,58,.55) 12%,rgba(176,115,58,.55) 88%,transparent)}
.cov-top{font-size:11px;letter-spacing:.32em;text-transform:uppercase;
color:var(--copper-lt);text-align:center;margin-bottom:auto}
.cov-mid{text-align:center;padding:52px 0}
.cov-name{font-family:var(--serif);font-size:64px;line-height:1.02;letter-spacing:.04em;color:#efe8db}
.rule{width:74px;height:1px;background:var(--copper);margin:26px auto;position:relative}
.rule::after{content:"";position:absolute;left:50%;top:-3px;width:1px;height:7px;background:var(--copper);transform:translateX(-50%)}
.cov-sub{font-size:15px;letter-spacing:.16em;color:var(--copper-lt)}
.cov-by{text-align:center;font-family:var(--serif);font-size:16px;letter-spacing:.08em;color:#cfc6b6;margin-top:auto}
.cov-meta{text-align:center;font-size:11.5px;letter-spacing:.1em;color:#8e8676;margin-top:12px}

/* ===== Полосы ===== */
.page{max-width:880px;margin:0 auto;background:var(--cream);padding:44px 60px 56px}
section{padding:32px 0;border-top:1px solid var(--hair)}
section:first-child{border-top:0;padding-top:8px}
h1{font-size:34px;margin:0 0 10px}
h2{font-size:26px;margin:0 0 8px}
h3{font-family:var(--sans);font-size:14.5px;font-weight:700;margin:0 0 3px}
.eyebrow{font-size:10.5px;letter-spacing:.26em;text-transform:uppercase;color:var(--copper);margin-bottom:12px}
.muted{color:var(--muted)}
.small{font-size:12.8px}
.lead{font-size:16px;color:var(--muted);max-width:640px}

/* Цифры */
.facts{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin:22px 0 6px}
.fact{padding:0 20px;border-left:1px solid var(--hair)}
.fact:first-child{padding-left:0;border-left:0}
.fact b{display:block;font-family:var(--serif);font-size:40px;font-weight:400;
color:var(--ink);line-height:1;margin-bottom:7px}
.fact span{font-size:11.5px;color:var(--muted);line-height:1.35;display:block}

ul.clean{margin:0 0 12px;padding-left:0;list-style:none}
ul.clean li{margin-bottom:9px;padding-left:20px;position:relative}
ul.clean li::before{content:"";position:absolute;left:0;top:10px;width:9px;height:1px;background:var(--copper)}

.callout{background:var(--paper);border-left:2px solid var(--copper);padding:18px 22px;margin:16px 0}
.callout p:last-child{margin-bottom:0}

/* ===== Пакеты ===== */
.pkg-head{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;
margin-bottom:20px;padding-bottom:18px;border-bottom:1px solid var(--hair)}
.pkg.pick .pkg-head{background:var(--black);border-bottom:0;padding:22px 24px;color:var(--cream)}
.pkg.pick .pkg-head h2{color:#efe8db}
.pkg.pick .pkg-head .small{color:#b3ab9b}
.pkg.pick .pp{color:#efe8db}
.pkg.pick .pn{color:#9b9384}
.badge{display:inline-block;border:1px solid var(--copper);color:var(--copper-lt);
font-size:9.5px;letter-spacing:.22em;text-transform:uppercase;padding:4px 10px;margin-bottom:10px}
.pkg-price{text-align:right;flex-shrink:0}
.pp{font-family:var(--serif);font-size:34px;line-height:1}
.pm{font-size:13px;color:var(--copper);margin-top:6px;font-weight:600}
.pn{font-size:11px;color:var(--muted);line-height:1.45}

.screens{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.screen{border:1px solid var(--hair);background:var(--paper);padding:12px}
.shead{display:flex;gap:9px;align-items:baseline;font-size:12.5px;margin-bottom:9px}
.snum{color:var(--copper);font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;flex-shrink:0}
.shead b{font-weight:600}
.sbody{background:#fff;border:1px solid var(--hair);padding:10px;min-height:104px}
.sdesc{font-size:11.3px;color:var(--muted);margin-top:8px;line-height:1.45}

/* Каркасы */
.row{display:flex;gap:8px}.col{flex:1;min-width:0}
.tx{height:6px;background:var(--wire);margin-bottom:5px}
.tx.big{height:10px;background:var(--wire2)}
.tx.pr{background:var(--wire2)}
.ph{background:repeating-linear-gradient(135deg,var(--wirebg),var(--wirebg) 5px,#f6f3ec 5px,#f6f3ec 10px)}
.wbtn{height:14px;width:70px;background:var(--black);margin-top:8px}
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.grid2{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}
.grid6{display:grid;grid-template-columns:repeat(3,1fr);gap:5px}
.card{background:#fff;border:1px solid var(--hair);padding:5px}
.card.center{text-align:center;display:flex;flex-direction:column;align-items:center}
.ava{width:24px;height:24px;border-radius:50%;background:var(--wire);margin-bottom:5px}
.ava.sm{width:19px;height:19px}
.ico{width:15px;height:15px;background:var(--wire2);margin-bottom:5px}
.stars{width:44px;height:6px;background:var(--copper-lt);margin-bottom:6px}
.video{position:relative}
.play{position:absolute;left:50%;top:50%;width:0;height:0;transform:translate(-40%,-50%);
border-left:15px solid var(--wire2);border-top:9px solid transparent;border-bottom:9px solid transparent}
.plist .prow{display:flex;justify-content:space-between;gap:10px;padding:4px 0;border-bottom:1px solid #f0ece2}
.maprow{display:flex;gap:8px}
.mapbox{flex:1.2;background:var(--wirebg);display:flex;align-items:center;justify-content:center;
font-size:10.5px;color:#a49b8a;min-height:74px;letter-spacing:.08em}
.widget{border:1px dashed var(--wire2);padding:8px}
.wtitle{font-size:10px;color:var(--copper);margin-bottom:7px;text-align:center;letter-spacing:.06em}
.slots{display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin-top:7px}
.slot{height:12px;background:var(--wire)}
.foot{display:flex;gap:14px;padding-top:6px;border-top:1px solid #f0ece2}
.ab{flex:1;border:1px dashed var(--wire2);padding:7px}
.fld{height:13px;background:#fff;border:1px solid var(--wire);margin-bottom:6px}
.ablab{font-size:9.5px;color:var(--copper);margin-bottom:5px;letter-spacing:.1em}

table{border-collapse:collapse;width:100%;margin:10px 0 14px}
th,td{border-bottom:1px solid var(--hair);padding:11px 12px;font-size:13.5px;text-align:left}
th{background:transparent;font-weight:600;font-size:11px;letter-spacing:.14em;
text-transform:uppercase;color:var(--copper);border-bottom:1px solid var(--copper)}
td.c{text-align:center}
tr:last-child td{border-bottom:0}

.steps{counter-reset:s;margin:0;padding:0;list-style:none}
.steps li{counter-increment:s;display:grid;grid-template-columns:34px 1fr;gap:14px;margin-bottom:16px}
.steps li::before{content:"0" counter(s);font-family:var(--serif);font-size:19px;color:var(--copper)}

footer{background:var(--black);color:#9b9384;max-width:880px;margin:0 auto;
padding:30px 60px 38px;font-size:11.5px;line-height:1.7}
footer b{color:#cfc6b6;font-weight:400;font-family:var(--serif);font-size:14px}

@media(max-width:760px){
.cover{padding:44px 24px 38px;min-height:auto}
.cov-name{font-size:40px}
.page{padding:26px 20px 34px}
footer{padding:24px 20px 30px}
h1{font-size:26px}h2{font-size:22px}
.facts{grid-template-columns:repeat(2,1fr);gap:18px 0}
.fact{padding:0 14px}
.fact:nth-child(3){padding-left:0;border-left:0}
.fact b{font-size:32px}
.screens{grid-template-columns:1fr}
.pkg-head{flex-direction:column}.pkg-price{text-align:left}
}
@media print{
@page{size:A4;margin:0}
body{background:#fff;font-size:10.5pt}
.cover{max-width:none;min-height:297mm;page-break-after:always;padding:30mm 24mm}
.page{max-width:none;padding:14mm 18mm}
footer{max-width:none;padding:12mm 18mm}
.screen,.callout,table,.pkg-head,.fact{page-break-inside:avoid}
h2{page-break-after:avoid}
}
</style>
</head>
<body>

<div class="cover">
  <div class="cov-top">Коммерческое предложение</div>
  <div class="cov-mid">
    <div class="cov-name">ПЕРФЕКТ<br />ТОН</div>
    <div class="rule"></div>
    <div class="cov-sub">Сайт с онлайн-записью</div>
  </div>
  <div class="cov-by">Аполлонов и Шигапова</div>
  <div class="cov-meta">Раменское · 2 августа 2026</div>
</div>

<div class="page">

<section>
  <h1>Сайт с онлайн-записью и реклама — одним пакетом</h1>
  <p class="lead">Предложение составлено по вашей анкете. Ниже — что мы поняли о салоне,
  из каких экранов состоит сайт в каждом варианте, что делает Александр и почему это
  выгоднее покупать вместе.</p>
</section>

<section>
  <div class="eyebrow">Что мы поняли из анкеты</div>
  <h2>Салон, который держится на возвратах</h2>
  <div class="facts">
    <div class="fact"><b>15</b><span>лет успешной работы</span></div>
    <div class="fact"><b>8</b><span>мастеров в команде</span></div>
    <div class="fact"><b>300</b><span>клиенток в месяц</span></div>
    <div class="fact"><b>5,0</b><span>рейтинг на Яндекс Картах, 131 отзыв</span></div>
  </div>
  <p style="margin-top:26px">Клиенты приходят в таком порядке: сарафанное радио, карты, реклама,
  соцсети. Возвращаются почти все, к вам ходят семьями. Значит задача сайта —
  <b>не «привести побольше народу», а не потерять тех, кто уже про вас услышал</b>
  и пошёл проверять перед записью.</p>
  <p>Вы назвали три вопроса, которые задают перед записью: стерильность инструментов,
  безопасность материалов, срок носкости. Это и решает — запишется человек или закроет
  вкладку. У салонов, которых вы назвали сильными, отдельного ответа на эти вопросы
  на сайте нет. У вас он будет.</p>
</section>

<section>
  <div class="eyebrow">Задача</div>
  <h2>Что должен делать сайт</h2>
  <ul class="clean">
    <li><b>Доводить до онлайн-записи.</b> Виджет yclients стоит прямо на странице — во всех
    трёх вариантах. Человек выбирает мастера и время, не уходя с сайта.</li>
    <li><b>Снимать возражения до записи</b> — стерильность, материалы, срок носкости.</li>
    <li><b>Держать уровень.</b> Вы работаете в люкс-сегменте, и сайт должен выглядеть так же,
    как салон.</li>
    <li><b>Продавать сертификаты.</b> К вам ходят семьями — это прямая выручка, которой сейчас нет.</li>
    <li><b>Давать рекламе посадочную площадку</b> с настроенными целями, чтобы было видно,
    сколько записей приносит каждый вложенный рубль.</li>
  </ul>
</section>

<section>
  <div class="eyebrow">Важно</div>
  <h2>Почему сайт и реклама — одним пакетом</h2>
  <p>Обычно бывает так: сайт заказывают у одного, рекламу ведёт другой. Каждый делает свой
  кусок, а когда записей нет — рекламщик говорит, что виноват сайт, а сайтодел, что виновата
  реклама. Проверить нельзя, отвечать некому.</p>
  <p><b>У вас другой случай: Александр уже ведёт вашу рекламу.</b> Он знает, по каким запросам
  к вам приходят люди и сколько стоит клик. Поэтому сайт мы соберём не «вообще красивый»,
  а под конкретные объявления:</p>
  <ul class="clean">
    <li><b>Заголовки на сайте — под те же запросы, что в объявлениях.</b> Человек кликает
    по объявлению про маникюр в Раменском и попадает на экран, где написано ровно про это.
    Совпадение удешевляет клик и повышает долю записавшихся.</li>
    <li><b>Цели в Метрике ставятся вместе с сайтом, а не потом.</b> Видно не «переходы»,
    а записи: сколько их и по какой цене.</li>
    <li><b>Отдельные страницы под направления</b> — реклама ведёт сразу на нужную услугу.</li>
    <li><b>Один договор и одна ответственность.</b> Договор на комплекс маркетинговых услуг
    заключается с ИП Аполлонова — сайт и реклама в одном документе.</li>
  </ul>
  <div class="callout">
    <p><b>Настройка рекламы под новый сайт входит в стоимость сайта.</b> Объявления под новые
    страницы, цели в Метрике, запуск кампаний. Если бы сайт делал кто-то со стороны, эту работу
    пришлось бы оплачивать отдельно.</p>
    <p><b>Ключевые слова и объявления подбираем вместе с вами.</b> Вы знаете, за чем к вам
    приходят и что спрашивают чаще всего, Александр знает, как это превратить в запросы.
    Сайт пишется под те же слова, по которым будет идти реклама, — поэтому они работают
    как одно целое, а не как две отдельные покупки.</p>
    <p><b>После запуска сайта — ведение рекламы 12 000 ₽ в месяц.</b> Кампании на поиске
    и в РСЯ, корректировка ставок, минус-слова, контроль стоимости записи. Сумма одинакова
    во всех трёх вариантах.</p>
  </div>
</section>

<section>
  <div class="eyebrow">Как читать макеты</div>
  <h2>Три варианта, экран за экраном</h2>
  <p>Дальше показано, из каких экранов состоит сайт в каждом варианте: что стоит на экране,
  в каком порядке и что на нём будет. Это структура, а не дизайн — <b>серые полосы означают
  текст, штриховка — фотографии</b>, конкретные формулировки и картинки согласуем вместе.</p>
  <p class="small muted">Порядок экранов и их состав можно менять: если что-то лишнее или чего-то
  не хватает — скажите, соберём под вас.</p>
</section>

${PACKAGES.map(pkgSection).join('\n')}

<section>
  <div class="eyebrow">Про цену</div>
  <h2>Сколько это в ваших цифрах</h2>
  <div class="callout">
    <p>При среднем чеке 3 500 ₽ сайт в варианте «Оптимум» — это <b>11 визитов</b>.
    Из трёхсот в месяц.</p>
    <p>Ведение рекламы после запуска — <b>3–4 визита в месяц</b>.</p>
    <p>Одна клиентка, которая пришла и осталась, при вашем проценте возвратов приносит
    за год в десятки раз больше, чем стоила.</p>
  </div>
  <p><b>Разница между «Стартом» и «Оптимумом» — 8 000 ₽ единоразово.</b> За эти деньги
  добавляется ровно то, что вы сами перечислили в анкете: атмосфера салона, галерея работ,
  ответ про стерильность, отзывы, акции и сертификаты. То есть всё, что человек смотрит
  перед тем, как решиться.</p>
</section>

<section>
  <div class="eyebrow">После запуска</div>
  <h2>Сколько стоят правки</h2>
  <p>Абонентской платы за сайт нет. Первые <b>14 дней после сдачи правим бесплатно</b> —
  это время, чтобы всё вычитать и досогласовать. Дальше — только когда что-то реально нужно
  поменять, по этому прайсу. Чтобы вы заранее знали цифры и не гадали.</p>
  <table>
    <tr><th>Работа</th><th style="width:150px">Стоимость</th></tr>
    ${EDITS.map(([w, p]) => `<tr><td>${w}</td><td class="c">${p}</td></tr>`).join('\n    ')}
  </table>
  <p class="small muted">Срочная правка в течение суток — плюс 50% к стоимости. Обычный срок —
  до трёх рабочих дней. Опечатку или неверный телефон исправляем бесплатно и сразу,
  это не «правка».</p>
</section>

<section>
  <div class="eyebrow">Сроки и оплата</div>
  <h2>Как идёт работа</h2>
  <table>
    <tr><th>Вариант</th><th>Экранов</th><th>Срок</th><th>Предоплата 50%</th></tr>
    ${PACKAGES.map(p => `<tr><td>${p.name}</td><td class="c">${BLOCKS.filter(b => b.p.includes(p.id)).length}</td><td class="c">${p.term}</td><td class="c">${p.prepay}</td></tr>`).join('\n    ')}
  </table>
  <ol class="steps">
    <li><div><h3>Согласуем структуру и тексты</h3><p class="small muted">Правки на этом этапе
    бесплатны и быстры — менять порядок экранов, пока ничего не собрано, легко.</p></div></li>
    <li><div><h3>Собираем сайт</h3><p class="small muted">Промежуточную версию показываем,
    не пропадаем на две недели.</p></div></li>
    <li><div><h3>Подключаем домен, запись и аналитику</h3><p class="small muted">Домен у вас есть,
    хостинг наш. Ставим виджет yclients и цели для рекламы.</p></div></li>
    <li><div><h3>Сдаём, правим, перенастраиваем рекламу</h3><p class="small muted">14 дней
    на замечания после сдачи — правим без доплат.</p></div></li>
  </ol>
  <p class="small"><b>Что нужно от вас:</b> логотип и фирменные цвета, фото салона, работ
  и мастеров, доступ к домену и к личному кабинету yclients. Судя по анкете, всё это у вас
  есть — значит ждать не придётся.</p>
</section>

<section>
  <div class="eyebrow">Кто делает</div>
  <h2>Двое, а не агентство</h2>
  <p><b>Алина Шигапова</b> — продукт, продажи, процессы. Три года выстраивала продажи изнутри
  производственной компании: собрала оффер, сайт, рекламу и работу с заявками в одну систему.
  Выручка компании выросла в 2 раза, работаем третий год.</p>
  <p><b>Александр Аполлонов</b> — трафик и аналитика. 10 лет в Яндекс Директе, ведёт клиентов
  годами. Вашу рекламу он ведёт уже сейчас — значит сайт будет собран сразу под неё,
  а не отдельно от неё.</p>
  <p class="small muted">Мы берём ограниченное число проектов одновременно, поэтому работаем
  глубоко и не пропадаем. Ближайший свободный старт — с 11 августа.</p>
</section>

<section>
  <div class="eyebrow">Следующий шаг</div>
  <h2>Что нужно сейчас</h2>
  <p>Напишите в ответ одно слово — <b>«Старт»</b>, <b>«Оптимум»</b> или <b>«Комплекс»</b>.
  Пришлём договор и счёт на предоплату, начнём в тот же день.</p>
  <p>Если что-то смущает или хочется другого объёма — тоже напишите, соберём вариант под вас.
  Предложение действует до 9 августа.</p>
</section>

</div>

<footer>
  <b>Аполлонов и Шигапова</b><br />
  Пересобираем продажи в малом бизнесе · Казань<br />
  Исполнитель по договору — ИП Аполлонов А. · ИНН и ОГРНИП подставить<br />
  Телефон и мессенджеры: подставить
</footer>

</body>
</html>`;

writeFileSync(new URL('../kp-perfect-ton.html', import.meta.url), html);
console.log('Собрано. Экранов по пакетам:',
  PACKAGES.map(p => `${p.name} ${BLOCKS.filter(b => b.p.includes(p.id)).length}`).join(', '));
