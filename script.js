"use strict";

const card = document.querySelector('[data-testid="test-todo-card"]');
const titleEl = document.querySelector('[data-testid="test-todo-title"]');
const descriptionEl = document.querySelector('[data-testid="test-todo-description"]');
const priorityEl = document.querySelector('[data-testid="test-todo-priority"]');
const priorityIndicatorEl = document.querySelector(
  '[data-testid="test-todo-priority-indicator"]',
);
const dueDateEl = document.querySelector('[data-testid="test-todo-due-date"]');
const remainingEl = document.querySelector(
  '[data-testid="test-todo-time-remaining"]',
);
const overdueIndicatorEl = document.querySelector(
  '[data-testid="test-todo-overdue-indicator"]',
);
const statusEl = document.querySelector('[data-testid="test-todo-status"]');
const completeToggle = document.querySelector(
  '[data-testid="test-todo-complete-toggle"]',
);
const statusControl = document.querySelector(
  '[data-testid="test-todo-status-control"]',
);
const expandToggle = document.querySelector('[data-testid="test-todo-expand-toggle"]');
const collapsibleSection = document.querySelector(
  '[data-testid="test-todo-collapsible-section"]',
);
const editButton = document.querySelector(
  '[data-testid="test-todo-edit-button"]',
);
const deleteButton = document.querySelector(
  '[data-testid="test-todo-delete-button"]',
);
const editForm = document.querySelector('[data-testid="test-todo-edit-form"]');
const editTitleInput = document.querySelector(
  '[data-testid="test-todo-edit-title-input"]',
);
const editDescriptionInput = document.querySelector(
  '[data-testid="test-todo-edit-description-input"]',
);
const editPrioritySelect = document.querySelector(
  '[data-testid="test-todo-edit-priority-select"]',
);
const editDueDateInput = document.querySelector(
  '[data-testid="test-todo-edit-due-date-input"]',
);
const cancelButton = document.querySelector('[data-testid="test-todo-cancel-button"]');

const COLLAPSE_THRESHOLD = 140;
const UPDATE_INTERVAL_MS = 60 * 1000;

const state = {
  title: "Build a clean, testable todo card",
  description:
    "Create a responsive task card with accessible controls, clear status, and a live due-time hint. Make sure the card handles long content gracefully without layout overflow across phone, tablet, and desktop sizes.",
  priority: "High",
  status: "In Progress",
  dueDate: new Date("2026-04-16T18:00:00Z"),
  expanded: false,
  editing: false,
};

let timerId = null;

function formatDueDate(date) {
  const formatted = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

  return `Due ${formatted}`;
}

function pluralize(value, unit) {
  return `${value} ${unit}${value === 1 ? "" : "s"}`;
}

function getPriorityClass(priority) {
  return priority.toLowerCase();
}

function getTimeRemaining(now = new Date()) {
  const diffMs = state.dueDate.getTime() - now.getTime();
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  if (state.status === "Done") {
    return { text: "Completed", overdue: false };
  }

  if (Math.abs(diffMs) < minuteMs) {
    return { text: "Due now!", overdue: false };
  }

  if (diffMs > 0) {
    const days = Math.floor(diffMs / dayMs);
    const hours = Math.floor(diffMs / hourMs) % 24;
    const minutes = Math.max(1, Math.floor(diffMs / minuteMs) % 60);

    if (days >= 2) {
      return { text: `Due in ${pluralize(days, "day")}`, overdue: false };
    }

    if (days === 1) {
      return { text: "Due tomorrow", overdue: false };
    }

    if (hours >= 1) {
      return { text: `Due in ${pluralize(hours, "hour")}`, overdue: false };
    }

    return { text: `Due in ${pluralize(minutes, "minute")}`, overdue: false };
  }

  const overdueMs = Math.abs(diffMs);
  const overdueHours = Math.floor(overdueMs / hourMs);

  if (overdueHours >= 1) {
    return { text: `Overdue by ${pluralize(overdueHours, "hour")}`, overdue: true };
  }

  const overdueMinutes = Math.max(1, Math.floor(overdueMs / minuteMs));
  return { text: `Overdue by ${pluralize(overdueMinutes, "minute")}`, overdue: true };
}

function toDateTimeLocalValue(date) {
  const timezoneOffsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
}

function fromDateTimeLocalValue(value, fallbackDate) {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return fallbackDate;
  }
  return parsedDate;
}

function canCollapseDescription() {
  return state.description.trim().length > COLLAPSE_THRESHOLD;
}

function syncTimer() {
  if (state.status === "Done") {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    return;
  }

  if (!timerId) {
    timerId = setInterval(() => {
      renderTime();
    }, UPDATE_INTERVAL_MS);
  }
}

function renderTime() {
  const timeState = getTimeRemaining(new Date());
  remainingEl.textContent = timeState.text;

  overdueIndicatorEl.hidden = !timeState.overdue;
  card.classList.toggle("is-overdue", timeState.overdue);
}

function render() {
  titleEl.textContent = state.title;
  descriptionEl.textContent = state.description;

  const priorityClass = getPriorityClass(state.priority);
  priorityEl.textContent = state.priority;
  priorityEl.className = `badge badge-priority ${priorityClass}`;
  priorityEl.setAttribute("aria-label", `Priority ${state.priority}`);

  priorityIndicatorEl.className = `priority-indicator ${priorityClass}`;

  const isDone = state.status === "Done";
  completeToggle.checked = isDone;
  statusControl.value = state.status;

  statusEl.textContent = state.status;
  statusEl.className = "badge badge-status";
  card.classList.remove("completed", "status-in-progress", "status-pending");

  if (isDone) {
    card.classList.add("completed");
  } else if (state.status === "In Progress") {
    card.classList.add("status-in-progress");
  } else {
    card.classList.add("status-pending");
  }

  dueDateEl.textContent = formatDueDate(state.dueDate);
  dueDateEl.setAttribute("datetime", state.dueDate.toISOString());

  const collapsible = canCollapseDescription();
  if (!collapsible) {
    state.expanded = true;
  }

  expandToggle.hidden = !collapsible;
  expandToggle.setAttribute("aria-expanded", String(state.expanded));
  expandToggle.textContent = state.expanded ? "Collapse details" : "Expand details";
  collapsibleSection.classList.toggle("is-collapsed", collapsible && !state.expanded);

  editForm.hidden = !state.editing;
  editButton.setAttribute("aria-expanded", String(state.editing));

  renderTime();
  syncTimer();
}

function openEditMode() {
  state.editing = true;
  editTitleInput.value = state.title;
  editDescriptionInput.value = state.description;
  editPrioritySelect.value = state.priority;
  editDueDateInput.value = toDateTimeLocalValue(state.dueDate);

  render();
  editTitleInput.focus();
}

function closeEditMode() {
  state.editing = false;
  render();
  editButton.focus();
}

function updateStatus(nextStatus) {
  state.status = nextStatus;
  render();
}

completeToggle.addEventListener("change", (event) => {
  if (event.target.checked) {
    updateStatus("Done");
    return;
  }

  updateStatus("Pending");
});

statusControl.addEventListener("change", (event) => {
  updateStatus(event.target.value);
});

expandToggle.addEventListener("click", () => {
  if (!canCollapseDescription()) {
    return;
  }

  state.expanded = !state.expanded;
  render();
});

editButton.addEventListener("click", () => {
  openEditMode();
});

deleteButton.addEventListener("click", () => {
  alert("Delete clicked");
});

cancelButton.addEventListener("click", () => {
  closeEditMode();
});

editForm.addEventListener("submit", (event) => {
  event.preventDefault();

  state.title = editTitleInput.value.trim() || state.title;
  state.description = editDescriptionInput.value.trim() || state.description;
  state.priority = editPrioritySelect.value;
  state.dueDate = fromDateTimeLocalValue(editDueDateInput.value, state.dueDate);

  closeEditMode();
});

render();
