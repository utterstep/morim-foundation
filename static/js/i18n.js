(function () {
  "use strict";

  var I18N = {
    en: {
      title: "Morim Foundation",
      tagline:
        "We fund and train a new kind of teacher — to win a kid’s attention in the era of cheap dopamine",
      pilot:
        "<a class=\"pilot-link\" href=\"https://summer-pilot-2026.utterstep.app/\">First pilot: Summer 2026 <span class=\"arrow\" aria-hidden=\"true\">↪</span></a>",
      q1: "Who’s behind the foundation?",
      a1:
        '<p class="role"><a href="https://www.linkedin.com/in/elena-bunina-738522eb/" target="_blank" rel="noopener">Elena Bunina</a> — Founder &amp; Patron</p>' +
        '<p class="bio">A mathematics professor at Bar Ilan University, and CEO of the <a href="https://academy.nebius.com" target="_blank" rel="noopener">Nebius Academy</a>.</p>' +
        '<p class="role"><a href="https://www.linkedin.com/in/utterstep/" target="_blank" rel="noopener">Vlad Stepanov</a> — Co-Founder &amp; CEO</p>' +
        '<p class="bio">Ex-CEO of <a href="https://gradarius.com" target="_blank" rel="noopener">Gradarius</a>, ex-CTO and head of Informatics at Yandex. 13+ years of experience in EdTech in the US and CSI.</p>',
      q3: "How can I contact you?",
      a3:
        '<p class="bio">Write to us at <a href="mailto:contact@morim.foundation">contact@morim.foundation</a> and tell us a little about yourself.</p>'
    },

    ru: {
      title: "Morim Foundation",
      tagline:
        "Мы финансируем и обучаем учителей нового типа — чтобы завоевать внимание ребёнка в эпоху дешёвого дофамина",
      pilot:
        "<a class=\"pilot-link\" href=\"https://summer-pilot-2026.utterstep.app/\">Первый пилот: лето 2026 <span class=\"arrow\" aria-hidden=\"true\">↪</span></a>",
      q1: "Кто стоит за фондом?",
      a1:
        '<p class="role"><a href="https://www.linkedin.com/in/elena-bunina-738522eb/" target="_blank" rel="noopener">Елена Бунина</a> — Основатель и попечитель</p>' +
        '<p class="bio">Профессор математики в Университете Бар-Илан и CEO <a href="https://academy.nebius.com" target="_blank" rel="noopener">Nebius Academy</a>.</p>' +
        '<p class="role"><a href="https://www.linkedin.com/in/utterstep/" target="_blank" rel="noopener">Влад Степанов</a> — Сооснователь и CEO</p>' +
        '<p class="bio">Экс-CEO <a href="https://gradarius.com" target="_blank" rel="noopener">Gradarius</a>, экс-CTO и руководитель Информатики в Яндексе. 13+ лет опыта в EdTech в США и СНГ.</p>',
      q3: "Как с вами связаться?",
      a3:
        '<p class="bio">Напишите нам на <a href="mailto:contact@morim.foundation">contact@morim.foundation</a> и немного расскажите о себе.</p>'
    },

    he: {
      title: "Morim Foundation",
      tagline:
        "אנחנו מממנים ומכשירים סוג חדש של מורים — כדי לזכות בתשומת לבו של ילד בעידן הדופמין הזול",
      pilot:
        "<a class=\"pilot-link\" href=\"https://summer-pilot-2026.utterstep.app/\">פילוט ראשון: קיץ 2026 <span class=\"arrow\" aria-hidden=\"true\">↪</span></a>",
      q1: "מי עומד מאחורי הקרן?",
      a1:
        '<p class="role"><a href="https://www.linkedin.com/in/elena-bunina-738522eb/" target="_blank" rel="noopener">אלנה בונינה</a> — מייסדת ופטרונית</p>' +
        '<p class="bio">פרופסור למתמטיקה באוניברסיטת בר-אילן ומנכ״לית <a href="https://academy.nebius.com" target="_blank" rel="noopener">Nebius Academy</a>.</p>' +
        '<p class="role"><a href="https://www.linkedin.com/in/utterstep/" target="_blank" rel="noopener">ולאד סטפנוב</a> — מייסד שותף ומנכ״ל</p>' +
        '<p class="bio">לשעבר מנכ״ל <a href="https://gradarius.com" target="_blank" rel="noopener">Gradarius</a>, לשעבר CTO וראש תחום האינפורמטיקה ב-Yandex. 13+ שנות ניסיון ב-EdTech בארה״ב ובחבר העמים.</p>',
      q3: "איך אפשר ליצור איתכם קשר?",
      a3:
        '<p class="bio">כיתבו אלינו ל- <a href="mailto:contact@morim.foundation">contact@morim.foundation</a> וספרו לנו קצת על עצמכם.</p>'
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
