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
        // Extract content from all uploaded files
        const fileParts = [];
        
        for (let file of fileInput.files) {
            const content = await extractFileContent(file);
            if (content) {
                fileParts.push(content);
            }
        }
        
        // Build system prompt based on language
        const langSelector = document.querySelector('.language-selector');
        const language = langSelector ? langSelector.value : 'en';
        const systemPrompt = getSystemPrompt(language);
        
        // Build the message parts
        const parts = [
            { text: systemPrompt }
        ];
        
        const question = userQuestion.value.trim();
        if (question) {
            parts.push({ text: `\n\nUser Question: ${question}` });
        }
        
        // Add file contents
        parts.push(...fileParts);
        
        // Call the backend API
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ parts })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API request failed');
        }
        
        const data = await response.json();
        const responseText = data.candidates[0].content.parts[0].text;
        
        // Parse and render the report
        let report;
        try {
            report = JSON.parse(responseText);
        } catch (parseErr) {
            console.error('Failed to parse response:', responseText);
            throw new Error('Invalid response format from API');
        }
        
        renderAnalysisReport(report);
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = originalText;
        
    } catch (error) {
        console.error('Analysis error:', error);
        alert(`Error: ${error.message}`);
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = originalText;
    }
};

// Extract content from different file types
async function extractFileContent(file) {
    try {
        if (file.type === 'application/pdf') {
            return await extractPdfContent(file);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                   file.type === 'application/msword') {
            return await extractDocxContent(file);
        } else if (file.type.startsWith('image/')) {
            return await extractImageContent(file);
        }
        return null;
    } catch (err) {
        console.error(`Error extracting ${file.name}:`, err);
        return null;
    }
}

// Extract text from PDF
async function extractPdfContent(file) {
    if (typeof pdfjsLib === 'undefined') {
        throw new Error('PDF.js not loaded');
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let text = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        text += textContent.items.map(item => item.str).join('') + '\n';
    }
    
    return { text: `[Medical Document: ${file.name}]\n${text}` };
}

// Extract text from DOCX
async function extractDocxContent(file) {
    if (typeof mammoth === 'undefined') {
        throw new Error('Mammoth.js not loaded');
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return { text: `[Medical Document: ${file.name}]\n${result.value}` };
}

// Extract image as base64
async function extractImageContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve({
                inline_data: {
                    mime_type: file.type,
                    data: base64
                }
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Get system prompt based on language
function getSystemPrompt(language) {
    const prompts = {
        en: `You are HAVI, an expert medical AI assistant specialized in oncology.
You help cancer patients and their families understand medical reports and make confident, informed decisions.
Analyze the provided medical documents (pathology reports, imaging results, lab tests, clinical notes) and generate a clear, compassionate, patient-friendly report.

IMPORTANT: Respond ONLY with a valid JSON object. No markdown, no explanation outside the JSON.

Return this exact JSON structure:
{
  "language": "en",
  "patientSummary": "Brief summary of what was analyzed and key findings",
  "currentStage": "e.g. Stage IIA Breast Cancer",
  "stageExplanation": "Plain language explanation of what this stage means",
  "nextSteps": ["Step 1", "Step 2", "Step 3"],
  "treatmentOptions": [
    {
      "name": "Treatment name",
      "description": "What this treatment involves",
      "expectedOutcome": "What results to expect",
      "riskLevel": "Low",
      "timeline": "e.g. 6 weeks"
    }
  ],
  "questionsForDoctor": ["Question 1", "Question 2"],
  "importantWarnings": ["Warning if any"],
  "disclaimer": "This AI-generated report is based on clinical guidelines and the documents provided. It is for informational purposes only and does not constitute medical advice. Please consult your oncologist before making any medical decisions."
}

riskLevel must be exactly one of: "Low", "Medium", "High"
Be warm, clear, and avoid medical jargon. Write for a patient with no medical background.
If the content is not a medical document, say so in patientSummary and ask for correct documents.`,
        
        es: `Eres HAVI, un asistente médico de IA experto especializado en oncología.
Ayudas a pacientes con cáncer y sus familias a comprender los informes médicos y tomar decisiones informadas y seguras.
Analiza los documentos médicos proporcionados y genera un informe claro, compasivo y fácil de entender para el paciente.

IMPORTANTE: Responde SOLO con un objeto JSON válido. Sin markdown, sin explicación fuera del JSON.

Devuelve esta estructura JSON exacta:
{
  "language": "es",
  "patientSummary": "Breve resumen de lo analizado y hallazgos clave",
  "currentStage": "ej. Cáncer de Mama Etapa IIA",
  "stageExplanation": "Explicación en lenguaje sencillo de lo que significa esta etapa",
  "nextSteps": ["Paso 1", "Paso 2", "Paso 3"],
  "treatmentOptions": [
    {
      "name": "Nombre del tratamiento",
      "description": "En qué consiste este tratamiento",
      "expectedOutcome": "Qué resultados esperar",
      "riskLevel": "Bajo",
      "timeline": "ej. 6 semanas"
    }
  ],
  "questionsForDoctor": ["Pregunta 1", "Pregunta 2"],
  "importantWarnings": ["Advertencia si existe"],
  "disclaimer": "Este informe generado por IA se basa en guías clínicas y los documentos proporcionados. Es solo para fines informativos y no constituye asesoramiento médico. Por favor consulte a su oncólogo antes de tomar cualquier decisión médica."
}

riskLevel debe ser exactamente uno de: "Bajo", "Medio", "Alto"
Sé cálido, claro y evita la jerga médica.`
    };
    
    return prompts[language] || prompts.en;
}

// Render analysis report
function renderAnalysisReport(report) {
    const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const html = `
        <div class="report-header">
            <div class="report-title">🏥 HAVI AI Cancer Analysis Report</div>
            <div class="report-date">${now}</div>
        </div>

        <div class="report-section">
            <div class="report-section-title">📋 Patient Summary</div>
            <div class="report-section-content">${escapeHtml(report.patientSummary || '')}</div>
        </div>

        <div class="report-section">
            <div class="report-section-title">🏥 Current Stage</div>
            <div class="current-stage-title">${escapeHtml(report.currentStage || '')}</div>
            <div class="report-section-content">${escapeHtml(report.stageExplanation || '')}</div>
        </div>

        <div class="report-section">
            <div class="report-section-title">✅ What To Do Next</div>
            <ol class="next-steps-list">
                ${(report.nextSteps || []).map((step, i) => `
                    <li>
                        <span class="step-badge">${i + 1}</span>
                        <span>${escapeHtml(step)}</span>
                    </li>
                `).join('')}
            </ol>
        </div>

        <div class="report-section">
            <div class="report-section-title">💊 Treatment Options</div>
            <div class="treatment-grid">
                ${(report.treatmentOptions || []).map(option => `
                    <div class="treatment-card">
                        <div class="treatment-title">${escapeHtml(option.name || '')}</div>
                        <span class="risk-badge risk-${getRiskClass(option.riskLevel)}">${escapeHtml(option.riskLevel || 'Unknown')}</span>
                        <div class="treatment-item"><span class="treatment-label">Treatment:</span> ${escapeHtml(option.description || '')}</div>
                        <div class="treatment-item"><span class="treatment-label">Expected Outcome:</span> ${escapeHtml(option.expectedOutcome || '')}</div>
                        <div class="treatment-item"><span class="treatment-label">Timeline:</span> ${escapeHtml(option.timeline || '')}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="report-section">
            <div class="report-section-title">❓ Questions to Ask Your Doctor</div>
            <ul class="questions-list">
                ${(report.questionsForDoctor || []).map(q => `<li>❓ ${escapeHtml(q)}</li>`).join('')}
            </ul>
        </div>

        ${(report.importantWarnings && report.importantWarnings.length > 0) ? `
            <div class="warning-box">
                <div class="warning-title">⚠️ Important Warnings</div>
                ${report.importantWarnings.map(w => `<div class="warning-item">• ${escapeHtml(w)}</div>`).join('')}
            </div>
        ` : ''}

        <div class="disclaimer">
            ${escapeHtml(report.disclaimer || '')}
        </div>

        <button class="download-btn" onclick="downloadReportPDF()">⬇️ Download Report (PDF)</button>
    `;
    
    const reportContainer = document.getElementById('reportContainer');
    if (reportContainer) {
        reportContainer.innerHTML = html;
        reportContainer.classList.add('show');
        reportContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

function getRiskClass(level) {
    if (!level) return 'low';
    const levelLower = level.toString().toLowerCase();
    if (levelLower === 'low' || levelLower === '低') return 'low';
    if (levelLower === 'high' || levelLower === '高') return 'high';
    return 'medium';
}

window.downloadReportPDF = function() {
    const element = document.getElementById('reportContainer');
    if (!element) {
        alert('No report to download');
        return;
    }
    
    if (typeof html2pdf === 'undefined') {
        alert('PDF library not loaded');
        return;
    }
    
    const opt = {
        margin: 15,
        filename: 'HAVI_Report_' + new Date().toISOString().split('T')[0] + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
};
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
