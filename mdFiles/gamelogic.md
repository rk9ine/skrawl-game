


# Skribbl.io-Style Real-Time Drawing Game (React Native) – Functional Specification for Amazonian

## Gameplay Overview and Roles

* **Game Objective:** Players participate in a real-time drawing and guessing game. In each turn, one player is the **artist** (drawer) who draws a word, and all other players are **guessers** trying to guess that word. Points are awarded based on correct guesses and drawing success, and after the allotted rounds the player with the highest score wins.
* **Public vs. Private Modes:** The game supports both public matchmaking and private rooms:

  * *Public games* auto-match players (up to 8 per lobby) with default settings (e.g. \~80-second draw time, 3 rounds). Players can join a public game at any time, even mid-game, filling in for open spots.
  * *Private games* are player-hosted lobbies with a custom invite link. The host can configure game settings (rounds, draw time, etc.) and must manually start the game when ready. Private lobbies allow more players (up to 20) and optional custom word lists. Players can chat in the lobby before the game begins.

## Turn Cycle and Round System

* **Round Structure:** A match consists of a set number of rounds (configurable, e.g. 3 rounds by default). In **each round**, every player gets one turn as the artist in sequence. By the end of a full round, all players will have drawn once.
* **Turn Sequence:** At the start of the match (round 1), determine a turn order (e.g. based on join order or random shuffle). The turn cycle proceeds through this player list:

  1. **Begin Turn:** The next player in order becomes the artist (drawer) for the turn. All other players are guessers.
  2. **Word Selection:** The artist is prompted to choose a secret word from 3 options provided by the game (displayed only to them) or a custom word list if in use (details below). A short timer (e.g. 5–10 seconds) is given for selection. If the artist doesn’t choose in time, the game auto-selects a word to avoid delays.
  3. **Reveal Word Length:** Once a word is chosen, all guessers see a series of blanks/underscores representing the letters of the word (e.g. `"___  ____"` for a two-word phrase). The round timer (drawing/guess phase timer) then starts (e.g. 80 seconds in public games).
  4. **Drawing Phase:** The artist draws clues on the canvas in real-time. Guessers begin typing guesses into the chat. The artist can see players’ guesses but typically cannot communicate the word directly (chat filtering prevents this – see anti-cheat logic). The artist’s goal is to illustrate the word within the time limit so others guess it.
  5. **Guessing Phase:** Guessers can submit text guesses at any time during the turn. If a guess matches the secret word, it’s considered a correct guess (handled immediately – see Chat & Guessing logic below). Guessers have unlimited attempts, but a rate-limit can be applied to prevent spam (e.g. a guess per second).
  6. **Hint Reveal:** As the turn timer runs down, the game may auto-reveal hints. If a **hints setting** > 0 is configured, the system reveals a certain number of letters in the word progressively. For example, with 2 hints set on an 80s turn, one random letter might be revealed after \~40s, and another after \~60s. Revealed letters appear in the blank pattern for all players. (If hints = 0, no letters are revealed automatically.)
  7. **Turn End Conditions:** A turn can end in one of two ways:

     * **Time Up:** The drawing timer expires (no more guessing allowed). The turn ends normally.
     * **All Guessed Early:** If all active guessers guess the word correctly before time runs out, the turn ends immediately to move on (no need to wait idle).
* **After Turn End:** Reveal the word to all players (especially if some didn’t guess it). Update scores for that turn (see Scoring). The next player in turn order becomes the artist for the new turn (or next round). If the round is complete (everyone has drawn once), increment the round counter and continue until all rounds are done.

## Player Joining & Leaving (Mid-Game Behavior)

* **Joining Before Game Start:** Players who join a lobby (public or private) before the game has started are added to the player list. In a private room, they appear in the lobby player list and can chat while waiting. The host may wait for a minimum number (e.g. 2) before starting.
* **Mid-Game Joins:** The game allows players to join in the middle of an ongoing match (both public matches and private lobbies with the link). New joiners entering mid-game are handled as follows:

  * They are added to the current game’s player list and can immediately participate as guessers on the current turn (they receive the current drawing canvas and can start guessing upon joining).
  * A mid-game joiner starts with 0 points. They will only take a turn as the artist if there are remaining turns in the current round or in subsequent rounds. If they join in the middle of a round that had a preset turn order, you may either **insert** them into the turn rotation at the end of the current round or simply include them from the next round onward for drawing turns. (They won’t retroactively get turns for rounds that occurred before they joined.)
  * Example: In Round 2, Player A is drawing and a new Player N joins. Player N can guess immediately in Round 2. When determining who draws next: if A was followed by B, C, etc., you could either let the existing order (B, C…) finish Round 2 and have N wait until Round 3 for their first drawing turn, or append N to draw after the current players in Round 2. Choose a consistent rule to avoid confusion. (A safe approach is to add new players to the **end of the current round’s turn order** so they get a turn this round after those who haven’t drawn yet, if any, or ensure they will draw starting next round.)
* **Player Leave/Disconnect:** When a player leaves the game (intentionally or due to disconnect), handle it immediately:

  * Remove them from the player list and broadcast a `playerLeft` event/notification to others. Visibly update the UI’s player roster.
  * **If the leaving player was the current artist:** Immediately end that turn. No one gains points for that interrupted turn (since the word cannot be completed). Reveal the word to everyone for closure, then proceed to the next turn with the next player as artist. (The departing artist’s turn is effectively skipped.)
  * **If the leaving player was a guesser:** Simply remove them. If they had already guessed the word correctly in the turn, consider how to handle scoring – typically their points for that turn remain earned. If a guesser leaves mid-turn, it doesn’t affect the turn flow for others except their absence.
  * Adjust turn order for future turns: if a player who was scheduled to draw later leaves, skip over them when their turn would have come.
  * **Rejoining:** (Optional logic) If a player refreshes or drops and rejoins quickly, treat them as a new joiner (their score resets to 0 unless you implement an ID-based reconnection logic). In private games, the host might reinvite or the same link can be used to rejoin.

## Game Start and End Rules

* **Game Start (Private):** In a private lobby, the host controls when to start the game. Once the host clicks “Start”, the game becomes active and no new players can join via link *during the brief moment of game initialization* (to avoid late joins exactly at start). All players are moved from the lobby screen to the gameplay screen. Ensure at least 2 players are present; if the host tries to start with fewer, the UI should prevent it (since one person can’t play alone meaningfully).
* **Game Start (Public):** Public games typically start automatically once a lobby has enough players or at a scheduled interval. Often, public lobbies are continuous – new players may be entering and leaving, and the game just keeps cycling rounds. If a public lobby needs to start fresh (e.g. after a previous game ended), it might wait until a few players are gathered then begin a new match automatically. There’s no “host” in public mode; the server orchestrates the start when conditions are met.
* **End of Game:** A game concludes after the configured number of rounds have been completed (i.e., every player has drawn in each round). End-of-game logic:

  * Display the **final scores** and perhaps highlight the winner(s). For example, show a scoreboard listing players and their total points, and announce “Player X wins!” if they have the highest score.
  * In private games: provide an option for the host (and/or players) to **play again** or **restart**. The host could be given a “Restart Game” button that either reuses the same settings for another match with the same group, or allows changing settings and then starting a new game. If players want to leave, they can, and new players could be invited before the next start.
  * In public games: often the lobby will automatically start a new game after a short break (a few seconds showing the final scores). The same group of players (minus any who left) will roll into a new match seamlessly. New players can join in between matches as well. Ensure that the score is reset for the new match.
* **Edge Cases for Game End:**

  * If almost all players leave such that only 1 player remains, the current game cannot meaningfully continue. In public mode, you might wait for more players to join to continue the rounds (pausing until at least 2 players are present), or end the game early due to lack of players (declaring the remaining player winner by default). In private mode, if everyone but one leaves, the last player could choose to end the game or wait for others.
  * If a game ends in a tie for first place, simply show multiple winners or indicate a tie on the scoreboard (no tiebreaker in classic skribbl.io; players just share the top score).

## Word Selection and Hint Mechanics

* **Word Pool:** The game maintains a list of possible words (the “word bank”). In public games, this is the default word list for the chosen language (e.g. English word bank if the lobby is set to English). In private games, the host can opt to use the default word list of a selected language or provide custom words (see Custom Words section).
* **Choosing a Word:** At the start of an artist’s turn, the server selects three candidate words from the active word pool and sends them to the artist client. The artist sees these three options (e.g. \[✏️ Word A] \[✏️ Word B] \[✏️ Word C] buttons) and must pick one within a short time (ideally 5 seconds).

  * The choices are typically of varying difficulty (skribb.io often provides a mix of easy, medium, hard words). You may implement difficulty by word length or rarity. This is optional – at minimum, just random choices are fine.
  * **Auto-Select Timeout:** If the artist doesn’t choose a word in the given time, the system will automatically choose one of the three for them to keep the game moving. This prevents stalling due to AFK or indecision.
* **Secret Word Handling:** Once chosen, the secret word is known to the server and the artist, but **not** revealed to guessers. The server should *not* broadcast the actual word to other clients. Instead, broadcast only the pattern (underscores for letters, spaces for word gaps) and the length of the word to all guessers, along with a notification like “Player X is drawing…” so they know who is the artist.
* **Hint System (Letter Reveals):** If hints are enabled (configurable number of hints 0–5 in private settings, default in public might be 1 or 2):

  * The turn timer is used to schedule hint reveals. For example, with 2 hints in an 80-second turn, you could reveal one letter at 40s remaining and another at 20s remaining. The reveal should choose a random unrevealed letter in the word and fill it in (replacing the corresponding underscore on all players’ screens).
  * Ensure not to reveal the very first letter too early if you want to maintain challenge, or avoid revealing all instances of a letter at once (often, if a letter repeats, revealing it fills all occurrences of that letter).
  * Update the displayed pattern for guessers in real-time as letters are unveiled.
  * If hints = 0, no automatic letters are given; players rely entirely on the drawing.
* **Displaying the Word (End of Turn):** When a turn ends (due to timer or all guesses), reveal the full word to everyone in the chat or UI (e.g. “The word was: **APPLE**”). This helps players learn what it was if they didn’t get it. Do this *after* the timer runs out or all have guessed, never during.
* **Word Validation:** When a word is chosen (either by player or auto-pick), validate it:

  * It should conform to expected format (e.g., only alphabetic characters and spaces/hyphens if you allow multi-word or hyphenated words). No offensive words should ever appear here – ensure the word bank excludes profanity.
  * If using custom words, handle any edge cases (extra-long words, etc. – see Custom Words section for limits).

## Scoring System (Guessers & Drawer)

* **Guessers’ Points:** Guessers earn points when they guess the correct word. The faster they guess relative to others and the time remaining, the more points they receive. Key aspects:

  * The first player to guess correctly in a turn receives the highest points for that turn, with subsequent correct guessers receiving progressively lower points. This creates a race to be first.
  * Points can be scaled by the timer – e.g. a guess early in the turn (lots of time left) yields more points than guessing with only a few seconds left. The game might calculate guesser points as a function of remaining time proportion. *(For example, if the max points per turn is 100 for a correct guess, a player guessing at half the timer might get \~50 points. The exact formula can be tuned as needed.)*
  * All players who eventually guess the word before the turn ends get some points (unless perhaps they guess in the final moments where points might bottom out at a minimum). The last person to guess (if everyone guesses correctly) will get the least points among them.
  * Incorrect guesses yield **0 points** (and do not penalize the player except lost opportunity and time). There is no point deduction for wrong guesses in skribbl.io.
  * Unlimited guesses: Players are not limited in attempts, so guessing often doesn’t reduce your score *except* that it may take you more time to find the answer. The number of guesses made does not directly lower points (only the timing of the correct guess matters).
* **Drawer’s Points:** The artist (drawing player) also earns points if their word is guessed by others.

  * The drawer gets points based on how many players guessed their word correctly *and* how quickly the word was guessed overall. Generally, the more people who guess the word (and the sooner they do so), the higher the drawer’s score for that turn.
  * For example, if all other players guess the word and they do it with plenty of time left, the drawer gains a significant number of points (indicating they drew well). If only a few players guess it, or it took almost the entire time, the drawer’s point reward is smaller. If nobody guesses the word by the end, the drawer gets 0 points.
  * If the drawer **left or was skipped** before the turn finished, nobody (including the drawer) gets points for that round.
* **Score Updates:** After each turn, update the cumulative scores:

  * The server should keep track of each player’s total score across rounds. When a guesser scores points or a drawer scores, add those to their total.
  * Emit an event or include in the turn-end event the points earned by each player that turn, so the clients can update the scoreboard UI.
  * The scoreboard can be visible at all times (e.g. a sidebar list of players & scores updating live) or at least shown at the end of each round and end of game.
* **End of Game:** Determine the winner by the highest total points after all rounds. In case of a tie, multiple winners can be declared. This is just for display; the game doesn’t require tie-breakers unless you choose to implement some (usually not needed).

## Chat and Guessing System (Filtering & Anti-Cheat)

* **Guess Input and Validation:** Each guesser has a chat input box to submit guesses. The guess flow:

  * A player types a word and hits enter (or send). This sends a `guess` event with the guess string to the server.
  * The server compares the guess (case-insensitive, trimming whitespace) to the secret word.

    * If it **matches exactly**, it’s a correct guess. The server should mark that player as having guessed correctly for this turn and emit a notification to all players (e.g. `playerGuessed` event). The guessed word itself should **not** be revealed in the chat to others at that moment, to prevent giving it away.
    * If the guess is **incorrect**, the server can broadcast the guess to all players’ chat feeds as a normal message from that player. (Seeing wrong guesses can be part of the fun and clue others in what it is not.)
  * **Multiple Guesses:** Players are allowed multiple guesses until they get it right. However, implement a slight **rate limit** on guesses to prevent spam or brute-force cheating (e.g. a player can submit at most \~1 guess per second). If a player exceeds this, you can ignore or delay additional guesses.
* **Chat Message Display:**

  * For a wrong guess: Show it in the chat log for all players, prefixed with the player’s name (e.g. “Alice: Banana?”).
  * For a correct guess: Do **not** show the actual guess word. Instead, broadcast a system message like “**Alice has guessed the word!**” to all players. Mark Alice as correct (in UI, maybe Alice’s name could turn green or a checkmark appears).
  * Once a player has guessed correctly, they typically should no longer influence the guessing for others. In Skribbl.io, once you guess right, your further chat messages are hidden from players who haven’t guessed yet (to prevent sharing the answer). You can implement this by:

    * Either disabling the chat input for players who have already guessed the word until the turn ends (simplest approach – they just wait out the turn).
    * Or allow them to chat but segregate the chat: messages from correct guessers only appear to other correct guessers or the drawer. This is more complex and can be skipped in an initial implementation.
  * The drawer can see all guesses (marked correct or not) and who has guessed the word.
* **Anti-Cheat Chat Filters:**

  * **Secret Word in Chat:** The game should prevent the secret word from being blatantly given away via chat. If any player (drawer or guesser) attempts to send a chat message that contains the exact secret word (or a very close variant), the message should be blocked or masked. For example, if the word is “APPLE” and someone types “It’s apple”, do not broadcast that. (In practice, guessers wouldn’t do this because that would just count as a guess; the main concern is the drawer or a player who already guessed trying to feed the answer.)
  * You can implement a check: if a chat message (non-guess, or from drawer) contains the secret word substring, do not send it. Possibly send a system warning to that user like “You cannot reveal the word!”.
  * **Profanity and Swear Words:** Use a profanity filter on chat messages. Any message containing blacklisted words should either be refused or sanitized (e.g. replace with “\*\*\*”). This keeps the game environment clean, especially in public games. The filter list can cover common insults, racial slurs, etc.
  * **Excessive Spam:** If a user is spamming irrelevant or repeated messages rapidly (not guesses, just chat), consider throttling those as well or implementing a simple mute or votekick feature (see AFK/Moderation below).
* **Guess Feedback (“Close” guesses):** *(Optional enhancement)* If a guess is nearly correct (for instance, plural vs singular, or off by one letter), the game could give a subtle feedback to that guesser like “(close!)” – but not broadcast to everyone. This can be done by comparing the guess to the secret word and if the Levenshtein distance is 1 or the guess is the secret word plus or minus an “s”, etc., send a private notice. Skribbl.io sometimes indicates “close” for guesses that are on the right track. This is an optional feature for user experience.
* **Votekick/Vote-Skip System:** In public games (or large private games), provide a mechanism for players to initiate a vote to kick or skip a player who is misbehaving (drawing offensive content, writing the word, or AFK):

  * Each player can press a “votekick” button next to a player’s name (often an icon in UI). This casts a vote to remove that player.
  * If a certain threshold of votes is reached (for example, >50% of active players), the targeted player is kicked from the lobby immediately. Announce in chat if someone is votekicked (“Player X was kicked by vote.”).
  * You may restrict that only guessers can votekick the current drawer (to prevent self-voting or weird cases).
  * Alternatively or additionally, a “**skip turn**” vote could be allowed specifically for skipping the current drawer’s turn (without kicking them out of the game). If the majority of players vote to skip during a drawing turn (perhaps because the drawer is idle or scribbling nonsense), then end the turn early. No points are awarded if skipped, and reveal the word. The turn moves to the next player.
  * **Host moderation (private games):** In private lobbies, the host may have direct control to kick a player (without a vote) since it’s their room. This can be done via a “kick” button for the host on each player in the lobby or in-game.

## Drawing Tools and Canvas Interaction

* **Canvas Overview:** The drawing canvas is a shared whiteboard where the current artist can draw and all players see updates in real time. The canvas starts blank at the beginning of each turn (or is cleared automatically when a new word is chosen).
* **Tools Available to the Artist:** Common drawing tools should be provided in the UI:

  * **Brush/Pencil:** The default freehand drawing tool. The player can draw continuous lines by dragging their finger on the screen. The app should capture the stroke’s points (e.g. as a series of coordinates) and send them via WebSocket to the server, which then broadcasts these points to all other clients to render the line. To optimize, it can send batches of points or simplify the path if needed.

    * **Brush Size:** Allow the artist to select a stroke thickness (e.g. small, medium, large brush). This setting is included in the drawing data so that strokes are rendered with the correct width on all clients.
    * **Color Palette:** Provide a palette of colors for the brush. When the artist selects a new color, subsequent strokes use that color. The color choice can be conveyed either implicitly (if the artist’s client just sends colored pixels/lines) or by sending a color code along with draw events (e.g. `{ color: "#FF0000", points: [...] }`). All clients should apply the same color to the incoming strokes.
  * 
    
  * **Fill (Bucket) Tool:** *(Optional)* Fills a contiguous area with a selected color, like paint bucket. If implemented, when the artist taps the fill tool and then taps the canvas:

    * On the artist’s client, perform a flood-fill algorithm from that point, replacing the area’s color with the chosen color.
    * Broadcast the fill action to others, either by sending the fill start point and color and letting each client replicate the fill (ensuring they have the same pre-fill state), or by sending the resulting shape/bitmap difference.
    * Caution: Implementing fill reliably in real-time can be challenging. Many skribbl.io clones forego a fill tool. It can be added if feasible, but ensure consistency (all clients must end up with identical canvases).
  * **Undo:** Skribbl.io itself does not provide an “undo” for the artist (to keep it challenging), so we can omit this. The artist must use the eraser or clear if they want to remove something. (You can note this as a design choice – simpler and aligns with original game.)
  * **Clear Canvas:** A trash-bin or “clear” button that allows the artist to wipe the canvas entirely to start over. If clicked, confirm once (to avoid accidental clears). Then broadcast a canvas clear event to all players so everyone resets their canvas to blank.
* **Real-Time Drawing Data:** Use WebSockets to send drawing commands efficiently:

  * When the artist draws, stream the stroke data to the server which relays it. For example, as the user drags, the client could send a stream of points. To reduce network load, sample the points (e.g. send every few pixels or on each animation frame). Each message can include tool settings like current color and size.
  * Alternatively, accumulate points for a short duration (like 50ms) then send in one batch for efficiency. Clients receiving these should interpolate or draw lines between consecutive points to render the stroke smoothly.
  * The data format might be something like: `{ tool:"brush", color:"#000000", size: 4, path: [[x1,y1],[x2,y2],...] }` for a stroke segment, or `{ tool:"clear" }` for a clear action, etc.
  * The goal is that all players’ canvases mirror the artist’s drawing in real time with minimal lag.
* **Client Rendering:** On receiving drawing events, each guessing client draws the content on their canvas component. Use a canvas API or drawing library in React Native (e.g. an <Canvas> component or SVG paths) for rendering lines and shapes. Ensure that drawing commands are applied in the order received.
* **Access Control:** Only the current artist is allowed to draw. The UI should disable drawing tools for all non-drawing players. Guessers just see the canvas but cannot interact with it (except perhaps to pan/zoom if you allow that, but generally it’s static).
* **Canvas State Sync:** If a new player joins mid-turn, or if a player’s app refreshes, they need the current canvas state:

  * One approach is to have the server keep a history of drawing actions for the ongoing turn (a buffer of strokes). On new join or reconnect, send the backlog of drawing events to that client to catch them up.
  * Alternatively, periodically send a snapshot (image data) of the canvas. But that’s heavy on bandwidth, so the incremental stroke history is preferred.
* **Mobile UI Considerations:**

  * The canvas should be touch-responsive with drawing smoothness in mind. Use gestures to capture drawing strokes (pan gestures with no scrolling).
  * Provide buttons or toggles for tools that are touch-friendly (e.g. a toolbar at the bottom or side with larger icons for finger input).
  * Color palette can be a scrollable row or a popup grid for selection, given mobile screen size.
  * Make sure drawing with a finger is calibrated (consider some smoothing, as finger drawing can be jittery).
  * If using React Native, libraries like `react-native-sketch-canvas` or similar can help with capturing draw input and producing paths.

## Profanity Filtering and Word Validation

* **In-Game Chat Filtering:** As mentioned, implement a profanity filter on all chat/guess messages. Maintain a list of banned words/phrases (common swear words, hate speech, etc.). When a player sends a chat message or guess:

  * Check against the profanity list. If the message contains a blacklisted term, replace those characters with asterisks (or a similar mask) before broadcasting, or simply do not broadcast that message. (If it was a guess, you might still want to show something like “\*\*\*” in place of the banned word, so the guesser doesn’t get an advantage by essentially saying something not allowed).
  * This filtering ensures the chat remains clean, particularly important if the game can be played by all ages.
* **Username Filtering:** (Optional) It’s wise to also filter player names on creation. If someone tries to join with a profane or offensive name, either reject it or anonymize it. This prevents bad words from showing up in the player list or chat via usernames.
* **Default Word Bank Sanitization:** Ensure the default drawing word list contains no profanities or inappropriate terms. Skribbl.io’s word list is curated; do the same for yours. Words should be generally family-friendly (unless you decide to have an adult mode, but that’s beyond scope).
* **Custom Words Validation:** When a host enters custom words for a private lobby, run those through validation:

  * Remove any words that are in the profanity list (or at least warn the host that such words are not allowed).
  * Enforce the length constraints: each custom word entry should be between 1 and 32 characters. Strip extra whitespace. If something is outside this range or extremely long, reject it or trim it.
  * Enforce the count constraints: typically at least 10 custom words are required to start a game (to ensure enough variety). If the host provided fewer, disable the start button and prompt them to add more.
  * Total characters limit (for all custom words combined) might be large (the wiki mentions up to 20,000 characters total allowed in the custom words field) – this is to allow many words if desired. In practice, you can set a reasonable limit (the UI text box can impose a max length).
  * After validation, these words form the word pool for that game (if custom words mode is enabled).
* **Word Selection Edge Cases:** If a chosen word (from either default or custom list) somehow contains disallowed content or formatting issues, have a fallback:

  * Remove or replace problematic characters (you might allow hyphens or apostrophes in certain phrases; decide on a consistent allowed character set).
  * If the word list is user-provided and contains an invalid entry, it might be simplest to just skip those entries when generating choices.
* **Image/Drawing Profanity:** (Beyond text) Obviously, players could attempt to draw inappropriate images. Automated detection of drawing content is extremely complex and out of scope. Instead, rely on player moderation (votekick) to handle that. We mention it here for completeness: ensure the UI has an easy way for players to kick someone who is drawing NSFW or offensive imagery.

## AFK Detection and Disconnect Handling

* **AFK (Away From Keyboard) Monitoring:** The game should detect and handle inactive players to keep rounds flowing:

  * **During Word Selection:** If a player is the artist and fails to pick a word in time (likely because they are absent), the auto-select as described will choose for them. If they continue to be idle (not drawing anything), consider penalizing or skipping as below.
  * **During Drawing:** If the artist isn’t drawing at all (no strokes sent) for an extended period (e.g. 20–30 seconds into the turn and zero activity), that’s a sign they might be AFK. Options to handle:

    * Display a warning to the artist (if they are there but not drawing, nudging them to start).
    * Allow guessers to invoke a skip vote or votekick if the artist remains idle.
    * Potentially auto-skip the turn if absolutely no drawing occurs for half the turn time. For example, if after 40 seconds of an 80-second turn there have been no draw events, the server could automatically end the turn (treat as nobody guessed, 0 points, reveal word).
  * **Guessers AFK:** If some players are not guessing or interacting at all for multiple rounds, you might want to remove them for being idle. For instance, if a guesser hasn’t made any guess or chat in say 2 whole rounds, and is not responding, assume they left the device. You could auto-kick after a warning (e.g. send “Are you there?” prompt, if no response, remove them). This ensures open slots for new active players.
* **Disconnect Handling:**

  * Distinguish between a deliberate leave and a sudden disconnect (though functionally they result in removal). If a disconnect is detected (e.g. lost WebSocket), treat it as the player leaving as described in Player Leaving section.
  * If the disconnected player was currently drawing, immediately end that turn as noted. If they had chosen a word but then disconnected mid-turn, reveal the word and no one gets points (since the drawer is gone, guessers couldn’t finish).
  * If the disconnected player was supposed to draw later this round, skip them when their turn comes.
  * Ensure that the game can continue if a disconnect happens at critical moments. The turn timer should be cleared or stopped for that turn if the artist is gone, and then restart fresh for the next artist.
* **Reassignment of Host:** In a private room, if the host (room creator) disconnects or leaves mid-game, the game can still continue with remaining players. However, certain host privileges need to be transferred:

  * Choose a new host (perhaps the next player in join order or randomly among remaining). This new host would have the ability to start a new game after the current one, change settings, or kick players if needed. You can determine host by keeping a flag on one player; if that player leaves, promote another (e.g. the next in the player list).
  * Notify players if the host changed (“Host left – Player Y is now the host.”).
* **Handling One Player Left:** As mentioned, if all but one player leave, the last player can’t continue playing alone. In a private game, you might automatically end the game early (showing final score). In a public game, you might hold the game in a waiting state or end and reshuffle. It’s acceptable to end the match if only one player remains.
* **Session Persistence:** (Optional advanced) If you want to get fancy, you can allow a short window where if a player disconnects accidentally (e.g. app crash) and rejoins within a minute, they reclaim their spot and score. This requires tracking player IDs or tokens. This is not mandatory, but it improves user experience in case of connection issues.
* **Graceful Shutdown:** If for any reason the match must end early (e.g. server issues or host decision), ensure all clients are notified. Show a message like “Game ended” and return them to lobby or main menu safely.

## Private Room Host Mechanics

* **Lobby Settings UI:** In a private game lobby (before start), the host has access to a settings menu to configure the match parameters:

  * *Max Players:* Set the player limit (2–20) for the room. This controls how many can join via the link.
  * *Language:* Choose the word list language (if not using custom words). This will load the appropriate default word bank (e.g. English, Spanish, etc.). All players should ideally know what language is set (display it).
  * *Draw Time:* Select the time limit for each turn, e.g. from 30 seconds up to 240 seconds. Common choices might be 60, 80, 90, etc. seconds.
  * *Rounds:* Set how many rounds (2–10) the game will have. More rounds means a longer game.
  * *Word Mode:* (If supported) Skribbl.io introduced modes like *Normal* vs *Hidden* vs *Combination*. For simplicity, you may stick to *Normal* (single words or phrases). Hidden might mean no hint underscores shown (or something similar), and Combination means two words fused (like “apple+tree” as a single prompt). You can choose to implement these modes or ignore this setting in your version.
  * *Word Count:* (Related to mode) The maximum number of words in a phrase (1–5). For normal mode, it could be up to 2 or 3 by default. This setting is advanced and can be automatically handled by word list (i.e., allow multi-word phrases).
  * *Hints:* Set how many letter hints will be revealed during each turn (0 to 5). The default might be 1 or 2. This affects the hint timing logic as described.
  * *Custom Words:* The host can enter a list of custom words or phrases, separated by commas, if they want to use their own words. There should be a toggle or option like “Use custom word list (instead of default)”. When enabled, the game will draw words only from the host’s list.
  * All these settings should be presented clearly in the UI and only editable by the host. Other players in the lobby can see the chosen settings (for transparency).
* **Starting the Game:** The host has a “Start Game” button available in the lobby. Once clicked:

  * Validate settings (e.g. at least 2 players, custom words count valid if that mode is on). If something is not valid, prevent starting and show an error to host (e.g. “Need at least 10 custom words to start”).
  * If valid, emit an event to all players that the game is starting (so clients can transition to the game screen and lock in the settings).
  * Lock the settings for the duration of the game (no changes mid-game).
  * Also, consider locking entry: you may disallow new players from joining *mid-round 1* for a private game if you want everyone to start together. However, the current skribbl.io **does** allow mid-game joins even in private (they just join late). It’s up to design – you can allow late joins as discussed.
* **Host Abilities In-Game:** During the game, the host plays like any other player (draws and guesses). They don’t have extra powers that affect gameplay except:

  * They might retain the ability to kick players from the room (for example, if someone disruptive joined via link). Provide a small UI to the host (like a “kick” button next to each name). Kicking a player should immediately remove them from the game and prevent rejoin (unless the host’s link is used again, you might need a way to ban or just trust the host’s discretion).
  * The host could also be given the power to manually end the game if needed (this is rarely used, but a “End Game” button for host could terminate the match prematurely).
* **Game Restart:** After a game ends, in a private room, everyone is taken back to a result/lobby state. The host can choose to play again with the same group:

  * They can either hit “Restart” which uses the same settings and starts a new game immediately.
  * Or adjust some settings (maybe increase rounds, or swap word list, etc.) and then start again.
  * Players can leave the room at this point if they don’t want to continue; the host might wait or invite new ones before the next start.
* **Persistence:** If the host leaves the game entirely (closes app), as mentioned, the room should designate a new host so the game can continue and someone can start a new round. If the host leaves before starting the game (in lobby), perhaps the room dissolves or one of the remaining gets host. It might be simplest to require the host to be present to start; if host leaves lobby, you could just auto-assign new host or ask everyone to rejoin a new room.

## Custom Word List Support (Private Games)

* **Custom Words Input:** In private lobby settings, the host can enable custom words and provide a list. Typically this is a multiline text area or a comma-separated input field. The host enters words/phrases separated by commas (e.g. `apple, cat, New York, Eiffel Tower`). The UI should show instructions/limits (e.g. “Enter at least 10 words, separated by commas”).
* **Validation & Limits:** Enforce the rules on this input:

  * Minimum 10 entries (to ensure enough variety).
  * Each entry 1–32 characters. Trim spaces around each entry; allow spaces within an entry for multi-word phrases.
  * Disallow any entry that is blank after trimming, or duplicates (you might allow duplicates but it’s better to have unique words).
  * Remove or flag any profane or disallowed words (using the profanity filter list).
  * There could be an overall character limit (the wiki says max \~20000 chars for the whole field), which is plenty. This is mostly to prevent excessively large inputs from crashing anything.
* **Usage in Game:** If custom words are enabled:

  * The game should draw all word choices from this list *exclusively* (assuming the host intends to play only with their words). That means for each turn’s 3 options, randomly pick 3 from the custom list.
  * Optionally, you could still allow mixing with default words (some games have a “use custom words 50%” option). If implementing that, you’d have a slider or toggle for “Mix with default words”. For simplicity, you can decide that if a custom list is provided, it overrides the default completely (the phrasing “use custom words instead of default” suggests exclusive use).
  * Make sure the random selection doesn’t keep picking the same few words over and over. One strategy: shuffle the custom list at game start and cycle through it. Or keep track of used words to avoid immediate repeats. If the list is smaller than the total number of drawing turns, repeats will be necessary at some point, but try to spread them out.
  * If the custom list is extremely short relative to game length (say only 10 words but 30 turns are needed), you will inevitably repeat words. It might be wise to notify the host if the list may be too short for the chosen rounds/players (e.g. “You have 10 custom words but the game will need 24 words; words will repeat.”).
* **Client Indication:** It’s helpful to inform all players that custom words are in play, so they know the theme or source might be specific. For example, display a label “Custom word list active” in the UI. This manages expectations (players might realize the words could be uncommon or tailored).
* **No Hints for Unknown Words:** One downside with custom words is that players might not have any idea of them if they’re very specific. Hints (letter reveals) still apply as configured. The game logic doesn’t change, but just ensure the hint revealing works for any word provided.
* **Security Consideration:** Since custom words come from users, if the game is not moderated, some could be offensive. We rely on the profanity filter to catch obvious bad words. Ultimately, in a private room, the host likely shares words appropriate for their group. But your system should still sanitize them (which we do via validation).
* **Examples:** If the host enters custom words like `Dog, Cat, New York City, Elon Musk`, the game will only use these four. If 8 players and 3 rounds (24 turns) were configured, these 4 would repeat multiple times throughout unless more are added. It’s best in that case to encourage a larger pool.
* **Fallback to Default:** Optionally, if the host enables custom words but leaves the list empty or too small, you could fall back to using the default words to fill the gap. Or simply do not allow starting until requirements are met (preferred for clarity).
* **Multi-Word Phrases:** Ensure that multi-word entries are handled properly:

  * When displaying blanks to guessers, preserve spaces. E.g. “New York City” -> “\*\*\* \*\*\*\* \*\*\*\*”.
  * Guess checking should ignore spaces and case (so if the answer is multi-word, a guesser typing it with or without spaces/case should still count if it matches).
  * Hints might reveal letters across the whole phrase. Likely treat the phrase as one string for hint picking (ignoring spaces when choosing a letter to reveal).

* **Storage:** The custom list could be stored on the server side when the game starts (to use for word selection each turn). It could be transmitted to the server via the startGame event with the settings. Do not send custom words list to all players (it should remain secret except as words are chosen).

---

**Note:** The above specifications detail all major systems and logic needed to implement a Skribbl.io-style drawing & guessing game in React Native with WebSockets. The focus is on clarity and completeness of game mechanics so that a developer can map these to application state and socket events. By following this plan – covering turn management, real-time updates, scoring, and robust handling of user behavior – you can ensure a smooth and fun multiplayer experience.
