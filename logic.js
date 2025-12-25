function checkCriteria(event, criteria) {
    for (let key in criteria) {
        let actualKey = key;
        if (key === 'win_rate') {
            actualKey = 'max_area';
        }

        if (key === 'aggregate') continue;

        if (!event.hasOwnProperty(actualKey)) {
            return false;
        }
        if (criteria[key] !== undefined) {
            const value = event[actualKey];
            const criterion = criteria[key];
            if (typeof criterion === 'object') {
                if (criterion.min !== undefined && value < criterion.min) return false;
                if (criterion.max !== undefined && value > criterion.max) return false;
            } else {
                if (value !== criterion) return false;
            }
        }
    }
    return true;
}

function checkAchievements(data, categories, consecutiveDays) {
    const results = categories.map(category => {
        let categoryResults = category.subCategories.map(subCategory => {
            let subCategoryResults = subCategory.achievements.map(achievement => {
                let achieved = false;
                let progress = 0;
                let highlightValue = 0;
                let criteriaMin = 0;

                // TYPE 1: LIFETIME AGGREGATE
                if (achievement.criteria.aggregate) {
                    const aggregateCriteria = { ...achievement.criteria };
                    delete aggregateCriteria.player_kills;
                    delete aggregateCriteria.time_alive;
                    delete aggregateCriteria.rounds_won;
                    delete aggregateCriteria.level;
                    delete aggregateCriteria.max_score;
                    delete aggregateCriteria.dot_kills;
                    delete aggregateCriteria.count;

                    const filteredEvents = data.filter(event => checkCriteria(event, aggregateCriteria));

                    const totalAggregates = {
                        player_kills: 0,
                        time_alive: 0,
                        rounds_won: 0,
                        level: 0,
                        max_score: 0,
                        dot_kills: 0
                    };

                    filteredEvents.forEach(event => {
                        totalAggregates.player_kills += event.player_kills || 0;
                        totalAggregates.time_alive += event.time_alive || 0;
                        totalAggregates.rounds_won += event.rounds_won || 0;
                        totalAggregates.level += event.level || 0;
                        totalAggregates.max_score += event.max_score || 0;
                        totalAggregates.dot_kills += event.dot_kills || 0;
                    });

                    let targetStatKey = Object.keys(achievement.criteria).find(k => k !== 'game_mode' && k !== 'aggregate');
                    
                    if (targetStatKey && totalAggregates[targetStatKey] !== undefined) {
                        progress = totalAggregates[targetStatKey];
                        criteriaMin = achievement.criteria[targetStatKey].min || 0;
                        achieved = progress >= criteriaMin;
                    }
                } 
                // TYPE 2 & 3: PER GAME
                else {
                    const successfulGamesCount = data.reduce((acc, event) => acc + (checkCriteria(event, achievement.criteria) ? 1 : 0), 0);
                    
                    if (achievement.criteria.consecutive_days) {
                         progress = consecutiveDays;
                         criteriaMin = achievement.criteria.consecutive_days.min;
                         achieved = consecutiveDays >= criteriaMin;
                    } 
                    // TYPE 2: MULTIPLE GAMES
                    else if (achievement.count > 1) {
                        progress = successfulGamesCount;
                        criteriaMin = achievement.count;
                        achieved = progress >= criteriaMin;
                    } 
                    // TYPE 3: SINGLE TARGET
                    else {
                        achieved = successfulGamesCount >= 1;

                        const contextCriteria = { ...achievement.criteria };
                        let scoreKey = Object.keys(achievement.criteria).find(k => typeof achievement.criteria[k] === 'object' && achievement.criteria[k].min !== undefined);
                        
                        if (scoreKey) {
                            delete contextCriteria[scoreKey];
                            delete contextCriteria.count;

                            const validGames = data.filter(event => checkCriteria(event, contextCriteria));
                            const bestScore = validGames.reduce((max, event) => Math.max(max, event[scoreKey] || 0), 0);
                            
                            progress = bestScore;
                            criteriaMin = achievement.criteria[scoreKey].min;
                        } else {
                            progress = successfulGamesCount;
                            criteriaMin = 1;
                        }
                    }
                }

                // === UNIT CONVERSION & FORMATTING ===
                
                // Only convert units if the progress represents the stat itself (Aggregate or Single Target).
                const isStatValue = achievement.criteria.aggregate || (achievement.count === 1 && !achievement.criteria.consecutive_days);

                if (isStatValue) {
                    const criteriaKeys = achievement.criteria ? Object.keys(achievement.criteria) : [];
                    
                    // 1. Time Alive: Convert Seconds -> Hours (2 Decimal Places)
                    if (achievement.highlight === 'time_alive' || criteriaKeys.includes('time_alive')) {
                         progress = Math.floor((progress / 3600) * 100) / 100;
                         criteriaMin = Math.floor((criteriaMin / 3600) * 100) / 100;
                    }
                    
                    // 2. Score: Round to Whole Number
                    if (achievement.highlight === 'max_score' || criteriaKeys.includes('max_score')) {
                        progress = Math.floor(progress);
                        criteriaMin = Math.floor(criteriaMin);
                    }
                }

                return {
                    rank: achievement.rank,
                    achieved: achieved,
                    criteria: achievement.criteria || {},
                    description: achievement.description,
                    value: rankDetails[achievement.rank].value,
                    progress: progress,
                    criteriaMin: criteriaMin
                };
            });
            return {
                subCategory: subCategory.name,
                achievements: subCategoryResults
            };
        });
        return {
            category: category.name,
            subCategories: categoryResults
        };
    });
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