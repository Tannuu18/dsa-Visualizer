document.addEventListener('DOMContentLoaded', () => {

    // --- NEW THEME TOGGLE LOGIC ---
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const body = document.body;

    // Function to apply the saved theme
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-theme');
            themeToggleBtn.textContent = '☀️'; // Sun icon
        } else {
            body.classList.remove('dark-theme');
            themeToggleBtn.textContent = '🌙'; // Moon icon
        }
    }

    // On page load, check localStorage for a saved theme
    const savedTheme = localStorage.getItem('theme') || 'light'; // Default to light
    applyTheme(savedTheme);

    // Add click event listener for the toggle button
    themeToggleBtn.addEventListener('click', () => {
        let newTheme;
        if (body.classList.contains('dark-theme')) {
            newTheme = 'light';
        } else {
            newTheme = 'dark';
        }
        // Apply the new theme and save it
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
    // --- END OF NEW THEME LOGIC ---


    // --- Page Navigation Logic ---
    const navLinks = document.querySelectorAll('.nav-link');
    const appContainer = document.getElementById('app-container');

    const pageSetupFunctions = {
        'sorting': setupSortingPage,
        'searching': setupSearchingPage,
        'stack': setupStackPage,
        'queue': setupQueuePage,
        'linkedlist': setupLinkedListPage,
        'bst': setupBstPage,
        'graph': setupGraphPage,
    };

    function showPage(pageId) {
        appContainer.innerHTML = '';
        
        if (pageSetupFunctions[pageId]) {
            pageSetupFunctions[pageId]();
        } else {
            appContainer.innerHTML = `<h2>Page not found or not yet implemented: ${pageId}</h2>`;
        }

        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageId);
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = e.target.dataset.page;
            showPage(pageId);
        });
    });

    showPage('sorting');
});