console.log(
    `%c Defly Achievements Plugin Loaded | Version: ${EXTENSION_VERSION} `,
    'background: #3d5dff; color: white; font-size: 12px; font-weight: bold; padding: 4px; border-radius: 4px;'
);

// === SHARED: Fetch and Calculate Data ===
async function getAchievementData() {
    const user_data = await fetchAllStats();

    if (!user_data || user_data.length === 0) {
        return null;
    }

    const processedData = processData(user_data);
    const consecutiveDays = calculateConsecutiveDays(processedData);

    if (typeof categories === 'undefined') {
        console.error("Critical Error: 'categories' is missing. Check config.js");
        return null;
    }

    const results = checkAchievements(processedData, categories, consecutiveDays);

    // Map results to include visual details
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
                        unlockedTimestamp: achievement.unlockedTimestamp,
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

    return { mappedResults, processedData };
}

// === ACTION: Open Popup ===
async function displayAchievementsPage() {
    // 1. Fetch Data
    const data = await getAchievementData();

    if (!data) {
        alert("Please log in to Defly first or play a game to view achievements!");
        return;
    }

    // 2. Calculate Totals
    const totalPointsObj = calculateCategoryTotals(data.mappedResults);

    // 3. Create Popup
    try {
        createAchievementsPopup(data.mappedResults, totalPointsObj);
    } catch (err) {
        console.error("Error creating popup:", err);
    }
}

// === ACTION: Update Home Screen Notification (Silent) ===
async function refreshHomeNotification() {
    try {
        const data = await getAchievementData();
        if (data && window.updateAchievementNotification) {
            window.updateAchievementNotification(data.mappedResults);
        }
    } catch (err) {
        console.warn("🏆 Notification: Failed to update (user might not be logged in).", err);
    }
}

// === INITIALIZATION ===
// 1. Create the button and trophy HTML
createAchievementButton();

// 2. Run a silent check immediately to populate the trophy
// We wrap it in a slight timeout to ensure other scripts (like Defly's login) have initialized
setTimeout(() => {
    refreshHomeNotification();
}, 2000);
