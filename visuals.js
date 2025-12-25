let globalMappedResults;
let globalTotalPointsObj = {}; 

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
        callback(null);
    };
    img.src = imageUrl;
}

function createAchievementsPopup(mappedResults, totalPointsObj) {
    globalMappedResults = mappedResults;
    globalTotalPointsObj = totalPointsObj;

    const achievementsHtml = mappedResults.map(category => {
        const safeCategory = sanitizeId(category.category);

        const subCategoriesHtml = category.subCategories.map(subCategory => {
            
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

                let progressHtml = '<div style="height: 14px; margin-top: 5px;"></div>'; 
                
                if (!achievement.achieved && index === firstUnachievedIndex) {
                    const current = achievement.progress || 0;
                    const target = achievement.criteriaMin;
                    
                    let percent = 0;
                    if(target > 0) percent = Math.min(100, (current / target) * 100);

                    progressHtml = `
                        <div class="progress-container">
                            <div class="progress-bar" style="width: ${percent}%;"></div>
                            // CHANGE 3 (HTML structure remains, CSS updated below)
                            <div class="progress-text">${current} / ${target}</div>
                        </div>
                    `;
                }

                const criteriaList = Object.entries(achievement.criteria)
                    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
                    .join('<br>');

                return `<div class="achievement">
                            <div class="achievement-rank">${achievement.rank}</div>
                            <img src="${imageUrl}" id="${imgId}" alt="${achievement.rank}" class="achievement-image">
                            <div class="achievement-description">${achievement.description}</div>
                            ${progressHtml}
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

        // Use sanitized ID for the tab content div
        return `<div id="${sanitizeId(category.category)}" class="tabcontent">
                    ${subCategoriesHtml}
                </div>`;
    }).join('');

    const firstCategoryName = mappedResults[0].category;
    const initialPoints = totalPointsObj[firstCategoryName] || 0;

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
                overflow: hidden; 
            }

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
                position: absolute; top: 10px; right: 10px; background: white; color: black; border: none; padding: 5px 10px; cursor: pointer; font-size: 24px;
            }
            .close-btn:hover { color: lightgrey; }

            .header-controls { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 0; }
            .header-stats { display: flex; align-items: center; margin-bottom: 10px; }

            .tab { overflow: hidden; }
            .tab button { 
                background-color: inherit; float: left; border: none; outline: none; cursor: pointer; padding: 14px 16px; transition: 0.3s; 
                background: #3d5dff; color: white; box-shadow: 0 0 5px #374ebf; border-radius: 8px 8px 0 0; margin-right: 2px; font-weight: bold;
            }
            .tab button:hover { background-color: #ddd; color: black; }
            .tab button.active { background-color: #FFAC1C; color: white; }
            
            .tabcontent { display: none; padding: 15px 0; border-top: none; }

            .subCategory { 
                background: #e0e0e0; border-radius: 15px; padding: 15px; margin-bottom: 20px; 
                box-shadow: inset 0 2px 5px rgba(0,0,0,0.05); white-space: nowrap; overflow-x: auto; 
            }
            .subCategory-title { margin-bottom: 10px; text-align: left; padding-left: 10px; font-size: 1.2em; color: #333; }

            /* CHANGE 4: Reduced height and padding */
            .achievement { 
                display: inline-block; margin: 10px; width: 160px; height: 230px; text-align: center; position: relative; 
                background: #ffffff; border-radius: 15px; padding: 10px 10px; vertical-align: top; 
                box-shadow: 0 4px 8px rgba(0,0,0,0.05); transition: transform 0.2s;
            }
            .achievement:hover { transform: translateY(-3px); box-shadow: 0 6px 12px rgba(0,0,0,0.1); }

            /* CHANGE 4: Reduced margin */
            .achievement-image { width: 110px; height: 110px; margin: 5px 0; }
            .achievement-rank { font-weight: 800; font-size: 1.1em; margin-top: 5px; color: #222; }

            .progress-container {
                width: 100%;
                background-color: #f0f0f0;
                border-radius: 10px;
                height: 16px;
                position: relative;
                margin-top: 8px;
                overflow: hidden;
                border: 1px solid #ddd;
            }
            .progress-bar {
                background-color: #FFAC1C; 
                height: 100%;
                border-radius: 10px 0 0 10px;
                transition: width 0.3s ease;
            }
            
            /* CHANGE 3: Made text bigger and bolder */
            .progress-text {
                position: absolute;
                width: 100%;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 11px; /* Increased size */
                font-weight: 900; /* Extra bold */
                color: #333;
                text-shadow: 0 0 2px white; 
            }

            .achievement-description { font-size: 11px; color: #666; line-height: 1.3; white-space: normal; margin-bottom: 5px; min-height: 30px;}

            .achievement-tooltip { 
                display: none; 
                position: absolute; 
                top: 50%; 
                left: 50%; 
                transform: translate(-50%, -50%); 
                background: rgba(0, 0, 0, 0.9); 
                color: #fff; 
                padding: 12px; 
                border-radius: 8px; 
                box-shadow: 0 5px 15px rgba(0,0,0,0.3); 
                z-index: 1000; 
                text-align: center; 
                white-space: pre-wrap; 
                width: 140px;
                font-size: 12px; 
                pointer-events: none; 
            }
            .achievement:hover .achievement-tooltip { display: block; }

            .total-value { 
                background: #fff; border: 2px solid #FFAC1C; border-radius: 8px; padding: 8px 15px; 
                display: inline-block; font-weight: bold; font-size: 1.1em; margin-left: 20px;
            }
            .popup-title { text-align: center; font-size: 32px; margin-bottom: 10px; color: #333; margin-top: 0;}
            .rank-summary { display: flex; align-items: center; margin-right: 15px; font-weight: 600; color: #555; }
            .rank-image { width: 24px; height: 24px; margin-right: 8px; }
        </style>`;

    const popupDiv = document.createElement('div');
    popupDiv.innerHTML = popupHtml;
    document.body.appendChild(popupDiv);
    document.getElementById("achievementsPopup").style.display = 'flex'; 
    document.getElementById("achievementButton").style.display = 'none';

    // CHANGE 2: Explicitly activate the first tab and show its content on load
    const firstTabContent = document.getElementById(sanitizeId(firstCategoryName));
    if(firstTabContent) {
        firstTabContent.style.display = 'block';
    }
    const tablinks = document.getElementsByClassName('tablinks');
    if (tablinks.length > 0) {
        tablinks[0].classList.add('active');
    }

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
    // Use sanitized ID to find the tab content
    document.getElementById(sanitizeId(categoryName)).style.display = 'block';
    evt.currentTarget.className += ' active';

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