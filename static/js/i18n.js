(function () {
  "use strict";

  var I18N = {
    en: {
      tagline:
        "We bet on&nbsp;teachers",
      cta: "Want to do something together?",
      q_what: "What we do",
      a_what:
        '<p>One good teacher shapes hundreds of&nbsp;children over a career. Some shape not just their own class, but the work of&nbsp;a whole team. So we’re not trying to&nbsp;invent a new pedagogy — we help teachers and coordinators get better at&nbsp;the work they already do.</p>' +
        '<p>We take approaches that already work well, learn to&nbsp;use them ourselves, and test them in&nbsp;practice. More than half of&nbsp;every program is practice: participants teach children and then go over the lessons with a mentor.</p>' +
        '<p>We care less about what looks good in&nbsp;a workshop than what still works afterwards — in&nbsp;a regular class of&nbsp;35 on&nbsp;a Tuesday morning.</p>' +
        '<p class="label">What about AI?</p>' +
        '<p>We teach teachers to&nbsp;use AI — and to&nbsp;teach children how to&nbsp;use it — instead of&nbsp;training AI to&nbsp;replace teachers.</p>',
      q_teachers: "For teachers",
      a_teachers:
        '<p>We start with the later years of&nbsp;primary school and the beginning of&nbsp;middle school — when many children’s interest in&nbsp;learning starts to&nbsp;fade.</p>' +
        '<p>We work on&nbsp;very practical things: how to&nbsp;get a class’s attention without raising your voice; how to&nbsp;build motivation that doesn’t run on&nbsp;grades; how to&nbsp;start a lesson with a real question; how to&nbsp;lead a discussion where children answer each other instead of&nbsp;guessing what the teacher wants to&nbsp;hear.</p>' +
        '<p>After the intensive, participants spend several weeks teaching children — and go over each week’s lessons with a mentor.</p>',
      q_leaders: "For coordinators",
      a_leaders:
        '<p>Coordinators (rakazim) keep teaching while also helping a whole team work well. It’s a hard role: leading people who don’t formally report to&nbsp;you, giving feedback that actually helps, sharing the load — and not getting buried in&nbsp;coordination.</p>' +
        '<p>We’re building this program together with rakazim. The first pilot starts in&nbsp;fall 2026.</p>' +
        '<p>The two programs are connected: strong teachers need schools where they can do good work and want to&nbsp;stay.</p>',
      q_pilot: "The first pilot",
      a_pilot:
        '<p>In&nbsp;summer 2026, 17&nbsp;teachers finished our first intensive. 16&nbsp;of&nbsp;them are now continuing paid teaching practice with children and meet with a mentor every week; 14&nbsp;of&nbsp;the&nbsp;17 would recommend the program to&nbsp;colleagues.</p>' +
        '<p>Two-thirds of&nbsp;the children we surveyed said they’d like to&nbsp;have lessons like these at&nbsp;school. For now, it’s an&nbsp;early signal from a very favorable setting — we’ll see whether it holds up in&nbsp;regular classrooms.</p>' +
        '<p><a href="https://summer-pilot-2026.utterstep.app/" target="_blank" rel="noopener">More about the first pilot</a></p>',
      q_paid: "Do participants get paid?",
      a_paid:
        '<p>Yes. Teachers have more than enough work without us, so we pay participants both for the training and for the practice with children.</p>' +
        '<p>If we believe a teacher’s time matters, it makes sense to&nbsp;act like it.</p>',
      q_who: "Who we are",
      a_who:
        '<div class="cards">' +
          '<div class="card">' +
            '<img class="card-photo" src="static/img/elena.jpg" alt="Elena Bunina" width="420" height="510" />' +
            '<p class="role">Founder &amp; Patron</p>' +
            '<p class="name"><a href="https://www.linkedin.com/in/elena-bunina-738522eb/" target="_blank" rel="noopener">Elena Bunina</a></p>' +
            '<p class="bio">Professor of&nbsp;Mathematics at&nbsp;Bar-Ilan University and head of&nbsp;<a href="https://academy.nebius.com" target="_blank" rel="noopener">Nebius Academy</a>.</p>' +
          '</div>' +
          '<div class="card">' +
            '<img class="card-photo" src="static/img/vlad.jpg" alt="Vlad Stepanov" width="420" height="510" />' +
            '<p class="role">Co-Founder &amp; CEO</p>' +
            '<p class="name"><a href="https://www.linkedin.com/in/utterstep/" target="_blank" rel="noopener">Vlad Stepanov</a></p>' +
            '<p class="bio">Former CEO of&nbsp;<a href="https://gradarius.com" target="_blank" rel="noopener">Gradarius</a>; previously CTO and Head of&nbsp;Informatika at&nbsp;Yandex Education. 13+ years in&nbsp;EdTech in&nbsp;the US and the CIS.</p>' +
          '</div>' +
        '</div>',
      q_contact: "Let’s talk",
      a_contact:
        '<p>If you’re a teacher or coordinator, represent a school or municipality, or simply want to&nbsp;see whether we could do something together — <a class="join-link" href="https://survey.morim.foundation/s/join-v1?src=landing&lang=en">leave your contact in&nbsp;the form</a> or write to&nbsp;us.</p>' +
        '<p><a href="mailto:contact@morim.foundation">contact@morim.foundation</a></p>'
    },

    ru: {
      tagline:
        "Мы делаем ставку на&nbsp;учителей",
      cta: "Хотите что-то сделать вместе?",
      q_what: "Что мы делаем",
      a_what:
        '<p>Один хороший учитель за&nbsp;свою карьеру влияет на&nbsp;сотни детей. Некоторые влияют не&nbsp;только на&nbsp;свой класс, но&nbsp;и&nbsp;на&nbsp;работу целой команды. Поэтому мы не&nbsp;пытаемся придумать новую педагогическую систему, а&nbsp;помогаем учителям и&nbsp;координаторам становиться сильнее в&nbsp;своей работе.</p>' +
        '<p>Берём подходы, которые уже хорошо работают, учимся ими пользоваться и&nbsp;проверяем их на&nbsp;практике. Больше половины программы — практика с&nbsp;настоящими детьми и&nbsp;разбор занятий с&nbsp;ментором.</p>' +
        '<p>Нас интересует не&nbsp;то, что хорошо выглядит на&nbsp;воркшопе, а&nbsp;то, что работает потом — в&nbsp;обычном классе из&nbsp;35&nbsp;человек во&nbsp;вторник утром.</p>' +
        '<p class="label">А&nbsp;что с&nbsp;ИИ?</p>' +
        '<p>Мы учим учителей пользоваться ИИ и&nbsp;учить этому детей — а&nbsp;не&nbsp;обучаем ИИ заменять учителей.</p>',
      q_teachers: "Для учителей",
      a_teachers:
        '<p>Начинаем с&nbsp;конца начальной школы и&nbsp;начала средней — времени, когда интерес к&nbsp;учёбе у&nbsp;многих детей начинает снижаться.</p>' +
        '<p>Работаем с&nbsp;очень практическими вещами: как собрать внимание класса, не&nbsp;повышая голоса; как строить мотивацию, которая не&nbsp;держится на&nbsp;оценках; как начинать урок с&nbsp;настоящего вопроса; как вести дискуссию, в&nbsp;которой дети отвечают друг другу, а&nbsp;не&nbsp;пытаются угадать, что хочет услышать учитель.</p>' +
        '<p>После интенсива участники несколько недель ведут занятия с&nbsp;детьми и&nbsp;каждую неделю разбирают занятия с&nbsp;ментором.</p>',
      q_leaders: "Для координаторов",
      a_leaders:
        '<p>Координаторы (раказим) сами продолжают преподавать и&nbsp;одновременно помогают целой команде работать лучше. Это сложная роль: нужно вести за&nbsp;собой людей, которые формально тебе не&nbsp;подчиняются, давать полезную обратную связь, распределять нагрузку и&nbsp;не&nbsp;утонуть в&nbsp;координации.</p>' +
        '<p>Эту программу мы делаем вместе с&nbsp;самими раказим. Первый пилот стартует осенью 2026 года.</p>' +
        '<p>Оба направления для нас связаны: сильным учителям нужны школы, в&nbsp;которых можно хорошо работать и&nbsp;хочется оставаться.</p>',
      q_pilot: "Первый пилот",
      a_pilot:
        '<p>Летом 2026 года первый интенсив закончили 17&nbsp;учителей. 16 из&nbsp;них сейчас продолжают оплачиваемую практику с&nbsp;детьми и&nbsp;каждую неделю встречаются с&nbsp;ментором; 14 из&nbsp;17 готовы рекомендовать программу коллегам.</p>' +
        '<p>Среди опрошенных детей две трети сказали, что хотели&nbsp;бы видеть похожие уроки в&nbsp;своей школе. Пока это ранний сигнал из&nbsp;очень дружелюбной среды. Посмотрим, повторится&nbsp;ли этот результат в&nbsp;обычных классах.</p>' +
        '<p><a href="https://summer-pilot-2026.utterstep.app/" target="_blank" rel="noopener">Подробнее о&nbsp;первом пилоте</a></p>',
      q_paid: "За участие платят?",
      a_paid:
        '<p>Да. У&nbsp;учителей и&nbsp;без нас достаточно работы, поэтому мы платим участникам и&nbsp;за&nbsp;обучение, и&nbsp;за&nbsp;практику с&nbsp;детьми.</p>' +
        '<p>Если мы считаем время учителя важным, логично вести себя соответственно.</p>',
      q_who: "Кто мы",
      a_who:
        '<div class="cards">' +
          '<div class="card">' +
            '<img class="card-photo" src="static/img/elena.jpg" alt="Елена Бунина" width="420" height="510" />' +
            '<p class="role">Основательница и попечитель</p>' +
            '<p class="name"><a href="https://www.linkedin.com/in/elena-bunina-738522eb/" target="_blank" rel="noopener">Елена Бунина</a></p>' +
            '<p class="bio">профессор математики Университета Бар-Илан и&nbsp;руководитель <a href="https://academy.nebius.com" target="_blank" rel="noopener">Nebius Academy</a>.</p>' +
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
        '<p>Если вы учитель, координатор, школа или муниципалитет — или просто хотите понять, можем&nbsp;ли мы что-то сделать вместе, — <a class="join-link" href="https://survey.morim.foundation/s/join-v1?src=landing&lang=ru">оставьте контакт в&nbsp;форме</a> или напишите нам.</p>' +
        '<p><a href="mailto:contact@morim.foundation">contact@morim.foundation</a></p>'
    },

    he: {
      tagline:
        "אנחנו מהמרים על&nbsp;המורים",
      cta: "רוצים לעשות משהו יחד?",
      q_what: "מה אנחנו עושים",
      a_what:
        '<p>מורה טוב אחד משפיע במהלך הקריירה על מאות ילדים. יש מורים שמשפיעים לא רק על הכיתה שלהם, אלא גם על העבודה של צוות שלם. לכן אנחנו לא מנסים להמציא פדגוגיה חדשה — אנחנו עוזרים למורים ולרכזים להיות טובים יותר במה שהם כבר עושים.</p>' +
        '<p>אנחנו לוקחים גישות שכבר עובדות, לומדים להשתמש בהן ובודקים אותן בפועל. יותר ממחצית מכל תוכנית היא תרגול: המשתתפים מלמדים ילדים ומנתחים את השיעורים עם מנטור.</p>' +
        '<p>לא מעניין אותנו מה נראה טוב בסדנה, אלא מה עובד אחר כך — בכיתה רגילה של 35 ילדים ביום שלישי בבוקר.</p>' +
        '<p class="label">ומה עם AI?</p>' +
        '<p>אנחנו מלמדים מורים להשתמש ב-AI — וללמד ילדים איך להשתמש בו — במקום לאמן AI להחליף מורים.</p>',
      q_teachers: "למורים",
      a_teachers:
        '<p>אנחנו מתחילים בכיתות הגבוהות של בית הספר היסודי ובתחילת חטיבת הביניים — בשנים שבהן העניין בלמידה אצל ילדים רבים מתחיל לדעוך.</p>' +
        '<p>אנחנו עובדים על דברים מאוד מעשיים: איך לרכז את הקשב של הכיתה בלי להרים את הקול; איך לבנות מוטיבציה שלא נשענת על ציונים; איך להתחיל שיעור משאלה אמיתית; איך להוביל דיון שבו הילדים עונים זה לזה במקום לנחש מה המורה רוצה לשמוע.</p>' +
        '<p>אחרי האינטנסיב המשתתפים מלמדים ילדים במשך כמה שבועות — ומנתחים את השיעורים עם מנטור מדי שבוע.</p>',
      q_leaders: "לרכזים ולרכזות",
      a_leaders:
        '<p>רכזים ורכזות ממשיכים ללמד ובמקביל עוזרים לצוות שלם לעבוד טוב יותר. זה תפקיד לא פשוט: להוביל אנשים שלא כפופים לך פורמלית, לתת משוב שבאמת עוזר, לחלק את העומס — ולא לטבוע בתיאומים.</p>' +
        '<p>את התוכנית הזאת אנחנו בונים יחד עם רכזים ורכזות. פיילוט ראשון יוצא לדרך בסתיו 2026.</p>' +
        '<p>שני הכיוונים קשורים: מורים חזקים צריכים בתי ספר שבהם הם יכולים לעבוד טוב וגם רוצים להישאר.</p>',
      q_pilot: "הפיילוט הראשון",
      a_pilot:
        '<p>בקיץ 2026 סיימו 17 מורים ומורות את האינטנסיב הראשון שלנו. 16 מהם ממשיכים כעת בהתנסות מעשית בתשלום: מלמדים ילדים ונפגשים עם מנטור מדי שבוע; 14 מתוך 17 היו ממליצים על התוכנית לעמיתים.</p>' +
        '<p>שני שלישים מהילדים שנשאלו אמרו שהיו רוצים שיעורים כאלה גם בבית הספר שלהם. בינתיים זה סימן מוקדם מסביבה תומכת במיוחד — נראה אם התוצאה הזאת תחזור על עצמה בכיתות רגילות.</p>' +
        '<p><a href="https://summer-pilot-2026.utterstep.app/" target="_blank" rel="noopener">עוד על הפיילוט הראשון</a></p>',
      q_paid: "האם משלמים על ההשתתפות?",
      a_paid:
        '<p>כן. למורים יש מספיק עבודה גם בלעדינו, ולכן אנחנו משלמים למשתתפים גם על ההכשרה וגם על התרגול עם ילדים.</p>' +
        '<p>אם אנחנו מאמינים שזמנו של מורה חשוב, הגיוני להתנהג בהתאם.</p>',
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
            '<p class="bio">לשעבר מנכ״ל <a href="https://gradarius.com" target="_blank" rel="noopener">Gradarius</a>, לשעבר CTO וראש תחום Informatika ב-Yandex Education. 13+ שנות ניסיון ב-EdTech בארה״ב ובחבר המדינות.</p>' +
          '</div>' +
        '</div>',
      q_contact: "בואו נדבר",
      a_contact:
        '<p>אם אתם מורים, רכזים או רכזות, או מייצגים בית ספר או רשות מקומית — או פשוט רוצים לבדוק אם נוכל לעשות משהו יחד — <a class="join-link" href="https://survey.morim.foundation/s/join-v1?src=landing&lang=he">השאירו פרטי קשר בטופס</a> או כתבו לנו.</p>' +
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

    var ctas = document.querySelectorAll("a.cta, a.join-link");
    for (var c = 0; c < ctas.length; c++) {
      ctas[c].setAttribute("href", "https://survey.morim.foundation/s/join-v1?src=landing&lang=" + lang);
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
