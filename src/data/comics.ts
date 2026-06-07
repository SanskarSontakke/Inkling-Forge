export interface Creator {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  followers: string;
  reads: string;
  role: string;
  socials: { twitter?: string; instagram?: string; artstation?: string };
}

export interface Comic {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  bannerImage: string;
  description: string;
  creatorIds: string[];
  genre: string;
  rank: string;
  reads: string;
  score: string;
  isOriginal: boolean;
  chapters: {
    id: string;
    title: string;
    panels: string[];
  }[];
}

export const MOCK_CREATORS: Record<string, Creator> = {
  "jd-miller": {
    id: "jd-miller",
    name: "J.D. Miller",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCL0hI0fzzwNK8u0ESYGV9-KgVkaAxD7QpPgKlH8aQ7r-lQ7GR151W-5h0avjPGICt_qoLLBNWymUTgHfBTdgYD3p6q3MTqlKx2YRSG7JDxfZ7K6SlmOgoS7EZnrj3bsskPpopzAQf_rDMWBFZc0-Ao0V0_jgDB2NakBNh4g-S9CUs1ttVXON3mRI06zMhNl4gIqssMzN8FgN0wBH2pg6-eYcgBPE5Mx33snKvabu6gbysb827FselgWXJSoRfMj1ufL5aw6qwokXM",
    bio: "Creating epic neubrutalist fantasy landscapes since the late 90s. Heavy ink lines and epic scale visual storytelling are my specialty.",
    followers: "142K",
    reads: "2.4M",
    role: "Lead Illustrator & Writer",
    socials: { twitter: "@jdmiller_ink", instagram: "@jdmiller_art" }
  },
  "synth-art": {
    id: "synth-art",
    name: "Synth_Art",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAkGOX7bcMJaEyTLRFZ6sgnopB2Ku0dUTFZ5wuDE0ZuSIc3uJHtHdCrjCCIqSTaj-P8cP-tAkIET4lYNbZxUP9gC9CKoh4MykQ5YS6tcj9kdw536y2iMJtSNJo5GDSuuC_eljEqR58oip-tMcJUHfK44zGq2V9RxVhC7yf571emR6hK1ViBB5vwVbLL8xw7pZXQ8N41XMfoUz9IL36zChzuOerXrKLk8hoOTJ0NhGuN_ybth956TzYo9tMkRb5tLiBztBbFWJYuhCw",
    bio: "Cyberpunk visual designer and synthwave listener. Obsessed with high contrast orange-red visual panels and dark gritty shadows.",
    followers: "88K",
    reads: "1.8M",
    role: "Digital Painter & Concept Specialist",
    socials: { instagram: "@synth_art_core", artstation: "synth_art_concept" }
  },
  "rose-garden": {
    id: "rose-garden",
    name: "Rose Garden",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkSCse5JI1NQnlwGjC3WmU0tWq0wwijrOtoWAGKmB2y1ThBiVx4CRrEhTAqw2nKiBFoMRbumEi_gQqfFDIP-JRUrVjjY9KIp0Q5SVn7O6vXE-XYQMDQvPLsm5r91MQYrIm16XE3XgUkMLvTI7uGiH2GadLk0Iyurovhbh6k1-ed2r7RAu943HFF-gXhIITOmDOiud8Q7HjBN8XmAEdgL1_ZX-Y75uts8wJAokXfC-7z5UQHJL7doworSwnmPMVpkFoamb7INtYrB8",
    bio: "Comic storyteller painting complex interpersonal dramas within industrial, high-intensity underground environments.",
    followers: "75K",
    reads: "1.4M",
    role: "Writer & Creative Director",
    socials: { twitter: "@rosegarden_write" }
  },
  "hacker-nine": {
    id: "hacker-nine",
    name: "Hacker_Nine",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCv0onhZv2_T_Cg4b-ZmppgvkONnM-a_0smf50si84kWt5PmP4Jy-dmls3Jw2WL84MfV0iWUorkor3g-V5MteVBvuHqc_57qMXXglpuvh3nLPFmikQScRO_xfkiekJVWY5sPnCuFGqVpphs1sgLZzuh3KP53hPs4MQ5vYssEB4Rn3oVvIJ0I6TptIdEW7dfdAmAaB3GT4X1MAq-TE609OUwAjfpc4aRfSIzGmZLr19te6kwLnoLSLG6uNbspj-pLXVnsFygF5obfAU",
    bio: "Glitch artist turning computer malfunctions and heavy neubrutalist structures into cyberpunk comic panels.",
    followers: "42K",
    reads: "890K",
    role: "Visual Artist",
    socials: { twitter: "@hacker_nine_art", instagram: "@hacker_nine" }
  },
  "earth-guardian": {
    id: "earth-guardian",
    name: "Earth_Guardian",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5-hqj2IUluyPXmZf6zlGp2TqOXPRfNz8O0B5GJHsnvoxM2-tycvJXcGm-KKX7XkzFINSL0bRQe4-2fDcpsqdvqBcls3DktNPyozy78WBu2zPdodLz1En_8-dGIeTxZ7ySso7O_M6r68ZK2FQTaa_BgOeQ7XrAXq8PkrHzrWz0VGspiZ1ydhw9e_1ZYkV6GG9bcFMs9n3hH8GKLclPtv8nvri2un6R53QEJnsObckycOXI73CnLOnYoYsMiZnCPZO4LdaYJtWpbG0",
    bio: "Creating green mythological stories. Merging natural aesthetics with neubrutalist heavy typography.",
    followers: "30K",
    reads: "620K",
    role: "Author & Illustrator",
    socials: { instagram: "@earth_guardian_comics" }
  }
};

export const MOCK_COMICS: Comic[] = [
  {
    id: "cyberpunk-neon-blood",
    title: "Cyber Punk: Neon Blood",
    slug: "cyberpunk-neon-blood",
    genre: "Action",
    reads: "1.5M",
    score: "9.7",
    rank: "Rising Star",
    isOriginal: true,
    coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAndA-qcZtLBviRC1OrBrcnjtU0rP0PAuhy_M3GxqYQ5dfSFH68PHHyJVRIZi_fWm8W_9tXeCCJQydj30SjOJyq-oHDe8HzV-fRylbBTjKntgeq-vTxYSDX2Kpus2pToLrenK3t6R3YE58VXP_TmDFk8ljzoX5bXZmHIwz4-iaWdmigdjxdMgegrcF7dYhX9Jgbm3NLq318qRPoxpfcH-WgAXWbiWEmJYyYj73uxHo67CCXWch-3ftqnocz8aTVfezZtsR1iHlgw4g",
    bannerImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAndA-qcZtLBviRC1OrBrcnjtU0rP0PAuhy_M3GxqYQ5dfSFH68PHHyJVRIZi_fWm8W_9tXeCCJQydj30SjOJyq-oHDe8HzV-fRylbBTjKntgeq-vTxYSDX2Kpus2pToLrenK3t6R3YE58VXP_TmDFk8ljzoX5bXZmHIwz4-iaWdmigdjxdMgegrcF7dYhX9Jgbm3NLq318qRPoxpfcH-WgAXWbiWEmJYyYj73uxHo67CCXWch-3ftqnocz8aTVfezZtsR1iHlgw4g",
    description: "In the cybernetic gutters of Neon City, memory is a commodity. When a modular courier stumbles upon a burnt memory drive containing raw footage of the city's creation, corporate death squads are unleashed to wipe the slate clean.",
    creatorIds: ["synth-art", "rose-garden"],
    chapters: [
      {
        id: "ch-42",
        title: "CHAPTER 42: THE CIRCUIT BREAKER",
        panels: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAkGOX7bcMJaEyTLRFZ6sgnopB2Ku0dUTFZ5wuDE0ZuSIc3uJHtHdCrjCCIqSTaj-P8cP-tAkIET4lYNbZxUP9gC9CKoh4MykQ5YS6tcj9kdw536y2iMJtSNJo5GDSuuC_eljEqR58oip-tMcJUHfK44zGq2V9RxVhC7yf571emR6hK1ViBB5vwVbLL8xw7pZXQ8N41XMfoUz9IL36zChzuOerXrKLk8hoOTJ0NhGuN_ybth956TzYo9tMkRb5tLiBztBbFWJYuhCw",
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBkSCse5JI1NQnlwGjC3WmU0tWq0wwijrOtoWAGKmB2y1ThBiVx4CRrEhTAqw2nKiBFoMRbumEi_gQqfFDIP-JRUrVjjY9KIp0Q5SVn7O6vXE-XYQMDQvPLsm5r91MQYrIm16XE3XgUkMLvTI7uGiH2GadLk0Iyurovhbh6k1-ed2r7RAu943HFF-gXhIITOmDOiud8Q7HjBN8XmAEdgL1_ZX-Y75uts8wJAokXfC-7z5UQHJL7doworSwnmPMVpkFoamb7INtYrB8",
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCL0hI0fzzwNK8u0ESYGV9-KgVkaAxD7QpPgKlH8aQ7r-lQ7GR151W-5h0avjPGICt_qoLLBNWymUTgHfBTdgYD3p6q3MTqlKx2YRSG7JDxfZ7K6SlmOgoS7EZnrj3bsskPpopzAQf_rDMWBFZc0-Ao0V0_jgDB2NakBNh4g-S9CUs1ttVXON3mRI06zMhNl4gIqssMzN8FgN0wBH2pg6-eYcgBPE5Mx33snKvabu6gbysb827FselgWXJSoRfMj1ufL5aw6qwokXM",
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCv0onhZv2_T_Cg4b-ZmppgvkONnM-a_0smf50si84kWt5PmP4Jy-dmls3Jw2WL84MfV0iWUorkor3g-V5MteVBvuHqc_57qMXXglpuvh3nLPFmikQScRO_xfkiekJVWY5sPnCuFGqVpphs1sgLZzuh3KP53hPs4MQ5vYssEB4Rn3oVvIJ0I6TptIdEW7dfdAmAaB3GT4X1MAq-TE609OUwAjfpc4aRfSIzGmZLr19te6kwLnoLSLG6uNbspj-pLXVnsFygF5obfAU"
        ]
      },
      {
        id: "ch-41",
        title: "CHAPTER 41: VOLTAGE OVERLOAD",
        panels: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBkSCse5JI1NQnlwGjC3WmU0tWq0wwijrOtoWAGKmB2y1ThBiVx4CRrEhTAqw2nKiBFoMRbumEi_gQqfFDIP-JRUrVjjY9KIp0Q5SVn7O6vXE-XYQMDQvPLsm5r91MQYrIm16XE3XgUkMLvTI7uGiH2GadLk0Iyurovhbh6k1-ed2r7RAu943HFF-gXhIITOmDOiud8Q7HjBN8XmAEdgL1_ZX-Y75uts8wJAokXfC-7z5UQHJL7doworSwnmPMVpkFoamb7INtYrB8",
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAkGOX7bcMJaEyTLRFZ6sgnopB2Ku0dUTFZ5wuDE0ZuSIc3uJHtHdCrjCCIqSTaj-P8cP-tAkIET4lYNbZxUP9gC9CKoh4MykQ5YS6tcj9kdw536y2iMJtSNJo5GDSuuC_eljEqR58oip-tMcJUHfK44zGq2V9RxVhC7yf571emR6hK1ViBB5vwVbLL8xw7pZXQ8N41XMfoUz9IL36zChzuOerXrKLk8hoOTJ0NhGuN_ybth956TzYo9tMkRb5tLiBztBbFWJYuhCw"
        ]
      },
      {
        id: "ch-40",
        title: "CHAPTER 40: WIRELESS APOCALYPSE",
        panels: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCL0hI0fzzwNK8u0ESYGV9-KgVkaAxD7QpPgKlH8aQ7r-lQ7GR151W-5h0avjPGICt_qoLLBNWymUTgHfBTdgYD3p6q3MTqlKx2YRSG7JDxfZ7K6SlmOgoS7EZnrj3bsskPpopzAQf_rDMWBFZc0-Ao0V0_jgDB2NakBNh4g-S9CUs1ttVXON3mRI06zMhNl4gIqssMzN8FgN0wBH2pg6-eYcgBPE5Mx33snKvabu6gbysb827FselgWXJSoRfMj1ufL5aw6qwokXM"
        ]
      }
    ]
  },
  {
    id: "neon-catalyst-rebirth",
    title: "Neon Catalyst: Rebirth",
    slug: "neon-catalyst-rebirth",
    genre: "Action",
    reads: "1.1M",
    score: "9.6",
    rank: "Top #1",
    isOriginal: true,
    coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAndA-qcZtLBviRC1OrBrcnjtU0rP0PAuhy_M3GxqYQ5dfSFH68PHHyJVRIZi_fWm8W_9tXeCCJQydj30SjOJyq-oHDe8HzV-fRylbBTjKntgeq-vTxYSDX2Kpus2pToLrenK3t6R3YE58VXP_TmDFk8ljzoX5bXZmHIwz4-iaWdmigdjxdMgegrcF7dYhX9Jgbm3NLq318qRPoxpfcH-WgAXWbiWEmJYyYj73uxHo67CCXWch-3ftqnocz8aTVfezZtsR1iHlgw4g",
    bannerImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAndA-qcZtLBviRC1OrBrcnjtU0rP0PAuhy_M3GxqYQ5dfSFH68PHHyJVRIZi_fWm8W_9tXeCCJQydj30SjOJyq-oHDe8HzV-fRylbBTjKntgeq-vTxYSDX2Kpus2pToLrenK3t6R3YE58VXP_TmDFk8ljzoX5bXZmHIwz4-iaWdmigdjxdMgegrcF7dYhX9Jgbm3NLq318qRPoxpfcH-WgAXWbiWEmJYyYj73uxHo67CCXWch-3ftqnocz8aTVfezZtsR1iHlgw4g",
    description: "In a world where light is the only valid currency, a rogue matrix hacker discovers a central mainframe sector that could plunge the city into a permanent, dark revolution.",
    creatorIds: ["hacker-nine"],
    chapters: [
      {
        id: "ch-1",
        title: "CHAPTER 1: GRID UPLINK",
        panels: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAndA-qcZtLBviRC1OrBrcnjtU0rP0PAuhy_M3GxqYQ5dfSFH68PHHyJVRIZi_fWm8W_9tXeCCJQydj30SjOJyq-oHDe8HzV-fRylbBTjKntgeq-vTxYSDX2Kpus2pToLrenK3t6R3YE58VXP_TmDFk8ljzoX5bXZmHIwz4-iaWdmigdjxdMgegrcF7dYhX9Jgbm3NLq318qRPoxpfcH-WgAXWbiWEmJYyYj73uxHo67CCXWch-3ftqnocz8aTVfezZtsR1iHlgw4g"
        ]
      }
    ]
  },
  {
    id: "the-gilded-forest",
    title: "The Gilded Forest",
    slug: "the-gilded-forest",
    genre: "Fantasy",
    reads: "820K",
    score: "9.5",
    rank: "Rising Star",
    isOriginal: false,
    coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5-hqj2IUluyPXmZf6zlGp2TqOXPRfNz8O0B5GJHsnvoxM2-tycvJXcGm-KKX7XkzFINSL0bRQe4-2fDcpsqdvqBcls3DktNPyozy78WBu2zPdodLz1En_8-dGIeTxZ7ySso7O_M6r68ZK2FQTaa_BgOeQ7XrAXq8PkrHzrWz0VGspiZ1ydhw9e_1ZYkV6GG9bcFMs9n3hH8GKLclPtv8nvri2un6R53QEJnsObckycOXI73CnLOnYoYsMiZnCPZO4LdaYJtWpbG0",
    bannerImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5-hqj2IUluyPXmZf6zlGp2TqOXPRfNz8O0B5GJHsnvoxM2-tycvJXcGm-KKX7XkzFINSL0bRQe4-2fDcpsqdvqBcls3DktNPyozy78WBu2zPdodLz1En_8-dGIeTxZ7ySso7O_M6r68ZK2FQTaa_BgOeQ7XrAXq8PkrHzrWz0VGspiZ1ydhw9e_1ZYkV6GG9bcFMs9n3hH8GKLclPtv8nvri2un6R53QEJnsObckycOXI73CnLOnYoYsMiZnCPZO4LdaYJtWpbG0",
    description: "Ancient spirits and mechanical loggers clash when the industrial empire targets the sacred woods. One guardian must channel the forest's memory to strike back.",
    creatorIds: ["earth-guardian"],
    chapters: [
      {
        id: "ch-1",
        title: "CHAPTER 1: THE ROOT OF ALL METAL",
        panels: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuC5-hqj2IUluyPXmZf6zlGp2TqOXPRfNz8O0B5GJHsnvoxM2-tycvJXcGm-KKX7XkzFINSL0bRQe4-2fDcpsqdvqBcls3DktNPyozy78WBu2zPdodLz1En_8-dGIeTxZ7ySso7O_M6r68ZK2FQTaa_BgOeQ7XrAXq8PkrHzrWz0VGspiZ1ydhw9e_1ZYkV6GG9bcFMs9n3hH8GKLclPtv8nvri2un6R53QEJnsObckycOXI73CnLOnYoYsMiZnCPZO4LdaYJtWpbG0"
        ]
      }
    ]
  },
  {
    id: "shadow-of-the-colossus",
    title: "Shadow of the Colossus",
    slug: "shadow-of-the-colossus",
    genre: "Fantasy",
    reads: "1.2M",
    score: "9.8",
    rank: "1",
    isOriginal: false,
    coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCL0hI0fzzwNK8u0ESYGV9-KgVkaAxD7QpPgKlH8aQ7r-lQ7GR151W-5h0avjPGICt_qoLLBNWymUTgHfBTdgYD3p6q3MTqlKx2YRSG7JDxfZ7K6SlmOgoS7EZnrj3bsskPpopzAQf_rDMWBFZc0-Ao0V0_jgDB2NakBNh4g-S9CUs1ttVXON3mRI06zMhNl4gIqssMzN8FgN0wBH2pg6-eYcgBPE5Mx33snKvabu6gbysb827FselgWXJSoRfMj1ufL5aw6qwokXM",
    bannerImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCL0hI0fzzwNK8u0ESYGV9-KgVkaAxD7QpPgKlH8aQ7r-lQ7GR151W-5h0avjPGICt_qoLLBNWymUTgHfBTdgYD3p6q3MTqlKx2YRSG7JDxfZ7K6SlmOgoS7EZnrj3bsskPpopzAQf_rDMWBFZc0-Ao0V0_jgDB2NakBNh4g-S9CUs1ttVXON3mRI06zMhNl4gIqssMzN8FgN0wBH2pg6-eYcgBPE5Mx33snKvabu6gbysb827FselgWXJSoRfMj1ufL5aw6qwokXM",
    description: "In the shadow of titan ruins, scavengers search for the runic sparks that keep dead machinery alive. But some titans aren't fully dead.",
    creatorIds: ["jd-miller"],
    chapters: [
      {
        id: "ch-1",
        title: "CHAPTER 1: THE RUNIC SPARKS",
        panels: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCL0hI0fzzwNK8u0ESYGV9-KgVkaAxD7QpPgKlH8aQ7r-lQ7GR151W-5h0avjPGICt_qoLLBNWymUTgHfBTdgYD3p6q3MTqlKx2YRSG7JDxfZ7K6SlmOgoS7EZnrj3bsskPpopzAQf_rDMWBFZc0-Ao0V0_jgDB2NakBNh4g-S9CUs1ttVXON3mRI06zMhNl4gIqssMzN8FgN0wBH2pg6-eYcgBPE5Mx33snKvabu6gbysb827FselgWXJSoRfMj1ufL5aw6qwokXM"
        ]
      }
    ]
  },
  {
    id: "mecha-soul-2099",
    title: "Mecha-Soul 2099",
    slug: "mecha-soul-2099",
    genre: "Sci-Fi",
    reads: "980K",
    score: "9.5",
    rank: "2",
    isOriginal: false,
    coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAkGOX7bcMJaEyTLRFZ6sgnopB2Ku0dUTFZ5wuDE0ZuSIc3uJHtHdCrjCCIqSTaj-P8cP-tAkIET4lYNbZxUP9gC9CKoh4MykQ5YS6tcj9kdw536y2iMJtSNJo5GDSuuC_eljEqR58oip-tMcJUHfK44zGq2V9RxVhC7yf571emR6hK1ViBB5vwVbLL8xw7pZXQ8N41XMfoUz9IL36zChzuOerXrKLk8hoOTJ0NhGuN_ybth956TzYo9tMkRb5tLiBztBbFWJYuhCw",
    bannerImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAkGOX7bcMJaEyTLRFZ6sgnopB2Ku0dUTFZ5wuDE0ZuSIc3uJHtHdCrjCCIqSTaj-P8cP-tAkIET4lYNbZxUP9gC9CKoh4MykQ5YS6tcj9kdw536y2iMJtSNJo5GDSuuC_eljEqR58oip-tMcJUHfK44zGq2V9RxVhC7yf571emR6hK1ViBB5vwVbLL8xw7pZXQ8N41XMfoUz9IL36zChzuOerXrKLk8hoOTJ0NhGuN_ybth956TzYo9tMkRb5tLiBztBbFWJYuhCw",
    description: "In the core year 2099, consciousness can be uploaded directly into military-grade battle chassis. But what happens when the software registers a phantom heart?",
    creatorIds: ["synth-art"],
    chapters: [
      {
        id: "ch-1",
        title: "CHAPTER 1: PILOT SELECT",
        panels: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAkGOX7bcMJaEyTLRFZ6sgnopB2Ku0dUTFZ5wuDE0ZuSIc3uJHtHdCrjCCIqSTaj-P8cP-tAkIET4lYNbZxUP9gC9CKoh4MykQ5YS6tcj9kdw536y2iMJtSNJo5GDSuuC_eljEqR58oip-tMcJUHfK44zGq2V9RxVhC7yf571emR6hK1ViBB5vwVbLL8xw7pZXQ8N41XMfoUz9IL36zChzuOerXrKLk8hoOTJ0NhGuN_ybth956TzYo9tMkRb5tLiBztBbFWJYuhCw"
        ]
      }
    ]
  },
  {
    id: "bitter-sweet-love",
    title: "Bitter Sweet Love",
    slug: "bitter-sweet-love",
    genre: "Drama",
    reads: "850K",
    score: "9.4",
    rank: "3",
    isOriginal: false,
    coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkSCse5JI1NQnlwGjC3WmU0tWq0wwijrOtoWAGKmB2y1ThBiVx4CRrEhTAqw2nKiBFoMRbumEi_gQqfFDIP-JRUrVjjY9KIp0Q5SVn7O6vXE-XYQMDQvPLsm5r91MQYrIm16XE3XgUkMLvTI7uGiH2GadLk0Iyurovhbh6k1-ed2r7RAu943HFF-gXhIITOmDOiud8Q7HjBN8XmAEdgL1_ZX-Y75uts8wJAokXfC-7z5UQHJL7doworSwnmPMVpkFoamb7INtYrB8",
    bannerImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkSCse5JI1NQnlwGjC3WmU0tWq0wwijrOtoWAGKmB2y1ThBiVx4CRrEhTAqw2nKiBFoMRbumEi_gQqfFDIP-JRUrVjjY9KIp0Q5SVn7O6vXE-XYQMDQvPLsm5r91MQYrIm16XE3XgUkMLvTI7uGiH2GadLk0Iyurovhbh6k1-ed2r7RAu943HFF-gXhIITOmDOiud8Q7HjBN8XmAEdgL1_ZX-Y75uts8wJAokXfC-7z5UQHJL7doworSwnmPMVpkFoamb7INtYrB8",
    description: "Two rival syndicate runners find themselves trapped inside a warehouse shelter during a biochemical fallout lock-down. Sparks fly as toxic filters count down.",
    creatorIds: ["rose-garden"],
    chapters: [
      {
        id: "ch-1",
        title: "CHAPTER 1: THE FALLOUT VAULT",
        panels: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBkSCse5JI1NQnlwGjC3WmU0tWq0wwijrOtoWAGKmB2y1ThBiVx4CRrEhTAqw2nKiBFoMRbumEi_gQqfFDIP-JRUrVjjY9KIp0Q5SVn7O6vXE-XYQMDQvPLsm5r91MQYrIm16XE3XgUkMLvTI7uGiH2GadLk0Iyurovhbh6k1-ed2r7RAu943HFF-gXhIITOmDOiud8Q7HjBN8XmAEdgL1_ZX-Y75uts8wJAokXfC-7z5UQHJL7doworSwnmPMVpkFoamb7INtYrB8"
        ]
      }
    ]
  },
  {
    id: "crimson-tide",
    title: "Crimson Tide",
    slug: "crimson-tide",
    genre: "Action",
    reads: "480K",
    score: "9.2",
    rank: "7",
    isOriginal: true,
    coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCL0hI0fzzwNK8u0ESYGV9-KgVkaAxD7QpPgKlH8aQ7r-lQ7GR151W-5h0avjPGICt_qoLLBNWymUTgHfBTdgYD3p6q3MTqlKx2YRSG7JDxfZ7K6SlmOgoS7EZnrj3bsskPpopzAQf_rDMWBFZc0-Ao0V0_jgDB2NakBNh4g-S9CUs1ttVXON3mRI06zMhNl4gIqssMzN8FgN0wBH2pg6-eYcgBPE5Mx33snKvabu6gbysb827FselgWXJSoRfMj1ufL5aw6qwokXM",
    bannerImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCL0hI0fzzwNK8u0ESYGV9-KgVkaAxD7QpPgKlH8aQ7r-lQ7GR151W-5h0avjPGICt_qoLLBNWymUTgHfBTdgYD3p6q3MTqlKx2YRSG7JDxfZ7K6SlmOgoS7EZnrj3bsskPpopzAQf_rDMWBFZc0-Ao0V0_jgDB2NakBNh4g-S9CUs1ttVXON3mRI06zMhNl4gIqssMzN8FgN0wBH2pg6-eYcgBPE5Mx33snKvabu6gbysb827FselgWXJSoRfMj1ufL5aw6qwokXM",
    description: "Deep sea exploration meets corporate bio-weapons. Diving team gamma discovers a thermal vent leaking something that overrides host instincts.",
    creatorIds: ["jd-miller"],
    chapters: [
      {
        id: "ch-1",
        title: "CHAPTER 1: THE TRENCH",
        panels: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCL0hI0fzzwNK8u0ESYGV9-KgVkaAxD7QpPgKlH8aQ7r-lQ7GR151W-5h0avjPGICt_qoLLBNWymUTgHfBTdgYD3p6q3MTqlKx2YRSG7JDxfZ7K6SlmOgoS7EZnrj3bsskPpopzAQf_rDMWBFZc0-Ao0V0_jgDB2NakBNh4g-S9CUs1ttVXON3mRI06zMhNl4gIqssMzN8FgN0wBH2pg6-eYcgBPE5Mx33snKvabu6gbysb827FselgWXJSoRfMj1ufL5aw6qwokXM"
        ]
      }
    ]
  }
];

export const OTHER_TRENDING_COMICS = [
  { rank: "4", title: "The Last Alchemist", trend: "up", score: "9.3" },
  { rank: "5", title: "Midnight Runner", trend: "up", score: "9.2" },
  { rank: "6", title: "Beyond the Horizon", trend: "down", score: "9.1" },
];
