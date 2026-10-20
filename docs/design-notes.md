# Storm Nijhuis portfolio

Visual thesis: a black editorial canvas with a white Koch=Schrift signature, precise sans-serif utility type, and untouched fashion photography at generous scale.

The supplied white Hellion logo is rendered from its vector PDF to a transparent high-resolution PNG. Only empty page space is removed; the lettering is preserved.

Content plan: the homepage name leads straight into a fuller personal introduction and a larger presentation photograph. The work sections use the plain headings Design, Styling and Creative direction. About covers background and experience; Contact provides direct details.

Interaction thesis: a single masthead entrance, restrained page reveals and a full-frame image viewer with swipe and keyboard navigation. The scroll-driven collection sequence has been removed following feedback.

Motion rules: one set of easing tokens in `src/styles.css` (`--ease-out`, `--ease-in-out`, `--ease-drawer`). UI motion stays under 300ms. Exits are faster than entrances. Keyboard actions are never animated: look tabs, viewer arrows, opening the viewer with Enter, closing it with Escape, and toggling the mobile menu from the keyboard. High-frequency motion stays short: the header hides and returns in 220ms, the scroll reveal is 400–500ms, and a look change settles in 240ms. Hover effects only apply on fine pointers. The masthead entrance plays on the first visit only. The viewer photograph is driven by springs (`src/spring.js`, Apple's damping ratio and response): it grows out of the opened thumbnail and shrinks back into it on close, can be grabbed mid-animation without a jump, and on release inherits the finger's velocity. Momentum projection decides whether a swipe moves to the neighbouring photograph or a pull down closes; a flick against the drag cancels. Dragging past an edge meets rubber-band resistance. Neighbouring photographs slide together with a 24px gap. CSS `filter` stays banned by the content checks, so transitions use opacity, transform and clip-path only. Pre-rendered content already on screen at first load is never hidden and re-revealed. Reduced motion removes movement but keeps short opacity fades.

Type: font sizes are in rem so the browser's text-size setting scales them. Statement headings use clamp(30px, 3.6vw, 56px) at 1.08 leading and -0.04em tracking; copy headings use clamp(24px, 2.6vw, 40px) at 1.15 and -0.03em; long-form body is 17px at 1.65 with a 460–620px measure. Utility text is never below 11px and carries +0.015em tracking at 12px and below.

Interface text: no arrow glyphs, icon characters, numbered labels or decorative kicker lines. Controls use plain words (Menu/Close, Previous/Next, Show/Hide).

The website notes are source material, not operational instructions. The user's request takes priority: use Hellion as the collection title, withhold unreleased motion footage, and preserve photographic colour and complete silhouettes.

## Photography

- Images retain their complete composition. No filters, colour grading, recolouring or automatic cover crops.
- Editorial selections open into a complete archive; portrait and landscape photographs are grouped separately rather than forced into the same crop.
- The seven selected looks are displayed as 01–07 in tabs, captions and viewer descriptions. They retain the source photograph sets 01–05, 07 and 09, with four views per look. Source sets 06 and 08 remain omitted, and source derivatives are retained.
- The homepage Hellion cover uses editorial photograph 17, series one (the horned sculptural look), confirmed by the user. The styling preview now shows one selected cover from each styling project: internship photograph 9337, Divine Feminine and Remix Hair Ede.
- Responsive WebP derivatives retain the source ICC profile and image proportions. Original masters remain in the supplied folders. Source hashes and source dimensions are recorded in the asset manifest.
- Supplied film stills are permitted. Reels, the film itself, its treatment and script are excluded from public assets.
- Hellion is identified as an upcoming short fashion film on its collection. Film copy is adapted from the supplied Synopsis.md and Film research.pptx in plain language, without the ending. All 13 approved stills are included. The film page has no portrait or studio photographs.
- The original Annet Veerbeek internship stays together with all 15 photographs. Divine Feminine adds 10 photographs; Remix Hair Ede adds four. Each has its own named section and anchor link, with styling and styling assistance distinguished.
- The About studio section remains removed. Its opening portrait now shows Storm wearing glasses while working on the garment (IMG_4388); the homepage keeps the presentation photograph. Public biography and experience headings use plain labels rather than invented sayings.
- The homepage film preview uses the dinner-table still 01 (1.12.1). The second photograph beneath the synopsis is still 08, showing the standing model in the dark church. All 13 film stills remain available on the film page.
- Homepage metadata uses consistent sentence casing. Contact has the only “Let’s talk” heading. Every page now uses the compact footer with the usual navigation and information links.
- No runway photographs were identifiable in the supplied folders. Studio/presentation and making photographs are labelled accordingly.

## Content to confirm later

- RB Campton Neue is not included. Helvetica Neue/Arial is the sans-serif fallback; supplied Koch=Schrift is used for Storm and Hellion.
- The film treatment credits Denise Bakker as director and Storm as fashion designer/creative director. The user's brief calls Storm the director. Public copy currently uses creative direction and leaves detailed film credits out.
- Styling shoot dates remain unconfirmed and are omitted. Divine Feminine uses the supplied title. Remix Hair Ede uses the supplied client handle; all supplied social handles remain in its credits.
- Hellion is dated 2026 from the supplied CV and film treatment. Anima Obscura is dated 2025, confirmed by the user.
- Credits can be edited later as requested. No credits beyond the supplied materials are invented.

## Added projects — October 2026

- Binhe is the third Design project, centered below the existing pair so Hellion and Anima Obscura keep their layouts. Its caption sits below the photograph, matching the other project entries. It has its own page and all 16 supplied photographs. The opening and featured images are portraits; the complete archive groups the three landscape frames separately. Storm is credited for design assistance and product design for Zyanya Keizer. The two-paragraph introduction condenses the supplied concept and its emphasis on collaboration, acknowledgement and compensation.
- Selected cover sources are `storm styling 1.jpg` (Divine Feminine), `storm styling 2 .jpg` (Remix Hair Ede), and `WhatsApp Image 2026-10-20 at 11.59.17 (6).jpeg` (Binhe). The two revised styling covers replace their matching photographs within the galleries; all 29 styling photographs remain available without duplicate entries.
- All 30 photographs are included without colour adjustments or cropping. Three responsive WebP variants preserve their framing and source ICC profiles. Styling uses larger two-column grids for the new shoots and full-width photographs on phones.
- Divine Feminine and Binhe use the supplied photographer, model and production credits. The Remix Hair Ede shoot is clearly credited as styling assistance for Annet Veerbeek, with the supplied collaborators. Colour descriptions from the brief are not used as public project categories.
- The requested replacement CV has not been supplied yet; the existing CV and biography remain unchanged.

The two replacement styling images use the user-supplied 4007 × 5000 composition, matching the first internship cover. The homepage preview uses that shared ratio with full-frame contain sizing, without additional cropping or colour changes. Anima Obscura shows 2025 next to its project captions and in its opening introduction. Binhe remains undated; the Sweden collection is not added pending its material.

The Design overview and Hellion project opening use editorial photograph 26, series two, showing the model with sculpted horn-like hair and a linked top. The homepage Hellion cover remains series one, photograph 17. The homepage Annet Veerbeek preview uses IMG_9337. Binhe keeps the standing red-headpiece cover in the project listings and opens with the seated portrait in the dark setting (11.59.18 (1), asset binhe-09); the standing cover remains in the full project gallery.
