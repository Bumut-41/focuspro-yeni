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
    title: "FocusProLab Performans Değerlendirme Sistemi",
    lead:
      "Dikkat Performansını Ölçmenin Ötesinde, Anlamaya ve Geliştirmeye Yönelik Yeni Nesil Dijital Değerlendirme Platformu",
    paragraphs: [
      "FocusProLab; çocuk, ergen ve yetişkinlerde dikkat performansını çok boyutlu olarak değerlendirmek amacıyla geliştirilen, bilgisayar tabanlı dijital performans değerlendirme platformudur.",
      "Sistem; standartlaştırılmış dijital görevler aracılığıyla bireyin dikkat performansını oluşturan temel bilişsel süreçleri objektif performans verileriyle analiz eder. Geleneksel değerlendirme yaklaşımlarının aksine, yalnızca doğru ve yanlış cevap sayılarını değil; tepki örüntülerini, zamanlama becerisini, dürtü kontrolünü, motor davranışları ve çeldiriciler karşısındaki performansı birlikte değerlendirerek kişiye özgü ayrıntılı bir performans profili oluşturur.",
      "Bu yaklaşım sayesinde her bireyin güçlü yönleri ve gelişime açık alanları ayrı ayrı belirlenebilir; böylece değerlendirme süreci yalnızca sonuç odaklı değil, aynı zamanda gelişim odaklı bir yapıya dönüşür."
    ],
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
      {
        code: "A",
        label: "Dikkat",
        en: "Attention",
        color: "a",
        points: ["Dikkati sürdürme", "Seçici dikkat", "Hedefe odaklanma", "Performans sürekliliği"]
      },
      {
        code: "T",
        label: "Zamanlama",
        en: "Timing",
        color: "t",
        points: ["Tepki süresi", "Tepki tutarlılığı", "Tempo kontrolü", "Doğru zamanda yanıt verme"]
      },
      {
        code: "I",
        label: "Dürtüsellik",
        en: "Impulsivity",
        color: "i",
        points: ["Tepki inhibisyonu", "Yanlış uyarana tepki verme eğilimi", "Karar verme kontrolü", "Davranışsal özdenetim"]
      },
      {
        code: "M",
        label: "Motor Kontrol",
        en: "Motor Control",
        color: "m",
        points: ["Gereksiz motor tepkiler", "Tekrarlayan davranış örüntüleri", "Motor inhibisyon", "Davranış kontrolü"]
      },
      {
        code: "Ç",
        label: "Çeldirici Direnci",
        en: "Distractor Resistance",
        color: "c",
        points: [
          "Görsel çeldiriciler altında performans",
          "İşitsel çeldiriciler altında performans",
          "Dikkati yeniden odaklayabilme",
          "Performansın çevresel uyaranlardan etkilenme düzeyi"
        ]
      }
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
      { icon: "🧠", title: "FocusProLab Testi", desc: "Çok aşamalı sürekli performans testi" },
      { icon: "📊", title: "PDF Rapor", desc: "Profesyonel ön değerlendirme raporu" },
      { icon: "📅", title: "12 Haftalık Gelişim Programı", desc: "Yapılandırılmış takip planı" },
      { icon: "💬", title: "Uzman Yorumu", desc: "Klinik bağlamda yorum desteği" },
      { icon: "🎥", title: "Uzman Görüşmesi", desc: "Bire bir online değerlendirme" }
    ],
    cta: "Detaylı Bilgi"
  },
  professionals: {
    title: "Uzmanlar İçin",
    items: ["Psikologlar", "Psikiyatristler", "PDR Uzmanları", "Özel Eğitim Merkezleri", "Hastaneler", "Okullar"],
    cta: "Kurumsal Başvuru"
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
  sections: {
    about: "FocusProLab, gerçek yaşam koşullarını simüle eden çeldiriciler altında dikkat ve sürekli performansı objektif olarak ölçer.",
    centers: "Klinik merkezler, okullar ve kurumsal yapılar için toplu değerlendirme ve panel erişimi sunuyoruz.",
    contactLead: "Kurumsal başvuru ve iş birliği için bizimle iletişime geçin."
  }
};
