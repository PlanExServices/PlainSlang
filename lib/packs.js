// Jargon packs beyond teen slang. Definitions are widely documented common usage;
// each entry cites a real, published reference page. Do not invent meanings.

export const CATEGORIES = [
  {
    id: 'teen',
    label: 'Teen & Gen Alpha slang',
    emoji: '🧃',
    blurb: 'The main glossary — what the kids are actually saying.',
    color: '#a78bfa',
  },
  {
    id: 'texting',
    label: 'Texting shorthand',
    emoji: '📱',
    blurb: 'The acronyms flying around the group chat.',
    color: '#22d3ee',
  },
  {
    id: 'gaming',
    label: 'Gaming slang',
    emoji: '🎮',
    blurb: 'What they\u2019re shouting into the headset.',
    color: '#4ade80',
  },
  {
    id: 'coding',
    label: 'Coding jargon',
    emoji: '💻',
    blurb: 'Decode the developers at your dinner table (or standup).',
    color: '#fbbf24',
  },
  {
    id: 'corporate',
    label: 'Corporate speak',
    emoji: '🏢',
    blurb: 'Translate the meeting before the meeting.',
    color: '#f472b6',
  },
  {
    id: 'safety',
    label: 'Red flags & safety',
    emoji: '⚠️',
    blurb: 'Coded terms that can signal risk — worth a real conversation.',
    color: '#f87171',
  },
  {
    id: 'emoji',
    label: 'Emoji codes',
    emoji: '🙂',
    blurb: 'What that emoji actually means in a teen\u2019s texts.',
    color: '#34d399',
  },
];

export function categoryInfo(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
}

const WIKT = (w) => ({
  sourceName: `Wiktionary — ${w}`,
  sourceUrl: `https://en.wiktionary.org/wiki/${encodeURIComponent(w)}`,
});
const WIKI = (title, page) => ({
  sourceName: `Wikipedia — ${title}`,
  sourceUrl: `https://en.wikipedia.org/wiki/${page}`,
});
const VG = WIKI('Glossary of video game terms', 'Glossary_of_video_game_terms');
const JARGON = { sourceName: 'The Jargon File', sourceUrl: 'http://www.catb.org/jargon/html/' };
const CORP = WIKI('Corporate jargon', 'Corporate_jargon');

export const PACK_TERMS = [
  // ---------------- TEXTING ----------------
  { category: 'texting', term: 'LOL', emoji: '😂', difficulty: 'easy', definition: 'Laughing out loud. Often just means “that’s mildly amusing” or softens a message — actual laughter not required.', example: '“I locked myself out again lol.”', tags: ['acronym', 'classic'], ...WIKT('LOL') },
  { category: 'texting', term: 'BRB', emoji: '🏃', difficulty: 'easy', definition: 'Be right back. Stepping away from the conversation briefly.', example: '“brb, someone’s at the door.”', tags: ['acronym'], ...WIKT('BRB') },
  { category: 'texting', term: 'SMH', emoji: '🤦', difficulty: 'easy', definition: 'Shaking my head. Disappointment or disbelief.', example: '“He forgot the tickets again, smh.”', tags: ['acronym', 'reaction'], ...WIKT('SMH') },
  { category: 'texting', term: 'TBH', emoji: '🫣', difficulty: 'easy', definition: 'To be honest. Signals an upcoming candid opinion.', example: '“tbh I never liked that show.”', tags: ['acronym', 'opinion'], ...WIKT('TBH') },
  { category: 'texting', term: 'NGL', emoji: '😬', difficulty: 'easy', definition: 'Not gonna lie. Like TBH — a preface for honesty, sometimes a confession.', example: '“ngl that was actually fun.”', tags: ['acronym', 'opinion'], ...WIKT('NGL') },
  { category: 'texting', term: 'IYKYK', emoji: '🤫', difficulty: 'medium', definition: 'If you know, you know. Flags an inside joke or shared experience — deliberately exclusionary.', example: '“The stairwell at lunch… iykyk.”', tags: ['acronym', 'inside-joke'], ...WIKT('IYKYK') },
  { category: 'texting', term: 'HMU', emoji: '📲', difficulty: 'easy', definition: 'Hit me up. Contact me / text me later.', example: '“hmu when you’re free this weekend.”', tags: ['acronym', 'invitation'], ...WIKT('HMU') },
  { category: 'texting', term: 'WYD', emoji: '❓', difficulty: 'easy', definition: 'What (are) you doing? A conversation opener.', example: '“wyd rn?”', tags: ['acronym', 'opener'], ...WIKT('WYD') },
  { category: 'texting', term: 'GTG', emoji: '👋', difficulty: 'easy', definition: 'Got to go. Ending the conversation.', example: '“gtg, dinner’s ready.”', tags: ['acronym'], ...WIKT('GTG') },
  { category: 'texting', term: 'IDK', emoji: '🤷', difficulty: 'easy', definition: 'I don’t know.', example: '“idk, ask mom.”', tags: ['acronym'], ...WIKT('IDK') },
  { category: 'texting', term: 'LMK', emoji: '📩', difficulty: 'easy', definition: 'Let me know.', example: '“lmk if practice gets cancelled.”', tags: ['acronym'], ...WIKT('LMK') },
  { category: 'texting', term: 'FR', emoji: '💯', difficulty: 'easy', definition: 'For real. Agreement or emphasis; doubled (“fr fr”) for extra sincerity.', example: '“That test was brutal.” “fr.”', tags: ['acronym', 'agreement'], ...WIKT('FR') },
  { category: 'texting', term: 'ICYMI', emoji: '📰', difficulty: 'medium', definition: 'In case you missed it. Usually introduces a repost or old news.', example: '“icymi: the game moved to Saturday.”', tags: ['acronym'], ...WIKT('ICYMI') },
  { category: 'texting', term: 'ISTG', emoji: '😤', difficulty: 'medium', definition: 'I swear to God. Emphasis, exasperation, or a (usually empty) threat.', example: '“istg if he cancels again…”', tags: ['acronym', 'emphasis'], ...WIKT('ISTG') },
  { category: 'texting', term: 'IMO', emoji: '💭', difficulty: 'easy', definition: 'In my opinion. IMHO adds “humble.”', example: '“imo the sequel was better.”', tags: ['acronym', 'opinion'], ...WIKT('IMO') },

  // ---------------- GAMING ----------------
  { category: 'gaming', term: 'GG', emoji: '🤝', difficulty: 'easy', definition: 'Good game. Sportsmanship at the end of a match; “GG EZ” is the trash-talk version.', example: '“gg everyone, that was close.”', tags: ['etiquette'], ...VG },
  { category: 'gaming', term: 'AFK', emoji: '🪑', difficulty: 'easy', definition: 'Away from keyboard. Not at the controls right now.', example: '“He’s afk, don’t start the match.”', tags: ['acronym'], ...VG },
  { category: 'gaming', term: 'noob', emoji: '🐣', difficulty: 'easy', definition: 'A beginner or unskilled player (from “newbie”). Usually teasing, sometimes toxic.', example: '“Stop standing in the fire, noob.”', tags: ['teasing'], ...VG },
  { category: 'gaming', term: 'nerf', emoji: '🔨', difficulty: 'medium', definition: 'When developers weaken something in an update. Named after the foam toy brand.', example: '“They nerfed my favorite weapon again.”', tags: ['updates'], ...VG },
  { category: 'gaming', term: 'buff', emoji: '💪', difficulty: 'medium', definition: 'The opposite of nerf — making a character or item stronger.', example: '“Healers got a huge buff this patch.”', tags: ['updates'], ...VG },
  { category: 'gaming', term: 'grinding', emoji: '⛏️', difficulty: 'easy', definition: 'Doing repetitive tasks to level up or earn in-game rewards. Not misbehavior — it’s farming XP.', example: '“I spent all weekend grinding for that skin.”', tags: ['progression'], ...VG },
  { category: 'gaming', term: 'loot', emoji: '🎁', difficulty: 'easy', definition: 'Items, gear, or currency collected in-game. “Loot boxes” are randomized (and controversial) versions.', example: '“The boss dropped legendary loot.”', tags: ['items'], ...VG },
  { category: 'gaming', term: 'smurfing', emoji: '🔵', difficulty: 'hard', definition: 'An experienced player using a new low-rank account to stomp beginners. Widely considered unsporting.', example: '“That ‘level 3’ is definitely smurfing.”', tags: ['competitive'], ...VG },
  { category: 'gaming', term: 'clutch', emoji: '🧊', difficulty: 'medium', definition: 'Winning under extreme pressure, often as the last player standing. “He clutched it.”', example: '“1v4 and he still clutched the round.”', tags: ['competitive', 'praise'], ...VG },
  { category: 'gaming', term: 'respawn', emoji: '♻️', difficulty: 'easy', definition: 'Coming back to life after dying in-game, usually after a short wait.', example: '“I respawn in 10 seconds, hold the point.”', tags: ['mechanics'], ...VG },
  { category: 'gaming', term: 'lag', emoji: '🐌', difficulty: 'easy', definition: 'Network delay that makes the game stutter or freeze. The universal excuse for losing.', example: '“I didn’t miss — it was lag.”', tags: ['technical', 'excuse'], ...VG },
  { category: 'gaming', term: 'aggro', emoji: '😡', difficulty: 'hard', definition: 'Enemy attention. “Pulling aggro” means making enemies target you — a tank’s whole job.', example: '“Stop pulling aggro off the tank!”', tags: ['mechanics', 'mmo'], ...VG },
  { category: 'gaming', term: 'tank', emoji: '🛡️', difficulty: 'medium', definition: 'The durable teammate whose role is soaking damage so fragile teammates survive.', example: '“We need a tank before we can queue.”', tags: ['roles', 'mmo'], ...VG },
  { category: 'gaming', term: 'PvP', emoji: '⚔️', difficulty: 'easy', definition: 'Player versus player — competing against real people instead of computer enemies (PvE).', example: '“I only play PvP modes.”', tags: ['acronym', 'modes'], ...VG },
  { category: 'gaming', term: 'rage quit', emoji: '🎮', difficulty: 'easy', definition: 'Quitting a game mid-match out of frustration, often dramatically.', example: '“He rage quit after the third loss.”', tags: ['behavior'], ...VG },
  { category: 'gaming', term: 'poggers', emoji: '😮', difficulty: 'hard', definition: 'Excitement or hype, from the Twitch “PogChamp” emote. Also “pog” or “poggers moment.”', example: '“New season drops tonight — poggers.”', tags: ['twitch', 'hype'], ...WIKI('PogChamp', 'PogChamp') },

  // ---------------- CODING ----------------
  { category: 'coding', term: 'LGTM', emoji: '✅', difficulty: 'easy', definition: '“Looks good to me” — the standard code-review approval. Sometimes suspiciously fast.', example: '“LGTM, merging it.”', tags: ['acronym', 'code-review'], ...WIKT('LGTM') },
  { category: 'coding', term: 'rubber duck debugging', emoji: '🦆', difficulty: 'medium', definition: 'Explaining your code line-by-line to an inanimate object (classically a rubber duck) until you spot the bug yourself.', example: '“I solved it mid-sentence while rubber-ducking.”', tags: ['debugging', 'technique'], ...WIKI('Rubber duck debugging', 'Rubber_duck_debugging') },
  { category: 'coding', term: 'yak shaving', emoji: '🐃', difficulty: 'hard', definition: 'A chain of small side-tasks you must finish before the task you actually wanted to do — each one seemingly necessary.', example: '“I came to fix a typo and ended up upgrading the build system. Total yak shave.”', tags: ['workflow'], ...JARGON },
  { category: 'coding', term: 'bikeshedding', emoji: '🚲', difficulty: 'hard', definition: 'Spending disproportionate time debating trivial details (the bike shed’s color) while ignoring the hard, important stuff.', example: '“Two hours on the button color — pure bikeshedding.”', tags: ['meetings'], ...WIKI('Law of triviality', 'Law_of_triviality') },
  { category: 'coding', term: 'technical debt', emoji: '💳', difficulty: 'medium', definition: 'The future cost of choosing a quick fix now instead of the proper solution. It accrues interest.', example: '“We shipped fast, but the tech debt is piling up.”', tags: ['architecture'], ...WIKI('Technical debt', 'Technical_debt') },
  { category: 'coding', term: 'spaghetti code', emoji: '🍝', difficulty: 'easy', definition: 'Tangled, hard-to-follow code with no clear structure — everything connects to everything.', example: '“Nobody touches that module. It’s pure spaghetti.”', tags: ['code-quality'], ...WIKI('Spaghetti code', 'Spaghetti_code') },
  { category: 'coding', term: 'foo / bar', emoji: '🔤', difficulty: 'medium', definition: 'Meaningless placeholder names used in examples when the actual name doesn’t matter.', example: '“Just call the function foo for the demo.”', tags: ['convention'], ...WIKI('Foobar', 'Foobar') },
  { category: 'coding', term: 'YAGNI', emoji: '🙅', difficulty: 'hard', definition: '“You aren’t gonna need it” — don’t build features on speculation; wait until they’re actually required.', example: '“Skip the plugin system for now. YAGNI.”', tags: ['acronym', 'principle'], ...WIKI('You aren\u2019t gonna need it', 'You_aren%27t_gonna_need_it') },
  { category: 'coding', term: 'DRY', emoji: '🌵', difficulty: 'medium', definition: '“Don’t repeat yourself” — every piece of logic should live in exactly one place.', example: '“Extract that into a helper. Keep it DRY.”', tags: ['acronym', 'principle'], ...WIKI('Don\u2019t repeat yourself', 'Don%27t_repeat_yourself') },
  { category: 'coding', term: 'bus factor', emoji: '🚌', difficulty: 'medium', definition: 'How many people can leave (or be hit by a bus) before a project is doomed because only they understood it. A bus factor of 1 is scary.', example: '“Only Dana knows the deploy script — bus factor of one.”', tags: ['team-risk'], ...WIKI('Bus factor', 'Bus_factor') },
  { category: 'coding', term: 'dogfooding', emoji: '🐶', difficulty: 'medium', definition: 'A company using its own product internally — “eating your own dog food” — to find problems before customers do.', example: '“We’ve been dogfooding the new app all month.”', tags: ['process'], ...WIKI('Eating your own dog food', 'Eating_your_own_dog_food') },
  { category: 'coding', term: 'heisenbug', emoji: '🫥', difficulty: 'hard', definition: 'A bug that disappears or changes behavior the moment you try to observe or debug it. Named after the uncertainty principle.', example: '“It crashes in production but never in the debugger. Classic heisenbug.”', tags: ['debugging'], ...WIKI('Heisenbug', 'Heisenbug') },
  { category: 'coding', term: 'code smell', emoji: '👃', difficulty: 'medium', definition: 'A surface symptom in code that hints at a deeper design problem — not a bug, but a warning sign.', example: '“A 500-line function? That’s a code smell.”', tags: ['code-quality'], ...WIKI('Code smell', 'Code_smell') },
  { category: 'coding', term: 'ship it', emoji: '🚢', difficulty: 'easy', definition: 'Release it to users — often said with a mix of confidence and reckless optimism.', example: '“Tests pass. Ship it.”', tags: ['release'], ...JARGON },

  // ---------------- CORPORATE ----------------
  { category: 'corporate', term: 'circle back', emoji: '🔄', difficulty: 'easy', definition: 'To return to a topic later. Sometimes sincere; sometimes where topics go to die.', example: '“Let’s circle back on that after the quarter.”', tags: ['meetings'], ...CORP },
  { category: 'corporate', term: 'synergy', emoji: '🤝', difficulty: 'easy', definition: 'The claim that combining two things creates extra value. The classic buzzword, beloved in mergers.', example: '“The acquisition unlocks real synergy.”', tags: ['buzzword'], ...CORP },
  { category: 'corporate', term: 'bandwidth', emoji: '📶', difficulty: 'easy', definition: 'Capacity to take on work. “No bandwidth” = a polite no.', example: '“I don’t have the bandwidth for another project.”', tags: ['workload'], ...CORP },
  { category: 'corporate', term: 'low-hanging fruit', emoji: '🍎', difficulty: 'easy', definition: 'The easiest wins available — quick tasks with visible payoff.', example: '“Fix the signup bug first, that’s low-hanging fruit.”', tags: ['strategy'], ...CORP },
  { category: 'corporate', term: 'take this offline', emoji: '📴', difficulty: 'medium', definition: 'To move a discussion out of the current meeting — usually because it’s off-topic or getting awkward.', example: '“Good point — let’s take this offline.”', tags: ['meetings'], ...CORP },
  { category: 'corporate', term: 'hard stop', emoji: '🛑', difficulty: 'easy', definition: 'A meeting end-time that genuinely cannot slip. A pre-announced escape hatch.', example: '“I have a hard stop at 3.”', tags: ['meetings'], ...CORP },
  { category: 'corporate', term: 'deep dive', emoji: '🤿', difficulty: 'easy', definition: 'A thorough examination of a topic, as opposed to a high-level overview.', example: '“Next week we’ll do a deep dive on churn.”', tags: ['analysis'], ...CORP },
  { category: 'corporate', term: 'boil the ocean', emoji: '🌊', difficulty: 'hard', definition: 'To attempt something impossibly broad instead of scoping it down. Usually a warning: don’t.', example: '“Let’s not boil the ocean — pick one market first.”', tags: ['strategy'], ...CORP },
  { category: 'corporate', term: 'move the needle', emoji: '📈', difficulty: 'medium', definition: 'To make a measurable difference on a metric that matters.', example: '“Will this feature actually move the needle?”', tags: ['metrics'], ...CORP },
  { category: 'corporate', term: 'ping me', emoji: '🔔', difficulty: 'easy', definition: 'Send me a quick message. Borrowed from network terminology.', example: '“Ping me when the report’s ready.”', tags: ['communication'], ...CORP },
  { category: 'corporate', term: 'run it up the flagpole', emoji: '🚩', difficulty: 'hard', definition: 'To float an idea to leadership and see how they react (“…and see who salutes”).', example: '“I’ll run it up the flagpole before we commit.”', tags: ['approval', 'vintage'], ...CORP },
  { category: 'corporate', term: 'square the circle', emoji: '⭕', difficulty: 'hard', definition: 'To attempt to reconcile two things that seem fundamentally incompatible — from the famously impossible geometry problem.', example: '“Cutting costs while doubling quality? We’re squaring the circle.”', tags: ['strategy'], ...WIKI('Squaring the circle', 'Squaring_the_circle') },
];
