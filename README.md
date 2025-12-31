Run the below script in your console and it will start the plugin:

(function() { 
    const baseUrl = "https://raw.githack.com/andyman087/Achievements/main/";
    const scripts = [
        baseUrl + "config.js",  // 1. Load Settings & Categories first
        baseUrl + "data.js",    // 2. Load API Fetcher
        baseUrl + "logic.js",   // 3. Load Math & Calculations
        baseUrl + "visuals.js", // 4. Load UI & CSS
        baseUrl + "main.js"     // 5. Load Controller & Init
    ];

    function loadScript(url, callback) {
        const script = document.createElement("script");
        script.src = url + '?t=' + new Date().getTime(); 
        script.onload = callback;
        script.onerror = function() {
            console.error("Failed to load script: " + url);
        };
        document.head.appendChild(script);
    }

    function removeOldScripts() {
        const oldScripts = document.querySelectorAll('script[src*="Achievements/main/"]');
        oldScripts.forEach(script => script.remove());
        const oldBtn = document.getElementById('achievementButton');
        if(oldBtn) oldBtn.remove();
        const oldPopup = document.getElementById('achievementsPopup');
        if(oldPopup) oldPopup.remove();
    }

    function loadScriptsSequentially(scripts, index) {
        if (index < scripts.length) {
            loadScript(scripts[index], () => loadScriptsSequentially(scripts, index + 1));
        }
    }

    removeOldScripts();  
    loadScriptsSequentially(scripts, 0);  
})();



================================================================================
                       DEFLY ACHIEVEMENTS: CREATION GUIDE
================================================================================

This guide documents the complete architecture of the achievement system based on 
the config.js, logic.js, and data.js structure.

All achievement definitions exist solely in config.js inside the categories array.

--------------------------------------------------------------------------------
1. ANATOMY OF AN ACHIEVEMENT
--------------------------------------------------------------------------------
Every achievement is a JSON object with this specific structure:

{
    rank: 1,                          // 1=Bronze, 2=Silver, 3=Gold, 4=Master, 5=Grand Master
    count: 1,                         // How many times must the criteria be met? 
                                      // (Ignored if aggregate: true)
    highlight: "player_kills",        // Which stat determines the progress bar value?
    description: "Get 25 Kills",      // Text shown on the card
    criteria: {                       // The filters (See Section 2)
        game_mode: 1,
        player_kills: { min: 25 }
    }
}

--------------------------------------------------------------------------------
2. THE CRITERIA FILTERS
--------------------------------------------------------------------------------
The criteria object is the engine. It determines if a game (or a set of games) 
qualifies.

A. FILTERING METHODS
There are two ways to filter a specific statistic:

1. Exact Match
   Use this for fixed values like Game Modes or Kill Reasons.
   
   criteria: {
       game_mode: 2,      // Must be exactly Defuse mode
       kill_reason: 4     // Must be exactly a Victory
   }

2. Range Match (Min/Max)
   Use this for stats like Score, Kills, or Time. You can use min, max, or both.
   
   criteria: {
       player_kills: { min: 10 },        // At least 10 kills
       time_alive: { min: 60, max: 120 } // Between 60 and 120 seconds
   }

B. AVAILABLE VARIABLES (What you can filter by)
These are the raw variable names available from the Defly API and our data.js 
processor.

| Variable Name    | Description                               | Example Usage              |
|------------------|-------------------------------------------|----------------------------|
| game_mode        | The mode the game was played in.          | game_mode: 1 (Teams)       |
| player_kills     | Number of enemy players killed.           | { min: 50 }                |
| dot_kills        | Number of towers destroyed.               | { min: 1000 }              |
| max_score        | The highest score achieved in that game.  | { min: 25000 }             |
| time_alive       | Time survived in Seconds.                 | { min: 1800 } (30 mins)    |
| level            | Standard modes: Level reached.            | { min: 20 }                |
|                  | Defuse mode: Rounds Played.               |                            |
| rounds_won       | (Defuse Only) Number of rounds won.       | { min: 10 }                |
| win_rate         | (Defuse Only) % of rounds won (0.0 - 1.0).| { min: 0.5 } (50%)         |
|                  | Note: Internally maps to max_area.        |                            |
| kill_reason      | How the game ended (Died, Won, etc).      | kill_reason: 4 (Victory)   |
| map_percentage   | % of the map conquered.                   | { min: 50 }                |
| consecutive_days | Special Logic. Streak of daily plays.     | { min: 7 }                 |

--------------------------------------------------------------------------------
3. ACHIEVEMENT TYPES & LOGIC
--------------------------------------------------------------------------------
The extension supports three distinct logic types. The logic is handled in 
logic.js, but the Visual Filter Tab (Single/Multiple/Lifetime) is determined 
by the Name of the SubCategory in config.js.

TYPE 1: SINGLE GAME
-------------------
Logic:              Requires the player to achieve specific stats in one single 
                    match.
Config Requirement: count: 1
Criteria:           Do NOT use aggregate: true.
SubCategory Name:   Must start with "Single" (e.g., "Single Target - Kills").
Progress Bar:       Displays the user's Personal Best (High Score) for that 
                    specific stat.

TYPE 2: MULTIPLE GAMES
----------------------
Logic:              Requires the player to meet specific criteria in X separate 
                    matches.
Config Requirement: count: > 1 (e.g., count: 5).
Criteria:           Do NOT use aggregate: true.
SubCategory Name:   Must start with "Multiple" (e.g., "Multiple Games - Kills").
Progress Bar:       Displays the Count of qualifying games (e.g., "3 / 5").

TYPE 3: LIFETIME (AGGREGATE)
----------------------------
Logic:              Sums up stats from every game played that matches the filter.
Config Requirement: count: 0 (Count is ignored here).
Criteria:           MUST include aggregate: true.
SubCategory Name:   Must start with "Lifetime" (e.g., "Lifetime - Kills").
Progress Bar:       Displays the Sum Total (e.g., 10,500 / 25,000).

Example of an Aggregate Criteria:
This sums up all kills, but only counts kills that happened in Team Mode.

criteria: { 
    aggregate: true, 
    player_kills: { min: 1000 }, // The target sum
    game_mode: 1                 // The filter
}

--------------------------------------------------------------------------------
4. SPECIAL FEATURES & EDGE CASES
--------------------------------------------------------------------------------

THE "HIGHLIGHT" PROPERTY
------------------------
This property is required for every achievement. It tells the system: "Which 
number should I show on the progress bar?"

* If highlight: "time_alive" -> The system automatically converts the value 
  from Seconds to Hours (2 decimal places).
* If highlight: "max_score" -> The system rounds the number to a whole integer.

CONSECUTIVE DAYS
----------------
This is a unique logic block. It calculates the longest streak of days played.

{ 
    rank: 1, 
    criteria: { consecutive_days: { min: 3 } }, 
    highlight: 'consecutive_days', 
    count: 1, 
    description: "Play 3 days in a row" 
}

DEFUSE "WIN RATE"
-----------------
Defuse mode stores Win Rate in a non-standard way in the API. We handle this 
automatically.

* Usage: Use win_rate in your criteria.
* Values: Use decimals. 0.5 = 50%, 1.0 = 100%.
* Constraint: Pair this with level (rounds played) to avoid players playing 1 
  round, winning, and getting a 100% win rate badge undeservedly.

criteria: { 
    win_rate: { min: 0.5 }, 
    level: { min: 10 }, // Minimum 10 rounds played
    game_mode: 2 
}

--------------------------------------------------------------------------------
5. REFERENCE: ID LOOKUP TABLES
--------------------------------------------------------------------------------

GAME MODES (game_mode)
0: FFA
1: Teams
2: Defuse
3: E-FFA (Experimental)
4: 1v1

KILL REASONS (kill_reason)
0: Disconnect / Unknown
1: Bullet (Shot by player)
2: Wall (Crashed)
3: Player Collision (Crashed into player)
4: Victory (Winning team/player)