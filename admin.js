// Admin Panel JavaScript
let quill;
let currentEditingId = null;
let adminStories = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeQuill();
    checkAdminLogin();
});

// Initialize Quill Editor
function initializeQuill() {
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean']
            ]
        },
        placeholder: 'अपनी कहानी यहाँ लिखें...'
    });
}

// Check if admin is logged in
function checkAdminLogin() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (isLoggedIn) {
        showDashboard();
    }
}

// Admin Login
window.adminLogin = function() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');
    
    // Default credentials
    const defaultUsername = 'admin';
    const defaultPassword = 'admin123';
    
    // Get custom credentials from settings
    const savedUsername = localStorage.getItem('adminUsername') || defaultUsername;
    const savedPassword = localStorage.getItem('adminPassword') || defaultPassword;
    
    if (username === savedUsername && password === savedPassword) {
        localStorage.setItem('adminLoggedIn', 'true');
        showDashboard();
        errorElement.textContent = '';
    } else {
        errorElement.textContent = 'गलत यूज़रनेम या पासवर्ड!';
    }
}

// Show Dashboard
function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    loadAdminData();
}

// Logout
window.logout = function() {
    localStorage.removeItem('adminLoggedIn');
    location.reload();
}

// Show section
window.showSection = function(section) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(el => {
        el.style.display = 'none';
    });
    
    // Remove active class from all menu items
    document.querySelectorAll('.sidebar-menu li').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(section + 'Section').style.display = 'block';
    
    // Add active class to clicked menu item
    event.target.classList.add('active');
    
    // Load data if needed
    if (section === 'analytics') {
        loadAnalytics();
    }
}

// Load admin data
function loadAdminData() {
    // Load stories
    const savedStories = localStorage.getItem('stories');
    adminStories = savedStories ? JSON.parse(savedStories) : [];
    
    // Load settings
    loadSettings();
    
    // Update stories table
    updateAdminStoriesTable();
    
    // Update stats
    updateAdminStats();
}

// Update admin stories table
function updateAdminStoriesTable() {
    const tbody = document.getElementById('adminStoriesTable');
    
    if (adminStories.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <i class="fas fa-book" style="font-size: 2rem; color: #ccc; margin-bottom: 10px;"></i>
                    <p>कोई कहानी नहीं है</p>
                    <button onclick="showSection('addStory')" style="margin-top: 10px; padding: 5px 15px;">
                        पहली कहानी जोड़ें
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = adminStories.map((story, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${story.title}</strong></td>
            <td><span class="category-badge">${getCategoryName(story.category)}</span></td>
            <td>${formatDate(story.date)}</td>
            <td>${story.views || 0}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="editStory(${story.id})" class="action-btn edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteStory(${story.id})" class="action-btn delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Search in admin
window.searchAdminStories = function() {
    const searchTerm = document.getElementById('adminSearch').value.toLowerCase();
    
    const filtered = adminStories.filter(story => 
        story.title.toLowerCase().includes(searchTerm) ||
        story.description.toLowerCase().includes(searchTerm)
    );
    
    updateTableWithStories(filtered);
}

// Filter in admin
window.filterAdminStories = function() {
    const category = document.getElementById('categoryFilter').value;
    
    if (category === 'all') {
        updateTableWithStories(adminStories);
    } else {
        const filtered = adminStories.filter(story => story.category === category);
        updateTableWithStories(filtered);
    }
}

// Update table with stories
function updateTableWithStories(stories) {
    const tbody = document.getElementById('adminStoriesTable');
    
    if (stories.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px;">
                    कोई परिणाम नहीं मिला
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = stories.map((story, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${story.title}</strong></td>
            <td><span class="category-badge">${getCategoryName(story.category)}</span></td>
            <td>${formatDate(story.date)}</td>
            <td>${story.views || 0}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="editStory(${story.id})" class="action-btn edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteStory(${story.id})" class="action-btn delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Edit story
window.editStory = function(storyId) {
    const story = adminStories.find(s => s.id === storyId);
    if (!story) return;
    
    // Fill form
    document.getElementById('storyTitle').value = story.title;
    document.getElementById('storyCategory').value = story.category;
    document.getElementById('storyDescription').value = story.description;
    quill.root.innerHTML = story.content;
    
    // Set editing mode
    currentEditingId = storyId;
    
    // Change button text
    const saveBtn = document.querySelector('.save-btn');
    saveBtn.innerHTML = '<i class="fas fa-save"></i> कहानी अपडेट करें';
    
    // Show add story section
    showSection('addStory');
}

// Delete story
window.deleteStory = function(storyId) {
    if (!confirm('क्या आप वाकई इस कहानी को डिलीट करना चाहते हैं?')) {
        return;
    }
    
    adminStories = adminStories.filter(s => s.id !== storyId);
    localStorage.setItem('stories', JSON.stringify(adminStories));
    
    updateAdminStoriesTable();
    updateAdminStats();
    
    alert('कहानी डिलीट हो गई!');
}

// Save story
window.saveStory = function() {
    const title = document.getElementById('storyTitle').value.trim();
    const category = document.getElementById('storyCategory').value;
    const description = document.getElementById('storyDescription').value.trim();
    const content = quill.root.innerHTML;
    
    if (!title || !description || !content || content === '<p><br></p>') {
        alert('कृपया सभी फ़ील्ड भरें!');
        return;
    }
    
    const storyData = {
        id: currentEditingId || Date.now(),
        title,
        category,
        description,
        content,
        date: new Date().toISOString(),
        views: 0,
        likes: 0
    };
    
    if (currentEditingId) {
        // Update existing story
        const index = adminStories.findIndex(s => s.id === currentEditingId);
        if (index !== -1) {
            adminStories[index] = storyData;
        }
    } else {
        // Add new story
        adminStories.push(storyData);
    }
    
    // Save to localStorage
    localStorage.setItem('stories', JSON.stringify(adminStories));
    
    // Reset form
    clearForm();
    
    // Update UI
    updateAdminStoriesTable();
    updateAdminStats();
    
    alert(currentEditingId ? 'कहानी अपडेट हो गई!' : 'कहानी सहेजी गई!');
    showSection('stories');
}

// Clear form
window.clearForm = function() {
    document.getElementById('storyTitle').value = '';
    document.getElementById('storyDescription').value = '';
    quill.root.innerHTML = '';
    currentEditingId = null;
    
    // Reset button text
    const saveBtn = document.querySelector('.save-btn');
    saveBtn.innerHTML = '<i class="fas fa-save"></i> कहानी सहेजें';
}

// Preview story
window.previewStory = function() {
    const title = document.getElementById('storyTitle').value || 'पूर्वावलोकन';
    const content = quill.root.innerHTML || '<p>सामग्री यहाँ दिखाई देगी...</p>';
    
    document.getElementById('previewTitle').textContent = title;
    document.getElementById('previewContent').innerHTML = content;
    
    document.getElementById('previewModal').style.display = 'block';
}

// Close preview
window.closePreview = function() {
    document.getElementById('previewModal').style.display = 'none';
}

// Load analytics
function loadAnalytics() {
    const totalStories = adminStories.length;
    const totalViews = adminStories.reduce((sum, story) => sum + (story.views || 0), 0);
    const totalLikes = adminStories.reduce((sum, story) => sum + (story.likes || 0), 0);
    
    document.getElementById('totalStoriesCount').textContent = totalStories;
    document.getElementById('totalViewsCount').textContent = totalViews;
    document.getElementById('totalLikesCount').textContent = totalLikes;
    
    // Calculate active readers (stories with more than 10 views)
    const activeReaders = adminStories.filter(s => (s.views || 0) > 10).length;
    document.getElementById('activeReaders').textContent = activeReaders;
    
    // Create category chart
    createCategoryChart();
}

// Create category chart
function createCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    // Count stories by category
    const categories = {};
    adminStories.forEach(story => {
        categories[story.category] = (categories[story.category] || 0) + 1;
    });
    
    const categoryNames = Object.keys(categories).map(getCategoryName);
    const categoryCounts = Object.values(categories);
    
    // Destroy existing chart if exists
    if (window.categoryChartInstance) {
        window.categoryChartInstance.destroy();
    }
    
    window.categoryChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categoryNames,
            datasets: [{
                data: categoryCounts,
                backgroundColor: [
                    '#4f46e5',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Load settings
function loadSettings() {
    const siteName = localStorage.getItem('siteName') || 'कहानी संग्रह';
    const siteDescription = localStorage.getItem('siteDescription') || 'हिंदी कहानियों का अद्भुत संसार';
    
    document.getElementById('siteName').value = siteName;
    document.getElementById('siteDescription').value = siteDescription;
}

// Save settings
window.saveSettings = function() {
    const siteName = document.getElementById('siteName').value;
    const siteDescription = document.getElementById('siteDescription').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Save site settings
    localStorage.setItem('siteName', siteName);
    localStorage.setItem('siteDescription', siteDescription);
    
    // Save password if changed
    if (newPassword && newPassword === confirmPassword) {
        localStorage.setItem('adminPassword', newPassword);
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        alert('पासवर्ड बदल गया!');
    } else if (newPassword && newPassword !== confirmPassword) {
        alert('पासवर्ड मेल नहीं खाते!');
        return;
    }
    
    alert('सेटिंग्स सहेजी गईं!');
}

// Update admin stats
function updateAdminStats() {
    const totalStories = adminStories.length;
    const totalViews = adminStories.reduce((sum, story) => sum + (story.views || 0), 0);
    
    document.getElementById('adminStats').innerHTML = `
        <p><i class="fas fa-book"></i> ${totalStories} कहानियाँ</p>
        <p><i class="fas fa-eye"></i> ${totalViews} पठन</p>
    `;
}
