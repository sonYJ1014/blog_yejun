// State & App Initialization
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    window.addEventListener('hashchange', router);
    router(); // Trigger initial routing based on hash
});

// Theme Toggle Logic
const themeBtn = document.getElementById('theme-toggle');
const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
        setTheme('light');
    } else {
        setTheme('dark');
    }

    themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }
}

// Router Logic
async function router() {
    const contentDiv = document.getElementById('main-content');
    const hash = window.location.hash.slice(1); // Remove the #

    showLoader(contentDiv);

    try {
        if (!hash) {
            await renderHome(contentDiv);
        } else if (hash.startsWith('post/')) {
            const slug = hash.replace('post/', '');
            await renderPost(contentDiv, slug);
        } else {
            // 404
            contentDiv.innerHTML = `<div class="hero"><h2>404 - Page Not Found</h2><a href="#" class="back-btn">Go Home</a></div>`;
        }
    } catch (error) {
        console.error("Routing error:", error);
        contentDiv.innerHTML = `<div class="hero"><h2>Error Loading Content</h2><p>${error.message}</p><a href="#" class="back-btn">Go Home</a></div>`;
    }
}

function showLoader(container) {
    container.innerHTML = `<div class="loader"><div class="spinner"></div></div>`;
}

// Views
async function renderHome(container) {
    // Fetch posts index
    const response = await fetch('./posts.json');
    if (!response.ok) throw new Error("Could not load posts.json");
    
    const posts = await response.json();
    
    let html = `
        <section class="hero">
            <h1>Welcome to My Mind.</h1>
            <p>I write about development, design, and ideas that shape the future.</p>
        </section>
        <div class="post-grid">
    `;

    posts.forEach((post, index) => {
        const delay = index * 0.1; // Staggered animation
        html += `
            <a href="#post/${post.slug}" class="post-card" style="animation-delay: ${delay}s">
                <div class="post-meta">${post.date} &bull; ${post.tag || 'Blog'}</div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-desc">${post.desc}</p>
                <div class="read-more">
                    Read article 
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </div>
            </a>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

async function renderPost(container, slug) {
    // 1. Fetch post metadata to show title quickly
    const indexResponse = await fetch('./posts.json');
    const posts = await indexResponse.json();
    const meta = posts.find(p => p.slug === slug);
    
    if (!meta) throw new Error("Post not found in index.");

    // 2. Fetch markdown content
    const response = await fetch(`./posts/${slug}.md`);
    if (!response.ok) throw new Error("Could not load markdown file.");
    
    const text = await response.text();
    
    // 3. Parse Markdown using marked.js, sanitize with DOMPurify
    const rawHtml = marked.parse(text);
    const cleanHtml = DOMPurify.sanitize(rawHtml);

    container.innerHTML = `
        <article class="post-view">
            <a href="#" class="back-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Back to stories
            </a>
            <header class="post-header">
                <h1>${meta.title}</h1>
                <div class="meta">${meta.date} &bull; 5 min read</div>
            </header>
            <div class="markdown-body">
                ${cleanHtml}
            </div>
        </article>
    `;

    // Initialize syntax highlighting later if we add prism/highlightjs
}
