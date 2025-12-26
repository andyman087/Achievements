let globalMappedResults;
let globalTotalPointsObj = {}; 
let currentTypeFilter = 'All'; 
let currentCategoryName = ''; 

function sanitizeId(str) {
    return str.replace(/\s+/g, '-').toLowerCase();
}

function getAchievementType(subCategoryName) {
    if (subCategoryName.startsWith("Single")) return "Single";
    if (subCategoryName.startsWith("Multiple")) return "Multiple";
    if (subCategoryName.startsWith("Lifetime")) return "Lifetime";
    return "Other";
}

// Helper: Format Timestamp to Readable Date
function formatUnlockDate(timestamp) {
    if (!timestamp) return "Date Unknown";
    const d = new Date(timestamp);
    const dateStr = d.toLocaleDateString();
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} at ${timeStr}`;
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
    img.onerror = () => callback(null);
    img.src = imageUrl;
}

function createAchievementsPopup(mappedResults, totalPointsObj) {
    globalMappedResults = mappedResults;
    globalTotalPointsObj = totalPointsObj;

    const existingWrapper = document.getElementById('achievements-wrapper');
    if (existingWrapper) existingWrapper.remove();

    if (mappedResults.length > 0) {
        currentCategoryName = mappedResults[0].category;
    }

    const achievementsHtml = mappedResults.map(category => {
        const safeCategory = sanitizeId(category.category);

        const subCategoriesHtml = category.subCategories.map(subCategory => {
            const achievementType = getAchievementType(subCategory.subCategory);
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
                        }
                    });
                    imageUrl = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='; 
                }

                // Progress Bar (Only for first unachieved)
                let progressHtml = '<div style="height: 14px; margin-top: 5px;"></div>'; 
                if (!achievement.achieved && index === firstUnachievedIndex) {
                    const current = achievement.progress || 0;
                    const target = achievement.criteriaMin;
                    let percent = 0;
                    if(target > 0) percent = Math.min(100, (current / target) * 100);

                    progressHtml = `
                        <div class="progress-container">
                            <div class="progress-bar" style="width: ${percent}%;"></div>
                            <div class="progress-text">${current} / ${target}</div>
                        </div>
                    `;
                }

                // TOOLTIP CONTENT (New Format)
                let tooltipContent = "";
                if (achievement.achieved) {
                    tooltipContent = `
                        <div style="color:#FFAC1C; font-weight:bold; margin-bottom:4px;">UNLOCKED</div>
                        <div style="font-size:11px; margin-bottom:4px; color: #ddd;">Unlocked on ${formatUnlockDate(achievement.unlockedTimestamp)}</div>
                        <div style="border-top:1px solid #555; margin:4px 0;"></div>
                    `;
                } else {
                    tooltipContent = `<div style="color:#aaa; font-weight:bold; margin-bottom:4px;">LOCKED</div>`;
                }
                tooltipContent += `<div>Current: ${achievement.progress} / ${achievement.criteriaMin}</div>`;


                return `<div class="achievement">
                            <div class="achievement-rank">${achievement.rank}</div>
                            <img src="${imageUrl}" id="${imgId}" alt="${achievement.rank}" class="achievement-image">
                            <div class="achievement-description">${achievement.description}</div>
                            ${progressHtml}
                            <div class="achievement-tooltip">${tooltipContent}</div>
                        </div>`;
            }).join('');

            return `<div class="subcategory-wrapper" data-type="${achievementType}">
                        <h3 class="subCategory-title">${subCategory.subCategory}</h3>
                        <div class="subCategory">
                            ${achievementsHtml}
                        </div>
                    </div>`;
        }).join('');

        return `<div id="${sanitizeId(category.category)}" class="tabcontent">
                    ${subCategoriesHtml}
                </div>`;
    }).join('');

    const initialPoints = totalPointsObj[currentCategoryName] || 0;

    const popupHtml = `
        <div id="achievementsPopup">
            <div class="popup-header">
                <button onclick="closeAchievementsPopup()" class="close-btn">&#10005;</button>
                <h1 class="popup-title">Achievements</h1>
                <div class="stats-row">
                    <div id="rankSummaries" style="display: flex; align-items: center;"></div>
                    <div id="totalPointsContainer" class="total-points-wrapper"></div>
                </div>
                <div class="controls-row">
                    <div class="tab">
                        ${categories.map(category => `<button class="tablinks" onclick="openCategory(event, '${category.name}')">${category.name}</button>`).join('')}
                    </div>
                    <div class="filter-tabs">
                        <button class="filter-btn active" onclick="filterAchievements('All', this)">All</button>
                        <button class="filter-btn" onclick="filterAchievements('Single', this)">Single Game</button>
                        <button class="filter-btn" onclick="filterAchievements('Multiple', this)">Multiple Games</button>
                        <button class="filter-btn" onclick="filterAchievements('Lifetime', this)">Lifetime</button>
                    </div>
                </div>
            </div>
            <div class="popup-scroll-content">
                ${achievementsHtml}
            </div>
        </div>
        <style>
            #achievementsPopup {
                position: fixed; top: 10%; left: 50%; transform: translateX(-50%); width: auto; min-width: 750px; max-width: 95%; height: 85%;
                background: white; border: 1px solid #ccc; box-shadow: 0 0 100px rgba(0,0,0,0.8); border-radius: 12px; 
                display: flex; flex-direction: column; overflow: hidden; z-index: 2147483647 !important; 
            }
            .popup-header { background: white; padding: 15px 20px 0 20px; flex-shrink: 0; border-bottom: 1px solid #eee; z-index: 10; }
            .popup-scroll-content { padding: 20px; overflow-y: auto; flex-grow: 1; }
            .popup-title { text-align: center; font-size: 28px; margin: 0 0 10px 0; color: #333; }
            .close-btn { position: absolute; top: 10px; right: 10px; background: white; color: black; border: none; padding: 5px; cursor: pointer; font-size: 24px; line-height: 1; }
            .close-btn:hover { color: lightgrey; }
            .stats-row { position: relative; display: flex; justify-content: center; align-items: center; margin-bottom: 15px; width: 100%; }
            .rank-summary { display: flex; align-items: center; margin: 0 10px; font-weight: 600; color: #555; font-size: 13px; }
            .rank-image { width: 20px; height: 20px; margin-right: 5px; }
            .total-points-wrapper { position: absolute; right: 0; display: inline-block; cursor: help; }
            .total-value { background: #fff; border: 2px solid #FFAC1C; border-radius: 8px; padding: 5px 12px; display: inline-block; font-weight: bold; font-size: 14px; }
            .points-tooltip { display: none; position: absolute; top: 110%; right: 0; background: rgba(0, 0, 0, 0.9); color: #fff; padding: 10px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); z-index: 1000; text-align: left; min-width: 120px; font-size: 12px; }
            .total-points-wrapper:hover .points-tooltip { display: block; }
            .controls-row { display: flex; justify-content: space-between; align-items: flex-end; width: 100%; }
            .tab { display: flex; }
            .tab button { background-color: inherit; border: none; outline: none; cursor: pointer; padding: 10px 20px; transition: 0.3s; background: #3d5dff; color: white; box-shadow: 0 0 5px #374ebf; border-radius: 8px 8px 0 0; margin-right: 4px; font-weight: bold; font-size: 13px; }
            .tab button:hover { background-color: #ddd; color: black; }
            .tab button.active { background-color: #FFAC1C; color: white; }
            .filter-tabs { display: flex; gap: 5px; padding-bottom: 8px; }
            .filter-btn { background: #f0f0f0; border: none; padding: 6px 12px; border-radius: 20px; cursor: pointer; font-size: 11px; font-weight: bold; color: #555; transition: 0.2s; }
            .filter-btn:hover { background: #e0e0e0; }
            .filter-btn.active { background: #3d5dff; color: white; }
            .tabcontent { display: none; padding: 10px 0; border-top: none; }
            .subcategory-wrapper { margin-bottom: 10px; }
            .subCategory { background: #e0e0e0; border-radius: 15px; padding: 15px; margin-bottom: 10px; box-shadow: inset 0 2px 5px rgba(0,0,0,0.05); white-space: nowrap; overflow-x: auto; }
            .subCategory-title { margin-bottom: 5px; text-align: left; padding-left: 10px; font-size: 1.1em; color: #333; }
            .achievement { display: inline-block; margin: 10px; width: 160px; height: 230px; text-align: center; position: relative; background: #ffffff; border-radius: 15px; padding: 10px 10px; vertical-align: top; box-shadow: 0 4px 8px rgba(0,0,0,0.05); transition: transform 0.2s; }
            .achievement:hover { transform: translateY(-3px); box-shadow: 0 6px 12px rgba(0,0,0,0.1); }
            .achievement-image { width: 110px; height: 110px; margin: 5px 0; }
            .achievement-rank { font-weight: 800; font-size: 1.1em; margin-top: 5px; color: #222; }
            .progress-container { width: 100%; background-color: #f0f0f0; border-radius: 10px; height: 16px; position: relative; margin-top: 8px; overflow: hidden; border: 1px solid #ddd; }
            .progress-bar { background-color: #FFAC1C; height: 100%; border-radius: 10px 0 0 10px; transition: width 0.3s ease; }
            .progress-text { position: absolute; width: 100%; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 11px; font-weight: 900; color: #333; text-shadow: 0 0 2px white; }
            .achievement-description { font-size: 11px; color: #666; line-height: 1.3; white-space: normal; margin-bottom: 5px; min-height: 30px;}
            
            .achievement-tooltip { 
                display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                background: rgba(0, 0, 0, 0.95); color: #fff; padding: 12px; border-radius: 8px; 
                box-shadow: 0 5px 15px rgba(0,0,0,0.4); z-index: 1000; 
                text-align: center; white-space: pre-wrap; width: 160px; font-size: 12px; pointer-events: none; 
            }
            .achievement:hover .achievement-tooltip { display: block; }
        </style>`;

    const popupDiv = document.createElement('div');
    popupDiv.id = 'achievements-wrapper';
    popupDiv.innerHTML = popupHtml;
    document.body.appendChild(popupDiv);
    
    const firstTabContent = document.getElementById(sanitizeId(currentCategoryName));
    if(firstTabContent) firstTabContent.style.display = 'block';
    const tablinks = document.getElementsByClassName('tablinks');
    if (tablinks.length > 0) tablinks[0].classList.add('active');

    updateHeaderStats(currentCategoryName, 'All');
}

function updateHeaderStats(categoryName, filterType) {
    const category = globalMappedResults.find(cat => cat.category === categoryName);
    if (!category) return;

    const filteredSubCats = category.subCategories.filter(sub => {
        if (filterType === 'All') return true;
        return getAchievementType(sub.subCategory) === filterType;
    });

    const visibleAchievements = filteredSubCats.flatMap(sub => sub.achievements);

    const totalPoints = visibleAchievements.reduce((sum, ach) => {
        return sum + (ach.achieved ? ach.value : 0);
    }, 0);

    let tooltipContent = '';
    if (typeof rankDetails !== 'undefined') {
        for (let i = 1; i < 6; i++) { 
            if (rankDetails[i]) {
                tooltipContent += `<div>${rankDetails[i].name}: ${rankDetails[i].value} pts</div>`;
            }
        }
    }

    const pointsContainer = document.getElementById('totalPointsContainer');
    if (pointsContainer) {
        pointsContainer.innerHTML = `
            <span class="total-value">Total Achievement Points: ${totalPoints}</span>
            <div class="points-tooltip">${tooltipContent}</div>
        `;
    }

    const ranks = ["Bronze", "Silver", "Gold", "Master", "Grand Master"];
    const rankSummaries = {};

    ranks.forEach(rankName => {
        const achievementsForRank = visibleAchievements.filter(a => a.rank === rankName);
        const achievedCount = achievementsForRank.filter(a => a.achieved).length;
        const totalCount = achievementsForRank.length;
        
        const rankIndex = ranks.indexOf(rankName) + 1;
        const rankDetail = (typeof rankDetails !== 'undefined') ? rankDetails[rankIndex] : null;
        
        rankSummaries[rankIndex] = {
            rank: rankName,
            achievedCount: achievedCount,
            totalCount: totalCount,
            image: rankDetail ? rankDetail.image : ''
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

function filterAchievements(type, btnElement) {
    currentTypeFilter = type; 
    
    if (btnElement) {
        const buttons = document.getElementsByClassName('filter-btn');
        for (let btn of buttons) {
            btn.classList.remove('active');
        }
        btnElement.classList.add('active');
    }

    const wrappers = document.getElementsByClassName('subcategory-wrapper');
    for (let wrapper of wrappers) {
        if (type === 'All' || wrapper.getAttribute('data-type') === type) {
            wrapper.style.display = 'block';
        } else {
            wrapper.style.display = 'none';
        }
    }

    updateHeaderStats(currentCategoryName, currentTypeFilter);
}

function displayAchievementsPage() {
    const popup = document.getElementById("achievementsPopup");
    if (popup) {
        popup.style.display = 'flex';
        const btn = document.getElementById("achievementButton");
        if(btn) btn.style.display = 'none';
    }
}

function closeAchievementsPopup() {
    const popup = document.getElementById("achievementsPopup");
    if (popup) {
        popup.style.display = 'none';
    }
}

function openCategory(evt, categoryName) {
    currentCategoryName = categoryName; 

    const tabcontent = document.getElementsByClassName('tabcontent');
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }
    const tablinks = document.getElementsByClassName('tablinks');
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }
    document.getElementById(sanitizeId(categoryName)).style.display = 'block';
    evt.currentTarget.className += ' active';

    updateHeaderStats(currentCategoryName, currentTypeFilter);
    filterAchievements(currentTypeFilter, null);
}

function monitorLoginState() {
    setInterval(() => {
        const myStatsBtn = document.getElementById('my-stats-button');
        const achBtn = document.getElementById('achievementButton');
        const popup = document.getElementById("achievementsPopup");

        if (myStatsBtn && achBtn) {
            const isStatsVisible = myStatsBtn.offsetParent !== null;
            const isPopupOpen = popup && popup.offsetParent !== null && popup.style.display !== 'none';

            if (isStatsVisible && !isPopupOpen) {
                achBtn.style.display = 'block';
            } else {
                achBtn.style.display = 'none';
            }
        }
    }, 1000); 
}

function createAchievementButton() {
    const existingBtn = document.getElementById('achievementButton');
    if (existingBtn) existingBtn.remove();

    const achievementButton = document.createElement('button');
    achievementButton.id = 'achievementButton';
    achievementButton.innerText = 'Achievements'; 
    achievementButton.className = 'button'; 
    
    achievementButton.style.position = 'fixed';
    achievementButton.style.top = '10px'; 
    achievementButton.style.left = '10px';
    achievementButton.style.display = 'none'; 

    achievementButton.onclick = function() {
        console.log("Achievements button clicked"); 
        displayAchievementsPage();
    };
    
    document.body.appendChild(achievementButton);
    monitorLoginState();
}