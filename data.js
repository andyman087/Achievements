const stats_endpoint = `https://s.defly.io/mystats?s=${window.localStorage["sessionId"]}`;

async function fetchAllStats() {
    const response = await fetch(stats_endpoint);
    if (!response.ok) {
        console.error("Failed to fetch data, status:", response.status);
        return [];
    }
    const text = await response.text();
    return JSON.parse(text.split("\n")[0]);
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
    let dates = events.map(event => new Date(event.start_date));
    dates = [...new Set(dates)].sort((a, b) => a - b);

    let maxConsecutiveDays = 0;
    let currentConsecutiveDays = 1;

    for (let i = 1; i < dates.length; i++) {
        const diffDays = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
        if (diffDays === 1) {
            currentConsecutiveDays++;
        } else {
            maxConsecutiveDays = Math.max(maxConsecutiveDays, currentConsecutiveDays);
            currentConsecutiveDays = 1;
        }
    }
    maxConsecutiveDays = Math.max(maxConsecutiveDays, currentConsecutiveDays);
    return maxConsecutiveDays;
}
