# C1.2 module (EF General English C1.2, Units 1 to 6)

Data, audio and tooling for the C1.2 level of the EF Study Lab. Nothing here is wired into `index.html` yet; `build.py` adds it.

Internal unit numbers continue after B2.1 (1-6) and B2.2 (7-12): **C1.2 uses 13-18**.

| Unit | Book unit | Name |
|---|---|---|
| 13 | 1 | Fashion & trends |
| 14 | 2 | Play |
| 15 | 3 | History |
| 16 | 4 | Buying & selling |
| 17 | 5 | Other worlds |
| 18 | 6 | Nature |

## Folder

```
c12/
  data/vocab_c12.js       VOCAB_C12_RAW, WF_C12_RAW
  data/grammar_c12.js     GRAMMAR_C12, GMORE_C12
  data/colloc_c12.js      COLLOC_C12_RAW, COLSRC_C12
  data/exams_c12.js       UNITS_C12, BOOK_C12, GX_C12_P1..P4, RX_C12, WX_C12, INTO_C12_RAW
  data/listening_c12.js   LX_C12_P1, LX_C12_P2, CL_C12_1, CL_C12_2, CL_C12_4 (needs V_ from the app)
  audio/*.mp3             recorded voices (Kokoro neural TTS)
  audio/audman_c12.json   word/sentence audio manifest
  audio/lman_c12.json     listening programmes
  build.py                patches an index.html to add the level
  make_audio.py, tts.py   audio generator
```

## Data formats

All formats are identical to the B2.2 ones (`VOCAB22_RAW`, `GRAMMAR22`, ...). Text is English only.

**VOCAB_C12_RAW** (template string). `#13` starts a unit; then one line per item:
`word|pos|UK IPA|US IPA (empty = same as UK)|definition|example`
pos: noun, verb, adjective, adverb, phrase, phrasal verb.

**WF_C12_RAW** (word families). 16 fields:
`BASE|unit|meaning|nouns|verbs|adjectives|adverbs|negatives|sentence1 with ___|answers1|P1|why1|sentence2 with ___|answers2|P2|why2`
Forms are comma-separated; P is N, V, A or D (part of speech of the answer).

**GRAMMAR_C12** (array of 12 topics, 2 per unit):
`{id, unit, lesson, title, what, form[], uses[[label, example]], mistakes[], practice[[sentence, [3 options], correctIndex, why]]}`
**GMORE_C12**: `{ topicId: [12 more items in the practice format] }`.

**COLLOC_C12_RAW**. 10 fields per line:
`unit|node|type|phrase|key|key as in example|definition|example|3 wrong collocates (as in example)|3 wrong collocates (base form, optional)`
**COLSRC_C12**: node to Oxford Learner's Dictionaries entry id.

**UNITS_C12**: `[{n, name, color}]`. **BOOK_C12**: `{unit: {outcomes[], writing, tips[]}}`.

**Grammar test (20 points)**, three versions of each part, mixed at random:
- `GX_C12_P1` multiple-choice cloze: `{title, text with (1)..(10), q:[[correct, wrong, wrong, wrong, why]]}` (first option is correct; shuffled on screen).
- `GX_C12_P2` open cloze: `{title, bank[15], text with (11)..(20), a:[[answer, why]]}`.
- `GX_C12_P3` word formation: `{title, text with (21)..(30), w:[[BASE, answer]]}`.
- `GX_C12_P4` key word transformations: `[[original, KEY, sentence with ___, [accepted answers, lowercase], why]]` x5.

**Skills test (30 points)**:
- `LX_C12_P1` listening Part 1 interviews: `{title, intro, voices:{role: V_.id}, script:[[role, text]], q:[[question, correct, wrong, wrong, wrong]]}`.
- `LX_C12_P2` listening Part 2, five speakers: `{title, topic, who[8], op[8], sp:[[text, whoIndex, opIndex, voiceId]]}`.
- `RX_C12` reading multiple matching: `{title, ask, intro, texts:[[letter, text]], q:[[question, textIndex]]}`.
- `WX_C12` writing tasks: `{type: essay|report|proposal|email, unit, title, task, notes[], useful[]}`. C1.2 tasks ask for 220-260 words. Model answers for these text types are the existing `FORMATS` entries (essay, report, proposal, formal).

**Listening practice**:
- `CL_C12_1` short extracts: `[{title, ex:[{ctx, q, o[3], a, lines:[[voiceId, text]]}]}]` (6 extracts per set).
- `CL_C12_2` sentence completion: `{title, intro, voice, text, items:[[sentence with ___, [accepted answers]]]}`.
- `CL_C12_4` interviews: `{title, intro, voices, script, q:[[question, opt, opt, opt, correctIndex]]}`.

**INTO_C12_RAW** (pronunciation): `unit|type|word|ipa|stress word|ipa|stress ... #F || ... #R`. Groups split by ` || `, each ending in `#F` (fall), `#R` (rise) or `#FR`; stress 0 = weak, 1 = stressed, 2 = nucleus, a trailing `+` links to the next word.

## Audio

Voices: UK `bf_emma`, US `af_heart` for words and sentences; listening uses several British and American voices plus a narrator (`bm_george`).

- **audman_c12.json**: `{uk|us: {group: {text: [start_sec, duration_sec]}}}`. Each group is one file `audio/<acc>-<group>.mp3` (`c12words`, `c12ex13`..`c12ex18`, `c12gram`, `c12colph`, `c12colex`, `c12pron`). Texts are keyed by the app's `ACLEAN` form (round brackets removed, contents kept).
- **lman_c12.json**: `{key: [["s", start, end] | ["w", seconds]]}`. One file `audio/<key>.mp3` per listening; the programme plays instructions, reading time, the recording twice. Keys: `c12ef1-i` (LX_C12_P1), `c12ef2-i` (LX_C12_P2), `c12cl1-i`, `c12cl2-i`, `c12cl4-i`.

## Integrating

```
python3 c12/build.py index.html index_c12.html
```
`build.py` inserts the data after the B2.2 level helpers, registers level "C1.2", makes exam, listening and writing helpers level-aware (`lvPack`, `LVPRE`, `WLO`/`WHI` word limits), shows unit numbers 1-6 inside every level (`uNum`), merges the audio manifests and adds unit colours. It expects the data in `c12/data` and manifests in `c12/audio`; the mp3 files go in the app's `audio/` folder.
