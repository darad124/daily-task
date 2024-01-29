// Get the elements from the HTML document
console.log("%cScript loaded successfully", "color: green; font-weight: bold");

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const timeInput = document.getElementById("time-input");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");
const message = document.getElementById("message");

// Create a variable to store the tasks
let tasks = [];

// Load the tasks from the local storage
loadTasks();

// Add an event listener to the form
taskForm.addEventListener("submit", function(e) {
    e.preventDefault();
    
    const taskName = taskInput.value.trim(); // Trim leading/trailing whitespaces
    const timeLimit = timeInput.value.trim(); // Trim leading/trailing whitespaces
    
    if (taskName === "") {
        showMessage("Please enter a valid task name");
    } else if (timeLimit === "" || isNaN(parseInt(timeLimit)) || parseInt(timeLimit) <= 0) {
        showMessage("Please enter a valid positive time limit (in minutes)");
    } else {
        const task = {
            id: Date.now(),
            name: taskName,
            time: parseInt(timeLimit), // Convert to integer
            completed: false
        };
        
        tasks.push(task);
        saveTasks();
        displayTask(task);
        taskInput.value = "";
        timeInput.value = "";
        showMessage("Task added successfully");
    }
});


// Add event listeners for edit, delete, and complete buttons within task list
taskList.addEventListener("click", function(e) {
    const element = e.target;
    if (element.classList.contains("edit-btn")) {
        const taskId = element.parentElement.parentElement.dataset.id;
        editTask(taskId);
    } else if (element.classList.contains("delete-btn")) {
        const taskId = element.parentElement.parentElement.dataset.id;
        deleteTask(taskId);
    } else if (element.classList.contains("complete-btn")) {
        const taskId = element.parentElement.parentElement.dataset.id;
        completeTask(taskId);
    }
});

// Define a function to load the tasks from the local storage
function loadTasks() {
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
        tasks.forEach(function(task) {
            // Calculate time remaining based on when the task was created
            const currentTime = Math.floor(Date.now() / 1000); // Convert milliseconds to seconds
            const timeElapsed = currentTime - Math.floor(task.id / 1000); // Convert milliseconds to seconds
            const timeRemaining = task.time * 60 - timeElapsed;
            if (timeRemaining <= 0) {
                task.completed = true;
            }
            displayTask(task, timeRemaining);
        });
    }
}

// Define a function to save the tasks to the local storage
function saveTasks() {
    const tasksJSON = JSON.stringify(tasks);
    localStorage.setItem("tasks", tasksJSON);
}

// Define a function to display a task on the page
function displayTask(task, timeRemainingParam) {
    const taskWrapper = document.createElement("div");
    const taskItem = document.createElement("li");
    taskItem.classList.add("task-item");
    taskItem.dataset.id = task.id;
    const timerDiv = document.createElement("div");
    timerDiv.classList.add("timer");
    
    let timeRemaining = timeRemainingParam !== undefined ? timeRemainingParam : task.time * 60; // Use the passed timeRemainingParam value or default to task time
    
    const timerInterval = setInterval(updateTimer, 1000);
    
    function updateTimer() {
        if (!task.completed) {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            timerDiv.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                timerDiv.textContent = "Time's up!";
                if (!task.completed) {
                    taskWrapper.style.backgroundColor = "#ff7f7f"; // Task turns red if not completed in time
                }
            }
            timeRemaining--;
        } else {
            clearInterval(timerInterval); // Stop the timer if the task is completed
        }
    }
    
    const taskBtns = `
        <button class="task-btn edit-btn"><i class="fas fa-edit"></i></button>
        <button class="task-btn delete-btn"><i class="fas fa-trash"></i></button>
        <button class="task-btn complete-btn"><i class="fas fa-check"></i></button>
    `;
    
    taskItem.innerHTML = `
        <span class="task-name">${task.name}</span>
        <span class="task-time">${task.time} minutes</span>
        <div class="task-btns">${taskBtns}</div>
    `;
    
    taskItem.appendChild(timerDiv);
    taskWrapper.appendChild(taskItem);
    taskList.appendChild(taskWrapper);

    // Set background color to green for completed tasks
    if (task.completed) {
        taskWrapper.style.backgroundColor = "#7fe57f";
    } else {
        // Set background color to white for tasks still running
        taskWrapper.style.backgroundColor = "#f9f9f9";
    }
}

// Define a function to display a message on the page
function showMessage(text) {
    message.textContent = text;
    message.style.display = "block";
    setTimeout(function() {
        message.style.display = "none";
    }, 3000);
}

// Define a function to edit a task
function editTask(taskId) {
    const taskIndex = tasks.findIndex(task => task.id == taskId);
    if (taskIndex !== -1) {
        const taskName = tasks[taskIndex].name;
        const timeLimit = tasks[taskIndex].time;
        taskInput.value = taskName;
        timeInput.value = timeLimit;
    }
}

// Define a function to delete a task
function deleteTask(taskId) {
    if (confirm("Are you sure you want to delete this task?")) {
        const taskWrapper = document.querySelector(`[data-id='${taskId}']`);
        if (taskWrapper) {
            taskWrapper.remove();
        }
        tasks = tasks.filter(task => task.id != taskId);
        saveTasks();
        showMessage("Task deleted successfully");
    }
}

// Define a function to complete a task
function completeTask(taskId) {
    const task = tasks.find(task => task.id == taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        const taskElement = document.querySelector(`[data-id='${taskId}']`);
        if (taskElement) {
            taskElement.classList.toggle("completed", task.completed);
            showMessage("Task completed successfully");
        }
    }
}
