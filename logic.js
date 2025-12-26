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

// === HELPER: Formatting ===
function formatProgressValue(value, ach) {
    // RULE: If this is a Multiple Game counter (and not achieved yet), DO NOT FORMAT.
    // We want to see "3" games, not "0.00 hours".
    if (ach.count > 1 && !ach.criteria.aggregate) {
        return value; 
    }

    const keys = ach.criteria ? Object.keys(ach.criteria) : [];
    const hKey = ach.highlight;

    if (hKey === 'time_alive' || (!hKey && keys.includes('time_alive'))) {
        return Math.floor((value / 3600) * 100) / 100;
    }
    if (hKey === 'max_score' || keys.includes('max_score') || 
        hKey === 'rounds_won' || keys.includes('rounds_won')) {
        return Math.floor(value);
    }
    return value;
}

// === MAIN LOGIC ===
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
        0: { player_kills: 0, time_alive: 0, dot_kills: 0, max_score: 0, rounds_won: 0, level: 0 },
        3: { player_kills: 0, time_alive: 0, dot_kills: 0, max_score: 0, rounds_won: 0, level: 0 },
        4: { player_kills: 0, time_alive: 0, dot_kills: 0, max_score: 0, rounds_won: 0, level: 0 }
    };

    for (let i = 0; i < data.length; i++) {
        const game = data[i];
        const mode = game.game_mode;

        // 1. Update Lifetime Stats Container
        if (!lifetimeStats[mode]) lifetimeStats[mode] = { player_kills: 0, time_alive: 0, dot_kills: 0, max_score: 0, rounds_won: 0, level: 0 };
        lifetimeStats[mode].player_kills += game.player_kills || 0;
        lifetimeStats[mode].time_alive += game.time_alive || 0;
        lifetimeStats[mode].dot_kills += game.dot_kills || 0;
        lifetimeStats[mode].max_score += game.max_score || 0;
        lifetimeStats[mode].rounds_won += game.rounds_won || 0;
        lifetimeStats[mode].level += game.level || 0;

        // 2. Check Achievements
        for (let j = 0; j < flatAchievements.length; j++) {
            const ach = flatAchievements[j];
            if (ach.criteria.consecutive_days) continue;

            // --- A: LIFETIME AGGREGATE ---
            if (ach.criteria.aggregate) {
                if (ach.criteria.game_mode !== undefined && ach.criteria.game_mode !== mode) continue;
                
                let targetStat = ach.highlight;
                if (!targetStat) {
                    targetStat = Object.keys(ach.criteria).find(k => k !== 'game_mode' && k !== 'aggregate');
                }

                if (targetStat && lifetimeStats[mode][targetStat] !== undefined) {
                    const runningTotal = lifetimeStats[mode][targetStat];
                    ach.currentProgress = runningTotal; 
                    
                    let criteriaVal = ach.criteria[targetStat] ? ach.criteria[targetStat].min : 0;
                    if (!ach.unlockedTimestamp && runningTotal >= criteriaVal) {
                        ach.unlockedTimestamp = game.timestamp;
                        ach.isAchieved = true;
                    }
                }
            } 
            // --- B: PER GAME (Single & Multiple) ---
            else {
                // 1. Single Game High Score Tracking
                if (ach.count === 1) { 
                    if (ach.criteria.game_mode === undefined || ach.criteria.game_mode === mode) {
                        let statToTrack = ach.highlight;
                        if (statToTrack === 'win_rate') statToTrack = 'max_area'; 
                        
                        if (!statToTrack) {
                            statToTrack = Object.keys(ach.criteria).find(k => k !== 'game_mode' && typeof ach.criteria[k] === 'object');
                        }

                        if (statToTrack && game[statToTrack] !== undefined) {
                            const val = game[statToTrack];
                            if (val > ach.currentProgress) ach.currentProgress = val;
                        }
                    }
                }

                // 2. Unlock Check
                if (checkGameCriteria(game, ach.criteria)) {
                    if (ach.count > 1) { 
                        ach.trackCount++;
                        ach.currentProgress = ach.trackCount; // Progress = Count of Games
                        
                        if (!ach.unlockedTimestamp && ach.trackCount >= ach.count) {
                            ach.unlockedTimestamp = game.timestamp;
                            ach.isAchieved = true;
                        }
                    } else { 
                        if (!ach.unlockedTimestamp) {
                            ach.unlockedTimestamp = game.timestamp;
                            ach.isAchieved = true;
                        }
                    }
                }
            }
        }
    }

    // 3. Post-Loop Formatting
    for (let i = 0; i < flatAchievements.length; i++) {
        let ach = flatAchievements[i];

        if (ach.criteria.consecutive_days) {
            ach.currentProgress = consecutiveDays;
            ach.targetValue = ach.criteria.consecutive_days.min;
            ach.isAchieved = ach.currentProgress >= ach.targetValue;
            if (ach.isAchieved && !ach.unlockedTimestamp) ach.unlockedTimestamp = Date.now();
        } 
        else if (ach.criteria.aggregate) {
             let targetStat = ach.highlight || Object.keys(ach.criteria).find(k => k !== 'game_mode' && k !== 'aggregate');
             ach.targetValue = ach.criteria[targetStat] ? ach.criteria[targetStat].min : 0;
        } 
        else {
             if (ach.count > 1) {
                 ach.targetValue = ach.count; // Target is simply the Count (e.g. 5)
             } else {
                 let targetStat = ach.highlight;
                 if (targetStat === 'win_rate') targetStat = 'max_area';
                 if (!targetStat) targetStat = Object.keys(ach.criteria).find(k => k !== 'game_mode');
                 
                 if (ach.criteria[targetStat]) ach.targetValue = ach.criteria[targetStat].min || ach.criteria[targetStat];
                 else ach.targetValue = 0;
             }
        }

        // FORMATTING
        ach.currentProgress = formatProgressValue(ach.currentProgress, ach);
        ach.targetValue = formatProgressValue(ach.targetValue, ach);

        // Sync if Achieved
        if (ach.isAchieved && ach.currentProgress < ach.targetValue) {
            ach.currentProgress = ach.targetValue;
        }
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