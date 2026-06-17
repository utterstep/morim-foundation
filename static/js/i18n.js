(function () {
  "use strict";

  var I18N = {
    en: {
      title: "Morim Foundation",
      tagline:
        "We fund and train a new kind of&nbsp;teacher, to&nbsp;win a kid’s attention in&nbsp;the era of&nbsp;cheap dopamine",
      pilot:
        "<a class=\"pilot-link\" href=\"https://summer-pilot-2026.utterstep.app/\">First pilot: Summer 2026 <span class=\"arrow\" aria-hidden=\"true\">↪︎</span></a>",
      q1: "Who’s behind the foundation?",
      a1:
        '<p class="role">Founder &amp; Patron</p>' +
        '<p class="bio"><a href="https://www.linkedin.com/in/elena-bunina-738522eb/" target="_blank" rel="noopener">Elena Bunina</a>, a mathematics professor at&nbsp;Bar Ilan University, and head of&nbsp;the <a href="https://academy.nebius.com" target="_blank" rel="noopener">Nebius Academy</a>.</p>' +
        '<p class="role">Co-Founder &amp; CEO</p>' +
        '<p class="bio"><a href="https://www.linkedin.com/in/utterstep/" target="_blank" rel="noopener">Vlad Stepanov</a>, ex-CEO of&nbsp;<a href="https://gradarius.com" target="_blank" rel="noopener">Gradarius</a>, ex-CTO and head of&nbsp;Informatika at&nbsp;Yandex Education. 13+ years of&nbsp;experience in&nbsp;EdTech in&nbsp;the US and CSI.</p>',
      q3: "How can I contact you?",
      a3:
        '<p class="bio">Write to&nbsp;us at&nbsp;<a href="mailto:contact@morim.foundation">contact@morim.foundation</a> and tell us a little about&nbsp;yourself.</p>'
    },

    ru: {
      title: "Morim Foundation",
      tagline:
        "Мы финансируем и&nbsp;обучаем учителей нового типа, чтобы завоевать внимание ребёнка в&nbsp;эпоху дешёвого дофамина",
      pilot:
        "<a class=\"pilot-link\" href=\"https://summer-pilot-2026.utterstep.app/\">Первый пилот: лето 2026 <span class=\"arrow\" aria-hidden=\"true\">↪︎</span></a>",
      q1: "Кто стоит за фондом?",
      a1:
        '<p class="role">Основатель и попечитель</p>' +
        '<p class="bio"><a href="https://www.linkedin.com/in/elena-bunina-738522eb/" target="_blank" rel="noopener">Елена Бунина</a>, профессор математики в&nbsp;Университете Бар-Илан и&nbsp;руководитель <a href="https://academy.nebius.com" target="_blank" rel="noopener">Nebius Academy</a>.</p>' +
        '<p class="role">Сооснователь и CEO</p>' +
        '<p class="bio"><a href="https://www.linkedin.com/in/utterstep/" target="_blank" rel="noopener">Влад Степанов</a>, экс-CEO <a href="https://gradarius.com" target="_blank" rel="noopener">Gradarius</a>, экс-CTO и&nbsp;руководитель Информатики в&nbsp;Яндекс.Образовании. 13+ лет опыта в&nbsp;EdTech в&nbsp;США и&nbsp;СНГ.</p>',
      q3: "Как с вами связаться?",
      a3:
        '<p class="bio">Напишите нам на&nbsp;<a href="mailto:contact@morim.foundation">contact@morim.foundation</a> и&nbsp;немного расскажите о&nbsp;себе.</p>'
    },

    he: {
      title: "Morim Foundation",
      tagline:
        "אנחנו מממנים ומכשירים סוג חדש של&nbsp;מורים, כדי לזכות בתשומת לבו של&nbsp;ילד בעידן הדופמין הזול",
      pilot:
        "<a class=\"pilot-link\" href=\"https://summer-pilot-2026.utterstep.app/\">פילוט ראשון: קיץ 2026 <span class=\"arrow\" aria-hidden=\"true\">↪︎</span></a>",
      q1: "מי עומד מאחורי הקרן?",
      a1:
        '<p class="role">מייסדת ופטרונית</p>' +
        '<p class="bio"><a href="https://www.linkedin.com/in/elena-bunina-738522eb/" target="_blank" rel="noopener">אלנה בונינה</a>, פרופסור למתמטיקה באוניברסיטת בר-אילן וראש <a href="https://academy.nebius.com" target="_blank" rel="noopener">Nebius Academy</a>.</p>' +
        '<p class="role">מייסד שותף ומנכ״ל</p>' +
        '<p class="bio"><a href="https://www.linkedin.com/in/utterstep/" target="_blank" rel="noopener">ולאד סטפנוב</a>, לשעבר מנכ״ל <a href="https://gradarius.com" target="_blank" rel="noopener">Gradarius</a>, לשעבר CTO וראש תחום Informatika ב-Yandex Education. 13+ שנות ניסיון ב-EdTech בארה״ב ובחבר העמים.</p>',
      q3: "איך אפשר ליצור איתכם קשר?",
      a3:
        '<p class="bio">כיתבו אלינו ל-&nbsp;<a href="mailto:contact@morim.foundation">contact@morim.foundation</a> וספרו לנו קצת על&nbsp;עצמכם.</p>'
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
