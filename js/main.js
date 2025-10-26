document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const appContainer = document.getElementById('app-container');

    // A map to connect the 'data-page' attribute to the setup function
    const pageSetupFunctions = {
        'sorting': setupSortingPage,
        'searching': setupSearchingPage,
        'stack': setupStackPage,
        // Add other pages here later
        // 'queue': setupQueuePage,
    };

    function showPage(pageId) {
        // Clear the current content
        appContainer.innerHTML = '';
        
        // Call the corresponding setup function
        if (pageSetupFunctions[pageId]) {
            pageSetupFunctions[pageId]();
        } else {
            appContainer.innerHTML = `<h2>Page not found or not yet implemented: ${pageId}</h2>`;
        }

        // Update the 'active' class on nav links
        navLinks.forEach(link => {
            if (link.dataset.page === pageId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Add click event listeners to all nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent the browser from reloading
            const pageId = e.target.dataset.page;
            showPage(pageId);
        });
    });

    // Show the default page (sorting) on initial load
    showPage('sorting');
});

