import manifest from '../public/assets/manifest.json' with { type: 'json' };

export const assets = new Map(manifest.map((asset) => [asset.id, asset]));
export const group = (name) => manifest.filter((asset) => asset.group === name).map((asset) => asset.id);
const suppliedLookbook = group('lookbook');
export const editorial = [...group('editorial-v1'), ...group('editorial-v2')];
export const anima = group('anima');
export const looks = Array.from({ length: 9 }, (_, i) => ({
  sourceNumber: String(i + 1).padStart(2, '0'),
  images: suppliedLookbook.slice(i * 4, i * 4 + 4),
})).filter((look) => !['06', '08'].includes(look.sourceNumber))
  .map((look, i) => ({ ...look, number: String(i + 1).padStart(2, '0') }));
export const lookbook = looks.flatMap((look) => look.images);
export const stylingProjects = [
  { id: 'annet-veerbeek', title: 'Annet Veerbeek', label: 'Internship · Styling assistance', role: 'Styling assistance', cover: 'styling-9337', images: group('styling'), credits: [] },
  {
    id: 'divine-feminine', title: 'Divine Feminine', label: 'Styling', role: 'Styling', cover: 'divine-feminine-02',
    images: ['divine-feminine-02', ...group('divine-feminine').filter((id) => id !== 'divine-feminine-02')],
    credits: [['Photography', 'Amilcar'], ['Styling', 'Storm Nijhuis'], ['Model', 'Louise Aniba']],
  },
  {
    id: 'styling-assistance', title: 'Remix Hair Ede', label: 'Styling assistance', role: 'Styling assistance', cover: 'styling-assistance-04',
    images: ['styling-assistance-04', ...group('styling-assistance').filter((id) => id !== 'styling-assistance-04')],
    credits: [
      ['Styling assistance', 'Storm Nijhuis'],
      ['For', '@bertdezeeuw · @remixhairede · @peoplebehindthemirror'],
      ['Photography', '@ivodekok_studios'], ['Styling', '@annetveerbeekstyling'],
      ['Make-up', '@lydiathann'], ['Models', '@tuttimodels'],
    ],
  },
];

export const binhe = {
  title: 'Binhe',
  role: 'Design assistance & product design for Zyanya Keizer',
  cover: 'binhe-07',
  openingImage: 'binhe-08',
  images: ['binhe-08', 'binhe-07', 'binhe-01', 'binhe-09', 'binhe-05', 'binhe-11', 'binhe-02', 'binhe-14', 'binhe-03', 'binhe-06', 'binhe-10', 'binhe-04', 'binhe-16', 'binhe-12', 'binhe-13', 'binhe-15'],
  paragraphs: [
    'Binhe means “seed” in Zapotec. The project draws on Mexican heritage through a couture collection of 13 looks, developed with artisans and partners in Mexico. Palm weaving, Wixarika beadwork, black clay and Tenango embroidery are among the techniques and materials used in the garments.',
    'The process explores how contemporary design can draw on traditional craft through collaboration rather than cultural appropriation. Sharing knowledge, acknowledging the makers and compensating their work are central to the project.',
  ],
  credits: [
    ['Design assistance & product design', 'Storm Nijhuis for Zyanya Keizer'],
    ['Photography', 'Violaine Chapallaz'], ['Assistant', 'Suus Waijers'],
    ['Art direction & production — photoshoot and fashion film', 'EAUX STUDIOS'],
    ['Director', 'Remy Cats'], ['Cinematography', 'Daan Hunttinga'],
    ['Talent', 'Maria Anouk'], ['Set design', 'Willemijn Bos'],
    ['Make-up & hair', 'Anh Nguyen'], ['Documentary', 'Cesar Padilla'],
  ],
};

export const homeBiography = [
  'I’m Storm Nijhuis, a fashion designer, stylist and creative director based in Amsterdam. I grew up in Zutphen, where being queer often meant feeling out of place. Fashion became a way to express myself and explore things I couldn’t always put into words.',
  'I learned to work with my hands at a Rudolf Steiner school, then studied product and textile design at CIBAP and fashion design at AMFI. During an exchange at the Swedish School of Textiles, I explored how materials can shape a garment from the very beginning.',
  'My work includes latex, textile development and historical pattern cutting. I also work in styling, where I enjoy responding to different people and different briefs. Through my brand Hellion, I explore identity and religious symbolism with exaggerated silhouettes, humour and contrast.',
];

// Keep null until the premiere and public release have been confirmed.
// When ready, use the public YouTube embed URL and change status to 'Released'.
export const film = {
  title: 'Hellion',
  format: 'A short fashion film',
  status: 'Upcoming',
  embedUrl: null,
  previewStill: 'film-01',
  logline: 'Made alongside the Hellion collection, the film follows a mischievous outsider into an otherworldly church, where he challenges the religious judgement that made him feel like a sinner.',
  synopsis: [
    'As the church bells ring, Hellion arrives in a place where sacred rules decide what is good and what is sinful. He interrupts its rituals and acts on the desires he was taught to fear. His rebellion brings him into conflict with the Nun, who stands for the rules he is trying to escape.',
    'The film comes from my experience of growing up queer in a small town surrounded by Catholic beliefs. It asks who gets to define purity and sin, and how those ideas affect the way we see ourselves. Hellion approaches these questions through humour, religious symbolism and a character who refuses to behave.',
  ],
  concept: [
    'The film was made alongside my Hellion collection. The garments become the characters’ clothing: oversized collars, horns and sculptural silhouettes exaggerate the authority and expectations associated with religious dress.',
    'I developed the fashion design, concept and creative direction for the project. The treatment brings together the clothing, casting and setting, with distorted perspectives, warm light and the sound of church bells. The film was shot in Pieterskerk in Utrecht.',
  ],
  stills: ['film-13', 'film-12', 'film-08', 'film-02', 'film-04', 'film-05', 'film-03', 'film-06', 'film-07', 'film-01', 'film-09', 'film-10', 'film-11'],
};

export const contact = {
  email: 'storm.nijhuis@gmail.com',
  phone: '+31 6 4001 1837',
  telephone: '+31640011837',
  instagram: 'https://www.instagram.com/hellion.sin/',
};

export const routes = {
  '/': { title: 'Storm Nijhuis', description: 'Amsterdam-based fashion designer, stylist and creative director. Selected work, collections and film by Storm Nijhuis.' },
  '/design/': { title: 'Design', description: 'Hellion, Anima Obscura and Binhe. Fashion design by Storm Nijhuis, with design assistance and product design for Zyanya Keizer.' },
  '/design/hellion/': { title: 'Hellion', description: 'Hellion, a 2026 collection by Storm Nijhuis. The complete lookbook, editorial photography and presentation.' },
  '/design/anima-obscura/': { title: 'Anima Obscura', description: 'A fashion editorial by Storm Nijhuis and Denise Bakker. Explore the complete photographic series.' },
  '/design/binhe/': { title: 'Binhe', description: 'Binhe: design assistance and product design by Storm Nijhuis for Zyanya Keizer. A couture project developed with artisans and partners in Mexico.' },
  '/styling/': { title: 'Styling', description: 'Divine Feminine, Remix Hair Ede and internship work with Annet Veerbeek. Styling and styling assistance by Storm Nijhuis.' },
  '/creative-direction/': { title: 'Hellion, a short fashion film', description: 'Hellion, an upcoming short fashion film based on Storm Nijhuis’s collection. A rebellious outsider challenges religious judgement in an otherworldly church.' },
  '/about/': { title: 'About', description: 'Meet Storm Nijhuis. Fashion designer, stylist, creative director and Lichting finalist based in Amsterdam.' },
  '/contact/': { title: 'Contact', description: 'Contact Storm Nijhuis for fashion design, styling, creative direction and collaborations.' },
  '/privacy/': { title: 'Privacy', description: 'How Storm Nijhuis handles enquiries and personal data, including website hosting, service providers and your privacy rights.' },
  '/legal/': { title: 'Business details', description: 'Business identification and contact information for Storm Nijhuis, a fashion designer, stylist and creative director in Amsterdam.' },
  '/cookies/': { title: 'Cookies', description: 'Information about cookies, browser storage and external services on the Storm Nijhuis portfolio website.' },
  '/accessibility/': { title: 'Accessibility', description: 'Accessibility features, keyboard controls and how to request help using the Storm Nijhuis portfolio and CV.' },
  '/terms/': { title: 'Enquiries & commissions', description: 'How to enquire about fashion design, styling and creative direction, and how commission details and consumer rights are agreed.' },
};
