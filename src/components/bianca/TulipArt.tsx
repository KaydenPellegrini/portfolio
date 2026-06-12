import type { CSSProperties } from 'react'

/**
 * Hand-drawn SVG of the tulips Mammie gave Bianca: three yellow blooms with the
 * orange flame streaks of the real flowers, wrapped in yellow tissue and tied
 * with a black ribbon. The arrangement sways gently in the breeze; warm gold
 * glow against the page's cool navy, like a candle in the night.
 */
export default function TulipArt() {
  return (
    <svg
      viewBox="0 0 400 540"
      role="img"
      aria-label="Illustrasie van geel tulpe met ’n swart lint, soos die wat Mammie vir Bianca gegee het"
      className="mx-auto h-auto w-full"
    >
      <defs>
        <linearGradient id="tl-petal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE7A0" />
          <stop offset="0.55" stopColor="#FBBF24" />
          <stop offset="1" stopColor="#F0A413" />
        </linearGradient>
        <linearGradient id="tl-petal-side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F8C84A" />
          <stop offset="1" stopColor="#E2890C" />
        </linearGradient>
        <linearGradient id="tl-flame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FB923C" />
          <stop offset="0.6" stopColor="#F2680F" />
          <stop offset="1" stopColor="#DC4A06" />
        </linearGradient>
        <linearGradient id="tl-stem" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4E9A3E" />
          <stop offset="1" stopColor="#26602A" />
        </linearGradient>
        <linearGradient id="tl-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#57A847" />
          <stop offset="1" stopColor="#2B6A2E" />
        </linearGradient>
        <linearGradient id="tl-wrap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FDE56A" />
          <stop offset="1" stopColor="#E0A91A" />
        </linearGradient>
        <radialGradient id="tl-warm" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#F7C95B" stopOpacity="0.5" />
          <stop offset="1" stopColor="#F7C95B" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="tl-cool" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0" stopColor="#7C3AED" stopOpacity="0.32" />
          <stop offset="0.6" stopColor="#2563EB" stopOpacity="0.16" />
          <stop offset="1" stopColor="#2563EB" stopOpacity="0" />
        </radialGradient>

        <g id="tl-bloom">
          {/* side petals (behind), rounded tips, hugging into a closed cup */}
          <path fill="url(#tl-petal-side)" d="M0,0 C-17,-30 -19,-74 -7,-92 C-3,-97 3,-97 7,-92 C19,-74 17,-30 0,0 Z" transform="rotate(-19)" />
          <path fill="url(#tl-petal-side)" d="M0,0 C-17,-30 -19,-74 -7,-92 C-3,-97 3,-97 7,-92 C19,-74 17,-30 0,0 Z" transform="rotate(19)" />
          {/* front centre petal */}
          <path fill="url(#tl-petal)" d="M0,3 C-19,-28 -22,-86 -8,-106 C-3,-112 3,-112 8,-106 C22,-86 19,-28 0,3 Z" />
          {/* orange flame streaks */}
          <path fill="url(#tl-flame)" opacity="0.9" d="M0,-6 C-8,-32 -9,-66 -3,-86 C-1,-90 1,-90 3,-86 C9,-66 8,-32 0,-6 Z" />
          <path fill="url(#tl-flame)" opacity="0.6" d="M0,-6 C-6,-26 -6,-52 0,-72 C6,-52 6,-26 0,-6 Z" transform="rotate(-19)" />
          <path fill="url(#tl-flame)" opacity="0.6" d="M0,-6 C-6,-26 -6,-52 0,-72 C6,-52 6,-26 0,-6 Z" transform="rotate(19)" />
          {/* petal seam highlight */}
          <path fill="none" stroke="#FFF3C4" strokeOpacity="0.45" strokeWidth="1.4" d="M0,-4 C-10,-32 -11,-78 0,-102" />
        </g>
      </defs>

      {/* cool aura (page palette) then warm halo behind the blooms */}
      <ellipse cx="200" cy="206" rx="184" ry="208" fill="url(#tl-cool)" />
      <ellipse cx="206" cy="150" rx="150" ry="128" fill="url(#tl-warm)" />

      {/* the swaying arrangement: leaves, stems, blooms */}
      <g className="bianca-sway" style={{ '--bx-dur': '7.5s', '--bx-rot': '1.4deg' } as CSSProperties}>
        <path fill="url(#tl-leaf)" d="M200,352 C150,300 112,250 102,196 C122,250 166,302 206,352 Z" />
        <path fill="url(#tl-leaf)" d="M205,352 C256,300 296,250 304,202 C282,252 242,304 200,352 Z" />
        <path fill="url(#tl-leaf)" opacity="0.95" d="M202,356 C196,312 198,272 206,240 C215,274 215,314 208,356 Z" />

        <path fill="none" stroke="url(#tl-stem)" strokeWidth="7" strokeLinecap="round" d="M200,358 C198,290 204,220 205,150" />
        <path fill="none" stroke="url(#tl-stem)" strokeWidth="6.5" strokeLinecap="round" d="M204,358 C238,300 262,230 270,166" />
        <path fill="none" stroke="url(#tl-stem)" strokeWidth="6.5" strokeLinecap="round" d="M199,360 C176,312 152,256 146,202" />

        <use href="#tl-bloom" transform="translate(146,202) rotate(-14) scale(0.9)" />
        <use href="#tl-bloom" transform="translate(270,166) rotate(11) scale(0.96)" />
        <use href="#tl-bloom" transform="translate(205,150) rotate(-2) scale(1.04)" />
      </g>

      {/* yellow tissue wrap + black ribbon (static base) */}
      <g>
        <path fill="url(#tl-wrap)" opacity="0.95" d="M160,372 L150,336 L190,364 Z" />
        <path fill="url(#tl-wrap)" opacity="0.95" d="M240,372 L252,336 L210,364 Z" />
        <path fill="url(#tl-wrap)" opacity="0.8" d="M200,366 L196,330 L216,360 Z" />
        <path fill="url(#tl-wrap)" opacity="0.8" d="M178,368 L168,340 L196,362 Z" />
        <path fill="url(#tl-wrap)" opacity="0.8" d="M222,368 L232,340 L204,362 Z" />
        <path fill="url(#tl-wrap)" d="M158,366 C176,360 224,360 242,366 L228,486 C228,486 200,498 172,486 Z" />
        <path fill="#B5860F" opacity="0.22" d="M200,368 L210,486 C204,489 196,489 190,486 Z" />

        {/* ribbon tails, splayed outward with notched ends */}
        <path fill="#0B1026" d="M199,414 L181,474 L191,469 L195,478 L204,446 Z" />
        <path fill="#0B1026" d="M201,414 L219,474 L209,469 L205,478 L196,446 Z" />
        {/* bow loops */}
        <path fill="#0B1026" d="M200,404 C175,390 154,398 159,410 C154,423 178,425 200,414 Z" />
        <path fill="#0B1026" d="M200,404 C225,390 246,398 241,410 C246,423 222,425 200,414 Z" />
        <path fill="none" stroke="#3a4170" strokeOpacity="0.45" strokeWidth="1.2" d="M194,406 C178,400 167,404 168,410" />
        <path fill="none" stroke="#3a4170" strokeOpacity="0.45" strokeWidth="1.2" d="M206,406 C222,400 233,404 232,410" />
        {/* knot */}
        <rect x="192" y="400" width="16" height="18" rx="5" fill="#11162E" />
      </g>

      {/* silver sparkles */}
      <g fill="#D6D9FF">
        <circle className="bianca-twinkle" style={{ '--bx-delay': '0s', '--bx-dur': '4s' } as CSSProperties} cx="118" cy="120" r="2.5" />
        <circle className="bianca-twinkle" style={{ '--bx-delay': '1.4s', '--bx-dur': '5s' } as CSSProperties} cx="300" cy="108" r="2" />
        <circle className="bianca-twinkle" style={{ '--bx-delay': '2.2s', '--bx-dur': '4.5s' } as CSSProperties} cx="322" cy="232" r="2.5" />
        <circle className="bianca-twinkle" style={{ '--bx-delay': '0.8s', '--bx-dur': '5.5s' } as CSSProperties} cx="90" cy="244" r="2" />
        <circle className="bianca-twinkle" style={{ '--bx-delay': '3s', '--bx-dur': '4.2s' } as CSSProperties} cx="210" cy="68" r="2.5" />
      </g>
    </svg>
  )
}
