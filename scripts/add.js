// scripts/add.js - Add expense page
(function () {
  var STORAGE_KEY = 'expenses';

  function loadExpenses() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveExpenses(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function showToast(message) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 2500);
  }

  function startClock() {
    var clock = document.getElementById('clock');
    if (!clock) return;
    function tick() { clock.textContent = new Date().toLocaleTimeString('en-GB'); }
    tick();
    setInterval(tick, 1000);
  }

  var form = document.getElementById('expense-form');
  var recent = document.getElementById('recent');
  var recentList = document.getElementById('recent-list');

  function todayString() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function setError(name, message) {
    var input = form.elements[name];
    var feedback = form.querySelector('.error[data-for="' + name + '"]');
    if (message) {
      input.classList.add('is-invalid');
      if (feedback) feedback.textContent = message;
    } else {
      input.classList.remove('is-invalid');
      if (feedback) feedback.textContent = '';
    }
  }

  function validate(values) {
    var ok = true;

    if (values.title.length < 2) {
      setError('title', 'Please enter a title (at least 2 characters).');
      ok = false;
    } else { setError('title', ''); }

    if (!Number.isInteger(values.amount) || values.amount < 1) {
      setError('amount', 'Amount must be a whole number of at least 1.');
      ok = false;
    } else { setError('amount', ''); }

    if (!values.category) {
      setError('category', 'Please choose a category.');
      ok = false;
    } else { setError('category', ''); }

    if (!values.date) {
      setError('date', 'Please pick a date.');
      ok = false;
    } else { setError('date', ''); }

    return ok;
  }

  function addToRecent(expense) {
    var li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center px-0';

    var left = document.createElement('span');
    left.textContent = expense.title + ' (' + expense.category + ', ' + expense.date + ')';

    var right = document.createElement('strong');
    right.textContent = expense.amount.toLocaleString('en-US') + ' Lek';

    li.appendChild(left);
    li.appendChild(right);
    recentList.insertBefore(li, recentList.firstChild);
    recent.classList.remove('d-none');
  }

  form.elements.date.value = todayString();

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var values = {
      title: form.elements.title.value.trim(),
      amount: Number(form.elements.amount.value),
      category: form.elements.category.value,
      date: form.elements.date.value
    };

    if (!validate(values)) return;

    var expense = {
      id: Date.now().toString(),
      title: values.title,
      amount: values.amount,
      category: values.category,
      date: values.date
    };

    var list = loadExpenses();
    list.push(expense);
    saveExpenses(list);

    addToRecent(expense);
    showToast('Expense added');
    form.reset();
    form.elements.date.value = todayString();
    form.elements.title.focus();
  });

  startClock();
})();
