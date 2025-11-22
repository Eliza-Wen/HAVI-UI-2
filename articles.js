console.log('HAVI Articles page loaded');

let currentPage = 1;
let articlesPerPage = 9;
let allArticles = [];

// Fetch oncology articles from PubMed API
async function fetchOncologyArticles(start = 0, max = 9) {
    const articlesContainer = document.getElementById('articlesContainer');
    
    try {
        // PubMed E-utilities API - search for oncology articles
        const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=oncology+cancer+treatment+therapy&retmax=${max}&retstart=${start}&retmode=json&sort=relevance`;
        
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
        
        // Clear loading message if first page
        if (start === 0) {
            articlesContainer.innerHTML = '';
        }
        
        // Display articles
        ids.forEach(id => {
            const article = summaryData.result[id];
            if (article) {
                const articleCard = createArticleCard(article, id);
                articlesContainer.appendChild(articleCard);
                allArticles.push({ article, id });
            }
        });
        
        // Enable/disable load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (ids.length < max) {
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = 'No More Articles';
        } else {
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = 'Load More Articles';
        }
        
    } catch (error) {
        console.error('Error fetching articles:', error);
        
        // Show sample articles on error
        if (start === 0) {
            articlesContainer.innerHTML = '';
            const sampleArticles = [
                {
                    title: 'Advances in Cancer Immunotherapy: Current State and Future Directions',
                    authors: 'Smith J, Johnson M, Williams K',
                    source: 'Journal of Clinical Oncology',
                    date: '2025',
                    id: 'sample1'
                },
                {
                    title: 'Precision Medicine in Oncology: Personalized Treatment Approaches',
                    authors: 'Chen L, Martinez A, Davis R',
                    source: 'Nature Cancer Reviews',
                    date: '2025',
                    id: 'sample2'
                },
                {
                    title: 'Targeted Therapy for Breast Cancer: Clinical Trial Results',
                    authors: 'Anderson P, Taylor S, Brown M',
                    source: 'The Lancet Oncology',
                    date: '2025',
                    id: 'sample3'
                },
                {
                    title: 'CAR-T Cell Therapy in Hematologic Malignancies',
                    authors: 'Wilson E, Thompson R, Garcia H',
                    source: 'Blood Cancer Journal',
                    date: '2024',
                    id: 'sample4'
                },
                {
                    title: 'Liquid Biopsy for Early Cancer Detection and Monitoring',
                    authors: 'Lee K, Rodriguez C, White J',
                    source: 'Clinical Cancer Research',
                    date: '2024',
                    id: 'sample5'
                },
                {
                    title: 'Novel Approaches to Treating Lung Cancer: A Comprehensive Review',
                    authors: 'Miller D, Jackson T, Moore L',
                    source: 'Journal of Thoracic Oncology',
                    date: '2024',
                    id: 'sample6'
                },
                {
                    title: 'Combination Therapies in Metastatic Melanoma',
                    authors: 'Harris B, Clark N, Lewis P',
                    source: 'Cancer Discovery',
                    date: '2025',
                    id: 'sample7'
                },
                {
                    title: 'Radiotherapy Innovations for Prostate Cancer Treatment',
                    authors: 'Young R, Hall A, King M',
                    source: 'International Journal of Radiation Oncology',
                    date: '2024',
                    id: 'sample8'
                },
                {
                    title: 'Biomarkers for Predicting Response to Cancer Therapy',
                    authors: 'Scott W, Green S, Adams D',
                    source: 'Molecular Cancer Therapeutics',
                    date: '2025',
                    id: 'sample9'
                }
            ];
            
            sampleArticles.forEach(article => {
                const card = document.createElement('div');
                card.className = 'article-card';
                card.innerHTML = `
                    <h3>${article.title}</h3>
                    <p class="article-authors">${article.authors}</p>
                    <p class="article-source">${article.source} - ${article.date}</p>
                    <a href="#" class="article-link">Read more →</a>
                `;
                articlesContainer.appendChild(card);
            });
        }
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

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load initial articles
    fetchOncologyArticles(0, articlesPerPage);
    
    // Load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        fetchOncologyArticles((currentPage - 1) * articlesPerPage, articlesPerPage);
    });
    
    // Apply filters button
    const applyFilterBtn = document.getElementById('applyFilter');
    applyFilterBtn.addEventListener('click', () => {
        const searchTerm = document.getElementById('filterSearch').value.trim();
        const year = document.getElementById('filterYear').value;
        const type = document.getElementById('filterType').value;
        
        // Build search query
        let query = 'oncology cancer treatment';
        
        if (searchTerm) {
            query += ` ${searchTerm}`;
        }
        
        if (year) {
            query += ` ${year}[pdat]`;
        }
        
        // Reset and fetch with new query
        currentPage = 1;
        allArticles = [];
        
        alert(`Filtering articles:\nSearch: ${searchTerm || 'All'}\nYear: ${year || 'All'}\nType: ${type || 'All'}\n\nAdvanced filtering will be implemented in the next phase.`);
    });
    
    // Filter search on Enter key
    document.getElementById('filterSearch').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyFilterBtn.click();
        }
    });
});
