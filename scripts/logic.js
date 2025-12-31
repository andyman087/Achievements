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

// === NEW HELPER: Check filters IGNORING one key ===
// This allows us to track "Best Rounds" only for games that passed the "Win Rate" check
function checkGameCriteriaPartial(event, criteria, ignoreKey) {
    for (let key in criteria) {
        if (key === 'aggregate') continue;
        if (key === ignoreKey) continue; // SKIP the one we are tracking progress for

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
    if (ach.count > 1 && !ach.criteria.aggregate) {
        return value;
    }

    const keys = ach.criteria ? Object.keys(ach.criteria) : [];
    const hKey = ach.highlight;

    if (hKey === 'time_alive' || (!hKey && keys.includes('time_alive'))) {
        return Math.floor((value / 3600) * 100) / 100;
    }
    if (hKey === 'max_score' || keys.includes('max_score') ||
        hKey === 'rounds_won' || keys.includes('rounds_won') ||
        hKey === 'level' || keys.includes('level')) { // Added 'level' explicitly
        return Math.floor(value);
    }
    return value;
}

// === MAIN LOGIC ===
function checkAchievements(data, categories, consecutiveDays) {
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
                // 1. Single Game High Score Tracking (ROBUST FIX)
                if (ach.count === 1) {
                    if (ach.criteria.game_mode === undefined || ach.criteria.game_mode === mode) {

                        // Step 1: Identify what criteria key corresponds to the progress bar
                        let criteriaKey = ach.highlight;

                        // Fallback: guess from criteria
                        if (!criteriaKey) {
                            criteriaKey = Object.keys(ach.criteria).find(k => k !== 'game_mode' && typeof ach.criteria[k] === 'object');
                        }

                        // Step 2: Map that key to the actual data property (win_rate -> max_area)
                        let dataProp = criteriaKey;
                        if (dataProp === 'win_rate') dataProp = 'max_area';

                        // Step 3: Check if game is valid for tracking
                        if (dataProp && game[dataProp] !== undefined) {
                            // "Partial Check": Does the game pass all filters EXCEPT the one we are tracking?
                            // e.g. If tracking 'level' (rounds), does it pass 'win_rate' >= 0.8?
                            if (checkGameCriteriaPartial(game, ach.criteria, criteriaKey)) {
                                const val = game[dataProp];
                                // Only then do we update the high score
                                if (val > ach.currentProgress) ach.currentProgress = val;
                            }
                        }
                    }
                }

                // 2. Unlock Check
                if (checkGameCriteria(game, ach.criteria)) {
                    if (ach.count > 1) {
                        ach.trackCount++;
                        ach.currentProgress = ach.trackCount;
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
                 ach.targetValue = ach.count;
             } else {
                 // Determine Target Value from criteria
                 let criteriaKey = ach.highlight;
                 if (!criteriaKey) criteriaKey = Object.keys(ach.criteria).find(k => k !== 'game_mode');

                 // If highlighting win_rate/level, ensure target matches that specific criteria
                 if (ach.criteria[criteriaKey]) {
                     ach.targetValue = ach.criteria[criteriaKey].min || ach.criteria[criteriaKey];
                 } else {
                     // Fallback if highlight key isn't in criteria (unlikely with good config)
                     let anyKey = Object.keys(ach.criteria).find(k => k !== 'game_mode');
                     ach.targetValue = ach.criteria[anyKey] ? ach.criteria[anyKey].min : 0;
                 }
             }
        }

        ach.currentProgress = formatProgressValue(ach.currentProgress, ach);
        ach.targetValue = formatProgressValue(ach.targetValue, ach);

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
