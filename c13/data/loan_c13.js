// Loanwords section (C1.3 Unit 1 Emotions topic: words across languages)
// word|pos|UK IPA|US IPA|language|kind (loan or book)|definition|example|note
const LOAN_C13_RAW = `
angst|noun|æŋst|ɑːŋkst|German|loan|a strong feeling of anxiety and worry about life or the future|Many students feel a kind of angst in their final year at university, before choosing a career.|
schadenfreude|noun|ˈʃɑː.dən.frɔɪ.də||German|loan|a feeling of pleasure when something bad happens to someone else|He felt a little schadenfreude when his arrogant rival failed the exam he had boasted about.|
wanderlust|noun|ˈwɒn.də.lʌst|ˈwɑːn.dɚ.lʌst|German|loan|a strong wish to travel and see new places|After a trip to the Galápagos, her wanderlust grew even stronger.|
zeitgeist|noun|ˈzaɪt.ɡaɪst|ˈtsaɪt.ɡaɪst|German|loan|the general ideas, beliefs and mood of a particular period|Series like Black Mirror capture the anxious zeitgeist of the digital age.|
doppelgänger|noun|ˈdɒp.əlˌɡæŋ.ər|ˈdɑː.pəlˌɡæŋ.ɚ|German|loan|a person who looks exactly like someone else but is not related to them|I met my doppelgänger in Cuenca: same hair, same glasses, even the same jacket.|
kitsch|noun|kɪtʃ||German|loan|art or objects that are cheap, showy and in bad taste, sometimes enjoyed in a humorous way|The souvenir shop was full of kitsch, from glowing volcanoes to plastic llamas.|
ennui|noun|ɒnˈwiː|ɑːnˈwiː|French|loan|a feeling of boredom and tiredness because nothing seems interesting|The long, grey afternoons filled him with a deep sense of ennui.|
déjà vu|noun|ˌdeɪ.ʒɑː ˈvuː||French|loan|the strange feeling that you have already experienced the present situation|Walking into the lab for the first time, I had a strong feeling of déjà vu.|
joie de vivre|noun|ˌʒwɑː də ˈviː.vrə||French|loan|a feeling of great happiness and enjoyment of life|Even at ninety, my grandmother has an incredible joie de vivre.|
je ne sais quoi|noun|ˌʒə nə seɪ ˈkwɑː||French|loan|a pleasant quality that is difficult to describe|The old town of Quito has a certain je ne sais quoi that tourists love.|
faux pas|noun|ˌfəʊ ˈpɑː|ˌfoʊ ˈpɑː|French|loan|an embarrassing social mistake|Arriving late to a formal dinner is considered a faux pas in many cultures.|
naive|adjective|naɪˈiːv|nɑːˈiːv|French|loan|too ready to believe what people say because you lack experience|It was naive of me to think the project would be finished in a week.|
cliché|noun|ˈkliː.ʃeɪ|kliːˈʃeɪ|French|loan|an idea or phrase used so often that it has lost its original effect|"Follow your dreams" has become a cliché in graduation speeches.|
genre|noun|ˈʒɒn.rə|ˈʒɑːn.rə|French|loan|a type of film, music or writing with a particular style|Science fiction is the genre that best reflects our fears about technology.|
avant-garde|adjective|ˌæv.ɒ̃ˈɡɑːd|ˌɑː.vɑ̃ːˈɡɑːrd|French|loan|new and experimental, especially in art, music or literature|The festival screened several avant-garde short films.|
carte blanche|noun|ˌkɑːt ˈblɑːnʃ|ˌkɑːrt ˈblɑːnʃ|French|loan|complete freedom to do whatever you want|The director gave the team carte blanche to redesign the website.|
entrepreneur|noun|ˌɒn.trə.prəˈnɜːr|ˌɑːn.trə.prəˈnɝː|French|loan|a person who starts their own business, often taking financial risks|A young entrepreneur from Latacunga created an app to monitor power cuts.|
rendezvous|noun|ˈrɒn.deɪ.vuː|ˈrɑːn.deɪ.vuː|French|loan|an arranged meeting, or the place where people meet|The main square was our usual rendezvous after class.|
raison d'être|noun|ˌreɪ.zɒn ˈdet.rə|ˌreɪ.zoʊn ˈdet.rə|French|loan|the most important reason for someone's or something's existence|Helping rural communities get electricity is the raison d'être of the project.|
fait accompli|noun|ˌfeɪt əˈkɒm.pliː|ˌfeɪt ə.kɑːmˈpliː|French|loan|something that has already happened and cannot be changed|The decision was presented to the staff as a fait accompli.|
cul-de-sac|noun|ˈkʌl.də.sæk||French|loan|a street closed at one end; also, a situation with no way forward|The negotiations reached a cul-de-sac and both sides walked away.|
fiasco|noun|fiˈæs.kəʊ|fiˈæs.koʊ|Italian|loan|a complete failure, especially an embarrassing one|The launch was a fiasco: the projector broke and nobody could hear the speaker.|
incognito|adverb|ˌɪn.kɒɡˈniː.təʊ|ˌɪn.kɑːɡˈniː.t̬oʊ|Italian|loan|hiding your real identity|The singer travelled incognito to avoid photographers.|
gusto|noun|ˈɡʌs.təʊ|ˈɡʌs.toʊ|Italian|loan|great energy and enthusiasm|The choir sang the national anthem with real gusto.|
bravado|noun|brəˈvɑː.dəʊ|brəˈvɑː.doʊ|Spanish|loan|a show of confidence or courage, often to hide fear|His bravado disappeared as soon as the exam started.|
machismo|noun|məˈtʃɪz.məʊ|mɑːˈtʃiːz.moʊ|Spanish|loan|strong or aggressive male pride|The campaign challenges the machismo that still exists in some workplaces.|
aficionado|noun|əˌfɪʃ.i.əˈnɑː.dəʊ|əˌfɪʃ.i.əˈnɑː.doʊ|Spanish|loan|a person who knows a lot about a subject and is very enthusiastic about it|Coffee aficionados travel to Loja to taste its famous beans.|
bonanza|noun|bəˈnæn.zə||Spanish|loan|a situation in which people suddenly make a lot of money or have a lot of success|The oil boom was a bonanza for some regions of Ecuador.|
siesta|noun|siˈes.tə||Spanish|loan|a short sleep after lunch|In some small towns, shops close for a siesta in the early afternoon.|
emoji|noun|ɪˈməʊ.dʒi|ɪˈmoʊ.dʒi|Japanese|loan|a small digital image used to express an idea or emotion|She replied with a single emoji, and I knew immediately she was upset.|
tsunami|noun|tsuːˈnɑː.mi||Japanese|loan|a very large wave caused by an earthquake; also, a sudden large amount of something|After the announcement, the office received a tsunami of complaints.|
tycoon|noun|taɪˈkuːn||Japanese|loan|a very rich and powerful person in business|A media tycoon bought the television channel last year.|
karma|noun|ˈkɑː.mə|ˈkɑːr.mə|Sanskrit & Hindi|loan|the idea that your actions will affect what happens to you in the future|He believes his good luck is karma for helping his neighbours.|
guru|noun|ˈɡʊr.uː|ˈɡuː.ruː|Sanskrit & Hindi|loan|an expert who gives advice, or a spiritual teacher|She is the fitness guru everyone follows on social media.|
avatar|noun|ˈæv.ə.tɑːr||Sanskrit & Hindi|loan|a picture that represents you online|Choose an avatar before you join the game.|
verbatim|adverb|vɜːˈbeɪ.tɪm|vɝːˈbeɪ.t̬ɪm|Latin|loan|using exactly the same words|The journalist quoted the minister's statement verbatim.|
status quo|noun|ˌsteɪ.təs ˈkwəʊ|ˌsteɪ.t̬əs ˈkwoʊ|Latin|loan|the present situation|Some people resist change because they benefit from the status quo.|
ad hoc|adjective|ˌæd ˈhɒk|ˌæd ˈhɑːk|Latin|loan|made or done only for a particular purpose, not planned in advance|The committee was formed on an ad hoc basis after the floods.|
bona fide|adjective|ˌbəʊ.nə ˈfaɪ.di|ˌboʊ.nə ˈfaɪ.di|Latin|loan|real and genuine, not false|Only bona fide students can apply for the discount.|
per se|adverb|ˌpɜː ˈseɪ|ˌpɝː ˈseɪ|Latin|loan|by itself, considered alone|Technology is not harmful per se; it depends on how we use it.|
vice versa|adverb|ˌvaɪs ˈvɜː.sə|ˌvaɪ.sə ˈvɝː.sə|Latin|loan|in the opposite way to what has just been said|Our emotions affect our health, and vice versa.|
alter ego|noun|ˌɔːl.tər ˈiː.ɡəʊ|ˌɑːl.t̬ɚ ˈiː.ɡoʊ|Latin|loan|a second personality, different from your usual one|On stage, the shy engineer becomes his loud alter ego.|
Torschlusspanik|noun|ˈtɔː.ʃlʊs.pæn.ɪk|ˈtɔːr.ʃlʊs.pæn.ɪk|German|book|the anxiety that time is running out to take life's opportunities|Turning thirty gave him a sudden Torschlusspanik about travelling and having a family.|No single English word for this.
saudade|noun|saʊˈdɑː.də||Portuguese|book|a deep, sad longing for someone or something that is gone|Listening to old songs from home fills many migrants with saudade.|No single English word for this.
rimorso|noun|rɪˈmɔː.səʊ|rɪˈmɔːr.soʊ|Italian|book|regret for something you did|She felt rimorso for the angry message she had sent.|Not an English word: it appears in the book as an example.
rimpianto|noun|rɪmˈpjæn.təʊ|rɪmˈpjɑːn.toʊ|Italian|book|regret for something you did not do|His rimpianto was never having studied music.|Not an English word: it appears in the book as an example.
age-otori|noun|ˌɑː.ɡeɪ.əʊˈtɔː.ri|ˌɑː.ɡeɪ.oʊˈtɔːr.i|Japanese|book|the disappointment of looking worse after a haircut|I came out of the hairdresser's with a serious case of age-otori.|Not an English word: it appears in the book as an example.
`;
