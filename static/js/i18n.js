(function () {
  "use strict";

  var I18N = {
    en: {
      tagline:
        "We bet on&nbsp;teachers",
      q_what: "What we do",
      a_what:
        '<p>One good teacher shapes hundreds of&nbsp;children over a career. Some shape not just their own class, but the work of&nbsp;a whole team. So we’re not trying to&nbsp;invent a new pedagogy — we help teachers and coordinators get stronger at&nbsp;their work.</p>' +
        '<p>We take approaches that already work well, learn to&nbsp;use them ourselves, and test them in&nbsp;practice. More than half of&nbsp;every program is practice: teaching real children and going over the lessons with a mentor.</p>' +
        '<p>What interests us is not what looks good at&nbsp;a workshop, but what works afterwards — in&nbsp;an&nbsp;ordinary class of&nbsp;35 on&nbsp;a Tuesday morning.</p>' +
        '<p class="label">What about AI?</p>' +
        '<p>AI, to&nbsp;us, is a tool — not a replacement for the teacher. We teach teachers to&nbsp;use it themselves and to&nbsp;teach it to&nbsp;children, instead of&nbsp;training AI to&nbsp;replace teachers.</p>',
      q_teachers: "For teachers",
      a_teachers:
        '<p>We start with late primary and early middle school — the age when many children’s interest in&nbsp;learning begins to&nbsp;fade.</p>' +
        '<p>We work on&nbsp;very practical things: how to&nbsp;gather a class’s attention without raising your voice; how to&nbsp;build motivation that doesn’t run on&nbsp;grades; how to&nbsp;start a lesson from a real question; how to&nbsp;lead a discussion where children answer each other instead of&nbsp;guessing what the teacher wants to&nbsp;hear.</p>' +
        '<p>After the intensive, participants spend several weeks teaching children — and go over each week’s lessons with a mentor.</p>',
      q_leaders: "For coordinators",
      a_leaders:
        '<p>Coordinators (rakazim) keep teaching themselves while helping a whole team work. It’s a hard role: leading people who don’t formally report to&nbsp;you, giving feedback that actually helps, sharing the load — and not drowning in&nbsp;coordination.</p>' +
        '<p>We’re building this program together with rakazim. The first pilot starts in&nbsp;fall 2026.</p>' +
        '<p>The two directions are connected for us: strong teachers need schools where they want to&nbsp;work — and can do their best work.</p>',
      q_pilot: "The first pilot",
      a_pilot:
        '<p>In&nbsp;summer 2026, 17&nbsp;teachers finished our first intensive. 16&nbsp;of&nbsp;them are now continuing paid practice with children and meet a mentor every week; 14&nbsp;of&nbsp;the&nbsp;17 would recommend the program to&nbsp;colleagues.</p>' +
        '<p>Two-thirds of&nbsp;the children we surveyed said they’d like to&nbsp;see lessons like these at&nbsp;their school. For now it’s an&nbsp;early signal from a very friendly setting. The really interesting question is whether it repeats in&nbsp;ordinary classrooms.</p>' +
        '<p><a href="https://summer-pilot-2026.utterstep.app/" target="_blank" rel="noopener">More about the first pilot</a></p>',
      q_paid: "Do participants get paid?",
      a_paid:
        '<p>Yes. We pay both for the training and for the practice with children that follows.</p>' +
        '<p>Teachers have more than enough work without us. If we believe their time matters, taking part shouldn’t rest on&nbsp;enthusiasm alone.</p>',
      q_who: "Who we are",
      a_who:
        '<div class="cards">' +
          '<div class="card">' +
            '<img class="card-photo" src="static/img/elena.jpg" alt="Elena Bunina" width="420" height="510" />' +
            '<p class="role">Founder &amp; Patron</p>' +
            '<p class="name"><a href="https://www.linkedin.com/in/elena-bunina-738522eb/" target="_blank" rel="noopener">Elena Bunina</a></p>' +
            '<p class="bio">Mathematics professor at&nbsp;Bar Ilan University, and head of&nbsp;the <a href="https://academy.nebius.com" target="_blank" rel="noopener">Nebius Academy</a>.</p>' +
          '</div>' +
          '<div class="card">' +
            '<img class="card-photo" src="static/img/vlad.jpg" alt="Vlad Stepanov" width="420" height="510" />' +
            '<p class="role">Co-Founder &amp; CEO</p>' +
            '<p class="name"><a href="https://www.linkedin.com/in/utterstep/" target="_blank" rel="noopener">Vlad Stepanov</a></p>' +
            '<p class="bio">Ex-CEO of&nbsp;<a href="https://gradarius.com" target="_blank" rel="noopener">Gradarius</a>, ex-CTO and head of&nbsp;Informatika at&nbsp;Yandex Education. 13+ years of&nbsp;experience in&nbsp;EdTech in&nbsp;the US and CSI.</p>' +
          '</div>' +
        '</div>',
      q_contact: "Let’s talk",
      a_contact:
        '<p>If you’re a teacher, a coordinator, a school or a municipality — or simply want to&nbsp;see whether we could do something together — write to&nbsp;us.</p>' +
        '<p><a href="mailto:contact@morim.foundation">contact@morim.foundation</a></p>'
    },

    ru: {
      tagline:
        "Мы делаем ставку на&nbsp;учителей",
      q_what: "Что мы делаем",
      a_what:
        '<p>Один хороший учитель за&nbsp;свою карьеру влияет на&nbsp;сотни детей. Некоторые влияют не&nbsp;только на&nbsp;свой класс, но&nbsp;и&nbsp;на&nbsp;работу целой команды. Поэтому мы не&nbsp;пытаемся придумать новую педагогическую систему, а&nbsp;помогаем учителям и&nbsp;координаторам становиться сильнее в&nbsp;своей работе.</p>' +
        '<p>Берём подходы, которые уже хорошо работают, учимся ими пользоваться и&nbsp;проверяем их на&nbsp;практике. Больше половины программы — практика с&nbsp;настоящими детьми и&nbsp;разбор занятий с&nbsp;ментором.</p>' +
        '<p>Нас интересует не&nbsp;то, что хорошо выглядит на&nbsp;воркшопе, а&nbsp;то, что работает потом — в&nbsp;обычном классе из&nbsp;35&nbsp;человек во&nbsp;вторник утром.</p>' +
        '<p class="label">А&nbsp;что с&nbsp;ИИ?</p>' +
        '<p>ИИ для нас — инструмент, а&nbsp;не&nbsp;замена учителю. Мы учим учителей пользоваться им самим и&nbsp;учить этому детей — а&nbsp;не&nbsp;обучаем ИИ заменять учителей.</p>',
      q_teachers: "Для учителей",
      a_teachers:
        '<p>Начинаем с&nbsp;конца начальной и&nbsp;начала средней школы — возраста, когда интерес к&nbsp;учёбе у&nbsp;многих детей начинает угасать.</p>' +
        '<p>Работаем с&nbsp;очень практическими вещами: как собрать внимание класса, не&nbsp;повышая голоса; как строить мотивацию, которая не&nbsp;держится на&nbsp;оценках; как начинать урок с&nbsp;настоящего вопроса; как вести дискуссию, в&nbsp;которой дети отвечают друг другу, а&nbsp;не&nbsp;пытаются угадать, что хочет услышать учитель.</p>' +
        '<p>После интенсива участники несколько недель ведут занятия с&nbsp;детьми и&nbsp;каждую неделю разбирают их с&nbsp;ментором.</p>',
      q_leaders: "Для координаторов",
      a_leaders:
        '<p>Координаторы (раказим) сами продолжают преподавать и&nbsp;одновременно помогают работать целой команде. Это сложная роль: нужно вести за&nbsp;собой людей, которые формально тебе не&nbsp;подчиняются, давать полезную обратную связь, распределять нагрузку и&nbsp;не&nbsp;утонуть в&nbsp;координации.</p>' +
        '<p>Эту программу мы делаем вместе с&nbsp;самими раказим. Первый пилот стартует осенью 2026 года.</p>' +
        '<p>Оба направления для нас связаны: сильным учителям нужны школы, в&nbsp;которых им хочется и&nbsp;получается хорошо работать.</p>',
      q_pilot: "Первый пилот",
      a_pilot:
        '<p>Летом 2026 года первый интенсив закончили 17&nbsp;учителей. 16 из&nbsp;них сейчас продолжают оплачиваемую практику с&nbsp;детьми и&nbsp;каждую неделю встречаются с&nbsp;ментором; 14 из&nbsp;17 готовы рекомендовать программу коллегам.</p>' +
        '<p>Среди опрошенных детей две трети сказали, что хотели&nbsp;бы видеть похожие уроки в&nbsp;своей школе. Пока это ранний сигнал из&nbsp;очень дружелюбной среды. По-настоящему интересно будет увидеть, повторится&nbsp;ли он в&nbsp;обычных школьных классах.</p>' +
        '<p><a href="https://summer-pilot-2026.utterstep.app/" target="_blank" rel="noopener">Подробнее о&nbsp;первом пилоте</a></p>',
      q_paid: "За участие платят?",
      a_paid:
        '<p>Да. Мы платим и&nbsp;за&nbsp;обучение, и&nbsp;за&nbsp;последующую практику с&nbsp;детьми.</p>' +
        '<p>У&nbsp;учителей и&nbsp;без нас достаточно работы. Если мы считаем их время важным, участие в&nbsp;программе не&nbsp;должно держаться только на&nbsp;энтузиазме.</p>',
      q_who: "Кто мы",
      a_who:
        '<div class="cards">' +
          '<div class="card">' +
            '<img class="card-photo" src="static/img/elena.jpg" alt="Елена Бунина" width="420" height="510" />' +
            '<p class="role">Основатель и попечитель</p>' +
            '<p class="name"><a href="https://www.linkedin.com/in/elena-bunina-738522eb/" target="_blank" rel="noopener">Елена Бунина</a></p>' +
            '<p class="bio">профессор математики в&nbsp;Университете Бар-Илан и&nbsp;руководитель <a href="https://academy.nebius.com" target="_blank" rel="noopener">Nebius Academy</a>.</p>' +
          '</div>' +
          '<div class="card">' +
            '<img class="card-photo" src="static/img/vlad.jpg" alt="Влад Степанов" width="420" height="510" />' +
            '<p class="role">Сооснователь и CEO</p>' +
            '<p class="name"><a href="https://www.linkedin.com/in/utterstep/" target="_blank" rel="noopener">Влад Степанов</a></p>' +
            '<p class="bio">экс-CEO <a href="https://gradarius.com" target="_blank" rel="noopener">Gradarius</a>, экс-CTO и&nbsp;руководитель Информатики в&nbsp;Яндекс.Образовании. 13+ лет опыта в&nbsp;EdTech в&nbsp;США и&nbsp;СНГ.</p>' +
          '</div>' +
        '</div>',
      q_contact: "Давайте поговорим",
      a_contact:
        '<p>Если вы учитель, координатор, школа или муниципалитет — или просто хотите понять, можем&nbsp;ли мы что-то сделать вместе, — напишите нам.</p>' +
        '<p><a href="mailto:contact@morim.foundation">contact@morim.foundation</a></p>'
    },

    he: {
      tagline:
        "אנחנו מהמרים על&nbsp;המורים",
      q_what: "מה אנחנו עושים",
      a_what:
        '<p>מורה טוב אחד משפיע במהלך הקריירה על מאות ילדים. יש מורים שמשפיעים לא רק על הכיתה שלהם, אלא גם על העבודה של צוות שלם. לכן אנחנו לא מנסים להמציא פדגוגיה חדשה — אנחנו עוזרים למורים ולרכזים להתחזק בעבודה שלהם.</p>' +
        '<p>אנחנו לוקחים גישות שכבר עובדות היטב, לומדים להשתמש בהן בעצמנו ובוחנים אותן בפועל. יותר ממחצית מכל תוכנית היא תרגול: הוראת ילדים אמיתיים וניתוח השיעורים עם מנטור.</p>' +
        '<p>מה שמעניין אותנו הוא לא מה שנראה טוב בסדנה, אלא מה שעובד אחר כך — בכיתה רגילה של 35 ילדים ביום שלישי בבוקר.</p>' +
        '<p class="label">ומה עם AI?</p>' +
        '<p>AI בשבילנו הוא כלי, לא תחליף למורה. אנחנו מלמדים מורים להשתמש בו בעצמם וללמד אותו לילדים — במקום לאמן AI להחליף מורים.</p>',
      q_teachers: "למורים",
      a_teachers:
        '<p>אנחנו מתחילים בסוף בית הספר היסודי ובתחילת חטיבת הביניים — הגיל שבו העניין בלמידה אצל ילדים רבים מתחיל לדעוך.</p>' +
        '<p>אנחנו עובדים על דברים מאוד מעשיים: איך לאסוף את תשומת הלב של הכיתה בלי להרים את הקול; איך לבנות מוטיבציה שלא נשענת על ציונים; איך להתחיל שיעור משאלה אמיתית; איך להוביל דיון שבו הילדים עונים זה לזה במקום לנחש מה המורה רוצה לשמוע.</p>' +
        '<p>אחרי האינטנסיב המשתתפים מלמדים ילדים במשך כמה שבועות — ומנתחים את השיעורים עם מנטור מדי שבוע.</p>',
      q_leaders: "לרכזים ולרכזות",
      a_leaders:
        '<p>רכזים ורכזות ממשיכים ללמד בעצמם ובו-זמנית עוזרים לצוות שלם לעבוד. זה תפקיד לא פשוט: להוביל אנשים שלא כפופים לך פורמלית, לתת משוב שבאמת עוזר, לחלק את העומס — ולא לטבוע בקואורדינציה.</p>' +
        '<p>את התוכנית הזאת אנחנו בונים יחד עם רכזים ורכזות. פיילוט ראשון יוצא לדרך בסתיו 2026.</p>' +
        '<p>שני הכיוונים קשורים זה בזה בעינינו: מורים חזקים צריכים בתי ספר שבהם הם רוצים — ומצליחים — לעבוד טוב.</p>',
      q_pilot: "הפיילוט הראשון",
      a_pilot:
        '<p>בקיץ 2026 סיימו 17 מורים ומורות את האינטנסיב הראשון שלנו. 16 מהם ממשיכים כעת בתרגול בתשלום עם ילדים ונפגשים עם מנטור מדי שבוע; 14 מתוך 17 היו ממליצים על התוכנית לעמיתים.</p>' +
        '<p>שני שלישים מהילדים שנשאלו אמרו שהיו רוצים לראות שיעורים דומים בבית הספר שלהם. בינתיים זה סימן מוקדם מסביבה מאוד אוהדת. השאלה המעניינת באמת היא אם הוא יחזור על עצמו בכיתות רגילות.</p>' +
        '<p><a href="https://summer-pilot-2026.utterstep.app/" target="_blank" rel="noopener">עוד על הפיילוט הראשון</a></p>',
      q_paid: "האם משלמים על ההשתתפות?",
      a_paid:
        '<p>כן. אנחנו משלמים גם על ההכשרה וגם על התרגול עם ילדים שבא אחריה.</p>' +
        '<p>למורים יש מספיק עבודה גם בלעדינו. אם אנחנו מאמינים שהזמן שלהם חשוב, ההשתתפות בתוכנית לא צריכה להישען על התלהבות בלבד.</p>',
      q_who: "מי אנחנו",
      a_who:
        '<div class="cards">' +
          '<div class="card">' +
            '<img class="card-photo" src="static/img/elena.jpg" alt="אלנה בונינה" width="420" height="510" />' +
            '<p class="role">מייסדת ופטרונית</p>' +
            '<p class="name"><a href="https://www.linkedin.com/in/elena-bunina-738522eb/" target="_blank" rel="noopener">אלנה בונינה</a></p>' +
            '<p class="bio">פרופסור למתמטיקה באוניברסיטת בר-אילן וראש <a href="https://academy.nebius.com" target="_blank" rel="noopener">Nebius Academy</a>.</p>' +
          '</div>' +
          '<div class="card">' +
            '<img class="card-photo" src="static/img/vlad.jpg" alt="ולאד סטפנוב" width="420" height="510" />' +
            '<p class="role">מייסד שותף ומנכ״ל</p>' +
            '<p class="name"><a href="https://www.linkedin.com/in/utterstep/" target="_blank" rel="noopener">ולאד סטפנוב</a></p>' +
            '<p class="bio">לשעבר מנכ״ל <a href="https://gradarius.com" target="_blank" rel="noopener">Gradarius</a>, לשעבר CTO וראש תחום Informatika ב-Yandex Education. 13+ שנות ניסיון ב-EdTech בארה״ב ובחבר העמים.</p>' +
          '</div>' +
        '</div>',
      q_contact: "בואו נדבר",
      a_contact:
        '<p>אם אתם מורה, רכזת או רכז, בית ספר או רשות מקומית — או פשוט רוצים לבדוק אם נוכל לעשות משהו יחד — כתבו לנו.</p>' +
        '<p><a href="mailto:contact@morim.foundation">contact@morim.foundation</a></p>'
    }
  };

  var buttons = Array.prototype.slice.call(document.querySelectorAll(".lang button"));

  function setLang(lang) {
    var dict = I18N[lang];
    if (!dict) return;

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";

    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var value = dict[el.getAttribute("data-i18n")];
      if (value == null) continue;
      if (el.hasAttribute("data-i18n-html")) {
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
    }

    for (var j = 0; j < buttons.length; j++) {
      var b = buttons[j];
      b.setAttribute("aria-current", b.getAttribute("data-lang") === lang ? "true" : "false");
    }

    try { localStorage.setItem("lang", lang); } catch (e) {}
  }

  for (var k = 0; k < buttons.length; k++) {
    (function (b) {
      b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
    })(buttons[k]);
  }

  var saved;
  try { saved = localStorage.getItem("lang"); } catch (e) {}
  setLang(I18N[saved] ? saved : "en");
})();
