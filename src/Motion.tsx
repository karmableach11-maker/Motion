import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * MOTION 59 — "AMERICA · 1776"
 * ---------------------------------------------------------------------------
 * A Fourth-of-July / Independence Day title plate: the Declaration of
 * Independence drifting up a parchment in perspective, the Stars and Stripes
 * blended over it, a gold Caslon lockup in the lower third.
 *
 * WHAT WAS MEASURED, AND WHAT WAS INFERRED, FROM THE REFERENCE CLIP
 * ----------------------------------------------------------------
 * The reference is live-action stock footage (700x394, 29.97 fps, 14.014 s,
 * one continuous take, no graphics). Everything below marked [obs] came off
 * the frames; everything marked [int] is an inference stated as such.
 *
 * [obs] Composite: the flag is blended, not opaque — parchment text stays
 *       legible straight through the red stripes (frame t=6.40 s).
 * [obs] Flag's lower boundary is a wavy diagonal: y=270 at x=20 and y=87 at
 *       x=680 (t=7.01 s) -> slope -0.277, i.e. -15.5 deg. Scaled to 1920 that
 *       edge runs (55, 740) -> (1866, 238), which is FROT / HX / HY below.
 * [obs] Scroll rate, two independent methods that agree:
 *         - incremental phase correlation, 1-frame step, summed over the clip:
 *           dy = -414.8 px by t=12.01 s  ->  -31.5 px/s at 700 px wide;
 *         - counting text lines crossing a fixed screen row: FFT peak
 *           0.77 Hz at row 110, where the line pitch autocorrelates to 39 px
 *           ->  0.77 x 39 = 30.0 px/s.
 *       Scaled by 1920/700 = 2.743 that is 82 px/s, which is SCROLL below.
 * [obs] Line pitch 39 px at rows 40-110; the lower rows are too defocused to
 *       autocorrelate. 39 x 2.743 = 107 px, the sharp-band pitch here.
 * [obs] Line-crossing rate is 0.77 Hz at row 110 but 1.23 Hz at rows 150-190 —
 *       the pattern moves faster lower in the frame.
 * [obs] Focus, variance of Laplacian on a 4x4 grid: 37..179 (top quarter),
 *       168..367 (second), 137..180 (third), 2..6 (bottom quarter). Sharpest
 *       band = 25..50% of frame height; the bottom quarter is nearly gone.
 * [obs] Ink/paper contrast falls with height: 92 in the upper text band, 55 in
 *       the middle, 37 in the lower.
 * [obs] Palette: parchment #c3a07c..#d9b899, deep #a98c67, ink cluster
 *       #825437, red stripe #8e3326, white stripe #acabb2 (it reads as warm
 *       grey because the paper shows through), corners #7a583e (bottom-left)
 *       and #35261f (top-right).
 * [obs] The parchment is set with the period's long s — 'diſſolve',
 *       'relinquiſh', 'Legiſlative', 'Invaſions', 'Caſes', 'muſt' are all
 *       legible between t=3.5 s and t=14.0 s.
 * [int] Faster motion low in the frame + the focus falloff + the contrast
 *       falloff all point the same way: the page is a plane in perspective
 *       receding toward the top of frame, not a flat scroll. That is the
 *       projection built below.
 * [int] The reference's readable text advances through the Declaration far
 *       faster than 30 px/s can carry it (heading at t=0, first paragraph at
 *       t=3.5, grievance five at t=7.0, the conclusion at t=14.0), and
 *       long-range template tracking loses lock inside 0.3 s (conf 0.98 ->
 *       0.44). Both are signatures of cross-dissolving document layers at
 *       different scales rather than one rigid page. That muddle is NOT
 *       reproduced: this plate uses one coherent page at the measured rate,
 *       plus a single much fainter layer behind it for depth.
 * [int] Horizontal drift could not be established — near-horizontal parallel
 *       text lines make phase correlation ill-conditioned, and two regions
 *       disagreed in sign (+6.96 vs -10.46 px/s). Treated as zero.
 *
 * SOURCES
 * -------
 * Body text  Declaration of Independence, 1776, public domain. Fetched from
 *            raw.githubusercontent.com/treyhunner/treyhunner.github.com/
 *            master/declaration-of-independence.txt, then re-set in long-s
 *            orthography and pre-wrapped against the font's own metrics.
 * Flag       50-star / 13-stripe construction, from the artwork set already
 *            in this project.
 * Fonts      EB Garamond (body; it is the one of the three that carries
 *            U+017F, the long s) and Libre Caslon Display (lockup) — both
 *            SIL Open Font License 1.1, taken from google/fonts ofl/.
 *            Subset to the 63 characters actually used and embedded, so the
 *            file renders with no network and no external asset.
 */

const FONT_BODY =
	'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' +
	't67uiX9T/+An0BAAA=';

const FONT_DISP =
	'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';

const US_ART = "<path fill=\"#b22234\" d=\"M0 0h7410v3900H0z\"/><path stroke=\"#fff\" stroke-width=\"300\" d=\"M0 450h7410m0 600H0m0 600h7410m0 600H0m0 600h7410m0 600H0\"/><path fill=\"#3c3b6e\" d=\"M0 0h2964v2100H0z\"/><g fill=\"#fff\"><g id=\"us_svg_d\"><g id=\"us_svg_c\"><g id=\"us_svg_e\"><g id=\"us_svg_b\"><path id=\"us_svg_a\" d=\"m247 90 70.53 217.08-184.66-134.16h228.26L176.47 307.08z\"/><use xlink:href=\"#us_svg_a\" y=\"420\"/><use xlink:href=\"#us_svg_a\" y=\"840\"/><use xlink:href=\"#us_svg_a\" y=\"1260\"/></g><use xlink:href=\"#us_svg_a\" y=\"1680\"/></g><use xlink:href=\"#us_svg_b\" x=\"247\" y=\"210\"/></g><use xlink:href=\"#us_svg_c\" x=\"494\"/></g><use xlink:href=\"#us_svg_d\" x=\"988\"/><use xlink:href=\"#us_svg_c\" x=\"1976\"/><use xlink:href=\"#us_svg_e\" x=\"2470\"/></g>";
const US_VB = '0 0 7410 3900';

/* The Declaration of Independence, 1776 (public domain), re-set in the
   period's long-s orthography, then pre-wrapped and pre-justified against
   EB Garamond's own metrics: each entry is 'text|extraWordSpacing'. */
const DOC_LINES: string[] = ["The unanimous Declaration of the thirteen united States of America,|3.3", "WHEN in the Courſe of human Events, it becomes neceſſary for one|3.44", "People to diſſolve the Political Bands which have connected them with|0.09", "another, and to aſſume among the Powers of the Earth, the ſeparate|7.13", "and equal Station to which the Laws of Nature and of Nature's God|4.61", "entitle them, a decent Reſpect to the Opinions of Mankind requires|6.64", "that they ſhould declare the cauſes which impel them to the|18.6", "Separation. WE hold theſe Truths to be ſelf-evident, that all Men are|4.88", "created equal, that they are endowed by their Creator with certain|11.17", "unalienable Rights, that among theſe are Life, Liberty, and the Purſuit|1.23", "of Happineſs — That to ſecure theſe Rights, Governments are|18.6", "inſtituted among Men, deriving their juſt Powers from the Conſent of|1.47", "the Governed, that whenever any form of Government becomes|18.43", "deſtructive of theſe Ends, it is the Right of the People to alter or to|7.55", "aboliſh it, and to inſtitute new Government, laying its Foundation on|2.72", "ſuch Principles, and organizing its Powers in ſuch form, as to them|8.85", "ſhall ſeem moſt likely to effect their Safety and Happineſs. Prudence,|5.22", "indeed, will dictate that Governments long eſtabliſhed ſhould not be|6.1", "changed for light and tranſient Cauſes; and accordingly all Experience|2.56", "hath ſhewn, that Mankind are more diſpoſed to ſuffer, while Evils are|3.42", "ſufferable, than to right themſelves by aboliſhing the forms to which|5.77", "they are accuſtomed. But when a long Train of Abuſes and|18.6", "Uſurpations, purſuing invariably the ſame Object, evinces a Deſign to|3.24", "reduce them under abſolute Deſpotiſm, it is their Right, it is their|11.54", "Duty, to throw off ſuch Government, and to provide new Guards for|2.41", "their future Security. Such has been the patient Sufferance of theſe|9.64", "Colonies; and ſuch is now the Neceſſity which conſtrains them to alter|0.56", "their former Syſtems of Government. The Hiſtory of the preſent King|1.63", "of Great-Britain is a Hiſtory of repeated Injuries and Uſurpations, all|5.04", "having in direct Object the Eſtabliſhment of an abſolute Tyranny over|1.33", "theſe States. To prove this, let Facts be ſubmitted to a candid World.|4.79", "He has refuſed his Aſſent to Laws, the moſt wholeſome and neceſſary|3.92", "for the public Good. He has forbidden his Governors to paſs Laws of|2.9", "immediate and preſſing Importance, unleſs ſuſpended in their|18.6", "Operation till his Aſſent ſhould be obtained; and when ſo ſuſpended,|4.5", "he has utterly neglected to attend to them. He has refuſed to paſs other|0.27", "Laws for the Accommodation of large Diſtricts of People, unleſs thoſe|1.22", "People would relinquiſh the Right of Repreſentation in the|18.6", "Legiſlature, a Right ineſtimable to them, and formidable to Tyrants|8.23", "only. He has called together Legiſlative Bodies at Places unuſual,|17.13", "uncomfortable, and diſtant from the Depoſitory of their public|18.6", "Records, for the ſole Purpoſe of fatiguing them into Compliance with|1.48", "his Meaſures. He has diſſolved Repreſentative Houſes repeatedly, for|6.43", "oppoſing with manly Firmneſs his Invaſions on the Rights of the|14.29", "People. He has refuſed for a long Time, after ſuch Diſſolutions, to|10.41", "cauſe others to be elected; whereby the Legiſlative Powers, incapable|6.63", "of Annihilation, have returned to the People at large for their exerciſe;|1.96", "the State remaining in the mean time expoſed to all the Dangers of|8.8", "Invaſion from without, and Convulſions within. He has endeavoured|2.83", "to prevent the Population of theſe States; for that Purpoſe obſtructing|1.62", "the Laws for Naturalization of foreigners; refuſing to paſs others to|8.97", "encourage their Migrations hither, and raiſing the Conditions of new|4.17", "Appropriations of Lands. He has obſtructed the Adminiſtration of|10.96", "Juſtice, by refuſing his aſſent to Laws for eſtabliſhing Judiciary Powers.|0.55", "He has made Judges dependent on his Will alone, for the Tenure of|6.33", "their Offices, and the Amount and Payment of their Salaries. He has|5.02", "erected a Multitude of new Offices, and ſent hither Swarms of|18.6", "Officers to harraſs our People, and eat out their Subſtance. He has|10.07", "kept among us, in Times of Peace, Standing Armies, without the|14.14", "conſent of our Legiſlatures. He has affected to render the Military|11.81", "independent of and ſuperior to the Civil Power. He has combined|10.45", "with others to ſubject us to a Juriſdiction foreign to our Conſtitution,|2.11", "and unacknowledged by our Laws; giving his Aſſent to their Acts of|6.18", "pretended Legiſlation: For quartering large Bodies of Armed Troops|6.6", "among us: For protecting them, by a mock Trial, from Puniſhment|8.12", "for any Murders which they ſhould commit on the Inhabitants of|11.7", "theſe States: For cutting off our Trade with all Parts of the World: For|1.35", "impoſing Taxes on us without our Conſent: For depriving us, in many|0.46", "Caſes, of the Benefits of Trial by Jury: For tranſporting us beyond Seas|0.24", "to be tried for pre-tended Offences: For aboliſhing the free Syſtem of|4.28", "Engliſh Laws in a neighbouring Province, eſtabliſhing therein an|18.6", "arbitrary Government and enlarging its Boundaries, ſo as to render it|4.94", "at once an Example and fit Inſtrument for introducing the ſame|16.2", "abſolute Rule into theſe Colonies: For taking away our Charters,|15.71", "aboliſhing our moſt valuable Laws, and altering fundamentally the|12.25", "forms of our Governments: For ſuſpending our own Legiſlatures, and|2.43", "declaring themſelves inveſted with Power to legiſlate for us in all Caſes|1.74", "whatſoever. He has abdicated Government here, by declaring us out|6.88", "of his Protection and waging War againſt us. He has plundered our|7.9", "Seas, ravaged our Coaſts, burnt our Towns, and deſtroyed the Lives of|1.09", "our People. He is, at this Time, tranſporting large Armies of foreign|6.52", "Mercenaries to compleat the Works of Death, Deſolation, and|18.6", "Tyranny already begun with circumſtances of Cruelty and Perfidy,|11.22", "ſcarcely paralleled in the moſt barbarous Ages, and totally unworthy|6.76", "of the Head of a civilized Nation. He has conſtrained our fellow|14.44", "Citizens taken Captive on the high Seas to bear Arms againſt their|10.4", "Country, to become the Executioners of their friends and Brethren, or|0.68", "to fall themſelves by their Hands. He has excited domeſtic|18.6", "Inſurrections amongſt us, and has endeavoured to bring on the|18.6", "Inhabitants of our Frontiers, the mercileſs Indian Savages, whoſe|18.0", "known Rule of Warfare, is an undiſtinguiſhed Deſtruction, of all|15.48", "Ages, Sexes and Conditions. In every ſtage of theſe Oppreſſions we|9.93", "have Petitioned for Redreſs in the moſt humble Terms: Our repeated|3.57", "Petitions have been anſwered only by repeated Injury. A Prince, whoſe|0.42", "Character is thus marked by every act which may define a Tyrant, is|5.93", "unfit to be the Ruler of a free People. Nor have we been wanting in|5.66", "Attentions to our Britiſh Brethren. We have warned them from Time|2.78", "to Time of Attempts by their Legiſlature to extend an unwarrantable|4.15", "juriſdiction over us. We have reminded them of the Circumſtances of|3.19", "our Emigration and Settlement here. We have appealed to their native|2.08", "juſtice and Magnanimity, and we have conjured them by the Ties of|5.96", "our common Kindred to diſavow theſe Uſurpations, which, would|11.44", "inevitably interrupt our Connections and Correſpondence. They too|4.7", "have been deaf to the Voice of Juſtice and of Conſanguinity. We muſt,|0.61", "therefore, acquieſce in the Neceſſity, which denounces our Separation,|0.47", "and hold them, as we hold the reſt of Mankind, Enemies in War, in|6.8", "Peace, Friends. We, therefore, the Repreſentatives of the UNITED|11.12", "STATES OF AMERICA, in General Congreſs, Aſſembled, appealing|2.7", "to the Supreme Judge of the World for the Rectitude of our|18.6", "Intentions, do, in the Name, and by Authority of the good People of|3.64", "theſe Colonies, ſolemnly Publiſh and Declare, That theſe United|18.27", "Colonies are, and of Right ought to be, FREE AND|18.6", "INDEPENDENT STATES, that they are abſolved from all|18.6", "Allegiance to the Britiſh Crown, and that all political Connection|13.08", "between them and the State of Great-Britain, is and ought to be totally|0.29", "diſſolved; and that as FREE AND INDEPENDENT STATES, they|5.93", "have full Power to levy War, conclude Peace, contract Alliances,|17.2", "eſtabliſh Commerce, and to do all other Acts and Things which|16.74", "INDEPENDENT STATES may of right do. And for the ſupport of|4.55", "this Declaration, with a firm Reliance on the Protection of divine|12.5", "Providence, we mutually pledge to each other our Lives, our fortunes,|1.81", "and our ſacred Honor.|0.0"];

/* ------------------------------------------------------------------ setup */

const TAU = Math.PI * 2;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const smooth = (x: number) => x * x * (3 - 2 * x);
const seg = (f: number, a: number, b: number) => smooth(clamp((f - a) / (b - a), 0, 1));
const outCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const hash = (n: number) => {
	const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
	return s - Math.floor(s);
};

const FACE = `
@font-face{font-family:'DocSerif';src:url(data:font/woff2;base64,${FONT_BODY}) format('woff2');font-weight:400;font-style:normal;font-display:block}
@font-face{font-family:'PlateDisplay';src:url(data:font/woff2;base64,${FONT_DISP}) format('woff2');font-weight:400;font-style:normal;font-display:block}`;

if (typeof document !== 'undefined' && !document.getElementById('m59-faces')) {
	const st = document.createElement('style');
	st.id = 'm59-faces';
	st.textContent = FACE;
	document.head.appendChild(st);
}

/* Both faces are inlined above, so the only thing that can still be pending is
   the decode. Release synchronously the moment the check passes; keep the
   promise and a hard timer as the two fallbacks. */
const usePlateFonts = () => {
	const [handle] = useState(() => delayRender('m59 fonts'));
	const done = useRef(false);
	useEffect(() => {
		const fin = () => {
			if (!done.current) {
				done.current = true;
				continueRender(handle);
			}
		};
		const d: any = typeof document === 'undefined' ? null : document;
		const ready =
			d && d.fonts && d.fonts.check
				? d.fonts.check("400 40px 'DocSerif'") && d.fonts.check("400 40px 'PlateDisplay'")
				: false;
		if (ready) {
			fin();
			return;
		}
		if (d && d.fonts && d.fonts.load) {
			Promise.all([d.fonts.load("400 40px 'DocSerif'"), d.fonts.load("400 40px 'PlateDisplay'")])
				.then(fin)
				.catch(fin);
		} else {
			fin();
		}
		const id = setTimeout(fin, 700);
		return () => {
			clearTimeout(id);
			fin();
		};
	}, [handle]);
};

/* ------------------------------------------------- the page in perspective */

/* For any plane seen through a pinhole, the on-screen pitch of an evenly ruled
   page is exactly quadratic in screen y: pitch(y) = PK * (y - HORIZON)^2, with
   HORIZON the line the page converges to. Both constants are pinned by
   measurement — the sharp-band pitch is 107 px (39 px at 700 wide x 2.743),
   and the pitch ratio between the bottom of frame and the sharp band is the
   1.9x the reference's blur gradient implies. */
const HORIZON = -1186; // px, i.e. 1186 px above the top edge
const PK = 4.254e-5;
const P_PAGE = 127.7; // plate units per line of the page

/* q is distance up the page in line units. It is the natural coordinate here:
   screen y and the plate-to-pixel scale are both closed-form in q, so any
   frame can be drawn without carrying state from the frame before it. */
const yOfQ = (q: number) => 1 / (PK * q) + HORIZON;
const qOfY = (y: number) => 1 / (PK * (y - HORIZON));
const kOfQ = (q: number) => 1 / (PK * q * q) / P_PAGE;

const Q_LO = 9.4; // just below the bottom edge
const Q_HI = 26.4; // just above the top edge
const Q0 = 17.5; // page position at frame 0
const SCROLL = 0.766 / 60; // lines per frame = 82 px/s in the sharp band

const EM = 62; // body em, plate units
const MEASURE = 2380; // plate units per line; deliberately bleeds past both edges
const CX = 968;
const ROLL = -3.2; // deg; the reference's baselines rise slightly to the right

/* focus and ink, both read off the reference's own falloff */
const FOCUS_Y = 430;
const blurAt = (y: number) =>
	y > FOCUS_Y
		? Math.pow((y - FOCUS_Y) / 660, 1.7) * 11.5
		: Math.pow((FOCUS_Y - y) / 430, 1.6) * 2.6;
const inkAt = (y: number) =>
	y > 330
		? 0.4 + 0.58 * Math.exp(-Math.pow((y - 330) / 210, 1.5))
		: 0.98 - 0.3 * Math.pow((330 - y) / 330, 1.3);

const PAPER = '#c6a37e';
const INK = '#4c2d17';

/* ------------------------------------------------------------ cloth model */

/* Same two-harmonic surface used across this series: a z-depth ripple
   projected back onto x as a shear, plus a y-flap. Amplitudes are scaled up
   from the small-flag version because this cloth is 2640 px on the hoist. */
const FW = 2640;
const FH = 1060;
const NB = 24; // bands
const BWU = FW / NB; // band width in cloth units
/* Abutting bands leave a hairline in Chromium however carefully they are
   clipped — antialiased edges never sum back to one. So each band is drawn 3 px
   wider on BOTH sides and carries a mask that ramps 0->1 over those 3 px. Two
   neighbours' ramps are complementary linears, so they sum to exactly 1 across
   the join: a cross-fade, not a butt joint. One mask definition serves all 24,
   because a userSpaceOnUse mask resolves in the referencing band's own space. */
const LAP = 3;
const A1 = 74;
const A2 = 25;
const B1 = 92;
const B2 = 33;
const KW1 = 1.2;
const KW2 = 2.25;
const SHEAR = 0.34;
const DROOP = 26;
const envF = (s: number) => Math.pow(s, 0.82);
const zD = (s: number, p1: number, p2: number) =>
	envF(s) * (A1 * Math.sin(KW1 * TAU * s - p1) + A2 * Math.sin(KW2 * TAU * s - p2 + 1.05));
const yF = (s: number, p1: number, p2: number) =>
	envF(s) * (B1 * Math.sin(KW1 * TAU * s - p1 + 0.72) + B2 * Math.sin(KW2 * TAU * s - p2 + 2.4)) +
	DROOP * s * s;

/* [obs] the flag's lower edge runs (55,740) -> (1866,238) at 1920x1080 */
const HX = 55;
const HY = 740;
const FROT = -15.5;

/* ------------------------------------------------------------- the lockup */

type Beat = {a: number; b: number; big: string[]; small: string; size: number; track: number};
const BEATS: Beat[] = [
	{a: 96, b: 352, big: ['1776'], small: 'IN CONGRESS, JULY 4', size: 196, track: 0.06},
	{a: 352, b: 610, big: ['INDEPENDENCE DAY'], small: 'THE FOURTH OF JULY', size: 104, track: 0.1},
	{a: 610, b: 900, big: ['LAND OF THE FREE', 'HOME OF THE BRAVE'], small: '', size: 82, track: 0.14},
];
const RULE_L = 468;
const RULE_R = 1452;
const RULE_TOP = 590;
const RULE_BOT = 846;

const GOLD = (p: number) => {
	const c = p * 148 - 24;
	return `linear-gradient(102deg,#a5732c 0%,#c9973f ${c - 32}%,#f0d698 ${c - 10}%,#fff6e0 ${c}%,#f0d698 ${
		c + 10
	}%,#c9973f ${c + 32}%,#a5732c 100%)`;
};
/* the words are a graphic laid on the plate, not something photographed on it:
   a tight dark rim plus a cast shadow is what keeps them off the parchment */
const TITLE_SHADOW =
	'drop-shadow(0 0 2px rgba(38,18,3,0.95)) drop-shadow(0 2px 4px rgba(38,18,3,0.7)) drop-shadow(0 8px 20px rgba(30,14,2,0.55))';

/* --------------------------------------------------------------- the plate */

export const Motion: React.FC = () => {
	usePlateFonts();
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const f = frame;
	const T = f / 60;

	/* --- page position ---------------------------------------------------- */
	const A = Q0 + SCROLL * f;
	const nLo = Math.ceil(A - Q_HI);
	const nHi = Math.floor(A - Q_LO);

	/* --- camera: a very slight settle inward, nothing that fights the page -- */
	const camZ = 1.0 + 0.026 * outCubic(clamp(f / 780, 0, 1));
	const camY = -10 * outCubic(clamp(f / 780, 0, 1));

	/* --- cloth phases ----------------------------------------------------- */
	const p1 = TAU * 0.235 * T;
	const p2 = TAU * 0.362 * T;

	const lines: React.ReactNode[] = [];
	for (let n = Math.max(0, nLo); n <= Math.min(DOC_LINES.length - 1, nHi); n++) {
		const q = A - n;
		if (q <= 0) continue;
		const y = yOfQ(q);
		const k = kOfQ(q);
		const raw = DOC_LINES[n];
		const bar = raw.lastIndexOf('|');
		const text = raw.slice(0, bar);
		const extra = Number(raw.slice(bar + 1));
		const bl = blurAt(y);
		const al = inkAt(y);
		lines.push(
			<div
				key={n}
				style={{
					position: 'absolute',
					left: CX,
					top: 0,
					width: 0,
					height: 0,
					transform: `translateY(${y}px) scale(${k})`,
					transformOrigin: '0 0',
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: -MEASURE / 2,
						top: -EM * 0.66,
						width: MEASURE,
						fontFamily: 'DocSerif, serif',
						fontSize: EM,
						lineHeight: 1,
						whiteSpace: 'nowrap',
						wordSpacing: `${extra}px`,
						color: INK,
						opacity: al * 0.88,
						filter: bl > 0.06 ? `blur(${bl / k}px)` : undefined,
					}}
				>
					{text}
				</div>
			</div>,
		);
	}

	/* a second, much larger and fainter setting of the same page sitting well
	   behind the first. The reference gets this depth by accident, from its
	   dissolving layers; here it is one deliberate layer. */
	const backLines: React.ReactNode[] = [];
	const AB = Q0 * 0.62 + SCROLL * 0.44 * f;
	for (let n = 0; n < 34; n++) {
		const q = AB - n * 0.62;
		if (q < Q_LO * 0.9 || q > Q_HI) continue;
		const y = yOfQ(q);
		const k = kOfQ(q) * 1.72;
		const raw = DOC_LINES[(n + 41) % DOC_LINES.length];
		const bar = raw.lastIndexOf('|');
		backLines.push(
			<div
				key={n}
				style={{
					position: 'absolute',
					left: CX - 120,
					top: 0,
					width: 0,
					height: 0,
					transform: `translateY(${y}px) scale(${k})`,
					transformOrigin: '0 0',
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: -MEASURE / 2,
						top: -EM * 0.66,
						width: MEASURE,
						fontFamily: 'DocSerif, serif',
						fontSize: EM,
						lineHeight: 1,
						whiteSpace: 'nowrap',
						color: INK,
						opacity: 0.15 * inkAt(y),
						filter: `blur(${(blurAt(y) + 5.5) / k}px)`,
					}}
				>
					{raw.slice(0, bar)}
				</div>
			</div>,
		);
	}

	/* --- cloth bands ------------------------------------------------------ */
	/* the surface normal a flat projection can actually give us: the slope of
	   the depth ripple, sampled at both edges of the band so the shading is a
	   gradient across it rather than a step */
	const norm = (s: number) => {
		const h = 0.004;
		return clamp(((zD(s + h, p1, p2) - zD(s - h, p1, p2)) / (2 * h) / FW) * 1.15, -1, 1);
	};
	const shade = (v: number) =>
		v > 0 ? `rgba(255,248,232,${(v * 0.5).toFixed(3)})` : `rgba(22,12,5,${(-v * 0.66).toFixed(3)})`;

	const bands: React.ReactNode[] = [];
	const shGrads: React.ReactNode[] = [];
	for (let i = 0; i < NB; i++) {
		const s0 = i / NB;
		const s1 = (i + 1) / NB;
		const X0 = s0 * FW + SHEAR * zD(s0, p1, p2);
		const X1 = s1 * FW + SHEAR * zD(s1, p1, p2);
		const Y0 = yF(s0, p1, p2);
		const Y1 = yF(s1, p1, p2);
		const w = X1 - X0;
		const sx = w / BWU;
		const ang = (Math.atan2(Y1 - Y0, w) * 180) / Math.PI;
		shGrads.push(
			<linearGradient
				key={i}
				id={`m59sh${i}`}
				gradientUnits="userSpaceOnUse"
				x1={0}
				y1={0}
				x2={BWU}
				y2={0}
			>
				<stop offset="0" stopColor={shade(norm(s0))} />
				<stop offset="1" stopColor={shade(norm(s1))} />
			</linearGradient>,
		);
		/* skewY, not rotate. rotate() pivots the band on its top corner, so two
		   neighbours whose fold angles differ by half a degree splay ~9 px apart
		   by the bottom of a 1060 px cloth and the page shows through the gap.
		   skewY leaves every vertical line vertical, so band i's right edge and
		   band i+1's left edge coincide at every height by construction. */
		bands.push(
			<g key={i} transform={`translate(${X0} ${Y0}) skewY(${ang}) scale(${sx} 1)`} mask="url(#m59seam)">
				<use href="#m59flag" x={-s0 * FW} y={0} width={FW} height={FH} />
				<rect x={-LAP} y={-14} width={BWU + LAP * 2} height={FH + 28} fill={`url(#m59sh${i})`} />
			</g>,
		);
	}

	/* --- lockup ----------------------------------------------------------- */
	const ruleP = seg(f, 62, 176);
	const sweep = clamp((f - 210) / 130, 0, 1) * 0.34 + clamp((f - 470) / 130, 0, 1) * 0.33 + clamp((f - 726) / 130, 0, 1) * 0.33;

	const beatNodes = BEATS.map((B, bi) => {
		const inP = seg(f, B.a, B.a + 62);
		const outP = bi === BEATS.length - 1 ? 0 : seg(f, B.b - 46, B.b + 12);
		const vis = inP * (1 - outP);
		if (vis <= 0.004) return null;
		const lift = mix(30, 0, outCubic(inP)) + outP * 26;
		const bl = mix(13, 0, outCubic(inP)) + outP * 11;
		const rows = B.big.length;
		return (
			<div
				key={bi}
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: 1920,
					height: 1080,
					opacity: vis,
				}}
			>
				{B.small ? (
					<div
						style={{
							position: 'absolute',
							left: 0,
							top: RULE_TOP + 44,
							width: 1920,
							textAlign: 'center',
							fontFamily: 'PlateDisplay, serif',
							fontSize: 31,
							letterSpacing: '0.42em',
							textIndent: '0.42em',
							color: '#f0d9ab',
							opacity: 0.95,
							transform: `translateY(${lift * 0.5}px)`,
							filter: `blur(${bl * 0.4}px) drop-shadow(0 1px 3px rgba(34,16,3,0.9))`,
						}}
					>
						{B.small}
					</div>
				) : null}
				{B.big.map((row, ri) => {
					const rowIn = seg(f, B.a + ri * 13, B.a + ri * 13 + 62);
					const rl = mix(34, 0, outCubic(rowIn)) + outP * 26;
					const rb = mix(15, 0, outCubic(rowIn)) + outP * 11;
					const top =
						rows === 1
							? B.small
								? RULE_TOP + 92
								: RULE_TOP + 58
							: RULE_TOP + 52 + ri * (B.size * 1.24);
					return (
						<div
							key={ri}
							style={{
								position: 'absolute',
								left: 0,
								top,
								width: 1920,
								textAlign: 'center',
								fontFamily: 'PlateDisplay, serif',
								fontSize: B.size,
								lineHeight: 1.06,
								letterSpacing: `${B.track}em`,
								textIndent: `${B.track}em`,
								transform: `translateY(${rl}px)`,
								filter: `blur(${rb}px) ${TITLE_SHADOW}`,
							}}
						>
							<span
								style={{
									backgroundImage: GOLD(sweep),
									WebkitBackgroundClip: 'text',
									backgroundClip: 'text',
									color: 'transparent',
								}}
							>
								{row}
							</span>
						</div>
					);
				})}
			</div>
		);
	});

	/* thirteen stars, drawn rather than typed — no OFL face here carries one */
	const stars: React.ReactNode[] = [];
	for (let i = 0; i < 13; i++) {
		const sp = seg(f, 122 + i * 7, 122 + i * 7 + 46);
		const x = 960 + (i - 6) * 44;
		const pts: string[] = [];
		for (let k = 0; k < 10; k++) {
			const r = (k % 2 === 0 ? 14.6 : 6.2) * (0.4 + 0.6 * sp);
			const a = -Math.PI / 2 + (k * Math.PI) / 5;
			pts.push(`${(x + r * Math.cos(a)).toFixed(2)},${(RULE_TOP + r * Math.sin(a)).toFixed(2)}`);
		}
		stars.push(
			<polygon
				key={i}
				points={pts.join(' ')}
				fill="#e0b45e"
				opacity={sp * 0.96}
				transform={`rotate(${(1 - sp) * 110} ${x} ${RULE_TOP})`}
			/>,
		);
	}

	/* --- dust ------------------------------------------------------------- */
	const motes: React.ReactNode[] = [];
	for (let i = 0; i < 54; i++) {
		const dz = 0.28 + hash(i * 3.1) * 0.72;
		const x = ((hash(i) * 2200 - 120 + T * (7 + dz * 26)) % 2160) - 120;
		const y = ((hash(i + 91) * 1240 - 80 - T * (11 + dz * 20)) % 1220 + 1220) % 1220 - 90;
		const r = 1.1 + dz * 3.4;
		const tw = 0.4 + 0.6 * Math.abs(Math.sin(T * (0.6 + hash(i + 7) * 1.4) + i));
		motes.push(
			<circle
				key={i}
				cx={x}
				cy={y}
				r={r}
				fill="#ffeec6"
				opacity={0.1 + dz * 0.3 * tw}
				style={{filter: `blur(${(1 - dz) * 3.6 + 0.6}px)`}}
			/>,
		);
	}

	/* --- grain: a static noise field walked a few pixels each frame -------- */
	const gx = (hash(f) - 0.5) * 60;
	const gy = (hash(f + 500) - 0.5) * 60;

	return (
		<AbsoluteFill style={{background: '#25190f', overflow: 'hidden'}}>
			<AbsoluteFill
				style={{transform: `translateY(${camY}px) scale(${camZ})`, transformOrigin: '50% 46%'}}
			>
				{/* ------------------------------------------------ paper ground */}
				<AbsoluteFill style={{background: PAPER}} />
				<AbsoluteFill
					style={{
						background:
							'radial-gradient(128% 92% at 62% 78%, #e2c096 0%, #cda880 34%, #ad8a63 66%, #83603f 100%)',
					}}
				/>
				<svg
					width={1920}
					height={1080}
					viewBox="0 0 1920 1080"
					style={{position: 'absolute', left: 0, top: 0}}
				>
					<defs>
						<filter id="m59fibre" x="0" y="0" width="100%" height="100%">
							<feTurbulence type="fractalNoise" baseFrequency="0.9 0.014" numOctaves={2} seed={7} />
							<feColorMatrix type="saturate" values="0" />
						</filter>
						<filter id="m59stain" x="-10%" y="-10%" width="120%" height="120%">
							<feTurbulence type="fractalNoise" baseFrequency="0.0035" numOctaves={4} seed={21} />
							<feColorMatrix type="saturate" values="0" />
							<feComponentTransfer>
								<feFuncA type="table" tableValues="0 0 0.15 0.55 0.9" />
							</feComponentTransfer>
						</filter>
						<filter id="m59grain" x="0" y="0" width="100%" height="100%">
							<feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves={2} seed={3} />
							<feColorMatrix type="saturate" values="0" />
						</filter>
					</defs>
					<rect width={1920} height={1080} filter="url(#m59fibre)" opacity={0.16} style={{mixBlendMode: 'overlay'}} />
					<rect
						x={-80}
						y={-80}
						width={2080}
						height={1240}
						filter="url(#m59stain)"
						opacity={0.3}
						style={{mixBlendMode: 'multiply'}}
					/>
				</svg>

				{/* -------------------------------------------- the page itself */}
				<AbsoluteFill style={{transform: `rotate(${ROLL}deg)`, transformOrigin: '50% 50%'}}>
					{backLines}
					{lines}
				</AbsoluteFill>

				{/* ----------------------------------------------------- the flag */}
				<svg
					width={1920}
					height={1080}
					viewBox="0 0 1920 1080"
					style={{position: 'absolute', left: 0, top: 0}}
				>
					<defs>
						<symbol
							id="m59flag"
							viewBox={US_VB}
							preserveAspectRatio="none"
							dangerouslySetInnerHTML={{__html: US_ART}}
						/>
						{shGrads}
						{/* Only the TRAILING edge ramps. Two complementary ramps look right
						    but are wrong: source-over of alpha a and alpha 1-a composites to
						    (1-a) + a^2, which is 0.75 at the midpoint — that shortfall is
						    exactly the pale bar that shows up between bands. Ramping only
						    the band underneath, and leaving the band drawn on top of it
						    fully opaque through the overlap, composites to 1 everywhere. */}
						<linearGradient
							id="m59seamGrad"
							gradientUnits="userSpaceOnUse"
							x1={-LAP}
							y1={0}
							x2={BWU + LAP}
							y2={0}
						>
							<stop offset="0" stopColor="#fff" stopOpacity="1" />
							<stop offset={(BWU + LAP * 0.4) / (BWU + 2 * LAP)} stopColor="#fff" stopOpacity="1" />
							<stop offset="1" stopColor="#fff" stopOpacity="0" />
						</linearGradient>
						<mask
							id="m59seam"
							maskUnits="userSpaceOnUse"
							x={-LAP - 1}
							y={-14}
							width={BWU + 2 * LAP + 2}
							height={FH + 28}
						>
							<rect x={-LAP} y={-14} width={BWU + 2 * LAP} height={FH + 28} fill="url(#m59seamGrad)" />
						</mask>
						{/* the hem: the cloth's free edge is nearer the lens than the page
						    behind it, so it goes soft before the page does */}
						<linearGradient id="m59hem" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={0} y2={FH + 60}>
							<stop offset="0" stopColor="#fff" stopOpacity="1" />
							<stop offset={(FH - 46) / (FH + 60)} stopColor="#fff" stopOpacity="1" />
							<stop offset={(FH + 26) / (FH + 60)} stopColor="#fff" stopOpacity="0" />
							<stop offset="1" stopColor="#fff" stopOpacity="0" />
						</linearGradient>
						<mask id="m59hemMask" maskUnits="userSpaceOnUse" x={-60} y={-60} width={FW + 120} height={FH + 140}>
							<rect x={-60} y={-60} width={FW + 120} height={FH + 140} fill="url(#m59hem)" />
						</mask>
					</defs>
					<g
						opacity={0.65}
						style={{filter: 'blur(3.4px) saturate(0.66)'}}
						transform={`translate(${HX} ${HY}) rotate(${FROT}) translate(0 ${-FH})`}
					>
						<g mask="url(#m59hemMask)">{bands}</g>
					</g>
				</svg>

				{/* [obs] the reference crushes the hoist end into shadow — the canton
				    samples #251e1b at every timestamp while the fly end swings
				    #483931..#9f8a7e with the fold */}
				<AbsoluteFill
					style={{
						background:
							'linear-gradient(96deg, rgba(20,11,5,0.5) 0%, rgba(20,11,5,0.26) 15%, rgba(20,11,5,0.06) 31%, rgba(20,11,5,0) 46%)',
					}}
				/>

				{/* ------------------------------------------------------- light */}
				<AbsoluteFill
					style={{
						background:
							'radial-gradient(46% 40% at 63% 76%, rgba(255,231,180,0.5) 0%, rgba(255,222,160,0.18) 44%, rgba(255,214,150,0) 72%)',
						mixBlendMode: 'screen',
						opacity: 0.62 + 0.06 * Math.sin(T * 0.5),
					}}
				/>
			</AbsoluteFill>

			{/* -------------------------------------------------------- lockup */}
			{/* gold on lit parchment needs somewhere to sit. Rather than a flat
			    scrim, the plate is pushed out of focus and down in value behind
			    the words only — the same language the page itself is using. */}
			<AbsoluteFill
				style={{
					backdropFilter: 'blur(11px) brightness(0.74) saturate(0.88)',
					WebkitBackdropFilter: 'blur(11px) brightness(0.74) saturate(0.88)',
					maskImage:
						'radial-gradient(64% 40% at 50% 66.5%, #000 0%, rgba(0,0,0,0.86) 34%, rgba(0,0,0,0.5) 58%, rgba(0,0,0,0.17) 78%, rgba(0,0,0,0) 100%)',
					WebkitMaskImage:
						'radial-gradient(64% 40% at 50% 66.5%, #000 0%, rgba(0,0,0,0.86) 34%, rgba(0,0,0,0.5) 58%, rgba(0,0,0,0.17) 78%, rgba(0,0,0,0) 100%)',
					opacity: seg(f, 56, 196),
				} as React.CSSProperties}
			/>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(58% 34% at 50% 66.5%, rgba(46,24,7,0.34) 0%, rgba(46,24,7,0.19) 46%, rgba(46,24,7,0.06) 74%, rgba(46,24,7,0) 100%)',
					opacity: seg(f, 56, 196),
				}}
			/>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', left: 0, top: 0}}>
				<g opacity={0.9}>
					<rect
						x={960 - (960 - RULE_L) * ruleP}
						y={RULE_TOP - 0.9}
						width={(RULE_R - RULE_L) * ruleP}
						height={1.8}
						fill="#b98f42"
					/>
					<rect
						x={960 - (960 - RULE_L) * seg(f, 78, 192)}
						y={RULE_BOT - 0.9}
						width={(RULE_R - RULE_L) * seg(f, 78, 192)}
						height={1.8}
						fill="#b98f42"
					/>
					{stars}
				</g>
			</svg>
			{beatNodes}

			{/* --------------------------------------------------------- finish */}
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', left: 0, top: 0}}>
				<g>{motes}</g>
			</svg>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(74% 68% at 56% 58%, rgba(0,0,0,0) 42%, rgba(28,14,4,0.34) 76%, rgba(18,8,2,0.72) 100%)',
				}}
			/>
			<AbsoluteFill
				style={{
					background:
						'linear-gradient(180deg, rgba(22,11,3,0.5) 0%, rgba(22,11,3,0.2) 20%, rgba(22,11,3,0) 42%), linear-gradient(112deg, rgba(24,12,4,0.34) 0%, rgba(24,12,4,0.07) 22%, rgba(24,12,4,0) 40%)',
				}}
			/>
			<AbsoluteFill style={{background: 'rgba(158,96,32,0.1)', mixBlendMode: 'overlay'}} />
			<svg
				width={1920}
				height={1080}
				viewBox="0 0 1920 1080"
				style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'overlay', opacity: 0.11}}
			>
				<rect x={-60} y={-60} width={2040} height={1200} filter="url(#m59grain)" transform={`translate(${gx} ${gy})`} />
			</svg>
			<AbsoluteFill
				style={{
					background: '#100801',
					opacity: 1 - seg(f, 0, 34) + seg(f, durationInFrames - 44, durationInFrames),
				}}
			/>
		</AbsoluteFill>
	);
};
