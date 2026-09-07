// Pack expansion v10 — Qustodio ingestion (site added by user request 2026-09-07).
// Crawled the full qustodio.com post sitemap (324 posts), identified 22
// slang/term-relevant guides, cross-referenced all of them against the library.
// Result: 27 new terms (below) + 26 cross-citations on existing terms
// (QUSTODIO_CITATIONS, applied as an "Also documented by" note — original
// sources are kept as the primary citation).
// Definitions paraphrase Qustodio's own articles. No invented meanings.
// Crawl inventory: artifacts/evidence/qustodio-crawl.md

const Q = (slug, title) => ({
  sourceName: `Qustodio — ${title}`,
  sourceUrl: `https://www.qustodio.com/en/blog/${slug}/`,
});

const QINT = Q('internet-speak-do-you-know-the-lingo-to-keep-your-kids-safe', 'Internet Speak: Do You Know the Lingo?');
const QLMX = Q('what-is-looksmaxxing', 'What Is Looksmaxxing? A Guide for Parents (2026)');
const QMAN = Q('what-is-the-manosphere', 'What Is the Manosphere? (2026)');
const QBR = Q('what-is-brain-rot-a-parents-guide', 'What Is Brain Rot? A Parent\u2019s Guide (2025)');
const QCO = Q('what-does-it-mean-to-be-chronically-online', 'What Does It Mean to Be Chronically Online?');
const QNPC = Q('what-is-npc-streaming', 'What Is NPC Streaming?');
const QMUK = Q('what-is-mukbang', 'What Is Mukbang?');
const QBUR = Q('does-my-teen-have-a-burner-phone', 'A Parent\u2019s Guide to Burner Phones (2025)');
const QCALC = Q('how-to-spot-a-fake-calculator-app', 'How to Spot a Fake Calculator App');
const QDIS = Q('disappearing-messages-parent-guide', 'Disappearing Messages: What Parents Need to Know (2026)');
const QUNB = Q('why-is-unboxing-popular', 'Why Is Unboxing So Popular?');

export const PACK_TERMS_V10 = [
  // ============ ⚠️ SAFETY — red-flag acronyms (Qustodio internet-speak guide) ============
  { category: 'safety', term: 'LMIRL', emoji: '📍', difficulty: 'hard', related: ['texting'], definition: '\u201CLet\u2019s meet in real life.\u201D Qustodio flags this as a signal a tween or teen may be planning to meet up with a stranger they met online \u2014 one of the acronyms parents most need to recognize.', example: 'Seeing LMIRL in a chat with an unknown contact warrants an immediate conversation.', tags: ['acronym', 'parent-alert', 'predators'], ...QINT },
  { category: 'safety', term: 'GNOC', emoji: '📵', difficulty: 'hard', related: ['texting'], definition: '\u201CGet naked on cam.\u201D A sexting-solicitation acronym Qustodio lists among the red flags that should never be ignored in a minor\u2019s chats.', example: 'GNOC appearing in a chat log is a red flag, full stop.', tags: ['acronym', 'parent-alert', 'sexting'], ...QINT },
  { category: 'safety', term: 'NIFOC', emoji: '🚩', difficulty: 'hard', related: ['texting'], definition: '\u201CNaked in front of computer.\u201D Another sexting-adjacent acronym from Qustodio\u2019s red-flag list.', example: 'Paired with webcam access, NIFOC is exactly what it sounds like.', tags: ['acronym', 'parent-alert', 'sexting'], ...QINT },
  { category: 'safety', term: 'POS (parents over shoulder)', emoji: '👀', difficulty: 'medium', related: ['texting'], definition: '\u201CParents over shoulder\u201D \u2014 a heads-up between kids that a parent is watching and the conversation should change topics. Qustodio cites it as a classic example of lingo built for deception rather than convenience.', example: 'A sudden \u201Cpos\u201D followed by a topic change means you were the topic.', say: 'P-O-S', tags: ['acronym', 'code'], ...QINT },

  // ============ ⚠️ SAFETY — manosphere pipeline (Qustodio manosphere guide) ============
  { category: 'safety', term: 'manosphere', emoji: '🕸️', difficulty: 'medium', related: ['teen'], definition: 'The network of websites, subreddits, and influencer accounts promoting masculinity with a heavy side of misogyny. Qustodio warns that surface-level memes (sigma, mewing, looksmaxxing) sit a few clicks from communities accused of radicalizing boys.', example: 'Sigma memes are often a kid\u2019s first contact with manosphere content.', tags: ['parent-alert', 'ideology', 'boys'], ...QMAN },
  { category: 'safety', term: 'incel', emoji: '🚪', difficulty: 'medium', related: ['teen'], definition: '\u201CInvoluntary celibate\u201D \u2014 a man who can\u2019t find a partner despite feeling entitled to one. Qustodio describes inceldom as rooted in self-pity, resentment, and misogyny, with community discussions that have endorsed harassment and violence.', example: 'Incel forums are the darkest corner of the manosphere.', tags: ['parent-alert', 'ideology'], ...QMAN },
  { category: 'safety', term: 'MGTOW', emoji: '🚶', difficulty: 'hard', definition: '\u201CMen going their own way\u201D \u2014 a manosphere community advocating avoiding relationships with women entirely. Its main subreddit was banned in 2021 for promoting hate, per Qustodio\u2019s guide.', example: 'MGTOW rhetoric often reaches teens through repackaged podcast clips.', say: 'MIG-tow', tags: ['acronym', 'ideology', 'parent-alert'], ...QMAN },
  { category: 'safety', term: 'red pill', emoji: '💊', difficulty: 'medium', related: ['teen'], definition: 'Borrowed from The Matrix: \u201Ctaking the red pill\u201D means accepting the manosphere\u2019s view that society is biased against men. Qustodio notes \u201Cred pillers\u201D congregate in forums to reject modern gender roles.', example: '\u201CHe got red-pilled by those podcasts\u201D is not a compliment.', tags: ['ideology', 'parent-alert'], ...QMAN },
  { category: 'safety', term: 'black pill', emoji: '⚫', difficulty: 'hard', definition: 'The fatalistic incel version of the red pill: accepting that nothing an \u201Cunattractive\u201D man does can improve his romantic prospects. Qustodio links blackpill culture to the most extreme corners of the manosphere.', example: 'Blackpill language like \u201Cit\u2019s over\u201D signals a concerning rabbit hole.', tags: ['ideology', 'parent-alert'], ...QMAN },
  { category: 'safety', term: 'blue pill', emoji: '🔵', difficulty: 'medium', definition: 'The manosphere\u2019s insult for staying \u201Cblissfully ignorant\u201D \u2014 anyone who hasn\u2019t accepted red-pill ideology. From the same Matrix metaphor documented in Qustodio\u2019s guide.', example: '\u201CBlue-pilled\u201D gets thrown at anyone who disagrees with the forum.', tags: ['ideology'], ...QMAN },
  { category: 'safety', term: 'pickup artist (PUA)', emoji: '🎯', difficulty: 'medium', definition: 'The \u201Cseduction community\u201D \u2014 men sharing strategies (\u201Cgame\u201D) to get women into bed, with gurus charging thousands for boot camps. Qustodio counts PUAs among the manosphere\u2019s four main communities, criticized for objectification and misogyny.', example: 'PUA content is often teens\u2019 introduction to \u201Cgame\u201D language.', tags: ['ideology', 'parent-alert'], ...QMAN },

  // ============ ⚠️ SAFETY — hidden-tech red flags ============
  { category: 'safety', term: 'burner phone', emoji: '📱', difficulty: 'easy', definition: 'A second, secret phone kept for privacy and untraceability. Qustodio\u2019s guide walks parents through why a teen might hide one \u2014 from dodging monitoring to concealing risky relationships \u2014 and the signs one exists.', example: 'A cheap prepaid phone in a backpack pocket is worth a calm conversation, not a raid.', tags: ['parent-alert', 'hidden-tech'], ...QBUR },
  { category: 'safety', term: 'vault app', emoji: '🔒', difficulty: 'medium', definition: 'An app whose real purpose is hiding private photos, videos, and files behind a passcode. Qustodio notes some vault apps even photograph \u201Cintruders\u201D who enter a wrong password.', example: 'Duplicate \u201Cutility\u201D apps on a teen\u2019s phone are the classic vault-app tell.', tags: ['parent-alert', 'hidden-tech'], ...QCALC },
  { category: 'safety', term: 'fake calculator app', emoji: '🧮', difficulty: 'medium', definition: 'The most common disguise for a vault app: it works as a real calculator, but entering a secret passcode unlocks hidden files. Qustodio\u2019s guide teaches parents how to spot one (two calculators is the giveaway).', example: 'Why would anyone need two calculator apps? Exactly.', tags: ['parent-alert', 'hidden-tech'], ...QCALC },
  { category: 'safety', term: 'disappearing messages', emoji: '⏳', difficulty: 'easy', related: ['texting'], definition: 'Texts, photos, or videos that auto-delete after a set time or a single view (Snapchat pioneered it; most apps now offer it). Qustodio warns the vanishing act creates a false sense of privacy that emboldens riskier sharing \u2014 screenshots exist.', example: '\u201CIt disappears anyway\u201D is the exact false confidence to talk about.', tags: ['privacy', 'parent-alert'], ...QDIS },

  // ============ 🧃 TEEN — looksmaxxing lexicon (Qustodio glossary) ============
  { category: 'teen', term: 'softmaxxing', emoji: '💇', ageGroup: 'gen_z', difficulty: 'medium', definition: 'The safe, standard end of looksmaxxing: good haircut, skincare, working out, eating well, dressing better. Per Qustodio\u2019s looksmaxxing glossary.', example: '\u201CJust softmaxxing: gym, water, sleep.\u201D', tags: ['looksmaxxing', 'appearance'], ...QLMX },
  { category: 'teen', term: 'hardmaxxing', emoji: '⚕️', ageGroup: 'gen_z', difficulty: 'medium', related: ['safety'], definition: 'The extreme end of looksmaxxing: surgery, hair transplants, steroids, weight-loss injections, unregulated supplements. Qustodio flags this side as genuinely dangerous for teenage boys.', example: 'When \u201Cjawline content\u201D turns into surgery talk, that\u2019s hardmaxxing.', tags: ['looksmaxxing', 'parent-alert', 'body-image'], ...QLMX },
  { category: 'teen', term: 'canthal tilt', emoji: '👁️', ageGroup: 'gen_z', difficulty: 'hard', definition: 'The angle between the inner and outer corners of the eyes, obsessed over in looksmaxxing communities \u2014 a positive tilt (\u201Chunter eyes\u201D) is deemed more attractive. Qustodio lists it as core looksmaxxing vocabulary.', example: 'Millimeter-level fixation on eye angles is a body-dysmorphia warning sign.', tags: ['looksmaxxing', 'body-image'], ...QLMX },
  { category: 'teen', term: 'ascension', emoji: '📈', ageGroup: 'gen_z', difficulty: 'medium', definition: 'Looksmaxxing-speak for transforming into a more attractive, higher-status version of yourself.', example: '\u201CBro ascended after the haircut.\u201D', tags: ['looksmaxxing'], ...QLMX },
  { category: 'teen', term: 'PSL scale', emoji: '🔢', ageGroup: 'gen_z', difficulty: 'hard', definition: 'A perceived-attractiveness ranking used in looksmaxxing communities \u2014 essentially where someone supposedly sits in the \u201Cdating marketplace.\u201D', example: '\u201CHe\u2019s PSL 8.\u201D \u201CHe\u2019s low PSL.\u201D', say: 'P-S-L', tags: ['looksmaxxing', 'body-image'], ...QLMX },
  { category: 'teen', term: 'sub5', emoji: '📉', ageGroup: 'gen_z', difficulty: 'hard', related: ['safety'], definition: 'Someone rated below 5/10 in attractiveness \u2014 used, per Qustodio, in a harsh and fatalistic way that echoes blackpill thinking.', example: '\u201CHe\u2019s sub5. It\u2019s over for bro.\u201D', say: 'sub-five', tags: ['looksmaxxing', 'parent-alert', 'body-image'], ...QLMX },

  // ============ 🧃 TEEN — content-trend vocabulary ============
  { category: 'teen', term: 'NPC streaming', emoji: '🤖', ageGroup: 'gen_z', difficulty: 'medium', related: ['gaming'], definition: 'A TikTok Live trend where creators act like video-game background characters, repeating set phrases (\u201Cice cream so good\u201D) in exchange for paid virtual gifts. Qustodio notes speculation about its sexual undertones \u2014 viewers pay to \u201Ccontrol\u201D the streamer.', example: 'Pinkydoll\u2019s \u201Cice cream so good\u201D made NPC streaming famous.', tags: ['tiktok', 'streaming', 'trend'], ...QNPC },
  { category: 'teen', term: 'mukbang', emoji: '🍜', ageGroup: 'gen_z', difficulty: 'medium', definition: 'A live-streamed video where viewers watch the host eat banquet-sized amounts of food. From Korean meokbang (\u201Ceating broadcast\u201D); Collins made it a Word of 2020. Kids watch them like cooking shows with a chaos twist.', example: 'A two-hour seafood-boil mukbang, viewed at 2x speed.', say: 'MOOK-bahng', tags: ['streaming', 'trend', 'food'], ...QMUK },
  { category: 'teen', term: 'unboxing', emoji: '📦', ageGroup: 'elementary', difficulty: 'easy', definition: 'Videos of people taking products out of their packaging \u2014 billions of views, heavily watched by young kids. Qustodio notes they double as stealth advertising aimed at children.', example: 'One more unboxing video and then bedtime. (It\u2019s never one more.)', tags: ['youtube', 'trend', 'advertising'], ...QUNB },

  // ============ 🧃 TEEN — Italian brainrot characters (Qustodio brain-rot guide) ============
  { category: 'teen', term: 'tung tung tung sahur', emoji: '🥁', ageGroup: 'gen_alpha', difficulty: 'hard', definition: 'One of the viral \u201CItalian brainrot\u201D characters \u2014 AI-generated absurdist figures with fake-Italian voices, each with its own catchphrase and lore. Qustodio lists it among the phrases kids drop that sound like a new language.', example: 'Yelled across a classroom for no reason a teacher can discern.', say: 'toong toong toong sah-HOOR', tags: ['brainrot', 'gen-alpha', 'ai'], ...QBR },
  { category: 'teen', term: 'tralalero tralala', emoji: '🦈', ageGroup: 'gen_alpha', difficulty: 'hard', definition: 'An \u201CItalian brainrot\u201D character \u2014 the AI-generated shark in Nike sneakers, per Qustodio\u2019s brain-rot guide. Kids quote the catchphrase and trade the lore.', example: '\u201CTralalero tralala\u201D means nothing, and that\u2019s the point.', tags: ['brainrot', 'gen-alpha', 'ai'], ...QBR },
  { category: 'teen', term: 'ballerina cappuccina', emoji: '☕', ageGroup: 'gen_alpha', difficulty: 'hard', definition: 'An \u201CItalian brainrot\u201D character (a ballerina with a cappuccino head) from the same AI-generated absurdist universe Qustodio documents \u2014 catchy, weird, and everywhere in elementary hallways.', example: 'If you know the lore, you were shown it by a 9-year-old.', say: 'bah-leh-REE-nah cah-poo-CHEE-nah', tags: ['brainrot', 'gen-alpha', 'ai'], ...QBR },
];

// Existing terms that Qustodio ALSO documents — appended to the term's notes
// as a cross-citation. The original source stays primary. Keys are matched
// case-insensitively against term text.
export const QUSTODIO_CITATIONS = {
  'TDTM': QINT, 'ASL': QINT, 'IRL': QINT,
  'looksmaxxing': QLMX, 'mewing': QLMX, 'Chad': QLMX, 'mogging': QLMX, '-maxxing': QLMX,
  'sigma': Q('what-does-sigma-mean', 'What Does Sigma Mean? (2024)'),
  'alpha': Q('what-does-sigma-mean', 'What Does Sigma Mean? (2024)'),
  'beta': Q('what-does-sigma-mean', 'What Does Sigma Mean? (2024)'),
  'brain rot': QBR, 'Italian brainrot': QBR,
  'skibidi': Q('what-is-skibidi-toilet', 'What Is Skibidi Toilet?'),
  'skibidi toilet': Q('what-is-skibidi-toilet', 'What Is Skibidi Toilet?'),
  'chronically online': QCO,
  'NPC': QNPC, 'GRWM': Q('what-is-grwm-and-what-does-it-mean', 'What Is GRWM?'),
  'ASMR': Q('what-is-asmr', 'What Is ASMR?'),
  'VTuber': Q('what-is-a-vtuber', 'What Is a VTuber?'),
  'AI slop': Q('what-is-ai-slop', 'What Is AI Slop? (2026)'),
  'swatting': Q('what-is-doxxing', 'What Is Doxxing?'),
  'doxx': Q('what-is-doxxing', 'What Is Doxxing?'),
  'sextortion': Q('the-online-sextortion-epidemic-what-you-and-your-teen-need-to-know', 'Understanding Sextortion (2024)'),
  'gacha': Q('what-are-gacha-games', 'What Are Gacha Games?'),
  'loot boxes': Q('what-are-loot-boxes-how-harmful-are-they-to-kids', 'What Are Loot Boxes?'),
};
