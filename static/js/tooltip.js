(function () {
  "use strict";

  // Only links that open in a new tab get the hint.
  var SELECTOR = 'a[target="_blank"]';

  var tip = document.createElement("div");
  tip.className = "tab-tip";
  tip.textContent = "Open in a new tab";
  tip.setAttribute("aria-hidden", "true");
  document.body.appendChild(tip);

  var visible = false;

  function place(e) {
    tip.style.left = (e.clientX + 14) + "px";
    tip.style.top = (e.clientY + 16) + "px";
  }
  function show(e) { place(e); if (!visible) { tip.classList.add("is-visible"); visible = true; } }
  function hide() { if (visible) { tip.classList.remove("is-visible"); visible = false; } }

  function inLink(node) { return node && node.closest ? node.closest(SELECTOR) : null; }

  // Delegated: works even after i18n re-renders the links.
  document.addEventListener("mouseover", function (e) { if (inLink(e.target)) show(e); });
  document.addEventListener("mousemove", function (e) { if (visible && inLink(e.target)) place(e); });
  document.addEventListener("mouseout", function (e) {
    if (inLink(e.target) && !inLink(e.relatedTarget)) hide();
  });
})();
