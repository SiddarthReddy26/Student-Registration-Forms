function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem("currentUser") || "null");
    } catch (err) {
        return null;
    }
}

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

function getCurrentStudent() {
    var user = getCurrentUser();

    if (!user || user.role !== "student") {
        return null;
    }

    var students = getStudents();

    for (var i = 0; i < students.length; i++) {
        if (String(students[i].id) === String(user.id)) {
            return students[i];
        }
    }

    return null;
}

function setText(id, value) {
    var element = document.getElementById(id);
    if (element) {
        element.textContent = value || "-";
    }
}

function fillProfile(student) {
    setText("welcomeMessage", "Welcome, " + student.name);
    setText("studentId", "User ID: " + student.id);
    setText("profileName", student.name);
    setText("profileEmail", student.email);
    setText("profileDob", student.dob);
    setText("profileGender", student.gender);
    setText("profileQualification", student.qualification);
    setText("profileInterests", Array.isArray(student.interests) && student.interests.length ? student.interests.join(", ") : "No interests selected");
    setText("profileClass", student.studentClass);
    setText("profileSubject", student.subject);
    setText("profileMarks", student.marks);
    setText("profileDocument", student.aadhaar || "No document selected");
}

function openEditForm(student) {
    document.getElementById("profileEditId").value = student.id;
    document.getElementById("profileEditName").value = student.name;
    document.getElementById("profileEditEmail").value = student.email;
    document.getElementById("profileEditDob").value = student.dob;
    document.getElementById("profileEditQualification").value = student.qualification || "";
    document.getElementById("profileEditClass").value = student.studentClass || "";
    document.getElementById("profileEditSubject").value = student.subject || "";
    document.getElementById("profileEditMarks").value = student.marks || "";

    var genderInputs = document.querySelectorAll('input[name="profileEditGender"]');
    for (var i = 0; i < genderInputs.length; i++) {
        genderInputs[i].checked = genderInputs[i].value === student.gender;
    }

    var interestInputs = document.querySelectorAll('input[name="profileEditInterests"]');
    for (var i = 0; i < interestInputs.length; i++) {
        interestInputs[i].checked = Array.isArray(student.interests) && student.interests.indexOf(interestInputs[i].value) !== -1;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    var currentStudent = getCurrentStudent();
    var logoutButton = document.getElementById("logoutButton");
    var editButton = document.getElementById("editProfileButton");
    var cancelButton = document.getElementById("cancelProfileEdit");
    var form = document.getElementById("editProfileForm");
    var editSection = document.getElementById("editProfileSection");

    if (!currentStudent) {
        window.location.href = "index.html";
        return;
    }

    fillProfile(currentStudent);

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            localStorage.removeItem("currentUser");
            window.location.href = "index.html";
        });
    }

    if (editButton) {
        editButton.addEventListener("click", function () {
            openEditForm(currentStudent);
            editSection.hidden = false;
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", function () {
            editSection.hidden = true;
            document.getElementById("profileEditMessage").textContent = "";
        });
    }

    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            var students = getStudents();
            var studentIndex = -1;

            for (var i = 0; i < students.length; i++) {
                if (String(students[i].id) === String(currentStudent.id)) {
                    studentIndex = i;
                    break;
                }
            }

            if (studentIndex === -1) {
                document.getElementById("profileEditMessage").textContent = "Student record not found.";
                return;
            }

            var selectedGender = document.querySelector('input[name="profileEditGender"]:checked');
            var selectedInterests = [];
            var interestInputs = document.querySelectorAll('input[name="profileEditInterests"]:checked');

            for (var i = 0; i < interestInputs.length; i++) {
                selectedInterests.push(interestInputs[i].value);
            }

            var updatedStudent = {
                id: students[studentIndex].id,
                name: document.getElementById("profileEditName").value.trim(),
                email: students[studentIndex].email,
                password: students[studentIndex].password,
                dob: document.getElementById("profileEditDob").value,
                gender: selectedGender ? selectedGender.value : "",
                qualification: document.getElementById("profileEditQualification").value,
                interests: selectedInterests,
                studentClass: document.getElementById("profileEditClass").value.trim(),
                subject: document.getElementById("profileEditSubject").value.trim(),
                marks: document.getElementById("profileEditMarks").value,
                aadhaar: students[studentIndex].aadhaar
            };

            var aadhaarFile = document.getElementById("profileEditAadhaar").files[0];
            if (aadhaarFile) {
                updatedStudent.aadhaar = aadhaarFile.name;
            }

            students[studentIndex] = updatedStudent;
            saveStudents(students);
            fillProfile(updatedStudent);
            editSection.hidden = true;
            document.getElementById("profileEditMessage").textContent = "Profile updated successfully.";
            document.getElementById("profileEditMessage").style.color = "#15803d";
        });
    }
});