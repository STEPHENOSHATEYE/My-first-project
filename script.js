document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const emptyState = document.getElementById('empty-state');
    const itemsLeft = document.getElementById('items-left');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const dateDisplay = document.getElementById('date-display');

    // App State
    let todos = [];
    let currentFilter = 'all';

    // Set formatting for Date
    const setDate = () => {
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        const today = new Date();
        dateDisplay.textContent = today.toLocaleDateString('en-US', options);
    };

    // Load from Local Storage
    const loadTodos = () => {
        const storedTodos = localStorage.getItem('todos');
        if (storedTodos) {
            todos = JSON.parse(storedTodos);
        }
        renderTodos();
    };

    // Save to Local Storage
    const saveTodos = () => {
        localStorage.setItem('todos', JSON.stringify(todos));
        updateStats();
        checkEmptyState();
    };

    // Add new Todo
    const addTodo = () => {
        const text = todoInput.value.trim();
        if (text !== '') {
            const newTodo = {
                id: Date.now().toString(),
                text: text,
                completed: false
            };
            todos.unshift(newTodo);
            todoInput.value = '';
            
            if (currentFilter === 'completed') {
                currentFilter = 'all';
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelector('[data-filter="all"]').classList.add('active');
            }
            
            saveTodos();
            renderTodos();
        }
    };

    // Toggle Todo Complete Status
    const toggleTodo = (id) => {
        todos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        saveTodos();
        renderTodos();
    };

    // Delete Todo
    const deleteTodo = (id, element) => {
        // Add fade out animation before removing
        element.classList.add('fadeOut');
        
        setTimeout(() => {
            todos = todos.filter(todo => todo.id !== id);
            saveTodos();
            renderTodos();
        }, 300);
    };

    // Clear Completed Todos
    const clearCompleted = () => {
        const completedElements = document.querySelectorAll('.todo-item.completed');
        
        completedElements.forEach(el => {
            el.classList.add('fadeOut');
        });

        setTimeout(() => {
            todos = todos.filter(todo => !todo.completed);
            saveTodos();
            renderTodos();
        }, 300);
    };

    // Update Items Left Counter
    const updateStats = () => {
        const activeTodos = todos.filter(todo => !todo.completed).length;
        itemsLeft.textContent = `${activeTodos} item${activeTodos !== 1 ? 's' : ''} left`;
        
        const hasCompleted = todos.some(todo => todo.completed);
        clearCompletedBtn.style.display = hasCompleted ? 'inline-block' : 'none';
        clearCompletedBtn.style.opacity = hasCompleted ? '1' : '0';
    };

    // Check and update empty state display
    const checkEmptyState = () => {
        const filteredTodos = getFilteredTodos();
        if (filteredTodos.length === 0) {
            emptyState.style.display = 'flex';
            todoList.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            todoList.style.display = 'block';
        }
    };

    // Get filtered todos based on current state
    const getFilteredTodos = () => {
        switch (currentFilter) {
            case 'active':
                return todos.filter(todo => !todo.completed);
            case 'completed':
                return todos.filter(todo => todo.completed);
            default:
                return todos;
        }
    };

    // Render Todos to DOM
    const renderTodos = () => {
        todoList.innerHTML = '';
        const filteredTodos = getFilteredTodos();

        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.dataset.id = todo.id;

            li.innerHTML = `
                <div class="checkbox-container">
                    <input type="checkbox" ${todo.completed ? 'checked' : ''} class="todo-checkbox">
                    <span class="checkmark"></span>
                </div>
                <span class="todo-text">${escapeHTML(todo.text)}</span>
                <button class="delete-btn" aria-label="Delete todo">
                    <ion-icon name="trash-outline"></ion-icon>
                </button>
            `;

            // Event listener for checkbox
            const checkbox = li.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', () => toggleTodo(todo.id));

            // Event listener for delete button
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id, li));

            todoList.appendChild(li);
        });

        updateStats();
        checkEmptyState();
    };

    // Helper to escape HTML and prevent XSS
    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    // Event Listeners
    addBtn.addEventListener('click', addTodo);

    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    clearCompletedBtn.addEventListener('click', clearCompleted);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTodos();
        });
    });

    // Initialize App
    setDate();
    loadTodos();
});
