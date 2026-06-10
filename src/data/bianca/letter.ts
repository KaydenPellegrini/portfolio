// All copy for the hidden "Vir Bianca" graduation page lives here so the words
// can be edited without touching layout. Afrikaans throughout. The typographic
// apostrophe (’) in "’n" is intentional — keep it.

export type BiancaPhoto = {
  src: string
  width: number
  height: number
  alt: string
}

export const biancaPhotos = {
  embrace: {
    src: '/bianca/embrace.jpg',
    width: 1280,
    height: 1599,
    alt: 'Mammie hou Bianca styf vas in haar gradeplegtigheidstabberd',
  },
  childhood: {
    src: '/bianca/childhood-graduation.jpg',
    width: 1000,
    height: 1500,
    alt: 'Bianca in haar tabberd hou ’n foto vas van haarself as klein dogtertjie in ’n gradeplegtigheidstabberd',
  },
  mammieGarden: {
    src: '/bianca/mammie-and-bianca.jpg',
    width: 1067,
    height: 1600,
    alt: 'Mammie en Bianca staan saam in die tuin op haar gradeplegtigheid',
  },
  mammieLaughing: {
    src: '/bianca/mammie-and-bianca-laughing.jpg',
    width: 1000,
    height: 1500,
    alt: 'Mammie en Bianca hou hande vas en lag saam',
  },
  portraitWarm: {
    src: '/bianca/portrait-warm.jpg',
    width: 1066,
    height: 1600,
    alt: 'Bianca glimlag warm in die middagson',
  },
  portraitJoy: {
    src: '/bianca/portrait-joy.jpg',
    width: 865,
    height: 1297,
    alt: 'Bianca lag uitbundig met haar hande in die lug',
  },
  familyKiss: {
    src: '/bianca/family-kiss.jpg',
    width: 1600,
    height: 1280,
    alt: 'Bianca lag terwyl haar familie haar op albei wange soen',
  },
  familyThree: {
    src: '/bianca/family-three.jpg',
    width: 926,
    height: 1388,
    alt: 'Bianca saam met haar familie op haar gradeplegtigheid',
  },
  family1: {
    src: '/bianca/bianca-and-family-1.jpg',
    width: 928,
    height: 1391,
    alt: 'Bianca in haar tabberd saam met geliefdes',
  },
  family2: {
    src: '/bianca/bianca-and-family-2.jpg',
    width: 1000,
    height: 1500,
    alt: 'Bianca saam met geliefdes in die sonlig',
  },
  certificate: {
    src: '/bianca/certificate.jpg',
    width: 907,
    height: 1361,
    alt: 'Bianca hou trots haar graadsertifikaat vas',
  },
  capWide: {
    src: '/bianca/cap-future-wide.jpg',
    width: 1390,
    height: 927,
    alt: 'Bianca se familie help haar haar gradeplegtigheidskepie regmaak',
  },
  cap: {
    src: '/bianca/cap-future.jpg',
    width: 1390,
    height: 927,
    alt: 'Bianca glimlag terwyl haar familie haar gradeplegtigheidskepie reg sit',
  },
} satisfies Record<string, BiancaPhoto>

export const biancaContent = {
  hero: {
    eyebrow: '’n Brief van Mammie',
    title: 'Vir Bianca',
    signature: 'Met al my liefde en trots, Mammie',
  },

  words: {
    eyebrow: 'Wie jy is',
    intro: 'Ses woorde — en steeds te min vir alles wat jy is.',
    items: ['Sterk', 'Vurig', 'Vasberade', 'Veerkragtig', 'Goedhartig', 'Pragtig van binne en buite'],
  },

  journey: {
    eyebrow: 'Jou reis',
    title: 'Van toe tot nou',
    steps: [
      { title: 'Van jou eerste skooldag…', note: 'die klein dogtertjie met die groot drome.' },
      { title: 'Deur die laat nagte…', note: 'die ure wat niemand gesien het nie.' },
      { title: 'Deur elke uitdaging…', note: 'wat jy met grasie oorkom het.' },
      { title: 'Tot hierdie oomblik.', note: 'trots, stralend, en heeltemal jy.' },
    ],
  },

  letter: {
    eyebrow: 'Die brief',
    heading: 'Vir my dogter',
    opening:
      'Van die dag af wat jy gebore is, tot jou heel eerste skooldag, en nou tot hierdie ongelooflike oomblik waar jy oor die verhoog stap by jou gradeplegtigheid, was jy ’n absolute vreugde om dop te hou en ’n voorreg om lief te hê.',
    virtues: [
      'Jy is sterk.',
      'Jy is vurig.',
      'Jy is vasberade.',
      'Jy is veerkragtig.',
      'Jy is goedhartig.',
      'En jy is pragtig, van binne en buite.',
    ],
    body: [
      'Om te sien hoe jy soveel verantwoordelikhede balanseer, deur laat nagte werk, en elke uitdaging met vasberadenheid en grasie oorkom, was ongelooflik inspirerend.',
      'Jou deursettingsvermoë is een van jou grootste sterkpunte, en dit sal jou ver bring terwyl jy hierdie opwindende nuwe hoofstuk van jou lewe betree.',
      'Jy het ’n briljante verstand, maar dit is jou sagte, liefdevolle hart wat my die trotsste maak. Die manier waarop jy vir ander omgee, getrou bly aan jouself, en die lewe met soveel warmte benader, is werklik besonders.',
      'Jy het nie net ’n graad verwerf nie. Jy het bewys dat enigiets moontlik is met passie, toewyding, geloof en deursettingsvermoë.',
      'Ek kon nie trotser wees op die merkwaardige vrou wat jy geword het nie.',
    ],
    congrats: 'Baie geluk met jou gradeplegtigheid, Bianca.',
    blessing:
      'Moet nooit daardie helder lig verloor wat so mooi binne jou skyn nie. Terwyl jy die toekoms tegemoet stap, onthou dat die wêreld joune is om te verken, en dat dit soveel beter is omdat jy deel daarvan is.',
    emphasis: ['Ek is so ongelooflik trots op jou.', 'Ek is so lief vir jou.'],
    signoffLine: 'Met al my liefde en trots,',
    signoffName: 'Mammie',
  },

  climax: {
    eyebrow: 'Omring deur liefde',
    title: 'Jou oomblik, saam met ons',
    line: 'Die soetste deel van die dag — gedeel met die mense wat jou die meeste liefhet.',
  },

  achievement: {
    eyebrow: 'Jou prestasie',
    title: 'Jy het dit verdien.',
    line: 'Jy het nie net ’n graad verwerf nie — jy het bewys dat enigiets moontlik is met passie, toewyding, geloof en deursettingsvermoë.',
    badge: 'Gradeplegtigheid · 2026',
  },

  future: {
    eyebrow: 'Die pad vorentoe',
    title: 'Terwyl jy die toekoms tegemoet stap…',
    line: 'onthou dat die wêreld joune is om te verken — en dat dit soveel beter is omdat jy deel daarvan is.',
  },

  closing: {
    title: 'Die wêreld is joune, Bianca.',
    subtitle: 'En ek sal altyd jou grootste ondersteuner wees.',
    signoff: 'Mammie',
  },
}
