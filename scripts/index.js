// scripts/index.js - Home page (stats and clock)
(function () {
  var STORAGE_KEY = 'expenses';

  function loadExpenses() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function formatLek(n) {
    return Math.round(n).toLocaleString('en-US') + ' Lek';
  }

  function startClock() {
    var clock = document.getElementById('clock');
    if (!clock) return;
    function tick() { clock.textContent = new Date().toLocaleTimeString('en-GB'); }
    tick();
    setInterval(tick, 1000);
  }

  var expenses = loadExpenses();
  var total = expenses.reduce(function (sum, e) { return sum + e.amount; }, 0);

  document.getElementById('stat-count').textContent = expenses.length;
  document.getElementById('stat-total').textContent = formatLek(total);

  var latest = null;
  expenses.forEach(function (e) {
    if (!latest || e.date > latest.date) latest = e;
  });
  document.getElementById('stat-latest').textContent =
    latest ? latest.title + ' (' + latest.date + ')' : 'none yet';

  startClock();
})();
