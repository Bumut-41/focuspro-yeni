import { homeTr } from "./homeTr.js";

export const tr = {
  meta: {
    lang: "tr",
    dateLocale: "tr-TR",
    title: "FocusProLab",
    description: "FocusProLab — Dikkat Testi"
  },
  nav: {
    brandTagline: "Sürekli performans değerlendirmesi",
    panel: "Panel",
    test: "Test",
    admin: "Yönetim",
    home: "Ana sayfa",
    login: "Giriş",
    register: "Kayıt ol",
    logout: "Çıkış"
  },
  common: {
    wait: "Bekleyin…",
    loading: "Yükleniyor…",
    testLoading: "Test yükleniyor…",
    continue: "Devam",
    save: "Kaydet",
    delete: "Sil",
    close: "Kapat",
    you: "Siz",
    or: "veya",
    select: "Seçin",
    backToPanel: "← Panele dön",
    panelBack: "Panele dön",
    ok: "Tamam",
    yes: "Evet",
    no: "Hayır",
    dash: "—"
  },
  auth: {
    setupTitle: "Supabase ayarı gerekli",
    setupDesc: "`.env` dosyasına VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY ekleyin.",
    setupDescRegister: "docs/SAAS_SENARYO.md dosyasına bakın.",
    loginTitle: "Giriş",
    loginSub: "Hesabınıza erişin ve değerlendirmelere devam edin.",
    email: "E-posta",
    password: "Şifre",
    loginBtn: "E-posta ile giriş",
    noAccount: "Hesabınız yok mu?",
    registerLink: "Kayıt olun",
    registerTitle: "Üye ol",
    registerSub: "Üyelik için 18 yaş ve üzeri zorunludur.",
    registerEmailHint: "veya e-posta ile kayıt",
    fullName: "Ad soyad",
    birthDate: "Doğum tarihi",
    birthDateMember: "Doğum tarihi (üye)",
    birthDateMember18: "Doğum tarihi (üye — 18+)",
    accountType: "Hesap türü",
    registerBtn: "Kayıt ol",
    hasAccount: "Zaten hesabım var",
    age18Required: "Üyelik için 18 yaş ve üzeri olmalısınız.",
    passwordMin: "Şifre en az 6 karakter olmalı.",
    registerSuccess: "Kayıt oluşturuldu. E-posta onayı açıksa gelen kutusunu kontrol edin, ardından giriş yapın.",
    completeProfileTitle: "Profilinizi tamamlayın",
    completeProfileSub: "Google ile giriş yaptınız. Devam etmek için bir kez bu bilgileri girin.",
    saving: "Kaydediliyor…",
    googleContinue: "Google ile devam et",
    redirecting: "Yönlendiriliyor…",
    oauthError: "Giriş başlatılamadı. Supabase'te bu sağlayıcı açık mı kontrol edin.",
    googleHint: "İlk kez Google ile girerseniz kısa bir profil formu (18 yaş, hesap türü) sorulur.",
    roleIndividual: "Bireysel kullanıcı",
    rolePsychologist: "Psikolog",
    roleIndividualShort: "Bireysel"
  },
  setup: {
    title: "Kurulum",
    desc: "Supabase bağlantısı için `.env` dosyasını doldurun. Bkz. docs/SAAS_SENARYO.md"
  },
  error: {
    pageTitle: "Sayfa yüklenemedi",
    pageDesc:
      "Uygulama beklenmeyen bir hatayla durdu. Sayfayı yenileyin; sorun sürerse geliştiriciye bu metni iletin."
  },
  home: homeTr,
  dashboard: {
    welcome: "Hoş geldiniz, {{name}}",
    description: "Dikkat ve sürekli performans değerlendirmelerinizi buradan yönetin.",
    pdfAutoSave: "Test bittiğinde rapor PDF otomatik kaydedilir ve aşağıdaki listeden açılabilir.",
    resultsPrivate:
      "Test tamamlandığında katılımınız kaydedilir. Sonuç raporları yalnızca yetkili yöneticiler tarafından görüntülenir.",
    guideHint: "Test akışında 3 bölümlü rehber gösterilir: sistemi kullanma, test senaryoları, ölçülen davranışlar.",
    newTest: "Yeni test başlat",
    adminPanel: "Yönetim paneli",
    historyTitle: "Geçmiş testleriniz",
    historyDesc: "Katılımcı test raporu PDF — dashboard üzerinden görüntülenir.",
    noTests: "Henüz kayıtlı test yok.",
    noTestsDesc: "İlk değerlendirmenizi başlatın.",
    date: "Tarih",
    participant: "Katılımcı",
    profile: "Profil",
    overallScore: "Genel skor",
    testReport: "Test raporu",
    openReport: "Raporu indir",
    downloadReport: "Raporu indir",
    generateReport: "Raporu oluştur",
    pdfPreparing: "PDF hazırlanıyor…",
    pdfOpenFailed: "PDF açılamadı."
  },
  test: {
    participantTitle: "Katılımcı bilgileri",
    participantDesc: "Değerlendirme oturumu için katılımcı kaydı.",
    gender: "Cinsiyet",
    genderFemale: "Kadın",
    genderMale: "Erkek",
    consent: "Veli / yasal temsilci onamı alındı.",
    errName: "Ad soyad girin.",
    errBirth: "Geçerli doğum tarihi (6–99 yaş).",
    errGender: "Cinsiyet seçin.",
    errConsent: "Çocuk/ergen için onam kutusunu işaretleyin.",
    saved: "Test kaydedildi. PDF raporu hazırlanıyor…",
    noCredits: "Kayıt yapılamadı: test hakkınız kalmadı.",
    saveError: "Kayıt hatası: {{msg}}",
    pdfSaveFailed: "PDF kaydı başarısız; «PDF indir» ile tekrar deneyebilirsiniz.",
    newTest: "Yeni test",
    devTimer: "Deneme sayacı",
    stepGuide: "Adım 3 / 5 · Katılımcı rehberi",
    stepSpace: "Adım 1 / 5 · Tuş kontrolü",
    stepAudio: "Adım 2 / 5 · Ses kontrolü",
    stepMain: "Adım 5 / 5 · Asıl test",
    spaceTitle: "Önce SPACE tuşunu deneyelim",
    spaceSub: "SPACE tuşuna bir kez basın veya dokunun.",
    spaceNudge: "Basın ↓",
    spaceOk: "Tamam — SPACE algılandı",
    spaceTouch: "Dokunarak geç",
    audioTitle: "Şimdi sesi kontrol edelim",
    audioSub:
      "Kısa bir test sesi otomatik çalınır. Sesi net duyduysanız yeşil, duymadıysanız kırmızı butona basın.",
    audioHeard: "Sesi duydum",
    audioNotHeard: "Sesi duymadım",
    audioPlayError:
      "Ses otomatik çalınamadı. «Sesi duymadım» ile tekrar deneyin; ses seviyesini ve kulaklığı kontrol edin.",
    audioRetry:
      "Ses duyulamadıysa sesi açın veya kulaklığı kontrol edin. Test sesi tekrar çalınıyor…",
    practiceBanner: "Deneme — 30 sn (tüm bölümler, kayıt yok)",
    startTest: "Teste başla",
    thankYouTitle: "Katılımınız için teşekkürler",
    thankYouRedirect: "30 saniye içinde ana sayfaya yönlendirileceksiniz.",
    qaHint:
      "Geçici mod: yalnızca sessiz gif ve sessiz+sesli gif bölümleri (~6 dk). Sadece ses, temel ve kapanış kapalı.",
    participantGuide: {
      title: "Katılımcı rehberi",
      stepOf: "Bölüm {{current}} / {{total}}",
      tabs: {
        usage: "Sistemi kullan",
        scenarios: "Test senaryoları",
        criteria: "Neler ölçülür?"
      },
      usage: {
        title: "Sistemi nasıl kullanırsın?",
        lead: "Aşağıdaki adımları sırayla tamamlayacaksın:",
        steps: [
          "Siteye giriş yap veya kayıt ol",
          "Katılımcı bilgilerini gir",
          "SPACE tuşu ve ses kontrolü",
          "Bu rehberi oku",
          "30 saniyelik deneme testi (kayıt yok)",
          "«Teste başla» butonu ile asıl test",
          "Teşekkür ekranı → ana sayfaya yönlendirme"
        ],
        ruleTitle: "Tüm test boyunca kuralın",
        rule: "Yalnızca mavi üçgeni gördüğünde SPACE tuşuna bir kez ve hızlıca bas."
      },
      scenarios: {
        title: "Test senaryoları",
        lead: "Her bölümde ekranda farklı şeyler olur. Görevin her senaryoda aynıdır.",
        happensLabel: "Ne olur?",
        actionLabel: "Ne yapmalısın?",
        items: [
          {
            title: "Deneme testi (30 sn)",
            happens: "Asıl testin kısaltılmış hali; tüm bölüm türleri kısa süre gelir. Kayıt edilmez.",
            action: "Arayüzü tanı, mavi üçgende SPACE'e basmayı alıştır."
          },
          {
            title: "Çeldirici yok",
            happens: "Sadece şekiller ekranda gelir; gif veya ek ses yok.",
            action: "Sakin kal; yalnızca mavi üçgende SPACE'e bas."
          },
          {
            title: "Sessiz hareketli görüntüler",
            happens: "Ekran kenarında sessiz gif animasyonları oynar.",
            action: "Giflere tepki verme; sadece mavi üçgene odaklan."
          },
          {
            title: "Yalnızca ses",
            happens: "Görüntü olmadan kısa ses uyaranları duyarsın.",
            action: "Seslere tepki verme; ekrandaki üçgene bak."
          },
          {
            title: "Görüntü + ses birlikte",
            happens: "Hem gif hem ses çeldiricileri birlikte gelir.",
            action: "Dikkatini dağıtma; yine yalnızca mavi üçgende bas."
          },
          {
            title: "Kapanış bölümü",
            happens: "Test sonuna doğru çeldiriciler azalır.",
            action: "Son ana kadar aynı kural geçerli."
          }
        ]
      },
      criteria: {
        title: "Hangi davranışlar nasıl değerlendirilir?",
        lead: "Her SPACE basışın kaydedilir. Sistem bunlardan dört ayrı alan hesaplar; alanlar birbirine karışmaz:",
        measuresLabel: "Ölçüm:",
        items: [
          {
            code: "A",
            title: "Dikkat",
            desc: "Hedefe odaklanıp odaklanamadığın",
            measures: "İhmal — hedef (mavi üçgen) varken basmama"
          },
          {
            code: "T",
            title: "Zamanlama",
            desc: "Tepkinin zamanında ve tutarlı olup olmadığı",
            measures: "Zamanında isabet, RT hızı, geç yanıt ve RT stabilitesi (ağırlıklı T formülü)"
          },
          {
            code: "I",
            title: "Dürtüsellik",
            desc: "Hedef dışına aceleci ilk tepki eğilimin",
            measures: "Commission errors — hedef dışı uyaranlara verilen ilk tepkiler"
          },
          {
            code: "H",
            title: "Hiperaktivite",
            desc: "Fazla veya yönerge dışı tuş kullanımın",
            measures: "Mükerrer basış + boş ekran basışları"
          }
        ],
        privacy:
          "Test bitince sonuç ekranı görmezsin; «Katılımınız için teşekkürler» mesajı çıkar. Kayıtlar güvenle saklanır ve yalnızca yetkili uzman tarafından değerlendirilir."
      },
      next: "Devam",
      back: "Geri",
      startPractice: "Deneme testine başla"
    },
    instructions: {
      title: "FocusProlab Dikkat Testi Yönergesi",
      practiceBtn: "Deneme testi için tıklayınız",
      paragraphs: [
        "Bu testte ekranda farklı şekiller göreceksin.",
        "Senin görevin yalnızca mavi üçgeni her gördüğünde boşluk tuşuna en hızlı şekilde sadece bir kez basmaktır.",
        "Mavi üçgen dışında başka hiçbir şekli gördüğünde basma.",
        "Örneğin; mavi kare, yeşil üçgen, kırmızı daire, siyah artı veya başka şekiller gördüğünde basma.",
        "Yönergeden sonra 30 saniyelik bir deneme yapacaksın; asıl testteki gibi sırayla çeldirici yok, sessiz gif, sadece ses ve kombine bölümler kısa süreyle gelir. Bu deneme kaydedilmez.",
        "Unutma: Sadece mavi üçgeni her gördüğünde boşluk tuşuna en hızlı şekilde sadece bir kez basmalısın."
      ],
      briefExtra: "Hazırsan asıl teste başlayabilirsin.",
      briefEmphasis:
        "Unutma: Sadece mavi üçgeni her gördüğünde boşluk tuşuna en hızlı şekilde sadece bir kez basmalısın"
    }
  },
  report: {
    title: "Değerlendirme raporu",
    meta: "{{name}} · yaş {{age}} · {{profile}}",
    overall: "Genel",
    attention: "A — Dikkat",
    timing: "T — Zamanlama",
    impulsivity: "I — Dürtüsellik",
    hyperactivity: "H — Hiperaktivite",
    pdfDownload: "PDF indir",
    pdfSaveDownload: "PDF kaydet / indir",
    pdfFailed: "PDF işlemi başarısız. Lütfen tekrar deneyin.",
    pdfCreateFailed: "PDF oluşturulamadı."
  },
  admin: {
    title: "Yönetim",
    description:
      "Tüm kullanıcılar ve test sonuçları. Her oturum için test raporu ve basış raporu PDF indirilebilir.",
    superHint:
      "Super Admin: aşağıdaki tüm yönetici işlemleri + tabloda manuel kredi ve kullanıcı silme.",
    grantLabel: "Kullanıcıya kredi ver",
    amount: "Adet",
    add: "Ekle",
    creditAdded: "Kredi eklendi.",
    usersTitle: "Kullanıcılar ({{count}})",
    usersDescSuper:
      "Super Admin: rol, manuel kredi ve kullanıcı silme. Değişiklikler anında uygulanır.",
    usersDesc: "Rol ve yetki: listeden seçin; kayıt anında uygulanır.",
    name: "Ad",
    email: "E-posta",
    roleCol: "Rol / yetki",
    credits: "Kredi",
    roleUpdated: "{{name}} → {{role}} olarak güncellendi.",
    creditSaved: "{{name}} kredisi {{credits}} olarak kaydedildi.",
    invalidCredit: "Geçerli bir kredi değeri girin (0 veya üzeri).",
    deleteConfirm: "{{name}} ({{email}}) silinsin mi? Bu işlem geri alınamaz.",
    noEmail: "e-posta yok",
    userDeleted: "{{name}} silindi.",
    sessionsTitle: "Tüm testler ({{count}})",
    sessionsDesc:
      "Test bitince PDF'ler otomatik kaydedilir. Test raporu: katılımcı A/T/I/H. Basış raporu: yalnızca admin.",
    date: "Tarih",
    operator: "Uygulayan",
    participant: "Katılımcı",
    score: "Skor",
    record: "Kayıt",
    reports: "Raporlar",
    testSaved: "Test ✓",
    testPending: "Test …",
    pressSaved: " · Basış ✓",
    openTestReport: "Test raporu aç",
    downloadTestReport: "Test raporu indir",
    openPressReport: "Basış raporu aç",
    downloadPressReport: "Basış raporu indir",
    pressDetail: "Basış detayı",
    storedPdfFailed: "Kayıtlı PDF açılamadı.",
    testPdfFailed: "Test raporu PDF oluşturulamadı.",
    pressPdfFailed: "Basış raporu PDF oluşturulamadı."
  },
  pressTimeline: {
    title: "Basış zaman çizelgesi",
    emptyScreen: "Boş ekran",
    wrongSymbol: "Yanlış sembol",
    downloadTest: "Test raporu PDF",
    downloadPress: "Basış raporu PDF",
    generating: "Oluşturuluyor…",
    summary: "Özet",
    totalPresses: "Toplam basış",
    targetPresses: "Hedef basış",
    wrongPresses: "Yanlış basış",
    idlePresses: "Boş ekran basışı",
    multiPresses: "Çoklu basış",
    pressTable: "Basış tablosu",
    pressIndex: "#",
    time: "Zaman",
    trial: "Deneme",
    phase: "Faz",
    onScreen: "Ekranda",
    target: "Hedef?",
    wrong: "Yanlış?",
    pressInTrial: "Basış #",
    reactionMs: "RT (ms)",
    status: "Durum"
  },
  profiles: {
    child: "Çocuk (6–12)",
    teen: "Ergen (13–17)",
    adult: "Yetişkin (18+)"
  },
  roles: {
    super_admin: "Super Admin",
    admin: "Yönetici",
    psychologist: "Psikolog",
    individual: "Bireysel",
    descriptions: {
      super_admin:
        "Yöneticinin TÜM yetkileri (panel, tüm testler, kredi ekleme, rol atama, basış raporları) + manuel kredi, kullanıcı silme, Super Admin atama.",
      admin: "Yönetim paneli, tüm testler ve kullanıcılar, kredi ekleme, rol atama, basış raporları.",
      psychologist: "Test uygular, kendi panelinde kendi test kayıtlarını ve raporlarını görür.",
      individual: "Test uygular, kendi panelinde yalnızca kendi test kayıtlarını görür."
    },
    errors: {
      cannotChangeOwnRole: "Kendi rolünüzü bu ekrandan değiştiremezsiniz.",
      forbiddenSuperAdmin: "Super Admin rolünü yalnızca mevcut bir Super Admin atayabilir.",
      cannotDeleteSelf: "Kendi hesabınızı silemezsiniz.",
      deleteFailed: "Kullanıcı silinemedi. Supabase'te super-admin-fix-delete.sql dosyasını çalıştırın.",
      deleteFailedDetail: "Kullanıcı silinemedi: {{detail}}",
      permissionDenied: "RPC izni eksik. Supabase'te super-admin-fix-credits.sql dosyasını çalıştırın.",
      forbidden: "Bu işlem için yetkiniz yok.",
      userNotFound: "Kullanıcı bulunamadı.",
      generic: "İşlem başarısız."
    }
  },
  metrics: {
    insufficientData: "Yetersiz veri",
    attentionVeryGood: "Çok iyi",
    attentionGood: "İyi",
    attentionAverage: "Ortalama",
    attentionLow: "Düşük",
    attentionPoor: "Belirgin dikkat güçlüğü",
    impulseGood: "İyi dürtü kontrolü",
    impulseOk: "Kabul edilebilir",
    impulseMild: "Hafif dürtüsellik",
    impulseMarked: "Belirgin dürtüsellik",
    impulseSevere: "Şiddetli dürtüsellik",
    riskStrong: "Güçlü performans",
    riskNormal: "Normal / izlenebilir",
    riskAreas: "Riskli alanlar var",
    riskMarked: "Belirgin güçlük",
    riskHigh: "Yüksek risk",
    flagAttentionPoor: "Belirgin dikkat güçlüğü",
    flagAttentionLow: "Düşük dikkat performansı",
    flagTiming: "Zamanlama problemi (geç, acele veya değişken tepki)",
    flagRush: "Acele tepki (zamanlama)",
    flagVariability: "Yüksek tepki süresi varyabilitesi (zamanlama)",
    flagImpulseMarked: "Belirgin bilişsel dürtüsellik (yanlış simge)",
    flagImpulseMild: "Hafif bilişsel dürtüsellik",
    flagHyper: "Belirgin motor hiperaktivite",
    flagHyperMild: "Hafif motor hiperaktivite (mükerrer/yönerge dışı basış)",
    flagOmission: "Yüksek kaçırma oranı",
    flagFalseAlarm: "Yüksek yanlış basış (dürtüsellik)",
    flagMulti: "Mükerrer basış (hiperaktivite)",
    flagIdle: "Yönerge dışı basış / boş ekran (hiperaktivite)",
    summaryIntro: "Test {{trials}} deneme ile tamamlandı. Profil: {{profile}}.",
    summaryScores:
      "Genel skor {{overall}}/100 ({{risk}}). A-Dikkat {{attention}} ({{attentionText}}), T-Zamanlama {{timing}}, I-Dürtüsellik {{impulse}} ({{impulseText}}), H-Hiperaktivite {{hyper}}.",
    summaryBehavior:
      "Davranış özeti: isabet {{hits}}, kaçırma {{omissions}}, geç {{late}}, yanlış basış {{falseAlarms}}, çoklu {{multiPress}}, doğru ret {{correctRejects}}, boş ekran basışı {{idle}}.",
    summaryRt: "Referans RT {{refRt}} ms, ortalama doğru tepki {{avgRt}} ms.",
    summaryFlags: "Öne çıkanlar: {{flags}}.",
    summaryNoFlags: "Belirgin uyarı yok.",
    disclaimer: "Bu yazılım tanı koymaz; yalnızca ön değerlendirme içindir.",
    sustainWarmup: "Isınma / düzelme",
    sustainStable: "Değişiklik yok",
    sustainMild: "Hafif düşüş",
    sustainMarked: "Belirgin performans bozulması",
    validityMissingPhase: "Eksik faz: {{count}} rapor bölümünde veri yok",
    validityTooFast: "Aşırı hızlı tepkiler (olası rastgele basış)",
    validityFewTrials: "Beklenenden az deneme (test erken bitmiş olabilir)",
    validityScattered: "Dağınık yanıt paterni (yüksek kaçırma + yanlış basış)",
    validityNoOnTimeHits: "Hedefe hiç yanıt yok — sonuçlar güvenilir olmayabilir",
    validityLowEngagement: "Düşük katılım (hit oranı %15 altında)",
    validityHighLate: "Yüksek geç yanıt oranı — zamanlama (T) endeksi etkilenir",
    flagNoEngagement: "Yanıt verilmedi (teste katılım yok)",
    flagLate: "Yüksek geç yanıt oranı (zamanlama)",
    flagNoHits: "Hedefe yanıt yok (ihmal)"
  }
};
