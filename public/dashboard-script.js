// Dashboard Script - All CRUD Operations and Profile Management

let currentUser = null;

// Check authentication and load initial data
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://localhost:3000/api/auth/check', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (!data.authenticated) {
            window.location.href = 'index.html';
            return;
        }

        currentUser = data.user;
        document.getElementById('userName').textContent = currentUser.username;
        
        // Load all data
        loadDashboardStats();
        loadDonors();
        loadRequests();
        loadProfile();
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = 'index.html';
    }
});

// Section navigation
function showSection(sectionName) {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.classList.remove('active');
    });

    const sectionMap = {
        'home': 'homeSection',
        'register-donor': 'registerDonorSection',
        'search-donor': 'searchDonorSection',
        'request-blood': 'requestBloodSection',
        'profile': 'profileSection'
    };

    document.getElementById(sectionMap[sectionName]).classList.add('active');
    event.target.classList.add('active');

    if (sectionName === 'search-donor') searchDonors();
    if (sectionName === 'profile') loadProfile();
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const [donorsRes, requestsRes] = await Promise.all([
            fetch('http://localhost:3000/api/donors/my', { credentials: 'include' }),
            fetch('http://localhost:3000/api/requests/my', { credentials: 'include' })
        ]);

        const donorsData = await donorsRes.json();
        const requestsData = await requestsRes.json();

        document.getElementById('myDonorsCount').textContent = donorsData.count || 0;
        document.getElementById('myRequestsCount').textContent = requestsData.count || 0;

        // Load recent donors for home section
        const recentList = document.getElementById('recentDonorsList');
        recentList.innerHTML = '';
        
        if (donorsData.donors && donorsData.donors.length > 0) {
            donorsData.donors.slice(0, 3).forEach(donor => {
                recentList.innerHTML += createDonorCard(donor);
            });
        } else {
            recentList.innerHTML = '<p class="no-results">No donors registered yet.</p>';
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// DONOR CRUD OPERATIONS
async function loadDonors() {
    try {
        const response = await fetch('http://localhost:3000/api/donors/my', {
            credentials: 'include'
        });
        const data = await response.json();

        const donorsList = document.getElementById('donorsList');
        donorsList.innerHTML = '';

        if (data.donors.length === 0) {
            donorsList.innerHTML = '<p class="no-results">No donors registered yet.</p>';
            return;
        }

        data.donors.forEach(donor => {
            donorsList.innerHTML += createDonorCard(donor);
        });
    } catch (error) {
        console.error('Error loading donors:', error);
    }
}

// function createDonorCard(donor) {
//     return `
//         <div class="crud-card">
//             <div class="crud-header">
//                 <span class="blood-badge">${donor.blood_group}</span>
//                 <div class="crud-actions">
//                     <button class="btn-icon btn-edit" onclick="editDonor(${donor.donor_id})" title="Edit">✏️</button>
//                     <button class="btn-icon btn-delete" onclick="deleteDonor(${donor.donor_id})" title="Delete">🗑️</button>
//                 </div>
//             </div>
//             <h3>${donor.name}</h3>
//             <div class="crud-details">
//                 <p><strong>Age:</strong> ${donor.age} years</p>
//                 <p><strong>Gender:</strong> ${donor.gender}</p>
//                 <p><strong>City:</strong> ${donor.city}</p>
//                 <p><strong>Phone:</strong> ${donor.phone}</p>
//                 <p class="created-date">Added: ${new Date(donor.created_at).toLocaleDateString()}</p>
//             </div>
//         </div>
//     `;
// }
function createDonorCard(donor) {
    return `
        <div class="crud-card">
            <div class="crud-header">
                <span class="blood-badge">${donor.blood_group}</span>
                
                <div class="crud-actions">
                    <button class="btn-action btn-edit" onclick="editDonor(${donor.donor_id})">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        Edit
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteDonor(${donor.donor_id})">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        Delete
                    </button>
                </div>
                </div>
            <h3>${donor.name}</h3>
            <div class="crud-details">
                <p><strong>Age:</strong> ${donor.age} years</p>
                <p><strong>Gender:</strong> ${donor.gender}</p>
                <p><strong>City:</strong> ${donor.city}</p>
                <p><strong>Phone:</strong> ${donor.phone}</p>
                <p class="created-date">Added: ${new Date(donor.created_at).toLocaleDateString()}</p>
            </div>
        </div>
    `;
}

document.getElementById('donorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelectorAll('#registerDonorSection .error-msg').forEach(el => el.textContent = '');

    const donorId = document.getElementById('donorId').value;
    const formData = {
        name: document.getElementById('donorName').value.trim(),
        age: parseInt(document.getElementById('donorAge').value),
        gender: document.getElementById('donorGender').value,
        blood_group: document.getElementById('donorBloodGroup').value,
        city: document.getElementById('donorCity').value.trim(),
        phone: document.getElementById('donorPhone').value.trim()
    };

    if (!validateDonorForm(formData)) return;

    try {
        const url = donorId 
            ? `http://localhost:3000/api/donors/${donorId}` 
            : 'http://localhost:3000/api/donors';
        
        const method = donorId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        const messageDiv = document.getElementById('donorMessage');
        
        if (data.success) {
            messageDiv.className = 'message success';
            messageDiv.textContent = '✅ ' + data.message;
            resetDonorForm();
            loadDonors();
            loadDashboardStats();
            setTimeout(() => messageDiv.textContent = '', 3000);
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = '❌ ' + data.message;
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

async function editDonor(donorId) {
    try {
        const response = await fetch(`http://localhost:3000/api/donors/${donorId}`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            const donor = data.donor;
            document.getElementById('donorId').value = donor.donor_id;
            document.getElementById('donorName').value = donor.name;
            document.getElementById('donorAge').value = donor.age;
            document.getElementById('donorGender').value = donor.gender;
            document.getElementById('donorBloodGroup').value = donor.blood_group;
            document.getElementById('donorCity').value = donor.city;
            document.getElementById('donorPhone').value = donor.phone;
            document.getElementById('donorBtnText').textContent = 'Update Donor';
            showSection('register-donor');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function deleteDonor(donorId) {
    if (!confirm('Are you sure you want to delete this donor?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/donors/${donorId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await response.json();
        
        if (data.success) {
            alert('✅ ' + data.message);
            loadDonors();
            loadDashboardStats();
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function resetDonorForm() {
    document.getElementById('donorForm').reset();
    document.getElementById('donorId').value = '';
    document.getElementById('donorBtnText').textContent = 'Register Donor';
    document.getElementById('donorMessage').textContent = '';
}

function validateDonorForm(data) {
    let isValid = true;

    if (!/^[a-zA-Z\s]{2,50}$/.test(data.name)) {
        document.getElementById('donorNameError').textContent = '2-50 letters only';
        isValid = false;
    }

    if (data.age < 18 || data.age > 65) {
        document.getElementById('donorAgeError').textContent = 'Age must be 18-65';
        isValid = false;
    }

    if (!/^[0-9]{10}$/.test(data.phone)) {
        document.getElementById('donorPhoneError').textContent = 'Must be 10 digits';
        isValid = false;
    }

    return isValid;
}

// SEARCH DONORS
async function searchDonors() {
    const bloodGroup = document.getElementById('searchBloodGroup').value;
    const city = document.getElementById('searchCity').value;

    const params = new URLSearchParams();
    if (bloodGroup) params.append('blood_group', bloodGroup);
    if (city) params.append('city', city);

    try {
        const response = await fetch(`http://localhost:3000/search-donors?${params.toString()}`);
        const data = await response.json();

        document.getElementById('resultsCount').textContent = `Found ${data.count} donor(s)`;
        
        const searchList = document.getElementById('searchDonorsList');
        searchList.innerHTML = '';

        if (data.donors.length === 0) {
            searchList.innerHTML = '<p class="no-results">No donors found.</p>';
            return;
        }

        data.donors.forEach(donor => {
            searchList.innerHTML += createDonorCard(donor).replace('btn-edit', 'btn-edit hidden').replace('btn-delete', 'btn-delete hidden');
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// BLOOD REQUEST CRUD
async function loadRequests() {
    try {
        const response = await fetch('http://localhost:3000/api/requests/my', {
            credentials: 'include'
        });
        const data = await response.json();

        const requestsList = document.getElementById('requestsList');
        requestsList.innerHTML = '';

        if (data.requests.length === 0) {
            requestsList.innerHTML = '<p class="no-results">No blood requests yet.</p>';
            return;
        }

        data.requests.forEach(request => {
            requestsList.innerHTML += createRequestCard(request);
        });
    } catch (error) {
        console.error('Error loading requests:', error);
    }
}

// function createRequestCard(request) {
//     const statusClass = request.status.toLowerCase();
//     return `
//         <div class="crud-card">
//             <div class="crud-header">
//                 <span class="blood-badge">${request.blood_group}</span>
//                 <span class="status-badge status-${statusClass}">${request.status}</span>
//                 <div class="crud-actions">
//                     <button class="btn-icon btn-edit" onclick="editRequest(${request.req_id})" title="Edit">✏️</button>
//                     <button class="btn-icon btn-delete" onclick="deleteRequest(${request.req_id})" title="Delete">🗑️</button>
//                 </div>
//             </div>
//             <h3>${request.name}</h3>
//             <div class="crud-details">
//                 <p><strong>City:</strong> ${request.city}</p>
//                 <p><strong>Reason:</strong> ${request.reason}</p>
//                 <p><strong>Phone:</strong> ${request.phone}</p>
//                 <p class="created-date">Requested: ${new Date(request.created_at).toLocaleDateString()}</p>
//             </div>
//         </div>
//     `;
// }


function createRequestCard(request) {
    const statusClass = request.status.toLowerCase();
    return `
        <div class="crud-card">
            <div class="crud-header">
                <div style="display:flex; gap:8px;">
                    <span class="blood-badge">${request.blood_group}</span>
                    <span class="status-badge status-${statusClass}">${request.status}</span>
                </div>

                <div class="crud-actions">
                    <button class="btn-action btn-edit" onclick="editRequest(${request.req_id})">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        Edit
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteRequest(${request.req_id})">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        Delete
                    </button>
                </div>
                </div>
            <h3>${request.name}</h3>
            <div class="crud-details">
                <p><strong>City:</strong> ${request.city}</p>
                <p><strong>Reason:</strong> ${request.reason}</p>
                <p><strong>Phone:</strong> ${request.phone}</p>
                <p class="created-date">Requested: ${new Date(request.created_at).toLocaleDateString()}</p>
            </div>
        </div>
    `;
}

document.getElementById('requestForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelectorAll('#requestBloodSection .error-msg').forEach(el => el.textContent = '');

    const requestId = document.getElementById('requestId').value;
    const formData = {
        name: document.getElementById('reqName').value.trim(),
        blood_group: document.getElementById('reqBloodGroup').value,
        city: document.getElementById('reqCity').value.trim(),
        reason: document.getElementById('reqReason').value.trim(),
        phone: document.getElementById('reqPhone').value.trim(),
        status: document.getElementById('reqStatus').value
    };

    if (!validateRequestForm(formData)) return;

    try {
        const url = requestId 
            ? `http://localhost:3000/api/requests/${requestId}` 
            : 'http://localhost:3000/api/requests';
        
        const method = requestId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        const messageDiv = document.getElementById('requestMessage');
        
        if (data.success) {
            messageDiv.className = 'message success';
            messageDiv.textContent = '✅ ' + data.message;
            resetRequestForm();
            loadRequests();
            loadDashboardStats();
            setTimeout(() => messageDiv.textContent = '', 3000);
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = '❌ ' + data.message;
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

async function editRequest(requestId) {
    try {
        const response = await fetch(`http://localhost:3000/api/requests/${requestId}`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            const request = data.request;
            document.getElementById('requestId').value = request.req_id;
            document.getElementById('reqName').value = request.name;
            document.getElementById('reqBloodGroup').value = request.blood_group;
            document.getElementById('reqCity').value = request.city;
            document.getElementById('reqReason').value = request.reason;
            document.getElementById('reqPhone').value = request.phone;
            document.getElementById('reqStatus').value = request.status;
            document.getElementById('requestBtnText').textContent = 'Update Request';
            showSection('request-blood');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function deleteRequest(requestId) {
    if (!confirm('Are you sure you want to delete this request?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/requests/${requestId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await response.json();
        
        if (data.success) {
            alert('✅ ' + data.message);
            loadRequests();
            loadDashboardStats();
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function resetRequestForm() {
    document.getElementById('requestForm').reset();
    document.getElementById('requestId').value = '';
    document.getElementById('requestBtnText').textContent = 'Submit Request';
    document.getElementById('requestMessage').textContent = '';
}

function validateRequestForm(data) {
    let isValid = true;

    if (!/^.{2,50}$/.test(data.name)) {
        document.getElementById('reqNameError').textContent = '2-50 characters required';
        isValid = false;
    }

    if (!/^.{5,100}$/.test(data.reason)) {
        document.getElementById('reqReasonError').textContent = '5-100 characters required';
        isValid = false;
    }

    if (!/^[0-9]{10}$/.test(data.phone)) {
        document.getElementById('reqPhoneError').textContent = 'Must be 10 digits';
        isValid = false;
    }

    return isValid;
}

// USER PROFILE MANAGEMENT
async function loadProfile() {
    try {
        const response = await fetch('http://localhost:3000/api/profile', {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            const user = data.user;
            
            // Display profile info
            document.getElementById('profileFullName').textContent = user.full_name;
            document.getElementById('profileEmail').textContent = user.email;
            document.getElementById('profileInitials').textContent = user.full_name.charAt(0).toUpperCase();
            
            // Fill edit form
            document.getElementById('profileUsername').value = user.username;
            document.getElementById('profileFullNameEdit').value = user.full_name;
            document.getElementById('profileEmailEdit').value = user.email;
            document.getElementById('profilePhoneEdit').value = user.phone;
            
            // Stats
            document.getElementById('profileDonorCount').textContent = data.stats.donors;
            document.getElementById('profileRequestCount').textContent = data.stats.requests;
            document.getElementById('profileMemberSince').textContent = 
                new Date(user.created_at).toLocaleDateString();
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelectorAll('#profileSection .error-msg').forEach(el => el.textContent = '');

    const formData = {
        full_name: document.getElementById('profileFullNameEdit').value.trim(),
        email: document.getElementById('profileEmailEdit').value.trim(),
        phone: document.getElementById('profilePhoneEdit').value.trim()
    };

    let isValid = true;

    if (!/^[a-zA-Z\s]{2,100}$/.test(formData.full_name)) {
        document.getElementById('profileFullNameError').textContent = '2-100 letters only';
        isValid = false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        document.getElementById('profileEmailError').textContent = 'Invalid email';
        isValid = false;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
        document.getElementById('profilePhoneError').textContent = 'Must be 10 digits';
        isValid = false;
    }

    if (!isValid) return;

    try {
        const response = await fetch('http://localhost:3000/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        const messageDiv = document.getElementById('profileMessage');
        
        if (data.success) {
            messageDiv.className = 'message success';
            messageDiv.textContent = '✅ Profile updated successfully!';
            loadProfile();
            setTimeout(() => messageDiv.textContent = '', 3000);
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = '❌ ' + data.message;
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    
    if (!confirm('Are you sure you want to logout?')) return;

    try {
        await fetch('http://localhost:3000/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
});