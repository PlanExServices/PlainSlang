// Pack expansion v8 — emoji codes round two, from Bark's dedicated
// drug-emoji and sexting-code guides (both fetched & read 2026-09-07).
// Every entry cites the specific Bark guide it appears in.

const BARKD = {
  sourceName: 'Bark — Drug Slang Emojis & Codes (2026)',
  sourceUrl: 'https://www.bark.us/blog/drug-slang-emojis/',
};
const BARKS = {
  sourceName: 'Bark — Sexual Slang & Sexting Codes (2026)',
  sourceUrl: 'https://www.bark.us/blog/sexual-slang/',
};

export const PACK_TERMS_V8 = [
  // ---- Drug-code emojis (Bark drug guide) ----
  { category: 'emoji', term: 'plant emojis 🌿🍁🥦', emoji: '🌿', difficulty: 'medium', related: ['safety'], definition: 'Marijuana. Bark lists the whole garden: 🌿 🍁 🎄 🍃 🥦 🍀 🌴 — broccoli and Christmas trees included. Context: buying/selling talk, not salad.', example: '“got that 🥦” is not about vegetables.', tags: ['drugs', 'parent-alert'], ...BARKD },
  { category: 'emoji', term: 'snowflake ❄️', emoji: '❄️', difficulty: 'medium', related: ['safety'], definition: 'Cocaine — “snow.” Bark also lists 🥥 🤧 🔑 ⛄ 🎱 🐡 as cocaine codes.', example: 'A ❄️ in a Venmo note deserves a question.', tags: ['drugs', 'parent-alert'], ...BARKD },
  { category: 'emoji', term: 'pill 💊', emoji: '💊', difficulty: 'easy', related: ['safety'], definition: 'Pills generally — prescription drugs, oxy, or Xanax. With 🅿️ or 🔵 it often means “percs”/“blues” (usually counterfeit fentanyl — the deadliest code on this list).', example: '“got 🔵s” — treat as an emergency conversation.', tags: ['drugs', 'parent-alert', 'fentanyl'], ...BARKD },
  { category: 'emoji', term: 'syringe 💉', emoji: '💉', difficulty: 'medium', related: ['safety'], definition: 'Heroin/injection drugs. Bark also lists 🐉 🐎 🎯 🤎 as heroin codes.', example: 'Rare in teen chats — but unambiguous when present.', tags: ['drugs', 'parent-alert'], ...BARKD },
  { category: 'emoji', term: 'mushroom 🍄', emoji: '🍄', difficulty: 'easy', related: ['safety'], definition: 'Psilocybin (“magic”) mushrooms. Sometimes literal Mario nostalgia — context decides.', example: '🍄 + “trip” talk = not Mario.', tags: ['drugs', 'parent-alert'], ...BARKD },
  { category: 'emoji', term: 'grapes 🍇', emoji: '🍇', difficulty: 'hard', related: ['safety'], definition: 'Cough syrup / lean codes: 🍼 🍇 💜 🔮 — purple things reference “purple drank.”', example: '“pouring 🍇” references lean, not juice.', tags: ['drugs', 'parent-alert'], ...BARKD },
  { category: 'emoji', term: 'candy 🍬', emoji: '🍬', difficulty: 'hard', related: ['safety'], definition: 'MDMA/ecstasy — “candy.” Bark also lists ❤️⚡🤯❌ combos. Also literal candy 95% of the time; look for party context.', example: '🍬 + rave plans = worth asking.', tags: ['drugs', 'parent-alert', 'dual-meaning'], ...BARKD },
  { category: 'emoji', term: 'gem stone 💎', emoji: '💎', difficulty: 'hard', related: ['safety'], definition: 'Crystal meth codes per Bark: 💎 🏔 💙 🧪. (💎 alone is usually just “valuable/premium” — combos matter.)', example: '🧪 + “glass” talk is the red-flag pairing.', tags: ['drugs', 'parent-alert'], ...BARKD },
  { category: 'emoji', term: 'moai 🗿', emoji: '🗿', difficulty: 'medium', related: ['teen', 'safety'], definition: 'Two very different uses: Bark logs it as “stoned” in drug contexts — but in meme culture it\u2019s a deadpan/sigma reaction face. Overwhelmingly the meme; check context.', example: 'Under a gym video it\u2019s deadpan cool; in a dealer chat it\u2019s stoned.', tags: ['dual-meaning', 'meme'], ...BARKD },
  { category: 'emoji', term: 'onion 🧅', emoji: '🧅', difficulty: 'hard', related: ['safety'], definition: 'An ounce (of a substance being bought/sold). Pure dealer shorthand.', example: '“half 🧅” in a payment note.', tags: ['drugs', 'parent-alert', 'dealing'], ...BARKD },
  { category: 'emoji', term: 'electric plug 🔌', emoji: '🔌', difficulty: 'medium', related: ['safety', 'teen'], definition: 'The plug — a dealer or source. Pairs with the slang term; in bios it advertises “I sell.”', example: '🔌 in a Snapchat bio is not about chargers.', tags: ['drugs', 'parent-alert', 'dealing'], ...BARKD },
  { category: 'emoji', term: 'money bags 💰🤑', emoji: '💰', difficulty: 'hard', related: ['safety'], definition: 'In dealer posts, Bark flags 🤑 💰 💵 👑 as drug-deal advertising dressing. Innocent alone; suspicious in combos with product emojis.', example: '🔌+💊+💰 in one bio tells a story.', tags: ['dealing', 'dual-meaning'], ...BARKD },
  { category: 'emoji', term: 'dash 💨', emoji: '💨', difficulty: 'medium', related: ['safety'], definition: 'Smoke — a joint, vaping, or being gone/fast. With 🔥 or 🍃 it\u2019s smoking; alone it\u2019s often just “zoom.”', example: '“bout to 💨🍃” is explicit enough.', tags: ['drugs', 'dual-meaning'], ...BARKD },
  { category: 'emoji', term: 'fuel pump ⛽', emoji: '⛽', difficulty: 'hard', related: ['safety', 'teen'], definition: '“Gas” — high-quality weed, or being gassed (intoxicated). Also the slang compliment “that\u2019s gas.”', example: '⛽ under a music drop = praise; in a buy chat = weed.', tags: ['drugs', 'dual-meaning'], ...BARKD },
  { category: 'emoji', term: 'rocket 🚀', emoji: '🚀', difficulty: 'hard', related: ['safety', 'gaming'], definition: 'Bark: high-quality drugs or being very intoxicated. Elsewhere: hype/“to the moon” (crypto, stocks, games). Heavily context-dependent.', example: '🚀🚀 under a meme coin vs. in a plug\u2019s menu.', tags: ['dual-meaning'], ...BARKD },
  { category: 'emoji', term: 'pie 🥧', emoji: '🥧', difficulty: 'hard', related: ['safety'], definition: 'A large quantity of drugs (also 🍪 “cookie”). Weight-move talk, not baking.', example: '“moving 🥧s” is dealer language.', tags: ['drugs', 'dealing', 'parent-alert'], ...BARKD },

  // ---- Sexting-code emojis (Bark sexting guide) ----
  { category: 'emoji', term: 'banana 🍌', emoji: '🍌', difficulty: 'easy', related: ['safety'], definition: 'Penis — the eggplant\u2019s understudy. Bark logs both.', example: 'Flirty DMs, not fruit salads.', tags: ['sexual', 'parent-alert'], ...BARKS },
  { category: 'emoji', term: 'cat face 😼', emoji: '😼', difficulty: 'hard', related: ['safety'], definition: 'Vagina in sexting contexts (the smirking cat). Innocent as a random cat elsewhere.', example: 'Context: paired with 🍆/😈 it\u2019s explicit.', tags: ['sexual', 'dual-meaning'], ...BARKS },
  { category: 'emoji', term: 'peanuts 🥜', emoji: '🥜', difficulty: 'hard', related: ['safety'], definition: 'To ejaculate (“bust a nut”). One parents never catch.', example: 'In flirty chats, 🥜 is not a snack.', tags: ['sexual', 'parent-alert'], ...BARKS },
  { category: 'emoji', term: 'circle + anger ⭕💢', emoji: '⭕', difficulty: 'hard', related: ['safety'], definition: 'Oral sex code per Bark\u2019s sexting guide (the combo, not either alone).', example: 'An odd pairing worth recognizing.', tags: ['sexual', 'parent-alert'], ...BARKS },
  { category: 'emoji', term: 'black + orange squares ⬛🟧', emoji: '⬛', difficulty: 'hard', related: ['safety'], definition: 'Pornhub\u2019s logo colors — referencing porn without words. Also “P⭐” = porn star.', example: '⬛🟧 in a bio or comment = porn reference.', tags: ['sexual', 'algospeak', 'parent-alert'], ...BARKS },
  { category: 'emoji', term: 'S 🥚 s (seggs)', emoji: '🥚', difficulty: 'medium', related: ['safety', 'texting'], definition: '“Sex” spelled to dodge filters: S-egg-s, or written “seggs.” Core algospeak parents should recognize.', example: '“talking about s🥚s ed” slides past moderation.', tags: ['sexual', 'algospeak'], ...BARKS },
];
