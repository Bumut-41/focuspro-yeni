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
      { code: "A", label: "Dikkat", desc: "Hedef uyaranları fark etme ve görev boyunca odağı sürdürme", color: "a" },
      { code: "T", label: "Zamanlama", desc: "Doğru zamanda ve tutarlı tepki verme", color: "t" },
      { code: "I", label: "Dürtüsellik", desc: "Hedef dışı uyaranlara gereksiz tepki kontrolü", color: "i" },
      { code: "H", label: "Hiperaktivite", desc: "Motor kontrol ve gereksiz tepki düzenleme", color: "h" }
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
