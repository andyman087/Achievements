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

function formatProgressValue(value, highlightKey) {
    if (highlightKey === 'time_alive') {
        return Math.floor((value / 3600) * 100) / 100;
    }
    if (highlightKey === 'max_score' || highlightKey === 'rounds_won') {
        return Math.floor(value);
    }
    return value;
}

function checkAchievements(data, categories, consecutiveDays) {
    console.log("🛠️ Logic: Starting Single Pass on " + data.length + " games.");

    // 1. Flatten Config
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

    // 2. Lifetime Stats Container
    const lifetimeStats = {
        1: { player_kills: 0, time_alive: 0, dot_kills: 0, max_score: 0, rounds_won: 0, level: 0 }, 
        2: { player_kills: 0, time_alive: 0, dot_kills: 0, max_score: 0, rounds_won: 0, level: 0 }
    };

    // 3. CHRONOLOGICAL REPLAY
    for (let i = 0; i < data.length; i++) {
        const game = data[i];
        const mode = game.game_mode;

        // Verify timestamp exists on first game (Debug)
        if (i === 0 && !game.timestamp) console.error("❌ Logic Error: First game has no timestamp!", game);

        // A. Update Lifetime
        if (!lifetimeStats[mode]) lifetimeStats[mode] = { player_kills: 0, time_alive: 0, dot_kills: 0, max_score: 0, rounds_won: 0, level: 0 };
        
        lifetimeStats[mode].player_kills += game.player_kills || 0;
        lifetimeStats[mode].time_alive += game.time_alive || 0;
        lifetimeStats[mode].dot_kills += game.dot_kills || 0;
        lifetimeStats[mode].max_score += game.max_score || 0;
        lifetimeStats[mode].rounds_won += game.rounds_won || 0;
        lifetimeStats[mode].level += game.level || 0;

        // B. Check Achievements
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
                        ach.unlockedTimestamp = game.timestamp; // CAPTURE DATE
                        ach.isAchieved = true;
                        // Debug log for first few unlocks
                        if (Math.random() < 0.01) console.log(`🔓 Unlocked Lifetime: ${ach.description} on ${new Date(game.timestamp).toLocaleDateString()}`);
                    }
                }
            }
            // TYPE: PER GAME
            else {
                if (checkGameCriteria(game, ach.criteria)) {
                    
                    if (ach.count > 1) {
                        ach.trackCount++;
                        ach.currentProgress = ach.trackCount;
                        
                        if (!ach.unlockedTimestamp && ach.trackCount >= ach.count) {
                            ach.unlockedTimestamp = game.timestamp; // CAPTURE DATE
                            ach.isAchieved = true;
                        }
                    } 
                    else {
                        let targetStat = Object.keys(ach.criteria).find(k => k !== 'game_mode' && typeof ach.criteria[k] === 'object');
                        const score = game[targetStat] || 0;

                        if (score > ach.currentProgress) ach.currentProgress = score;

                        if (!ach.unlockedTimestamp && score >= ach.criteria[targetStat].min) {
                            ach.unlockedTimestamp = game.timestamp; // CAPTURE DATE
                            ach.isAchieved = true;
                        }
                    }
                }
            }
        }
    }

    // 4. Final Polish
    for (let i = 0; i < flatAchievements.length; i++) {
        let ach = flatAchievements[i];

        if (ach.criteria.consecutive_days) {
            ach.currentProgress = consecutiveDays;
            ach.targetValue = ach.criteria.consecutive_days.min;
            ach.isAchieved = ach.currentProgress >= ach.targetValue;
            if (ach.isAchieved && !ach.unlockedTimestamp) ach.unlockedTimestamp = Date.now(); 
        } 
        else if (ach.criteria.aggregate) {
             const targetStat = Object.keys(ach.criteria).find(k => k !== 'game_mode' && k !== 'aggregate');
             ach.targetValue = ach.criteria[targetStat].min;
        } 
        else {
             if (ach.count > 1) ach.targetValue = ach.count;
             else {
                 let targetStat = Object.keys(ach.criteria).find(k => k !== 'game_mode');
                 ach.targetValue = ach.criteria[targetStat].min;
             }
        }

        ach.currentProgress = formatProgressValue(ach.currentProgress, ach.highlight);
        ach.targetValue = formatProgressValue(ach.targetValue, ach.highlight);
    }

    // 5. Reconstruct
    const results = categories.map(category => {
        const catAchievements = flatAchievements.filter(a => a.categoryName === category.name);
        const subCats = category.subCategories.map(sub => {
            const subAchieves = catAchievements.filter(a => a.subCategoryName === sub.name);
            const mappedAchieves = subAchieves.map(a => ({
                rank: a.rank,
                achieved: a.isAchieved,
                unlockedTimestamp: a.unlockedTimestamp, // PASSING IT HERE
                description: a.description,
                value: rankDetails[a.rank].value,
                progress: a.currentProgress,
                criteriaMin: a.targetValue,
                highlight: a.highlight
            }));
            return { subCategory: sub.name, achievements: mappedAchieves };
        });
        return { category: category.name, subCategories: subCats };
    });

    console.log("✅ Logic: Finished processing.");
    return results;
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