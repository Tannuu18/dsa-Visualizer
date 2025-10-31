document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const appContainer = document.getElementById('app-container');

    const pageSetupFunctions = {
        'sorting': setupSortingPage,
        'searching': setupSearchingPage,
        'stack': setupStackPage,
        'queue': setupQueuePage,
        'linkedlist': setupLinkedListPage,
        'bst': setupBstPage,
        // Add other pages here later
        // 'graph': setupGraphPage,
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