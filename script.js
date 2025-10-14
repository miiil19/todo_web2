document.addEventListener("DOMContentLoaded", () => {
    const container = document.createElement("div");
    container.className = "main-wrapper";
    document.body.append(container);

    const title = document.createElement("h1");
    title.className = "main-title";
    title.textContent = "Мой ToDo лист";
    container.append(title);

    const inputSection = document.createElement("div");
    inputSection.className = "contr-section";

    const taskInput = document.createElement("input");
    taskInput.type = "text";
    taskInput.placeholder = "Введите задачу...";

    const dateInput = document.createElement("input");
    dateInput.type = "date";

    const addButton = document.createElement("button");
    addButton.textContent = "Добавить задачу";

    inputSection.append(taskInput, dateInput, addButton);
    container.append(inputSection);

    const filters = document.createElement("div");
    filters.className = "filters";

    const searchInput = document.createElement("input");
    searchInput.placeholder = "Поиск по названию";

    const statusFilter = document.createElement("select");
    const optAll = new Option("Все", "all");
    const optDone = new Option("Выполненные", "done");
    const optUndone = new Option("Невыполненные", "undone");
    statusFilter.append(optAll, optDone, optUndone);

    const sortButton = document.createElement("button");
    sortButton.textContent = "Сортировать по дате";

    filters.append(searchInput, statusFilter, sortButton);
    container.append(filters);

    const taskList = document.createElement("ul");
    taskList.className = "task-list";
    container.append(taskList);

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function renderTasks() {
        taskList.innerHTML = "";
        const filtered = tasks
            .filter(task => {
                if (statusFilter.value == "done") return task.completed;
                if (statusFilter.value == "undone") return !task.completed;
                return true;
            })
            .filter(task =>
                task.text.toLowerCase().includes(searchInput.value.toLowerCase())
            );

        filtered.forEach(task => {
            const li = document.createElement("li");
            li.className = "todo-item";
            if (task.completed) li.classList.add("completed");
            li.draggable = true;           

            const text = document.createElement("span");
            text.className = "todo-text";
            text.textContent = task.text;

            const date = document.createElement("span");
            date.className = "todo-date";
            date.textContent = task.date || "";

            const btnGroup = document.createElement("div");
            btnGroup.className = "todo-act";

            const completeBtn = document.createElement("button");
            completeBtn.textContent = "✓";
            completeBtn.className = "btn-complete";
            completeBtn.onclick = () => {
                task.completed = !task.completed;
                saveTasks();
                renderTasks();
            };

            const editBtn = document.createElement("button");
            editBtn.textContent = "✎";
            editBtn.onclick = () => {
                const editInput = document.createElement("input");
                editInput.type = "text";
                editInput.value = task.text;
                editInput.className = "edit-input";

                const editDate = document.createElement("input");
                editDate.type = "date";
                editDate.value = task.date || "";
                editDate.className = "edit-date";

                const saveBtn = document.createElement("button");
                saveBtn.textContent = "💾";
                saveBtn.className = "btn-save";

                const cancelBtn = document.createElement("button");
                cancelBtn.textContent = "✗";
                cancelBtn.className = "btn-delete";

                li.innerHTML = "";
                li.append(editInput, editDate, saveBtn, cancelBtn);

                saveBtn.onclick = () => {
                    const newText = editInput.value.trim();
                    const newDate = editDate.value;
                    if (newText) {
                        task.text = newText;
                        task.date = newDate;
                        saveTasks();
                        renderTasks();
                    }
                };

                cancelBtn.onclick = () => {
                    renderTasks();
                };
            };

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "✗";
            deleteBtn.className = "btn-delete";
            deleteBtn.onclick = () => {
                tasks = tasks.filter(t => t.id !== task.id);
                saveTasks();
                renderTasks();
            };

            btnGroup.append(completeBtn, editBtn, deleteBtn);
            li.append(text, date, btnGroup);
            taskList.append(li);

            li.addEventListener("dragstart", () => {
                li.classList.add("dragging");
            });
            li.addEventListener("dragend", () => {
                li.classList.remove("dragging");
                const newOrder = Array.from(taskList.children).map(item => {
                    const found = filtered.find(t => t.text === item.querySelector(".todo-text").textContent);
                    return found;
                });
                tasks = newOrder.concat(tasks.filter(t => !filtered.includes(t)));
                saveTasks();
            });
        });               
    }

    addButton.addEventListener("click", () => {
        if (taskInput.value.trim() === "") return;
        const newTask = {
            id: Date.now(),
            text: taskInput.value.trim(),
            date: dateInput.value,
            completed: false
        };
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        taskInput.value = "";
        dateInput.value = "";
    });

    sortButton.addEventListener("click", () => {
        tasks.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
        saveTasks();
        renderTasks();
    });

    searchInput.addEventListener("input", renderTasks);
    statusFilter.addEventListener("change", renderTasks);

    taskList.addEventListener("dragover", e => {
        e.preventDefault();
        const dragging = document.querySelector(".dragging");
        const afterElement = getDragAfterElement(taskList, e.clientY);
        if (afterElement == null) {
            taskList.appendChild(dragging);
        } else {
            taskList.insertBefore(dragging, afterElement);
        }
    });
        
        
        
    function getDragAfterElement(container, y) {
        const elements = [...container.querySelectorAll(".todo-item:not(.dragging)")];
        return elements.reduce(
            (closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            },
            { offset: Number.NEGATIVE_INFINITY }
        ).element;
    }
    renderTasks();
});