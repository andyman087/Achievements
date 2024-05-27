const rankDetails = {
    1: { name: "Bronze", value: 10, image: "https://raw.githubusercontent.com/andyman087/Achievements/main/Images/Bronze%20Badge.png" },
    2: { name: "Silver", value: 50, image: "https://raw.githubusercontent.com/andyman087/Achievements/main/Images/Silver%20Badge.png" },
    3: { name: "Gold", value: 100, image: "https://raw.githubusercontent.com/andyman087/Achievements/main/Images/Gold%20Badge.png" },
    4: { name: "Master", value: 250, image: "https://raw.githubusercontent.com/andyman087/Achievements/main/Images/Master%20Badge.png" },
    5: { name: "Grand Master", value: 500, image: "https://raw.githubusercontent.com/andyman087/Achievements/main/Images/Grand%20Master%20Badge.png" }
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
max_score
player_kills
time_alive
rounds_won
map_percentage
consecutive_days
*/

const categories = [
    {
        name: "TEAMS",
        subCategories: [
            { name: "First Blood", achievements: [
                { rank: 1, criteria: { player_kills: { min: 10 }, game_mode: 1 }, count: 1, description: "Get at least 10 kills" },
                { rank: 2, criteria: { player_kills: { min: 25 }, game_mode: 1 }, count: 1, description: "Get at least 25 kills" },
                { rank: 3, criteria: { player_kills: { min: 50 }, game_mode: 1 }, count: 1, description: "Get at least 50 kills" },
                { rank: 4, criteria: { player_kills: { min: 100 }, game_mode: 1 }, count: 1, description: "Get at least 100 kills" },
                { rank: 5, criteria: { player_kills: { min: 200 }, game_mode: 1 }, count: 1, description: "Get at least 200 kills" }
            ]},
            { name: "Demolisher", achievements: [
                { rank: 1, criteria: { dot_kills: { min: 250 }, game_mode: 1 }, count: 1, description: "Destroy at least 250 dots" },
                { rank: 2, criteria: { dot_kills: { min: 500 }, game_mode: 1 }, count: 1, description: "Destroy at least 500 dots" },
                { rank: 3, criteria: { dot_kills: { min: 1000 }, game_mode: 1 }, count: 1, description: "Destroy at least 1000 dots" },
                { rank: 4, criteria: { dot_kills: { min: 5000 }, game_mode: 1 }, count: 1, description: "Destroy at least 5000 dots" },
                { rank: 5, criteria: { dot_kills: { min: 10000 }, game_mode: 1 }, count: 1, description: "Destroy at least 10000 dots" }
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
        if (!event.hasOwnProperty(key)) {
            console.error(`Error: Criteria key "${key}" does not exist in event data.`);
            return false;
        }
        if (criteria[key] !== undefined) {
            const value = event[key];
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
                let count = data.reduce((acc, event) => acc + (checkCriteria(event, achievement.criteria) ? 1 : 0), 0);
                if (achievement.criteria.consecutive_days) {
                    if (consecutiveDays >= achievement.criteria.consecutive_days.min) {
                        count++;
                    }
                }
                return {
                    rank: achievement.rank,
                    achieved: count >= achievement.count,
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
