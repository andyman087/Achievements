console.log(
    `%c Defly Achievements Plugin Loaded | Version: ${EXTENSION_VERSION} `, 
    'background: #3d5dff; color: white; font-size: 12px; font-weight: bold; padding: 4px; border-radius: 4px;'
);

async function displayAchievementsPage() {
    // 1. Fetch
    const user_data = await fetchAllStats();
    if (!user_data || user_data.length === 0) return;

    // 2. Process
    const processedData = processData(user_data);
    const consecutiveDays = calculateConsecutiveDays(processedData);

    // 3. Logic
    const results = checkAchievements(processedData, categories, consecutiveDays);

    const mappedResults = results.map(category => {
        return {
            category: category.category,
            subCategories: category.subCategories.map(subCategory => ({
                subCategory: subCategory.subCategory,
                achievements: subCategory.achievements.map(achievement => {
                    const rankDetail = rankDetails[achievement.rank];
                    if (!rankDetail) return null;
                    return {
                        rank: rankDetail.name,
                        achieved: achievement.achieved,
                        criteria: achievement.criteria,
                        description: achievement.description,
                        value: achievement.value,
                        image: rankDetail.image,
                        progress: achievement.progress,
                        criteriaMin: achievement.criteriaMin
                    };
                }).filter(Boolean)
            }))
        };
    });

    const totalPointsObj = calculateCategoryTotals(mappedResults);

    // 4. Visuals
    createAchievementsPopup(mappedResults, totalPointsObj);
}

// Initialize
createAchievementButton();