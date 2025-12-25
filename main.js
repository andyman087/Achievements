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
                name: "Single Target - Time Alive",
                achievements: [
                    { rank: 1, criteria: { time_alive: { min: 1800 }, game_mode: 1 }, highlight: 'time_alive', count: 1, description: "Survive for at least 30 minutes" },
                    { rank: 2, criteria: { time_alive: { min: 3600 }, game_mode: 1 }, highlight: 'time_alive', count: 1, description: "Survive for at least 1 hour" },
                    { rank: 3, criteria: { time_alive: { min: 7200 }, game_mode: 1 }, highlight: 'time_alive', count: 1, description: "Survive for at least 2 hours" },
                    { rank: 4, criteria: { time_alive: { min: 10800 }, game_mode: 1 }, highlight: 'time_alive', count: 1, description: "Survive for at least 3 hours" },
                    { rank: 5, criteria: { time_alive: { min: 18000 }, game_mode: 1 }, highlight: 'time_alive', count: 1, description: "Survive for at least 5 hours" }
                ]
            },
            {
                name: "Single Target - Kills",
                achievements: [
                    { rank: 1, criteria: { player_kills: { min: 25 }, game_mode: 1 }, count: 1, description: "Get at least 25 kills" },
                    { rank: 2, criteria: { player_kills: { min: 50 }, game_mode: 1 }, count: 1, description: "Get at least 50 kills" },
                    { rank: 3, criteria: { player_kills: { min: 75 }, game_mode: 1 }, count: 1, description: "Get at least 75 kills" },
                    { rank: 4, criteria: { player_kills: { min: 100 }, game_mode: 1 }, count: 1, description: "Get at least 100 kills" },
                    { rank: 5, criteria: { player_kills: { min: 150 }, game_mode: 1 }, count: 1, description: "Get at least 150 kills" }
                ]
            },
            {
                name: "Single Target - Towers Destroyed",
                achievements: [
                    { rank: 1, criteria: { dot_kills: { min: 2500 }, game_mode: 1 }, count: 1, description: "Destroy at least 2500 towers" },
                    { rank: 2, criteria: { dot_kills: { min: 5000 }, game_mode: 1 }, count: 1, description: "Destroy at least 5000 towers" },
                    { rank: 3, criteria: { dot_kills: { min: 7500 }, game_mode: 1 }, count: 1, description: "Destroy at least 7500 towers" },
                    { rank: 4, criteria: { dot_kills: { min: 10000 }, game_mode: 1 }, count: 1, description: "Destroy at least 10000 towers" },
                    { rank: 5, criteria: { dot_kills: { min: 15000 }, game_mode: 1 }, count: 1, description: "Destroy at least 15000 towers" }
                ]
            },
            {
                name: "Single Target - Score",
                achievements: [
                    { rank: 1, criteria: { max_score: { min: 50000 }, game_mode: 1 }, count: 1, description: "Achieve a score of at least 50000" },
                    { rank: 2, criteria: { max_score: { min: 75000 }, game_mode: 1 }, count: 1, description: "Achieve a score of at least 75000" },
                    { rank: 3, criteria: { max_score: { min: 100000 }, game_mode: 1 }, count: 1, description: "Achieve a score of at least 100000" },
                    { rank: 4, criteria: { max_score: { min: 200000 }, game_mode: 1 }, count: 1, description: "Achieve a score of at least 200000" },
                    { rank: 5, criteria: { max_score: { min: 250000 }, game_mode: 1 }, count: 1, description: "Achieve a score of at least 250000" }
                ]
            },
            {
                name: "Multiple Games - Time Alive",
                achievements: [
                    { rank: 1, criteria: { time_alive: { min: 900 }, game_mode: 1 }, count: 5, description: "Survive for at least 15 minutes x 5 Games" },
                    { rank: 2, criteria: { time_alive: { min: 1800 }, game_mode: 1 }, count: 5, description: "Survive for at least 30 minutes x 5 Games" },
                    { rank: 3, criteria: { time_alive: { min: 3600 }, game_mode: 1 }, count: 5, description: "Survive for at least 1 hour x 5 Games" },
                    { rank: 4, criteria: { time_alive: { min: 7200 }, game_mode: 1 }, count: 5, description: "Survive for at least 2 hours x 5 Games" },
                    { rank: 5, criteria: { time_alive: { min: 10800 }, game_mode: 1 }, count: 5, description: "Survive for at least 3 hours x 5 Games" }
                ]
            },
            {
                name: "Multiple Games - Kills",
                achievements: [
                    { rank: 1, criteria: { player_kills: { min: 15 }, game_mode: 1 }, count: 5, description: "Get at least 15 kills x 5 Games" },
                    { rank: 2, criteria: { player_kills: { min: 25 }, game_mode: 1 }, count: 5, description: "Get at least 25 kills x 5 Games" },
                    { rank: 3, criteria: { player_kills: { min: 50 }, game_mode: 1 }, count: 5, description: "Get at least 50 kills x 5 Games" },
                    { rank: 4, criteria: { player_kills: { min: 75 }, game_mode: 1 }, count: 5, description: "Get at least 75 kills x 5 Games" },
                    { rank: 5, criteria: { player_kills: { min: 100 }, game_mode: 1 }, count: 5, description: "Get at least 100 kills x 5 Games" }
                ]
            },
            {
                name: "Multiple Games - Towers Destroyed",
                achievements: [
                    { rank: 1, criteria: { dot_kills: { min: 1000 }, game_mode: 1 }, count: 5, description: "Destroy at least 1000 towers x 5 Games" },
                    { rank: 2, criteria: { dot_kills: { min: 2500 }, game_mode: 1 }, count: 5, description: "Destroy at least 2500 towers x 5 Games" },
                    { rank: 3, criteria: { dot_kills: { min: 5000 }, game_mode: 1 }, count: 5, description: "Destroy at least 5000 towers x 5 Games" },
                    { rank: 4, criteria: { dot_kills: { min: 7500 }, game_mode: 1 }, count: 5, description: "Destroy at least 7500 towers x 5 Games" },
                    { rank: 5, criteria: { dot_kills: { min: 10000 }, game_mode: 1 }, count: 5, description: "Destroy at least 10000 towers x 5 Games" }
                ]
            },
            {
                name: "Multiple Games - Score",
                achievements: [
                    { rank: 1, criteria: { max_score: { min: 25000 }, game_mode: 1 }, count: 5, description: "Achieve a score of at least 25000 x 5 Games" },
                    { rank: 2, criteria: { max_score: { min: 50000 }, game_mode: 1 }, count: 5, description: "Achieve a score of at least 50000 x 5 Games" },
                    { rank: 3, criteria: { max_score: { min: 75000 }, game_mode: 1 }, count: 5, description: "Achieve a score of at least 75000 x 5 Games" },
                    { rank: 4, criteria: { max_score: { min: 100000 }, game_mode: 1 }, count: 5, description: "Achieve a score of at least 100000 x 5 Games" },
                    { rank: 5, criteria: { max_score: { min: 200000 }, game_mode: 1 }, count: 5, description: "Achieve a score of at least 200000 x 5 Games" }
                ]
            },
            {
                name: "Lifetime - Victories",
                achievements: [
                    { rank: 1, criteria: { kill_reason: 4, game_mode: 1}, count: 10, description: "Achieve at least 10 victories" },
                    { rank: 2, criteria: { kill_reason: 4, game_mode: 1}, count: 25, description: "Achieve at least 25 victories" },
                    { rank: 3, criteria: { kill_reason: 4, game_mode: 1}, count: 50, description: "Achieve at least 50 victories" },
                    { rank: 4, criteria: { kill_reason: 4, game_mode: 1}, count: 75, description: "Achieve at least 75 victories" },
                    { rank: 5, criteria: { kill_reason: 4, game_mode: 1}, count: 100, description: "Achieve at least 100 victories" }
                ]
            },
            {
                name: "Lifetime - Time Alive",
                achievements: [
                    { rank: 1, criteria: { time_alive: { min: 360000 }, game_mode: 1, aggregate: true }, count: 0, description: "Survive for at least 100 hours" },
                    { rank: 2, criteria: { time_alive: { min: 900000 }, game_mode: 1, aggregate: true }, count: 0, description: "Survive for at least 250 hours" },
                    { rank: 3, criteria: { time_alive: { min: 1800000 }, game_mode: 1, aggregate: true }, count: 0, description: "Survive for at least 500 hours" },
                    { rank: 4, criteria: { time_alive: { min: 2700000 }, game_mode: 1, aggregate: true }, count: 0, description: "Survive for at least 750 hours" },
                    { rank: 5, criteria: { time_alive: { min: 3600000 }, game_mode: 1, aggregate: true }, count: 0, description: "Survive for at least 1000 hours" }
                ]
            },
            {
                name: "Lifetime - Kills",
                achievements: [
                    { rank: 1, criteria: { player_kills: { min: 1000 }, game_mode: 1, aggregate: true }, count: 0, description: "Get at least 1000 kills" },
                    { rank: 2, criteria: { player_kills: { min: 2500 }, game_mode: 1, aggregate: true }, count: 0, description: "Get at least 2500 kills" },
                    { rank: 3, criteria: { player_kills: { min: 5000 }, game_mode: 1, aggregate: true }, count: 0, description: "Get at least 5000 kills" },
                    { rank: 4, criteria: { player_kills: { min: 7500 }, game_mode: 1, aggregate: true }, count: 0, description: "Get at least 7500 kills" },
                    { rank: 5, criteria: { player_kills: { min: 10000 }, game_mode: 1, aggregate: true }, count: 0, description: "Get at least 10000 kills" }
                ]
            },
            {
                name: "Lifetime - Towers Destroyed",
                achievements: [
                    { rank: 1, criteria: { dot_kills: { min: 25000 }, game_mode: 1, aggregate: true }, count: 0, description: "Destroy at least 25000 towers" },
                    { rank: 2, criteria: { dot_kills: { min: 50000 }, game_mode: 1, aggregate: true }, count: 0, description: "Destroy at least 50000 towers" },
                    { rank: 3, criteria: { dot_kills: { min: 100000 }, game_mode: 1, aggregate: true }, count: 0, description: "Destroy at least 100000 towers" },
                    { rank: 4, criteria: { dot_kills: { min: 150000 }, game_mode: 1, aggregate: true }, count: 0, description: "Destroy at least 150000 towers" },
                    { rank: 5, criteria: { dot_kills: { min: 200000 }, game_mode: 1, aggregate: true }, count: 0, description: "Destroy at least 200000 towers" }
                ]
            },
            {
                name: "Lifetime - Score",
                achievements: [
                    { rank: 1, criteria: { max_score: { min: 2500000 }, game_mode: 1, aggregate: true }, count: 0, description: "Achieve a score of at least 2500000" },
                    { rank: 2, criteria: { max_score: { min: 5000000 }, game_mode: 1, aggregate: true }, count: 0, description: "Achieve a score of at least 5000000" },
                    { rank: 3, criteria: { max_score: { min: 10000000 }, game_mode: 1, aggregate: true }, count: 0, description: "Achieve a score of at least 10000000" },
                    { rank: 4, criteria: { max_score: { min: 25000000 }, game_mode: 1, aggregate: true }, count: 0, description: "Achieve a score of at least 25000000" },
                    { rank: 5, criteria: { max_score: { min: 50000000 }, game_mode: 1, aggregate: true }, count: 0, description: "Achieve a score of at least 50000000" }
                ]
            }
        ]
    },
    {
        name: "DEFUSE",
        subCategories: [
            {
                name: "Single Target - Time Alive",
                achievements: [
                    { rank: 1, criteria: { time_alive: { min: 900 }, game_mode: 2 }, count: 1, description: "Survive for at least 15 minutes" },
                    { rank: 2, criteria: { time_alive: { min: 1800 }, game_mode: 2 }, count: 1, description: "Survive for at least 30 minutes" },
                    { rank: 3, criteria: { time_alive: { min: 3600 }, game_mode: 2 }, count: 1, description: "Survive for at least 1 hour" },
                    { rank: 4, criteria: { time_alive: { min: 7200 }, game_mode: 2 }, count: 1, description: "Survive for at least 2 hours" },
                    { rank: 5, criteria: { time_alive: { min: 10800 }, game_mode: 2 }, count: 1, description: "Survive for at least 3 hours" }
                ]
            },
            {
                name: "Single Target - Kills",
                achievements: [
                    { rank: 1, criteria: { player_kills: { min: 25 }, game_mode: 2 }, count: 1, description: "Get at least 25 kills" },
                    { rank: 2, criteria: { player_kills: { min: 50 }, game_mode: 2 }, count: 1, description: "Get at least 50 kills" },
                    { rank: 3, criteria: { player_kills: { min: 75 }, game_mode: 2 }, count: 1, description: "Get at least 75 kills" },
                    { rank: 4, criteria: { player_kills: { min: 100 }, game_mode: 2 }, count: 1, description: "Get at least 100 kills" },
                    { rank: 5, criteria: { player_kills: { min: 150 }, game_mode: 2 }, count: 1, description: "Get at least 150 kills" }
                ]
            },
            {
                name: "Single Target - Towers Destroyed",
                achievements: [
                    { rank: 1, criteria: { dot_kills: { min: 500 }, game_mode: 2 }, count: 1, description: "Destroy at least 500 towers" },
                    { rank: 2, criteria: { dot_kills: { min: 750 }, game_mode: 2 }, count: 1, description: "Destroy at least 750 towers" },
                    { rank: 3, criteria: { dot_kills: { min: 1000 }, game_mode: 2 }, count: 1, description: "Destroy at least 1000 towers" },
                    { rank: 4, criteria: { dot_kills: { min: 1500 }, game_mode: 2 }, count: 1, description: "Destroy at least 1500 towers" },
                    { rank: 5, criteria: { dot_kills: { min: 2000 }, game_mode: 2 }, count: 1, description: "Destroy at least 2000 towers" }
                ]
            },
            {
                name: "Single Target - Score",
                achievements: [
                    { rank: 1, criteria: { max_score: { min: 50000 }, game_mode: 2 }, count: 1, description: "Achieve a score of at least 50000" },
                    { rank: 2, criteria: { max_score: { min: 75000 }, game_mode: 2 }, count: 1, description: "Achieve a score of at least 75000" },
                    { rank: 3, criteria: { max_score: { min: 100000 }, game_mode: 2 }, count: 1, description: "Achieve a score of at least 100000" },
                    { rank: 4, criteria: { max_score: { min: 200000 }, game_mode: 2 }, count: 1, description: "Achieve a score of at least 200000" },
                    { rank: 5, criteria: { max_score: { min: 250000 }, game_mode: 2 }, count: 1, description: "Achieve a score of at least 250000" }
                ]
            },
            {
                name: "Single Target - Rounds Played",
                achievements: [
                    { rank: 1, criteria: { level: { min: 10 }, game_mode: 2 }, count: 1, description: "Play at least 10 rounds" },
                    { rank: 2, criteria: { level: { min: 25 }, game_mode: 2 }, count: 1, description: "Play at least 25 rounds" },
                    { rank: 3, criteria: { level: { min: 35 }, game_mode: 2 }, count: 1, description: "Play at least 35 rounds" },
                    { rank: 4, criteria: { level: { min: 50 }, game_mode: 2 }, count: 1, description: "Play at least 50 rounds" },
                    { rank: 5, criteria: { level: { min: 75 }, game_mode: 2 }, count: 1, description: "Play at least 75 rounds" }
                ]
            },
            {
                name: "Single Target - Rounds Won",
                achievements: [
                    { rank: 1, criteria: { rounds_won: { min: 10 }, game_mode: 2 }, count: 1, description: "Win at least 10 rounds" },
                    { rank: 2, criteria: { rounds_won: { min: 15 }, game_mode: 2 }, count: 1, description: "Win at least 15 rounds" },
                    { rank: 3, criteria: { rounds_won: { min: 25 }, game_mode: 2 }, count: 1, description: "Win at least 25 rounds" },
                    { rank: 4, criteria: { rounds_won: { min: 35 }, game_mode: 2 }, count: 1, description: "Win at least 35 rounds" },
                    { rank: 5, criteria: { rounds_won: { min: 50 }, game_mode: 2 }, count: 1, description: "Win at least 50 rounds" }
                ]
            },
            {
                name: "Single Target - Win Rate",
                achievements: [
                    { rank: 1, criteria: { win_rate: { min: 0.5 }, level: { min: 10 }, game_mode: 2 }, count: 1, description: "Achieve a win rate of at least 50% in 10+ rounds" },
                    { rank: 2, criteria: { win_rate: { min: 0.5 }, level: { min: 15 }, game_mode: 2 }, count: 1, description: "Achieve a win rate of at least 50% in 15+ rounds" },
                    { rank: 3, criteria: { win_rate: { min: 0.65 }, level: { min: 20 }, game_mode: 2 }, count: 1, description: "Achieve a win rate of at least 65% in 20+ rounds" },
                    { rank: 4, criteria: { win_rate: { min: 0.7 }, level: { min: 25 }, game_mode: 2 }, count: 1, description: "Achieve a win rate of at least 70% in 25+ rounds" },
                    { rank: 5, criteria: { win_rate: { min: 0.8 }, level: { min: 30 }, game_mode: 2 }, count: 1, description: "Achieve a win rate of at least 80% in 30+ rounds" }
                ]
            },
            {
                name: "Multiple Games - Time Alive",
                achievements: [
                    { rank: 1, criteria: { time_alive: { min: 600 }, game_mode: 2 }, count: 5, description: "Survive for at least 10 minutes x 5 Games" },
                    { rank: 2, criteria: { time_alive: { min: 1200 }, game_mode: 2 }, count: 5, description: "Survive for at least 20 minutes x 5 Games" },
                    { rank: 3, criteria: { time_alive: { min: 1800 }, game_mode: 2 }, count: 5, description: "Survive for at least 30 minutes x 5 Games" },
                    { rank: 4, criteria: { time_alive: { min: 3600 }, game_mode: 2 }, count: 5, description: "Survive for at least 1 hour x 5 Games" },
                    { rank: 5, criteria: { time_alive: { min: 7200 }, game_mode: 2 }, count: 5, description: "Survive for at least 2 hours x 5 Games" }
                ]
            },
            {
                name: "Multiple Games - Kills",
                achievements: [
                    { rank: 1, criteria: { player_kills: { min: 15 }, game_mode: 2 }, count: 5, description: "Get at least 15 kills x 5 Games" },
                    { rank: 2, criteria: { player_kills: { min: 25 }, game_mode: 2 }, count: 5, description: "Get at least 25 kills x 5 Games" },
                    { rank: 3, criteria: { player_kills: { min: 50 }, game_mode: 2 }, count: 5, description: "Get at least 50 kills x 5 Games" },
                    { rank: 4, criteria: { player_kills: { min: 75 }, game_mode: 2 }, count: 5, description: "Get at least 75 kills x 5 Games" },
                    { rank: 5, criteria: { player_kills: { min: 100 }, game_mode: 2 }, count: 5, description: "Get at least 100 kills x 5 Games" }
                ]
            },
            {
                name: "Multiple Games - Towers Destroyed",
                achievements: [
                    { rank: 1, criteria: { dot_kills: { min: 250 }, game_mode: 2 }, count: 5, description: "Destroy at least 250 towers x 5 Games" },
                    { rank: 2, criteria: { dot_kills: { min: 500 }, game_mode: 2 }, count: 5, description: "Destroy at least 500 towers x 5 Games" },
                    { rank: 3, criteria: { dot_kills: { min: 750 }, game_mode: 2 }, count: 5, description: "Destroy at least 750 towers x 5 Games" },
                    { rank: 4, criteria: { dot_kills: { min: 1000 }, game_mode: 2 }, count: 5, description: "Destroy at least 1000 towers x 5 Games" },
                    { rank: 5, criteria: { dot_kills: { min: 1500 }, game_mode: 2 }, count: 5, description: "Destroy at least 1500 towers x 5 Games" }
                ]
            },
            {
                name: "Multiple Games - Score",
                achievements: [
                    { rank: 1, criteria: { max_score: { min: 25000 }, game_mode: 2 }, count: 5, description: "Achieve a score of at least 25000 x 5 Games" },
                    { rank: 2, criteria: { max_score: { min: 50000 }, game_mode: 2 }, count: 5, description: "Achieve a score of at least 50000 x 5 Games" },
                    { rank: 3, criteria: { max_score: { min: 75000 }, game_mode: 2 }, count: 5, description: "Achieve a score of at least 75000 x 5 Games" },
                    { rank: 4, criteria: { max_score: { min: 100000 }, game_mode: 2 }, count: 5, description: "Achieve a score of at least 100000 x 5 Games" },
                    { rank: 5, criteria: { max_score: { min: 200000 }, game_mode: 2 }, count: 5, description: "Achieve a score of at least 200000 x 5 Games" }
                ]
            },
            {
                name: "Multiple Games - Rounds Played",
                achievements: [
                    { rank: 1, criteria: { level: { min: 5 }, game_mode: 2 }, count: 5, description: "Play at least 5 rounds x 5 Games" },
                    { rank: 2, criteria: { level: { min: 10 }, game_mode: 2 }, count: 5, description: "Play at least 10 rounds x 5 Games" },
                    { rank: 3, criteria: { level: { min: 25 }, game_mode: 2 }, count: 5, description: "Play at least 25 rounds x 5 Games" },
                    { rank: 4, criteria: { level: { min: 35 }, game_mode: 2 }, count: 5, description: "Play at least 35 rounds x 5 Games" },
                    { rank: 5, criteria: { level: { min: 50 }, game_mode: 2 }, count: 5, description: "Play at least 50 rounds x 5 Games" }
                ]
            },
            {
                name: "Multiple Games - Rounds Won",
                achievements: [
                    { rank: 1, criteria: { rounds_won: { min: 5 }, game_mode: 2 }, count: 5, description: "Win at least 5 rounds x 5 Games" },
                    { rank: 2, criteria: { rounds_won: { min: 10 }, game_mode: 2 }, count: 5, description: "Win at least 10 rounds x 5 Games" },
                    { rank: 3, criteria: { rounds_won: { min: 15 }, game_mode: 2 }, count: 5, description: "Win at least 15 rounds x 5 Games" },
                    { rank: 4, criteria: { rounds_won: { min: 25 }, game_mode: 2 }, count: 5, description: "Win at least 25 rounds x 5 Games" },
                    { rank: 5, criteria: { rounds_won: { min: 35 }, game_mode: 2 }, count: 5, description: "Win at least 35 rounds x 5 Games" }
                ]
            },
            {
                name: "Multiple Games - Win Rate",
                achievements: [
                    { rank: 1, criteria: { win_rate: { min: 0.5 }, level: { min: 5 }, game_mode: 2 }, count: 5, description: "Achieve a win rate of at least 50% in 5+ rounds x 5 Games" },
                    { rank: 2, criteria: { win_rate: { min: 0.5 }, level: { min: 10 }, game_mode: 2 }, count: 5, description: "Achieve a win rate of at least 50% in 10+ rounds x 5 Games" },
                    { rank: 3, criteria: { win_rate: { min: 0.65 }, level: { min: 15 }, game_mode: 2 }, count: 5, description: "Achieve a win rate of at least 65% in 15+ rounds x 5 Games" },
                    { rank: 4, criteria: { win_rate: { min: 0.65 }, level: { min: 20 }, game_mode: 2 }, count: 5, description: "Achieve a win rate of at least 65% in 20+ rounds x 5 Games" },
                    { rank: 5, criteria: { win_rate: { min: 0.8 }, level: { min: 20 }, game_mode: 2 }, count: 5, description: "Achieve a win rate of at least 80% in 20+ rounds x 5 Games" }
                ]
            },
            {
                name: "Lifetime - Time Alive",
                achievements: [
                    { rank: 1, criteria: { time_alive: { min: 360000 }, game_mode: 2, aggregate: true }, count: 0, description: "Survive for at least 100 hours" },
                    { rank: 2, criteria: { time_alive: { min: 900000 }, game_mode: 2, aggregate: true }, count: 0, description: "Survive for at least 250 hours" },
                    { rank: 3, criteria: { time_alive: { min: 1800000 }, game_mode: 2, aggregate: true }, count: 0, description: "Survive for at least 500 hours" },
                    { rank: 4, criteria: { time_alive: { min: 2700000 }, game_mode: 2, aggregate: true }, count: 0, description: "Survive for at least 750 hours" },
                    { rank: 5, criteria: { time_alive: { min: 3600000 }, game_mode: 2, aggregate: true }, count: 0, description: "Survive for at least 1000 hours" }
                ]
            },
            {
                name: "Lifetime - Kills",
                achievements: [
                    { rank: 1, criteria: { player_kills: { min: 1000 }, game_mode: 2, aggregate: true }, count: 0, description: "Get at least 1000 kills" },
                    { rank: 2, criteria: { player_kills: { min: 2500 }, game_mode: 2, aggregate: true }, count: 0, description: "Get at least 2500 kills" },
                    { rank: 3, criteria: { player_kills: { min: 5000 }, game_mode: 2, aggregate: true }, count: 0, description: "Get at least 5000 kills" },
                    { rank: 4, criteria: { player_kills: { min: 7500 }, game_mode: 2, aggregate: true }, count: 0, description: "Get at least 7500 kills" },
                    { rank: 5, criteria: { player_kills: { min: 10000 }, game_mode: 2, aggregate: true }, count: 0, description: "Get at least 10000 kills" }
                ]
            },
            {
                name: "Lifetime - Towers Destroyed",
                achievements: [
                    { rank: 1, criteria: { dot_kills: { min: 25000 }, game_mode: 2, aggregate: true }, count: 0, description: "Destroy at least 25000 towers" },
                    { rank: 2, criteria: { dot_kills: { min: 50000 }, game_mode: 2, aggregate: true }, count: 0, description: "Destroy at least 50000 towers" },
                    { rank: 3, criteria: { dot_kills: { min: 75000 }, game_mode: 2, aggregate: true }, count: 0, description: "Destroy at least 75000 towers" },
                    { rank: 4, criteria: { dot_kills: { min: 100000 }, game_mode: 2, aggregate: true }, count: 0, description: "Destroy at least 100000 towers" },
                    { rank: 5, criteria: { dot_kills: { min: 150000 }, game_mode: 2, aggregate: true }, count: 0, description: "Destroy at least 150000 towers" }
                ]
            },
            {
                name: "Lifetime - Score",
                achievements: [
                    { rank: 1, criteria: { max_score: { min: 2500000 }, game_mode: 2, aggregate: true }, count: 0, description: "Achieve a score of at least 2500000" },
                    { rank: 2, criteria: { max_score: { min: 5000000 }, game_mode: 2, aggregate: true }, count: 0, description: "Achieve a score of at least 5000000" },
                    { rank: 3, criteria: { max_score: { min: 10000000 }, game_mode: 2, aggregate: true }, count: 0, description: "Achieve a score of at least 10000000" },
                    { rank: 4, criteria: { max_score: { min: 25000000 }, game_mode: 2, aggregate: true }, count: 0, description: "Achieve a score of at least 25000000" },
                    { rank: 5, criteria: { max_score: { min: 50000000 }, game_mode: 2, aggregate: true }, count: 0, description: "Achieve a score of at least 50000000" }
                ]
            },
            {
                name: "Lifetime - Rounds Played",
                achievements: [
                    { rank: 1, criteria: { level: { min: 1000 }, game_mode: 2, aggregate: true }, count: 0, description: "Play at least 1000 rounds" },
                    { rank: 2, criteria: { level: { min: 2500 }, game_mode: 2, aggregate: true }, count: 0, description: "Play at least 2500 rounds" },
                    { rank: 3, criteria: { level: { min: 5000 }, game_mode: 2, aggregate: true }, count: 0, description: "Play at least 5000 rounds" },
                    { rank: 4, criteria: { level: { min: 7500 }, game_mode: 2, aggregate: true }, count: 0, description: "Play at least 7500 rounds" },
                    { rank: 5, criteria: { level: { min: 10000 }, game_mode: 2, aggregate: true }, count: 0, description: "Play at least 10000 rounds" }
                ]
            },
            {
                name: "Lifetime - Rounds Won",
                achievements: [
                    { rank: 1, criteria: { rounds_won: { min: 500 }, game_mode: 2, aggregate: true }, count: 0, description: "Win at least 500 rounds" },
                    { rank: 2, criteria: { rounds_won: { min: 750 }, game_mode: 2, aggregate: true }, count: 0, description: "Win at least 750 rounds" },
                    { rank: 3, criteria: { rounds_won: { min: 1000 }, game_mode: 2, aggregate: true }, count: 0, description: "Win at least 1000 rounds" },
                    { rank: 4, criteria: { rounds_won: { min: 2500 }, game_mode: 2, aggregate: true }, count: 0, description: "Win at least 2500 rounds" },
                    { rank: 5, criteria: { rounds_won: { min: 5000 }, game_mode: 2, aggregate: true }, count: 0, description: "Win at least 5000 rounds" }
                ]
            }
        ]
    }
];

function checkCriteria(event, criteria) {
    for (let key in criteria) {
        let actualKey = key;
        if (key === 'win_rate') {
            actualKey = 'max_area';
        }

        // Exclude the aggregate key from the check
        if (key === 'aggregate') continue;

        if (!event.hasOwnProperty(actualKey)) {
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
                let achieved = false;
                let progress = 0;
                let highlightValue = 0;

                if (achievement.criteria.aggregate) {
                    const aggregateCriteria = { ...achievement.criteria };
                    // ... (Deleting keys for aggregate calculation - same as original)
                    delete aggregateCriteria.player_kills;
                    delete aggregateCriteria.time_alive;
                    delete aggregateCriteria.rounds_won;
                    delete aggregateCriteria.level;
                    delete aggregateCriteria.max_score;
                    delete aggregateCriteria.dot_kills;
                    delete aggregateCriteria.count;

                    const filteredEvents = data.filter(event => checkCriteria(event, aggregateCriteria));

                    const totalAggregates = {
                        player_kills: 0,
                        time_alive: 0,
                        rounds_won: 0,
                        level: 0,
                        max_score: 0,
                        dot_kills: 0
                    };

                    filteredEvents.forEach(event => {
                        totalAggregates.player_kills += event.player_kills || 0;
                        totalAggregates.time_alive += event.time_alive || 0;
                        totalAggregates.rounds_won += event.rounds_won || 0;
                        totalAggregates.level += event.level || 0;
                        totalAggregates.max_score += event.max_score || 0;
                        totalAggregates.dot_kills += event.dot_kills || 0;
                    });

                    highlightValue = totalAggregates[achievement.highlight];

                    for (let key in achievement.criteria) {
                        if (typeof achievement.criteria[key] === 'object' && achievement.criteria[key].min !== undefined) {
                            achieved = totalAggregates[key] >= achievement.criteria[key].min;
                            if (key === achievement.highlight) {
                                progress = totalAggregates[key];
                            }
                        }
                    }
                } else {
                    const count = data.reduce((acc, event) => acc + (checkCriteria(event, achievement.criteria) ? 1 : 0), 0);
                    achieved = count >= achievement.count;

                    if (achievement.criteria.consecutive_days) {
                        if (consecutiveDays >= achievement.criteria.consecutive_days.min) {
                            achieved = true;
                        }
                    }

                    // FIX BUG 5: Filter data by "Context" first to find true Best Score
                    // We copy the criteria but REMOVE the requirement for the highlight stat.
                    // Example: If criteria is { game_mode: 2, kills: 25 }, we want to find 
                    // max kills in { game_mode: 2 } even if kills are only 10.
                    const contextCriteria = { ...achievement.criteria };
                    if (achievement.highlight && contextCriteria[achievement.highlight]) {
                        delete contextCriteria[achievement.highlight];
                    }
                    delete contextCriteria.count; // Ensure count doesn't interfere

                    // Filter games that match the mode/map, then find the max value
                    const validGames = data.filter(event => checkCriteria(event, contextCriteria));
                    highlightValue = validGames.reduce((max, event) => Math.max(max, event[achievement.highlight] || 0), 0);
                    
                    progress = highlightValue;
                }

                const criteriaMin = achievement.criteria[achievement.highlight] && achievement.criteria[achievement.highlight].min 
                                    ? achievement.criteria[achievement.highlight].min 
                                    : achievement.count;

                return {
                    rank: achievement.rank,
                    achieved: achieved,
                    criteria: achievement.criteria || {},
                    description: achievement.description,
                    value: rankDetails[achievement.rank].value,
                    highlightValue: highlightValue,
                    progress: progress,
                    criteriaMin: criteriaMin
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
    // Check if data is valid before proceeding
    if (!user_data || user_data.length === 0) return;

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
