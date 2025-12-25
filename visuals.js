let globalMappedResults;
let globalTotalPointsObj = {}; // Store points per category

function sanitizeId(str) {
    return str.replace(/\s+/g, '-').toLowerCase();
}

function createGreyedOutImage(imageUrl, callback) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const img = new Image();

    img.crossOrigin = "Anonymous";

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);

        context.globalCompositeOperation = 'source-atop';
        context.fillStyle = 'darkgrey';
        context.fillRect(0, 0, canvas.width, canvas.height);

        callback(canvas.toDataURL());
    };
    img.onerror = (error) => {
        console.error('Failed to load image:', error);
        callback(null);
    };
    img.src = imageUrl;
}

// REQUEST 6: Accept totalPointsObj instead of single value
function createAchievementsPopup(mappedResults, totalPointsObj) {
    globalMappedResults = mappedResults;
    globalTotalPointsObj = totalPointsObj;

    const achievementsHtml = mappedResults.map(category => {
        const safeCategory = sanitizeId(category.category);

        const subCategoriesHtml = category.subCategories.map(subCategory => {
            
            // REQUEST 3: Find the index of the first unachieved badge in this row
            const firstUnachievedIndex = subCategory.achievements.findIndex(a => !a.achieved);

            const achievementsHtml = subCategory.achievements.map((achievement, index) => {
                let imageUrl = achievement.image;
                const safeSubCategory = sanitizeId(subCategory.subCategory);
                const imgId = `achievement-img-${safeCategory}-${achievement.rank}-${safeSubCategory}`;

                if (!achievement.achieved) {
                    createGreyedOutImage(achievement.image, (greyedOutImageUrl) => {
                        const imgElement = document.getElementById(imgId);
                        if (imgElement && greyedOutImageUrl) {
                            imgElement.src = greyedOutImageUrl;
                        } else {
                            if(imgElement) imgElement.src = 'https://via.placeholder.com/125?text=Error';
                        }
                    });
                    imageUrl = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='; 
                }

                // REQUEST 3: Logic to show progress only on the lowest unachieved badge
                let progressDisplay = '';
                if (!achievement.achieved && index === firstUnachievedIndex) {
                    // Formatting numbers to look nice (e.g. 10000 -> 10k could be done here, but keeping raw for now)
                    const current = Math.floor(achievement.progress || 0);
                    const target = achievement.criteriaMin;
                    progressDisplay = `<div class="achievement-progress">${current} / ${target}</div>`;
                }

                const criteriaList = Object.entries(achievement.criteria)
                    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
                    .join('<br>');

                // REQUEST 2: Removed "Value" div
                return `<div class="achievement">
                            <div class="achievement-rank">${achievement.rank}</div>
                            ${progressDisplay}
                            <img src="${imageUrl}" id="${imgId}" alt="${achievement.rank}" class="achievement-image">
                            <div class="achievement-description">${achievement.description}</div>
                            <div class="achievement-tooltip">${criteriaList}</div>
                        </div>`;
            }).join('');
            return `<div>
                        <h3 class="subCategory-title">${subCategory.subCategory}</h3>
                        <div class="subCategory">
                            ${achievementsHtml}
                        </div>
                    </div>`;
        }).join('');

        return `<div id="${category.category}" class="tabcontent">
                    ${subCategoriesHtml}
                </div>`;
    }).join('');

    // REQUEST 7 & 6: Get points for the first category to show by default
    const firstCategoryName = mappedResults[0].category;
    const initialPoints = totalPointsObj[firstCategoryName] || 0;

    // REQUEST 1: Sticky Header Structure
    // We move the close button, title, and tabs into a "popup-header" div
    const popupHtml = `
        <div id="achievementsPopup">
            <div class="popup-header">
                <button onclick="closeAchievementsPopup()" class="close-btn">&#10005;</button>
                <h1 class="popup-title">Achievements</h1>
                <div class="header-controls">
                    <div class="tab">
                        ${categories.map(category => `<button class="tablinks" onclick="openCategory(event, '${category.name}')">${category.name}</button>`).join('')}
                    </div>
                    <div class="header-stats">
                        <div id="rankSummaries" style="display: flex; align-items: center;"></div>
                        <span id="totalPointsDisplay" class="total-value">Total Achievement Points: ${initialPoints}</span>
                    </div>
                </div>
            </div>
            <div class="popup-scroll-content">
                ${achievementsHtml}
            </div>
        </div>
        <style>
            /* REQUEST 4: Fit content width */
            #achievementsPopup {
                position: fixed;
                top: 10%;
                left: 50%;
                transform: translateX(-50%);
                width: auto;
                min-width: 600px;
                max-width: 95%;
                height: 80%;
                background: white;
                border: 1px solid #ccc;
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                overflow: hidden; /* Hide overflow on parent, scroll child */
            }

            /* REQUEST 1: Sticky Header Styling */
            .popup-header {
                background: white;
                padding: 20px 20px 0 20px;
                flex-shrink: 0;
                border-bottom: 1px solid #eee;
                z-index: 10;
            }

            .popup-scroll-content {
                padding: 20px;
                overflow-y: auto;
                flex-grow: 1;
            }

            .close-btn {
                position: absolute; 
                top: 10px; 
                right: 10px; 
                background: white; 
                color: black; 
                border: none; 
                padding: 5px 10px; 
                cursor: pointer; 
                font-size: 24px;
            }
            .close-btn:hover { color: lightgrey; }

            .header-controls {
                display: flex;
                justify-content: space-between;
                align-items: flex-end; /* Align tabs to bottom */
                margin-bottom: 0;
            }

            .header-stats {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
            }

            /* TABS */
            .tab { overflow: hidden; }
            .tab button { 
                background-color: inherit; 
                float: left; 
                border: none; 
                outline: none; 
                cursor: pointer; 
                padding: 14px 16px; 
                transition: 0.3s; 
                background: #3d5dff; 
                color: white; 
                box-shadow: 0 0 5px #374ebf;
                border-radius: 8px 8px 0 0;
                margin-right: 2px;
                font-weight: bold;
            }
            .tab button:hover { background-color: #ddd; color: black; }
            .tab button.active { background-color: #FFAC1C; color: white; }
            
            .tabcontent { display: none; padding: 15px 0; border-top: none; }

            /* SUBCATEGORY */
            .subCategory { 
                background: #e0e0e0; 
                border-radius: 15px; 
                padding: 15px; 
                margin-bottom: 20px; 
                box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);
                white-space: nowrap; /* Keep badges in a line */
                overflow-x: auto; /* Scroll horizontal if screen too small */
            }
            .subCategory-title { 
                margin-bottom: 10px; 
                text-align: left; 
                padding-left: 10px;
                font-size: 1.2em;
                color: #333;
            }

            /* CARDS */
            .achievement { 
                display: inline-block; 
                margin: 10px; 
                width: 160px; 
                height: 240px; 
                text-align: center; 
                position: relative; 
                background: #ffffff; 
                border-radius: 15px; 
                padding: 15px 10px; 
                vertical-align: top;
                box-shadow: 0 4px 8px rgba(0,0,0,0.05);
                transition: transform 0.2s;
            }
            .achievement:hover {
                transform: translateY(-3px);
                box-shadow: 0 6px 12px rgba(0,0,0,0.1);
            }

            .achievement-image { width: 120px; height: 120px; margin: 10px 0; }
            
            .achievement-rank { 
                font-weight: 800; 
                font-size: 1.1em; 
                margin-top: 5px; 
                color: #222;
            }

            /* NEW PROGRESS STYLE */
            .achievement-progress {
                font-size: 12px;
                color: #FFAC1C; /* Gold/Orange color */
                font-weight: bold;
                margin-top: 2px;
            }

            .achievement-description { 
                font-size: 12px; 
                color: #666;
                line-height: 1.3;
                white-space: normal; /* Allow text wrap */
            }

            /* TOOLTIP */
            .achievement-tooltip { 
                display: none; 
                position: absolute; 
                top: 100%; 
                left: 50%; 
                transform: translateX(-50%); 
                background: #2a2a2a; 
                color: #fff; 
                padding: 12px; 
                border-radius: 8px; 
                box-shadow: 0 5px 15px rgba(0,0,0,0.3); 
                z-index: 100; 
                text-align: left; 
                white-space: pre-wrap; 
                width: 220px;
                font-size: 13px; 
            }
            .achievement:hover .achievement-tooltip { display: block; }

            .total-value { 
                background: #fff;
                border: 2px solid #FFAC1C; 
                border-radius: 8px; 
                padding: 8px 15px; 
                display: inline-block;
                font-weight: bold;
                font-size: 1.1em;
                margin-left: 20px;
            }
            .popup-title { text-align: center; font-size: 32px; margin-bottom: 10px; color: #333; margin-top: 0;}
            .rank-summary { display: flex; align-items: center; margin-right: 15px; font-weight: 600; color: #555; }
            .rank-image { width: 24px; height: 24px; margin-right: 8px; }
        </style>`;

    const popupDiv = document.createElement('div');
    popupDiv.innerHTML = popupHtml;
    document.body.appendChild(popupDiv);
    document.getElementById("achievementsPopup").style.display = 'flex'; // Changed to flex for sticky layout
    document.getElementById("achievementButton").style.display = 'none';

    updateRankSummaries(firstCategoryName);
}

function closeAchievementsPopup() {
    document.getElementById('achievementsPopup').remove();
    document.getElementById("achievementButton").style.display = 'block';
}

function openCategory(evt, categoryName) {
    const tabcontent = document.getElementsByClassName('tabcontent');
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }
    const tablinks = document.getElementsByClassName('tablinks');
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }
    document.getElementById(categoryName).style.display = 'block';
    evt.currentTarget.className += ' active';

    // REQUEST 6: Update the Total Points display for this category
    const points = globalTotalPointsObj[categoryName] || 0;
    document.getElementById('totalPointsDisplay').innerText = `Total Achievement Points: ${points}`;

    updateRankSummaries(categoryName);
}

function updateRankSummaries(categoryName) {
    const category = globalMappedResults.find(cat => cat.category === categoryName);
    const rankSummaries = {};
    const categoryAchievementsSummary = category.subCategories.flatMap(subCategory => subCategory.achievements);
    const ranks = ["Bronze", "Silver", "Gold", "Master", "Grand Master"];

    ranks.forEach(rankName => {
        const achievements = categoryAchievementsSummary.filter(achievement => {
             return achievement.rank === rankName;
        });

        const achievedCount = achievements.filter(achievement => achievement.achieved).length;
        const totalCount = achievements.length;
        const rankIndex = ranks.indexOf(rankName) + 1;
        const rankDetail = rankDetails[rankIndex];
        
        rankSummaries[rankIndex] = {
            rank: rankName,
            achievedCount: achievedCount,
            totalCount: totalCount,
            image: rankDetail.image,
        };
    });

    const summaryHtml = Object.values(rankSummaries).map(summary => {
        let imageUrl = summary.image;
        
        const safeRank = sanitizeId(summary.rank);
        const safeCategory = sanitizeId(categoryName);
        const imgId = `summary-img-${safeCategory}-${safeRank}`;

        if (summary.achievedCount < summary.totalCount) {
            createGreyedOutImage(summary.image, (greyedOutImageUrl) => {
                const imgElement = document.getElementById(imgId);
                if (imgElement && greyedOutImageUrl) {
                    imgElement.src = greyedOutImageUrl;
                }
            });
            imageUrl = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
        }
        return `<div class="rank-summary">
                    <img src="${imageUrl}" id="${imgId}" class="rank-image" alt="${summary.rank}">
                    <span>${summary.achievedCount}/${summary.totalCount}</span>
                </div>`;
    }).join('');

    document.getElementById('rankSummaries').innerHTML = summaryHtml;
}

function createAchievementButton() {
    const existingBtn = document.getElementById('achievementButton');
    if (existingBtn) {
        existingBtn.remove();
    }

    const achievementButton = document.createElement('button');
    achievementButton.id = 'achievementButton';
    achievementButton.innerText = 'Show Achievements';
    achievementButton.style.background = '#3d5dff';
    achievementButton.style.color = 'white';
    achievementButton.style.border = 'none';
    achievementButton.style.padding = '10px 20px';
    achievementButton.style.position = 'fixed';
    achievementButton.style.top = '10px';
    achievementButton.style.left = '10px';
    achievementButton.style.cursor = 'pointer';
    achievementButton.style.boxShadow = '0 0 5px #374ebf';
    achievementButton.onmouseover = function() { achievementButton.style.backgroundColor = '#374ebf'; };
    achievementButton.onmouseout = function() { achievementButton.style.backgroundColor = '#3d5dff'; };
    achievementButton.onclick = displayAchievementsPage;
    document.body.appendChild(achievementButton);
}