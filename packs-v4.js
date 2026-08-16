// Pack expansion v3 — exhaustive library push + cross-category links.
// Every entry cites a published reference (Wiktionary titles verified via the
// MediaWiki API on 2026-08-15; Wikipedia pages). No invented meanings.

const WIKT = (w) => ({
  sourceName: `Wiktionary — ${w}`,
  sourceUrl: `https://en.wiktionary.org/wiki/${encodeURIComponent(w)}`,
});
const WIKI = (title, page) => ({
  sourceName: `Wikipedia — ${title}`,
  sourceUrl: `https://en.wikipedia.org/wiki/${page}`,
});
const VG = WIKI('Glossary of video game terms', 'Glossary_of_video_game_terms');
const CORP = WIKI('Corporate jargon', 'Corporate_jargon');

// ---------------------------------------------------------------------------
// CROSS-CATEGORY LINKS for terms that already exist in the database.
// key: lowercase term as stored · value: extra categories it belongs to.
// ---------------------------------------------------------------------------
export const CROSS_LINKS = {
  // teen glossary terms that live in other worlds too
  'sus': ['gaming', 'texting'],            // Among Us origin; standard chat shorthand
  'npc': ['gaming'],                        // literal gaming term first
  'goat': ['texting', 'gaming'],            // GOAT debates happen everywhere
  'noob': ['teen'],                         // gaming term kids use as a general insult
  'afk': ['texting', 'teen'],               // used in chat far beyond games
  'gg': ['texting', 'teen'],                // "gg" after anything ends
  'ratio': ['texting'],                     // social/reply-thread mechanic
  'bot': ['gaming', 'coding'],
  'lit': ['texting'],
  'w': ['gaming', 'texting'],
  'l': ['gaming', 'texting'],
  'cooked': ['gaming'],
  'lag': ['coding', 'texting'],             // networking term, used figuratively
  'glitch': ['coding'],
  'meta': ['teen'],                         // kids say "that's so meta" / meta builds
  'grinding': ['teen', 'corporate'],        // "the grind" crosses worlds
  'rage quit': ['teen', 'texting'],
  'poggers': ['teen', 'texting'],
  'lol': ['teen', 'gaming'],
  'lmao': ['teen', 'gaming'],
  'brb': ['teen', 'gaming'],
  'fr': ['teen'],
  'ong': ['teen'],
  'pmo': ['teen'],
  'iykyk': ['teen'],
  'istg': ['teen'],
  'wyd': ['teen'],
  'hmu': ['teen'],
  'delulu': ['teen', 'texting'],
  'bandwidth': ['coding'],                  // literal networking origin
  'ping me': ['coding', 'texting'],         // network ping
  'ship it': ['corporate'],
  'dogfooding': ['corporate'],
  'technical debt': ['corporate'],
  'bus factor': ['corporate'],
  'bikeshedding': ['corporate'],
  'deep dive': ['coding'],
  'pwned': ['coding'],                      // hacker-culture origin
  'speedrun': ['teen', 'texting'],          // "speedran my homework"
  'skill issue': ['teen', 'texting'],
  'git gud': ['teen'],
  'sweaty': ['teen'],
  'tryhard': ['teen', 'texting'],
  'tfw': ['teen'],
  'pov': ['teen'],
  'irl': ['teen', 'gaming'],
  'otp': ['teen'],
  'dps': ['coding'],                        // perf jargon borrows it
  'rng': ['coding'],                        // random number generation is CS
  'mid': ['gaming', 'texting'],
  'buff': ['teen'],
  'nerf': ['teen'],
};

// ---------------------------------------------------------------------------
// NEW TERMS (all verified). `related` = extra categories beyond the home one.
// ---------------------------------------------------------------------------
export const PACK_TERMS_V3 = [
  // ---------------- TEXTING (18 new) ----------------
  { category: 'texting', term: 'BFF', emoji: '👯', difficulty: 'easy', related: ['teen'], definition: 'Best friends forever. Noun now — “she’s my bff.”', example: '“Movie night with the bff.”', tags: ['acronym', 'friends'], ...WIKT('bff') },
  { category: 'texting', term: 'BRT', emoji: '🏃‍♀️', difficulty: 'easy', definition: 'Be right there.', example: '“brt, grabbing shoes.”', tags: ['acronym'], ...WIKT('brt') },
  { category: 'texting', term: 'CYA', emoji: '✌️', difficulty: 'easy', definition: 'See ya. Goodbye.', example: '“cya tomorrow.”', tags: ['acronym', 'classic'], ...WIKT('cya') },
  { category: 'texting', term: 'DW', emoji: '😌', difficulty: 'easy', definition: 'Don’t worry.', example: '“dw, I got the tickets.”', tags: ['acronym', 'reassurance'], ...WIKT('dw') },
  { category: 'texting', term: 'FML', emoji: '😫', difficulty: 'medium', definition: 'F*** my life. Dramatic despair over minor misfortune.', example: '“Phone died at 1%, fml.”', tags: ['acronym', 'venting'], ...WIKT('fml') },
  { category: 'texting', term: 'FTW', emoji: '🏆', difficulty: 'medium', related: ['gaming'], definition: 'For the win. Enthusiastic endorsement — gaming origin, now general.', example: '“Cold pizza for breakfast ftw.”', tags: ['acronym', 'hype'], ...WIKT('ftw') },
  { category: 'texting', term: 'IKR', emoji: '🙌', difficulty: 'easy', definition: 'I know, right? Emphatic agreement.', example: '“That test was brutal.” “ikr!!”', tags: ['acronym', 'agreement'], ...WIKT('ikr') },
  { category: 'texting', term: 'IMY', emoji: '🥺', difficulty: 'easy', definition: 'I miss you.', example: '“imy, come visit soon.”', tags: ['acronym', 'affection'], ...WIKT('imy') },
  { category: 'texting', term: 'MFW', emoji: '😐', difficulty: 'hard', definition: 'My face when. Pairs with a reaction image/gif; cousin of TFW.', example: '“mfw the teacher says pop quiz.”', tags: ['acronym', 'meme'], ...WIKT('mfw') },
  { category: 'texting', term: 'NBD', emoji: '😏', difficulty: 'easy', definition: 'No big deal. Often ironic humble-brag.', example: '“Aced it without studying, nbd.”', tags: ['acronym'], ...WIKT('nbd') },
  { category: 'texting', term: 'NSFW', emoji: '🚫', difficulty: 'medium', definition: 'Not safe for work — content you shouldn’t open around others. A warning label parents should know.', example: '“Don’t click that at school, it’s nsfw.”', tags: ['acronym', 'safety'], ...WIKT('NSFW') },
  { category: 'texting', term: 'oomf', emoji: '👤', difficulty: 'hard', definition: 'One of my followers/friends. Vague-posting about someone without naming them.', example: '“oomf keeps posting cryptic quotes.”', tags: ['social-media', 'gossip'], ...WIKT('oomf') },
  { category: 'texting', term: 'ROFL', emoji: '🤸', difficulty: 'easy', definition: 'Rolling on the floor laughing. LOL escalation tier.', example: '“rofl the dog stole his sandwich.”', tags: ['acronym', 'classic'], ...WIKT('ROFL') },
  { category: 'texting', term: 'thx', emoji: '🙏', difficulty: 'easy', definition: 'Thanks. Also “ty” (thank you) and “tysm” (thank you so much).', example: '“thx for the ride!”', tags: ['shorthand'], ...WIKT('thx') },
  { category: 'texting', term: 'TL;DR', emoji: '📜', difficulty: 'medium', related: ['coding', 'corporate'], definition: 'Too long; didn’t read. Either a confession or a label on the one-line summary of a wall of text.', example: '“tl;dr: trip’s cancelled, refunds Friday.”', tags: ['acronym', 'summary'], ...WIKT('TL;DR') },
  { category: 'texting', term: 'yw', emoji: '😊', difficulty: 'easy', definition: 'You’re welcome.', example: '“thx!” “yw.”', tags: ['acronym'], ...WIKT('yw') },
  { category: 'texting', term: 'GRWM', emoji: '💄', difficulty: 'medium', related: ['teen'], definition: 'Get ready with me — a video format where someone films their morning/going-out routine while chatting.', example: '“Her GRWM got 2M views.”', tags: ['acronym', 'tiktok'], ...WIKT('GRWM') },
  { category: 'texting', term: 'OOTD', emoji: '👗', difficulty: 'medium', related: ['teen'], definition: 'Outfit of the day. Fashion-post caption.', example: '“Posting my ootd before school.”', tags: ['acronym', 'fashion'], ...WIKT('OOTD') },

  // ---------------- GAMING (17 new) ----------------
  { category: 'gaming', term: 'XP', emoji: '⭐', difficulty: 'easy', related: ['teen'], definition: 'Experience points — the currency of leveling up. Kids apply it to life: chores are “no XP.”', example: '“Two more quests and I level up — need the XP.”', tags: ['acronym', 'progression'], ...WIKT('XP') },
  { category: 'gaming', term: 'HP', emoji: '❤️', difficulty: 'easy', definition: 'Health points / hit points. Zero HP = dead. Also used jokingly about being tired.', example: '“I’m at like 5 HP after that practice.”', tags: ['acronym', 'mechanics'], ...WIKT('HP') },
  { category: 'gaming', term: 'OP', emoji: '🦾', difficulty: 'medium', related: ['teen', 'texting'], definition: 'Overpowered — too strong, needs a nerf. Also “original poster” in forums, context decides.', example: '“That new character is straight OP.”', tags: ['acronym', 'balance'], ...WIKT('OP') },
  { category: 'gaming', term: 'cooldown', emoji: '⏳', difficulty: 'easy', related: ['corporate'], definition: 'The wait before an ability can be used again. Borrowed for real life: “my social battery is on cooldown.”', example: '“Ultimate’s on cooldown for 30 more seconds.”', tags: ['mechanics'], ...WIKT('cooldown') },
  { category: 'gaming', term: 'crit', emoji: '💢', difficulty: 'medium', definition: 'Critical hit — a randomly-boosted attack that does extra damage.', example: '“Landed a crit for triple damage.”', tags: ['mechanics'], ...WIKT('crit') },
  { category: 'gaming', term: 'proc', emoji: '🎰', difficulty: 'hard', definition: 'When a random effect actually triggers (“programmed random occurrence”). “My lifesteal procced twice.”', example: '“The stun proc saved the fight.”', tags: ['mechanics', 'mmo'], ...WIKT('proc') },
  { category: 'gaming', term: 'spawn', emoji: '🥚', difficulty: 'easy', definition: 'Where/when something appears in the game world. Spawn point, spawn camping, respawn.', example: '“Enemies spawn behind the barn every wave.”', tags: ['mechanics'], ...WIKT('spawn') },
  { category: 'gaming', term: 'permadeath', emoji: '⚰️', difficulty: 'medium', definition: 'When death is permanent — no respawn, character gone forever. Hardcore mode.', example: '“Lost a 40-hour character to permadeath.”', tags: ['mechanics', 'hardcore'], ...WIKT('permadeath') },
  { category: 'gaming', term: 'glass cannon', emoji: '🔮', difficulty: 'medium', definition: 'A build with huge damage but almost no defense — devastating until anything touches it.', example: '“She runs full glass cannon — one hit and she’s down.”', tags: ['builds', 'strategy'], ...WIKT('glass cannon') },
  { category: 'gaming', term: 'min-maxing', emoji: '📐', difficulty: 'hard', related: ['corporate'], definition: 'Optimizing a build to maximize strengths and dump everything irrelevant. Spreadsheet-brain gaming.', example: '“He min-maxed his character before session one.”', tags: ['builds', 'optimization'], ...WIKT('min-maxing') },
  { category: 'gaming', term: 'juke', emoji: '🌀', difficulty: 'medium', definition: 'Faking out a pursuer with sudden direction changes. From football, huge in MOBAs.', example: '“Juked two defenders through the jungle.”', tags: ['skill'], ...WIKT('juke') },
  { category: 'gaming', term: 'noclip', emoji: '👻', difficulty: 'hard', related: ['coding'], definition: 'A cheat/debug mode that turns off collision so you fly through walls. Also meme shorthand for glitching out of reality.', example: '“Used noclip to see outside the map.”', tags: ['cheats', 'debug'], ...WIKT('noclip') },
  { category: 'gaming', term: 'bunny hopping', emoji: '🐰', difficulty: 'hard', definition: 'Chaining jumps to move faster than intended — a physics exploit turned art form in shooters.', example: '“He bunny hopped across the whole map.”', tags: ['movement', 'skill'], ...WIKT('bunny hopping') },
  { category: 'gaming', term: 'PvE', emoji: '🐉', difficulty: 'easy', definition: 'Player versus environment — fighting computer enemies instead of humans. The chill counterpart to PvP.', example: '“I only queue PvE, ranked stresses me out.”', tags: ['acronym', 'modes'], ...WIKT('PvE') },
  { category: 'gaming', term: 'FPS', emoji: '🔫', difficulty: 'easy', related: ['coding'], definition: 'First-person shooter — the genre. Also frames per second, the performance stat. Same letters, both gaming.', example: '“My FPS drops in big fights.”', tags: ['acronym', 'genre'], ...WIKT('FPS') },
  { category: 'gaming', term: 'MMO', emoji: '🌍', difficulty: 'easy', definition: 'Massively multiplayer online game — thousands of players in one persistent world.', example: '“He’s been in the same MMO guild for years.”', tags: ['acronym', 'genre'], ...WIKT('MMO') },
  { category: 'gaming', term: 'MOBA', emoji: '🗺️', difficulty: 'medium', definition: 'Multiplayer online battle arena (League of Legends, Dota 2) — 5v5 lane-pushing strategy games.', example: '“MOBA players and their 40-minute matches.”', tags: ['acronym', 'genre'], ...WIKT('MOBA') },

  // ---------------- CODING (8 new) ----------------
  { category: 'coding', term: 'bikeshed color', emoji: '🎨', difficulty: 'hard', definition: 'Shorthand for the trivial detail everyone has an opinion on (see bikeshedding). “What color is this bikeshed?” = we’re wasting time.', example: '“Tabs vs spaces is bikeshed color territory.”', tags: ['meetings', 'culture'], ...WIKI('Law of triviality', 'Law_of_triviality') },
  { category: 'coding', term: 'rubber-stamp review', emoji: '🖨️', difficulty: 'medium', related: ['corporate'], definition: 'Approving a code review without genuinely reading it. The dark side of LGTM.', example: '“That 2,000-line PR got rubber-stamped in 4 minutes.”', tags: ['code-review', 'culture'], ...WIKI('Code review', 'Code_review') },
  { category: 'coding', term: 'happy path', emoji: '🌈', difficulty: 'medium', related: ['corporate'], definition: 'The scenario where every input is valid and nothing goes wrong. Code that only handles the happy path breaks on contact with users.', example: '“The demo works because it only shows the happy path.”', tags: ['testing', 'design'], ...WIKI('Happy path', 'Happy_path') },
  { category: 'coding', term: 'rollback', emoji: '⏪', difficulty: 'easy', related: ['corporate'], definition: 'Reverting to the previous version after a release goes wrong. The “undo” button of deployments.', example: '“Site’s down — roll back the release.”', tags: ['deployment'], ...WIKI('Rollback (data management)', 'Rollback_(data_management)') },
  { category: 'coding', term: 'hotfix', emoji: '🚒', difficulty: 'easy', related: ['gaming', 'corporate'], definition: 'An urgent patch shipped outside the normal release cycle to stop the bleeding. Gamers know it from emergency balance patches.', example: '“They pushed a hotfix at 2am.”', tags: ['deployment', 'urgency'], ...WIKI('Hotfix', 'Hotfix') },
  { category: 'coding', term: 'sandbox', emoji: '🏖️', difficulty: 'medium', related: ['gaming'], definition: 'An isolated environment where code can run without hurting anything real. In gaming: a genre where you build freely (Minecraft).', example: '“Test it in the sandbox before it touches prod.”', tags: ['security', 'environment'], ...WIKI('Sandbox (computer security)', 'Sandbox_(computer_security)') },
  { category: 'coding', term: 'prod', emoji: '🔥', difficulty: 'medium', definition: 'Production — the live system real users touch. “Testing in prod” is the confession of the brave and the doomed.', example: '“Who pushed straight to prod on a Friday?”', tags: ['deployment', 'environment'], ...WIKI('Deployment environment', 'Deployment_environment') },
  { category: 'coding', term: 'scope creep', emoji: '🐙', difficulty: 'medium', related: ['corporate'], definition: 'A project quietly growing beyond its original plan, one “small addition” at a time.', example: '“The todo app now has a social feed. Scope creep.”', tags: ['project-management'], ...WIKI('Scope creep', 'Scope_creep') },

  // ---------------- CORPORATE (12 new) ----------------
  { category: 'corporate', term: 'touch base', emoji: '⚾', difficulty: 'easy', definition: 'To check in briefly. Baseball metaphor; the unit of corporate small talk.', example: '“Let’s touch base Monday about the launch.”', tags: ['meetings'], ...WIKT('touch base') },
  { category: 'corporate', term: 'win-win', emoji: '🤲', difficulty: 'easy', definition: 'An outcome claimed to benefit both sides. Sometimes even true.', example: '“Remote Fridays are a win-win.”', tags: ['negotiation'], ...WIKT('win-win') },
  { category: 'corporate', term: 'drill down', emoji: '🕳️', difficulty: 'easy', related: ['coding'], definition: 'To go from summary to detail — clicking into the numbers behind the numbers.', example: '“Let’s drill down into why churn spiked.”', tags: ['analysis'], ...WIKT('drill down') },
  { category: 'corporate', term: 'action item', emoji: '☑️', difficulty: 'easy', definition: 'A specific task assigned in a meeting. Meetings are judged by how few of these survive.', example: '“Three action items came out of standup.”', tags: ['meetings', 'tasks'], ...WIKT('action item') },
  { category: 'corporate', term: 'best practice', emoji: '📏', difficulty: 'easy', related: ['coding'], definition: 'The industry-accepted “right way” to do something. Invoked to end arguments.', example: '“Code review before merge is best practice.”', tags: ['process'], ...WIKT('best practice') },
  { category: 'corporate', term: 'thought leader', emoji: '🧑‍🏫', difficulty: 'medium', definition: 'Someone positioned as a visionary in their field. Half admiration, half eye-roll, depending on who says it.', example: '“He posts like a LinkedIn thought leader now.”', tags: ['buzzword', 'social-media'], ...WIKT('thought leader') },
  { category: 'corporate', term: 'ideate', emoji: '💭', difficulty: 'medium', definition: 'To brainstorm — but fancier. The verb form of a whiteboard session.', example: '“Let’s ideate on Q3 campaigns.”', tags: ['buzzword', 'meetings'], ...WIKT('ideate') },
  { category: 'corporate', term: 'EOD', emoji: '🌆', difficulty: 'easy', related: ['texting'], definition: 'End of day — the classic soft deadline. “By EOD” means today, timezone negotiable.', example: '“Can you send the deck by EOD?”', tags: ['acronym', 'deadlines'], ...WIKT('EOD') },
  { category: 'corporate', term: 'OOO', emoji: '🏝️', difficulty: 'easy', related: ['texting'], definition: 'Out of office. The status, the auto-reply, and the dream.', example: '“She’s OOO until Thursday.”', tags: ['acronym', 'status'], ...WIKT('OOO') },
  { category: 'corporate', term: 'KPI', emoji: '📊', difficulty: 'medium', definition: 'Key performance indicator — the specific numbers a team is judged by.', example: '“Signups are our main KPI this quarter.”', tags: ['acronym', 'metrics'], ...WIKT('KPI') },
  { category: 'corporate', term: 'ROI', emoji: '💰', difficulty: 'medium', definition: 'Return on investment — what you got back for what you put in. Demanded of every idea, including lunch.', example: '“What’s the ROI on sponsoring that event?”', tags: ['acronym', 'metrics'], ...WIKT('ROI') },
  { category: 'corporate', term: 'pivot', emoji: '🔁', difficulty: 'easy', related: ['coding'], definition: 'A sharp change of strategy when the current one isn’t working, rebranded as vision.', example: '“The startup pivoted from an app to a B2B tool.”', tags: ['strategy', 'startup'], ...WIKT('pivot') },
];
