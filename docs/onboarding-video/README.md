# FocusProLab — Sistem Tanıtım Videosu

Kullanıcıya test akışını ve ölçülen metrikleri anlatan ~118 saniyelik tanıtım videosu.

## Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `index.html` | Animasyonlu tanıtım (tarayıcıda önizleme) |
| `../public/FocusProLab-sistem-tanitim.webm` | Üretilmiş video (1280×720) |
| `../../scripts/render-onboarding-video.mjs` | Playwright ile video kaydı |

## Video içeriği (sırayla)

1. Giriş / kayıt
2. Katılımcı bilgileri
3. SPACE tuşu kontrolü
4. Ses kontrolü
5. Yönerge + deneme testi
6. «Teste başla» butonu
7. Asıl test (mavi üçgen görevi)
8. **Metrikler:** A-Dikkat, T-Zamanlama, I-Dürtüsellik, H-Hiper-reaktivite, Genel skor
9. Teşekkür ekranı

## Önizleme

`docs/onboarding-video/index.html` dosyasını tarayıcıda açın.

## Yeniden üretim

```bash
npm run render-onboarding-video
```

Gereksinim: Microsoft Edge (sistemde yüklü) + `npx playwright install ffmpeg`

## MP4 dönüşümü (isteğe bağlı)

Tam ffmpeg kuruluysa:

```bash
ffmpeg -i public/FocusProLab-sistem-tanitim.webm -c:v libx264 -pix_fmt yuv420p public/FocusProLab-sistem-tanitim.mp4
```
