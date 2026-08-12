import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';

/**
 * MOTION 68 — "SMART CLEANUP · STORAGE OPTIMIZER"
 * ---------------------------------------------------------------------------
 * A light, uncluttered file workspace. A cursor drag-selects the top row of
 * folders, gathers them into one carried bundle, arcs it across to a frosted
 * bin, and the bin swallows and shreds them. The survivors reflow up into the
 * freed row and the panel reports the space recovered.
 *
 * Same choreography as the reference clip, new art direction: a clean light
 * plate instead of the dark holographic murk, solid dimensional folders
 * instead of flat glass rectangles, and a frosted tapered bin with a lid that
 * actually opens.
 *
 * WHAT WAS MEASURED FROM THE REFERENCE
 * ---------------------------------------------------------------------------
 * Reference: 700x394, 60 fps, 900 frames, 15.000 s. [obs] came off the frames;
 * [int] is a decision stated as one.
 *
 * [obs] LAYOUT. Blue-dominant blob analysis on f60 puts the six folder bodies
 *       on an exact lattice: column starts x = 64, 197, 330 (pitch 133) and
 *       row starts y = 118, 226 (pitch 108), every body 80 x 62. The bin is a
 *       tapered cylinder centred on x = 573.7 — its silhouette runs 524..623
 *       at y = 174 and 536..612 at y = 295, so it narrows 99 -> 76 px over
 *       121 px of height and the two mid-lines agree to within 0.5 px. That
 *       0.77 taper ratio is what this file uses.
 *
 * [obs] CURSOR ENTRY, f64-f92. The arrow tracks (33.5, 337.8) -> (58.5, 119.9)
 *       through x = 33.5, 35.2, 37.2, 39.1, 41.3, 44.2, 46.6, 49.2, 51.2,
 *       53.5, 55.2, 56.8, 57.7, 58.3 and y = 337.8, 325.0, 310.2, 291.5,
 *       270.8, 249.3, 227.2, 205.5, 184.8, 166.2, 150.8, 138.3, 129.0, 123.1.
 *       Per-sample dy runs -12.8, -14.8, -18.7, -20.7, -21.5, -22.1, -21.7,
 *       -20.7, -18.6, -15.4, -12.5, -9.3, -5.9: it accelerates for a third of
 *       the move then decelerates hard into the corner. It then sits still at
 *       (58.6, 119.3) for twelve frames before the drag starts.
 *
 * [obs] MARQUEE, f104-f180. Frame-differenced against f30 the changed-pixel
 *       bounding box is anchored at (40, 106) and its right edge sweeps 71,
 *       80, 87, 98, 110, 140, 156, 175, 199, 221, 245, 270, 288, 310, 335,
 *       351, 371, 386, 399, 415, 423, 427, 431 and parks at 434. Against a
 *       smoothstep over f104-f176 the residuals are 0.039, 0.060, -0.008,
 *       -0.005, -0.012, 0.007, -0.007, 0.008 — the only real deviation is at
 *       the very start, where the reference leaves the corner slightly faster
 *       than a symmetric ease would. The rectangle then holds ~30 frames
 *       before release.
 * [obs] The three folders light up in sequence as the edge passes them: their
 *       cell ink starts climbing at f108, f134, f152 (spacing 26, 18). This
 *       file re-derives its triggers from its own sweep geometry instead of
 *       hardcoding them and lands on f116, f135, f153 (spacing 19, 18).
 * [obs] Verified against the finished render: the marquee's own accent-blue
 *       top edge, read back at thirteen sample frames, tracks the reference's
 *       normalised sweep to 0.032 rms, largest single deviation 0.058 — inside
 *       a fifth of a folder pitch the whole way. The carried bundle's centroid
 *       ramps to 88 px per six frames and holds there (14.6 px/frame against
 *       the reference's 14.0 once scaled, 4% high), its arc apex lands at f394
 *       40.5 px above the start (reference 44 px), the stack holds motionless
 *       f316-f352 (reference f314-f350), and the red-pixel count reproduces
 *       both steps and the 24-frame decay: flush at f478, plateau f502-f538,
 *       flare at f544, decay f652-f676. Coverage during the flare runs about
 *       2x the reference's, which is deliberate — the same red has to carry
 *       against a light plate instead of near-black.
 *
 * [obs] GATHER, f272-f314. The outer two folders converge on the middle one:
 *       the left centroid goes 99.8 -> 101.2, 105.2, 112.0, 122.6, 135.2,
 *       149.5 while the right goes 365.5 -> 364.1, 360.0, 353.4, 343.1, 330.8,
 *       315.8 — mirrored, both accelerating. At f293 they merge into a single
 *       212 px blob which then narrows 212 -> 181 -> 152 -> 127 -> 109 -> 98
 *       -> 95, i.e. they end up stacked one on top of another at the middle
 *       cell rather than lined up beside it. The stack then holds still from
 *       f314 to f350.
 *
 * [obs] CARRY, f350-f428. Centroid x: 229.2, 232.2, 234.3, 237.0, 240.9,
 *       244.8, 257.7, 263.8, 270.4, 277.8, 285.3, 302.4, 313.9, 326.2, 339.7,
 *       353.3, 368.0, 383.6, 399.2, 414.9, 430.2, 445.3, 459.6, 475.0. The
 *       per-sample step grows 1, 2, 2, 2, 4, 4, 6, 7, 7, 7, 12, 11, 12, 13,
 *       14, 15, 16, 16, 16, 15, 15, 14, 15: it ramps up over roughly 45 frames
 *       then holds a constant ~5.1 px/frame straight into the bin. It does NOT
 *       decelerate on arrival. Modelled here as a velocity that smoothsteps up
 *       over the first 55% of the move and is flat after; integrating that is
 *       exactly the position curve in carryP() below.
 * [obs] Centroid y over the same window: 158.7, 157.9, 157.2, 156.8, 151.3,
 *       150.8, 150.2, 150.1, 149.6, 144.0, 143.6, 143.0, 143.2, 143.4, 144.5,
 *       145.8, 147.5, 149.2, 152.5, 155.6, 157.9, 161.9. It rises 16 px above
 *       the start, bottoms out near f395, then falls to the rim — a thrown
 *       arc, not a straight slide. Fitting y = y0 + dy*u - A*sin(pi*u) puts
 *       the apex at u = 0.374 for A = 95 once scaled, which is what is used.
 *
 * [obs] PURGE, f476-f672. Red-dominant pixel count: 0 until f474, then 8, 38,
 *       98, 102, 186, 213, 231, 304, 337, 343 to a 418 plateau held f500-f538;
 *       a second climb 427, 685, 1050, 1470, 1722, 1860 across f540-f550; a
 *       long plateau near 1700-1860 to f648; then 1701, 1640, 1483, 1367,
 *       1146, 807, 420, 180, 92, 28, 4, 0 by f672. Two distinct events, not
 *       one: a warning flush when the bundle lands, then a far bigger flare
 *       about a second later when it is actually destroyed.
 * [obs] The cursor reappears at f422 beside the bin, eases (522.6, 164.1) ->
 *       (580.9, 185.2), parks on the rim through the whole purge and leaves
 *       down-right at f594-f616.
 *
 * [obs] The reference ends by dissolving the survivors at f796-f826 and
 *       re-materialising all six at f850-f890 — it is built to loop.
 * [int] This is a build, so that reset is replaced with a resolution: the
 *       survivors reflow up into the freed row and the panel reports the
 *       recovered space. Everything before f690 keeps the measured timing.
 *
 * [int] Clean light plate. One soft radial lift behind the workspace, one cool
 *       pool behind the bin, no grain, no grid, no vignette. Every shadow is a
 *       radial-gradient ellipse rather than a Gaussian filter, so nothing in
 *       the frame depends on the renderer's filter resolution.
 * [int] Each folder is four stacked pieces — back panel with tab, two sheets
 *       of paper, front flap, contact shadow — so it reads as an object with
 *       thickness rather than a glyph. Sheen and bottom shade are painted onto
 *       the flap path itself instead of separate overlay shapes, which is what
 *       keeps the silhouette seam-free at any scale.
 * [int] The lid is hinged on the RIGHT rim and swings open to the left, so
 *       the hinge end never sits in the corner of the mouth the bundle
 *       arrives over — hinging it on the left put the lid's low end exactly
 *       on the approach and the two crossed.
 * [int] The bundle is clipped to the half-plane above the rim's FRONT arc
 *       rather than faded out, so the elliptical lip cuts across it as it
 *       sinks — the same silhouette a real object gives when it drops into a
 *       hole. Fading it through the wall instead composites blue over white
 *       and lands on lilac, which is why that route was abandoned.
 * [int] Names and sizes are chosen so the arithmetic closes: the three deleted
 *       folders are 4.2 + 3.1 + 5.1 GB, the panel reports 12.4 GB freed, and
 *       the storage read-out falls 78% -> 59% to match.
 */

/* ------------------------------------------------------------------ fonts */
const F_UI7 =
	'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';
const F_UI6 =
	'd09GMgABAAAAABPYAA8AAAAAI1wAABN+AAQAQgAAAAAAAAAAAAAAAAAAAAAAAAAAGigbIBwqBmA/U1RBVFoAgUgRCAq2eKwyATYCJAOCZAuBNA' +
	'AEIAWEMgcgG10co6Kc0eaT/UUCb0j9owWMMCIEBAtWdPWAUFTjaleHFUqWFcy8an8fIcnsD/w2e+C3MUHM24ycGRhgEGahIBZp1ASMxoyFkXOl' +
	'a6OX4XHztrtehl6FBNWqld1TtaxCaBTCgJAEwoB63ldhf6NQGPVphMTI594ZmxtRIyUaavmq2/EIBYn/qzVrOuHu6U1ysUegWD+gUEsHCDsZs7' +
	'E5+3XuAaA8a1x4gv+bK21yAOBKR67o91Wos9U15u9M8uZ+ZyFJKdkjXBDZQ0gptwUUhoS6V1UFDOpAFVARKVFhdIVsn5KLobveIgZ7PWwQ+d+H' +
	'dbZQxVSaEMXz2BlQADCm4WgIFBM0LLgfMz15ZQYIJJBrVGJgD9TYeGgsKEAAwK5SvjfXnCX0xFR3FotzQQcgwvmR+K8mkgWyI8g9AIdRGfSH2T' +
	'paRbZRw3cNtmx6Q9ETYTFwkeEQTv5iWweg8Fn7hB4LkLmUAjCEUZMrEHHc6ow20PsHRWKUB0DpOqcYFdH/w/RDEaHJ0TSGiOpQPEEVEJYF1Cg6' +
	'ESDayyYByTleYMpRKBNxwTBlWBEp92rCjBV7ngiS0aVi4hI7Y8GjIZwTICEaL2nBmgMvpFwWnoi9d3cAjgAA5Gl1L7vX3avut+XVI4fLy1U0N1' +
	'7sobnpvYQKEoLEX7QwFOHIUFAdtTI6Cc+RUJIg/5qAeUyEWG9gQogyIpoNyRnNOXpvcZ1eo6204GhBkjhGIt+1ZOmAtmY7DgFhN5GS5EzQnckC' +
	'QA0iOCUlczyCUbLEIJpK8oicnYG6uo6CmBFnBbyqueGjzVJTW9186WWJaJirayMqMZSKfVtYnbOOs0GGNlVTA32M7aVg6KokZ2GigdCgwJSvoI' +
	'BwTA6eoqk6w+Y2WSTNSlaibw4FbnkjUEK6cCih8BFYQml9RJzmQ4OqRihhT2rAOlXrb2zkf0rWh7aMJgVrpU34EhIBZbocuApghnnu/1X4/qei' +
	'pCZdEkaisGD7SCmGS3sWgPMSCsSQ7sWpQpqVTB/btJJ67TMBABY+oB/kOefXAkjQtsC7nV5OTwzaZ2PZVR/x5QpCY+WiTEYLXo+1Jk0Dq1UDkt' +
	'dUv4jLl3TKdCjURAooPFVt7FXIFs/yDbuQVdLK7ZjJ1GWWtKMVvheY2yHbHpKOY5GaCsu8tFZbDYfDN+RriuMIKDSw1BusUc7bJFE4moYymZP5' +
	'tVrr4ck4lOzOjj+FCqvwq41xupo97hGdiQ3H673NSxadtMiIQ5n9+PwaR9gDJYdfR9EAPUFwarCQrvAcEeyEhfoUga7cNkUv81SxHBsiFlM1tc' +
	'GH8+r3oL/6ob5QXcyhSCHggz21jg4XzmFV+9sRscHAHhSoOUWPgcSJDgF7hDjZFUfVMtYl/eT/HDfZwTQGEOqmNCuB60+pmxDFUpq8I1PT4t6q' +
	'kxYGqLw/6jusW2vnE7mtkCW7dznQdqHmssCJAeV8BONd55WU1JzCB4IiJdPVcR3lOeeRh32IQO1sC0la4EVc1Kx43l16LSCuoiG0IrfRWGKo8e' +
	'hbSUmY5W2m6/q4da8hTcLtHP2xq9TKI9VKpg0ljFgeycsTKU+q5tkhjqTia+6SqgjVKE+0npFKs+1OsvisEc75t2F32S9ErQDSEKQ55ac6VHMO' +
	'hykA39xjkckncvdQ6q8doS14mhx+2slnYYg1SCvWMtvwzi4vwpJ0bnykZQ25He8sbnMp8kDbr4rgAAwo2RUF4cgP1krmcRJmCHbiqxwL+aPMZ1' +
	'mQV9/hqhR8Bs5vljF7j/+WEdCUwEVRMpt086QowKcGHnMmSsIYpDeEdEweIRJbvVlsxHysDvJni+qL3okGSnMBWctjbXqkiWNJPrnaAV8+K4JN' +
	'nUeHVuS9qvndpcC/nHq9rzZGMRQ/wcu6+ObQ+6R+AGtIs0BFYghII7AqaPIqbtnyUIP2UCcRiFgnVGZN8KgeV6dqv+v8/6S6tY0sZbahRFdc5T' +
	'naLoli0a/xehhG77FargUguSi2RpVENbsW/9cfaG74ZLac/9RR7M10nps9Axe5//LoaysqJjO4GZdiOqL8ZMV4jW9lcWfz6EHVxRFUdbVwme6E' +
	'lNGC4ryFn7knw3407astSAog8YQ+MbaXVCh5zkSmf4IoT4gFR3XcVee5s3Gft8/Fu8xdFj8MnK7nb2iIVDD+vlmp5BLTAPGqmPf2+En+m9VSYU' +
	'CJKYPsl61MUlXlZS5Ptj+OgA7RK8HQZiH3+cwJ7rO7BYfKXrX+6HP2RNirNyfC/c99ISsdUFmogse4+WStp/nH5rFLTw5fkOUnpzcEPwpiwbEL' +
	'd991aTbu3fa5eOf5K2UPKdP1vDl1gYa+b2piQL5xoHBVxH9z4hj/7Zq4onA6IXk891a/lH5+YwJv0E8noMyZ4yijHs1zzaCnJfCp2mN/QD7+EK' +
	'ecUFIsTGcVCUsMFHV/QH+C+Nz/7MNSmjgNxGDJWmjpTTeTX9Th51lGspFau85vVo/eNP9KQnfVdo+sL06PxnnUW1OJ+aBx36LbgnGP+ZBp43ca' +
	'dahekJUqfXZANcoMyoxQsdhwuynbw5Y1bzQ/PcN/emNZaXfIbhofiQd/mSH0MLrF6XPvyuwMnV13KNVhI2Zpe+RilM4gI+6qavt7st98ak0Oa0' +
	'6a9RObywoUL8sdsn8OjkTcVde5cz4C1a9ecWkZ8dufD+dy4fJH0bKQ+/b4SQE6jEi8IuK9PXGc90Yphz8ttiffVJX+2NEp/OFd1UzB9+FZ1UHe' +
	'ZRER3qKagOy/dmDj8+eedWbhn35w9GEg6/Ct6opLS7/u6BB++a5gpuMHflaVh09OeKRPfjUB3l4Cd9I0fxLG8LP/8zvvyfbIy4XFsJudYhMlri' +
	'FpRC//EKFLJPaY9bL95qWR+vZrvwmGRj/lSC6hy2QUmQMcUazQiZjg6RsaUWy/3mISjR0klWfSOll1Ddf/yQVZl+0nE0/ubCtvw7bWvFpT/87o' +
	'PeWF1OjugWg2W4DvLXVB+d7owI5qEwQZuUrN1OvkTIvi7BzXPRwvRVu/PM+YqeERKVzVNZPuxZjoYuOM1ww3VOnW6nSjDbM1XBxmUlcf06urFW' +
	'e6ZryhQbdToxtumKxh4zBYXUNdV6mTSq/7F4U2KroDRP1uCwXDcvu/H1zNrqTeMsH6ul5Qsw0i8B0zvyW9dczwFtgFLajZGZ93vGxmkuH1JKzD' +
	'JcE66prdeeso16T1F2GQSDLO6PZQ3LKikVqNM8lGWcR2CzKy5WYs000C4bQFtt6ZJu73pWrFpSlcQafvPAk9Zp5R7BZWPUgM1YrLVLiBznzzBC' +
	'7hecdDWf25THKZkHbALEo+TUmkVmcu624dGm9JJDEsNh5+djBMb65e98uPGDNtSIjqzX/312GljvjIagfcxahiPyLHt/7WpWAVqmLtgVQTF6KL' +
	'gwMx1ggeYZlVxBC6u8bZ/0FWitgqu9Polf4ZtQ/qxLC8WIralNzeSihhEKY4HK+JkpTE+JIk77GcHO/J/cmQi5/81FWLnjlVi3zqnEwdta9Ijq' +
	'3RiNpxOmFJPhumZ08vTSNMcdmEI6VpdIdw/StWtKEdJ42Y2LrKlDFHMMPWb0pKUYvLYtisq86s9A+mWyjbIpDS3bPq7qH0CqLuVlxJss9kTo73' +
	'2P6kuMSSFMIEh0OY2s+AUvzxnfZa1OnZapn3PWPZi6SO5siHvdE9ZzVEzgzPjsKI+PjSSF9JjJhH6a6hxXumGAYQVT866CXVSC4Hg20m4+7lu5' +
	'iHjFv5Kb0jwcwgrlaTyy1EyYjmS/GfA/6S5HpAZbE+7bvwPb4kzr4oUXe+8Cu8BS223JNVvSkUb88vlv23WVeTUUUKSXFXXdpl9TdefsfoOxBX' +
	'EulziM/zHilJjE/cn0IYyWZ7H9ofC+0dnSa9etCkb9c119VcNMNirDTekB3NL6rKDuITfAqhhYEwQKGPITsqSh6cDRG7bpmHEqlkKGUSrHouO3' +
	'4wd5t3A1kpAildyvn39MJvF0DnhXTk/OTM/aqIwWpnZFZIvINFfQf29O7FZ+TWH/RPyBpNSD1WsYPc5hQwI33prg4Mv/X/v47jZsd4Mpzds0Jm' +
	'1QoxfpfBalXRJx0QqwBXTAmocmrGQt97UkoXsryOZLMZWKfT97eMKU424KFD8zjIQbukkUauhkg7IOUYmYyI6kCJmkBilEO/GVZ0HCT1pV3Duq' +
	'GYeO9bGP+uYL5I6+ek4WOMP/1KkTehFvoQBZQecMDXXKNVtmtm7tjio4sjmWn5oZ4ONN9Q9XXLYaPBwTJOwYHbMZKqeUp+tVb8K9t9GZH0mFyq' +
	'pyPNL1ZjzWLE6FD/fp5o7HEyWP7KuFt2d0QRsfXxIGgew1renElSsho/OdoHCipe1VYljosunlTvoshOWcYfaCzOrnuhE27oIQz8HaYJz/mRXi' +
	'5JP9fpkTHvNhOnZ8oAEe4hQzNnTodPQOkNG+kd8kG/0vPn/uxK6Qm80fqD+mEPVB6G0+JwzxnytTewgWbDJlMaIQ6LyXTKdBTr//w4wOncBNwa' +
	'rN9TsOYYGzZuESKwCg6ecIotWdMZb7p27pBB809eW/ioBVVACnV0he3ZobLD+/arU3SMj/8DNbJeZrpak8233dLPC9TLc/3ahCdlYvcgH40Ssy' +
	'p7SVnuKWpwNU3cUrT/JveC2Q1Fz29gAnth90Jj7M5OU9z/cxfmduca45oiie1Pd+EnlqSS/HlmlrwtqWKlC2j/2Zmgz42VYLMVsf++FJ8r0f/6' +
	'n/wGJBeRf6nB6UVOAiKZmJXrRgnJJRByw3bbq798WtjX/ySv4nJFjM/w6PXuVrS8cvNP0IId3uG3rsuUq3hTk0QOoZFid3KmfyCF3eDFrL9fH1' +
	'7iRmKR/DxSOS7koCIHStJeFKq8ZfU1r6v/uzzhckFl73GhHoat0skI7k2taL/yex7wcFsWva/POPBnpjDF32/g4pA0g39AVgpcbM9zQcOGjBix' +
	'CUrJcwmMFFPJ1bFx1LrK4OjAaqfEbfOwXcbPNVatCl0DvslZJ6mV9UHn+X2Nzz/VwQiWd5s6Mc3E3bsYue/gg0cCSevjnIY1NaEcLq6CzeJ0iY' +
	'KfjiibEPPpHQ4RdZvlom87ehpefW4YfxxREUqti4ok15SFRBKybEIjrNhe4ZS6inBYsph6rfTzz7+/tJh6Dx3Y8b8Ebaui1KjhNm6CqmKhbvui' +
	'sKj6/M/srs6f2TXni4Qdi/m6ivGqbdzo4VRR++pfgrF7sWWegZwgKkVQ7hcZWeFLyaEGBbArvGKmg7juPukkEoHJcyVTeK5ezDYD6Xx3yMe1Pc' +
	'5p2FAXKWDjynkZnE5R8LNRJb98ertjVK20XPRdW2/jm+2GMRTvJm38iKG3ZX1w82uB8Kl3tm1IxD42IYxSUx4eFVEeSquNisRXTRwCS4wjpKwi' +
	'WojwF+ogL9IjpL/eQYljF73wS+XD2ksQio9dYdvbK9T0e4RwI2mDv4QIi2ik7KkndZcrvoQreJAPvHNnE2RPbd4BAb7B204YLKnFSW+Lya27xu' +
	'iWeOf3ZdWoBXVAZvUiidFtoWEi3C5bZ4/cn8/xMOB07vGjkUdARJ8FEKvVajieTimgNCEZM5sMqnWlesmoJRyC1ANS6IGcEhB4W+CX8PHpx+y2' +
	'rQ9bQLwY4xoQMzHl6hzv6jAxMb4xxY9PwaUvy2OBLzKM00ZSGcNpLMbICCMtbZiROsJKSx0eTmUu2gZbW9Ns7UgPtrFtgk2ine00WoOhs0F2aw' +
	'K1Oz48gdbVlpDJbkkgdyWEJ1C6W+KzjpBdGIRwL6c0apAbyzOc4MoInPwhuy2e0p3waLnWhKzyrfGZUe593Rj+Dq3EdlL6ToensfKvb2KMl3di' +
	'tK+fKAQCHxXQw2AKQE7idxZjlvEFIIYE5YWUPuQP7uwvhjz8yHlvQv9jcYUeC3hXHamjMCVqOpvKCygBqKee7m7UjqNrhntNaZOeUuK2pvzke9' +
	'Pdp/Iq9pUZ/8a+hGoC4QNBAUD43yjtvTmh5v1bX0YBAACenjV2FUOH2/zWEHei//irc/lrc+nLekXrJEj8ZxkJplealMRCTSmnJBvIF9h5w0A8' +
	'Frxgxf+FPxKru39SeI7pLImBAZbawxKaR2hFoj16ZOd3AWZSxeQzwk7pW0lYXuaacwyRqTgOCg32t8RxSQQirIQ1BoBLVDO/1FJ1oARJqe1GuR' +
	'YdJWDCgEtivOA/kWALAqKtts+SWL+CI5u2OMeit8Am2jnFHItoJE4KdpOOEf+qTG3gZyx+vMTNPcCOITG5F9j7+vqvZRHDxKu3m5PmoNcogHGz' +
	'pD0AQAEAespUHXQv7KWwthNHT7smivpMt4JnXWwuAZlnwr4i3KwITHlV4PxJkikRypoxJZcZ+VRMbNVQbLldoAjFQFcRmqqZIhlOlu3I/SJZbt' +
	'7Pk2NQjLugUIApvnmRC6iX4CIP0CnJRZ6gUAqLiDBFfOckSkUiQJ58IoW42DiKGXLiwJEbY2wnZvlpchUjFjJG3iGPPMMzgAZJiSKnBw+LLLdk' +
	'AEfMN4YX+7mSjXsXMv50djKOmOMQICgWVS+X8XgrIRjDmBOgf9ovkCnaGmwlDVlR0IUdByWR4EIOw8ROKCPbkgrxVCByLebyGGJJPchztxm4me' +
	'4yMB3Xm5mQwFxmed2IkE9wC2ZgERgCjOK40pHLMJummAx5tDs6sOSSMV3e/3NmAQ==';
const F_MO5 =
	'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';

const FACE = `
@font-face{font-family:'CuUI';src:url(data:font/woff2;base64,${F_UI6}) format('woff2');font-weight:600;font-style:normal;font-display:block}
@font-face{font-family:'CuUI';src:url(data:font/woff2;base64,${F_UI7}) format('woff2');font-weight:700;font-style:normal;font-display:block}
@font-face{font-family:'CuMono';src:url(data:font/woff2;base64,${F_MO5}) format('woff2');font-weight:500;font-style:normal;font-display:block}`;

if (typeof document !== 'undefined' && !document.getElementById('m68-faces')) {
	const st = document.createElement('style');
	st.id = 'm68-faces';
	st.textContent = FACE;
	document.head.appendChild(st);
}

const useFaces = () => {
	const [handle] = useState(() => delayRender('m68 fonts'));
	const done = useRef(false);
	useEffect(() => {
		const fin = () => {
			if (!done.current) {
				done.current = true;
				continueRender(handle);
			}
		};
		const d: any = typeof document === 'undefined' ? null : document;
		const ok =
			d && d.fonts && d.fonts.check
				? d.fonts.check("600 20px 'CuUI'") && d.fonts.check("700 20px 'CuUI'") && d.fonts.check("500 20px 'CuMono'")
				: false;
		if (ok) {
			fin();
			return;
		}
		if (d && d.fonts && d.fonts.load) {
			Promise.all([d.fonts.load("600 20px 'CuUI'"), d.fonts.load("700 20px 'CuUI'"), d.fonts.load("500 20px 'CuMono'")])
				.then(fin)
				.catch(fin);
		} else fin();
		const id = setTimeout(fin, 900);
		return () => {
			clearTimeout(id);
			fin();
		};
	}, [handle]);
};

/* ------------------------------------------------------------------ maths */
const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const seg = (f: number, a: number, b: number) => clamp((f - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const inOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const outCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const outQuint = (t: number) => 1 - Math.pow(1 - t, 5);
const inCubic = (t: number) => t * t * t;
const outBack = (t: number) => {
	const c = 1.85;
	return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};
const ez = (f: number, a: number, b: number, c: (t: number) => number = inOutCubic) => c(seg(f, a, b));
const hash = (n: number) => {
	const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
	return s - Math.floor(s);
};

/* rounded rectangle, top-left anchored */
const rr = (x: number, y: number, w: number, h: number, r: number) => {
	const q = Math.min(r, w / 2, h / 2);
	return (
		`M${x + q} ${y}H${x + w - q}A${q} ${q} 0 0 1 ${x + w} ${y + q}` +
		`V${y + h - q}A${q} ${q} 0 0 1 ${x + w - q} ${y + h}` +
		`H${x + q}A${q} ${q} 0 0 1 ${x} ${y + h - q}` +
		`V${y + q}A${q} ${q} 0 0 1 ${x + q} ${y}Z`
	);
};

/* ------------------------------------------------------------------ stage */
const W = 1920;
const H = 1080;

/* grid — pitch from the reference lattice, re-centred for 16:9 */
const COLX = [330, 640, 950];
const ROWY = [430, 730];
const CELL = (i: number): [number, number] => [COLX[i % 3], ROWY[Math.floor(i / 3)]];

/* folder geometry */
const FLAP =
	'M-118 -18H118Q125 -18 125.6 -11.2L114 59Q112.4 71.6 99.8 71.6H-99.8Q-112.4 71.6 -114 59L-125.6 -11.2Q-125 -18 -118 -18Z';
const BACKP =
	'M-115 -44V-64A13 13 0 0 1 -102 -77H-44A13 13 0 0 1 -33.6 -71.8L-21 -55A13 13 0 0 0 -10.6 -49.8H101A13 13 0 0 1 114 -36.8V58A13 13 0 0 1 101 71H-102A13 13 0 0 1 -115 58Z';

/* bin */
const BX = 1490;
const RIMY = 545;
const RX = 136;
const RE = 36;
const BOTY = 862;
const RXB = 105; /* 0.77 taper, as measured */
const REB = 27;
const BIN_SIL =
	`M${BX - RX} ${RIMY}A${RX} ${RE} 0 0 0 ${BX + RX} ${RIMY}` +
	`Q${BX + RX + 5} ${(RIMY + BOTY) / 2} ${BX + RXB} ${BOTY}` +
	`A${RXB} ${REB} 0 0 1 ${BX - RXB} ${BOTY}` +
	`Q${BX - RX - 5} ${(RIMY + BOTY) / 2} ${BX - RX} ${RIMY}Z`;

/* ------------------------------------------------------------------ beats */
const F_GRID = 12;
const F_CUR_IN = 64;
const F_CUR_SET = 92;
const F_MQ0 = 104;
const F_MQ1 = 174;
const F_MQ_OFF = 206;
const F_LIFT = 214;
const F_GATHER0 = 250;
const F_GATHER1 = 300;
const F_SETTLE = 320;
const F_CARRY0 = 352;
const F_CARRY1 = 432;
const F_LID0 = 396;
const F_LID1 = 442;
const F_DROP1 = 480;
const F_FLUSH = 476;
const F_BURST = 540;
const F_COOL = 648;
const F_LIDC = 662;
const F_REFLOW = 690;
const F_DONE = 772;

/* marquee sweep */
const MQX0 = 196;
const MQY0 = 300;
const MQX1 = 1170;
const MQY1 = 612;
const mqP = (f: number) => smooth(seg(f, F_MQ0, F_MQ1));
const mqRight = (f: number) => lerp(MQX0, MQX1, mqP(f));

/* selection trigger frames, derived from the sweep rather than hardcoded */
const SEL_AT: number[] = (() => {
	const out = [F_MQ1, F_MQ1, F_MQ1];
	for (let i = 0; i < 3; i++) {
		for (let f = F_MQ0; f <= F_MQ1; f++) {
			if (mqRight(f) >= COLX[i] - 66) {
				out[i] = f;
				break;
			}
		}
	}
	return out;
})();

/* carry: velocity smoothsteps up over the first 55%, flat after */
const CARRY_R = 0.55;
const CARRY_V = 1 / (1 - CARRY_R / 2);
const carryP = (u: number) => {
	if (u <= 0) return 0;
	if (u >= 1) return 1;
	if (u < CARRY_R) {
		const w = u / CARRY_R;
		return CARRY_V * CARRY_R * (w * w * w - (w * w * w * w) / 2);
	}
	return CARRY_V * CARRY_R * 0.5 + CARRY_V * (u - CARRY_R);
};

/* bundle offsets — back, middle, front */
const BUNDLE: [number, number, number, number][] = [
	[-17, -13, -7, 0.94],
	[0, 0, 0, 1],
	[15, 11, 6, 0.97],
];

/* content */
const NAMES = ['PROJECT ARCHIVE', 'OLD BACKUPS', 'TEMP CACHE', 'CLIENT ASSETS', 'DESIGN FILES', 'INVOICES 2025'];
const SIZES = ['4.2 GB', '3.1 GB', '5.1 GB', '2.4 GB', '1.8 GB', '0.9 GB'];
const FILLS = [0.82, 0.61, 0.94, 0.47, 0.35, 0.19];

/* palette */
const INK = '#16233A';
const INK2 = '#5D6C86';
const INK3 = '#96A3B8';
const LINE = '#DCE3EE';
const ACC = '#1D6BFF';
const DANGER = '#FF4D4F';
const OKC = '#12B26A';

/* ------------------------------------------------------------------ pieces */

/* --- one folder, drawn around its own origin --- */
const Folder: React.FC<{sel: number; tint: number; k: number; shadow?: boolean}> = ({sel, tint, k, shadow = true}) => (
	<g>
		{/* contact shadow */}
		{shadow ? <ellipse cx={0} cy={96 + k * 12} rx={104 + k * 16} ry={15 + k * 5} fill="url(#gShadow)" opacity={0.6 - k * 0.2} /> : null}
		{/* back panel with tab */}
		<path d={BACKP} fill="url(#gBack)" />
		{/* paper sheets */}
		<path d={rr(-88, -40, 176, 96, 7)} fill="#FFFFFF" />
		<path d={rr(-88, -40, 176, 96, 7)} fill="url(#gPaper)" />
		<path d={rr(-79, -30, 158, 86, 6)} fill="#F3F7FC" />
		<path d="M-68 -16H34" stroke="#D7E2F2" strokeWidth={4.5} strokeLinecap="round" />
		<path d="M-68 -1H12" stroke="#E3EBF7" strokeWidth={4.5} strokeLinecap="round" />
		{/* front flap: base, sheen, bottom shade — all on the same path */}
		<path d={FLAP} fill="url(#gFront)" />
		<path d={FLAP} fill="url(#gSheen)" />
		<path d={FLAP} fill="url(#gFlapShade)" />
		<path d="M-115 -15.6H115" stroke="#B8D5FF" strokeWidth={3} strokeLinecap="round" opacity={0.9} />
		{/* danger tint */}
		{tint > 0.004 ? (
			<g opacity={tint}>
				<path d={BACKP} fill="#D0433F" />
				<path d={FLAP} fill="url(#gFrontW)" />
				<path d={FLAP} fill="url(#gSheen)" />
			</g>
		) : null}
		{/* selection ring */}
		{sel > 0.003 ? (
			<g opacity={sel}>
				<path d={rr(-142, -92, 284, 179, 20)} fill={ACC} opacity={0.07} />
				<path d={rr(-142, -92, 284, 179, 20)} fill="none" stroke={ACC} strokeWidth={3} />
				{[
					[-142, -92],
					[142, -92],
					[-142, 87],
					[142, 87],
				].map(([hx, hy], i) => (
					<rect key={i} x={hx - 5.5} y={hy - 5.5} width={11} height={11} rx={2.5} fill="#FFFFFF" stroke={ACC} strokeWidth={2.6} />
				))}
			</g>
		) : null}
	</g>
);

/* --- caption block under a folder --- */
const Caption: React.FC<{i: number; sel: number; op: number}> = ({i, sel, op}) =>
	op <= 0.004 ? null : (
		<g opacity={op}>
			<text
				x={0}
				y={127}
				textAnchor="middle"
				fontFamily="CuUI"
				fontWeight={700}
				fontSize={19}
				letterSpacing={1.9}
				fill={sel > 0.5 ? ACC : INK}
			>
				{NAMES[i]}
			</text>
			<text x={0} y={153} textAnchor="middle" fontFamily="CuMono" fontWeight={500} fontSize={16} letterSpacing={1.2} fill={INK3}>
				{SIZES[i]}
			</text>
			<path d={rr(-62, 167, 124, 6, 3)} fill="#DFE6F1" />
			<path d={rr(-62, 167, 124 * FILLS[i], 6, 3)} fill={sel > 0.5 ? ACC : '#9EBDEE'} />
		</g>
	);

/* --- empty slot placeholder --- */
const Slot: React.FC<{op: number}> = ({op}) => (
	<g opacity={op}>
		<path
			d={rr(-124, -80, 248, 156, 18)}
			fill="none"
			stroke="#C6D2E3"
			strokeWidth={2.4}
			strokeDasharray="12 11"
			strokeLinecap="round"
		/>
		<path d="M-16 -2H16M0 -18V14" stroke="#CBD6E6" strokeWidth={3} strokeLinecap="round" />
	</g>
);

/* --- cursor --- */
const Cursor: React.FC<{x: number; y: number; op: number; press: number}> = ({x, y, op, press}) => {
	if (op <= 0.004) return null;
	const d = 'M0 0L0 24.6L5.9 19.3L9.6 27.9L14 26L10.4 17.6L18 17.3Z';
	return (
		<g transform={`translate(${x} ${y}) scale(${2.05 - press * 0.13})`} opacity={op}>
			<path d={d} fill="#0A1526" opacity={0.18} transform="translate(1.8 2.6)" />
			<path d={d} fill="#FFFFFF" stroke="#24344E" strokeWidth={1.7} strokeLinejoin="round" />
		</g>
	);
};

/* ------------------------------------------------------------------ main */
export const Motion: React.FC = () => {
	useFaces();
	const f = useCurrentFrame();

	/* ---------------- global build ---------------- */
	const plate = ez(f, 0, 34, outCubic);
	const chrome = ez(f, 8, 46, outCubic);

	/* ---------------- selection ---------------- */
	const selOf = (i: number) =>
		i < 3 ? ez(f, SEL_AT[i], SEL_AT[i] + 13, outBack) * (1 - ez(f, F_GATHER0 + 12, F_GATHER0 + 42, outCubic)) : 0;

	/* ---------------- bundle transport ---------------- */
	const gatherU = ez(f, F_GATHER0, F_GATHER1, inOutCubic);
	const capFade = ez(f, F_GATHER0 + 2, F_GATHER0 + 32, outCubic);
	const settleU = ez(f, F_GATHER1, F_SETTLE, outQuint);
	const carryU = carryP(seg(f, F_CARRY0, F_CARRY1));
	const dropU = ez(f, F_CARRY1, F_DROP1, inCubic);

	const HOMEX = COLX[1];
	const HOMEY = ROWY[0];
	const liftY = -14 * ez(f, F_LIFT, F_GATHER0, outCubic);
	const bx = lerp(HOMEX, BX, carryU);
	const by = lerp(HOMEY, RIMY, carryU) - 95 * Math.sin(Math.PI * carryU) + liftY * (1 - carryU) + dropU * 138;
	const bScale = (1 - 0.56 * dropU) * (1 + 0.12 * settleU * (1 - settleU));
	const bOp = 1 - ez(f, F_DROP1 - 20, F_DROP1 + 8, outCubic);
	const inBin = f >= F_CARRY1 + 2;

	/* per-folder placement */
	const folderPose = (i: number) => {
		const [cx, cy] = CELL(i);
		if (i < 3) {
			const [ox, oy, orot, osc] = BUNDLE[i];
			return {
				x: lerp(cx, bx + ox, gatherU),
				y: lerp(cy + liftY, by + oy, gatherU),
				rot: orot * gatherU,
				sc: lerp(1, osc, gatherU) * lerp(1, bScale, gatherU),
				op: gatherU > 0.5 ? bOp : 1,
			};
		}
		const st = (i - 3) * 9;
		const r = ez(f, F_REFLOW + st, F_REFLOW + 62 + st, inOutCubic);
		return {x: cx, y: lerp(cy, ROWY[0], r), rot: 0, sc: 1, op: 1};
	};

	/* ---------------- cursor ---------------- */
	const cur = (() => {
		if (f < F_CUR_IN - 2) return {x: 128, y: 1010, op: 0, press: 0};
		if (f < F_CUR_SET) {
			const u = ez(f, F_CUR_IN, F_CUR_SET, outCubic);
			return {x: lerp(128, MQX0, u), y: lerp(1010, MQY0, u), op: ez(f, F_CUR_IN - 2, F_CUR_IN + 8, outCubic), press: 0};
		}
		if (f < F_MQ_OFF) {
			const p = mqP(f);
			return {
				x: lerp(MQX0, MQX1, p),
				y: lerp(MQY0, MQY1, p),
				op: 1,
				press: ez(f, F_MQ0 - 6, F_MQ0, outCubic) * (1 - ez(f, F_MQ_OFF - 8, F_MQ_OFF, outCubic)),
			};
		}
		if (f < F_LIFT) {
			const u = ez(f, F_MQ_OFF, F_LIFT, inOutCubic);
			return {x: lerp(MQX1, HOMEX + 96, u), y: lerp(MQY1, HOMEY - 12, u), op: 1, press: 0};
		}
		if (f < 596) {
			const park = ez(f, F_CARRY1, F_CARRY1 + 30, outCubic);
			return {
				x: lerp(bx + 96, BX + 40, park),
				y: lerp(by - 12, RIMY - 10, park),
				op: 1,
				press: ez(f, F_LIFT, F_LIFT + 10, outCubic) * (1 - ez(f, F_CARRY1, F_CARRY1 + 12, outCubic)),
			};
		}
		const u = ez(f, 596, 664, inCubic);
		return {x: lerp(BX + 40, 1880, u), y: lerp(RIMY - 10, 1160, u), op: 1 - seg(f, 638, 664), press: 0};
	})();

	/* ---------------- bin state ---------------- */
	const flush = ez(f, F_FLUSH, F_FLUSH + 26, outCubic);
	const burst = ez(f, F_BURST, F_BURST + 12, outCubic);
	const cool = ez(f, F_COOL, 674, inOutCubic);
	const heat = clamp(Math.max(flush * 0.4, burst) * (1 - cool));
	const arm = ez(f, F_CARRY0 - 16, F_CARRY0 + 26, outCubic) * (1 - flush);
	const lid = ez(f, F_LID0, F_LID1, outCubic) * (1 - ez(f, F_LIDC, F_LIDC + 46, inOutCubic));
	const impact = ez(f, F_CARRY1 + 2, F_CARRY1 + 12, outCubic) * (1 - ez(f, F_CARRY1 + 12, F_CARRY1 + 48, outQuint));
	const binSq = 1 - impact * 0.045;
	const shock = ez(f, F_BURST, F_BURST + 34, outQuint);
	const shock2 = ez(f, F_FLUSH, F_FLUSH + 30, outQuint);

	/* rising shred particles */
	const parts = (() => {
		const out: React.ReactNode[] = [];
		if (f < F_BURST - 6 || f > 706) return out;
		for (let i = 0; i < 64; i++) {
			const t0 = F_BURST - 4 + hash(i * 3.7) * 78;
			const life = 64 + hash(i * 5.1) * 48;
			const u = seg(f, t0, t0 + life);
			if (u <= 0 || u >= 1) continue;
			const ang = hash(i * 1.9) * Math.PI * 2;
			const rad = 20 + hash(i * 2.3) * (RX - 36);
			const px = BX + Math.cos(ang) * rad;
			const drift = (hash(i * 4.4) - 0.5) * 84;
			const rise = 92 + hash(i * 6.2) * 186;
			const w = 7 + hash(i * 7.7) * 11;
			const hh = 5 + hash(i * 8.9) * 9;
			const rot = (hash(i * 9.6) - 0.5) * 880 * u;
			const op = Math.sin(Math.PI * Math.pow(u, 0.6)) * 0.92;
			out.push(
				<g key={i} transform={`translate(${px + drift * u} ${RIMY - 8 - rise * outCubic(u)}) rotate(${rot})`} opacity={op}>
					<rect x={-w / 2} y={-hh / 2} width={w} height={hh} rx={1.6} fill={hash(i * 11.3) > 0.55 ? '#FF7A6B' : '#FFB7A6'} />
				</g>
			);
		}
		return out;
	})();

	/* ---------------- panel read-outs ---------------- */
	const nSel = [0, 1, 2].filter((i) => f >= SEL_AT[i]).length;
	const chip =
		f >= F_DONE
			? 'COMPLETE'
			: f >= F_FLUSH && f < F_COOL + 26
				? 'DELETING'
				: f >= F_CARRY1 + 26
					? 'CLEANING'
					: nSel > 0
						? `${nSel} SELECTED`
						: 'READY';
	const chipCol = f >= F_DONE ? OKC : f >= F_FLUSH && f < F_COOL + 26 ? DANGER : nSel > 0 ? ACC : INK3;
	const storeP = lerp(0.78, 0.59, ez(f, F_DONE - 10, F_DONE + 58, inOutCubic));
	const doneOp = ez(f, F_DONE, F_DONE + 30, outCubic);
	const doneY = lerp(32, 0, ez(f, F_DONE, F_DONE + 36, outQuint));

	const status =
		f >= F_DONE
			? 'WORKSPACE OPTIMIZED'
			: f >= F_COOL
				? 'SECURE ERASE COMPLETE'
				: f >= F_FLUSH
					? 'SHREDDING · DO NOT INTERRUPT'
					: f >= F_LIFT
						? 'MOVING 3 ITEMS TO TRASH'
						: f >= F_MQ0
							? 'DRAG SELECT ACTIVE'
							: 'READY TO SELECT';

	const binLabel = heat > 0.28 ? 'SHREDDING' : f >= F_COOL ? 'TRASH · EMPTIED' : 'TRASH · READY';

	return (
		<AbsoluteFill style={{backgroundColor: '#EDF1F8'}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{display: 'block'}}>
				<defs>
					<linearGradient id="gPlate" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#FAFCFF" />
						<stop offset="0.55" stopColor="#EFF3FA" />
						<stop offset="1" stopColor="#E1E7F3" />
					</linearGradient>
					<radialGradient id="gLift" cx="0.5" cy="0.5" r="0.5">
						<stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
						<stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0.4" />
						<stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
					</radialGradient>
					<radialGradient id="gPool" cx="0.5" cy="0.5" r="0.5">
						<stop offset="0" stopColor="#B7CDF0" stopOpacity="0.52" />
						<stop offset="1" stopColor="#B7CDF0" stopOpacity="0" />
					</radialGradient>
					<radialGradient id="gShadow" cx="0.5" cy="0.5" r="0.5">
						<stop offset="0" stopColor="#22375C" stopOpacity="0.32" />
						<stop offset="0.55" stopColor="#22375C" stopOpacity="0.12" />
						<stop offset="1" stopColor="#22375C" stopOpacity="0" />
					</radialGradient>
					<radialGradient id="gHeat" cx="0.5" cy="0.5" r="0.5">
						<stop offset="0" stopColor="#FF6B5A" stopOpacity="0.8" />
						<stop offset="0.5" stopColor="#FF6B5A" stopOpacity="0.26" />
						<stop offset="1" stopColor="#FF6B5A" stopOpacity="0" />
					</radialGradient>

					<linearGradient id="gBack" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#5291F4" />
						<stop offset="1" stopColor="#2A5EC2" />
					</linearGradient>
					<linearGradient id="gFront" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#86B7FF" />
						<stop offset="0.5" stopColor="#4F8DF4" />
						<stop offset="1" stopColor="#2C68D8" />
					</linearGradient>
					<linearGradient id="gFrontW" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#FFA396" />
						<stop offset="0.5" stopColor="#F4675E" />
						<stop offset="1" stopColor="#D8433D" />
					</linearGradient>
					<linearGradient id="gSheen" x1="0.06" y1="0" x2="0.72" y2="1">
						<stop offset="0" stopColor="#FFFFFF" stopOpacity="0.34" />
						<stop offset="0.22" stopColor="#FFFFFF" stopOpacity="0.04" />
						<stop offset="0.36" stopColor="#FFFFFF" stopOpacity="0.19" />
						<stop offset="0.58" stopColor="#FFFFFF" stopOpacity="0" />
					</linearGradient>
					<linearGradient id="gFlapShade" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0.62" stopColor="#0B2A5E" stopOpacity="0" />
						<stop offset="1" stopColor="#0B2A5E" stopOpacity="0.2" />
					</linearGradient>
					<linearGradient id="gPaper" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
						<stop offset="1" stopColor="#C9D7EA" stopOpacity="0.9" />
					</linearGradient>

					<linearGradient id="gBinBody" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0" stopColor="#B4C4D9" />
						<stop offset="0.07" stopColor="#E6ECF6" />
						<stop offset="0.22" stopColor="#FDFEFF" />
						<stop offset="0.5" stopColor="#EAF0F8" />
						<stop offset="0.78" stopColor="#D0DAEA" />
						<stop offset="0.93" stopColor="#E9EFF8" />
						<stop offset="1" stopColor="#A9BAD2" />
					</linearGradient>
					<linearGradient id="gBinShade" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#22375C" stopOpacity="0" />
						<stop offset="0.62" stopColor="#22375C" stopOpacity="0.05" />
						<stop offset="1" stopColor="#22375C" stopOpacity="0.17" />
					</linearGradient>
					<radialGradient id="gCav" cx="0.5" cy="0.32" r="0.74">
						<stop offset="0" stopColor="#93A6C0" />
						<stop offset="0.55" stopColor="#6E819D" />
						<stop offset="1" stopColor="#485974" />
					</radialGradient>
					<linearGradient id="gLid" x1="0" y1="0" x2="0.28" y2="1">
						<stop offset="0" stopColor="#FDFEFF" />
						<stop offset="0.45" stopColor="#E9EFF7" />
						<stop offset="1" stopColor="#C1CFE1" />
					</linearGradient>
					<linearGradient id="gRim" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0" stopColor="#8FA3BE" />
						<stop offset="0.3" stopColor="#D2DCEA" />
						<stop offset="0.72" stopColor="#A5B6CD" />
						<stop offset="1" stopColor="#8194B0" />
					</linearGradient>

					<clipPath id="cpBin">
						<path d={BIN_SIL} />
					</clipPath>
					<clipPath id="cpMouth">
						<path
							d={`M${BX - 520} ${RIMY - 640}H${BX + 520}V${RIMY}H${BX + RX}A${RX} ${RE} 0 0 1 ${BX - RX} ${RIMY}H${BX - 520}Z`}
						/>
					</clipPath>
				</defs>

				{/* ============================================================ plate */}
				<rect width={W} height={H} fill="url(#gPlate)" />
				<ellipse cx={820} cy={330} rx={1180} ry={720} fill="url(#gLift)" opacity={plate} />
				<ellipse cx={BX} cy={700} rx={520} ry={380} fill="url(#gPool)" opacity={0.5 * plate} />

				{/* ============================================================ title */}
				<g opacity={chrome} transform={`translate(0 ${lerp(-16, 0, chrome)})`}>
					<path d="M600 66H758" stroke={LINE} strokeWidth={2} />
					<path d="M1162 66H1320" stroke={LINE} strokeWidth={2} />
					<text x={960} y={73} textAnchor="middle" fontFamily="CuUI" fontWeight={700} fontSize={21} letterSpacing={5.6} fill={INK2}>
						SMART CLEANUP · STORAGE OPTIMIZER
					</text>
				</g>

				{/* ============================================================ panel */}
				<g opacity={chrome} transform={`translate(0 ${lerp(-22, 0, chrome)})`}>
					<ellipse cx={960} cy={200} rx={470} ry={26} fill="url(#gShadow)" opacity={0.5} />
					<path d={rr(480, 108, 960, 84, 20)} fill="#FFFFFF" />
					<path d={rr(480, 108, 960, 84, 20)} fill="none" stroke="#E4EAF4" strokeWidth={2} />

					<g transform="translate(514 132) scale(0.94)">
						<path
							d="M0 6A6 6 0 0 1 6 0H14A6 6 0 0 1 18.6 2.2L22.4 7A5 5 0 0 0 26.4 9H42A6 6 0 0 1 48 15V30A6 6 0 0 1 42 36H6A6 6 0 0 1 0 30Z"
							fill={ACC}
							opacity={0.15}
						/>
						<path
							d="M0 6A6 6 0 0 1 6 0H14A6 6 0 0 1 18.6 2.2L22.4 7A5 5 0 0 0 26.4 9H42A6 6 0 0 1 48 15V30A6 6 0 0 1 42 36H6A6 6 0 0 1 0 30Z"
							fill="none"
							stroke={ACC}
							strokeWidth={2.6}
						/>
					</g>
					<text x={584} y={144} fontFamily="CuUI" fontWeight={700} fontSize={20} letterSpacing={2.6} fill={INK}>
						FILE WORKSPACE
					</text>
					<text x={584} y={172} fontFamily="CuMono" fontWeight={500} fontSize={14} letterSpacing={1.6} fill={INK3}>
						{f >= F_CARRY1 + 26 ? '3 ITEMS · 5.1 GB' : '6 ITEMS · 17.5 GB'}
					</text>

					<g transform="translate(806 0)">
						<path d={rr(0, 134, chip.length * 12.2 + 40, 32, 16)} fill={chipCol} opacity={0.13} />
						<circle cx={20} cy={150} r={5} fill={chipCol} />
						<text x={36} y={156} fontFamily="CuUI" fontWeight={700} fontSize={15} letterSpacing={2.2} fill={chipCol}>
							{chip}
						</text>
					</g>

					<g transform="translate(1032 150)">
						{[0, 1, 2, 3, 4, 5].map((i) => {
							const gone = i < 3 && f >= F_CARRY1 + 24;
							const s = i < 3 ? (f >= SEL_AT[i] ? 1 : 0) : 0;
							const cxx = i * 34;
							return (
								<g key={i}>
									<circle
										cx={cxx}
										cy={0}
										r={9}
										fill="none"
										stroke={gone ? '#DCE3EE' : s ? ACC : '#C3CFE0'}
										strokeWidth={2.2}
										strokeDasharray={gone ? '3 3' : undefined}
									/>
									{gone ? null : <circle cx={cxx} cy={0} r={4.6} fill={s ? ACC : '#C3CFE0'} opacity={s ? 1 : 0.55} />}
								</g>
							);
						})}
					</g>

					<g transform="translate(1250 0)">
						<text x={0} y={141} fontFamily="CuUI" fontWeight={700} fontSize={15} letterSpacing={2.2} fill={INK2}>
							STORAGE
						</text>
						<text
							x={168}
							y={141}
							textAnchor="end"
							fontFamily="CuMono"
							fontWeight={500}
							fontSize={15}
							letterSpacing={1}
							fill={storeP < 0.7 ? OKC : INK}
						>
							{Math.round(storeP * 100) + '%'}
						</text>
						<path d={rr(0, 152, 168, 8, 4)} fill="#E6EBF4" />
						<path d={rr(0, 152, 168 * storeP, 8, 4)} fill={storeP < 0.7 ? OKC : ACC} />
					</g>
				</g>

				{/* ============================================================ slots */}
				<g>
					{[0, 1, 2].map((i) => {
						const born = i === 1 ? F_CARRY0 + 42 : F_GATHER1 - 4;
						const op = ez(f, born, born + 26, outCubic) * (1 - ez(f, F_REFLOW - 6, F_REFLOW + 30, outCubic));
						if (op <= 0.004) return null;
						return (
							<g key={i} transform={`translate(${COLX[i]} ${ROWY[0]})`}>
								<Slot op={op * 0.78} />
							</g>
						);
					})}
					{[0, 1, 2].map((i) => {
						const op = ez(f, F_REFLOW + 34, F_REFLOW + 70, outCubic) * (1 - ez(f, F_DONE + 46, F_DONE + 84, outCubic));
						if (op <= 0.004) return null;
						return (
							<g key={'b' + i} transform={`translate(${COLX[i]} ${ROWY[1]})`}>
								<Slot op={op * 0.5} />
							</g>
						);
					})}
				</g>

				{/* ============================================================ bin — back */}
				<g transform={`translate(${BX} ${BOTY}) scale(1 ${binSq}) translate(${-BX} ${-BOTY})`}>
					{heat > 0.01 ? <ellipse cx={BX} cy={RIMY + 120} rx={340} ry={340} fill="url(#gHeat)" opacity={heat * 0.5} /> : null}
					<ellipse cx={BX} cy={BOTY + 18} rx={190} ry={30} fill="url(#gShadow)" opacity={0.95 * plate} />
					<ellipse cx={BX} cy={RIMY} rx={RX - 7} ry={RE - 3} fill="url(#gCav)" />
					{heat > 0.01 ? <ellipse cx={BX} cy={RIMY} rx={RX - 7} ry={RE - 3} fill={DANGER} opacity={heat * 0.75} /> : null}
					<ellipse cx={BX} cy={RIMY - 6} rx={RX - 17} ry={RE - 12} fill="#0F1D33" opacity={0.16} />
					{heat > 0.01 ? <ellipse cx={BX} cy={RIMY + 3} rx={RX - 24} ry={RE - 13} fill="#FFE0D6" opacity={heat * 0.6} /> : null}
				</g>

				{/* bundle, once it is below the rim */}
				{inBin && bOp > 0.004 ? (
					<g clipPath="url(#cpMouth)" opacity={bOp}>
					<g transform={`translate(${bx} ${by})`}>
						{[0, 1, 2].map((i) => {
							const [ox, oy, orot, osc] = BUNDLE[i];
							return (
								<g key={i} transform={`translate(${ox} ${oy}) rotate(${orot}) scale(${osc * bScale})`}>
									<Folder sel={0} tint={0} k={1} shadow={false} />
								</g>
							);
						})}
					</g>
					</g>
				) : null}

				{/* ============================================================ bin — front */}
				<g transform={`translate(${BX} ${BOTY}) scale(1 ${binSq}) translate(${-BX} ${-BOTY})`}>
					<g opacity={0.96}>
						<path d={BIN_SIL} fill="url(#gBinBody)" />
						<path d={BIN_SIL} fill="url(#gBinShade)" />
					</g>
					<g clipPath="url(#cpBin)">
						{[-0.62, -0.24, 0.24, 0.62].map((t, i) => (
							<path
								key={i}
								d={`M${BX + RX * t} ${RIMY + RE * 0.5}Q${BX + RX * t * 1.03} ${(RIMY + BOTY) / 2} ${BX + RXB * t} ${BOTY}`}
								stroke="#1E3357"
								strokeOpacity={0.06}
								strokeWidth={3}
								fill="none"
							/>
						))}
						<path
							d={
								`M${BX - RX * 0.66} ${RIMY}Q${BX - RX * 0.7} ${(RIMY + BOTY) / 2} ${BX - RXB * 0.64} ${BOTY}` +
								`L${BX - RXB * 0.3} ${BOTY}Q${BX - RX * 0.34} ${(RIMY + BOTY) / 2} ${BX - RX * 0.32} ${RIMY}Z`
							}
							fill="#FFFFFF"
							opacity={0.55}
						/>
						{heat > 0.01 ? (
							<rect x={BX - RX - 12} y={RIMY - 44} width={2 * RX + 24} height={BOTY - RIMY + 90} fill={DANGER} opacity={heat * 0.15} />
						) : null}
					</g>
					<path d={`M${BX - RXB} ${BOTY}A${RXB} ${REB} 0 0 0 ${BX + RXB} ${BOTY}`} fill="none" stroke="#A4B5CB" strokeWidth={2.6} />
					<ellipse cx={BX} cy={RIMY} rx={RX} ry={RE} fill="none" stroke="url(#gRim)" strokeWidth={7} />
					<ellipse cx={BX} cy={RIMY} rx={RX} ry={RE} fill="none" stroke="#FFFFFF" strokeWidth={2.2} opacity={0.75} />
					{arm > 0.01 ? <ellipse cx={BX} cy={RIMY} rx={RX + 6} ry={RE + 4} fill="none" stroke={ACC} strokeWidth={3} opacity={arm * 0.8} /> : null}
					{heat > 0.01 ? <ellipse cx={BX} cy={RIMY} rx={RX + 6} ry={RE + 4} fill="none" stroke={DANGER} strokeWidth={3.4} opacity={heat} /> : null}
					{shock2 > 0.001 && shock2 < 0.999 ? (
						<ellipse
							cx={BX}
							cy={RIMY}
							rx={RX + shock2 * 96}
							ry={RE + shock2 * 26}
							fill="none"
							stroke={DANGER}
							strokeWidth={3.2 * (1 - shock2)}
							opacity={(1 - shock2) * 0.55}
						/>
					) : null}
					{shock > 0.001 && shock < 0.999 ? (
						<ellipse
							cx={BX}
							cy={RIMY}
							rx={RX + shock * 150}
							ry={RE + shock * 40}
							fill="none"
							stroke={DANGER}
							strokeWidth={4.4 * (1 - shock)}
							opacity={(1 - shock) * 0.45}
						/>
					) : null}
				</g>

				<g>{parts}</g>

				{/* ============================================================ lid */}
				<g transform={`translate(${BX + RX + 6} ${RIMY - 10}) rotate(${lid * 48}) translate(${-(BX + RX + 6)} ${-(RIMY - 10)})`}>
					<g transform={`translate(0 ${-8 - lid * 5})`}>
						<path
							d={
								`M${BX - RX - 9} ${RIMY - 4}Q${BX - RX - 9} ${RIMY - 45} ${BX} ${RIMY - 45}` +
								`Q${BX + RX + 9} ${RIMY - 45} ${BX + RX + 9} ${RIMY - 4}` +
								`A${RX + 9} ${RE + 2} 0 0 1 ${BX - RX - 9} ${RIMY - 4}Z`
							}
							fill="url(#gLid)"
						/>
						{heat > 0.01 ? (
							<path
								d={
									`M${BX - RX - 9} ${RIMY - 4}Q${BX - RX - 9} ${RIMY - 45} ${BX} ${RIMY - 45}` +
									`Q${BX + RX + 9} ${RIMY - 45} ${BX + RX + 9} ${RIMY - 4}` +
									`A${RX + 9} ${RE + 2} 0 0 1 ${BX - RX - 9} ${RIMY - 4}Z`
								}
								fill={DANGER}
								opacity={heat * 0.15}
							/>
						) : null}
						<path
							d={`M${BX - RX - 9} ${RIMY - 4}Q${BX - RX - 9} ${RIMY - 45} ${BX} ${RIMY - 45}Q${BX + RX + 9} ${RIMY - 45} ${BX + RX + 9} ${RIMY - 4}`}
							fill="none"
							stroke="#FFFFFF"
							strokeWidth={2.6}
							opacity={0.8}
						/>
						<path
							d={`M${BX - RX - 9} ${RIMY - 4}A${RX + 9} ${RE + 2} 0 0 0 ${BX + RX + 9} ${RIMY - 4}`}
							fill="none"
							stroke="#A6B7CE"
							strokeWidth={2.4}
						/>
						<path d={rr(BX - 38, RIMY - 63, 76, 15, 7.5)} fill="#DCE4F0" />
						<path d={rr(BX - 38, RIMY - 63, 76, 8, 4)} fill="#F7FAFD" />
						<path d={rr(BX - 38, RIMY - 63, 76, 15, 7.5)} fill="none" stroke="#B2C0D5" strokeWidth={2} />
					</g>
				</g>

				<text
					x={BX}
					y={BOTY + 78}
					textAnchor="middle"
					fontFamily="CuUI"
					fontWeight={700}
					fontSize={19}
					letterSpacing={3.2}
					fill={heat > 0.28 ? DANGER : INK2}
					opacity={plate}
				>
					{binLabel}
				</text>

				{/* ============================================================ folders */}
				<g>
					{[3, 4, 5, 0, 1, 2].map((i) => {
						if (i < 3 && inBin) return null;
						const p = folderPose(i);
						const born = F_GRID + i * 7;
						const inU = ez(f, born, born + 30, outBack);
						if (inU <= 0.002 || p.op <= 0.004) return null;
						const bob = Math.sin((f + i * 41) * 0.026) * 2.1 * (i < 3 ? 1 - gatherU : 1);
						const s = selOf(i);
						return (
							<g
								key={i}
								transform={`translate(${p.x} ${p.y + bob + (1 - inU) * 46}) rotate(${p.rot}) scale(${p.sc * lerp(0.86, 1, inU)})`}
								opacity={p.op * clamp(inU * 1.4)}
							>
								<Folder sel={s} tint={0} k={i < 3 ? gatherU : 0} />
								<Caption i={i} sel={s} op={(i < 3 ? 1 - capFade : 1) * clamp(inU * 1.6)} />
							</g>
						);
					})}
				</g>

				{/* ============================================================ marquee */}
				{(() => {
					const on = ez(f, F_MQ0 - 4, F_MQ0 + 6, outCubic) * (1 - ez(f, F_MQ_OFF - 10, F_MQ_OFF + 6, outCubic));
					if (on <= 0.004) return null;
					const p = mqP(f);
					const x1 = lerp(MQX0, MQX1, p);
					const y1 = lerp(MQY0, MQY1, p);
					return (
						<g opacity={on}>
							<path d={rr(MQX0, MQY0, x1 - MQX0, y1 - MQY0, 6)} fill={ACC} opacity={0.09} />
							<path
								d={rr(MQX0, MQY0, x1 - MQX0, y1 - MQY0, 6)}
								fill="none"
								stroke={ACC}
								strokeWidth={2.6}
								strokeDasharray="14 8"
								strokeDashoffset={-f * 0.9}
							/>
							<circle cx={MQX0} cy={MQY0} r={5.5} fill="#FFFFFF" stroke={ACC} strokeWidth={2.6} />
						</g>
					);
				})()}

				{/* ============================================================ completion */}
				{doneOp > 0.004 ? (
					<g opacity={doneOp} transform={`translate(0 ${doneY})`}>
						<ellipse cx={640} cy={908} rx={300} ry={22} fill="url(#gShadow)" opacity={0.55} />
						<path d={rr(352, 838, 576, 76, 38)} fill="#FFFFFF" />
						<path d={rr(352, 838, 576, 76, 38)} fill="none" stroke="#E1E8F2" strokeWidth={2} />
						<circle cx={402} cy={876} r={19} fill={OKC} opacity={0.14} />
						<circle cx={402} cy={876} r={19} fill="none" stroke={OKC} strokeWidth={2.6} />
						<path
							d="M393 876.5L399.4 883L411.6 869.6"
							fill="none"
							stroke={OKC}
							strokeWidth={3.4}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeDasharray={26}
							strokeDashoffset={26 * (1 - ez(f, F_DONE + 8, F_DONE + 34, outCubic))}
						/>
						<text x={436} y={884} fontFamily="CuUI" fontWeight={700} fontSize={21} letterSpacing={2.8} fill={INK}>
							CLEANUP COMPLETE
						</text>
						<path d="M702 856V896" stroke={LINE} strokeWidth={2} />
						<text x={728} y={884} fontFamily="CuMono" fontWeight={500} fontSize={19} letterSpacing={1.4} fill={OKC}>
							12.4 GB FREED
						</text>
					</g>
				) : null}

				{/* ============================================================ footer */}
				<g opacity={chrome * 0.95}>
					<path d="M120 1002H1800" stroke={LINE} strokeWidth={2} />
					<text x={120} y={1040} fontFamily="CuUI" fontWeight={700} fontSize={15} letterSpacing={3.4} fill={INK3}>
						DRAG · SELECT · DELETE
					</text>
					<text
						x={1800}
						y={1040}
						textAnchor="end"
						fontFamily="CuUI"
						fontWeight={700}
						fontSize={15}
						letterSpacing={3.4}
						fill={f >= F_DONE ? OKC : f >= F_FLUSH && f < F_COOL + 26 ? DANGER : INK3}
					>
						{status}
					</text>
				</g>

				{/* ============================================================ cursor */}
				<Cursor x={cur.x} y={cur.y} op={cur.op * plate} press={cur.press} />
			</svg>
		</AbsoluteFill>
	);
};
