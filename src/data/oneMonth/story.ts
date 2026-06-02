export type OneMonthMemory = {
  id: number
  src: string
  alt: string
  date?: string
  caption?: string
  note?: string
}

export const oneMonthStory = {
  title: 'Kelly, This Month Felt Like Colour',
  eyebrow: 'One month with Kelly',
  startDate: '2026-05-02T17:04:36+02:00',
  milestoneDate: '2026-06-02T17:04:36+02:00',
  // Display labels are kept as literal copy (not derived) so the exact 17:04:36 time
  // can never be shifted by a server timezone during date formatting.
  startedLabel: '2 May 2026, 17:04:36',
  milestoneLabel: '2 June 2026, 17:04:36',
  fromName: 'Your favourite person',
  toName: 'Kelly',
  heroMessage:
    'A small garden of photos, colour, silly little joys, and every reason this first month already feels unforgettable.',
  aboutHer:
    "When I think about you, I don't just think about the things you like. I think about the way you experience the world. You have this incredible ability to find joy in places where most people would walk right past it. Whether it's getting excited over a new plant, laughing at something completely random, or turning an ordinary day into a good memory, you remind me that happiness isn't something you wait for, it's something you create. I admire how fearlessly creative you are and how you pour so much of yourself into everything you do. Watching you chase your passion to design, create, express yourself through your ideas, and dream so boldly makes me so proud of you. You have a personality that draws people in, not because you're trying to impress anyone, but because you're genuinely yourself: kind, vibrant, funny, and full of life.\n\nI love the little things that make you smile, the way your eyes light up when you talk about something you're passionate about, and how you can be both wonderfully silly and incredibly inspiring at the same time. You bring so much colour into my life. You make the ordinary feel special, the difficult feel easier, and the good moments feel unforgettable. Every day with you feels like another page in a story I never want to stop reading. Celebrating this month with you isn't just celebrating time that's passed. It's celebrating every laugh, every conversation, every memory, and every reason I've fallen even more in love with the amazing person you are.",
  closing:
    'This is only month one, Kelly, but it already feels like the start of something I am lucky to keep discovering.',
}

export function createOneMonthMemories(count: number): OneMonthMemory[] {
  return Array.from({ length: count }, (_, index) => {
    const id = index + 1

    return {
      id,
      src: `/one-month/${id}.jpg`,
      alt: `Memory ${id} from their first month together`,
      caption: `Memory ${id}`,
    }
  })
}
