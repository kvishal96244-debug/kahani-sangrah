// Global Variables
let allStories = [];
let currentPage = 1;
const storiesPerPage = 6;
let currentFilter = 'all';

// DOM Elements
const storiesContainer = document.getElementById('storiesContainer');
const storyModal = document.getElementById('storyModal');
const pageInfo = document.getElementById('pageInfo');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadStories();
    setupEventListeners();
});

// Load stories from localStorage or JSON
async function loadStories() {
    try {
        // Try to load from localStorage first
        const savedStories = localStorage.getItem('stories');
        
        if (savedStories) {
            allStories = JSON.parse(savedStories);
        } else {
            // Load from JSON file if no localStorage data
            const response = await fetch('data/stories.json');
            allStories = await response.json();
            localStorage.setItem('stories', JSON.stringify(allStories));
        }
        
        displayStories();
        updateStats();
    } catch (error) {
        console.error('Error loading stories:', error);
        storiesContainer.innerHTML = `
            <div class="error" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>कहानियाँ लोड करने में त्रुटि</h3>
                <p>पृष्ठ को रिफ्रेश करें या बाद में पुनः प्रयास करें</p>
            </div>
        `;
    }
}

// Display stories with pagination
function displayStories() {
    const filteredStories = filterStoriesByCategory();
    const startIndex = (currentPage - 1) * storiesPerPage;
    const endIndex = startIndex + storiesPerPage;
    const currentStories = filteredStories.slice(startIndex, endIndex);
    
    if (currentStories.length === 0) {
        storiesContainer.innerHTML = `
            <div class="no-stories" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-book" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                <h3>कोई कहानी नहीं मिली</h3>
                <p>कृपया अन्य श्रेणी चुनें या नई कहानी जोड़ें</p>
            </div>
        `;
        return;
    }
    
    storiesContainer.innerHTML = currentStories.map((story, index) => `
        <div class="story-card" onclick="openStory(${story.id})">
            <div class="story-img">
                <i class="fas fa-${getCategoryIcon(story.category)}"></i>
            </div>
            <div class="story-content">
                <span class="story-category">${getCategoryName(story.category)}</span>
                <h3>${story.title}</h3>
                <p class="story-description">${story.description}</p>
                <div class="story-meta">
                    <span><i class="far fa-calendar"></i> ${formatDate(story.date)}</span>
                    <span><i class="far fa-eye"></i> ${story.views || 0}</span>
                    <span><i class="far fa-heart"></i> ${story.likes || 0}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    // Update pagination
    updatePagination(filteredStories.length);
}

// Filter stories by category
function filterStoriesByCategory() {
    if (currentFilter === 'all') {
        return allStories;
    }
    return allStories.filter(story => story.category === currentFilter);
}

// Filter button click handler
window.filterStories = function(category) {
    currentFilter = category;
    currentPage = 1;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.trim() === getCategoryName(category) || 
            (category === 'all' && btn.textContent.trim() === 'सभी')) {
            btn.classList.add('active');
        }
    });
    
    displayStories();
}

// Open story in modal
window.openStory = function(storyId) {
    const story = allStories.find(s => s.id === storyId);
    if (!story) return;
    
    // Increment view count
    story.views = (story.views || 0) + 1;
    localStorage.setItem('stories', JSON.stringify(allStories));
    
    // Update modal content
    document.getElementById('modalTitle').textContent = story.title;
    document.getElementById('modalCategory').innerHTML = `
        <i class="fas fa-tag"></i> ${getCategoryName(story.category)}
    `;
    document.getElementById('modalDate').innerHTML = `
        <i class="far fa-calendar"></i> ${formatDate(story.date)}
    `;
    document.getElementById('modalViews').innerHTML = `
        <i class="far fa-eye"></i> ${story.views} पठन
    `;
    document.getElementById('modalContent').innerHTML = story.content;
    document.getElementById('likeCount').textContent = story.likes || 0;
    
    // Store current story ID
    storyModal.dataset.currentStory = storyId;
    
    // Show modal
    storyModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    storyModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Like story
window.likeStory = function() {
    const storyId = parseInt(storyModal.dataset.currentStory);
    const story = allStories.find(s => s.id === storyId);
    
    if (story) {
        story.likes = (story.likes || 0) + 1;
        localStorage.setItem('stories', JSON.stringify(allStories));
        document.getElementById('likeCount').textContent = story.likes;
        
        // Update in grid if visible
        const likeElement = document.querySelector(`[onclick="openStory(${storyId})"] .fa-heart`).parentElement;
        if (likeElement) {
            likeElement.innerHTML = `<i class="far fa-heart"></i> ${story.likes}`;
        }
        
        // Show animation
        const heart = document.querySelector('#likeCount');
        heart.parentElement.classList.add('liked');
        setTimeout(() => {
            heart.parentElement.classList.remove('liked');
        }, 1000);
    }
}

// Share story
window.shareStory = function() {
    const storyId = storyModal.dataset.currentStory;
    const story = allStories.find(s => s.id === parseInt(storyId));
    
    if (navigator.share) {
        navigator.share({
            title: story.title,
            text: story.description,
            url: window.location.href + '#story=' + storyId
        });
    } else {
        // Fallback
        const shareUrl = window.location.href + '#story=' + storyId;
        navigator.clipboard.writeText(shareUrl);
        alert('लिंक कॉपी हो गया! इसे शेयर करें।');
    }
}

// Print story
window.printStory = function() {
    window.print();
}

// Search stories
window.searchStories = function() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        displayStories();
        return;
    }
    
    const filteredStories = allStories.filter(story => 
        story.title.toLowerCase().includes(searchTerm) ||
        story.description.toLowerCase().includes(searchTerm) ||
        story.content.toLowerCase().includes(searchTerm)
    );
    
    if (filteredStories.length === 0) {
        storiesContainer.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                <h3>"${searchTerm}" के लिए कोई परिणाम नहीं</h3>
                <p>कृपया अन्य शब्द से खोजें</p>
            </div>
        `;
        updatePagination(0);
    } else {
        // Temporarily display search results
        const originalAllStories = [...allStories];
        allStories = filteredStories;
        currentPage = 1;
        currentFilter = 'all';
        displayStories();
        allStories = originalAllStories;
    }
}

// Pagination
function updatePagination(totalStories) {
    const totalPages = Math.ceil(totalStories / storiesPerPage);
    
    pageInfo.textContent = `पेज ${currentPage} / ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

window.changePage = function(direction) {
    const filteredStories = filterStoriesByCategory();
    const totalPages = Math.ceil(filteredStories.length / storiesPerPage);
    
    currentPage += direction;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    
    displayStories();
    window.scrollTo({ top: storiesContainer.offsetTop - 100, behavior: 'smooth' });
}

// Update statistics
function updateStats() {
    const totalStories = allStories.length;
    const totalViews = allStories.reduce((sum, story) => sum + (story.views || 0), 0);
    
    document.getElementById('totalStories').textContent = totalStories;
    document.getElementById('totalViews').textContent = totalViews;
}

// Helper functions
function getCategoryIcon(category) {
    const icons = {
        'moral': 'balance-scale',
        'love': 'heart',
        'comedy': 'laugh',
        'horror': 'ghost',
        'inspirational': 'mountain'
    };
    return icons[category] || 'book';
}

function getCategoryName(category) {
    const names = {
        'moral': 'नैतिक',
        'love': 'प्रेम',
        'comedy': 'हास्य',
        'horror': 'डरावनी',
        'inspirational': 'प्रेरणादायक',
        'all': 'सभी'
    };
    return names[category] || category;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('hi-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Setup event listeners
function setupEventListeners() {
    // Close modal on X click
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    
    // Close modal on outside click
    storyModal.addEventListener('click', function(e) {
        if (e.target === storyModal) {
            closeModal();
        }
    });
    
    // Mobile menu
    document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
        document.querySelector('.mobile-menu').classList.toggle('active');
    });
    
    // Search on Enter key
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchStories();
        }
    });
            }
