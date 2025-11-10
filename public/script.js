// Common JavaScript Functions
// This file can be used for shared functionality across pages

// Format date to readable format
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Show loading spinner (optional enhancement)
function showLoading() {
    // You can add a loading spinner implementation here
    console.log('Loading...');
}

// Hide loading spinner
function hideLoading() {
    console.log('Loading complete');
}

// Validate phone number
function validatePhone(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
}

// Validate age
function validateAge(age) {
    return age >= 18 && age <= 65;
}

// Show notification (optional enhancement)
function showNotification(message, type) {
    alert(message); // Simple alert, can be enhanced with custom notifications
}