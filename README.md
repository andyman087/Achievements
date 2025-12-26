Run the below script in your console and it will start the plugin:

(function() { 
    const baseUrl = "https://raw.githack.com/andyman087/Achievements/main/";
    const scripts = [
        baseUrl + "config.js",  // 1. Load Settings & Categories first
        baseUrl + "data.js",    // 2. Load API Fetcher
        baseUrl + "logic.js",   // 3. Load Math & Calculations
        baseUrl + "visuals.js", // 4. Load UI & CSS
        baseUrl + "main.js"     // 5. Load Controller & Init
    ];

    function loadScript(url, callback) {
        const script = document.createElement("script");
        script.src = url + '?t=' + new Date().getTime(); 
        script.onload = callback;
        script.onerror = function() {
            console.error("Failed to load script: " + url);
        };
        document.head.appendChild(script);
    }

    function removeOldScripts() {
        const oldScripts = document.querySelectorAll('script[src*="Achievements/main/"]');
        oldScripts.forEach(script => script.remove());
        const oldBtn = document.getElementById('achievementButton');
        if(oldBtn) oldBtn.remove();
        const oldPopup = document.getElementById('achievementsPopup');
        if(oldPopup) oldPopup.remove();
    }

    function loadScriptsSequentially(scripts, index) {
        if (index < scripts.length) {
            loadScript(scripts[index], () => loadScriptsSequentially(scripts, index + 1));
        }
    }

    removeOldScripts();  
    loadScriptsSequentially(scripts, 0);  
})();
