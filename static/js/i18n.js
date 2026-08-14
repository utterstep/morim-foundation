(function () {
  "use strict";

  var I18N = {
    en: {
      tagline:
        "We bet on&nbsp;teachers — serious training, real practice, lasting support",
      q_what: "What do you do?",
      a_what:
        '<p>We build our programs around three things children need most: curiosity — the energy to&nbsp;figure things out on&nbsp;your own; critical thinking — telling what matters from what doesn’t; live communication — discussing, disagreeing, listening.</p>' +
        '<p>One principle matters most to&nbsp;us: teachers don’t just study our methods — they live through them first. More than half of&nbsp;every program is practice. And we didn’t invent the toolkit — we gathered what works: inquiry, structured discussion, the craft of&nbsp;teaching, practice with real children alongside a mentor.</p>' +
        '<p class="label">On&nbsp;AI</p>' +
        '<p>We train teachers to&nbsp;use it, and to&nbsp;teach it — instead of&nbsp;training AI to&nbsp;replace teachers.</p>',
      q_pilot: "How did the first pilot go?",
      a_pilot:
        '<p>In&nbsp;summer 2026 we ran our first two-week intensive with a follow-up practice. 17&nbsp;teachers completed it; 16&nbsp;are now teaching children in&nbsp;a funded practicum with weekly mentoring; 14&nbsp;of&nbsp;the&nbsp;17 say they would recommend the program to&nbsp;colleagues.</p>' +
        '<p>Two-thirds of&nbsp;the children surveyed so far say they want their school lessons to&nbsp;be like this — an&nbsp;early signal from a friendly setting; we’ll trust it when it repeats in&nbsp;regular classrooms.</p>' +
        '<p><a href="https://summer-pilot-2026.utterstep.app/" target="_blank" rel="noopener">More about the pilot</a></p>',
      q_for: "Who are the programs for?",
      a_for:
        '<p class="label">For teachers</p>' +
        '<p>Practicing teachers in&nbsp;late primary and early middle school — the years before motivation fades. The program opens with an&nbsp;intensive on the hardest parts of&nbsp;the craft: gathering a class’s attention without raising your voice; building motivation that doesn’t run on&nbsp;grades; leading discussions where children debate with each other instead of&nbsp;guessing what the teacher wants to&nbsp;hear. Then — weeks of&nbsp;teaching real children, with a mentor to&nbsp;talk to&nbsp;every week. And then teachers bring all of&nbsp;it into their own classrooms.</p>' +
        '<p class="label">For school leaders</p>' +
        '<p>Rakazim — playing coaches who set the tone for a whole team while teaching themselves. We help with the struggles they actually face: leading a team that doesn’t report to&nbsp;you; communication that isn’t a WhatsApp flood; load that’s shared instead of&nbsp;carried alone; projects that don’t eat the time meant for teaching. We’re building the program together with rakazim; the first pilot starts this fall.</p>',
      q_paid: "Do participants get paid?",
      a_paid:
        '<p>Yes. A&nbsp;teacher’s time is precious, and there is already too much competing for it — so we pay our participants stipends, both for the training and for the practice with children. Joining shouldn’t rest on&nbsp;idealism alone.</p>',
      q_who: "Who’s behind the foundation?",
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
      q_contact: "How can I contact you?",
      a_contact:
        '<p>Write to&nbsp;us at&nbsp;<a href="mailto:contact@morim.foundation">contact@morim.foundation</a> and tell us a little about&nbsp;yourself.</p>'
    },

    ru: {
      tagline:
        "Мы ставим на&nbsp;учителей — серьёзная подготовка, настоящая практика, долгосрочная&nbsp;поддержка",
      q_what: "Чем вы занимаетесь?",
      a_what:
        '<p>Мы строим программы вокруг трёх вещей, которые нужнее всего детям: любопытство — энергия разбираться самому; критическое мышление — умение отличать важное от&nbsp;неважного; живое общение — обсуждать, спорить, слушать.</p>' +
        '<p>Для нас важен один принцип: учителя не&nbsp;просто изучают наши методы — сначала они проживают их сами. Больше половины каждой программы — практика. А&nbsp;инструменты мы не&nbsp;придумывали — собрали то, что работает: исследовательский подход, живые форматы обсуждений, ремесло преподавания, занятия с&nbsp;настоящими детьми рядом с&nbsp;ментором.</p>' +
        '<p class="label">Про ИИ</p>' +
        '<p>Мы учим учителей пользоваться ИИ — и&nbsp;учить ему, — а&nbsp;не&nbsp;обучаем ИИ заменять учителей.</p>',
      q_pilot: "Как прошёл первый пилот?",
      a_pilot:
        '<p>Летом 2026 года мы провели первый двухнедельный интенсив с&nbsp;последующей практикой. Его завершили 17&nbsp;учителей; 16 из&nbsp;них уже ведут занятия с&nbsp;детьми — это оплачиваемая практика с&nbsp;еженедельным менторингом; 14 из&nbsp;17 готовы рекомендовать программу коллегам.</p>' +
        '<p>Две трети опрошенных детей говорят, что хотели&nbsp;бы таких&nbsp;же уроков в&nbsp;школе — ранний сигнал из&nbsp;дружественной среды; мы поверим ему, когда он повторится в&nbsp;обычных классах.</p>' +
        '<p><a href="https://summer-pilot-2026.utterstep.app/" target="_blank" rel="noopener">Подробнее о&nbsp;пилоте</a></p>',
      q_for: "Для кого ваши программы?",
      a_for:
        '<p class="label">Учителям</p>' +
        '<p>Практикующим учителям в&nbsp;конце начальной и&nbsp;начале средней школы — в&nbsp;те годы, пока мотивация ещё не&nbsp;угасла. Программа начинается с&nbsp;интенсива о&nbsp;самом сложном в&nbsp;ремесле: собрать внимание класса, не&nbsp;повышая голоса; строить мотивацию, которая не&nbsp;держится на&nbsp;оценках; вести дискуссии, где дети спорят друг с&nbsp;другом, а&nbsp;не&nbsp;угадывают, что хочет услышать учитель. Затем — недели занятий с&nbsp;настоящими детьми и&nbsp;еженедельные встречи с&nbsp;ментором. А&nbsp;потом учителя приносят всё это в&nbsp;собственные классы.</p>' +
        '<p class="label">Школьным лидерам</p>' +
        '<p>Раказим (координаторам) — играющим тренерам: они задают тон всей команде и&nbsp;при этом продолжают преподавать сами. Мы помогаем с&nbsp;тем, с&nbsp;чем они сталкиваются на&nbsp;самом деле: вести за&nbsp;собой команду, которая тебе не&nbsp;подчиняется; переписка, которая не&nbsp;превращается в&nbsp;бесконечный WhatsApp; нагрузка, которую делят, а&nbsp;не&nbsp;тащат в&nbsp;одиночку; проекты, которые не&nbsp;съедают время, отведённое на&nbsp;преподавание. Программу мы делаем вместе с&nbsp;самими раказим; первый пилот стартует этой осенью.</p>',
      q_paid: "Участники получают оплату?",
      a_paid:
        '<p>Да. Время учителя — ценный ресурс, на&nbsp;который и&nbsp;так претендует слишком многое, поэтому мы платим участникам стипендию — и&nbsp;за&nbsp;обучение, и&nbsp;за&nbsp;практику с&nbsp;детьми. Участие не&nbsp;должно держаться на&nbsp;одном идеализме.</p>',
      q_who: "Кто стоит за фондом?",
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
      q_contact: "Как с вами связаться?",
      a_contact:
        '<p>Напишите нам на&nbsp;<a href="mailto:contact@morim.foundation">contact@morim.foundation</a> и&nbsp;немного расскажите о&nbsp;себе.</p>'
    },

    he: {
      tagline:
        "אנחנו מהמרים על&nbsp;המורים — הכשרה רצינית, תרגול אמיתי, ליווי מתמשך",
      q_what: "מה אתם עושים?",
      a_what:
        '<p>אנחנו בונים תוכניות סביב שלושה דברים שילדים צריכים יותר מכול: סקרנות — האנרגיה להבין דברים בעצמך; חשיבה ביקורתית — להבחין בין עיקר לטפל; שיח חי — לדון, להתווכח, להקשיב.</p>' +
        '<p>עיקרון אחד חשוב לנו במיוחד: מורים לא רק לומדים את השיטות שלנו — הם קודם חווים אותן בעצמם. יותר ממחצית מכל תוכנית היא תרגול. ואת הכלים לא המצאנו — אספנו את מה שעובד: למידת חקר, דיונים סביב שולחן, אומנות ההוראה, תרגול עם ילדים אמיתיים לצד מנטור.</p>' +
        '<p class="label">על AI</p>' +
        '<p>אנחנו מכשירים מורים להשתמש בו — וללמד אותו — במקום לאמן AI להחליף מורים.</p>',
      q_pilot: "איך עבר הפיילוט הראשון?",
      a_pilot:
        '<p>בקיץ 2026 קיימנו את האינטנסיב הראשון שלנו — שבועיים, ואחריהם תקופת תרגול. 17 מורים ומורות סיימו אותו; 16 מהם כבר מלמדים ילדים בפרקטיקום ממומן עם ליווי שבועי; 14 מתוך 17 היו ממליצים על התוכנית לעמיתים.</p>' +
        '<p>שני שלישים מהילדים שנשאלו עד כה אומרים שהיו רוצים שהשיעורים בבית הספר יהיו כאלה — סימן מוקדם מסביבה אוהדת; נאמין לו כשיחזור על עצמו בכיתות רגילות.</p>' +
        '<p><a href="https://summer-pilot-2026.utterstep.app/" target="_blank" rel="noopener">עוד על הפיילוט</a></p>',
      q_for: "למי מיועדות התוכניות?",
      a_for:
        '<p class="label">למורים</p>' +
        '<p>מורים בפועל בסוף היסודי ובתחילת חטיבת הביניים — השנים שבהן המוטיבציה עוד לא דעכה. התוכנית נפתחת באינטנסיב על החלקים הקשים ביותר במקצוע: לאסוף את תשומת הלב של הכיתה בלי להרים את הקול; לבנות מוטיבציה שלא נשענת על ציונים; להוביל דיונים שבהם הילדים מתווכחים זה עם זה במקום לנחש מה המורה רוצה לשמוע. ואז — שבועות של הוראת ילדים אמיתיים, עם מנטור לצידם מדי שבוע. ואחר כך המורים מביאים את כל זה לכיתות שלהם.</p>' +
        '<p class="label">לרכזים ולרכזות</p>' +
        '<p>רכזים ורכזות — מאמנים-שחקנים: נותנים את הטון לצוות שלם ובעצמם ממשיכים ללמד. אנחנו עוזרים במה שהם באמת מתמודדים איתו: להוביל צוות שלא כפוף לך; תקשורת שאינה הצפה בוואטסאפ; עומס שמתחלק במקום ליפול על אדם אחד; פרויקטים שלא אוכלים את הזמן שנועד להוראה. את התוכנית אנחנו בונים יחד עם רכזים; פיילוט ראשון יוצא לדרך בסתיו הקרוב.</p>',
      q_paid: "האם המשתתפים מקבלים תשלום?",
      a_paid:
        '<p>כן. זמנו של מורה הוא משאב יקר, וכבר עכשיו מתחרים עליו יותר מדי — ולכן אנחנו משלמים למשתתפים מלגה, גם על ההכשרה וגם על התרגול עם ילדים. הצטרפות לא צריכה להישען על אידיאליזם בלבד.</p>',
      q_who: "מי עומד מאחורי הקרן?",
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
      q_contact: "איך אפשר ליצור איתכם קשר?",
      a_contact:
        '<p>כיתבו אלינו ל-&nbsp;<a href="mailto:contact@morim.foundation">contact@morim.foundation</a> וספרו לנו קצת על&nbsp;עצמכם.</p>'
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
