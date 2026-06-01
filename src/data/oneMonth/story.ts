export type OneMonthMemory = {
  id: number
  src: string
  alt: string
  date?: string
  caption?: string
  note?: string
}

export const oneMonthStory = {
  title: 'My Month With You',
  eyebrow: 'One month of us',
  startDate: '2026-05-02T12:04:36+02:00',
  milestoneDate: '2026-06-02T12:04:36+02:00',
  fromName: 'Your favourite person',
  toName: 'My love',
  heroMessage:
    'Thirty one days can sound small until it is thirty one days of laughing with you, learning you, and finding little reasons to choose you again.',
  aboutHer: [
    'You have this turquoise kind of energy: bright, impossible to miss, and somehow calming at the same time.',
    'You find joy in the smallest things, from sushi plans and Lunch Bar chocolate to a Red Bull side quest that suddenly becomes the best part of the day.',
    'You are creative in a way that actually becomes something real. The way you see clothes, ideas, colours, plants, flowers, and little details makes the world feel more designed, more alive.',
    'You are outgoing, silly, warm, and beautifully yourself. A fashion designer with main character energy, Vampire Diaries loyalty, Marvel opinions, Spider-Man sparkle, and enough Lego-level imagination to build a whole universe out of a normal day.',
  ],
  closing:
    'This is only month one, but it already feels like the start of something I am lucky to keep discovering.',
  memories: Array.from({ length: 13 }, (_, index) => {
    const id = index + 1

    return {
      id,
      src: `/one-month/${id}.jpg`,
      alt: `Memory ${id} from their first month together`,
      caption: `Memory ${id}`,
    }
  }) satisfies OneMonthMemory[],
}
