/** Yeni pazarlama ana sayfası metinleri (TR). */
export const homePageTr = {
  nav: {
    home: "Ana Sayfa",
    about: "FocusProLab Nedir?",
    who: "Kimler İçin?",
    pros: "Uzmanlar İçin",
    centers: "Merkezler",
    faq: "Sık Sorulan Sorular",
    contact: "İletişim",
    login: "Giriş Yap"
  },
  hero: {
    title: "Dikkat, Dürtüsellik ve Performansın Objektif Değerlendirilmesi",
    subtitle:
      "FocusProLab; dikkat sürdürme, zamanlama, dürtü kontrolü ve motor performansı çok boyutlu ölçen dijital bir performans değerlendirme sistemidir.",
    ages: [
      { label: "Çocuklar (6–12 Yaş)", icon: "👶" },
      { label: "Ergenler (13–17 Yaş)", icon: "🎓" },
      { label: "Yetişkinler (18+)", icon: "💼" }
    ],
    ctaTest: "Bireysel Teste Başla",
    ctaExpert: "Uzmanla Test Planla",
    badges: [
      { icon: "⚡", label: "Anlık Sonuç" },
      { icon: "📄", label: "PDF Rapor" },
      { icon: "📅", label: "12 Haftalık Program" },
      { icon: "💬", label: "Uzman Yorumu" }
    ],
    mockProfile: "Performans Profili",
    mockReport: "PDF Rapor Önizleme",
    mockScore: "78/100",
    mockCaption: "Profesyonel ön değerlendirme"
  },
  metrics: {
    title: "FocusProLab Neleri Ölçer?",
    items: [
      { code: "A", label: "Dikkat", desc: "Hedef uyaranları fark etme ve görev boyunca odağı sürdürme", color: "a", to: "/olcum/dikkat" },
      { code: "T", label: "Zamanlama", desc: "Doğru zamanda ve tutarlı tepki verme", color: "t", to: "/olcum/zamanlama" },
      { code: "I", label: "Dürtüsellik", desc: "Hedef dışı uyaranlara gereksiz tepki kontrolü", color: "i", to: "/olcum/durtusellik" },
      { code: "H", label: "Hiperaktivite", desc: "Motor kontrol ve gereksiz tepki düzenleme", color: "h", to: "/olcum/hiperaktivite" }
    ]
  },
  audience: {
    title: "Size Uygun Seçeneği Seçin",
    cards: [
      {
        key: "adult",
        theme: "blue",
        icon: "💼",
        title: "Yetişkinim",
        text: "Kendi dikkat ve performans profilinizi keşfedin.",
        cta: "Teste Başla",
        to: "/kayit"
      },
      {
        key: "parent",
        theme: "teal",
        icon: "👨‍👩‍👧",
        title: "Ebeveynim",
        text: "Çocuğunuz için güvenli ve bilimsel değerlendirme.",
        cta: "Çocuk Testine Başla",
        to: "/kayit"
      },
      {
        key: "pro",
        theme: "purple",
        icon: "🩺",
        title: "Uzmanım",
        text: "Danışanlarınızı davet edin, raporları panelden yönetin.",
        cta: "Uzman Paneline Git",
        to: "/giris"
      }
    ]
  },
  products: {
    title: "Ürünlerimiz",
    items: [
      { icon: "🧠", title: "FocusProLab Testi", desc: "Çok aşamalı sürekli performans testi", to: "/urun/focusprolab-testi" },
      { icon: "📊", title: "PDF Rapor", desc: "Profesyonel ön değerlendirme raporu", to: "/urun/pdf-rapor" },
      { icon: "📅", title: "12 Haftalık Gelişim Programı", desc: "Yapılandırılmış takip planı", to: "/urun/gelisim-programi" },
      { icon: "💬", title: "Uzman Yorumu", desc: "Klinik bağlamda yorum desteği", to: "/urun/uzman-yorumu" },
      { icon: "🎥", title: "Uzman Görüşmesi", desc: "Bire bir online değerlendirme", to: "/urun/uzman-gorusmesi" }
    ],
    cta: "Detaylı Bilgi"
  },
  professionals: {
    title: "Uzmanlar İçin",
    items: ["Psikologlar", "Psikiyatristler", "PDR Uzmanları", "Özel Eğitim Merkezleri", "Hastaneler", "Okullar"],
    cta: "Kurumsal Başvuru",
    to: "/kurumsal-basvuru"
  },
  afterTest: {
    title: "Test Sonrası Neler Olur?",
    steps: [
      "Testi tamamlayın",
      "Sonuçlar analiz edilir",
      "PDF rapor oluşturulur",
      "Uzman panelinde görüntülenir",
      "Gelişim programı planlanabilir",
      "İsteğe bağlı uzman görüşmesi"
    ],
    cta: "Teste Başla"
  },
  faq: {
    title: "Sık Sorulan Sorular",
    items: [
      {
        q: "FocusProLab tanı koyar mı?",
        a: "Hayır. Sistem yalnızca performansa dayalı ön değerlendirme sağlar; tanı için klinik görüşme ve diğer veriler gerekir."
      },
      {
        q: "Test ne kadar sürer?",
        a: "Profil ve yaş grubuna göre yaklaşık 15–20 dakika sürer; öncesinde kısa bir deneme uygulaması vardır."
      },
      {
        q: "Sonuçları kim görür?",
        a: "Bireysel kullanımda sonuçlar yetkili uzman ve yönetici panelinde görüntülenir. Davet akışında katılımcı sonucu görmez."
      },
      {
        q: "Çocuklar için uygun mu?",
        a: "Evet. 6–12, 13–17 ve yetişkin profilleri için ayrı test senaryoları kullanılır."
      }
    ]
  },
  footer: {
    tag: "Dikkat ve sürekli performans değerlendirmesinde güvenilir dijital çözüm.",
    quickLinks: "Hızlı Linkler",
    legal: "Yasal",
    contactTitle: "İletişim",
    phone: "+90 (212) 000 00 00",
    email: "info@focusprolab.com",
    address: "İstanbul, Türkiye",
    follow: "Bizi Takip Edin",
    legalLinks: ["Gizlilik Politikası", "Kullanım Koşulları", "KVKK"],
    quickNav: [
      { label: "Ana Sayfa", href: "/" },
      { label: "FocusProLab Nedir?", href: "#nedir" },
      { label: "Kimler İçin?", href: "#kimler" },
      { label: "Uzmanlar İçin", href: "#uzmanlar" }
    ],
    copyright: "© {{year}} FocusProLab. Tüm hakları saklıdır."
  },
  productPages: {
    test: {
      back: "Ana sayfaya dön",
      title: "FocusProLab Performans Değerlendirme Sistemi",
      lead: "Dikkat Performansını Ölçmenin Ötesinde, Anlamaya ve Geliştirmeye Yönelik Yeni Nesil Dijital Değerlendirme Platformu",
      intro: [
        "FocusProLab; çocuk, ergen ve yetişkinlerde dikkat performansını çok boyutlu olarak değerlendirmek amacıyla geliştirilen, bilgisayar tabanlı dijital performans değerlendirme platformudur.",
        "Sistem; standartlaştırılmış dijital görevler aracılığıyla bireyin dikkat performansını oluşturan temel bilişsel süreçleri objektif performans verileriyle analiz eder. Geleneksel değerlendirme yaklaşımlarının aksine, yalnızca doğru ve yanlış cevap sayılarını değil; tepki örüntülerini, zamanlama becerisini, dürtü kontrolünü, motor davranışları ve çeldiriciler karşısındaki performansı birlikte değerlendirerek kişiye özgü ayrıntılı bir performans profili oluşturur.",
        "Bu yaklaşım sayesinde her bireyin güçlü yönleri ve gelişime açık alanları ayrı ayrı belirlenebilir; böylece değerlendirme süreci yalnızca sonuç odaklı değil, aynı zamanda gelişim odaklı bir yapıya dönüşür."
      ],
      areasTitle: "Değerlendirilen Performans Alanları",
      areas: [
        {
          code: "A",
          color: "a",
          label: "Dikkat",
          en: "Attention",
          points: ["Dikkati sürdürme", "Seçici dikkat", "Hedefe odaklanma", "Performans sürekliliği"]
        },
        {
          code: "T",
          color: "t",
          label: "Zamanlama",
          en: "Timing",
          points: ["Tepki süresi", "Tepki tutarlılığı", "Tempo kontrolü", "Doğru zamanda yanıt verme"]
        },
        {
          code: "I",
          color: "i",
          label: "Dürtüsellik",
          en: "Impulsivity",
          points: ["Tepki inhibisyonu", "Yanlış uyarana tepki verme eğilimi", "Karar verme kontrolü", "Davranışsal özdenetim"]
        },
        {
          code: "M",
          color: "m",
          label: "Motor Kontrol",
          en: "Motor Control",
          points: ["Gereksiz motor tepkiler", "Tekrarlayan davranış örüntüleri", "Motor inhibisyon", "Davranış kontrolü"]
        },
        {
          code: "Ç",
          color: "c",
          label: "Çeldirici Direnci",
          en: "Distractor Resistance",
          points: [
            "Görsel çeldiriciler altında performans",
            "İşitsel çeldiriciler altında performans",
            "Dikkati yeniden odaklayabilme",
            "Performansın çevresel uyaranlardan etkilenme düzeyi"
          ]
        }
      ],
      processTitle: "Test Süreci",
      process: [
        "Yaklaşık 13–15 dakika",
        "Tamamen dijital uygulama",
        "Standartlaştırılmış görev akışı",
        "Objektif performans analizi",
        "Güvenli veri altyapısı"
      ],
      processIcons: ["⏱️", "💻", "📊", "📈", "🔒"],
      afterTitle: "Test Sonrasında Sizi Neler Bekliyor?",
      afterLead: "Test tamamlandıktan sonra performans verileriniz analiz edilerek kişisel performans profiliniz oluşturulur.",
      afterHint: "İhtiyacınıza göre aşağıdaki hizmetlerden yararlanabilirsiniz:",
      services: [
        { icon: "📄", title: "Detaylı PDF Performans Raporu" },
        { icon: "🧠", title: "Klinik Psikolog Uzman Yorumu" },
        { icon: "📅", title: "12 Haftalık Kişiselleştirilmiş Gelişim Programı" },
        { icon: "💻", title: "Online Uzman Görüşmesi" }
      ],
      afterNote: "Tüm bu hizmetler isteğe bağlıdır ve kullanıcı kendi ihtiyaçlarına göre değerlendirme sürecini planlayabilir.",
      approachTitle: "FocusProLab Yaklaşımı",
      approach: [
        "FocusProLab, dikkat performansını yalnızca ölçen bir sistem değildir.",
        "Amacı; bireyin performansını objektif verilerle analiz etmek, güçlü ve gelişime açık yönlerini belirlemek ve gerektiğinde bilimsel temelli müdahale süreçlerine rehberlik etmektir.",
        "Performans değerlendirmesi, ayrıntılı raporlama, kişiselleştirilmiş gelişim programları ve uzman desteğini aynı platformda bir araya getirerek kullanıcıya bütüncül bir değerlendirme deneyimi sunar."
      ],
      noticeTitle: "Önemli Bilgilendirme",
      notice: [
        "FocusProLab tanı koyan veya klinik değerlendirme yerine geçen bir sistem değildir.",
        "Platformdan elde edilen performans verileri; klinik görüşme, psikolojik değerlendirme, gözlem ve diğer ölçme araçlarıyla birlikte ele alınması amacıyla geliştirilmiştir. Sonuçlar, uzmanların karar verme süreçlerini destekleyen objektif performans verileri sunar."
      ]
    },
    report: {
      back: "Ana sayfaya dön",
      kicker: "PDF Rapor",
      title: "Profesyonel Performans Raporu",
      lead: "Test tamamlandıktan sonra sistem sizin için ayrıntılı bir PDF oluşturur.",
      contentsTitle: "Raporda Neler Var?",
      contents: [
        { icon: "📈", title: "Genel Performans Puanı" },
        { icon: "📊", title: "A-T-I-H-C Profili" },
        { icon: "📉", title: "Güçlü Yönler" },
        { icon: "⚠️", title: "Geliştirilmesi Gereken Alanlar" },
        { icon: "📝", title: "Klinik yorum niteliğinde açıklamalar" },
        { icon: "🎯", title: "Kişiye özel öneriler" }
      ],
      deliveryTitle: "Teslim",
      delivery: "E-posta adresinize PDF olarak gönderilir.",
      audienceTitle: "Kimler İçin?",
      audience: [
        "Çocuk ve ergenlik dönemindekiler",
        "Yetişkin kullanıcılar",
        "Psikologlar",
        "Psikiyatristler",
        "Hastaneler",
        "Okullar",
        "İnsan kaynakları"
      ],
      cta: "Teste Başla"
    },
    program: {
      back: "Ana sayfaya dön",
      title: "12 Haftalık Gelişim Programı",
      lead: "Kişiye Özel Dijital Gelişim Sistemi",
      notes: ["Her kullanıcı aynı programı almaz.", "Program tamamen test sonuçlarınıza göre oluşturulur."],
      contentsTitle: "İçerik",
      contents: [
        "Günlük dijital egzersizler",
        "Yaşam görevleri",
        "Haftalık hedefler",
        "Gelişim grafikleri",
        "Tekrar testleri"
      ],
      goalTitle: "Amaç",
      goal: "Performansı düzenli olarak geliştirmek ve değişimi objektif verilerle takip etmek.",
      durationTitle: "Süre",
      duration: "12 Hafta",
      dailyTitle: "Günlük",
      daily: "20–25 dakika",
      cta: "12 Haftalık Program",
      trial: "Program Deneme aşamasındadır."
    },
    commentary: {
      back: "Ana sayfaya dön",
      title: "Uzman Yorumu",
      lead: "Sonuçlarınızı Bir Uzman Değerlendirsin",
      intro: "PDF raporunuzdaki veriler, alanındaki uzmanlar tarafından klinik açıdan yorumlanır.",
      includesTitle: "Bu Hizmette",
      includes: [
        "Test sonuçlarının açıklanması",
        "Güçlü yönlerin değerlendirilmesi",
        "Gelişim alanlarının belirlenmesi",
        "Günlük yaşama etkilerinin yorumlanması",
        "Size özel öneriler"
      ],
      note: "Bu hizmet tanı koyma amacı taşımaz. Klinik değerlendirmeyi destekleyici profesyonel geri bildirim sunar.",
      deliveryTitle: "Teslim Şekli",
      delivery: "Yazılı uzman değerlendirme raporu",
      cta: "Uzman Yorumu Talep Et"
    },
    consultation: {
      back: "Ana sayfaya dön",
      title: "Uzman Görüşmesi",
      lead: "Sonuçlarınızı Birlikte Değerlendirelim",
      intro: "Online bire bir görüşmede uzmanınız; test sonuçlarınızı, PDF raporunuzu ve ihtiyaçlarınızı birlikte değerlendirir.",
      sessionTitle: "Görüşmede",
      session: [
        { icon: "🧠", title: "Sonuçların ayrıntılı açıklanması" },
        { icon: "📊", title: "Performans profiliniz" },
        { icon: "🎯", title: "Gelişim hedefleri" },
        { icon: "📅", title: "Size özel çalışma planı" },
        { icon: "👨‍👩‍👧", title: "Veli bilgilendirmesi (çocuklarda)" }
      ],
      durationTitle: "Süre",
      duration: "50 dakika",
      formatTitle: "Görüşme",
      format: "Online (Zoom / Google Meet vb.)",
      outcomeTitle: "Sonunda",
      outcomes: ["Yol haritası", "Öneriler", "Sorularınıza cevap"],
      cta: "Randevu Al"
    }
  },
  corporate: {
    back: "Ana sayfaya dön",
    title: "Kurumsal Başvuru",
    lead: "FocusProLab İş Ortaklığı Programı",
    intro: [
      "FocusProLab, dikkat, dürtüsellik ve bilişsel performans değerlendirme sistemini kurumlara özel çözümlerle sunmaktadır.",
      "Kurumunuzda bilimsel temelli dijital değerlendirme ve raporlama sistemini kullanmak için başvurabilirsiniz."
    ],
    whoTitle: "Kimler Başvurabilir?",
    who: [
      "Psikoloji Merkezleri",
      "Psikiyatri Klinikleri",
      "PDR Merkezleri",
      "Özel Eğitim ve Rehabilitasyon Merkezleri",
      "Hastaneler",
      "Tıp Merkezleri",
      "Okullar",
      "Üniversiteler",
      "Belediyeler",
      "Kurumsal Firmalar"
    ],
    processTitle: "Başvuru Sonrası Süreç",
    process: [
      { title: "Ön Değerlendirme", text: "Kurumunuzun ihtiyaçları analiz edilir." },
      { title: "Online Tanıtım Toplantısı", text: "Sistemin tüm özellikleri detaylı olarak anlatılır." },
      { title: "Demo Hesabı", text: "Uzmanlarınız sistemi gerçek vakalar üzerinde deneyimleyebilir." },
      { title: "Eğitim ve Kurulum", text: "Tüm uzmanlara kullanım eğitimi verilir." },
      { title: "Kurumsal Aktivasyon", text: "Kurumunuza özel yönetim paneli açılır. Uzman hesapları oluşturulur. Test kullanımları başlatılır." }
    ],
    benefitsTitle: "Kurumlara Sağlanan Avantajlar",
    benefits: [
      "Bilimsel temelli dijital dikkat değerlendirmesi",
      "Otomatik PDF raporları",
      "Uzman yönetim paneli",
      "Hasta/danışan geçmişi",
      "Kuruma özel istatistikler",
      "Çoklu uzman desteği",
      "Bulut tabanlı güvenli sistem",
      "Sürekli teknik destek",
      "Eğitim ve güncelleme desteği"
    ],
    formTitle: "Başvuru Formu",
    fields: {
      org: "Kurum Adı",
      contact: "Yetkili Ad Soyad",
      role: "Görevi",
      phone: "Telefon",
      email: "E-posta",
      country: "Ülke",
      city: "Şehir",
      cityPlaceholder: "Şehir seçin",
      type: "Kurum Türü",
      typePlaceholder: "Kurum türü seçin",
      experts: "Uzman Sayısı",
      clients: "Aylık Tahmini Danışan Sayısı",
      message: "Mesajınız"
    },
    types: [
      "Psikolojik Danışmanlık Merkezleri",
      "Psikiyatri Kliniği",
      "Özel Sağlık Meslek Hizmet Birimleri",
      "Hastane",
      "Okul",
      "Özel Eğitim Merkezi",
      "Üniversite",
      "Kurumsal Firma",
      "Diğer"
    ],
    submit: "Başvuruyu Gönder",
    required: "Lütfen tüm zorunlu alanları doldurun.",
    success: "Başvurunuz alındı. En kısa sürede sizinle iletişime geçeceğiz.",
    saveError: "Başvuru kaydedilemedi. Lütfen kısa bir süre sonra yeniden deneyin."
  },
  metricPages: {
    back: "Ana sayfaya dön",
    items: {
      dikkat: {
        code: "A",
        color: "a",
        title: "Dikkat",
        en: "Attention",
        desc: "Hedef uyaranları fark etme ve görev boyunca odağı sürdürme",
        points: ["Dikkati sürdürme", "Seçici dikkat", "Hedefe odaklanma", "Performans sürekliliği"]
      },
      zamanlama: {
        code: "T",
        color: "t",
        title: "Zamanlama",
        en: "Timing",
        desc: "Doğru zamanda ve tutarlı tepki verme",
        points: ["Tepki süresi", "Tepki tutarlılığı", "Tempo kontrolü", "Doğru zamanda yanıt verme"]
      },
      durtusellik: {
        code: "I",
        color: "i",
        title: "Dürtüsellik",
        en: "Impulsivity",
        desc: "Hedef dışı uyaranlara gereksiz tepki kontrolü",
        points: ["Tepki inhibisyonu", "Yanlış uyarana tepki verme eğilimi", "Karar verme kontrolü", "Davranışsal özdenetim"]
      },
      hiperaktivite: {
        code: "H",
        color: "h",
        title: "Hiperaktivite",
        en: "Hyperactivity",
        desc: "Motor kontrol ve gereksiz tepki düzenleme",
        points: ["Gereksiz motor tepkiler", "Tekrarlayan davranış örüntüleri", "Motor inhibisyon", "Davranış kontrolü"]
      }
    }
  },
  sections: {
    about: "FocusProLab, gerçek yaşam koşullarını simüle eden çeldiriciler altında dikkat ve sürekli performansı objektif olarak ölçer.",
    centers: "Klinik merkezler, okullar ve kurumsal yapılar için toplu değerlendirme ve panel erişimi sunuyoruz.",
    contactLead: "Kurumsal başvuru ve iş birliği için bizimle iletişime geçin."
  }
};
