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
  startDate: '2026-05-02T17:04:36+02:00',
  milestoneDate: '2026-06-02T17:04:36+02:00',
  fromName: 'Your favourite person',
  toName: 'My love',
  heroMessage:
    'A little place for the first month: the laughs, the photos, the tiny moments, and the feeling that something beautiful has started.',
  aboutHer:
    'She is the turquoise in the room: bright, playful, impossible to miss, and somehow calming at the same time. She finds joy everywhere, whether it is sushi, a Lunch Bar, a Red Bull, a random laugh, or one of those small moments most people would walk straight past. She is creative in a way that turns ideas into something real, especially through fashion design, where her eye for colour, shape, and detail makes everything feel more alive. She loves plants, flowers, and nature, and that makes sense, because she has the same kind of energy: warm, growing, outgoing, and full of personality. She can be silly, she can be bold, she can light up a room, and she carries this whole little universe with her: The Vampire Diaries, Marvel, Spider-Man, Lego, flowers, outfits, snacks, and all the joy in between.',
  closing:
    'This is only month one, but it already feels like the start of something I am lucky to keep discovering.',
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
