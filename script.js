// ======================================================
// STUDENT MANAGEMENT SYSTEM
// ======================================================


// ------------------------------------------------------
// 1. STUDENTS DATA
// ------------------------------------------------------

// localStorage se data lena
let students =
    JSON.parse(localStorage.getItem("students")) || [];


// Edit ke time student ki ID yahan store hogi
let editingId = null;


// ------------------------------------------------------
// 2. HTML ELEMENTS
// ------------------------------------------------------

const studentForm =
    document.getElementById("studentForm");

const studentName =
    document.getElementById("studentName");

const rollNumber =
    document.getElementById("rollNumber");

const course =
    document.getElementById("course");

const email =
    document.getElementById("email");

const mobile =
    document.getElementById("mobile");

const studentTableBody =
    document.getElementById("studentTableBody");

const totalStudents =
    document.getElementById("totalStudents");

const activeStudents =
    document.getElementById("activeStudents");

const searchStudent =
    document.getElementById("searchStudent");

const submitBtn =
    document.getElementById("submitBtn");

const cancelBtn =
    document.getElementById("cancelBtn");

const formTitle =
    document.getElementById("formTitle");


// ------------------------------------------------------
// 3. SAVE DATA
// ------------------------------------------------------

function saveStudents() {

    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );

}


// ------------------------------------------------------
// 4. DISPLAY STUDENTS
// ------------------------------------------------------

function displayStudents(list = students) {

    // Table ko empty karna
    studentTableBody.innerHTML = "";


    // Agar koi student nahi hai
    if (list.length === 0) {

        studentTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">
                    No student records found.
                </td>
            </tr>
        `;

        updateCounts();

        return;
    }


    // Har student ko table mein show karna
    list.forEach(function(student, index) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${index + 1}
            </td>

            <td>
                ${student.name}
            </td>

            <td>
                ${student.roll}
            </td>

            <td>
                ${student.course}
            </td>

            <td>
                ${student.email}
            </td>

            <td>
                ${student.mobile}
            </td>

            <td>

                <button
                    class="edit-btn"
                    onclick="editStudent(${student.id})">
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteStudent(${student.id})">
                    Delete
                </button>

            </td>
        `;


        studentTableBody.appendChild(row);

    });


    // Count update
    updateCounts();

}


// ------------------------------------------------------
// 5. UPDATE COUNTS
// ------------------------------------------------------

function updateCounts() {

    totalStudents.textContent =
        students.length;


    activeStudents.textContent =
        students.length;

}


// ------------------------------------------------------
// 6. ADD / UPDATE STUDENT
// ------------------------------------------------------

studentForm.addEventListener(
    "submit",
    function(event) {

        // Page reload ko rokna
        event.preventDefault();


        // Form ki values lena
        const name =
            studentName.value.trim();

        const roll =
            rollNumber.value.trim();

        const selectedCourse =
            course.value;

        const studentEmail =
            email.value.trim();

        const studentMobile =
            mobile.value.trim();


        // ------------------------------------------------
        // EDIT MODE
        // ------------------------------------------------

        if (editingId !== null) {

            const student =
                students.find(function(item) {

                    return item.id === editingId;

                });


            if (student) {

                student.name = name;

                student.roll = roll;

                student.course =
                    selectedCourse;

                student.email =
                    studentEmail;

                student.mobile =
                    studentMobile;

            }


            // Edit mode close
            editingId = null;


            // Button normal karo
            submitBtn.textContent =
                "Add Student";


            formTitle.textContent =
                "Add New Student";

        }


        // ------------------------------------------------
        // ADD MODE
        // ------------------------------------------------

        else {

            const newStudent = {

                id: Date.now(),

                name: name,

                roll: roll,

                course: selectedCourse,

                email: studentEmail,

                mobile: studentMobile

            };


            // Array mein student add karna
            students.push(newStudent);

        }


        // Data save
        saveStudents();


        // Form clear
        studentForm.reset();


        // Table update
        displayStudents();


        // Student records section par jana
        document
            .getElementById("students")
            .scrollIntoView({
                behavior: "smooth"
            });

    }
);


// ------------------------------------------------------
// 7. EDIT STUDENT
// ------------------------------------------------------

function editStudent(id) {

    // ID se student find karna
    const student =
        students.find(function(item) {

            return item.id === id;

        });


    // Student nahi mila
    if (!student) {

        return;

    }


    // Student ki values form mein fill karna
    studentName.value =
        student.name;

    rollNumber.value =
        student.roll;

    course.value =
        student.course;

    email.value =
        student.email;

    mobile.value =
        student.mobile;


    // Edit mode ON
    editingId = id;


    // Button ka text change
    submitBtn.textContent =
        "Update Student";


    // Heading change
    formTitle.textContent =
        "Edit Student";


    // Form par smoothly jana
    document
        .getElementById("addStudent")
        .scrollIntoView({
            behavior: "smooth"
        });

}


// ------------------------------------------------------
// 8. DELETE STUDENT
// ------------------------------------------------------

function deleteStudent(id) {

    const student =
        students.find(function(item) {

            return item.id === id;

        });


    if (!student) {

        return;

    }


    // Confirmation
    const confirmDelete =
        confirm(
            "Are you sure you want to delete " +
            student.name +
            "?"
        );


    if (!confirmDelete) {

        return;

    }


    // Student ko remove karna
    students =
        students.filter(function(item) {

            return item.id !== id;

        });


    // Data save
    saveStudents();


    // Table update
    displayStudents();

}


// ------------------------------------------------------
// 9. SEARCH STUDENT
// ------------------------------------------------------

searchStudent.addEventListener(
    "input",
    function() {

        const searchValue =
            searchStudent.value
                .toLowerCase()
                .trim();


        const filteredStudents =
            students.filter(function(student) {

                return (

                    student.name
                        .toLowerCase()
                        .includes(searchValue)

                    ||

                    student.roll
                        .toLowerCase()
                        .includes(searchValue)

                    ||

                    student.course
                        .toLowerCase()
                        .includes(searchValue)

                    ||

                    student.email
                        .toLowerCase()
                        .includes(searchValue)

                );

            });


        displayStudents(
            filteredStudents
        );

    }
);


// ------------------------------------------------------
// 10. CANCEL EDIT
// ------------------------------------------------------

cancelBtn.addEventListener(
    "click",
    function() {

        // Form clear
        studentForm.reset();


        // Edit mode off
        editingId = null;


        // Normal button
        submitBtn.textContent =
            "Add Student";


        // Normal heading
        formTitle.textContent =
            "Add New Student";

    }
);


// ------------------------------------------------------
// 11. PAGE LOAD
// ------------------------------------------------------

// Page open hote hi students display
displayStudents();

