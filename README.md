# Advanced Todo Card (Stage 1a)

A single-card Todo component built with plain HTML, CSS, and JavaScript.

## What changed from Stage 0
- Added edit mode with form fields for title, description, priority, and due date.
- Added status control (`Pending`, `In Progress`, `Done`) with synchronized checkbox behavior.
- Added visual priority indicator that changes with Low/Medium/High.
- Added expandable/collapsible description section for long content.
- Added overdue indicator and more granular time messaging.
- Added logic to stop time updates and show `Completed` when status is `Done`.

## New design decisions
- Used a single JS state object with a centralized `render()` flow to keep UI state consistent.
- Used a native `<select>` for status control to simplify accessibility and keyboard support.
- Kept all Stage 0 `data-testid` hooks unchanged, then added Stage 1a hooks exactly.
- Used responsive, mobile-first CSS so form controls stack on mobile and align better on larger screens.

## Known limitations
- Edit mode does not trap focus inside the form (optional bonus in requirement).
- Delete action remains a dummy action (`alert`) for this stage.
- Data is in-memory only; page refresh resets values.

## Accessibility notes
- Edit form fields use associated `<label for>` bindings.
- Status control has an accessible label.
- Expand toggle uses `aria-expanded` and `aria-controls`.
- Collapsible section has a matching `id` for control linkage.
- Time updates are announced politely via `aria-live="polite"`.
- Interactive controls remain keyboard reachable and focus-visible.
