const stats_endpoint = `https://s.defly.io/mystats?s=${window.localStorage["sessionId"]}`;

async function fetchAllStats() {
    // FIX: Get Session ID at the moment of the click, not when the script loads
    const sessionId = window.localStorage["sessionId"];

    if (!sessionId) {
        console.error("Defly Achievements: No Session ID found in localStorage.");
        return null; // Return null so main.js handles the alert
    }

    const stats_endpoint = `https://s.defly.io/mystats?s=${sessionId}`;

    try {
        const response = await fetch(stats_endpoint);
        if (!response.ok) {
            console.error("Defly Achievements: Fetch failed with status:", response.status);
            return [];
        }
        const text = await response.text();
        
        // Defly API usually returns one line of JSON
        return JSON.parse(text.split("\n")[0]);
    } catch (e) {
        console.error("Defly Achievements: Failed to parse API response", e);
        return [];
    }
}

function processData(user_data) {
    if (!Array.isArray(user_data)) return []; // Safety check

    const processedData = user_data.map(event => {
        const startDate = new Date(event.start);
        event.time_alive = (event.end - event.start) / 1000;
        event.map_percentage = (event.max_area / event.map_area) * 100;
        event.start_date = startDate.toISOString().split('T')[0];

        if (event.game_mode === 2) {
            event.rounds_won = event.max_area * event.level;
        }
        return event;
    });
    return processedData;
}

function calculateConsecutiveDays(events) {
    if (!events || events.length === 0) return 0;

    let dates = events.map(event => {
        const d = new Date(event.start_date);
        d.setHours(0, 0, 0, 0); 
        return d;
    });
    
    dates = [...new Set(dates.map(d => d.getTime()))].sort((a, b) => a - b);

    let maxConsecutiveDays = 0;
    let currentConsecutiveDays = 1;

    for (let i = 1; i < dates.length; i++) {
        const diffDays = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
        if (Math.round(diffDays) === 1) {
            currentConsecutiveDays++;
        } else {
            maxConsecutiveDays = Math.max(maxConsecutiveDays, currentConsecutiveDays);
            currentConsecutiveDays = 1;
        }
    }
    maxConsecutiveDays = Math.max(maxConsecutiveDays, currentConsecutiveDays);
    return maxConsecutiveDays;
}