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
    loadReportFromUrl();
});

// If the URL contains ?report=..., decode and render the shared report automatically
function loadReportFromUrl() {
    try {
        const params = new URLSearchParams(window.location.search);
        const encoded = params.get('report');
        if (!encoded) return;

        const json = decodeURIComponent(escape(atob(encoded)));
        const report = JSON.parse(json);
        if (!report || typeof report !== 'object') return;

        // Scroll to the upload section and switch to report tab after a short delay
        // so the DOM is ready
        setTimeout(function() {
            renderAnalysisReport(report);
            const uploadSection = document.getElementById('uploadSection');
            if (uploadSection) uploadSection.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    } catch(e) {
        console.warn('Could not load report from URL:', e);
    }
}

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

window.sendStarterMessage = function(btn) {
    const chatInput = document.getElementById('chatInput');
    if (!chatInput) return;
    chatInput.value = btn.textContent.trim();
    const chatStarters = document.getElementById('chatStarters');
    if (chatStarters) chatStarters.style.display = 'none';
    window.sendMessage();
};

window.shareWithDoctor = function() {
    if (!window._lastReport) {
        alert('No report to share yet. Please generate a report first.');
        return;
    }
    const panel = document.getElementById('shareLinkPanel');
    const input = document.getElementById('shareLinkInput');
    if (!panel || !input) return;

    // Encode the full report JSON into the URL so the recipient sees the report when they open the link
    try {
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(window._lastReport))));
        const base = window.location.origin + window.location.pathname;
        input.value = base + '?report=' + encoded;
    } catch(e) {
        input.value = window.location.href;
    }

    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') {
        input.select();
        input.setSelectionRange(0, 99999);
    }
};

window.copyShareLink = function() {
    const input = document.getElementById('shareLinkInput');
    if (!input) return;
    input.select();
    input.setSelectionRange(0, 99999);
    let copied = false;
    try {
        copied = document.execCommand('copy');
    } catch(e) {}
    if (!copied && navigator.clipboard) {
        navigator.clipboard.writeText(input.value).catch(() => {});
        copied = true;
    }
    const btn = document.getElementById('copyShareBtn');
    if (btn) {
        btn.textContent = '✓ Copied!';
        setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
    }
};

// Convert markdown-like text to HTML for chat responses
function markdownToHtml(text) {
    // Bold **text**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Convert bullet lines to <li>
    text = text.replace(/^[\*\-] (.+)$/gm, '<li>$1</li>');
    // Wrap consecutive <li> blocks in <ul>
    text = text.replace(/(<li>[\s\S]*?<\/li>)(\n(?!<li>)|$)/g, (m, list) => '<ul>' + list + '</ul>');
    // Paragraphs: double newlines
    text = text.replace(/\n{2,}/g, '</p><p>');
    // Single newlines to <br>
    text = text.replace(/\n/g, '<br>');
    return '<p>' + text + '</p>';
}

window.sendMessage = async function() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    
    if (!chatInput || !chatMessages) return;
    
    const message = chatInput.value.trim();
    if (!message) return;

    // Hide starter chips once user sends a message
    const chatStarters = document.getElementById('chatStarters');
    if (chatStarters) chatStarters.style.display = 'none';
    
    // Add user message
    const userDiv = document.createElement('div');
    userDiv.className = 'message user-message';
    userDiv.innerHTML = `<p>${escapeHtml(message)}</p>`;
    chatMessages.appendChild(userDiv);
    
    chatInput.value = '';
    chatInput.disabled = true;
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message';
    loadingDiv.id = 'loading-message';
    loadingDiv.innerHTML = `<p>⏳ Thinking...</p>`;
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
        // Get language
        const langSelector = document.querySelector('.language-selector');
        const language = langSelector ? langSelector.value : 'en';
        
        // Structured system prompt
        const systemPrompt = `You are HAVI, an empathetic AI cancer guidance assistant. Your role is to help cancer patients and their families understand their diagnosis and navigate treatment options.

Guidelines:
- Respond in the same language as the user's question (${language})
- Keep responses under 400 words
- Use **bold** for important terms and section headers
- Use bullet points (- item) for lists
- Structure your response with clear sections when appropriate
- Be warm, compassionate, and clear — avoid medical jargon
- Always end with a reminder to consult their oncologist for medical decisions
- Base answers on established clinical guidelines and evidence`;
        
        const parts = [
            { text: systemPrompt },
            { text: `\n\nUser: ${message}` }
        ];
        
        // Call API
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ parts })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
            throw new Error('Invalid response format from API');
        }
        
        let aiResponse = data.candidates[0].content.parts[0].text;
        
        // Remove loading indicator
        loadingDiv.remove();
        
        // Add AI response with markdown rendered as HTML
        const botDiv = document.createElement('div');
        botDiv.className = 'message bot-message';
        botDiv.innerHTML = markdownToHtml(aiResponse);
        chatMessages.appendChild(botDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
    } catch (error) {
        console.error('Chat error:', error);
        loadingDiv.remove();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message bot-message';
        errorDiv.innerHTML = `<p>❌ Error: ${escapeHtml(error.message)}</p>`;
        chatMessages.appendChild(errorDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } finally {
        chatInput.disabled = false;
        chatInput.focus();
    }
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
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
            console.error('Unexpected API response structure:', data);
            throw new Error('Invalid response format from API');
        }
        
        let rawText = data.candidates[0].content.parts[0].text;
        
        // Strip markdown code blocks if present
        rawText = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
        
        // Parse and render the report
        let report;
        try {
            report = JSON.parse(rawText);
        } catch (parseErr) {
            console.error('JSON parse error:', parseErr);
            console.error('Raw text was:', rawText);
            throw new Error('Could not parse AI response. Please try again.');
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
Sé cálido, claro y evita la jerga médica.`,

        'zh-CN': `你是HAVI，一个专业的肿瘤学AI医疗助理。
你帮助癌症患者及其家属理解医疗报告，并做出明智、有据可查的决定。
请分析所提供的医疗文件（病理报告、影像结果、化验、临床记录），生成清晰、有温度、患者易懂的报告。

重要提示：仅返回有效的JSON对象，不要有任何Markdown或JSON以外的内容。

返回以下确切的JSON结构：
{
  "language": "zh-CN",
  "patientSummary": "简要说明分析内容及主要发现",
  "currentStage": "例如：乳腺癌IIA期",
  "stageExplanation": "用通俗语言解释该分期的含义",
  "nextSteps": ["步骤1", "步骤2", "步骤3"],
  "treatmentOptions": [
    {
      "name": "治疗方案名称",
      "description": "该治疗方案的内容",
      "expectedOutcome": "预期效果",
      "riskLevel": "低",
      "timeline": "例如：6周"
    }
  ],
  "questionsForDoctor": ["问题1", "问题2"],
  "importantWarnings": ["如有警告请填写"],
  "disclaimer": "本AI报告基于临床指南及所提供的文件生成，仅供参考，不构成医疗建议。在做出任何医疗决定之前，请咨询您的肿瘤科医生。"
}

riskLevel必须是以下之一："低"、"中"、"高"
用温暖、清晰的语言，避免医学术语。`,

        'zh-TW': `你是HAVI，一個專業的腫瘤學AI醫療助理。
你幫助癌症患者及其家屬理解醫療報告，並做出明智、有據可查的決定。
請分析所提供的醫療文件（病理報告、影像結果、化驗、臨床記錄），生成清晰、有溫度、患者易懂的報告。

重要提示：僅返回有效的JSON物件，不要有任何Markdown或JSON以外的內容。

返回以下確切的JSON結構：
{
  "language": "zh-TW",
  "patientSummary": "簡要說明分析內容及主要發現",
  "currentStage": "例如：乳癌IIA期",
  "stageExplanation": "用通俗語言解釋該分期的含義",
  "nextSteps": ["步驟1", "步驟2", "步驟3"],
  "treatmentOptions": [
    {
      "name": "治療方案名稱",
      "description": "該治療方案的內容",
      "expectedOutcome": "預期效果",
      "riskLevel": "低",
      "timeline": "例如：6週"
    }
  ],
  "questionsForDoctor": ["問題1", "問題2"],
  "importantWarnings": ["如有警告請填寫"],
  "disclaimer": "本AI報告基於臨床指南及所提供的文件生成，僅供參考，不構成醫療建議。在做出任何醫療決定之前，請諮詢您的腫瘤科醫生。"
}

riskLevel必須是以下之一："低"、"中"、"高"
用溫暖、清晰的語言，避免醫學術語。`
    };
    
    return prompts[language] || prompts.en;
}

// Render analysis report — populates the Download Report tab preview card
function renderAnalysisReport(report) {
    // Store globally so downloadReportPDF can access it
    window._lastReport = report;

    const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // --- Populate hidden full-report container for PDF export ---
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
    `;

    const reportContainer = document.getElementById('reportContainer');
    if (reportContainer) {
        reportContainer.innerHTML = html;
    }

    // --- Populate the preview card ---
    const summaryEl = document.getElementById('previewSummary');
    if (summaryEl) {
        const summary = report.patientSummary || '';
        summaryEl.textContent = summary.length > 180 ? summary.substring(0, 180) + '…' : summary;
    }

    const treatmentEl = document.getElementById('previewTreatment');
    if (treatmentEl) {
        const options = report.treatmentOptions || [];
        if (options.length > 0) {
            const first = options[0];
            const desc = first.description || '';
            treatmentEl.innerHTML = `<strong>${escapeHtml(first.name || '')}</strong> — ${escapeHtml(desc.length > 120 ? desc.substring(0, 120) + '…' : desc)}`;
            if (options.length > 1) {
                treatmentEl.innerHTML += `<span class="treatment-count-badge">+${options.length - 1} more</span>`;
            }
        }
    }

    const dateEl = document.getElementById('reportPreviewDate');
    if (dateEl) dateEl.textContent = now;

    // Show preview card, hide empty state
    const emptyState = document.getElementById('reportEmptyState');
    const previewCard = document.getElementById('reportPreviewCard');
    if (emptyState) emptyState.style.display = 'none';
    if (previewCard) previewCard.style.display = 'block';

    // After 300ms: switch to Download Report tab, pulse it, scroll to section
    setTimeout(function() {
        document.querySelectorAll('.tab-btn').forEach(function(btn) { btn.classList.remove('active'); });
        document.querySelectorAll('.tab-content').forEach(function(tab) { tab.classList.remove('active'); });
        const reportTabBtn = document.querySelector('.tab-btn[data-tab="report"]');
        const reportTabContent = document.getElementById('report-tab');
        if (reportTabBtn) {
            reportTabBtn.classList.add('active');
            // Pulse highlight animation
            reportTabBtn.classList.add('tab-pulse');
            setTimeout(function() { reportTabBtn.classList.remove('tab-pulse'); }, 900);
        }
        if (reportTabContent) reportTabContent.classList.add('active');
        // Smooth scroll to the upload/analysis section
        const section = document.getElementById('uploadSection');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
}

function getRiskClass(level) {
    if (!level) return 'low';
    const levelLower = level.toString().toLowerCase();
    if (levelLower === 'low' || levelLower === '低') return 'low';
    if (levelLower === 'high' || levelLower === '高') return 'high';
    return 'medium';
}

window.downloadReportPDF = function() {
    if (!window._lastReport) {
        alert('No report to download. Please generate a report first.');
        return;
    }
    var r = window._lastReport;

    function eh(s) {
        return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
    function riskColor(level) {
        var l = String(level||'').toLowerCase();
        if (l==='low'||l==='低') return '#16a34a';
        if (l==='high'||l==='高'||l==='alto') return '#dc2626';
        return '#d97706';
    }
    function riskBg(level) {
        var l = String(level||'').toLowerCase();
        if (l==='low'||l==='低') return '#f0fdf4';
        if (l==='high'||l==='高'||l==='alto') return '#fef2f2';
        return '#fffbeb';
    }

    var now = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
    var date = 'Generated on ' + now;

    var treatmentCards = (r.treatmentOptions||[]).map(function(opt) {
        return '<div class="tx-card">'+
            '<div class="tx-header">'+
                '<span class="tx-name">'+eh(opt.name)+'</span>'+
                '<span class="risk-badge" style="background:'+riskBg(opt.riskLevel)+';color:'+riskColor(opt.riskLevel)+'">'+eh(opt.riskLevel)+'</span>'+
            '</div>'+
            '<div class="tx-row"><b>Treatment:</b> '+eh(opt.description)+'</div>'+
            '<div class="tx-row"><b>Expected Outcome:</b> '+eh(opt.expectedOutcome)+'</div>'+
            '<div class="tx-row"><b>Timeline:</b> '+eh(opt.timeline)+'</div>'+
        '</div>';
    }).join('');

    var nextSteps = (r.nextSteps||[]).map(function(s,i) {
        return '<div class="step-row"><span class="step-num">'+(i+1)+'</span><span>'+eh(s)+'</span></div>';
    }).join('');

    var questions = (r.questionsForDoctor||[]).map(function(q) {
        return '<div class="q-row">• '+eh(q)+'</div>';
    }).join('');

    var warnings = '';
    if (r.importantWarnings && r.importantWarnings.length > 0) {
        warnings = '<div class="warning-box"><div class="warning-title">⚠ Important Warnings</div>'+
            r.importantWarnings.map(function(w){ return '<div class="warning-row">• '+eh(w)+'</div>'; }).join('')+
        '</div>';
    }

    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">'+
    '<title>HAVI AI Cancer Analysis Report</title>'+
    '<style>'+
        '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");'+
        '*{box-sizing:border-box;margin:0;padding:0;}'+
        'body{font-family:Inter,Arial,sans-serif;font-size:14px;color:#1a1a2e;background:#fff;padding:40px 48px;line-height:1.6;}'+
        'h1{font-size:22px;font-weight:700;color:#1a1a2e;margin-bottom:4px;}'+
        '.date{font-size:12px;color:#6b7280;margin-bottom:28px;}'+
        'hr{border:none;border-top:1px solid #e5e7eb;margin:24px 0;}'+
        '.section{margin-bottom:24px;}'+
        '.section-title{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#1a1a2e;'+
            'border-left:4px solid #A8D8EA;padding-left:10px;margin-bottom:12px;}'+
        '.section-content{font-size:14px;color:#374151;line-height:1.7;}'+
        '.stage-box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;margin-bottom:12px;}'+
        '.stage-title{font-size:20px;font-weight:700;color:#15803d;}'+
        '.stage-badge{display:inline-block;background:#16a34a;color:#fff;font-size:11px;font-weight:600;'+
            'padding:3px 10px;border-radius:20px;margin-left:10px;vertical-align:middle;}'+
        '.meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px;}'+
        '.meta-cell{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;}'+
        '.meta-label{font-size:11px;color:#6b7280;font-weight:500;margin-bottom:3px;}'+
        '.meta-value{font-size:14px;font-weight:600;color:#1a1a2e;}'+
        '.step-row{display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;}'+
        '.step-num{min-width:26px;height:26px;background:#A8D8EA;color:#1a1a2e;border-radius:50%;'+
            'font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}'+
        '.tx-card{border:1px solid #e5e7eb;border-radius:10px;padding:14px 18px;margin-bottom:12px;background:#fafafa;}'+
        '.tx-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}'+
        '.tx-name{font-weight:700;font-size:15px;color:#1a1a2e;}'+
        '.risk-badge{font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;border:1px solid currentColor;}'+
        '.tx-row{font-size:13px;color:#374151;margin-bottom:6px;line-height:1.5;}'+
        '.tx-row b{color:#1a1a2e;}'+
        '.q-row{font-size:13px;color:#374151;padding:7px 0;border-bottom:1px solid #f3f4f6;line-height:1.5;}'+
        '.q-row:last-child{border-bottom:none;}'+
        '.warning-box{background:#fef3c7;border:1px solid #fcd34d;border-radius:10px;padding:16px 20px;margin-bottom:24px;}'+
        '.warning-title{font-weight:700;color:#92400e;margin-bottom:8px;}'+
        '.warning-row{font-size:13px;color:#78350f;margin-bottom:4px;}'+
        '.disclaimer{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px 18px;'+
            'font-size:12px;color:#6b7280;line-height:1.6;margin-top:8px;}'+
        '@media print{body{padding:20px 28px;}@page{margin:15mm;}}'+
    '</style></head><body>'+

    '<h1>🏥 HAVI AI Cancer Analysis Report</h1>'+
    '<div class="date">'+date+'</div>'+
    '<hr>'+

    '<div class="section">'+
        '<div class="section-title">Patient Summary</div>'+
        '<div class="section-content">'+eh(r.patientSummary)+'</div>'+
    '</div>'+

    '<div class="section">'+
        '<div class="section-title">Current Stage</div>'+
        '<div class="stage-box">'+
            '<div class="stage-title">'+eh(r.currentStage)+'</div>'+
        '</div>'+
        '<div class="section-content">'+eh(r.stageExplanation)+'</div>'+
    '</div>'+

    '<div class="section">'+
        '<div class="section-title">What To Do Next</div>'+
        nextSteps+
    '</div>'+

    '<div class="section">'+
        '<div class="section-title">Treatment Options</div>'+
        treatmentCards+
    '</div>'+

    '<div class="section">'+
        '<div class="section-title">Questions to Ask Your Doctor</div>'+
        questions+
    '</div>'+

    warnings+

    '<div class="disclaimer">'+eh(r.disclaimer)+'</div>'+
    '</body></html>';

    var win = window.open('', '_blank', 'width=900,height=700');
    if (!win) {
        alert('Please allow pop-ups for this site, then try again.');
        return;
    }
    win.document.write(html);
    win.document.close();
    win.onload = function() {
        win.focus();
        win.print();
    };
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

// ============================================
// LANGUAGE SWITCHING
// ============================================

// Renamed to avoid conflict with i18n.js `const translations`
const uiTranslations = {
    en: {
        navHome: 'Home',
        navArticles: 'Articles',
        navInsurance: 'Insurance',
        navLegal: 'Legal',
        navSignIn: 'Sign In',
        heroLabel: 'AI-POWERED CANCER GUIDANCE',
        heroTitle: 'Understand your diagnosis. Navigate your options.',
        heroDescription: 'Upload your medical reports and get an instant, personalized AI analysis — based on the latest clinical guidelines.',
        heroBtn1: 'Upload & Analyze',
        heroBtn2: 'See How It Works',
        tabUpload: '📤 Upload & Analyze',
        tabChat: '💬 AI Chat',
        tabReport: '📥 Download Report',
        uploadText: 'Drop your medical files here',
        uploadSubtext: 'PDF, JPG, PNG, Word — pathology reports, scans, lab results',
        analyzeBtnText: '✨ Generate AI Analysis Report',
    },
    'zh-CN': {
        navHome: '首页',
        navArticles: '文章',
        navInsurance: '保险',
        navLegal: '法律',
        navSignIn: '登录',
        heroLabel: 'AI驱动的癌症指导',
        heroTitle: '了解您的诊断，探索您的选择。',
        heroDescription: '上传您的医疗报告，根据最新临床指南，获得即时个性化的AI分析。',
        heroBtn1: '上传并分析',
        heroBtn2: '了解工作原理',
        tabUpload: '📤 上传并分析',
        tabChat: '💬 AI对话',
        tabReport: '📥 下载报告',
        uploadText: '将医疗文件拖放至此处',
        uploadSubtext: 'PDF、JPG、PNG、Word — 病理报告、扫描、化验结果',
        analyzeBtnText: '✨ 生成AI分析报告',
    },
    'zh-TW': {
        navHome: '首頁',
        navArticles: '文章',
        navInsurance: '保險',
        navLegal: '法律',
        navSignIn: '登入',
        heroLabel: 'AI驅動的癌症指導',
        heroTitle: '了解您的診斷，探索您的選擇。',
        heroDescription: '上傳您的醫療報告，根據最新臨床指南，獲得即時個人化的AI分析。',
        heroBtn1: '上傳並分析',
        heroBtn2: '了解運作方式',
        tabUpload: '📤 上傳並分析',
        tabChat: '💬 AI對話',
        tabReport: '📥 下載報告',
        uploadText: '將醫療文件拖放至此處',
        uploadSubtext: 'PDF、JPG、PNG、Word — 病理報告、掃描、化驗結果',
        analyzeBtnText: '✨ 生成AI分析報告',
    },
    es: {
        navHome: 'Inicio',
        navArticles: 'Artículos',
        navInsurance: 'Seguro',
        navLegal: 'Legal',
        navSignIn: 'Iniciar sesión',
        heroLabel: 'ORIENTACIÓN ONCOLÓGICA CON IA',
        heroTitle: 'Entiende tu diagnóstico. Navega tus opciones.',
        heroDescription: 'Sube tus informes médicos y obtén un análisis de IA personalizado e instantáneo, basado en las últimas guías clínicas.',
        heroBtn1: 'Subir y analizar',
        heroBtn2: 'Ver cómo funciona',
        tabUpload: '📤 Subir y Analizar',
        tabChat: '💬 Chat con IA',
        tabReport: '📥 Descargar Informe',
        uploadText: 'Arrastra tus archivos médicos aquí',
        uploadSubtext: 'PDF, JPG, PNG, Word — informes de patología, imágenes, resultados de laboratorio',
        analyzeBtnText: '✨ Generar informe de análisis IA',
    }
};

window.currentLanguage = 'en';

// Extend i18n.js changeLanguage: call the original (handles currentLanguage + data-i18n)
// then also update our ID-based UI elements
(function() {
    const _i18nChange = window.changeLanguage; // reference to i18n.js version

    window.changeLanguage = function(lang) {
        // Let i18n.js update its internal currentLanguage + data-i18n elements
        if (typeof _i18nChange === 'function') _i18nChange(lang);

        window.currentLanguage = lang;
        const t = uiTranslations[lang] || uiTranslations.en;

        // Update our ID-based elements
        const ids = [
            'navHome','navArticles','navInsurance','navLegal','navSignIn',
            'heroLabel','heroTitle','heroDescription','heroBtn1','heroBtn2',
            'tabUpload','tabChat','tabReport',
            'uploadText','uploadSubtext','analyzeBtnText'
        ];

        ids.forEach(function(id) {
            const el = document.getElementById(id);
            if (el && t[id] !== undefined) el.textContent = t[id];
        });

        // Keep selector in sync
        const sel = document.querySelector('.language-selector');
        if (sel) sel.value = lang;
    };
})();

// No extra DOMContentLoaded listener needed — i18n.js and the inline onchange handle it.
