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
  home: {
    eyebrow: "FocusProLab · Sürekli performans testi",
    goToPanel: "Panele git",
    freeRegister: "Ücretsiz kayıt ol",
    loginBtn: "Giriş yap",
    trust: "Çok aşamalı çeldirici · FocusProLab ile güvenle uygulanır",
    liveMetric: "Canlı metrik",
    liveMetricValue: "Dikkat · Tepki · Çeldirici",
    statsTitle: "Sayılarla FocusProLab",
    statsLead: "Ölçüm kapasitesi ve raporlama özellikleri tek bakışta.",
    testimonialsTitle: "Uzmanlardan geri bildirimler",
    ctaTitle: "Hemen değerlendirmeye başlayın",
    ctaSub: "Üye olun, 30 saniyelik deneme ile arayüzü tanıyın veya tam teste geçin.",
    footerTag: "Sürekli performans ve dikkat değerlendirmesi",
    prevSlide: "Önceki slayt",
    nextSlide: "Sonraki slayt",
    slideSelect: "Slayt seçimi",
    slideN: "Slayt {{n}}",
    heroSlides: [
      {
        title: "Dikkat ve Sürekli Performansta Yeni Nesil Değerlendirme",
        text: "FocusProLab, dikkat ve yürütücü işlevleri çok aşamalı senaryolarla ölçer; klinik ve bireysel kullanım için objektif veri sunar."
      },
      {
        title: "Gerçek Hayatı Simüle Eden Çeldiriciler",
        text: "Sessiz görsel, yalnızca işitsel ve kombine çeldirici bölümleriyle performansın hangi koşullarda değiştiğini ayrıntılı raporlar."
      },
      {
        title: "Çocuk, Ergen ve Yetişkin Profilleri",
        text: "6–12 yaş çocuk, 13–17 ergen ve 18+ yetişkin için ayrı test süreleri, hız kademeleri ve normatif karşılaştırmalar."
      },
      {
        title: "Anında PDF Rapor ve Yönetim Paneli",
        text: "Test bitince otomatik rapor; psikolog ve yöneticiler için panel, basış çizelgesi ve merkezi kullanıcı yönetimi."
      },
      {
        title: "DEHB Sürecinde Objektif Destek",
        text: "Tanı ve takip süreçlerinde uzmanlara yardımcı ölçüm; danışan ve aileyle paylaşılabilir görsel raporlar."
      }
    ],
    features: [
      {
        title: "Çocuklar için dikkat değerlendirmesi",
        text: "13 dakikalık yaş uyumlu senaryo; görsel ve işitsel çeldiricilerle dikkat profili."
      },
      {
        title: "Yetişkinler ve ergenler",
        text: "15 dakikalık test; hız rampası ve çoklu çeldirici bloklarıyla ayrıntılı performans analizi."
      },
      {
        title: "Uzman ve yönetici paneli",
        text: "Tüm testler, basış raporları, rol yönetimi ve Super Admin araçları tek merkezden."
      },
      {
        title: "Hızlı ve güvenilir sonuç",
        text: "Oturum sonunda metrikler, faz grafikleri ve indirilebilir PDF — ek işlem gerekmez."
      }
    ],
    stats: [
      { value: "3", label: "Yaş profili", suffix: "" },
      { value: "5", label: "Çeldirici senaryo bloğu", suffix: "+" },
      { value: "20", label: "Dakikaya kadar test", suffix: "+" },
      { value: "1", label: "Tıkla PDF rapor", suffix: "" }
    ],
    testimonials: [
      {
        quote:
          "Görsel ve işitsel çeldiriciler altında performansın nasıl değiştiğini tek raporda görmek seans planlamasını kolaylaştırıyor.",
        role: "Klinik psikolog"
      },
      {
        quote:
          "Danışanımla grafiği ilk görüşmede paylaşmak güven ilişkisini güçlendiriyor; aileler somut veriyi daha iyi anlıyor.",
        role: "Psikolojik danışman"
      },
      {
        quote: "Basış zaman çizelgesi ve faz metrikleri, gözlemden çıkan ipuçlarını sayısallaştırmamı sağlıyor.",
        role: "Nöropsikolog"
      },
      {
        quote: "Çevrimiçi uygulama sayesinde merkez içi bekleme olmadan testi tamamlayıp arşive alabiliyoruz.",
        role: "Uygulayıcı uzman"
      }
    ]
  },
  dashboard: {
    welcome: "Hoş geldiniz, {{name}}",
    description: "Dikkat ve sürekli performans değerlendirmelerinizi buradan yönetin.",
    pdfAutoSave: "Test bittiğinde rapor PDF otomatik kaydedilir ve aşağıdaki listeden açılabilir.",
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
    openReport: "Raporu aç",
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
    stepGuide: "Adım 3 / 5 · Yönerge",
    stepSpace: "Adım 1 / 5 · Tuş kontrolü",
    stepAudio: "Adım 2 / 5 · Ses kontrolü",
    stepMain: "Adım 5 / 5 · Asıl test",
    spaceTitle: "Önce SPACE tuşunu deneyelim",
    spaceSub: "SPACE tuşuna bir kez basın veya dokunun.",
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
    qaHint:
      "Geçici mod: yalnızca sessiz gif ve sessiz+sesli gif bölümleri (~6 dk). Sadece ses, temel ve kapanış kapalı.",
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
    hyperactivity: "H — Hiper-reaktivite",
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
    flagTiming: "Zamanlama / yavaş tepki",
    flagImpulseMarked: "Belirgin dürtüsellik",
    flagImpulseMild: "Hafif dürtüsellik",
    flagHyper: "Belirgin hiperaktivite göstergesi",
    flagOmission: "Yüksek kaçırma oranı",
    flagFalseAlarm: "Yüksek yanlış basış oranı",
    flagMulti: "Çoklu basma",
    flagIdle: "Boş ekranda basış",
    summaryIntro: "Test {{trials}} deneme ile tamamlandı. Profil: {{profile}}.",
    summaryScores:
      "Genel skor {{overall}}/100 ({{risk}}). A-Dikkat {{attention}} ({{attentionText}}), T-Zamanlama {{timing}}, I-Dürtüsellik {{impulse}} ({{impulseText}}), H-Hiper-reaktivite {{hyper}}.",
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
    validityNoOnTimeHits: "Zamanında hedef isabeti yok — sonuçlar güvenilir olmayabilir",
    validityLowEngagement: "Düşük katılım (hit oranı %15 altında)",
    validityHighLate: "Yüksek geç yanıt oranı — dikkat skoru düşürüldü",
    flagNoEngagement: "Yanıt verilmedi (teste katılım yok)",
    flagLate: "Yüksek geç yanıt oranı",
    flagNoHits: "Zamanında hedef isabeti yok"
  }
};
