(function () {
  "use strict";

  // ---- Lens tabs: client-side filter of the card grid. ----
  var tabsBox = document.querySelector("[data-tabs]");
  if (tabsBox) {
    var cards = document.querySelectorAll("[data-card]");
    var empty = document.querySelector("[data-empty]");
    var tabs = tabsBox.querySelectorAll(".tab");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var id = tab.dataset.tab || "";
        tabs.forEach(function (t) { t.classList.toggle("active", t === tab); });
        var shown = 0;
        cards.forEach(function (card) {
          var show = !id || hasLens(card, id);
          card.hidden = !show;
          if (show) shown++;
        });
        if (empty) empty.hidden = shown !== 0;
      });
    });
  }

  // A card belongs to a lens when any of its "lensid:stance" pairs matches.
  function hasLens(card, lensID) {
    return (card.dataset.lenses || "").split(",").some(function (pair) {
      return pair.split(":")[0] === lensID;
    });
  }

  // ---- Rank list: "ALL N STATES →" expands the hidden tail in place. ----
  var expand = document.querySelector("[data-rank-expand]");
  if (expand) {
    expand.addEventListener("click", function () {
      document.querySelectorAll("[data-rank][hidden]").forEach(function (row) {
        row.hidden = false;
      });
      expand.hidden = true;
    });
  }

  // ---- Your state (localStorage) ----
  var KEY = "your_state";
  var you = null;
  try { you = localStorage.getItem(KEY); } catch (e) { /* storage disabled */ }
  if (you && !/^[A-Z]{2}$/.test(you)) you = null; // hand-edited storage can't break selectors

  function tileFor(code) {
    return document.querySelector('[data-tile][data-code="' + code + '"]');
  }

  // Personalize the switcher strip, tile ring, and rank highlight.
  function applyYourState() {
    document.querySelectorAll("[data-tile].you").forEach(function (t) { t.classList.remove("you"); });
    document.querySelectorAll("[data-rank].you").forEach(function (r) { r.classList.remove("you"); });
    document.querySelectorAll(".swchip.you").forEach(function (c) { c.classList.remove("you"); });
    var label = document.querySelector("[data-you-label]");
    var open = document.querySelector("[data-you-open]");
    if (!you) {
      if (label) label.textContent = "NOT SET — PICK YOUR STATE";
      if (open) open.hidden = true;
      return;
    }
    var tile = tileFor(you);
    if (tile) tile.classList.add("you");
    var rank = document.querySelector('[data-rank][data-code="' + you + '"]');
    if (rank) rank.classList.add("you");
    var chip = document.querySelector('.swchip[data-pick="' + you + '"]');
    if (chip) chip.classList.add("you");
    if (label) {
      var name = you, count = "0";
      if (tile) { name = tile.dataset.name || you; count = tile.dataset.count || "0"; }
      else if (chip) { name = chip.dataset.name || you; }
      label.textContent = name.toUpperCase() + " — " + count + " REACTIONARY MOVING";
    }
    if (open) {
      open.textContent = "OPEN " + you + " →";
      open.href = "state/" + you.toLowerCase() + "/index.html";
      open.hidden = false;
    }
  }

  var change = document.querySelector("[data-you-change]");
  var picker = document.querySelector("[data-you-picker]");
  if (change && picker) {
    change.addEventListener("click", function () {
      var opening = picker.hidden;
      picker.hidden = !opening;
      change.textContent = opening ? "CLOSE" : "CHANGE";
      change.classList.toggle("open", opening);
    });
    picker.querySelectorAll("[data-pick]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        you = chip.dataset.pick;
        try { localStorage.setItem(KEY, you); } catch (e) { /* storage disabled */ }
        picker.hidden = true;
        change.textContent = "CHANGE";
        change.classList.remove("open");
        applyYourState();
      });
    });
  }
  applyYourState();

  // ---- Lens pages: collapse the state groups to the reader's state. ----
  var groups = document.querySelectorAll("[data-stategroup]");
  if (you && groups.length) {
    var mine = document.querySelector('[data-stategroup][data-state="' + you + '"]');
    if (mine) {
      groups.forEach(function (g) { g.hidden = g !== mine; });
      var gl = mine.querySelector("[data-group-label]");
      if (gl) gl.textContent = gl.textContent + " — YOUR STATE";
    }
  }
})();
