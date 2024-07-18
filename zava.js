// Simulated database using localStorage
const db = {
    saveUser(user) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
    },
    getUser(email) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        return users.find(u => u.email === email);
    },
    saveAttendance(section, date, attendance) {
        const key = `attendance_${section}_${date}`;
        localStorage.setItem(key, JSON.stringify(attendance));
    },
    getAttendance(section, date) {
        const key = `attendance_${section}_${date}`;
        return JSON.parse(localStorage.getItem(key) || '[]');
    }
};

// Helper function to get URL parameters
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Page-specific functionality
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;

    if (path.includes('signup.html')) {
        setupSignupPage();
    } else if (path.includes('login.html')) {
        setupLoginPage();
    } else if (path.includes('teacher.html')) {
        setupTeacherPage();
    } else if (path.includes('mark_attendance.html')) {
        setupMarkAttendancePage();
    } else if (path.includes('view_attendance.html')) {
        setupViewAttendancePage();
    }
});

function setupSignupPage() {
    const sections = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2'];
    const sectionsList = document.getElementById('sectionsList');
    sections.forEach(section => {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" name="sections" value="${section}"> ${section}`;
        sectionsList.appendChild(label);
    });

    document.getElementById('signupForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const sections = Array.from(document.querySelectorAll('input[name="sections"]:checked')).map(el => el.value);

        if (name && email && password && sections.length > 0) {
            db.saveUser({ name, email, password, sections });
            alert('Successfully signed up!');
            window.location.href = 'login.html';
        } else {
            alert('Please fill all fields and select at least one section.');
        }
    });
}

function setupLoginPage() {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const user = db.getUser(email);
        if (user && user.password === password) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'teacher.html';
        } else {
            alert('Invalid email or password.');
        }
    });
}

function setupTeacherPage() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('teacherName').textContent = user.name;
    const sectionButtons = document.getElementById('sectionButtons');
    user.sections.forEach(section => {
        const button = document.createElement('a');
        button.href = `mark_attendance.html?section=${section}`;
        button.className = 'btn';
        button.textContent = `Mark Attendance for ${section}`;
        sectionButtons.appendChild(button);
    });
}

function setupMarkAttendancePage() {
    const section = getUrlParam('section');
    document.getElementById('sectionName').textContent = section;

    const studentList = document.getElementById('studentList');
    for (let i = 1; i <= 30; i++) {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" name="attendance" value="${i}"> Roll No: ${i}`;
        studentList.appendChild(label);
    }

    document.getElementById('attendanceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const presentStudents = Array.from(document.querySelectorAll('input[name="attendance"]:checked')).map(el => parseInt(el.value));
        const date = new Date().toISOString().split('T')[0];
        db.saveAttendance(section, date, presentStudents);
        
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = `Attendance for ${section} on ${date} submitted successfully!`;
        messageDiv.style.color = 'green';
        
        document.querySelectorAll('input[name="attendance"]').forEach(checkbox => checkbox.checked = false);
    });
}

function setupViewAttendancePage() {
    document.getElementById('viewAttendanceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const date = document.getElementById('attendanceDate').value;
        const section = document.getElementById('attendanceSection').value;
        const attendance = db.getAttendance(section, date);

        const attendanceDisplay = document.getElementById('attendanceDisplay');
        attendanceDisplay.innerHTML = '';

        if (attendance.length === 0) {
            attendanceDisplay.textContent = 'No attendance data available for this date.';
        } else {
            const list = document.createElement('ul');
            attendance.forEach(studentId => {
                const li = document.createElement('li');
                li.textContent = `Student ID: ${studentId}`;
                list.appendChild(li);
            });
            attendanceDisplay.appendChild(list);
        }
    });
}