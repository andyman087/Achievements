console.log(
    `%c Defly Achievements Plugin Loaded | Version: ${EXTENSION_VERSION} `, 
    'background: #3d5dff; color: white; font-size: 12px; font-weight: bold; padding: 4px; border-radius: 4px;'
);

async function displayAchievementsPage() {
    console.log("Step 1: Starting displayAchievementsPage...");

    const user_data = await fetchAllStats();
    
    // Check for null (Session ID missing)
    if (user_data === null) {
        alert("Please log in to Defly first to view your achievements!");
        return;
    }

    // Check for empty array (Fetch worked but no data or API error)
    if (!user_data || user_data.length === 0) {
        console.error("Step 1 Failed: No statistics returned from API.");
        alert("No game statistics found. Play a game first?");
        return;
    }

    console.log("Step 2: Stats received (" + user_data.length + " games). Processing...");
    const processedData = processData(user_data);
    const consecutiveDays = calculateConsecutiveDays(processedData);

    console.log("Step 3: Checking achievements against config...");
    if (typeof categories === 'undefined') {
        console.error("Critical Error: 'categories' is missing. Check config.js");
        return;
    }
    const results = checkAchievements(processedData, categories, consecutiveDays);

    console.log("Step 4: Mapping results...");
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

    console.log("Step 5: Calculating totals...");
    const totalPointsObj = calculateCategoryTotals(mappedResults);

    console.log("Step 6: Creating Popup UI...");
    try {
        createAchievementsPopup(mappedResults, totalPointsObj);
        console.log("Step 7: Success! Popup should be visible.");
    } catch (err) {
        console.error("Step 6 Failed: Error inside visuals.js", err);
    }
}

createAchievementButton();