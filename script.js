// HAVI Main Script
console.log('HAVI application loaded');

// Set PDF.js worker
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// ============================================
// TAB SWITCHING FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    setupTabSwitching();
    setupArticles();
    setupInsuranceModals();
    setupChatInterface();
});

function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab + '-tab').classList.add('active');
        });
    });
}

// ============================================
// ARTICLES FUNCTIONALITY
// ============================================

async function fetchOncologyArticles(maxResults = 3) {
    const articlesContainer = document.getElementById('articlesContainer');
    
    try {
        const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=oncology+cancer+treatment&retmax=${maxResults}&retmode=json&sort=relevance`;
        
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        
        if (!searchData.esearchresult || !searchData.esearchresult.idlist) {
            throw new Error('No articles found');
        }
        
        const ids = searchData.esearchresult.idlist;
        const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
        
        const summaryResponse = await fetch(summaryUrl);
        const summaryData = await summaryResponse.json();
        
        articlesContainer.innerHTML = '';
        
        ids.forEach(id => {
            const article = summaryData.result[id];
            if (article) {
                const articleCard = createArticleCard(article, id);
                articlesContainer.appendChild(articleCard);
            }
        });
        
    } catch (error) {
        console.error('Error fetching articles:', error);
        articlesContainer.innerHTML = `
            <div class="article-card">
                <h3>Sample Article: Advances in Cancer Immunotherapy</h3>
                <p class="article-authors">Smith J, Johnson M, et al.</p>
                <p class="article-source">Journal of Clinical Oncology - 2026</p>
                <a href="#" class="article-link">Read more →</a>
            </div>
            <div class="article-card">
                <h3>Precision Medicine in Oncology: Current Trends</h3>
                <p class="article-authors">Chen L, Williams K, et al.</p>
                <p class="article-source">Nature Cancer Reviews - 2026</p>
                <a href="#" class="article-link">Read more →</a>
            </div>
            <div class="article-card">
                <h3>Targeted Therapy for Breast Cancer Treatment</h3>
                <p class="article-authors">Davis R, Martinez A, et al.</p>
                <p class="article-source">The Lancet Oncology - 2026</p>
                <a href="#" class="article-link">Read more →</a>
            </div>
        `;
    }
}

function createArticleCard(article, id) {
    const card = document.createElement('div');
    card.className = 'article-card';
    
    const authors = article.authors && article.authors.length > 0 
        ? article.authors.slice(0, 3).map(a => a.name).join(', ') + (article.authors.length > 3 ? ', et al.' : '')
        : 'Unknown authors';
    
    const source = article.source || 'PubMed';
    const date = article.pubdate || '2026';
    
    card.innerHTML = `
        <h3>${article.title}</h3>
        <p class="article-authors">${authors}</p>
        <p class="article-source">${source} - ${date}</p>
        <a href="https://pubmed.ncbi.nlm.nih.gov/${id}/" target="_blank" class="article-link">Read more →</a>
    `;
    
    return card;
}

function setupArticles() {
    // Fetch articles on page load
    const articlesContainer = document.getElementById('articlesContainer');
    if (articlesContainer) {
        fetchOncologyArticles(3);
    }
    
    // Search functionality
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                alert(`Searching for: ${query}\n\nSearch functionality will be implemented in the next phase.`);
            }
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }
}

// ============================================
// INSURANCE MODAL FUNCTIONALITY
// ============================================

function setupInsuranceModals() {
    window.showInsuranceModal = function(productName) {
        const modal = document.getElementById('insuranceModal');
        const modalBody = document.getElementById('modalBody');
        
        const productDetails = {
            'MediCare Plus': {
                content: `
                    <h3>MediCare Plus - Critical Illness Insurance</h3>
                    <p><strong>Coverage Amount:</strong> Up to $500,000</p>
                    <p><strong>Key Benefits:</strong></p>
                    <ul>
                        <li>Covers 100+ critical illnesses including all major cancers</li>
                        <li>Lump sum payout upon diagnosis with no waiting period</li>
                        <li>Cancer treatment support and second opinion services</li>
                        <li>24/7 medical hotline with specialist access</li>
                        <li>No medical examination required for coverage up to $100,000</li>
                    </ul>
                    <p><strong>Premium:</strong> Starting from $150/month</p>
                    <p><strong>Special Features:</strong> Early stage cancer coverage, worldwide protection, and flexible payment terms.</p>
                `
            },
            'HealthGuard Premium': {
                content: `
                    <h3>HealthGuard Premium - Medical & Critical Illness</h3>
                    <p><strong>Coverage Amount:</strong> Unlimited annual coverage</p>
                    <p><strong>Key Benefits:</strong></p>
                    <ul>
                        <li>Comprehensive hospitalization and surgery coverage</li>
                        <li>Critical illness coverage with cancer-specific benefits</li>
                        <li>Access to cancer specialists and treatment centers globally</li>
                        <li>Second and third opinion services at top medical institutions</li>
                        <li>Experimental and targeted therapy coverage</li>
                        <li>Rehabilitation and post-treatment care</li>
                    </ul>
                    <p><strong>Premium:</strong> Starting from $280/month</p>
                    <p><strong>Special Features:</strong> VIP treatment access, global emergency medical evacuation, and lifetime renewability guarantee.</p>
                `
            },
            'CancerCare Shield': {
                content: `
                    <h3>CancerCare Shield - Specialized Cancer Insurance</h3>
                    <p><strong>Coverage Amount:</strong> Up to $1,000,000</p>
                    <p><strong>Key Benefits:</strong></p>
                    <ul>
                        <li>Specialized coverage for all cancer types and stages</li>
                        <li>Immunotherapy and targeted therapy treatments</li>
                        <li>Clinical trial participation support</li>
                        <li>Chemotherapy, radiotherapy, and hormone therapy</li>
                        <li>Surgical procedures and reconstructive surgery</li>
                        <li>Comprehensive rehabilitation and recovery support</li>
                    </ul>
                    <p><strong>Premium:</strong> Starting from $200/month</p>
                    <p><strong>Special Features:</strong> Cancer recurrence coverage, palliative care support, and family genetic counseling.</p>
                `
            }
        };
        
        const product = productDetails[productName];
        if (product && modal && modalBody) {
            modalBody.innerHTML = product.content;
            modal.style.display = 'block';
        }
    };
    
    window.closeInsuranceModal = function() {
        const modal = document.getElementById('insuranceModal');
        if (modal) {
            modal.style.display = 'none';
        }
    };
    
    // Close modal on outside click
    window.onclick = function(event) {
        const modal = document.getElementById('insuranceModal');
        if (modal && event.target === modal) {
            closeInsuranceModal();
        }
    };
}

// ============================================
// CHAT INTERFACE FUNCTIONALITY
// ============================================

function setupChatInterface() {
    const chatInput = document.getElementById('chatInput');
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                window.sendMessage();
            }
        });
    }
}

window.sendMessage = function() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    
    if (!chatInput || !chatMessages) return;
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message
    const userDiv = document.createElement('div');
    userDiv.className = 'message user-message';
    userDiv.innerHTML = `<p>${escapeHtml(message)}</p>`;
    chatMessages.appendChild(userDiv);
    
    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Simulate bot response
    setTimeout(() => {
        const botDiv = document.createElement('div');
        botDiv.className = 'message bot-message';
        botDiv.innerHTML = `<p>Thank you for your question. In production, this will connect to our AI system for personalized responses about cancer treatment and guidance.</p>`;
        chatMessages.appendChild(botDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 500);
};

// ============================================
// FILE UPLOAD FUNCTIONALITY
// ============================================

window.analyzeReport = async function() {
    const fileInput = document.getElementById('fileInput');
    const userQuestion = document.getElementById('userQuestion');
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    if (!fileInput || !userQuestion || !analyzeBtn) return;
    
    if (fileInput.files.length === 0 && !userQuestion.value.trim()) {
        alert('Please upload at least one file or enter a question.');
        return;
    }
    
    analyzeBtn.disabled = true;
    const originalText = analyzeBtn.innerHTML;
    analyzeBtn.innerHTML = '⏳ Analyzing...';
    
    try {
        alert('File analysis feature coming soon! In production, this will\'t send your medical documents to Google Gemini API for personalized analysis.');
        
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = originalText;
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = originalText;
    }
};

// ============================================
// PDF DOWNLOAD FUNCTIONALITY
// ============================================

window.downloadPDF = function() {
    alert('PDF download feature will be available once an analysis is generated.');
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.style.display = navLinks.style.display === 'none' ? 'flex' : 'none';
        });
    }
});

// AI Assessment Button Handler
document.addEventListener('DOMContentLoaded', function() {
    const aiBtn = document.querySelector('.ai-btn');
    if (aiBtn) {
        aiBtn.addEventListener('click', function() {
            alert('AI Assessment feature coming soon!\n\nThis will provide personalized treatment decision support.');
        });
    }
});

// Language selector
document.addEventListener('DOMContentLoaded', function() {
    const languageSelector = document.querySelector('.language-selector');
    if (languageSelector && typeof changeLanguage !== 'undefined') {
        languageSelector.addEventListener('change', function(e) {
            changeLanguage(e.target.value);
        });
    }
});
