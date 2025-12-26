// === HELPER: Check a single game against specific criteria ===
function checkGameCriteria(event, criteria) {
    for (let key in criteria) {
        if (key === 'aggregate') continue; 
        let actualKey = key;
        if (key === 'win_rate') actualKey = 'max_area'; 
        if (!event.hasOwnProperty(actualKey)) return false;
        const value = event[actualKey];
        const criterion = criteria[key];
        if (typeof criterion === 'object') {
            if (criterion.min !== undefined && value < criterion.min) return false;
            if (criterion.max !== undefined && value > criterion.max) return false;
        } else {
            if (value !== criterion) return false;
        }
    }
    return true;
}

// FIX: Robust Formatting - Check keys as well as highlight tag
function formatProgressValue(value, ach) {
    // Collect all keys to check
    const keys = ach.criteria ? Object.keys(ach.criteria) : [];
    const hKey = ach.highlight;

    if (hKey === 'time_alive' || keys.includes('time_alive')) {
        return Math.floor((value / 3600) * 100) / 100;
    }
    if (hKey === 'max_score' || keys.includes('max_score') || 
        hKey === 'rounds_won' || keys.includes('rounds_won')) {
        return Math.floor(value);
    }
    return value;
}

function checkAchievements(data, categories, consecutiveDays) {
    console.log("🛠️ Logic: Analyzing " + data.length + " games.");

    let flatAchievements = [];
    categories.forEach(cat => {
        cat.subCategories.forEach(sub => {
            sub.achievements.forEach(ach => {
                flatAchievements.push({
                    ...ach, 
                    categoryName: cat.name,
                    subCategoryName: sub.name,
                    currentProgress: 0,
                    trackCount: 0, 
                    unlockedTimestamp: null, 
                    isAchieved: false
                });
            });
        });
    });

    const lifetimeStats = {
        1: { player_kills: 0, time_alive: 0, dot_kills: 0, max_score: 0, rounds_won: 0, level: 0 }, 
        2: { player_kills: 0, time_alive: 0, dot_kills: 0, max_score: 0, rounds_won: 0, level: 0 },
        // Ensure all modes exist to prevent crashes
        0: { player_kills: 0, time_alive: 0, dot_kills: 0, max_score: 0, rounds_won: 0, level: 0 },
        3: { player_kills: 0, time_alive: 0, dot_kills: 0, max_score: 0, rounds_won: 0, level: 0 },
        4: { player_kills: 0, time_alive: 0, dot_kills: 0, max_score: 0, rounds_won: 0, level: 0 }
    };

    for (let i = 0; i < data.length; i++) {
        const game = data[i];
        const mode = game.game_mode;

        if (!lifetimeStats[mode]) lifetimeStats[mode] = { player_kills: 0, time_alive: 0, dot_kills: 0, max_score: 0, rounds_won: 0, level: 0 };
        
        lifetimeStats[mode].player_kills += game.player_kills || 0;
        lifetimeStats[mode].time_alive += game.time_alive || 0;
        lifetimeStats[mode].dot_kills += game.dot_kills || 0;
        lifetimeStats[mode].max_score += game.max_score || 0;
        // Defuse specific stats
        lifetimeStats[mode].rounds_won += game.rounds_won || 0;
        lifetimeStats[mode].level += game.level || 0;

        for (let j = 0; j < flatAchievements.length; j++) {
            const ach = flatAchievements[j];
            if (ach.criteria.consecutive_days) continue;

            // TYPE: LIFETIME
            if (ach.criteria.aggregate) {
                if (ach.criteria.game_mode !== undefined && ach.criteria.game_mode !== mode) continue;
                const targetStat = Object.keys(ach.criteria).find(k => k !== 'game_mode' && k !== 'aggregate');
                if (targetStat) {
                    const runningTotal = lifetimeStats[mode][targetStat];
                    ach.currentProgress = runningTotal; 
                    if (!ach.unlockedTimestamp && runningTotal >= ach.criteria[targetStat].min) {
                        ach.unlockedTimestamp = game.timestamp;
                        ach.isAchieved = true;
                    }
                }
            } 
            // TYPE: PER GAME
            else {
                // FIX: Separate "Tracking Best" from "Checking Achievement"
                // 1. Always track the "Best Score" for this stat type, regardless of if we pass/fail this specific badge
                if (ach.count === 1) { // Single Game High Score
                    let targetStat = Object.keys(ach.criteria).find(k => k !== 'game_mode' && k !== 'win_rate' && typeof ach.criteria[k] === 'object');
                    
                    // Special case for Win Rate
                    if(ach.criteria.win_rate) targetStat = 'max_area'; 

                    // Only track if this game mode matches
                    if (ach.criteria.game_mode === undefined || ach.criteria.game_mode === mode) {
                        const score = game[targetStat] || 0;
                        if (score > ach.currentProgress) ach.currentProgress = score;
                    }
                }

                // 2. Check if this specific game unlocks the achievement
                if (checkGameCriteria(game, ach.criteria)) {
                    if (ach.count > 1) { // Multiple Games
                        ach.trackCount++;
                        ach.currentProgress = ach.trackCount;
                        if (!ach.unlockedTimestamp && ach.trackCount >= ach.count) {
                            ach.unlockedTimestamp = game.timestamp;
                            ach.isAchieved = true;
                        }
                    } else { // Single Game
                        // Just need to mark it achieved, progress is tracked above
                        if (!ach.unlockedTimestamp) {
                            ach.unlockedTimestamp = game.timestamp;
                            ach.isAchieved = true;
                        }
                    }
                }
            }
        }
    }

    // Post-Loop Cleanup
    for (let i = 0; i < flatAchievements.length; i++) {
        let ach = flatAchievements[i];
        if (ach.criteria.consecutive_days) {
            ach.currentProgress = consecutiveDays;
            ach.targetValue = ach.criteria.consecutive_days.min;
            ach.isAchieved = ach.currentProgress >= ach.targetValue;
            if (ach.isAchieved && !ach.unlockedTimestamp) ach.unlockedTimestamp = Date.now();
        } else if (ach.criteria.aggregate) {
             const targetStat = Object.keys(ach.criteria).find(k => k !== 'game_mode' && k !== 'aggregate');
             ach.targetValue = ach.criteria[targetStat].min;
        } else {
             if (ach.count > 1) ach.targetValue = ach.count;
             else {
                 let targetStat = Object.keys(ach.criteria).find(k => k !== 'game_mode');
                 if (typeof ach.criteria[targetStat] === 'object') ach.targetValue = ach.criteria[targetStat].min;
                 else ach.targetValue = ach.criteria[targetStat];
             }
        }

        // Final Sync: If achieved, ensure progress shows 100%
        if (ach.isAchieved && ach.currentProgress < ach.targetValue) {
            ach.currentProgress = ach.targetValue;
        }

        ach.currentProgress = formatProgressValue(ach.currentProgress, ach);
        ach.targetValue = formatProgressValue(ach.targetValue, ach);
    }

    return categories.map(category => {
        const catAchievements = flatAchievements.filter(a => a.categoryName === category.name);
        return {
            category: category.name,
            subCategories: category.subCategories.map(sub => ({
                subCategory: sub.name,
                achievements: catAchievements.filter(a => a.subCategoryName === sub.name).map(a => ({
                    rank: a.rank,
                    achieved: a.isAchieved,
                    unlockedTimestamp: a.unlockedTimestamp, 
                    description: a.description,
                    value: rankDetails[a.rank].value,
                    progress: a.currentProgress,
                    criteriaMin: a.targetValue,
                    highlight: a.highlight
                }))
            }))
        };
    });
}

function calculateCategoryTotals(mappedResults) {
    const totalPointsObj = {};
    mappedResults.forEach(category => {
        let categoryTotal = 0;
        category.subCategories.forEach(subCategory => {
            subCategory.achievements.forEach(achievement => {
                if (achievement.achieved) {
                    categoryTotal += achievement.value;
                }
            });
        });
        totalPointsObj[category.category] = categoryTotal;
    });
    return totalPointsObj;
}