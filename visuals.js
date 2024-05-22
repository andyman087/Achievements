function createGreyedOutImage(imageUrl, callback) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const img = new Image();

    img.crossOrigin = "Anonymous"; // This is the key part

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);

        // Create a dark grey overlay
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

function createAchievementsPopup(mappedResults, totalValue) {
    const achievementsHtml = mappedResults.map(category => {
        const subCategoriesHtml = category.subCategories.map(subCategory => {
            const achievementsHtml = subCategory.achievements.map(achievement => {
                let imageUrl = achievement.image;
                if (!achievement.achieved) {
                    createGreyedOutImage(achievement.image, (greyedOutImageUrl) => {
                        const imgElement = document.getElementById(`achievement-img-${achievement.rank}-${subCategory.subCategory}`);
                        if (imgElement && greyedOutImageUrl) {
                            imgElement.src = greyedOutImageUrl;
                        } else {
                            imgElement.src = 'https://via.placeholder.com/125?text=Error';
                        }
                    });
                    imageUrl = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='; // placeholder
                }
                const criteriaList = Object.entries(achievement.criteria)
                    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
                    .join('<br>');
                return `<div class="achievement">
                            <div class="achievement-rank">${achievement.rank}</div>
                            <div class="achievement-value">Value: ${achievement.value}</div>
                            <img src="${imageUrl}" id="achievement-img-${achievement.rank}-${subCategory.subCategory}" alt="${achievement.rank}" class="achievement-image">
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

    const popupHtml = `<div id="achievementsPopup" style="position: fixed; top: 10%; left: 10%; width: 80%; height: 80%; background: white; border: 1px solid #ccc; box-shadow: 0 0 10px rgba(0,0,0,0.5); padding: 20px; overflow-y: auto;">
                            <button onclick="closeAchievementsPopup()" style="position: absolute; top: 10px; right: 10px; background: white; color: black; border: none; padding: 5px 10px; cursor: pointer; font-size: 24px;" onmouseover="this.style.backgroundColor='lightgrey';" onmouseout="this.style.backgroundColor='white';">&#10005;</button>
                            <h1 class="popup-title">Achievements</h1>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <div class="tab">
                                    ${categories.map(category => `<button class="tablinks" onclick="openCategory(event, '${category.name}')" style="box-shadow: 0 0 5px #374ebf;">${category.name}</button>`).join('')}
                                </div>
                                <span class="total-value">Total Value: ${totalValue}</span>
                            </div>
                            ${achievementsHtml}
                        </div>
                        <style>
                            .tab { overflow: hidden; }
                            .tab button { background-color: inherit; float: left; border: none; outline: none; cursor: pointer; padding: 14px 16px; transition: 0.3s; background: #3d5dff; color: white; box-shadow: 0 0 5px #374ebf; }
                            .tab button:hover { background-color: #ddd; }
                            .tab button.active { background-color: lightorange; }
                            .tabcontent { display: none; padding: 6px 12px; border-top: none; }
                            .achievement { display: inline-block; margin: 10px; width: 150px; height: 225px; text-align: center; position: relative; background: #f0f0f0; border-radius: 50px; padding: 10px; vertical-align: top; }
                            .achievement-image { width: 125px; height: 125px; margin: 10px 0; }
                            .achievement-rank { font-weight: bold; margin-top: 5px; }
                            .achievement-value { font-size: 12px; margin: 5px 0; }
                            .achievement-description { font-size: 12px; }
                            .achievement-tooltip { display: none; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); background: #333; color: #fff; padding: 10px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.5); z-index: 100; text-align: left; white-space: pre-wrap; width: 200px; }
                            .achievement:hover .achievement-tooltip { display: block; }
                            .subCategory { background: #e0e0e0; border-radius: 25px; padding: 10px; margin-bottom: 10px; }
                            .subCategory-title { margin-bottom: 5px; text-align: left; padding-left: 10px; }
                            .total-value { background: #f0f0f0; border-radius: 10px; padding: 5px 10px; display: inline-block; }
                            .popup-title { text-align: center; font-size: 32px; margin-bottom: 20px; }
                        </style>`;

    const popupDiv = document.createElement('div');
    popupDiv.innerHTML = popupHtml;
    document.body.appendChild(popupDiv);
    document.getElementById("achievementsPopup").style.display = 'block';
    document.getElementById("achievementButton").style.display = 'none';
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
}

function createAchievementButton() {
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
