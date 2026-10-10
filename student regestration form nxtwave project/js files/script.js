var adminEmail = "admin@gmail.com";
var adminPassword = "admin123";

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

function emailAlreadyExists(email, students) {
    var lowerEmail = email.trim().toLowerCase();

    for (var i = 0; i < students.length; i++) {
        if ((students[i].email || "").trim().toLowerCase() === lowerEmail) {
            return true;
        }
    }

    return false;
}

function getCheckedValues(name) {
    var checkboxes = document.querySelectorAll('input[name="' + name + '"]:checked');
    var values = [];

    for (var i = 0; i < checkboxes.length; i++) {
        values.push(checkboxes[i].value);
    }

    return values;
}

function setMessage(id, message, isError) {
    var element = document.getElementById(id);

    if (!element) {
        return;
    }

    element.textContent = message;
    element.style.color = isError === false ? "#15803d" : "#dc2626";
}

function showSection(sectionId) {
    var allSections = document.querySelectorAll(".form-section");

    for (var i = 0; i < allSections.length; i++) {
        allSections[i].hidden = allSections[i].id !== sectionId;
    }
}

function getNextStudentId() {
    var currentId = Number(localStorage.getItem("studentCounter") || "0");
    var nextId = currentId + 1;
    localStorage.setItem("studentCounter", String(nextId));
    return nextId;
}

document.addEventListener("DOMContentLoaded", function () {
    var registerForm = document.getElementById("registerForm");
    var loginForm = document.getElementById("loginForm");
    var forgotForm = document.getElementById("forgotForm");

    document.getElementById("showLogin").addEventListener("click", function () {
        showSection("loginSection");
    });

    document.getElementById("showRegister").addEventListener("click", function () {
        showSection("registerSection");
    });

    document.getElementById("showForgot").addEventListener("click", function () {
        showSection("forgotSection");
    });

    document.getElementById("backToLogin").addEventListener("click", function () {
        showSection("loginSection");
    });

    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();

            var name = document.getElementById("name").value.trim();
            var email = document.getElementById("email").value.trim();
            var password = document.getElementById("password").value.trim();
            var dob = document.getElementById("dob").value.trim();
            var gender = document.querySelector('input[name="gender"]:checked');
            var qualification = document.getElementById("qualification").value;
            var studentClass = document.getElementById("studentClass").value.trim();
            var subject = document.getElementById("subject").value.trim();
            var marks = document.getElementById("marks").value.trim();
            var aadhaarFile = document.getElementById("aadhaar").files[0];
            var interests = getCheckedValues("interests");
            var students = getStudents();

            if (!name || !email || !password || !dob || !gender || !qualification || !studentClass || !subject || !marks || !aadhaarFile) {
                setMessage("registerMessage", "Please fill in all details and upload the Aadhaar PDF.", true);
                return;
            }

            if (password.length < 8) {
                setMessage("registerMessage", "Password must be at least 8 characters long.", true);
                return;
            }

            if (emailAlreadyExists(email, students)) {
                setMessage("registerMessage", "This email is already registered. Please use a different email.", true);
                return;
            }

            students.push({
                id: getNextStudentId(),
                name: name,
                email: email,
                password: password,
                dob: dob,
                gender: gender.value,
                qualification: qualification,
                interests: interests,
                studentClass: studentClass,
                subject: subject,
                marks: marks,
                aadhaar: aadhaarFile.name
            });

            saveStudents(students);
            setMessage("registerMessage", "Registration successful! You can log in now.", false);
            registerForm.reset();
            showSection("loginSection");
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            var email = document.getElementById("loginEmail").value.trim();
            var password = document.getElementById("loginPassword").value.trim();
            var students = getStudents();

            if (email === adminEmail && password === adminPassword) {
                localStorage.setItem("currentUser", JSON.stringify({ id: "admin", role: "admin", email: email }));
                window.location.href = "admin.html";
                return;
            }

            var student = null;

            for (var i = 0; i < students.length; i++) {
                if (students[i].email.toLowerCase() === email.toLowerCase() && students[i].password === password) {
                    student = students[i];
                    break;
                }
            }

            if (!student) {
                setMessage("loginMessage", "Invalid email or password. Please try again.", true);
                return;
            }

            localStorage.setItem("currentUser", JSON.stringify({ id: student.id, role: "student", email: student.email }));
            window.location.href = "student.html";
        });
    }

    if (forgotForm) {
        forgotForm.addEventListener("submit", function (event) {
            event.preventDefault();

            var email = document.getElementById("forgotEmail").value.trim();
            var newPassword = document.getElementById("newPassword").value.trim();
            var students = getStudents();
            var foundStudent = null;

            for (var i = 0; i < students.length; i++) {
                if (students[i].email.toLowerCase() === email.toLowerCase()) {
                    foundStudent = students[i];
                    break;
                }
            }

            if (!foundStudent) {
                setMessage("forgotMessage", "No account is registered with this email.", true);
                return;
            }

            if (newPassword.length < 8) {
                setMessage("forgotMessage", "New password must be at least 8 characters long.", true);
                return;
            }

            foundStudent.password = newPassword;
            saveStudents(students);
            setMessage("forgotMessage", "Password reset successfully. Please login with your new password.", false);
            forgotForm.reset();
        });
    }
});