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
