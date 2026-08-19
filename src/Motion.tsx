import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// ============================================================================
// MOTION 27 — "INCOMING CALL · GLASS UI"
// 1920×1080 · 60 fps · 1200 frames (20 s) · PERFECT LOOP (frame 1200 ≡ 0)
//
// Struktur ritme (semua periode membagi 20 s):
//   1 s   — pulse dering: wiggle handset + pump + 2 kereta ripple avatar
//   1 s   — pulse tombol Accept (fase +0,5 s, berselang-seling dgn avatar)
//   2 s   — titik "Incoming call…" (3 titik muncul berurutan, lalu pudar)
//   4 s   — napas halo avatar & napas tombol Decline
//   10/20 — sapuan specular cincin, drift blob ambient, partikel bokeh,
//           napas kamera global
// ============================================================================

// ---------------------------------------------------------------- fonts ----
const FONT_400 = 'd09GMgABAAAAACysABAAAAAAc7AAACxOAAQAQgAAAAAAAAAAAAAAAAAAAAAAAAAAGkwb0Swco1wGYD9TVEFUXgCBThEICt4YzSQBNgIkA4VoC4J2AAQgBYQaByAMBxuuaLOipMuO3SiCjQPx2GNBRDVpENn/JYEbQ7I+uVoiSP8OyVQhy22VuzKNLDw9Kk2jQTOXldZ8/x4YNt8eZ/KKXQgeoTG7xZJEmesRGvskl+f5X/vXfe/Mo/nILz8AaBOhiIWLIhI2jl2M6YquqpBVXVXiHXuen7Ofc9/LSwhpkKZBStPUglQsFVLZYJYa1iAbLAQIgYZgsmxLjXZTfpd6kO3SLqVOxWT5tqJZMRsettm/hdHbrFpYiVV0SCliB6EgggUGFnag24wz1+iq/9j6YnFR8Xn+Y/+/rX1+d0gQK4WSIdgNhlxt+nj++7Gy8z5MB11qdAB1hCGw8UDkojTQskRJKAwJuZr6amjbknp6b4aYzKws6fxXSliK4w9FoKk9iJ/b7wcAd1bBWZ21wLQBTUBOUoKztXwy4v3Ff/ymlkE9qinw+rFNJn4LbpPKzslmp8zqCVQJ7ad54T88/q1Sm5Aguef427Byt/+zaZX2n7oWLPcuh1qmeKxjiClJfle1XP1VLvHsqSUDvXtuaUGWBwwHaveCdMQoDaHsI+JsoqMgBQqiTcJL04uAgjA+/2vp9BF6GY/weCKpRbnkXjI/balFlyr05udKSqMszOBLUzgswniUvkOoAyHxZW+uL4HgUdwwVnohyzBe/1obVlERDEAaMvs5DxK8INI0IiIiEiSEI8dyJTKcVpzbdRo0gSSDRLbv3qgrYBpAJUUmIcHCkUUWI/ESkGWWI/XqkUZNyEYbkc06kbPOIgQ6i+XiD30lpyLwvLdbobm8XlQGzY0xhw0aPJCmoM9SqNd/2W2QU10JqqNKS2L3XSYI40GCI6MQhDCY+g2HzXx65exHGLK+pfsqRMKbU1goMfmlmrTjrBtstdP9j+9/vIN4CfcMvUhRkuXIVaSYXRWHNp0ES/MqEp+sqFipIea0si8vIPZYvIygnIjciG2xLo+Rl+9TxuEz+oD4QCZ86OviWVwTS0KW0jNMEYBISvYuzEhcVTSHKsah7C+/JX8aaek+dWkgYektndfEwKJGq85HL5f9Bg077+E0l3jTWZriwnQZnmWSxyuts9FmTjvsJNCBZ7lgUshLVIEX1BggIIga2QXq8wCqjKwzg9bSNETmGxL8AkW6GKSFArMjdTuxK1JHhVeXFluyZYGPaPhmcDambgv4AurCiYfh6psUKmrrcp5gN3b8kVQJNXvRZj9s5j1xk+De2QZk/LPfnWsd7/tdvMhZiHwN5G8lRgVFc5G4SDK6k16+pV5pzb+XjlhVZTxZPvnUd/KQUs7P0/Kz/1qstSN1sxPHxOC1PAq6cppqrvXk1dSSZUL8V+a5uhhW3bZw9Vb+lPfOwfh4ZjNkSlmS7XneJVurLi7rTOWel/sRwbhPF++Qva14M+JTeXHV4SDHb+EKpA7xX94iwkLhdBZZbAm9CJFixIoTL0GiJMlSLLNCmnQZMq1mlCVH7qDx05KvUBGLEmVsKlRao4pDtTr1GjVr0269DTbZZoedXHr06nPIkMOOIAvVUvLBCeJlNGCDFx/APE+y7zM8iAFcdgtHAJWGwkRVHgCgtPuwOtKR6rOu8wU71jLAJlsENMP3DCtwwhrAbDI8tCXnQB99BT+j+BhPwQvMCOIPYBp09OCF4KVjHCXCw0lXiRcmUgRVTcuH8TRizWetKuebEngnZo0TYKIpelJYAmxeB7ACrEriJbw9rmP2Jm479W80nOlus7JP/U0S8s3kzIg2uuizPInolZu16UpvzudD+XJ9jozH4QmkPMl48eZDYQwlP/4CBFILNtscc2nNFyVj0N+wRq2zuAHXG2SvPlMUS7vWeJkxioLKwhw6xokah7Ua9plAaS4eTAXA71HcVLRnGSLMlDxWRQBAVsxhN1IKCHuFrKrIzWIgCnm8BjrU4K91iimOVpE4cULQgyA8Dwom5bfIz0EBJswlbab5SjU91YI4B7FJxiDTgDLhHyuABJvinQf8FA2gha0Cg6Q4D4kJvMCHy9CYSkq3r3HLXNB85VHVGQmIcFtz8GBZrpoHP5tlKy3nFHPKBl127okoEAkPo8gpCrltlUk0QoSaaWkJqSwtJWZQFAnyjNVIWdx8KABbs6GuzDq/0iiFp0UA/qQceDF4BREIIAEP8AQZjAI5eIMvBMFEmATBEAKhEAZTYTrMPHi2+g08rP4QnYaF5oLWY8O6GxwP+cloq5fHjdOQwSSfSE5HmmLMgNZZOEmpetjeO/LEQnu8IqascDhTIBme8maBOrYpxml9tq6OjLRwDpwjaBNOF7KPnVn2VMkWZDU6W9FBl/BMmgJCOQwMN0KyOIktwoxF96HzF7Q80sY79D2S11QjyVJRxbKfbex/WW4TEA0+V67mj8sqIj6/gkwnuylTV8GCehMSD6JGEYpa7H4nFsqse9ycuopFV1dPNVX+EZfG8nH/jgCRAqiy9WUy8SMByCyjLvYZOJJ4TqPqXapVzAWRS5gvkwzlKIOJZUImiktbCBAD2DSr78QlT/GjbYZWBJBMgK41eNEIFN6Vv60t+KRek9TKfHdBP67D5CsHCqF+alOhcoev0hpavVKtWdEpXNisN0y9RJYLcBka/M5wU+Z9Lgu3hGD6mEcdyWv15YFpsoW8P49KkmKFmt8k8dN2AKuUXKBHa2R/DQt7Mw5kJZZNI7CwR4vDr1mQinj8aPqZRGWw2shN3oTnrVHLn/IV9rnJ5HZ3idqWPk69lPCWsVKuyLo8RyWBy1wmPldsZizvC2s5DjiISzWKRUVp2bjEuObfg2D86+8wBwXbjgBL/o/RFuJIGr5CHrrwjJSiQNdGawuXujwQXxmDsId2Lq72TCiVY89hclwou30pDb+Was02HpIw+VFNea0Z35H1VlAS6KxJRgMTlEnK4oFCPlPR0OikiT+H1YIMGcnq2f0rDkTtONqq4na4Nue/XQqjxxfliWPYk6Mmn8Ktqlfzi2dywC3kKVuKothHAv7ya9ZZTxZ1J+djcQz+osnVVys/ymnvgdMqBooSPYwx272TvKdYQ9JFmlOr0ta/7yofZBI4RGeSxZZYSC+STowUSyyzTKwVVoiTJku8HPmWKVQkjUWJDGXKrGazhlGVWrm22aaAS59ChxxhQcgRIr788cRCBQGGxggAtCbjKfgYRWKSCfzIjMMQAoXKWIwHYEQJqBhCxpKSE3A8qY3naTStOSaCM+YCLpllDuCsGWZ+nzFVCAC6/J16MC+B8OCYMI03BYAGQM2blg8LpJPFCjTtFou75SKwuYfW20mE5gEihFfSkBrS5t8iu2f14C+IrzWGWLGFJpCmZPRaAHGsmfpgPQkkpMYKIKU0XYgwcFwoOJLTHQEcNoUG9zwO7NkS54w2jZzi24N9wlQsUMszyk3LhynoAFsKk+6Rs+DuOQ1sFryde4qnROvFlPxuYtWX3DWXDn6mquG/wCAfw/B6re9PDk90/sfqgPrCckU5pl1azyvAnBsrBVYsv1Vdbkc6aI2nNslkUPBghoiYB0+jePEx2hh+Aow1DhRAwdEwcDrmaU+ZsE5u09zsBoVuGIb/GD/HJxD0YIEu93vvn/1Gb8fuvjce7ZP6NL0pPy4TQCFBpBhfGoSRCUF4UBUhMgTqloUInQpWvoZPOnSfz6F70bPHyZDHhKXPao1aG22yWacttnqB0zZdXtRtpx22+xfia5Kpbhqk7ixWI0RS5Vmm/iTT+uBZC+HPmz8GriFpCGFEwkWiAO7ApFigovm3HxljmkQWa/U67z++LDwFZlaik5nSNKUzezOYs7mZpzzR4xSG4KEru08LdEHhy3MNRgHhy1MJQ++w5amCgefyy1MBfa/llqcIPY/g8pSg3W3n9YNttNwQKOhM2Z2IVWiZ8DGCSdm0iklzJl+/qpH+7MDQOfcdrH4vi+dkXfk6bmQXpV6STdf34+sqFFPJZq9cS1S9KHJTsvmr8wnVgqKrlGzxhZYSlxFFeynZ8ov4k5QWRTWUZPXV8C1MSoYiDJRs/cXfJuWGmkzeJkJ7Xbs/bdt5t7rkTvUPZbbrsI0xsQ2DbBC50noNGjVp1qJVm+e0W6fD9aLrrfU8QFGPR2bNMFZ8R2BQ0l7AZEoudScb7Wyt67a9Xe6TXtPw5BbbpJ+U0lLxVsqmZmYTosZ+vEyZir2EM+h695hiYt4CTTbDQnrxjmtd/jKNWeOWGdUxBmGEve2jmHKMwFtveD1TD27KyvgPHClZOpNSdg3aHfYbfJnGrHFrGrnmEEoiauSkh8SESdmmEYya2D58MysBtORUZtDjQJXdPkVrHwIsK2304lkXt7ug6L3zcYl86/sQxiyLIr5BbhFzlefaDdXKmrmKzKGJ/wY43q1qIaGUzFwhic3yGGMt2zs7UVgJmFUyDOJZWBR7BWdY34djcQDT7yDmJSIyH/qSwo/Q+qiX6+Cz5UtjFp1oBpnyWdVo0WGrbi4DjjjtojMCgy+zPGvbmraszSdqi9qYTZ+WFyZlmzaw6SPxOxOzadsEtqXDmKNOYXWoJEeuPsnDDdjUicrkuYcDqvjFDjr5VsPEf3X5hp1ip/5fSCTMLKxsXHocMkQA13UacJW7SCgwMxKd7DRla/pzNk/zbWVMWdMqugrLUR21u4bqYj0ud/3aePecju7MtnVH9/Zw3293/9p6T9hETvbsXiby31mbuOZ17sBe3tf2x77qtJd85mu/x+e+XwdyseaJfXKfOhwoFJhSBgQOIiQfhxgRBaJ1skxTv3bge7saYeIYcBgFFRoHYVdzdyi5h5WvoMzNnSXPlqG9mQY/O5CX3ZuVw6JpR158NrNHhZmNvDnZjH0i8YxGXmBmM6hAxcqlkckAavbGfAFUb1obfwOortkYnwKoNpWMpwBq4isSl8YxANWvrQwXgJrbiU0Aak4sOADU7LVlA/Cf0bUQ71FTZKNyymWwgV/fhM2Jjszx+n7GgJveZZ29BO9kdQWzOa6GQkynq/ms+TMT+Ds0m2sCE5CaQWCDFb6+f5RABUrVnVyp3pomhKEFZbQNjsnxuokhH0uGqsee+EcW8Dj6qZ91bEzOhpzuJ3VGS+UmnNrSqXaUzXgSU6fUVTYQkTM9su/TNV7jnNzILdysqbHuJklwZEYKrj8seEgXOqxh3ZyvvdthubRl3npJsjpYyjdx4LN0YpuwtpXhhQcRw5JI7VTzh7uwl1QJXesEtdWRoCojalYfroiplF6sELusUGezYQML+qPYlSDFKvBQFrECuqgHqzWkqvfs7ZAzfDBisZKhvT2xfFzUg1kJqTJLznFhLy6DvHGxcr1S7ciGOqvwtQGvlBWxu4ZFVYm81Ly2cVSodLxSOkRPTyQuHXgnOsFkNqwUpOIicb0RgoLfEYISN0JwhbsIwSMZQhjYCkhCQDvtx8BBZQVtxcDtOhVUg4FNWR0oGwPz21UgPVisrJFU41FW7Z2jxGpldjPbS1Y3UssWKwFHNoHrbU+rOe/iLBqDG+mwXKJh59oD1gYzVDtlneQRJUHpcZXqgNV1IiFHieUyZVIispmkuFGUp1Odg31aRCwNDfgfp6IBgnl1Zq997Cw8MKLvWaVSCoNlllthpVWtcNECVuVsKrLVt/pXdtQxx51w0rBTTjuDkTAmhfZgxCRMyjyZF/N+V3zwwx0nEfT2ziPww5yl/qyz9RwkUQdU/DNorO/OzZMpq3CVerNGfPXlCwx/r1o5AO2pHQG7ZOgMpJZ/v9gnsNu/qxpoIby+bHEQga7+ybOSHiPwNRGBWuHkoEEYVk6oX4LGeuIIuHWfBbMiY/HOq83W/6xLzRROz8ikhFWDFmc2L9Saf5rYNYtOhCx5SpVr5P6gjSD7EJft7EA2//q+p0ACwSUgoG+oG3N+iZYr1UK7RMkRK45DiWdlMkmTr5CZRbEYyeJlSFDFbrdE6ZKUIZS9A/4A5QH4G6YfwvJRQPkKyncAKg5h6KE5AOvg3NKlGYnXuiynmxyXZiokiJHkDqrU5Whn1kcy4cKWRv47KBkM60gUodIB/dBm5TiUaBREKg3jngaeEuErFpTeb2rQ74jcG+jLKE1by1Mb8bS1bGbrzC5v0s3TvB2yTdogjnF2D2fc7VIuT1hmZDUa6MRunp29vd4us4oHzg0/cMHsecKWJV5G/ime7HWY3nN3xGeyeQtW47TD+atHLacRj+I8GpVTosRysTE6cvq3/eC9Xhr86f0hn1jYUzpQwwXKxRgCS9iTPmRtCfofjTQe9Ay7Do9auHGB6OHz+A27/j/32NM0uM6nnF8gO32eEZblQoXGxu9D13LP/6+Q7X9ST8KyG9ql8Kc8PSyVgDW8voWhs8uyusruKnuq7qqIJ1nKFZEhM5iPTW5kzODwuts7ZnjzACdc6uhKuG39WHlf44F/Qsg7mp4a05GNR/Xupo6Nt+kwR+mTOh/0zLgANXP9RiQFrM9V+nMh1DLW1Ki0maZMd50EM9kyb1y8Y2ywvjoic41y3SCc57mlPAbNqpwxihUPjhsG8WQUyCPX66+yWBfcCy2k0jGOUi2zFMcm/glT9l/wQ90Ku+CCCy6CpzbXLGUW8EBknU3vubE9g56mP38sn8Nvx/GrJsMq9JRHY2aiwijb/LMLqI17wdWcOqetcwhjedq2vd7Qvkfsfs6fZjpRBw1QIaTXkTaxlvF+rqXjionxOVh6CgEJV/g1Q46i0HJ8yE8c5aFhVcXUk/K+qNVDjtQBg8LJ3FrPA9LLeNoIIMXdqmPQW/pcWE+gjb6Zj4nj1YMpjENjLf9c9Rr7io5C35pG7gxI+M/Fl2T7CguVySkCjkSx2r2f46bTlUejXyFCb4tmkGd4k2arvDJvt9aFPebYcydHBp0Dn92FhD6IAn8PIhKO67NEwoC7onw8usqCzrCn6kRFIEkfnKNxbnK4suwPD9aoRJsrC3YIQly9y2Gd1i9N0MaYG9vAZDtRPz9UGl2vxCpXslafX+UGlbkgSOZdLNHRRXt8mHY0Mqh1jBt2eEHNs1bPtTyLc2QEoqYie/xXiqBHVYz2FyujYBt3g4MQloS9WbfhGQhuE7zIb5QmcYJxYTibmjyKzfzZT0IIW4ZTNdL4BEVDufsfdIzCQA52w2TZNtl7kE6LLzPJbmh3+BNHma4Qy03pvvxF8GAbCaEZJb20IAoW5bLxhKzHB5dcDsYn4JHo0xXm6iDQc96CTA7n2dfWTQkvqj1tD2J44uK20Y0jj9zFTrqsKU7ZdXItDBzUTKBrM7Mv8g0FgOGipOu/Wy52KRf9qmlwo6GXt/ab4f6Jd5UqkgDIM0TIQhj4BHuGgOTDACjFSuHzOHniCkvgli5zeBsZdlTRMkDaubJyDIo1sL4o1D6PrPF/ShypIbB7kmPo7Z2KTg9iPYk3zoa+Skz/e/0UTtQf72FuKBu41O5VTk6JI3l4V1L2qza7ETi1kmcSvlP2accYRqtCgdUD4YA1EIcb++H+6+iTdrHJX6lzbb1uRVLrnREdDza9wrd93yhyfwpl890jdfRu2NXSu5xc4Dka4c5CPGomxu3Y3mNCj46p8WglvvkjQaSbIt0SCWN/t0ZJnWtpPrG7uPdCNqREnQf83t/wPZOVn6Ul7GLGJ6edOGxLalQlhZZxpslGBpAW30cmIYAxrEv8yH6XWqEYaIaxw+g5KF4H4FlcCFvpQAAKj61yzTLyxI7yfIKJA2gpfghV+35gv4EnxbJMgUx0u58e9rTwArYwhNlHdPVC/FrKCNQHNDi+9vikxhZi9AkJ+B1HGCMjwyOfEwsnqlwZxxBihVWKXXxNlCDbQJResnxFOIuoXRfhhaOYO8klxGkZSMY6mGJK2PFh8V28TbvICEe7t3e0+mH2bjv1I5+3F/bQ+AWnnBN5NJdr9Z0KpOBrk/fBvVMfE5tb0+bSaAX2GvuJr9vw0pO2KGgP7u1NP8f5Jz/Qwe3Gbgm/sxSl8R4zcy/eN83j3uxsL2/CoagU9+qLByepBF07NsMGUrzezVMDDo4KVPhtuyyC75nzjn5qXus/OI7S37K+KnShEX+JvOQRsUv+w5FgHSZETWn/HQBbwEB/aPxOUdZGaQZCVoaDHrZEHWjP4M2IKvI23y94L2uRv9qrzCQQ6toJGQXTWGpDIqGKlKlSasgg5AebXb+zp1jffKvIX7e7lbdgU/KiLesqnRWRKCijKL1xquctdYa7l+WGz1VKnNKnjEwUWhF0RyqLNqcUt+BAWbDE2/muXXRg+6QQfNa2Il5qehW+Pk/8/MsFcsKme64eGOh1EAluoWPpwWcTSxO//H/pfEa5dPO/Jm/XZhBKtbnpf26R9fW3/EXwPrcrvoeaaSjasC6+ZochVBbQmvwoTU9VdYZ7OrnBy5Y2+W5R0TVV+wVt/Ny5Casj28PUdM2WzZflJlpLLew9+9zJUevrv3/+jKqjtqq7BFX8gbT66Hye/fY5iDh5F4LKURRKai+++bP2ZI/bVV/9Pf3HoPt5kU+cfhX1+WS3g6DTwMDvRLTfRJZ2PyzvHc3yEByr2vP78FiFh/BY7mW7uWUrINJfYASB6v0NTCk/pEAGdQU0e5c+tnnMWLA9wdB7FgU0Bvc4YI/Y72+gZpKGMuiq3nh+fE6IEJA1nnRnY6bRODXN6I14te+OXaXi8bL0U+i6EwfLjC7w6hA6CAVFgtNrTjfu+p47xfr2G+3me1a3pnymkhvqrirWmlL1vEVeKtcAooc/tvy3+kZe8lSpLHn+WrFauJgh7qZCOzgcaHsPpToSiPzx6qMbCy9Hfk+4MfNy6NIIWOKSh+/E3ddVqwMnO8RdSJiczYU1dmPJD8bu/MlnpZOgx3Hmm3zleWPZVSNGZslwODt3GpZWTcFSucoYiu0mZBNy81K/vOXi5/k9fW/zGzcOVJw3L9kWKzN6EiklaHIGvzmc3++z2xPVxEvuKpDKr/5YCQw9w5bylh4DA78SvU/4vXnPsO2F70ee624V87Vr6VLpanqatviW7vmIMXWwDZxVtNVNoROB+m/EOc8IHYX0fefYp3pwxzFXf8Xyau8R7LFB91ELmr0l7T13YvDc3cq664Xlz73W2OODx0ZvDDm9fn8dxlpudl1zVOo/PHTgPf/UwBe2nT62Sl+9S6HVz++BGA8BrPN4ttsHz+KCUfHpkNT/zyeQ1MSMYNSruOfHGXYdHtbY9w9KJmI4oZxvfV9BOLEpOkMJ4GQdR1R84PUmlErs9Skn+lSS+oOInm/el/c7CzSqfOdeB8BzVRAYKdXgHOOZLclaQw88DEYXdYYjH4ydfylbLuGZY9EyJXekLINQLUeOHCOZZJvXWVz2NUSHZeSHkamVoWi83XK0X66mai2YFd3l1ExhjTe9XR8291pFV0YlTea0kTAy5NgyzoZvxTHt1RtVeCHw0Ng4Ur432G9f1IBF8YJsVlaBgX7L2zIwKkWBKe14oq7Zv36i+sCTTu10YUcFWicSos53lBblq/PRZ2UyzKWOIpBjP/xJt+LA8lHFwU+6h2ndvmIys8oOuxxyPhSDDk91iaroFqIuVZShLnYLKqLTXLGRoYSLp0Ns8SxhNV3jB/T26qed1Qc2jtfsf6pWlyowyBRXS+9hYKBfXbFxQ/PqsZTpPHUR5pJMhj6rzs8v6ihFnReK0LrOCiCwn/2qW75veajW4F3fMHc5tqOR8XSMkDN8gBFVhjzVkpGb251FmEzNlTGXRzl58GJPEhG7EuzIqFXsYIBfDn+0d9TiGv/nzJQGDYwGZdhEh448uevFICTT7oKsc7KtxOr8AE2aAk2qicxSLSva3xwORrLr4SWqp/Lan9dWJP89U6tL6tGo1MDDm2u1PQ07HzA7ivPUPMyqtBq9pc7LL+osQW9XCDBrnVmANjG5BQz0W03ukNGLDYrKUzz++a4b22caVBoRVYHCKcEkf4sPTJ7wt1dBIW5IQyn10B4jYzgMgNa8PvbhN68PHlGU4u1t3ZbV6YkK+ZEZYOupv7G/+sVbA3+KnTFL3ByHlQ4O2EocrBmFkkEYN3OKwT/Z+NPwt5KW/BRCSWJsKebV1v9zpDIdVhWPqubuRXYlfwVYOgI7udbWciUuj3zaXU9cG1IcOMjh6UqNAHWxrByl0wgrC/3mg4kZYAiObNo00lBHrT1XlpQov5qag2yY3aJYlv4hFFfHa8lmc9Xt6tOa+IGf5K8um7ulTubl2GT+sF35uwdVDscIiReBo71gAy5osk4/5WOf2szMEbVno2KpRPqRc/5DJ/oGxRnFvefp1YJpZE6NA3nWt7gosySnORWdyMVn2i15D53QDAqyyoZvsIFnDn8UPrposhVLiEdiDmMYHkPn0CYnts0MtwEHi6IWLnQiBy2G/H1RpU9u81etHOaO6xTgrdMW//q3g5554fdc0uGv+J7zyDvTdaN/MGIbzt9t+dw5O+kftyl31+GEf10KlZ/vNV265sX/4zp+1H008R+Xgru06/kG3uz5cwzRd8p70YblY830WfKdscX3/AnY2UbQNp2jb38RwSBrfBF8PwRaE8nofPFgtkS5JXo095eWRuzwgab7QFEdEbSFv6DuDxzzKOWaYwhOFHee01ZOZCfkh939uH0/eM1t2+BYJr+qLpISgrIALSrvMC+z9EVMt5e1q5loESS/BEaqOv0rW7T7IOhTaa39crM2+eefZMwvtxcWvtquZf70k/TouqldKB3qpJheukwxr24pZrooZrpLLaICfJ6uB+PCP4iOS/NN7yG+A6Nt3znQuaUtUVIUGVdZF09lypAIWfJOs+TmozKl8l6Z8IKIFjOsudykRqWYrx0AUuvet9nN6wdFewbo5Lz2SCa/B8oQkWhU6QiqXLIgYTcn4ipJeGhpdTyN2ByZnLsfe+aAsGn9RXaT+lZ58XaRvHmt8pg531KVhx7gS5t2Py0D1UFjPteMBd+R3AT7zasWFUFpABuwDQz0gGHd9DCvduNg5VkDGClfFktI6WBQ+vgZjKEeFh/V6b++bst+e2ixArJh/FQdQspbxilU6O2S7vrXr+uB0jrtHGJ4KvXwg+v4kC797RJF3fXsuvXDwvMOGeoGYdW8kv3PpnldOactiFT/uE7+UY+69t1b1ZA2pZvLGExLpfZ3slOQwnA2L0QM49AGu3nglm+uu/k/i1fXfZnHQJ310GdF9RckfMJ0UzHd0rjEWXFOXCXauJ+nbLqfJ96oEtefK3Q2plo2lZGm+ZLGC58VDcxnd0PJQgqDIddgeXztlyFnUEhCDTRbR5EkoisJBESpNJ5Gn3KIUvrbA1lZmwiM1orr2XWbh8UX7bLUTeKqOSXn3y1zWTmnNYRc/1Qu/6hbXffJO9Xw/lRwBjk0kWr14AY+tFN/u6RUhxRFsHmhYjiL3t/F46V0cRiDvFRqv5oNENZ9T0uqzgqyKJ0dEg7sg9m536eRwjH8VFo0MzCIGhkNyWWXRiH8Poa+DF+gZMiHsQPcbO7QPLOsYobF7uEiIQJO5qjvB6kIvBCFQ5XVJdC5c9iGFsJuzUo/4hKr9G48lvyKBO5+BK7+fA88/pn9dTSZHIWjoqNJRtRfTiDfM2vT9mezkD4wb66UjYbmlEYh40pCMPkGdN3BOvHaZZ64UZdTuF4lKTydEfsbGXs8n2vGvh/i2+olfw6eI8DjpWvE8QpGHL5XGW5VFsRcX5O/aLwM0u04O6UhEIv6rjh8OYM0voaXCvGw3NnXzZdlT8BbOyBGdo28A4ZH3CNAanegLuNjDLqV6dL0HPFneT59Kfz+wOIhOeALFW4xrjwaYtDDjTFR3B+Qwvfpy/+kOj3X1adk0JOGdE2LdlHwRYq09Z3NHfBCKQl4wU9vJsZNniasHyruCyRd8z4TZ+RIPT/+Z6A+bc65RH8Bv4RfXCxJl4L0XPEn+X19z/QFuIdhN8HOJgAwmPo1W/LVV9WsD55KaF98Q5I9eRDZ/Ohdoetwse0z5EZriTBc4s7DdRpPrcuoVG40pbzpVBU9Pi+tzqhHLZgmT/bFw7lQHCnb9eGcjP7F4rn/W99Ytii4cDPTbeesfr4vX3POPU8ddq32uO2n1vd4zjtMYDPFpMhxcU2cShzJpguSEzqSeaEz5VngplWufsgKpQ97O+YwwHMYiD881vCbXVrM9TgMpdgNAX+0g5vhH1q6CHCK2gAmvftGYfH6ax+h7x5qu7Qg6TBHw2RqOFxmT0XJ9TCR43JaxE6B6YGxjMgHY5FA3rTHNvLKaxVozAvd8rM7WDGSx+374Nr95FQXbvSvAJzeuG248iC50KUYdO1YCN7e07Zqoxs2lr4ANfvGyRuRfVPXpwB0uiKsKVogolmxYfVCgaDi6eMLFnf21dIHVHA8XpJARZN+9UpEc9nz+6SMASUcT6yFEuH8T7xiCTTAB9prV+CipIYTwkXPAoQ3087XP/vF6pNfwFm1ebznqbg6R03IYRQbNuNOs3jpI1O4dYTUF2L+Mz1bKP6R1Np1N7bzIaVF8EsOua5H17HiCdmNvYW38Z4r5M8TMj93mHE4+HOdF9PjRLKXB/KEFwJY/fLsuymHkXrDCQeOVtmlUVhN/ZjC5GAwvFTQAzXQn9T/RYMW4+E+/d07s0+Hhmaf3b4z/XhYRcR3t7ThNUQivre1Fd8FnLMDAmbmTfb6p2dloKjEyis+NjkoGB8WDPk1dKx0UiaQDjSlebpTudWs9EKhKboFdBkzmoLILPxcAdU9JJYSHRSOQZKS5clRyMTwgOZQf7YnZDSeltoQRmRWJcXlRKGxaR+aMk3oeeTs000gRdaACCzcQ9xKM3ug+qdpzo88FADaTUk1kag0/7FQpJ9/HIWQkMhMRhzaqux0j5HcaEE57Rh9gLb3JIpRSAmJTJQqMaDLOMjmnE1NGm8Y5O4NpnKJkjhyril06hNYaBghXSYz8yiKgqIFCFQ1RTw3r25MSmYmxVOYUC+oxyq6kJUJ5KxRs66O6A7OFGgw5rXHEvPgod4MdMxZk8nInPgkTKYsikati8ZkJiYgsuUmQzExfgwInJzXHpsiQ+ITwqNpyIQkKjI6HJeAKgxHxkIgsOioaGg0BAKPBTUmJEkcqcAUNv0UGhYOIUb5lzNMkflxiWgRElVDZpAb23Hc/fWljjkk+HjzMPdyXyqzLwDm5404jkzOQELprMQEEhMQFT71PoxnEm8JUD5SWCosDtTL69Hcy/a6iTzvD+9NUhGOihAu6gRtSHEvVkT+BcSRw8rjl5xaoSL8Uaiq1x+GOO99kyMi/oKvBl+bBH4dCPNArhv62oLsmjFQwdp3Ao5uJqU30uFtdDId0brO4mfU02GtJ+yQfkP4jcSEAgQZHldIJkAL4WREYgEM8Vr3bm2gQ0eTDuU1Zy9b4Q97nrfVniBdff3dRCDQPzreWN5QELk7TLegG/syLfNdaUy3HLpSwsNl03n0XP0jvYk100CrIboTEXuGGsbcfPfOkQoAtL9wb7m3M3dXd/cBl/mFRirQNtL4c6wGFADRe9dcHj2bzsOV7LbQLZPvx7TMb55v0XrFq7GgoRwib5FAoFYDMRRoplIJ1X52RxyA8IZnnBsAst5QUBlzrq7Nyro1aQ0HtMvfgIUFdANfW7CwAERvBpa7u/uJGk33vjO3U8H8Qs2+fA1Yr82cPOSM/jGFJWtkXC8z/fjpBAFvWycITuPJFMJ7i1CumQZv6bJ3IwfxxOAU1PA2TczGV0B8dt0azgBdrUS2YThUKASHDAvXHCT02GxRwXaaDPrOtdNNphxVAIT0HjDVnKooAbFyFxbH4lkCS4Qk9CWSwX9eprIGVl/oK40cUM2pVOlnp/rP3waYTjnM1AxnMY29UB3mQ7OnBtPg389HtR3CTVAKGnFpoZ5ImMFvs9i0QAn81KUUyuBXoh7qa91AzUazyWw2W8xWs818zmw3nzfXmuvWdJxEsAfFcslhPayX9bF+9hLbz15mA+wAO8heMQa/bmjIwMC5evz/LrC4D2Dw9/mm8Cp8XqoxPqgJyuPj/rHMTc1xcEH9a0e8kba6+TYzAXzADZXQCB7g1F9fwuuf6IaMDPTXwtm2t6p1Ab3rtgk10uypT3dE23KkBjzVm59LDNETc2TCYh4Vl+9K32extqRnJzniSZu7InxFsO/z4y6Xp3SUbvgnsmFuGSmjp2WuGWjT5uU+yND21fV9U1IbyOkdUdAGygkqtOAKZYHuw3e0PTVUuSlcpjjSrZdwBgF735931XdN9a5BR3fU9vmFsmXk6KVbXMG8u+7xbfnilO7LWenfanno2vMnZ2xyVBtt9hqDkfFaPDC+jQdqUAX3BEcIU9HF+SEb50tOGe2np9EwtNt3BIFW5FNlXj+xWvxXwkkA/P+qpYe9qxOTipdaMTj8P2gwQIH/FMytPBjE/xkfHL6t9M/UJ37X0c7FhudrGuZtw+OJ0rkWfjW+jzeNv03hNFW3A7GFLr8iZlKNdBAnjffCEzlmmPz5Iw/XY+GmndXCp412JUHDaGEcH3ONLpaKagzOaj+zGZ8ejRe46lsycF4IWhiFHBFr78UWLD7Oq4duaZdrvnO1OZy1uSjoZker+SudYkeuiNPUKNOSzsplaOgRTON9u8d36uZUdeOKtvHz1Lxe/viBlO5yBrO0FL3Dz8r2hTcUTOBONPYSzpe6cXFeg3qz08fE5jajvRJBXq4f4RxtQRe2qreZjTTn6aRq0HZU78rnnAo6VHo7MZMcAXwFbrgBIw/VgOrz1Aeg+drKwWCfoW6UF2X2Rqba+Kpob4Y2VlL7TnYfhcI+QVb7nbDLpubb4roIhlPPHqC+B+qoL6yjxOJ6Tdsj1OzaZfGmj+uLugHvQtNDeQCD5+53591fcUhsY0EsuAJx4qr7zQL/8OvdvHvbZhi8Q2DyjKR6QRECVHNZmdZ9eIDhAfgCz6cRKedpjNzu0zizHDyNF+i100Tm+/5UQWCFnIcIsoo8bSH/MpwWTlJm0o9N2/sfQVoNolSoVM+uRDELB7U5ZpltPlFqB0V+AhsHyJ5o+eJVKM2qwHDPEao5WFSwq6IWEgBBlezpzCzVYiWdW66Wb4YCFcrN5F65KmRLAreHDkIrlz0Vq2aVx05rhlkp0SLTWyVF2xexBzPdtJUnU6t06lcpUTHuUAdNJVmdbv53NK0FCigf13KQsQxFuH0wy1RyKFEgj5XaKiUaFJlNy49J4OCdaiUGhTylEN/u02S/Ts1/1T990m4B';
const FONT_700 = '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';

const FONT_CSS = `
@font-face{font-family:'MxInter';font-style:normal;font-weight:400;src:url(data:font/woff2;base64,${FONT_400}) format('woff2')}
@font-face{font-family:'MxInter';font-style:normal;font-weight:700;src:url(data:font/woff2;base64,${FONT_700}) format('woff2')}
`;

let fontsPromise: Promise<unknown> | null = null;
const ensureFonts = () => {
  if (fontsPromise) return fontsPromise;
  const st = document.createElement('style');
  st.textContent = FONT_CSS;
  document.head.appendChild(st);
  fontsPromise = Promise.all([
    document.fonts.load("400 24px 'MxInter'"),
    document.fonts.load("700 24px 'MxInter'"),
  ]).catch(() => null);
  return fontsPromise;
};

const useEmbeddedFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        continueRender(handle);
      }
    };
    const t = setTimeout(finish, 2500);
    ensureFonts().then(finish, finish);
    return () => clearTimeout(t);
  }, [handle]);
};

// -------------------------------------------------------------- helpers ----
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const mod = (a: number, n: number) => ((a % n) + n) % n;
const rnd = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const DUR = 20; // detik
const TAU = Math.PI * 2;

// Glyph handset klasik (Material Symbols "call", Apache-2.0), viewBox 24×24.
const PHONE_PATH =
  'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.21c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z';

// ----------------------------------------------------------- geometry -------
const W = 1920;
const H = 1080;
const CX = 960;
const AV_Y = 468; // pusat avatar
const AV_R = 150; // radius cincin avatar
const BTN_Y = 872; // pusat tombol
const BTN_DX = 272; // offset tombol dari tengah
const BTN_R = 86; // radius tombol

// ============================================================================
// SCENE — seluruh konten digambar dua kali (base + bloom copy)
// ============================================================================
const Scene: React.FC<{T: number}> = ({T}) => {
  // ---- ritme dering (periode 1 s) — cadence terukur dari referensi ----
  const rc = mod(T, 1);
  const wigWin = 1 - smooth(0.5, 0.78, rc);
  const wiggle = 16 * Math.sin(TAU * 5 * rc) * Math.exp(-5.0 * rc) * wigWin;
  const pump =
    rc < 0.5 ? Math.pow(Math.sin((Math.PI * rc) / 0.5), 0.8) * Math.exp(-2.2 * rc) : 0;
  const heroScale = 1 + 0.045 * pump;

  // ---- ripple avatar: 2 kereta (delay 0 & 0,18 s), umur 1,5 s ----
  const ripples: {r: number; op: number; sw: number}[] = [];
  const trains: [number, number][] = [
    [0, 1],
    [0.18, 0.55],
  ];
  for (const [delay, amp] of trains) {
    const ph = mod(T - delay, 1);
    for (let j = 0; j < 2; j++) {
      const age = ph + j;
      if (age >= 1.5) continue;
      const p = age / 1.5;
      ripples.push({
        r: AV_R + 8 + 320 * easeOutCubic(p),
        op: amp * 0.5 * Math.pow(1 - p, 1.7) * smooth(0, 0.05, p),
        sw: 3.2 * (1 - p) + 0.6,
      });
    }
  }

  // ---- pulse tombol Accept (fase +0,5 s) ----
  const ac = mod(T + 0.5, 1);
  const acPump =
    ac < 0.5 ? Math.pow(Math.sin((Math.PI * ac) / 0.5), 0.8) * Math.exp(-2.0 * ac) : 0;
  const acScale = 1 + 0.05 * acPump;
  const acRipples: {r: number; op: number; sw: number}[] = [];
  for (let j = 0; j < 2; j++) {
    const age = ac + j;
    if (age >= 1.1) continue;
    const p = age / 1.1;
    acRipples.push({
      r: BTN_R + 6 + 96 * easeOutCubic(p),
      op: 0.5 * Math.pow(1 - p, 1.6) * smooth(0, 0.06, p),
      sw: 2.6 * (1 - p) + 0.6,
    });
  }

  // ---- napas (periode 4 s → 5 siklus/loop) ----
  const haloBreath = 0.16 + 0.05 * Math.sin(TAU * (5 * T) / DUR);
  const declineScale = 1 + 0.012 * Math.sin(TAU * (5 * T) / DUR + Math.PI);

  // ---- sapuan specular cincin: 2 putaran/loop ----
  const specRot = (720 * T) / DUR;

  // ---- titik "Incoming call…" (periode 2 s) ----
  const dph = mod(T, 2) / 2;
  const dotOp = (i: number) =>
    smooth(0.06 + 0.2 * i, 0.16 + 0.2 * i, dph) * (1 - smooth(0.8, 0.96, dph));

  // ---- blob ambient (k bulat per loop) ----
  const blobs = [
    {
      x: 420 + 130 * Math.sin(TAU * (1 * T) / DUR),
      y: 330 + 90 * Math.sin(TAU * (2 * T) / DUR + 1.2),
      r: 620,
      c: '61,90,254',
      a: 0.16,
    },
    {
      x: 1560 + 110 * Math.sin(TAU * (2 * T) / DUR + 3.9),
      y: 430 + 120 * Math.sin(TAU * (1 * T) / DUR + 5.1),
      r: 560,
      c: '0,191,165',
      a: 0.1,
    },
    {
      x: 1180 + 150 * Math.sin(TAU * (1 * T) / DUR + 2.4),
      y: 940 + 70 * Math.sin(TAU * (3 * T) / DUR + 0.7),
      r: 640,
      c: '124,77,255',
      a: 0.12,
    },
  ];

  // ---- partikel bokeh (hash-based, sinusoid periodik) ----
  const parts: {x: number; y: number; r: number; op: number}[] = [];
  for (let i = 0; i < 18; i++) {
    const a = rnd(i + 1);
    const b = rnd(i + 31);
    const c = rnd(i + 77);
    const d = rnd(i + 113);
    const kx = 1 + Math.floor(rnd(i + 151) * 2); // 1..2
    const ky = 1 + Math.floor(rnd(i + 197) * 2);
    const kt = 3 + Math.floor(rnd(i + 251) * 4); // 3..6
    const x =
      120 + a * 1680 + (28 + 44 * rnd(i + 201)) * Math.sin(TAU * (kx * T) / DUR + c * TAU);
    const y =
      100 + b * 880 + (22 + 36 * rnd(i + 301)) * Math.sin(TAU * (ky * T) / DUR + d * TAU);
    const tw = 0.7 + 0.3 * Math.sin(TAU * (kt * T) / DUR + a * TAU);
    parts.push({
      x,
      y,
      r: 1.6 + 3.2 * rnd(i + 401),
      op: (0.05 + 0.15 * rnd(i + 501)) * tw,
    });
  }

  // ---- napas kamera global (1 siklus/loop) ----
  const camScale = 1 + 0.006 * Math.sin(TAU * T / DUR);

  const textBase: React.CSSProperties = {
    fontFamily: "'MxInter', sans-serif",
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    color: '#E8EEF9',
  };

  return (
    <AbsoluteFill style={{background: 'transparent'}}>
      {/* ------------------------------------------------ latar ------- */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(1400px 900px at 50% 38%, #0B1226 0%, #070B18 52%, #04060D 100%)',
        }}
      />
      {blobs.map((bl, i) => (
        <div
          key={`bl${i}`}
          style={{
            position: 'absolute',
            left: bl.x - bl.r,
            top: bl.y - bl.r,
            width: bl.r * 2,
            height: bl.r * 2,
            background: `radial-gradient(circle, rgba(${bl.c},${bl.a}) 0%, rgba(${bl.c},${
              bl.a * 0.45
            }) 34%, rgba(${bl.c},0) 68%)`,
          }}
        />
      ))}

      {/* ------------------------------------- konten (napas kamera) --- */}
      <AbsoluteFill style={{transform: `scale(${camScale})`}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
          <defs>
            <linearGradient id="ringGrad" x1={CX - AV_R} y1={AV_Y - AV_R} x2={CX + AV_R} y2={AV_Y + AV_R} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7DF3FF" />
              <stop offset="50%" stopColor="#8B9CFB" />
              <stop offset="100%" stopColor="#C08BFC" />
            </linearGradient>
            <linearGradient id="specGrad" x1={CX} y1={AV_Y - AV_R} x2={CX + AV_R} y2={AV_Y} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="50%" stopColor="#EAF6FF" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="haloGrad">
              <stop offset="0%" stopColor="#67E8F9" stopOpacity="0.5" />
              <stop offset="45%" stopColor="#5B7CFA" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#5B7CFA" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="glassGrad">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.1" />
              <stop offset="62%" stopColor="#FFFFFF" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.015" />
            </radialGradient>
            <linearGradient id="phoneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#CFE0FA" />
            </linearGradient>
            <radialGradient id="btnShadow">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#000000" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="greenGlow">
              <stop offset="0%" stopColor="#3EE07A" stopOpacity="0.4" />
              <stop offset="55%" stopColor="#3EE07A" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#3EE07A" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="redGrad" cx="0.35" cy="0.3" r="1">
              <stop offset="0%" stopColor="#FF7A66" />
              <stop offset="55%" stopColor="#F5473A" />
              <stop offset="100%" stopColor="#C92A22" />
            </radialGradient>
            <radialGradient id="greenGrad" cx="0.35" cy="0.3" r="1">
              <stop offset="0%" stopColor="#5CEF92" />
              <stop offset="55%" stopColor="#2BCE66" />
              <stop offset="100%" stopColor="#149A4A" />
            </radialGradient>
            <filter id="softGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow dx="0" dy="0" stdDeviation="9" floodColor="#9BE9FF" floodOpacity="0.55" />
            </filter>
          </defs>

          {/* partikel bokeh */}
          <g>
            {parts.map((p, i) => (
              <circle key={`p${i}`} cx={p.x} cy={p.y} r={p.r} fill="#AFC8FF" opacity={p.op} />
            ))}
          </g>

          {/* halo avatar (napas) */}
          <circle cx={CX} cy={AV_Y} r={295} fill="url(#haloGrad)" opacity={haloBreath / 0.16 * 0.5} />

          {/* ripple dering avatar */}
          {ripples.map((rp, i) => (
            <circle
              key={`r${i}`}
              cx={CX}
              cy={AV_Y}
              r={rp.r}
              fill="none"
              stroke="#8FD8FF"
              strokeWidth={rp.sw}
              opacity={rp.op}
            />
          ))}

          {/* piringan kaca + cincin gradien */}
          <g transform={`translate(${CX} ${AV_Y}) scale(${heroScale}) translate(${-CX} ${-AV_Y})`}>
            <circle cx={CX} cy={AV_Y} r={AV_R} fill="url(#glassGrad)" />
            <circle cx={CX} cy={AV_Y} r={AV_R} fill="none" stroke="url(#ringGrad)" strokeWidth={3} opacity={0.9} />
            <circle cx={CX} cy={AV_Y} r={AV_R - 7} fill="none" stroke="#FFFFFF" strokeWidth={1} opacity={0.1} />
            {/* sapuan specular berputar */}
            <g transform={`rotate(${specRot} ${CX} ${AV_Y})`}>
              <circle
                cx={CX}
                cy={AV_Y}
                r={AV_R}
                fill="none"
                stroke="url(#specGrad)"
                strokeWidth={7}
                strokeLinecap="round"
                strokeDasharray={`${AV_R * TAU * 0.22} ${AV_R * TAU * 0.78}`}
                opacity={0.28}
              />
              <circle
                cx={CX}
                cy={AV_Y}
                r={AV_R}
                fill="none"
                stroke="url(#specGrad)"
                strokeWidth={3.2}
                strokeLinecap="round"
                strokeDasharray={`${AV_R * TAU * 0.22} ${AV_R * TAU * 0.78}`}
                opacity={0.85}
              />
            </g>
            {/* handset — wiggle dering */}
            <g filter="url(#softGlow)">
              <g
                transform={`translate(${CX} ${AV_Y}) rotate(${wiggle}) scale(6.3) translate(-12 -12)`}
              >
                <path d={PHONE_PATH} fill="url(#phoneGrad)" />
              </g>
            </g>
          </g>

          {/* ---------------- tombol ---------------- */}
          {/* bayangan lantai */}
          <ellipse cx={CX - BTN_DX} cy={BTN_Y + BTN_R + 26} rx={92} ry={20} fill="url(#btnShadow)" />
          <ellipse cx={CX + BTN_DX} cy={BTN_Y + BTN_R + 26} rx={92} ry={20} fill="url(#btnShadow)" />

          {/* glow hijau + ripple accept */}
          <circle cx={CX + BTN_DX} cy={BTN_Y} r={150} fill="url(#greenGlow)" opacity={0.5 + 0.5 * acPump} />
          {acRipples.map((rp, i) => (
            <circle
              key={`ar${i}`}
              cx={CX + BTN_DX}
              cy={BTN_Y}
              r={rp.r}
              fill="none"
              stroke="#5CEF92"
              strokeWidth={rp.sw}
              opacity={rp.op}
            />
          ))}

          {/* tombol decline */}
          <g
            transform={`translate(${CX - BTN_DX} ${BTN_Y}) scale(${declineScale}) translate(${-(
              CX - BTN_DX
            )} ${-BTN_Y})`}
          >
            <circle cx={CX - BTN_DX} cy={BTN_Y} r={BTN_R} fill="url(#redGrad)" />
            <circle cx={CX - BTN_DX} cy={BTN_Y} r={BTN_R} fill="none" stroke="#FFFFFF" strokeWidth={1.6} opacity={0.28} />
            <path
              d={`M ${CX - BTN_DX - 54} ${BTN_Y - 44} A ${BTN_R - 14} ${BTN_R - 14} 0 0 1 ${
                CX - BTN_DX + 54
              } ${BTN_Y - 44}`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={7}
              strokeLinecap="round"
              opacity={0.22}
            />
            <g
              transform={`translate(${CX - BTN_DX} ${BTN_Y}) rotate(135) scale(2.55) translate(-12 -12)`}
            >
              <path d={PHONE_PATH} fill="#FFFFFF" />
            </g>
          </g>

          {/* tombol accept */}
          <g
            transform={`translate(${CX + BTN_DX} ${BTN_Y}) scale(${acScale}) translate(${-(
              CX + BTN_DX
            )} ${-BTN_Y})`}
          >
            <circle cx={CX + BTN_DX} cy={BTN_Y} r={BTN_R} fill="url(#greenGrad)" />
            <circle cx={CX + BTN_DX} cy={BTN_Y} r={BTN_R} fill="none" stroke="#FFFFFF" strokeWidth={1.6} opacity={0.32} />
            <path
              d={`M ${CX + BTN_DX - 54} ${BTN_Y - 44} A ${BTN_R - 14} ${BTN_R - 14} 0 0 1 ${
                CX + BTN_DX + 54
              } ${BTN_Y - 44}`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={7}
              strokeLinecap="round"
              opacity={0.28}
            />
            <g
              transform={`translate(${CX + BTN_DX} ${BTN_Y}) scale(2.55) translate(-12 -12)`}
            >
              <path d={PHONE_PATH} fill="#FFFFFF" />
            </g>
          </g>
        </svg>

        {/* ------------------------------------------------ teks ------- */}
        <div
          style={{
            ...textBase,
            top: 176,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'baseline',
            gap: 10,
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: 34,
              letterSpacing: '0.42em',
              paddingLeft: '0.42em', // kompensasi letterSpacing agar center optik
              textShadow: '0 0 26px rgba(125,211,252,0.35)',
            }}
          >
            INCOMING CALL
          </span>
          <span style={{display: 'inline-flex', gap: 7, marginLeft: 2}}>
            {[0, 1, 2].map((i) => (
              <span
                key={`d${i}`}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 4,
                  background: '#9FD8FF',
                  opacity: dotOp(i),
                  display: 'inline-block',
                }}
              />
            ))}
          </span>
        </div>

        <div
          style={{
            ...textBase,
            top: 666,
            fontWeight: 400,
            fontSize: 31,
            letterSpacing: '0.14em',
            paddingLeft: '0.14em',
            color: '#93A7CC',
          }}
        >
          Unknown number
        </div>

        <div
          style={{
            ...textBase,
            top: 986,
            left: CX - BTN_DX - 960,
            fontWeight: 400,
            fontSize: 26,
            letterSpacing: '0.1em',
            paddingLeft: '0.1em',
            color: '#97A6C5',
          }}
        >
          Decline
        </div>
        <div
          style={{
            ...textBase,
            top: 986,
            left: CX + BTN_DX - 960,
            fontWeight: 400,
            fontSize: 26,
            letterSpacing: '0.1em',
            paddingLeft: '0.1em',
            color: '#9FE8BC',
          }}
        >
          Accept
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
export const Motion: React.FC = () => {
  useEmbeddedFonts();
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  // loop tertutup secara konstruksi: frame N ≡ frame 0
  const T = mod(frame, durationInFrames) / fps;

  return (
    <AbsoluteFill style={{background: '#04060D'}}>
      {/* base */}
      <Scene T={T} />
      {/* bloom global */}
      <AbsoluteFill
        style={{
          filter: 'blur(26px)',
          opacity: 0.28,
          mixBlendMode: 'screen',
        }}
      >
        <Scene T={T} />
      </AbsoluteFill>
      {/* vignette */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(1500px 1000px at 50% 46%, rgba(2,4,10,0) 52%, rgba(2,4,10,0.55) 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(2,4,10,0.25) 0%, rgba(2,4,10,0) 14%, rgba(2,4,10,0) 82%, rgba(2,4,10,0.35) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
