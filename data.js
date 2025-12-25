const stats_endpoint = `https://s.defly.io/mystats?s=${window.localStorage["sessionId"]}`;

async function fetchAllStats() {
    // FIX BUG 7: Check if session ID exists
    if (!window.localStorage["sessionId"]) {
        console.error("No Session ID found. Please log in to Defly.");
        alert("Please log in to Defly to view achievements.");
        return [];
    }

    const response = await fetch(stats_endpoint);
    if (!response.ok) {
        console.error("Failed to fetch data, status:", response.status);
        return [];
    }
    const text = await response.text();
    
    // FIX BUG 9: Try/Catch for JSON parsing
    try {
        return JSON.parse(text.split("\n")[0]);
    } catch (e) {
        console.error("Failed to parse API response", e);
        return [];
    }
}

function processData(user_data) {
    const processedData = user_data.map(event => {
        const startDate = new Date(event.start);
        event.time_alive = (event.end - event.start) / 1000;
        event.map_percentage = (event.max_area / event.map_area) * 100;
        event.start_date = startDate.toISOString().split('T')[0];

        // Calculate rounds won for defuse mode (game_mode = 2)
        if (event.game_mode === 2) {
            event.rounds_won = event.max_area * event.level;
        }
        return event;
    });
    return processedData;
}


function calculateConsecutiveDays(events) {
    // FIX BUG 6: Normalize dates to midnight to ensure integer math
    let dates = events.map(event => {
        const d = new Date(event.start_date);
        d.setHours(0, 0, 0, 0); // Force midnight
        return d;
    });
    
    // Sort logic remains, but now strictly on midnight timestamps
    dates = [...new Set(dates.map(d => d.getTime()))].sort((a, b) => a - b);

    let maxConsecutiveDays = 0;
    let currentConsecutiveDays = 1;

    for (let i = 1; i < dates.length; i++) {
        // Now using getTime() numbers, so math is cleaner
        const diffDays = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
        
        // Use Math.round to handle potential microscopic floating point errors
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