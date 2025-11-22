console.log('HAVI UI project is running!');

// Fetch oncology articles from PubMed API
async function fetchOncologyArticles(maxResults = 3) {
    const articlesContainer = document.getElementById('articlesContainer');
    
    try {
        // PubMed E-utilities API - search for oncology articles
        const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=oncology+cancer+treatment&retmax=${maxResults}&retmode=json&sort=relevance`;
        
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        
        if (!searchData.esearchresult || !searchData.esearchresult.idlist) {
            throw new Error('No articles found');
        }
        
        const ids = searchData.esearchresult.idlist;
        
        // Fetch article details
        const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
        
        const summaryResponse = await fetch(summaryUrl);
        const summaryData = await summaryResponse.json();
        
        // Clear loading message
        articlesContainer.innerHTML = '';
        
        // Display articles
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
                <p class="article-source">Journal of Clinical Oncology - 2025</p>
                <a href="#" class="article-link">Read more →</a>
            </div>
            <div class="article-card">
                <h3>Precision Medicine in Oncology: Current Trends</h3>
                <p class="article-authors">Chen L, Williams K, et al.</p>
                <p class="article-source">Nature Cancer Reviews - 2025</p>
                <a href="#" class="article-link">Read more →</a>
            </div>
            <div class="article-card">
                <h3>Targeted Therapy for Breast Cancer Treatment</h3>
                <p class="article-authors">Davis R, Martinez A, et al.</p>
                <p class="article-source">The Lancet Oncology - 2025</p>
                <a href="#" class="article-link">Read more →</a>
            </div>
        `;
    }
}

function createArticleCard(article, id) {
    const card = document.createElement('div');
    card.className = 'article-card';
    
    // Extract authors (first 3)
    const authors = article.authors && article.authors.length > 0 
        ? article.authors.slice(0, 3).map(a => a.name).join(', ') + (article.authors.length > 3 ? ', et al.' : '')
        : 'Unknown authors';
    
    // Extract source and date
    const source = article.source || 'PubMed';
    const date = article.pubdate || '2025';
    
    card.innerHTML = `
        <h3>${article.title}</h3>
        <p class="article-authors">${authors}</p>
        <p class="article-source">${source} - ${date}</p>
        <a href="https://pubmed.ncbi.nlm.nih.gov/${id}/" target="_blank" class="article-link">Read more →</a>
    `;
    
    return card;
}

// Search functionality
document.addEventListener('DOMContentLoaded', () => {
    // Load articles on page load
    fetchOncologyArticles(3);
    
    // Search button handler
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.getElementById('searchInput');
    
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            alert(`Searching for: ${query}\n\nSearch functionality will be implemented in the next phase.`);
        }
    });
    
    // Allow Enter key to search
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
    
    // AI Assessment button handler
    const aiBtn = document.querySelector('.ai-btn');
    if (aiBtn) {
        aiBtn.addEventListener('click', () => {
            alert('AI Assessment feature coming soon!\n\nThis will provide personalized treatment decision support based on your medical history and current condition.');
        });
    }
});

// Insurance modal functions
function showInsuranceModal(productName) {
    const modal = document.getElementById('insuranceModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    const productDetails = {
        'MediCare Plus': {
            title: 'MediCare Plus - Critical Illness Insurance',
            content: `
                <h3>Comprehensive Critical Illness Coverage</h3>
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
            title: 'HealthGuard Premium - Medical & Critical Illness',
            content: `
                <h3>All-in-One Health Protection</h3>
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
            title: 'CancerCare Shield - Specialized Cancer Insurance',
            content: `
                <h3>Dedicated Cancer Protection</h3>
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
    if (product) {
        modalTitle.textContent = product.title;
        modalBody.innerHTML = product.content;
        modal.style.display = 'block';
    }
}

function closeInsuranceModal() {
    const modal = document.getElementById('insuranceModal');
    modal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('insuranceModal');
    if (event.target === modal) {
        closeInsuranceModal();
    }
}
