function getStudents() {
    try {
        return JSON.parse(localStorage.getItem("students") || "[]");
    } catch (err) {
        return [];
    }
}

function saveStudents(students) {
    localStorage.setItem("students", JSON.stringify(students));
}

function calculateAge(dob) {
    if (!dob) {
        return "-";
    }

    var birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) {
        return "-";
    }

    var today = new Date();
    var age = today.getFullYear() - birthDate.getFullYear();

    if (
        today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
    ) {
        age = age - 1;
    }

    return age;
}

function escapeText(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

document.addEventListener("DOMContentLoaded", function () {
    var searchName = document.getElementById("searchName");
    var searchClass = document.getElementById("searchClass");
    var minAge = document.getElementById("minAge");
    var maxAge = document.getElementById("maxAge");
    var clearFiltersButton = document.getElementById("clearFilters");
    var logoutButton = document.getElementById("logoutButton");
    var tableBody = document.getElementById("studentTableBody");
    var countText = document.getElementById("studentCount");
    var editSection = document.getElementById("editSection");
    var editForm = document.getElementById("editStudentForm");
    var adminMessage = document.getElementById("adminMessage");
    var currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

    if (!currentUser || currentUser.role !== "admin") {
        window.location.href = "index.html";
        return;
    }

    function renderStudents() {
        var students = getStudents();
        var nameFilter = (searchName.value || "").trim().toLowerCase();
        var classFilter = (searchClass.value || "").trim().toLowerCase();
        var minAgeValue = Number(minAge.value || 0);
        var maxAgeValue = Number(maxAge.value || 9999);
        var filtered = [];

        for (var i = 0; i < students.length; i++) {
            var student = students[i];
            var age = calculateAge(student.dob);
            var nameMatch = !nameFilter || (student.name || "").toLowerCase().indexOf(nameFilter) !== -1;
            var classMatch = !classFilter || (student.studentClass || "").toLowerCase().indexOf(classFilter) !== -1;
            var ageMatch = Number(age) >= minAgeValue && Number(age) <= maxAgeValue;

            if (nameMatch && classMatch && ageMatch) {
                filtered.push(student);
            }
        }

        countText.textContent = "Total Students: " + filtered.length;

        if (filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="13">No matching student records found.</td></tr>';
            return;
        }

        var rows = "";

        for (var i = 0; i < filtered.length; i++) {
            var student = filtered[i];
            var studentAge = calculateAge(student.dob);
            var interests = Array.isArray(student.interests) ? student.interests.join(", ") : student.interests || "-";

            rows += "<tr>" +
                "<td>" + escapeText(student.id) + "</td>" +
                "<td>" + escapeText(student.name) + "</td>" +
                "<td>" + escapeText(student.email) + "</td>" +
                "<td>" + escapeText(student.dob) + "</td>" +
                "<td>" + escapeText(studentAge) + "</td>" +
                "<td>" + escapeText(student.gender) + "</td>" +
                "<td>" + escapeText(student.qualification) + "</td>" +
                "<td>" + escapeText(interests) + "</td>" +
                "<td>" + escapeText(student.studentClass) + "</td>" +
                "<td>" + escapeText(student.subject) + "</td>" +
                "<td>" + escapeText(student.marks) + "</td>" +
                "<td>" + escapeText(student.aadhaar || "No PDF") + "</td>" +
                "<td><button type='button' class='editStudentBtn' data-id='" + student.id + "'>Edit</button> <button type='button' class='deleteStudentBtn' data-id='" + student.id + "'>Delete</button></td>" +
                "</tr>";
        }

        tableBody.innerHTML = rows;
    }

    function fillEditForm(student) {
        document.getElementById("editStudentId").value = student.id;
        document.getElementById("editName").value = student.name || "";
        document.getElementById("editEmail").value = student.email || "";
        document.getElementById("editDob").value = student.dob || "";
        document.getElementById("editGender").value = student.gender || "Male";
        document.getElementById("editQualification").value = student.qualification || "";
        document.getElementById("editInterests").value = Array.isArray(student.interests) ? student.interests.join(", ") : student.interests || "";
        document.getElementById("editClass").value = student.studentClass || "";
        document.getElementById("editSubject").value = student.subject || "";
        document.getElementById("editMarks").value = student.marks || "";
        editSection.hidden = false;
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            localStorage.removeItem("currentUser");
            window.location.href = "index.html";
        });
    }

    [searchName, searchClass, minAge, maxAge].forEach(function (field) {
        if (field) {
            field.addEventListener("input", renderStudents);
        }
    });

    if (clearFiltersButton) {
        clearFiltersButton.addEventListener("click", function () {
            searchName.value = "";
            searchClass.value = "";
            minAge.value = "";
            maxAge.value = "";
            renderStudents();
        });
    }

    tableBody.addEventListener("click", function (event) {
        var editButton = event.target.closest(".editStudentBtn");
        var deleteButton = event.target.closest(".deleteStudentBtn");

        if (editButton) {
            var studentId = Number(editButton.dataset.id);
            var students = getStudents();

            for (var i = 0; i < students.length; i++) {
                if (Number(students[i].id) === studentId) {
                    fillEditForm(students[i]);
                    break;
                }
            }
        }

        if (deleteButton) {
            var studentId = Number(deleteButton.dataset.id);
            var students = getStudents();
            var index = -1;

            for (var i = 0; i < students.length; i++) {
                if (Number(students[i].id) === studentId) {
                    index = i;
                    break;
                }
            }

            if (index !== -1 && window.confirm("Delete this student record?")) {
                students.splice(index, 1);
                saveStudents(students);
                renderStudents();
                adminMessage.textContent = "Student record deleted successfully.";
                adminMessage.style.color = "#15803d";
            }
        }
    });

    document.getElementById("cancelEdit").addEventListener("click", function () {
        editSection.hidden = true;
        document.getElementById("editMessage").textContent = "";
    });

    if (editForm) {
        editForm.addEventListener("submit", function (event) {
            event.preventDefault();

            var studentId = Number(document.getElementById("editStudentId").value);
            var students = getStudents();
            var index = -1;

            for (var i = 0; i < students.length; i++) {
                if (Number(students[i].id) === studentId) {
                    index = i;
                    break;
                }
            }

            if (index === -1) {
                document.getElementById("editMessage").textContent = "Student not found.";
                return;
            }

            var updatedStudent = {
                id: students[index].id,
                name: students[index].name,
                email: students[index].email,
                password: students[index].password,
                dob: document.getElementById("editDob").value,
                gender: document.getElementById("editGender").value,
                qualification: document.getElementById("editQualification").value,
                interests: document.getElementById("editInterests").value.split(",").map(function (item) {
                    return item.trim();
                }).filter(Boolean),
                studentClass: document.getElementById("editClass").value.trim(),
                subject: document.getElementById("editSubject").value.trim(),
                marks: document.getElementById("editMarks").value,
                aadhaar: students[index].aadhaar
            };

            var aadhaarFile = document.getElementById("editAadhaar").files[0];
            if (aadhaarFile) {
                updatedStudent.aadhaar = aadhaarFile.name;
            }

            students[index] = updatedStudent;
            saveStudents(students);
            renderStudents();
            editSection.hidden = true;
            adminMessage.textContent = "Student details updated successfully.";
            adminMessage.style.color = "#15803d";
        });
    }

    renderStudents();
});