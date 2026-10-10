
"use strict";

// 1. Load existing student data
const STORAGE_KEY = "students";
let students = [];

try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    students = Array.isArray(data) ? data.map(student => ({
        ...student,
        status: student.status || "Active"
    })) : [];
} catch {
    students = [];
}

let editingId = null;

// 2. Select HTML elements
const $ = id => document.getElementById(id);

const form = $("studentForm");
const nameInput = $("studentName");
const rollInput = $("rollNumber");
const courseInput = $("course");
const emailInput = $("email");
const mobileInput = $("mobile");
const statusInput = $("status");

const tableBody = $("studentTableBody");
const searchInput = $("searchStudent");
const globalSearch = $("globalSearch");
const filterStatus = $("filterStatus");
const submitBtn = $("submitBtn");
const formTitle = $("formTitle");
const toast = $("toast");

let toastTimer;

// 3. Notifications
function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}

// 4. Safely display user-entered text
function escapeHTML(value) {
    const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };

    return String(value ?? "").replace(/[&<>"']/g, ch => entities[ch]);
}

// 5. Save student data
function saveStudents() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
        return true;
    } catch (error) {
        showToast("Could not save data. Browser storage may be full.");
        return false;
    }
}

// 6. Update dashboard cards
function updateDashboard() {
    $("totalStudents").textContent = students.length;

    $("activeStudents").textContent = students.filter(
        student => student.status === "Active"
    ).length;

    $("inactiveStudents").textContent = students.filter(
        student => student.status === "Inactive"
    ).length;

    const uniqueCourses = new Set(
        students.map(student => student.course).filter(Boolean)
    );

    $("totalCourses").textContent = uniqueCourses.size;
}

// 7. Display student table
function displayStudents() {
    const query = searchInput.value.trim().toLowerCase();
    const selectedStatus = filterStatus.value;

    const filtered = students.filter(student => {
        const matchesSearch = [
            student.name,
            student.roll,
            student.email,
            student.course,
            student.mobile
        ].some(value =>
            String(value ?? "").toLowerCase().includes(query)
        );

        const matchesStatus =
            selectedStatus === "All" ||
            student.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    tableBody.innerHTML = "";

    if (filtered.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.className = "empty-state";
        cell.textContent = students.length === 0
            ? "✦ No student records yet. Add your first student above."
            : "No matching records. Try another search or filter.";

        row.appendChild(cell);
        tableBody.appendChild(row);
    } else {
        filtered.forEach(student => {
            const row = document.createElement("tr");

            const studentName = escapeHTML(student.name);
            const studentEmail = escapeHTML(student.email);
            const studentRoll = escapeHTML(student.roll);
            const studentCourse = escapeHTML(student.course);
            const studentMobile = escapeHTML(student.mobile);
            const studentId = escapeHTML(student.id);

            const currentStatus = student.status === "Inactive"
                ? "Inactive"
                : "Active";

            const initials = String(student.name || "?")
                .trim()
                .split(/\s+/)
                .map(part => part[0] || "")
                .slice(0, 2)
                .join("")
                .toUpperCase();

            row.innerHTML = `
                <td>
                    <div class="student-info">
                        <div class="student-avatar">${escapeHTML(initials)}</div>
                        <div>
                            <div class="student-name">${studentName}</div>
                            <div class="student-email">${studentEmail}</div>
                        </div>
                    </div>
                </td>
                <td><span class="roll-badge">${studentRoll}</span></td>
                <td>${studentCourse}</td>
                <td>${studentMobile}</td>
                <td>
                    <span class="status ${
                        currentStatus === "Active"
                            ? "status-active"
                            : "status-inactive"
                    }">${currentStatus}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button type="button" class="action-btn"
                            data-action="edit" data-id="${studentId}">Edit</button>
                        <button type="button" class="action-btn delete"
                            data-action="delete" data-id="${studentId}">Delete</button>
                    </div>
                </td>
            `;

            tableBody.appendChild(row);
        });
    }

    $("recordCount").textContent =
        `${filtered.length} record${filtered.length !== 1 ? "s" : ""}`;

    $("tableFooter").textContent =
        `Showing ${filtered.length} of ${students.length} students`;

    updateDashboard();
}

// 8. Reset form
function resetForm() {
    form.reset();
    editingId = null;
    formTitle.textContent = "Create Student Profile";
    submitBtn.textContent = "＋ Add Student";
}

// 9. Add or update a student
form.addEventListener("submit", event => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const roll = rollInput.value.trim();
    const selectedCourse = courseInput.value;
    const email = emailInput.value.trim();
    const mobile = mobileInput.value.trim();
    const selectedStatus = statusInput.value;

    if (!name || !roll || !selectedCourse || !email || !mobile) {
        showToast("Please complete all required fields.");
        return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
        showToast("Mobile number must contain exactly 10 digits.");
        mobileInput.focus();
        return;
    }

    const duplicate = students.some(student =>
        String(student.roll ?? "").trim().toLowerCase() === roll.toLowerCase() &&
        String(student.id) !== String(editingId)
    );

    if (duplicate) {
        showToast("This roll number is already registered.");
        rollInput.focus();
        return;
    }

    const details = {
        name,
        roll,
        course: selectedCourse,
        email,
        mobile,
        status: selectedStatus
    };

    const previousStudents = students.map(student => ({ ...student }));

    if (editingId !== null) {
        const index = students.findIndex(
            student => String(student.id) === String(editingId)
        );

        if (index === -1) {
            showToast("Student record could not be found.");
            resetForm();
            return;
        }

        students[index] = { ...students[index], ...details };
    } else {
        students.push({
            id: Date.now().toString() + "-" +
                Math.random().toString(36).slice(2, 8),
            ...details
        });
    }

    if (!saveStudents()) {
        students = previousStudents;
        return;
    }

    const wasEditing = editingId !== null;

    resetForm();
    displayStudents();

    showToast(wasEditing
        ? "Student updated successfully!"
        : "New student added successfully!");

    $("students").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

// 10. Handle Edit and Delete buttons
tableBody.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const student = students.find(
        item => String(item.id) === button.dataset.id
    );

    if (!student) {
        showToast("Student record not found.");
        return;
    }

    if (button.dataset.action === "edit") {
        editingId = student.id;

        nameInput.value = student.name || "";
        rollInput.value = student.roll || "";
        courseInput.value = student.course || "";
        emailInput.value = student.email || "";
        mobileInput.value = student.mobile || "";
        statusInput.value = student.status || "Active";

        formTitle.textContent = "Edit Student Profile";
        submitBtn.textContent = "Save Changes";

        $("addStudent").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        nameInput.focus();
        showToast("Edit the details and save your changes.");
    }

    if (button.dataset.action === "delete") {
        if (!confirm(`Delete the record for ${student.name}?`)) return;

        const previousStudents = students;
        students = students.filter(
            item => String(item.id) !== String(student.id)
        );

        if (!saveStudents()) {
            students = previousStudents;
            return;
        }

        if (String(editingId) === String(student.id)) {
            resetForm();
        }

        displayStudents();
        showToast("Student record deleted.");
    }
});

// 11. Search and filter
searchInput.addEventListener("input", displayStudents);
filterStatus.addEventListener("change", displayStudents);

// Both search fields work together
globalSearch.addEventListener("input", () => {
    searchInput.value = globalSearch.value;
    displayStudents();
});

searchInput.addEventListener("input", () => {
    globalSearch.value = searchInput.value;
});

// 12. Clear the form
$("cancelBtn").addEventListener("click", () => {
    resetForm();
    showToast("Form cleared.");
});

// 13. Sidebar active navigation
document.querySelectorAll(".nav-item").forEach(link => {
    link.addEventListener("click", () => {
        document.querySelectorAll(".nav-item").forEach(item =>
            item.classList.remove("active")
        );
        link.classList.add("active");
    });
});

// 14. Light / dark theme toggle
const themeBtn = $("themeBtn");

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");

    const isLight = document.body.classList.contains("light-mode");
    themeBtn.textContent = isLight ? "☀" : "☾";
    themeBtn.title = isLight ? "Switch to dark theme" : "Switch to light theme";
});

// 15. Load the dashboard
displayStudents();