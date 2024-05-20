function createAchievementsPopup(mappedResults, totalValue) {
    const achievementsHtml = mappedResults.map(category => {
        const subCategoriesHtml = category.subCategories.map(subCategory => {
            const achievementsHtml = subCategory.achievements.map(achievement => {
                const imageUrl = achievement.achieved ? achievement.image : 'https://via.placeholder.com/50?text=X';
                return `<div class="achievement">
                            <img src="${imageUrl}" alt="${achievement.rank}" class="achievement-image">
                            <div class="achievement-rank">${achievement.rank}</div>
                            <div class="achievement-description">${achievement.description}</div>
                        </div>`;
            }).join('');
            return `<div>
                        <h3>${subCategory.subCategory}</h3>
                        ${achievementsHtml}
                    </div>`;
        }).join('');
        return `<div id="${category.category}" class="tabcontent">
                    <h2>${category.category}</h2>
                    ${subCategoriesHtml}
                </div>`;
    }).join('');

    const popupHtml = `<div id="achievementsPopup" style="position: fixed; top: 10%; left: 10%; width: 80%; height: 80%; background: white; border: 1px solid #ccc; box-shadow: 0 0 10px rgba(0,0,0,0.5); padding: 20px; overflow-y: auto;">
                            <button onclick="document.getElementById('achievementsPopup').remove()" style="position: absolute; top: 10px; right: 10px; background: #3d5dff; color: white; border: none; padding: 5px 10px; cursor: pointer; box-shadow: 0 0 5px #374ebf;">Close</button>
                            <h1>Achievements</h1>
                            <div style="text-align: right; margin-bottom: 10px;">Total Value: ${totalValue}</div>
                            <div class="tab">
                                ${categories.map(category => `<button class="tablinks" onclick="openCategory(event, '${category.name}')" style="box-shadow: 0 0 5px #374ebf;">${category.name}</button>`).join('')}
                            </div>
                            ${achievementsHtml}
                        </div>
                        <style>
                            .tab { overflow: hidden; }
                            .tab button { background-color: inherit; float: left; border: none; outline: none; cursor: pointer; padding: 14px 16px; transition: 0.3s; background: #3d5dff; color: white; box-shadow: 0 0 5px #374ebf; }
                            .tab button:hover { background-color: #ddd; }
                            .tabcontent { display: none; padding: 6px 12px; border-top: none; }
                            .achievement { display: inline-block; margin: 10px; width: 150px; text-align: center; }
                            .achievement-image { width: 50px; height: 50px; }
                            .achievement-rank { font-weight: bold; }
                            .achievement-description { font-size: 12px; }
                        </style>`;

    const popupDiv = document.createElement('div');
    popupDiv.innerHTML = popupHtml;
    document.body.appendChild(popupDiv);
    document.getElementById("achievementsPopup").style.display = 'block';
}

function createAchievementButton() {
    const achievementButton = document.createElement('button');
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