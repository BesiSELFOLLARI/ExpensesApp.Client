// scripts/expenses.js - Expenses page (list, stats, filter, edit, delete)
(function () {
  var STORAGE_KEY = 'expenses';

  var SAMPLE_DATA = [
    { id: 's1', title: 'Coffee with friends', amount: 350, category: 'Food', date: '2026-11-02' },
    { id: 's2', title: 'Bus ticket', amount: 40, category: 'Transport', date: '2026-11-03' },
    { id: 's3', title: 'Textbook', amount: 2500, category: 'Books', date: '2026-11-04' },
    { id: 's4', title: 'Cinema', amount: 600, category: 'Fun', date: '2026-11-06' }
  ];

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

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatLek(n) {
    return Math.round(n).toLocaleString('en-US') + ' Lek';
  }

  var expenses = loadExpenses();

  var listEl = document.getElementById('expense-list');
  var emptyMessage = document.getElementById('empty-message');
  var searchEl = document.getElementById('search');
  var filterEl = document.getElementById('filter-category');
  var countBadge = document.getElementById('count');

  var editModalEl = document.getElementById('edit-modal');
  var editForm = document.getElementById('edit-form');
  var editModal = bootstrap.Modal.getOrCreateInstance(editModalEl);

  // ---------- Stats ----------
  function renderStats() {
    var total = expenses.reduce(function (sum, e) { return sum + e.amount; }, 0);
    var count = expenses.length;

    document.getElementById('stat-total').textContent = formatLek(total);
    document.getElementById('stat-count').textContent = count;
    document.getElementById('stat-average').textContent = count ? formatLek(total / count) : '0 Lek';

    var biggest = null;
    expenses.forEach(function (e) {
      if (!biggest || e.amount > biggest.amount) biggest = e;
    });
    document.getElementById('stat-biggest').textContent =
      biggest ? biggest.title + ' (' + formatLek(biggest.amount) + ')' : 'none';
  }

  // ---------- List ----------
  function getFiltered() {
    var query = searchEl.value.trim().toLowerCase();
    var category = filterEl.value;

    return expenses
      .filter(function (e) {
        var matchesTitle = e.title.toLowerCase().indexOf(query) !== -1;
        var matchesCategory = !category || e.category === category;
        return matchesTitle && matchesCategory;
      })
      .sort(function (a, b) {
        return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
      });
  }

  function renderList() {
    var filtered = getFiltered();

    if (filtered.length === 0 && expenses.length > 0) {
      listEl.innerHTML = '<tr><td colspan="5" class="text-center text-secondary py-4">No expenses match your search.</td></tr>';
    } else {
      listEl.innerHTML = filtered.map(function (e) {
        return '<tr>' +
          '<td>' + escapeHtml(e.date) + '</td>' +
          '<td>' + escapeHtml(e.title) + '</td>' +
          '<td><span class="badge text-bg-light border">' + escapeHtml(e.category) + '</span></td>' +
          '<td class="text-end">' + formatLek(e.amount) + '</td>' +
          '<td class="text-end text-nowrap">' +
            '<button type="button" class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="' + escapeHtml(e.id) + '">Edit</button>' +
            '<button type="button" class="btn btn-sm btn-outline-danger" data-action="delete" data-id="' + escapeHtml(e.id) + '">Delete</button>' +
          '</td>' +
        '</tr>';
      }).join('');
    }

    countBadge.textContent = filtered.length;
    emptyMessage.classList.toggle('d-none', expenses.length > 0);
  }

  function render() {
    renderStats();
    renderList();
  }

  // ---------- Validation ----------
  function setError(name, message) {
    var input = editForm.elements[name];
    var feedback = editForm.querySelector('.error[data-for="' + name + '"]');
    if (message) {
      input.classList.add('is-invalid');
      if (feedback) feedback.textContent = message;
    } else {
      input.classList.remove('is-invalid');
      if (feedback) feedback.textContent = '';
    }
  }

  function clearErrors() {
    ['title', 'amount', 'category', 'date'].forEach(function (n) { setError(n, ''); });
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

  // ---------- Edit / Delete ----------
  function openEdit(id) {
    var expense = expenses.find(function (e) { return e.id === id; });
    if (!expense) return;

    clearErrors();
    document.getElementById('edit-id').value = expense.id;
    document.getElementById('edit-title').value = expense.title;
    document.getElementById('edit-amount').value = expense.amount;
    document.getElementById('edit-category').value = expense.category;
    document.getElementById('edit-date').value = expense.date;
    editModal.show();
  }

  function deleteExpense(id) {
    var expense = expenses.find(function (e) { return e.id === id; });
    if (!expense) return;
    if (!confirm('Delete "' + expense.title + '"?')) return;

    expenses = expenses.filter(function (e) { return e.id !== id; });
    saveExpenses(expenses);
    render();
    showToast('Expense deleted');
  }

  listEl.addEventListener('click', function (event) {
    var button = event.target.closest('button[data-action]');
    if (!button) return;
    var id = button.getAttribute('data-id');
    if (button.getAttribute('data-action') === 'edit') openEdit(id);
    if (button.getAttribute('data-action') === 'delete') deleteExpense(id);
  });

  editForm.addEventListener('submit', function (event) {
    event.preventDefault();

    var values = {
      title: document.getElementById('edit-title').value.trim(),
      amount: Number(document.getElementById('edit-amount').value),
      category: document.getElementById('edit-category').value,
      date: document.getElementById('edit-date').value
    };

    if (!validate(values)) return;

    var id = document.getElementById('edit-id').value;
    expenses = expenses.map(function (e) {
      return e.id === id
        ? { id: e.id, title: values.title, amount: values.amount, category: values.category, date: values.date }
        : e;
    });

    saveExpenses(expenses);
    editModal.hide();
    render();
    showToast('Expense updated');
  });

  // ---------- Filters, sample data, delete all ----------
  searchEl.addEventListener('input', renderList);
  filterEl.addEventListener('change', renderList);

  document.getElementById('load-sample').addEventListener('click', function () {
    expenses = expenses.concat(SAMPLE_DATA.map(function (e) {
      return { id: e.id + '-' + Date.now(), title: e.title, amount: e.amount, category: e.category, date: e.date };
    }));
    saveExpenses(expenses);
    render();
    showToast('Sample data loaded');
  });

  document.getElementById('clear-all').addEventListener('click', function () {
    if (expenses.length === 0) return;
    if (!confirm('Delete all expenses? This cannot be undone.')) return;
    expenses = [];
    saveExpenses(expenses);
    render();
    showToast('All expenses deleted');
  });

  startClock();
  render();
})();
