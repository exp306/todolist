
"use strict";

/* =========================================
   GET HTML ELEMENTS
========================================= */

const taskInput = document.getElementById("taskInput");
const taskTime = document.getElementById("taskTime");
const taskPriority = document.getElementById("taskPriority");

const addButton = document.getElementById("addButton");

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const taskCount = document.getElementById("taskCount");

const searchInput = document.getElementById("searchInput");

const filterButtons = document.querySelectorAll(".filter");
const navigationButtons = document.querySelectorAll(".nav-item");

const pageTitle = document.getElementById("pageTitle");
const pageDescription = document.getElementById("pageDescription");


/* =========================================
   APP STATE
========================================= */

let tasks = [];

let currentPage = "all";
let currentFilter = "all";


/* =========================================
   LOCAL STORAGE
========================================= */

function loadTasks() {

    const savedTasks = localStorage.getItem("taskflowTasks");

    if (!savedTasks) {
        tasks = [];
        return;
    }

    try {

        tasks = JSON.parse(savedTasks);

        // Make sure the stored data is actually an array
        if (!Array.isArray(tasks)) {
            tasks = [];
        }

    } catch (error) {

        console.error("Failed to load tasks:", error);

        tasks = [];
    }
}


function saveTasks() {

    localStorage.setItem(
        "taskflowTasks",
        JSON.stringify(tasks)
    );
}


/* =========================================
   ADD TASK
========================================= */

function addTask() {

    const title = taskInput.value.trim();
    const time = taskTime.value;
    const priority = taskPriority.value;


    // Check task title
    if (title === "") {

        alert("Please write a task first.");

        taskInput.focus();

        return;
    }


    // Check time
    if (time === "") {

        alert("Please select a time.");

        taskTime.focus();

        return;
    }


    // Create new task
    const newTask = {

        id: Date.now(),

        title: title,

        time: time,

        priority: priority,

        completed: false,

        createdAt: new Date().toLocaleDateString("en-GB")
    };


    // Add task to array
    tasks.push(newTask);


    // Save to localStorage
    saveTasks();


    // Return user to All Tasks
    currentPage = "all";
    currentFilter = "all";


    // Clear search
    searchInput.value = "";


    // Update UI
    updateNavigation();

    updateFilters();

    updatePage();

    renderTasks();


    // Clear input fields
    taskInput.value = "";

    taskTime.value = "";

    taskPriority.value = "medium";


    // Focus input again
    taskInput.focus();
}


/* =========================================
   COMPLETE TASK
========================================= */

function completeTask(id) {

    const task = tasks.find(function (item) {

        return item.id === id;

    });


    if (!task) {
        return;
    }


    // Prevent changing an already completed task
    if (task.completed) {
        return;
    }


    task.completed = true;


    saveTasks();

    renderTasks();
}


/* =========================================
   DELETE TASK
========================================= */

function deleteTask(id) {

    const task = tasks.find(function (item) {

        return item.id === id;

    });


    if (!task) {
        return;
    }


    const confirmation = confirm(
        "Are you sure you want to delete this task?"
    );


    if (!confirmation) {
        return;
    }


    tasks = tasks.filter(function (item) {

        return item.id !== id;

    });


    saveTasks();

    renderTasks();
}


/* =========================================
   EDIT TASK
========================================= */

function editTask(id) {

    const task = tasks.find(function (item) {

        return item.id === id;

    });


    if (!task) {
        return;
    }


    // Completed tasks cannot be edited
    if (task.completed) {

        alert("Completed tasks cannot be edited.");

        return;
    }


    /* ---------- EDIT TITLE ---------- */

    const newTitle = prompt(
        "Edit task:",
        task.title
    );


    if (newTitle === null) {
        return;
    }


    const cleanTitle = newTitle.trim();


    if (cleanTitle === "") {

        alert("Task cannot be empty.");

        return;
    }


    /* ---------- EDIT TIME ---------- */

    const newTime = prompt(
        "Edit time (example: 18:30):",
        task.time
    );


    if (newTime === null) {
        return;
    }


    const cleanTime = newTime.trim();


    if (cleanTime === "") {

        alert("Time cannot be empty.");

        return;
    }


    /* ---------- EDIT PRIORITY ---------- */

    const newPriority = prompt(
        "Priority: low / medium / high",
        task.priority
    );


    if (newPriority === null) {
        return;
    }


    const cleanPriority =
        newPriority.trim().toLowerCase();


    if (
        cleanPriority !== "low" &&
        cleanPriority !== "medium" &&
        cleanPriority !== "high"
    ) {

        alert(
            "Priority must be low, medium, or high."
        );

        return;
    }


    /* ---------- SAVE EDIT ---------- */

    task.title = cleanTitle;

    task.time = cleanTime;

    task.priority = cleanPriority;


    saveTasks();

    renderTasks();
}


/* =========================================
   SEARCH
========================================= */

function searchTasks() {

    renderTasks();
}


/* =========================================
   GET VISIBLE TASKS
========================================= */

function getVisibleTasks() {

    let result = [...tasks];


    /* ---------- SIDEBAR PAGE ---------- */

    if (currentPage === "active") {

        result = result.filter(function (task) {

            return task.completed === false;

        });
    }


    if (currentPage === "completed") {

        result = result.filter(function (task) {

            return task.completed === true;

        });
    }


    /* ---------- FILTER BUTTON ---------- */

    if (currentFilter === "active") {

        result = result.filter(function (task) {

            return task.completed === false;

        });
    }


    if (currentFilter === "completed") {

        result = result.filter(function (task) {

            return task.completed === true;

        });
    }


    /* ---------- SEARCH ---------- */

    const searchValue =
        searchInput.value.trim().toLowerCase();


    if (searchValue !== "") {

        result = result.filter(function (task) {

            return task.title
                .toLowerCase()
                .includes(searchValue);

        });
    }


    return result;
}


/* =========================================
   RENDER TASKS
========================================= */

function renderTasks() {

    // Clear current task list
    taskList.innerHTML = "";


    // Get filtered tasks
    const visibleTasks = getVisibleTasks();


    /* ---------- EMPTY STATE ---------- */

    if (visibleTasks.length === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";
    }


    /* ---------- CREATE TASK ELEMENTS ---------- */

    visibleTasks.forEach(function (task) {

        const taskElement =
            document.createElement("article");


        taskElement.className = "task-item";


        // Add completed class
        if (task.completed) {

            taskElement.classList.add("completed");
        }


        /* ---------- PRIORITY ---------- */

        let priorityClass = "priority-medium";

        let priorityText = "Medium";


        if (task.priority === "low") {

            priorityClass = "priority-low";

            priorityText = "Low";
        }


        if (task.priority === "high") {

            priorityClass = "priority-high";

            priorityText = "High";
        }


        /* ---------- TASK HTML ---------- */

        taskElement.innerHTML = `

            <div class="task-checkbox">

                <input
                    type="checkbox"
                    ${task.completed ? "checked disabled" : ""}
                >

            </div>


            <div class="task-content">

                <h3 class="task-title">
                    ${escapeHTML(task.title)}
                </h3>


                <div class="task-information">

                    <span class="task-time">
                        🕒 ${escapeHTML(task.time)}
                    </span>


                    <span class="task-date">
                        Created: ${escapeHTML(task.createdAt)}
                    </span>


                    <span class="priority-badge ${priorityClass}">
                        ${priorityText}
                    </span>

                </div>

            </div>


            <div class="task-actions">

                ${
                    task.completed

                    ? `

                        <span class="completed-label">
                            ✓ Completed
                        </span>

                    `

                    : `

                        <button
                            type="button"
                            class="edit-button"
                        >
                            Edit
                        </button>

                    `
                }


                <button
                    type="button"
                    class="delete-button"
                >
                    Delete
                </button>

            </div>

        `;


        /* =====================================
           CHECKBOX
        ===================================== */

        const checkbox =
            taskElement.querySelector(
                'input[type="checkbox"]'
            );


        if (!task.completed) {

            checkbox.addEventListener(
                "change",
                function () {

                    completeTask(task.id);

                }
            );
        }


        /* =====================================
           EDIT BUTTON
        ===================================== */

        const editButton =
            taskElement.querySelector(
                ".edit-button"
            );


        if (editButton) {

            editButton.addEventListener(
                "click",
                function () {

                    editTask(task.id);

                }
            );
        }


        /* =====================================
           DELETE BUTTON
        ===================================== */

        const deleteButton =
            taskElement.querySelector(
                ".delete-button"
            );


        if (deleteButton) {

            deleteButton.addEventListener(
                "click",
                function () {

                    deleteTask(task.id);

                }
            );
        }


        /* =====================================
           ADD TASK TO PAGE
        ===================================== */

        taskList.appendChild(taskElement);

    });


    // Update counter
    updateTaskCount();
}


/* =========================================
   UPDATE TASK COUNT
========================================= */

function updateTaskCount() {

    const activeTasks =
        tasks.filter(function (task) {

            return task.completed === false;

        });


    taskCount.textContent = activeTasks.length;
}


/* =========================================
   UPDATE PAGE TITLE
========================================= */

function updatePage() {

    if (currentPage === "all") {

        pageTitle.textContent = "Dashboard";

        pageDescription.textContent =
            "Organize your day and get things done.";

    }


    if (currentPage === "active") {

        pageTitle.textContent = "My Tasks";

        pageDescription.textContent =
            "Focus on everything that is still in progress.";

    }


    if (currentPage === "completed") {

        pageTitle.textContent = "Completed";

        pageDescription.textContent =
            "Look at everything you have already finished.";

    }
}


/* =========================================
   UPDATE SIDEBAR NAVIGATION
========================================= */

function updateNavigation() {

    navigationButtons.forEach(
        function (button) {

            button.classList.remove("active");


            if (
                button.dataset.page === currentPage
            ) {

                button.classList.add("active");

            }

        }
    );
}


/* =========================================
   UPDATE FILTER BUTTONS
========================================= */

function updateFilters() {

    filterButtons.forEach(
        function (button) {

            button.classList.remove("active");


            if (
                button.dataset.filter === currentFilter
            ) {

                button.classList.add("active");

            }

        }
    );
}


/* =========================================
   FILTER BUTTON EVENTS
========================================= */

filterButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                currentFilter =
                    button.dataset.filter;


                // When using filter buttons,
                // show the dashboard page
                currentPage = "all";


                updateNavigation();

                updateFilters();

                updatePage();

                renderTasks();

            }
        );

    }
);


/* =========================================
   SIDEBAR NAVIGATION EVENTS
========================================= */

navigationButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                currentPage =
                    button.dataset.page;
                /*  ALL  */

                if (currentPage === "all") {
                    currentFilter = "all";
                }

                /* ACTIVE */

                if (currentPage === "active") {
                    currentFilter = "active";
                }

                /* COMPLETED */

                if (currentPage === "completed") {
                    currentFilter = "completed";
                }
                updateNavigation();
                updateFilters();
                updatePage();
                renderTasks();
            }
        );
    }
);

/* =========================================
   ADD BUTTON
========================================= */

addButton.addEventListener(
    "click",
    function () {
        addTask();
    }
);

/* =========================================
   ENTER KEY
========================================= */

taskInput.addEventListener(
    "keydown",
    function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            addTask();
        }
    }
);

/* =========================================
   SEARCH INPUT
========================================= */

searchInput.addEventListener(
    "input",
    function () {
        searchTasks();
    }
);


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {
    const element =
        document.createElement("div");
    element.textContent = value;
    return element.innerHTML;
}


/* =========================================
   INITIALIZE APPLICATION
========================================= */

loadTasks();

updateNavigation();

updateFilters();

updatePage();

renderTasks();

