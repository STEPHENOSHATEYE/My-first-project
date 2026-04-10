document.addEventListener('DOMContentLoaded', () => {
    const foodInput = document.getElementById('food-input');
    const caloriesInput = document.getElementById('calories-input');
    const addBtn = document.getElementById('add-btn');
    const foodList = document.getElementById('food-list');
    const emptyState = document.getElementById('empty-state');
    const caloriesConsumed = document.getElementById('calories-consumed');
    const progressBar = document.getElementById('progress-bar');
    const remainingCalories = document.getElementById('remaining-calories');
    const dailyGoalEl = document.getElementById('daily-goal');
    const goalBtn = document.getElementById('goal-btn');
    const goalModal = document.getElementById('goal-modal');
    const closeModal = document.getElementById('close-modal');
    const goalInput = document.getElementById('goal-input');
    const saveGoal = document.getElementById('save-goal');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const dateDisplay = document.getElementById('date-display');

    let entries = [];
    let dailyGoal = 2000;
    let currentFilter = 'today';

    const getTodayDate = () => {
        const now = new Date();
        return now.toISOString().split('T')[0];
    };

    const getTodayTime = () => {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const setDate = () => {
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        const today = new Date();
        dateDisplay.textContent = today.toLocaleDateString('en-US', options);
    };

    const loadData = () => {
        const storedEntries = localStorage.getItem('calorieEntries');
        const storedGoal = localStorage.getItem('dailyGoal');

        if (storedEntries) {
            entries = JSON.parse(storedEntries);
        }
        if (storedGoal) {
            dailyGoal = parseInt(storedGoal, 10);
        }

        renderEntries();
        updateSummary();
    };

    const saveData = () => {
        localStorage.setItem('calorieEntries', JSON.stringify(entries));
        localStorage.setItem('dailyGoal', dailyGoal.toString());
        updateSummary();
    };

    const getTodayEntries = () => {
        const today = getTodayDate();
        return entries.filter(entry => entry.date === today);
    };

    const getFilteredEntries = () => {
        if (currentFilter === 'today') {
            return getTodayEntries();
        }
        return entries;
    };

    const addEntry = () => {
        const foodName = foodInput.value.trim();
        const calories = parseInt(caloriesInput.value, 10);

        if (foodName !== '' && calories > 0) {
            const newEntry = {
                id: Date.now().toString(),
                name: foodName,
                calories: calories,
                date: getTodayDate(),
                time: getTodayTime()
            };

            entries.unshift(newEntry);
            foodInput.value = '';
            caloriesInput.value = '';

            saveData();
            renderEntries();
        }
    };

    const deleteEntry = (id, element) => {
        element.classList.add('fadeOut');

        setTimeout(() => {
            entries = entries.filter(entry => entry.id !== id);
            saveData();
            renderEntries();
        }, 300);
    };

    const updateSummary = () => {
        const todayEntries = getTodayEntries();
        const totalConsumed = todayEntries.reduce((sum, entry) => sum + entry.calories, 0);
        const remaining = dailyGoal - totalConsumed;
        const percentage = Math.min((totalConsumed / dailyGoal) * 100, 100);

        caloriesConsumed.textContent = totalConsumed.toLocaleString();
        progressBar.value = percentage;
        remainingCalories.textContent = remaining.toLocaleString();
        dailyGoalEl.textContent = dailyGoal.toLocaleString();
    };

    const checkEmptyState = () => {
        const filteredEntries = getFilteredEntries();
        if (filteredEntries.length === 0) {
            emptyState.style.display = 'flex';
            foodList.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            foodList.style.display = 'block';
        }
    };

    const renderEntries = () => {
        foodList.innerHTML = '';
        const filteredEntries = getFilteredEntries();

        filteredEntries.forEach(entry => {
            const li = document.createElement('li');
            li.className = 'food-item';
            li.dataset.id = entry.id;

            li.innerHTML = `
                <div class="food-info">
                    <span class="food-name">${escapeHTML(entry.name)}</span>
                    <span class="food-time">${entry.date === getTodayDate() ? 'Today' : entry.date} at ${entry.time}</span>
                </div>
                <div class="food-calories">
                    <span class="calories-badge">${entry.calories} cal</span>
                    <button class="delete-btn" aria-label="Delete entry">
                        <ion-icon name="trash-outline"></ion-icon>
                    </button>
                </div>
            `;

            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteEntry(entry.id, li));

            foodList.appendChild(li);
        });

        checkEmptyState();
    };

    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    const openGoalModal = () => {
        goalInput.value = dailyGoal;
        goalModal.classList.add('active');
    };

    const closeGoalModal = () => {
        goalModal.classList.remove('active');
    };

    const saveGoalHandler = () => {
        const newGoal = parseInt(goalInput.value, 10);
        if (newGoal >= 500 && newGoal <= 10000) {
            dailyGoal = newGoal;
            saveData();
            closeGoalModal();
        }
    };

    addBtn.addEventListener('click', addEntry);

    foodInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addEntry();
        }
    });

    caloriesInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addEntry();
        }
    });

    goalBtn.addEventListener('click', openGoalModal);
    closeModal.addEventListener('click', closeGoalModal);
    saveGoal.addEventListener('click', saveGoalHandler);

    goalModal.addEventListener('click', (e) => {
        if (e.target === goalModal) {
            closeGoalModal();
        }
    });

    goalInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveGoalHandler();
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderEntries();
        });
    });

    setDate();
    loadData();
});