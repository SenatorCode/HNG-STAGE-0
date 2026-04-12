"use strict";

const dueDate = new Date("2026-04-16T18:00:00Z");

const card = document.querySelector('[data-testid="test-todo-card"]');
const dueDateEl = document.querySelector('[data-testid="test-todo-due-date"]');
const remainingEl = document.querySelector('[data-testid="test-todo-time-remaining"]');
const statusEl = document.querySelector('[data-testid="test-todo-status"]');
const completeToggle = document.querySelector('[data-testid="test-todo-complete-toggle"]');
const editButton = document.querySelector('[data-testid="test-todo-edit-button"]');
const deleteButton = document.querySelector('[data-testid="test-todo-delete-button"]');

function formatDueDate(date) {
	const formatted = new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric"
	}).format(date);

	return `Due ${formatted}`;
}

function pluralize(value, unit) {
	return `${value} ${unit}${value === 1 ? "" : "s"}`;
}

function getTimeRemainingText(now = new Date()) {
	const diffMs = dueDate.getTime() - now.getTime();
	const minuteMs = 60 * 1000;
	const hourMs = 60 * minuteMs;
	const dayMs = 24 * hourMs;

	if (Math.abs(diffMs) < minuteMs) {
		return "Due now!";
	}

	if (diffMs > 0) {
		const days = Math.floor(diffMs / dayMs);
		const hours = Math.floor(diffMs / hourMs);

		if (days >= 2) {
			return `Due in ${pluralize(days, "day")}`;
		}

		if (days === 1) {
			return "Due tomorrow";
		}

		const remainingHours = Math.max(1, hours);
		return `Due in ${pluralize(remainingHours, "hour")}`;
	}

	const overdueMs = Math.abs(diffMs);
	const overdueHours = Math.floor(overdueMs / hourMs);

	if (overdueHours >= 1) {
		return `Overdue by ${pluralize(overdueHours, "hour")}`;
	}

	const overdueMinutes = Math.max(1, Math.floor(overdueMs / minuteMs));
	return `Overdue by ${pluralize(overdueMinutes, "minute")}`;
}

function updateTimeRemaining() {
	remainingEl.textContent = getTimeRemainingText(new Date());
}

function setCompletedState(isCompleted) {
	completeToggle.checked = isCompleted;

	if (isCompleted) {
		statusEl.textContent = "Done";
		card.classList.add("completed");
		return;
	}

	statusEl.textContent = "In Progress";
	card.classList.remove("completed");
}

completeToggle.addEventListener("change", (event) => {
	setCompletedState(event.target.checked);
});

editButton.addEventListener("click", () => {
	console.log("edit clicked");
});

deleteButton.addEventListener("click", () => {
	alert("Delete clicked");
});

dueDateEl.textContent = formatDueDate(dueDate);
dueDateEl.setAttribute("datetime", dueDate.toISOString());
setCompletedState(false);
updateTimeRemaining();
setInterval(updateTimeRemaining, 60 * 1000);
