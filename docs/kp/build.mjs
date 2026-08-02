/**
 * Генератор КП для салона ПЕРФЕКТ ТОН.
 * Запуск: node docs/kp/build.mjs
 * Результат: docs/kp-perfect-ton.html
 *
 * Правки цен и состава пакетов — в PACKAGES и BLOCKS ниже, верстку не трогать.
 */
import { writeFileSync } from 'node:fs';

const PACKAGES = [
  { id: 's', name: 'Старт',    price: '30 000 ₽', month: '12 000 ₽/мес',
    monthNote: 'ведение рекламы, как сейчас', prepay: '15 000 ₽', term: '7 рабочих дней',
    pitch: 'Рабочий сайт с онлайн-записью. Всё необходимое, ничего сверх.' },
  { id: 'o', name: 'Оптимум',  price: '38 000 ₽', month: '15 000 ₽/мес',
    monthNote: 'реклама и поддержка сайта', prepay: '19 000 ₽', term: '10 рабочих дней',
    pitch: 'То же плюс всё, что продаёт: атмосфера, работы, отзывы, акции, сертификаты.',
    pick: true },
  { id: 'k', name: 'Комплекс', price: '48 000 ₽', month: '20 000 ₽/мес',
    monthNote: 'реклама, поддержка, отчёт по цифрам', prepay: '24 000 ₽', term: '15 рабочих дней',
    pitch: 'То же плюс отдельные страницы под каждое направление — под рекламу.' },
];

// layout: как выглядит мини-макет блока
const BLOCKS = [
  { t: 'Первый экран', d: 'Заголовок, короткое описание, кнопка записи, фото салона', l: 'hero', p: 'sok' },
  { t: 'Направления услуг', d: 'Четыре направления карточками: ногти, брови, ресницы, солярий', l: 'cards4', p: 'sok' },
  { t: 'О салоне и атмосфера', d: 'Текст и фотографии интерьера — тот самый вайб', l: 'textphoto', p: 'ok' },
  { t: 'Видео или фотоподборка', d: 'Короткое видео салона. Если видео нет — подборка кадров', l: 'video', p: 'ok' },
  { t: 'Мастера', d: 'Фото, имя, специализация, опыт', l: 'team', p: 'sok' },
  { t: 'Галерея работ', d: 'Сетка фотографий по направлениям', l: 'gallery', p: 'ok' },
  { t: 'Стерильность и материалы', d: 'Ответ на три вопроса, которые задают перед записью', l: 'trust', p: 'ok' },
  { t: 'Цены', d: 'Прайс по направлениям, подтягивается из вашего списка', l: 'pricelist', p: 'sok' },
  { t: 'Акции', d: 'Текущие предложения, обновляем ежемесячно', l: 'promo', p: 'ok' },
  { t: 'Подарочные сертификаты', d: 'Номиналы и как купить — к вам ходят семьями', l: 'cert', p: 'ok' },
  { t: 'Отзывы', d: 'Отзывы с Яндекс Карт со ссылкой на источник', l: 'reviews', p: 'ok' },
  { t: 'Как добраться', d: 'Карта, ориентиры, парковка, пандус', l: 'map', p: 'sok' },
  { t: 'Онлайн-запись', d: 'Виджет yclients прямо на странице — запись не уходя с сайта', l: 'widget', p: 'sok' },
  { t: 'Подвал', d: 'Контакты, режим работы, политика обработки данных', l: 'footer', p: 'sok' },
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

const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Коммерческое предложение — сайт для салона ПЕРФЕКТ ТОН</title>
<style>
:root{--ink:#16181d;--muted:#5f6672;--line:#e0dbd3;--accent:#1d3f66;--tint:#eef2f7;
--wire:#dfe6ef;--wire2:#cdd8e6;--serif:Georgia,"Palatino Linotype","Times New Roman",serif;
--sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
*{box-sizing:border-box}
body{margin:0;background:#f2f0ec;color:var(--ink);font-family:var(--sans);font-size:15px;line-height:1.6}
.page{max-width:860px;margin:0 auto;background:#fff;padding:44px 52px 56px}
h1,h2{font-family:var(--serif);font-weight:400;line-height:1.2}
h1{font-size:30px;margin:0 0 8px}h2{font-size:23px;margin:0 0 6px}
h3{font-size:15px;margin:0 0 4px;font-weight:700}
p{margin:0 0 12px}
section{padding:30px 0;border-top:1px solid var(--line)}
.eyebrow{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:10px}
.muted{color:var(--muted)}.small{font-size:13px}
header{display:flex;justify-content:space-between;gap:20px;padding-bottom:24px}
.brand{font-family:var(--serif);font-size:19px}
.brand span{display:block;font-family:var(--sans);font-size:12px;color:var(--muted);margin-top:2px}
.meta{text-align:right;font-size:13px;color:var(--muted)}
.facts{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0}
.fact{background:var(--tint);border-radius:8px;padding:12px 14px}
.fact b{display:block;font-family:var(--serif);font-size:21px;font-weight:400;color:var(--accent)}
.fact span{font-size:12px;color:var(--muted)}
ul.clean{margin:0 0 12px;padding-left:20px}ul.clean li{margin-bottom:7px}
.callout{background:var(--tint);border-left:3px solid var(--accent);border-radius:0 8px 8px 0;padding:16px 18px;margin:14px 0}
.callout p:last-child{margin-bottom:0}

/* Пакет */
.pkg-head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:16px}
.pkg.pick .pkg-head{background:var(--tint);border-radius:10px;padding:16px 18px}
.badge{display:inline-block;background:var(--accent);color:#fff;font-size:10px;letter-spacing:.08em;
text-transform:uppercase;padding:3px 8px;border-radius:4px;margin-bottom:6px}
.pkg-price{text-align:right;flex-shrink:0}
.pp{font-size:26px;font-weight:700;line-height:1.1}
.pm{font-size:15px;font-weight:700;color:var(--accent);margin-top:2px}
.pn{font-size:11.5px;color:var(--muted);line-height:1.4}
.screens{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.screen{border:1px solid var(--line);border-radius:9px;padding:11px;background:#fff}
.shead{display:flex;gap:8px;align-items:baseline;font-size:12.5px;margin-bottom:8px}
.snum{color:var(--accent);font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;flex-shrink:0}
.sbody{background:#fafbfc;border:1px solid #eef1f5;border-radius:6px;padding:9px;min-height:104px}
.sdesc{font-size:11.5px;color:var(--muted);margin-top:7px;line-height:1.45}

/* Элементы каркаса */
.row{display:flex;gap:8px}.col{flex:1;min-width:0}
.tx{height:6px;background:var(--wire);border-radius:3px;margin-bottom:5px}
.tx.big{height:11px;background:var(--wire2)}
.tx.pr{background:var(--wire2)}
.ph{background:repeating-linear-gradient(135deg,#e7ecf2,#e7ecf2 5px,#eef2f6 5px,#eef2f6 10px);border-radius:5px}
.wbtn{height:15px;width:74px;background:#2b3340;border-radius:4px;margin-top:7px}
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.grid2{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}
.grid6{display:grid;grid-template-columns:repeat(3,1fr);gap:5px}
.card{background:#fff;border:1px solid #e9edf2;border-radius:5px;padding:5px}
.card.center{text-align:center;display:flex;flex-direction:column;align-items:center}
.ava{width:26px;height:26px;border-radius:50%;background:var(--wire);margin-bottom:5px}
.ava.sm{width:20px;height:20px}
.ico{width:16px;height:16px;border-radius:4px;background:var(--wire2);margin-bottom:5px}
.stars{width:46px;height:7px;border-radius:3px;background:#e3c76b;margin-bottom:6px}
.video{position:relative}
.play{position:absolute;left:50%;top:50%;width:0;height:0;transform:translate(-40%,-50%);
border-left:16px solid #b9c4d1;border-top:10px solid transparent;border-bottom:10px solid transparent}
.plist .prow{display:flex;justify-content:space-between;gap:10px;padding:4px 0;border-bottom:1px solid #eef1f5}
.maprow{display:flex;gap:8px}
.mapbox{flex:1.2;background:#e9eef3;border-radius:5px;display:flex;align-items:center;justify-content:center;
font-size:11px;color:#93a1b0;min-height:74px}
.widget{border:1px dashed var(--wire2);border-radius:6px;padding:8px}
.wtitle{font-size:10.5px;color:var(--accent);margin-bottom:7px;text-align:center}
.slots{display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin-top:7px}
.slot{height:13px;background:var(--wire);border-radius:3px}
.foot{display:flex;gap:14px;padding-top:6px;border-top:1px solid #eef1f5}
.ab{flex:1;border:1px dashed var(--wire2);border-radius:5px;padding:7px}
.ablab{font-size:10px;color:var(--accent);margin-bottom:5px}

table{border-collapse:collapse;width:100%;margin:8px 0 14px}
th,td{border:1px solid var(--line);padding:9px 12px;font-size:14px;text-align:left}
th{background:var(--tint);font-weight:700}td.c{text-align:center}
.steps{counter-reset:s;margin:0;padding:0;list-style:none}
.steps li{counter-increment:s;display:grid;grid-template-columns:26px 1fr;gap:12px;margin-bottom:12px}
.steps li::before{content:counter(s);font-family:var(--serif);font-size:18px;color:var(--accent)}
footer{border-top:1px solid var(--line);margin-top:8px;padding-top:22px;font-size:12px;color:var(--muted)}

@media(max-width:760px){
.page{padding:24px 18px 34px}h1{font-size:24px}
.facts{grid-template-columns:repeat(2,1fr)}
.screens{grid-template-columns:1fr}
header,.pkg-head{flex-direction:column}.meta,.pkg-price{text-align:left}
}
@media print{
body{background:#fff;font-size:11pt}.page{max-width:none;padding:0}
@page{size:A4;margin:12mm}
.screen,.callout,table,.pkg-head{page-break-inside:avoid}
section{page-break-inside:auto}
}
</style>
</head>
<body>
<div class="page">

<header>
  <div class="brand">Аполлонов и Шигапова<span>Пересобираем продажи в малом бизнесе</span></div>
  <div class="meta">Коммерческое предложение<br />Салон «ПЕРФЕКТ ТОН», Раменское<br />2 августа 2026 года</div>
</header>

<h1>Сайт с онлайн-записью и реклама — одним пакетом</h1>
<p class="muted">Предложение составлено по вашей анкете. Ниже — что мы поняли о салоне, из каких экранов
будет состоять сайт в каждом варианте, что делает Александр и почему это выгоднее покупать вместе.</p>

<section>
  <div class="eyebrow">Что мы поняли из анкеты</div>
  <h2>Салон, который держится на возвратах</h2>
  <div class="facts">
    <div class="fact"><b>15 лет</b><span>на рынке</span></div>
    <div class="fact"><b>8</b><span>мастеров</span></div>
    <div class="fact"><b>~300</b><span>клиенток в месяц</span></div>
    <div class="fact"><b>3 500 ₽</b><span>средний чек</span></div>
  </div>
  <p>Клиенты приходят в таком порядке: сарафанное радио, карты, реклама, соцсети. Возвращаются почти все,
  к вам ходят семьями. Значит задача сайта — <b>не «привести побольше народу», а не потерять тех,
  кто уже про вас услышал</b> и пошёл проверять перед записью.</p>
  <p>Вы назвали три вопроса, которые задают перед записью: стерильность инструментов, безопасность
  материалов, срок носкости. Это и решает — запишется человек или закроет вкладку. У салонов, которых
  вы назвали сильными, отдельного ответа на эти вопросы на сайте нет. У вас он будет.</p>
</section>

<section>
  <div class="eyebrow">Задача</div>
  <h2>Что должен делать сайт</h2>
  <ul class="clean">
    <li><b>Доводить до онлайн-записи.</b> Виджет yclients стоит прямо на странице — во всех трёх вариантах.
    Человек выбирает мастера и время, не уходя с сайта.</li>
    <li><b>Снимать возражения до записи</b> — стерильность, материалы, срок носкости.</li>
    <li><b>Держать уровень.</b> Вы работаете в люкс-сегменте, и сайт должен выглядеть так же, как салон.</li>
    <li><b>Продавать сертификаты.</b> К вам ходят семьями — это прямая выручка, которой сейчас нет.</li>
    <li><b>Давать рекламе посадочную площадку</b> с настроенными целями, чтобы было видно, сколько
    записей приносит каждый вложенный рубль.</li>
  </ul>
</section>

<section>
  <div class="eyebrow">Важно</div>
  <h2>Почему сайт и реклама — одним пакетом</h2>
  <p>Обычно бывает так: сайт заказывают у одного, рекламу ведёт другой. Каждый делает свой кусок,
  а когда записей нет — рекламщик говорит, что виноват сайт, а сайтодел, что виновата реклама.
  Проверить нельзя, отвечать некому.</p>
  <p><b>У вас другой случай: Александр уже ведёт вашу рекламу.</b> Он знает, по каким запросам к вам
  приходят люди и сколько стоит клик. Поэтому сайт мы соберём не «вообще красивый», а под конкретные
  объявления:</p>
  <ul class="clean">
    <li><b>Заголовки на сайте — под те же запросы, что в объявлениях.</b> Человек кликает по объявлению
    про маникюр в Раменском и попадает на экран, где написано ровно про это. Совпадение объявления
    и страницы удешевляет клик и повышает долю записавшихся.</li>
    <li><b>Цели в Метрике ставятся вместе с сайтом, а не потом.</b> Видно не «переходы», а записи:
    сколько их и по какой цене.</li>
    <li><b>Отдельные страницы под направления</b> (в «Комплексе») — реклама ведёт сразу на нужную услугу,
    а не на общую страницу, где ещё надо искать.</li>
    <li><b>Один договор и одна ответственность.</b> Договор на комплекс маркетинговых услуг заключается
    с ИП Аполлонова — сайт и реклама в одном документе, спрашивать не с кого-то одного из двоих, а с нас.</li>
  </ul>
  <div class="callout">
    <p><b>Что входит в ежемесячную работу Александра:</b> ведение кампаний на поиске и в РСЯ,
    корректировка ставок, минус-слова, переработка объявлений под новый сайт, контроль стоимости записи.</p>
    <p><b>Что добавляется в «Оптимуме» и «Комплексе»:</b> поддержка сайта — обновляем акции, прайс,
    добавляем работы в галерею. В «Комплексе» — ещё и отчёт по цифрам раз в месяц.</p>
  </div>
</section>

<section>
  <div class="eyebrow">Как читать макеты ниже</div>
  <h2>Три варианта, экран за экраном</h2>
  <p>Дальше показано, из каких экранов состоит сайт в каждом варианте: что стоит на экране, в каком
  порядке и что на нём будет. Это структура, а не дизайн — <b>серые полосы означают текст,
  штриховка — фотографии</b>, конкретные формулировки и картинки согласуем вместе.</p>
  <p class="small muted">Порядок экранов и их состав можно менять: если что-то лишнее или чего-то не хватает —
  скажите, соберём под вас.</p>
</section>

${PACKAGES.map(pkgSection).join('\n')}

<section>
  <div class="eyebrow">Про цену</div>
  <h2>Сколько это в ваших цифрах</h2>
  <div class="callout">
    <p>При среднем чеке 3 500 ₽ сайт в варианте «Оптимум» — это <b>11 визитов</b>. Из трёхсот в месяц.</p>
    <p>Ежемесячная работа — <b>4 визита</b>.</p>
    <p>Одна клиентка, которая пришла и осталась, при вашем проценте возвратов приносит за год
    в десятки раз больше, чем стоила.</p>
  </div>
  <p><b>Разница между «Стартом» и «Оптимумом» — 8 000 ₽ единоразово.</b> За эти деньги добавляется
  ровно то, что вы сами перечислили в анкете: атмосфера салона, галерея работ, ответ про стерильность,
  отзывы, акции и сертификаты. То есть всё, что человек смотрит перед тем, как решиться.</p>
</section>

<section>
  <div class="eyebrow">Сроки и оплата</div>
  <h2>Как идёт работа</h2>
  <table>
    <tr><th>Вариант</th><th>Экранов</th><th>Срок</th><th>Предоплата 50%</th></tr>
    ${PACKAGES.map(p => `<tr><td>${p.name}</td><td class="c">${BLOCKS.filter(b => b.p.includes(p.id)).length}</td><td class="c">${p.term}</td><td class="c">${p.prepay}</td></tr>`).join('\n    ')}
  </table>
  <ol class="steps">
    <li><div><h3>Согласуем структуру и тексты</h3><p class="small muted">Правки на этом этапе бесплатны и быстры — менять порядок экранов, пока ничего не собрано, легко.</p></div></li>
    <li><div><h3>Собираем сайт</h3><p class="small muted">Промежуточную версию показываем, не пропадаем на две недели.</p></div></li>
    <li><div><h3>Подключаем домен, запись и аналитику</h3><p class="small muted">Домен у вас есть, хостинг наш. Ставим виджет yclients и цели для рекламы.</p></div></li>
    <li><div><h3>Сдаём, правим, перенастраиваем рекламу под новый сайт</h3><p class="small muted">14 дней на замечания после сдачи — правим без доплат.</p></div></li>
  </ol>
  <p class="small"><b>Что нужно от вас:</b> логотип и фирменные цвета, фото салона, работ и мастеров,
  доступ к домену и к личному кабинету yclients. Судя по анкете, всё это у вас есть — значит ждать не придётся.</p>
</section>

<section>
  <div class="eyebrow">Кто делает</div>
  <h2>Двое, а не агентство</h2>
  <p><b>Алина Шигапова</b> — продукт, продажи, процессы. Три года выстраивала продажи изнутри
  производственной компании: собрала оффер, сайт, рекламу и работу с заявками в одну систему.
  Выручка компании выросла в 2 раза, работаем третий год.</p>
  <p><b>Александр Аполлонов</b> — трафик и аналитика. 10 лет в Яндекс Директе, ведёт клиентов годами.
  Вашу рекламу он ведёт уже сейчас — значит сайт будет собран сразу под неё, а не отдельно от неё.</p>
  <p class="small muted">Мы берём ограниченное число проектов одновременно, поэтому работаем глубоко
  и не пропадаем. Ближайший свободный старт — с 11 августа.</p>
</section>

<section>
  <div class="eyebrow">Следующий шаг</div>
  <h2>Что нужно сейчас</h2>
  <p>Напишите в ответ одно слово — <b>«Старт»</b>, <b>«Оптимум»</b> или <b>«Комплекс»</b>.
  Пришлём договор и счёт на предоплату, начнём в тот же день.</p>
  <p>Если что-то смущает или хочется другого объёма — тоже напишите, соберём вариант под вас.
  Предложение действует до 9 августа.</p>
</section>

<footer>
  Аполлонов и Шигапова · Пересобираем продажи в малом бизнесе · Казань<br />
  Исполнитель по договору — ИП Аполлонов А. · ИНН и ОГРНИП подставить<br />
  Телефон и мессенджеры: подставить
</footer>

</div>
</body>
</html>`;

writeFileSync(new URL('../kp-perfect-ton.html', import.meta.url), html);
console.log('Собрано. Экранов по пакетам:',
  PACKAGES.map(p => `${p.name} ${BLOCKS.filter(b => b.p.includes(p.id)).length}`).join(', '));
