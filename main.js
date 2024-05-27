const rankDetails = {
    1: { name: "Bronze", value: 1, image: "https://raw.githubusercontent.com/andyman087/Achievements/main/Images/Bronze%20Badge.png" },
    2: { name: "Silver", value: 2, image: "https://raw.githubusercontent.com/andyman087/Achievements/main/Images/Silver%20Badge.png" },
    3: { name: "Gold", value: 5, image: "https://raw.githubusercontent.com/andyman087/Achievements/main/Images/Gold%20Badge.png" },
    4: { name: "Master", value: 10, image: "https://raw.githubusercontent.com/andyman087/Achievements/main/Images/Master%20Badge.png" },
    5: { name: "Grand Master", value: 20, image: "https://raw.githubusercontent.com/andyman087/Achievements/main/Images/Grand%20Master%20Badge.png" }
};


/* Filter Criteria
dot_kills
start
end
game_mode - 0 = "FFA", 1 = "Teams", 2 = "Defuse", 3 = "E-FFA", 4 = "1v1"
kill_reason - 0 = "Disconnect", 1 = "Bullet", 2 = "Wall", 3 = "Player Collision", 4 = "Victory"
level - For defuse is also the total number of rounds
map_area
max_area - For defuse it is the percentage of number of rounds won eg 0.65
win_rate - Alias for max_area
max_score
player_kills
time_alive
rounds_won
map_percentage
consecutive_days
count - Number of Games the achievement must be met across. If 0 then add up all games
*/

const categories = [
    {
        name: "TEAMS",
        subCategories: [
            {
                name: "Total Kills Example",
                achievements: [
                    { rank: 1, criteria: { player_kills: { min: 10000 }, game_mode: 1, aggregate: true }, count: 1, description: "Get and 1 game at least 10,000 kills in Teams mode" },
                    { rank: 2, criteria: { player_kills: { min: 20000 }, game_mode: 1, aggregate: true }, count: 1, description: "Get and 1 game at least 20,000 kills in Teams mode" }
                ]
            },
            { name: "Single Target - Time Alive", achievements: [
                { rank: 1, criteria: { time_alive: { min: 1800 }, game_mode: 1 }, count: 1, description: "Survive for at least 30 minutes" },
                { rank: 2, criteria: { time_alive: { min: 3600 }, game_mode: 1 }, count: 1, description: "Survive for at least 1 hour" },
                { rank: 3, criteria: { time_alive: { min: 7200 }, game_mode: 1 }, count: 1, description: "Survive for at least 2 hours" },
                { rank: 4, criteria: { time_alive: { min: 10800 }, game_mode: 1 }, count: 1, description: "Survive for at least 3 hours" },
                { rank: 5, criteria: { time_alive: { min: 18000 }, game_mode: 1 }, count: 1, description: "Survive for at least 5 hours" }
            ]},
            { name: "Single Target - Kills", achievements: [
                { rank: 1, criteria: { player_kills: { min: 25 }, game_mode: 1 }, count: 1, description: "Get at least 25 kills" },
                { rank: 2, criteria: { player_kills: { min: 50 }, game_mode: 1 }, count: 1, description: "Get at least 50 kills" },
                { rank: 3, criteria: { player_kills: { min: 75 }, game_mode: 1 }, count: 1, description: "Get at least 75 kills" },
                { rank: 4, criteria: { player_kills: { min: 100 }, game_mode: 1 }, count: 1, description: "Get at least 100 kills" },
                { rank: 5, criteria: { player_kills: { min: 150 }, game_mode: 1 }, count: 1, description: "Get at least 150 kills" }
            ]},
            { name: "Single Target - Towers Destroyed", achievements: [
                { rank: 1, criteria: { dot_kills: { min: 2500 }, game_mode: 1 }, count: 1, description: "Destroy at least 2500 towers" },
                { rank: 2, criteria: { dot_kills: { min: 5000 }, game_mode: 1 }, count: 1, description: "Destroy at least 5000 towers" },
                { rank: 3, criteria: { dot_kills: { min: 7500 }, game_mode: 1 }, count: 1, description: "Destroy at least 7500 towers" },
                { rank: 4, criteria: { dot_kills: { min: 10000 }, game_mode: 1 }, count: 1, description: "Destroy at least 10000 towers" },
                { rank: 5, criteria: { dot_kills: { min: 15000 }, game_mode: 1 }, count: 1, description: "Destroy at least 15000 towers" }
            ]},
            { name: "Single Target - Score", achievements: [
                { rank: 1, criteria: { max_score: { min: 50000 }, game_mode: 1 }, count: 1, description: "Achieve a score of at least 50000" },
                { rank: 2, criteria: { max_score: { min: 75000 }, game_mode: 1 }, count: 1, description: "Achieve a score of at least 75000" },
                { rank: 3, criteria: { max_score: { min: 100000 }, game_mode: 1 }, count: 1, description: "Achieve a score of at least 100000" },
                { rank: 4, criteria: { max_score: { min: 200000 }, game_mode: 1 }, count: 1, description: "Achieve a score of at least 200000" },
                { rank: 5, criteria: { max_score: { min: 250000 }, game_mode: 1 }, count: 1, description: "Achieve a score of at least 250000" }
            ]},
            { name: "Multiple Games - Time Alive", achievements: [
                { rank: 1, criteria: { time_alive: { min: 900 }, game_mode: 1 }, count: 5, description: "Survive for at least 15 minutes x 5 Games" },
                { rank: 2, criteria: { time_alive: { min: 1800 }, game_mode: 1 }, count: 5, description: "Survive for at least 30 minutes x 5 Games" },
                { rank: 3, criteria: { time_alive: { min: 3600 }, game_mode: 1 }, count: 5, description: "Survive for at least 1 hour x 5 Games" },
                { rank: 4, criteria: { time_alive: { min: 7200 }, game_mode: 1 }, count: 5, description: "Survive for at least 2 hours x 5 Games" },
                { rank: 5, criteria: { time_alive: { min: 10800 }, game_mode: 1 }, count: 5, description: "Survive for at least 3 hours x 5 Games" }
            ]},
            { name: "Multiple Games - Kills", achievements: [
                { rank: 1, criteria: { player_kills: { min: 15 }, game_mode: 1 }, count: 5, description: "Get at least 15 kills x 5 Games" },
                { rank: 2, criteria: { player_kills: { min: 25 }, game_mode: 1 }, count: 5, description: "Get at least 25 kills x 5 Games" },
                { rank: 3, criteria: { player_kills: { min: 50 }, game_mode: 1 }, count: 5, description: "Get at least 50 kills x 5 Games" },
                { rank: 4, criteria: { player_kills: { min: 75 }, game_mode: 1 }, count: 5, description: "Get at least 75 kills x 5 Games" },
                { rank: 5, criteria: { player_kills: { min: 100 }, game_mode: 1 }, count: 5, description: "Get at least 100 kills x 5 Games" }
            ]},
            { name: "Multiple Games - Towers Destroyed", achievements: [
                { rank: 1, criteria: { dot_kills: { min: 1000 }, game_mode: 1 }, count: 5, description: "Destroy at least 1000 towers x 5 Games" },
                { rank: 2, criteria: { dot_kills: { min: 2500 }, game_mode: 1 }, count: 5, description: "Destroy at least 2500 towers x 5 Games" },
                { rank: 3, criteria: { dot_kills: { min: 5000 }, game_mode: 1 }, count: 5, description: "Destroy at least 5000 towers x 5 Games" },
                { rank: 4, criteria: { dot_kills: { min: 7500 }, game_mode: 1 }, count: 5, description: "Destroy at least 7500 towers x 5 Games" },
                { rank: 5, criteria: { dot_kills: { min: 10000 }, game_mode: 1 }, count: 5, description: "Destroy at least 10000 towers x 5 Games" }
            ]},
            { name: "Multiple Games - Score", achievements: [
                { rank: 1, criteria: { max_score: { min: 25000 }, game_mode: 1 }, count: 5, description: "Achieve a score of at least 25000 x 5 Games" },
                { rank: 2, criteria: { max_score: { min: 50000 }, game_mode: 1 }, count: 5, description: "Achieve a score of at least 50000 x 5 Games" },
                { rank: 3, criteria: { max_score: { min: 75000 }, game_mode: 1 }, count: 5, description: "Achieve a score of at least 75000 x 5 Games" },
                { rank: 4, criteria: { max_score: { min: 100000 }, game_mode: 1 }, count: 5, description: "Achieve a score of at least 100000 x 5 Games" },
                { rank: 5, criteria: { max_score: { min: 200000 }, game_mode: 1 }, count: 5, description: "Achieve a score of at least 200000 x 5 Games" }
            ]},
            { name: "Multiple Games - Victories", achievements: [
                { rank: 1, criteria: { kill_reason: 4, game_mode: 1 }, count: 10, description: "Achieve at least 10 victories" },
                { rank: 2, criteria: { kill_reason: 4, game_mode: 1 }, count: 25, description: "Achieve at least 25 victories" },
                { rank: 3, criteria: { kill_reason: 4, game_mode: 1 }, count: 50, description: "Achieve at least 50 victories" },
                { rank: 4, criteria: { kill_reason: 4, game_mode: 1 }, count: 75, description: "Achieve at least 75 victories" },
                { rank: 5, criteria: { kill_reason: 4, game_mode: 1 }, count: 100, description: "Achieve at least 100 victories" }
            ]}
        ]
    },
    {
        name: "DEFUSE",
        subCategories: [
            { name: "Survivor", achievements: [
                { rank: 1, criteria: { time_alive: { min: 600 }, game_mode: 2 }, count: 1, description: "Survive for at least 10 minutes" },
                { rank: 2, criteria: { time_alive: { min: 1800 }, game_mode: 2 }, count: 1, description: "Survive for at least 30 minutes" },
                { rank: 3, criteria: { time_alive: { min: 3600 }, game_mode: 2 }, count: 1, description: "Survive for at least 60 minutes" },
                { rank: 4, criteria: { time_alive: { min: 3600 * 3 }, game_mode: 2 }, count: 1, description: "Survive for at least 3 hours" },
                { rank: 5, criteria: { time_alive: { min: 3600 * 5 }, game_mode: 2 }, count: 1, description: "Survive for at least 5 hours" }
            ]},
            { name: "High Scorer", achievements: [
                { rank: 1, criteria: { max_score: { min: 5000 }, game_mode: 2 }, count: 1, description: "Achieve a score of at least 5000" },
                { rank: 2, criteria: { max_score: { min: 10000 }, game_mode: 2 }, count: 1, description: "Achieve a score of at least 10000" },
                { rank: 3, criteria: { max_score: { min: 50000 }, game_mode: 2 }, count: 1, description: "Achieve a score of at least 50000" },
                { rank: 4, criteria: { max_score: { min: 100000 }, game_mode: 2 }, count: 1, description: "Achieve a score of at least 100000" },
                { rank: 5, criteria: { max_score: { min: 200000 }, game_mode: 2 }, count: 1, description: "Achieve a score of at least 200000" }
            ]}
        ]
    }
];

function checkCriteria(event, criteria) {
    for (let key in criteria) {
        let actualKey = key;
        if (key === 'win_rate') {
            actualKey = 'max_area';
        }

        if (!event.hasOwnProperty(actualKey)) {
            console.error(`Error: Criteria key "${actualKey}" does not exist in event data.`);
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
                let count = 0;
                let achieved = false;

                if (achievement.criteria.aggregate) {
                    // Sum the values across all games for specified criteria
                    for (let key in achievement.criteria) {
                        if (typeof achievement.criteria[key] === 'object' && achievement.criteria[key].min !== undefined) {
                            count = data.reduce((acc, event) => {
                                if (checkCriteria(event, achievement.criteria)) {
                                    return acc + event[key];
                                }
                                return acc;
                            }, 0);
                        }
                    }
                    // Check if the aggregated value meets the minimum requirement
                    for (let key in achievement.criteria) {
                        if (typeof achievement.criteria[key] === 'object' && achievement.criteria[key].min !== undefined) {
                            achieved = count >= achievement.criteria[key].min;
                        }
                    }
                } else {
                    // Default behavior for achievements without aggregate flag
                    count = data.reduce((acc, event) => acc + (checkCriteria(event, achievement.criteria) ? 1 : 0), 0);
                    achieved = count >= achievement.count;

                    if (achievement.criteria.consecutive_days) {
                        if (consecutiveDays >= achievement.criteria.consecutive_days.min) {
                            achieved = true;
                        }
                    }
                }

                return {
                    rank: achievement.rank,
                    achieved: achieved,
                    criteria: achievement.criteria || {},
                    description: achievement.description,
                    value: rankDetails[achievement.rank].value
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




async function displayAchievementsPage() {
    const user_data = await fetchAllStats();
    const processedData = processData(user_data);
    const consecutiveDays = calculateConsecutiveDays(processedData);
    const results = checkAchievements(processedData, categories, consecutiveDays);

    const mappedResults = results.map(category => {
        return {
            category: category.category,
            subCategories: category.subCategories.map(subCategory => ({
                subCategory: subCategory.subCategory,
                achievements: subCategory.achievements.map(achievement => {
                    const rankDetail = rankDetails[achievement.rank];
                    if (!rankDetail) {
                        return null;
                    }
                    return {
                        rank: rankDetail.name,
                        achieved: achievement.achieved,
                        criteria: achievement.criteria,
                        description: achievement.description,
                        value: achievement.value,
                        image: rankDetail.image
                    };
                }).filter(Boolean)
            }))
        };
    });

    let totalValue = 0;
    mappedResults.forEach(category => {
        category.subCategories.forEach(subCategory => {
            subCategory.achievements.forEach(achievement => {
                if (achievement.achieved) {
                    totalValue += achievement.value;
                }
            });
        });
    });

    createAchievementsPopup(mappedResults, totalValue);
}

createAchievementButton();
