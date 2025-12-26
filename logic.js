// === HELPER: Check a single game against specific criteria ===
function checkGameCriteria(event, criteria) {
    for (let key in criteria) {
        // Skip aggregate flag, handled separately
        if (key === 'aggregate') continue; 
        
        let actualKey = key;
        if (key === 'win_rate') actualKey = 'max_area'; // Defly quirk mapping

        // If game data is missing this stat, fail
        if (!event.hasOwnProperty(actualKey)) return false;

        const value = event[actualKey];
        const criterion = criteria[key];

        // Range check (min/max) or Exact match
        if (typeof criterion === 'object') {
            if (criterion.min !== undefined && value < criterion.min) return false;
            if (criterion.max !== undefined && value > criterion.max) return false;
        } else {
            if (value !== criterion) return false;
        }
    }
    return true;
}

// === HELPER: Format Numbers (Hours, Scores) ===
function formatProgressValue(value, highlightKey) {
    if (highlightKey === 'time_alive') {
        // Seconds -> Hours (2 decimals)
        return Math.floor((value / 3600) * 100) / 100;
    }
    if (highlightKey === 'max_score' || highlightKey === 'rounds_won') {
        // Whole numbers
        return Math.floor(value);
    }
    return value;
}

// === MAIN LOGIC: The "Single Pass" Engine ===
function checkAchievements(data, categories, consecutiveDays) {
    
    // 1. FLATTEN CONFIG
    // Create a flat list of all achievements to make looping easier
    // We attach their original path (Category > SubCategory) so we can rebuild the structure later.
    let flatAchievements = [];
    categories.forEach(cat => {
        cat.subCategories.forEach(sub => {
            sub.achievements.forEach(ach => {
                flatAchievements.push({
                    ...ach, // Copy config data
                    categoryName: cat.name,
                    subCategoryName: sub.name,
                    // Initialize tracking vars
                    currentProgress: 0,
                    isAchieved: false
                });
            });
        });
    });

    // 2. PREPARE LIFETIME TRACKERS
    // We group lifetime achievements by their "filter" (e.g. Teams, Defuse)
    // to avoid summing up the same stats multiple times.
    const lifetimeStats = {
        1: { player_kills: 0, time_alive: 0, dot_kills: 0, max_score: 0, rounds_won: 0, level: 0 }, // Teams
        2: { player_kills: 0, time_alive: 0, dot_kills: 0, max_score: 0, rounds_won: 0, level: 0 }, // Defuse
        // Add other modes if needed
    };

    // 3. THE "SINGLE PASS" LOOP (Performance Fix)
    // We walk through the 8,000 games exactly ONE time.
    for (let i = 0; i < data.length; i++) {
        const game = data[i];
        const mode = game.game_mode;

        // A. Update Lifetime Totals for this mode
        if (!lifetimeStats[mode]) lifetimeStats[mode] = { player_kills: 0, time_alive: 0, dot_kills: 0, max_score: 0, rounds_won: 0, level: 0 };
        
        lifetimeStats[mode].player_kills += game.player_kills || 0;
        lifetimeStats[mode].time_alive += game.time_alive || 0;
        lifetimeStats[mode].dot_kills += game.dot_kills || 0;
        lifetimeStats[mode].max_score += game.max_score || 0;
        lifetimeStats[mode].rounds_won += game.rounds_won || 0;
        lifetimeStats[mode].level += game.level || 0;

        // B. Check "Per Game" Achievements
        // We only check achievements that are NOT aggregate and NOT consecutive_days
        for (let j = 0; j < flatAchievements.length; j++) {
            const ach = flatAchievements[j];
            
            // Skip Special Types
            if (ach.criteria.aggregate || ach.criteria.consecutive_days) continue;

            // Does this specific game meet the criteria?
            if (checkGameCriteria(game, ach.criteria)) {
                if (ach.count > 1) {
                    // Type: Multiple Games (Count up)
                    ach.currentProgress++;
                } else {
                    // Type: Single Target (High Score)
                    // We need to find which stat we are tracking (e.g., 'player_kills')
                    // and see if this game is a new personal best.
                    
                    // Identify the target stat from the criteria (e.g. "player_kills")
                    let targetStat = Object.keys(ach.criteria).find(k => k !== 'game_mode' && typeof ach.criteria[k] === 'object');
                    
                    if (targetStat && game[targetStat] !== undefined) {
                        if (game[targetStat] > ach.currentProgress) {
                            ach.currentProgress = game[targetStat];
                        }
                    } else {
                        // Fallback if structure is simple
                        ach.currentProgress = 1; 
                    }
                }
            }
        }
    }

    // 4. FINALIZE CALCULATIONS
    // Now we check if the totals met the requirements
    for (let i = 0; i < flatAchievements.length; i++) {
        let ach = flatAchievements[i];

        // Case A: Consecutive Days (Already calculated in data.js)
        if (ach.criteria.consecutive_days) {
            ach.currentProgress = consecutiveDays;
            ach.isAchieved = ach.currentProgress >= ach.criteria.consecutive_days.min;
            ach.targetValue = ach.criteria.consecutive_days.min;
        }
        // Case B: Lifetime Aggregate (Use the summed stats)
        else if (ach.criteria.aggregate) {
            const mode = ach.criteria.game_mode;
            const stats = lifetimeStats[mode] || {}; // Get totals for this mode
            
            // Which stat is this achievement looking for?
            let targetStat = Object.keys(ach.criteria).find(k => k !== 'game_mode' && k !== 'aggregate');
            
            if (targetStat) {
                ach.currentProgress = stats[targetStat] || 0;
                ach.targetValue = ach.criteria[targetStat].min;
                ach.isAchieved = ach.currentProgress >= ach.targetValue;
            }
        }
        // Case C: Single & Multiple Games (Already counted in the loop)
        else {
            if (ach.count > 1) {
                // Multiple Games
                ach.targetValue = ach.count;
                ach.isAchieved = ach.currentProgress >= ach.targetValue;
            } else {
                // Single Target (High Score)
                // Get target from config
                let targetStat = Object.keys(ach.criteria).find(k => k !== 'game_mode');
                ach.targetValue = ach.criteria[targetStat].min;
                ach.isAchieved = ach.currentProgress >= ach.targetValue;
            }
        }

        // Apply Formatting (Seconds -> Hours, etc)
        ach.currentProgress = formatProgressValue(ach.currentProgress, ach.highlight);
        ach.targetValue = formatProgressValue(ach.targetValue, ach.highlight);
    }

    // 5. RE-MAP TO ORIGINAL STRUCTURE
    // visual.js expects the nested structure, so we rebuild it from our flat list.
    const results = categories.map(category => {
        const catAchievements = flatAchievements.filter(a => a.categoryName === category.name);
        
        // Group by SubCategory
        const subCats = category.subCategories.map(sub => {
            const subAchieves = catAchievements.filter(a => a.subCategoryName === sub.name);
            
            const mappedAchieves = subAchieves.map(a => ({
                rank: a.rank,
                achieved: a.isAchieved,
                criteria: a.criteria,
                description: a.description,
                value: rankDetails[a.rank].value, // From global config
                progress: a.currentProgress,
                criteriaMin: a.targetValue,
                highlight: a.highlight
            }));

            return {
                subCategory: sub.name,
                achievements: mappedAchieves
            };
        });

        return {
            category: category.name,
            subCategories: subCats
        };
    });

    return results;
}

// === HELPER: Calculate Totals for Header ===
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