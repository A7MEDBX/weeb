// This file contains the JavaScript code for the hospital appointment system.
// It handles user interactions, such as form submissions for making appointments,
// and includes functions for validating input and updating the UI dynamically.

const api = "http://localhost:3001";
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    const appointmentForm = document.getElementById('appointment-form');
    const appointmentList = document.getElementById('appointment-list');

    appointmentForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const patientName = document.getElementById('patient-name').value;
        const doctorName = document.getElementById('doctor-name').value;
        const appointmentDate = document.getElementById('appointment-date').value;

        if (validateForm(patientName, doctorName, appointmentDate)) {
            addAppointmentToList(patientName, doctorName, appointmentDate);
            appointmentForm.reset();
        } else {
            alert('Please fill in all fields correctly.');
        }
    });

    function validateForm(patientName, doctorName, appointmentDate) {
        return patientName && doctorName && appointmentDate;
    }

    function addAppointmentToList(patientName, doctorName, appointmentDate) {
        const listItem = document.createElement('li');
        listItem.textContent = `Appointment for ${patientName} with Dr. ${doctorName} on ${appointmentDate}`;
        appointmentList.appendChild(listItem);
    }

    // Show/hide forms and dashboards based on navigation and role

    const loginSection = document.getElementById('login-section');
    const signupSection = document.getElementById('signup-section');
    const appointmentSection = document.getElementById('appointment-section');
    const confirmationSection = document.getElementById('confirmation');
    const dashboardPatient = document.getElementById('dashboard-patient');
    const dashboardDoctor = document.getElementById('dashboard-doctor');
    const dashboardStaff = document.getElementById('dashboard-staff');

    function hideAllSections() {
        loginSection.style.display = 'none';
        signupSection.style.display = 'none';
        appointmentSection.style.display = 'none';
        confirmationSection.style.display = 'none';
        dashboardPatient.style.display = 'none';
        dashboardDoctor.style.display = 'none';
        dashboardStaff.style.display = 'none';
    }

    // Navigation
    document.getElementById('nav-login').onclick = function() {
        hideAllSections();
        loginSection.style.display = 'block';
        return false;
    };
    document.getElementById('nav-signup').onclick = function() {
        hideAllSections();
        signupSection.style.display = 'block';
        return false;
    };

    // Login form
    document.getElementById('login-form').onsubmit = function(e) {
        e.preventDefault();
        // Fake login: show dashboard based on fake role
        const email = document.getElementById('login-email').value;
        let role = 'patient';
        if (email.includes('doctor')) role = 'doctor';
        if (email.includes('staff')) role = 'staff';
        hideAllSections();
        if (role === 'patient') dashboardPatient.style.display = 'block';
        if (role === 'doctor') dashboardDoctor.style.display = 'block';
        if (role === 'staff') dashboardStaff.style.display = 'block';
    };

    // Signup form
    document.getElementById('signup-form').onsubmit = function(e) {
        e.preventDefault();
        const role = document.getElementById('signup-role').value;
        hideAllSections();
        if (role === 'patient') dashboardPatient.style.display = 'block';
        if (role === 'doctor') dashboardDoctor.style.display = 'block';
        if (role === 'staff') dashboardStaff.style.display = 'block';
    };

    // Doctor search (filters doctors in the dropdown)
    document.getElementById('search-doctor-btn').onclick = function() {
        const specialty = document.getElementById('search-specialty').value;
        const doctorSelect = document.getElementById('doctor-name');
        for (let i = 0; i < doctorSelect.options.length; i++) {
            const opt = doctorSelect.options[i];
            if (!opt.dataset.specialty || specialty === "" || opt.dataset.specialty === specialty) {
                opt.style.display = '';
            } else {
                opt.style.display = 'none';
            }
        }
    };

    // Appointment booking
    document.getElementById('appointment-form').onsubmit = function(e) {
        e.preventDefault();
        hideAllSections();
        confirmationSection.style.display = 'block';
        document.getElementById('confirmation-message').textContent =
            "Your appointment has been booked! You will receive a reminder soon.";
        setTimeout(() => {
            hideAllSections();
            dashboardPatient.style.display = 'block';
        }, 2500);
    };

    // Show appointment section by default
    hideAllSections();
    appointmentSection.style.display = 'block';

    const doctors = [
        {
            name: "Dr. Smith",
            specialty: "dentist",
            avatar: "🦷",
            bio: "Expert in dental care and oral hygiene.",
        },
        {
            name: "Dr. Jones",
            specialty: "cardiologist",
            avatar: "❤️",
            bio: "Heart specialist with 10+ years experience.",
        },
        {
            name: "Dr. Brown",
            specialty: "general",
            avatar: "🩺",
            bio: "General practitioner for all ages.",
        }
    ];

    // Render doctors as cards
    function renderDoctors(filter = "") {
        const list = document.getElementById('doctors-list');
        list.innerHTML = "";
        doctors
            .filter(doc => !filter || doc.specialty === filter)
            .forEach(doc => {
                const card = document.createElement('div');
                card.className = "doctor-card";
                card.innerHTML = `
                    <div class="doctor-avatar">${doc.avatar}</div>
                    <div class="doctor-info">
                        <strong>${doc.name}</strong><br>
                        <span style="color:#1976d2;text-transform:capitalize;">${doc.specialty}</span>
                        <p style="margin:0.5rem 0 0 0;font-size:0.95rem;">${doc.bio}</p>
                    </div>
                    <button class="book-btn" data-doctor="${doc.name}">Book Checkup</button>
                `;
                list.appendChild(card);
            });
        // Add event listeners for book buttons
        document.querySelectorAll('.book-btn').forEach(btn => {
            btn.onclick = function() {
                showAppointmentModal(btn.getAttribute('data-doctor'));
            };
        });
    }

    // Modal logic
    const modal = document.getElementById('appointment-modal');
    const closeModal = document.getElementById('close-modal');
    function showAppointmentModal(doctorName) {
        document.getElementById('modal-doctor-name').value = doctorName;
        modal.style.display = 'flex';
    }
    closeModal.onclick = function() {
        modal.style.display = 'none';
    };
    window.onclick = function(event) {
        if (event.target === modal) modal.style.display = 'none';
    };

    // Doctor search
    document.getElementById('search-doctor-btn').onclick = function() {
        const specialty = document.getElementById('search-specialty').value;
        renderDoctors(specialty);
    };

    // Appointment booking from modal
    document.getElementById('appointment-form').onsubmit = function(e) {
        e.preventDefault();
        modal.style.display = 'none';
        document.getElementById('confirmation-message').textContent =
            "Your checkup with " + document.getElementById('modal-doctor-name').value + " has been booked!";
        document.getElementById('confirmation').style.display = 'block';
        setTimeout(() => {
            document.getElementById('confirmation').style.display = 'none';
            document.getElementById('dashboard-patient').style.display = 'block';
        }, 2500);
    };

    // Navigation and login/signup logic (as before)
    function hideAllSections() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('signup-section').style.display = 'none';
        document.getElementById('appointment-section').style.display = 'none';
        document.getElementById('confirmation').style.display = 'none';
        document.getElementById('dashboard-patient').style.display = 'none';
        document.getElementById('dashboard-doctor').style.display = 'none';
        document.getElementById('dashboard-staff').style.display = 'none';
    }
    document.getElementById('nav-login').onclick = function() {
        hideAllSections();
        document.getElementById('login-section').style.display = 'block';
        return false;
    };
    document.getElementById('nav-signup').onclick = function() {
        hideAllSections();
        document.getElementById('signup-section').style.display = 'block';
        return false;
    };
    document.getElementById('login-form').onsubmit = function(e) {
        e.preventDefault();
        // Fake login: show patient dashboard
        hideAllSections();
        document.getElementById('dashboard-patient').style.display = 'block';
    };
    document.getElementById('signup-form').onsubmit = function(e) {
        e.preventDefault();
        const role = document.getElementById('signup-role').value;
        hideAllSections();
        if (role === 'patient') document.getElementById('dashboard-patient').style.display = 'block';
        if (role === 'doctor') document.getElementById('dashboard-doctor').style.display = 'block';
        if (role === 'staff') document.getElementById('dashboard-staff').style.display = 'block';
    };

    // Show doctors by default
    hideAllSections();
    document.getElementById('appointment-section').style.display = 'block';
    renderDoctors();
});

// New code starts here

function showSection(id) {
    document.querySelectorAll('main > section').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

// Navigation
document.getElementById('nav-login').onclick = () => { showSection('login-section'); return false; };
document.getElementById('nav-signup').onclick = () => { showSection('signup-section'); return false; };

// Sign Up
document.getElementById('signup-form').onsubmit = async function(e) {
    e.preventDefault();
    document.getElementById('signup-error').textContent = '';
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const res = await fetch(api + '/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (data.error) {
        document.getElementById('signup-error').textContent = data.error;
    } else {
        showSection('pending-section');
    }
};

// Login
document.getElementById('login-form').onsubmit = async function(e) {
    e.preventDefault();
    document.getElementById('login-error').textContent = '';
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const res = await fetch(api + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.error) {
        document.getElementById('login-error').textContent = data.error;
    } else {
        currentUser = data;
        if (data.role === 'pending') {
            showSection('pending-section');
        } else if (data.role === 'staff' || data.role === 'admin') {
            loadUsersTable();
            showSection('dashboard-staff');
        } else if (data.role === 'patient') {
            document.getElementById('patient-name').textContent = data.name;
            showSection('dashboard-patient');
            await loadDoctors();
            await loadPatientAppointments();
        } else if (data.role === 'doctor') {
            document.getElementById('doctor-name').textContent = data.name;
            // Fetch the doctor's record using the current user's id.
            const res2 = await fetch(api + '/doctor/' + currentUser.id);
            const doctorRecord = await res2.json();
            // Store the doctor's record id along with currentUser.
            currentUser.doctor_id = doctorRecord ? doctorRecord.id : null;
            showSection('dashboard-doctor');
            await loadDoctorAppointments();
        }
    }
};

// Staff: Load users and assign roles
async function loadUsersTable() {
    const res = await fetch(api + '/users');
    const users = await res.json();
    const tbody = document.querySelector('#users-table tbody');
    tbody.innerHTML = '';
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>
                <select class="role-select">
                    <option value="pending" ${user.role === 'pending' ? 'selected' : ''}>pending</option>
                    <option value="patient" ${user.role === 'patient' ? 'selected' : ''}>patient</option>
                    <option value="doctor" ${user.role === 'doctor' ? 'selected' : ''}>doctor</option>
                    <option value="staff" ${user.role === 'staff' ? 'selected' : ''}>staff</option>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>admin</option>
                </select>
                <input type="text" class="specialty-input" placeholder="Specialty" style="display:none;width:90px;" value="${user.specialty || ''}">
                <button>Assign</button>
            </td>
        `;
        const select = tr.querySelector('.role-select');
        const specialtyInput = tr.querySelector('.specialty-input');
        select.onchange = () => {
            specialtyInput.style.display = select.value === 'doctor' ? '' : 'none';
        };
        if (select.value === 'doctor') specialtyInput.style.display = '';
        const btn = tr.querySelector('button');
        btn.onclick = async () => {
            const role = select.value;
            const specialty = role === 'doctor' ? specialtyInput.value : undefined;
            await fetch(api + '/assign-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, role, specialty })
            });
            loadUsersTable();
        };
        tbody.appendChild(tr);
    });
}

// Load doctors from backend and fill select
async function loadDoctors() {
    const res = await fetch(api + '/doctors');
    const doctors = await res.json();
    const select = document.getElementById('doctor-select');
    select.innerHTML = '';
    doctors.forEach(doc => {
        const opt = document.createElement('option');
        opt.value = doc.id;
        opt.textContent = `${doc.name} (${doc.specialty})`;
        select.appendChild(opt);
    });
}

// Book appointment (save to database)
document.getElementById('book-appointment-form').onsubmit = async function(e) {
    e.preventDefault();
    const doctor_id = document.getElementById('doctor-select').value;
    const date = document.getElementById('appointment-date').value;
    const time = document.getElementById('appointment-time').value;
    await fetch(api + '/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            patient_id: currentUser.id,
            doctor_id,
            date,
            time
        })
    });
    await loadPatientAppointments();
};

// Load patient's appointments
async function loadPatientAppointments() {
    const res = await fetch(api + '/appointments/patient/' + currentUser.id);
    const appointments = await res.json();
    const upcoming = document.getElementById('upcoming-appointments');
    const history = document.getElementById('appointment-history');
    upcoming.innerHTML = '';
    history.innerHTML = '';
    const now = new Date();
    appointments.forEach(app => {
        const appDate = new Date(app.date + 'T' + app.time);
        const li = document.createElement('li');
        li.textContent = `${app.date} ${app.time} with ${app.doctor_name} (${app.specialty})`;
        if (appDate >= now) {
            upcoming.appendChild(li);
        } else {
            history.appendChild(li);
        }
    });
}

// Load doctor's appointments
async function loadDoctorAppointments() {
    if (!currentUser.doctor_id) return;
    const res = await fetch(api + '/appointments/doctor/' + currentUser.doctor_id);
    const appointments = await res.json();
    
    const upcomingList = document.getElementById('doctor-upcoming-appointments');
    const completedList = document.getElementById('doctor-completed-appointments');
    upcomingList.innerHTML = '';
    completedList.innerHTML = '';
    
    appointments.forEach(app => {
        const li = document.createElement('li');
        li.textContent = `${app.date} ${app.time} with ${app.patient_name} - Status: ${app.status}`;
        
        if (app.status === 'upcoming') {
            // Add explicit "Perform Checkup" button
            const btn = document.createElement('button');
            btn.textContent = "Perform Checkup";
            btn.addEventListener('click', () => {
                openCheckupModal(app);
            });
            li.appendChild(btn);
            upcomingList.appendChild(li);
        } else {
            completedList.appendChild(li);
        }
    });
}

// Show login by default
showSection('login-section');

function openCheckupModal(appointment) {
    document.getElementById('checkup-details').textContent =
      `Performing checkup for ${appointment.patient_name} on ${appointment.date} at ${appointment.time}`;
    const modal = document.getElementById('checkup-modal');
    modal.setAttribute('data-appointment-id', appointment.id);
    modal.style.display = 'block';
    document.getElementById('modal-overlay').style.display = 'block';
}

function closeCheckupModal() {
    document.getElementById('checkup-modal').style.display = 'none';
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('checkup-notes').value = '';
}

// Event listeners for checkup modal buttons
document.getElementById('checkup-submit').addEventListener('click', async () => {
    const modal = document.getElementById('checkup-modal');
    const appointmentId = modal.getAttribute('data-appointment-id');
    const notes = document.getElementById('checkup-notes').value; // In a real app, you might save these notes

    // Mark appointment as completed (you could also send the 'notes' along with it)
    await fetch(api + '/appointments/' + appointmentId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
    });
    
    closeCheckupModal();
    loadDoctorAppointments(); // Refresh the appointments list
});

document.getElementById('checkup-cancel').addEventListener('click', () => {
    closeCheckupModal();
});