import { reportPdfIt } from "./reportPdfIt.js";

/** PDF raporu ve klinik anlatım metinleri (TR / EN / IT). */
export const reportPdfStrings = {
  tr: {
    coverSubtitle: "Sürekli Performans ve Dikkat Değerlendirme Raporu",
    footer: "FocusProLab",
    pageLabel: "Sayfa",
    chartSuffix: " — Grafik",
    perfLevel: "Performans düzeyi",
    severity: "Şiddet",
    participantInfo: "Katılımcı Bilgileri",
    fullName: "Ad Soyad",
    age: "Yaş",
    gender: "Cinsiyet",
    evalDate: "Değerlendirme Tarihi",
    profile: "Profil",
    testDuration: "Test Süresi",
    testDurationUnit: "Dakika",
    totalTrials: "Toplam Deneme",
    testValidity: "Test Geçerliliği",
    validityIndex: "Geçerlilik Endeksi",
    generalResult: "Genel Sonuç",
    lowReliabilityWarnings: "Düşük güvenilirlik uyarıları",
    consistencyWarnings: "Performans tutarlılığı",
    howToReadTitle: "Bu raporu nasıl okumalı?",
    guide: {
      title: "Bu raporu nasıl okumalı?",
      intro:
        "Bu rapor, sürekli performans testindeki basış ve tepki sürelerinden üretilir. Aşağıdaki sıra okumayı kolaylaştırır:",
      steps: [
        "1) Test geçerliliği — Verinin güvenilir olup olmadığını gösterir. Düşükse skorlar temkinli yorumlanmalıdır.",
        "2) Genel skor (0–100) — Dört endeksin ağırlıklı ortalamasıdır: Dikkat %30, Zamanlama %25, Dürtüsellik %30, Motor kontrol %15.",
        "3) A / T / I / H endeksleri — Her alan ayrı ölçülür. Yüksek skor daha iyi performansı (daha az hata / daha iyi kontrol) ifade eder.",
        "4) Çeldirici ve sürdürülebilirlik — Ortam dağıtıcıları ve test sonuna doğru yorgunluk etkisini gösterir.",
        "5) Norm karşılaştırma — Skorun aynı yaş grubu referansına göre nerede durduğunu (Z puanı) gösterir.",
        "Önemli: Bu değerlendirme tanı koymaz; klinik görüşme ve diğer verilerle birlikte yorumlanmalıdır."
      ]
    },
    validityIntro:
      "Geçerlilik endeksi, katılımcının göreve yeterince katılıp katılmadığını, tepki sürelerinin fizyolojik olarak anlamlı olup olmadığını ve yanıt örüntüsünün tutarlılığını kontrol eder. 90–100 aralığı genellikle yorum için uygundur.",
    overallExplainTitle: "Genel skor nasıl hesaplanır?",
    overallExplain:
      "Genel = (A × 0,30) + (T × 0,25) + (I × 0,30) + (H × 0,15). Bu oturum: ({{A}} × 0,30) + ({{T}} × 0,25) + ({{I}} × 0,30) + ({{H}} × 0,15) = {{overall}}.",
    scoreScaleTitle: "Skor bantları (0–100)",
    scoreScale:
      "90–100 Çok güçlü · 80–89 Güçlü · 70–79 Orta · 60–69 Düşük · 60 altı Belirgin güçlük. Dürtüsellik ve hiperaktivitede yüksek skor = daha iyi kontrol (daha az gereksiz tepki).",
    howCalculatedLabel: "Nasıl hesaplanır?",
    meaningLabel: "Ne anlama gelir?",
    executiveSummary: "Yönetici Özeti",
    overallScore: "Genel Performans Skoru",
    riskLevel: "Risk Düzeyi",
    strengths: "Güçlü Alanlar",
    weaknesses: "Gelişim Alanları",
    noStrengths: "—",
    noWeaknesses: "Belirgin gelişim alanı yok",
    clinicalFlags: "Klinik Bayraklar",
    shortComment: "Kısa Yorum",
    mainIndexes: "Ana Performans Endeksleri",
    mainIndexesIntro:
      "Aşağıdaki dört endeks birbirinden bağımsız hesaplanır. Bir alandaki düşük skor diğer alanları otomatik düşürmez; profil dağılımı klinik yorum için önemlidir.",
    commentLabel: "Yorum",
    distractorAnalysis: "Çeldirici Analizi",
    distractorIntro:
      "Testin ortasında görsel, işitsel veya birleşik dikkat dağıtıcılar sunulur. Temel (sessiz) bölüme göre puan düşüşü azsa performans korunmuş sayılır; belirgin düşüş, çevresel uyaranlara hassasiyeti düşündürür.",
    distractorGeneral: "Genel Sonuç",
    sustainability: "Sürdürülebilir Dikkat Analizi",
    sustainabilityIntro:
      "Testin ilk bölümlerindeki genel performans ile son bölümler karşılaştırılır. Belirgin düşüş, dikkat yorgunluğu veya sürdürülebilirlikte zorlanma işareti olabilir.",
    startPerf: "Başlangıç Performansı",
    endPerf: "Kapanış Performansı",
    change: "Değişim",
    points: "puan",
    rawPsych: "Ham Psikometrik Göstergeler",
    professionalTitle: "Profesyonel ön değerlendirme",
    technicalAppendix: "Teknik Ek — Faz ve Norm",
    distractorTechnical: "Çeldirici etkisi (teknik)",
    phasePerformance: "Faz bazlı performans",
    section: "Bölüm",
    comment: "Yorum",
    measurement: "Ölçüm",
    value: "Değer",
    disclaimer:
      "FocusProLab değerlendirmesi tanı koymaz. Sonuçlar yalnızca nitelikli profesyoneller tarafından, klinik görüşme ve diğer verilerle birlikte yorumlanmalıdır.",
    timingFormula:
      "T = (Zİ {{onTime}}×0.40) + (RT {{rtSpeed}}×0.25) + (Geç {{late}}×0.20) + (Stab. {{stability}}×0.15) = {{total}}",
    chartAttention: "Dikkat (A)",
    chartTiming: "Zamanlama (T)",
    chartImpulsivity: "Dürtüsellik (I)",
    chartHyperactivity: "Hiperaktivite (H)",
    chartRadar: "Performans Profili",
    chartRadarSubtitle: "Aynı toplam puan, alanların dağılımına göre farklı bir profil anlamına gelir.",
    chartCombined: "Dört İndeks — Faz Grafiği",
    chartCombinedTitle: "Dört İndeks Genelinde Performans",
    invalidTitle: "TEST GEÇERSİZ",
    invalidCritical: "Kritik bulgular",
    invalidNoReport: "Bu oturum için performans raporu üretilmemiştir. Sonuçlar klinik yorum için kullanılmamalıdır.",
    normComparison: "Norm Karşılaştırma",
    normIntro:
      "Z puanı, katılımcının skorunu aynı yaş profilindeki referans ortalamayla karşılaştırır. Z ≥ 1,0 referansın üzerinde; 0–0,99 standart bandında; negatif değerler referansın altında performans anlamına gelir. Bu tablo tanı değil, göreli konum bilgisidir.",
    indexCol: "İndeks",
    scoreCol: "Skor",
    normLevelCol: "Norm seviye",
    interpretationCol: "Yorum",
    targetObject: "Hedef nesne",
    validity: {
      bands: {
        invalid: "Geçersiz",
        low: "Düşük güvenilirlik",
        caution: "Dikkatli yorumlanmalı",
        acceptable: "Kabul edilebilir",
        valid: "Geçerli"
      },
      l1_avgRt: "Ortalama tepki süresi 150 ms altında (fizyolojik olarak şüpheli).",
      l1_fastRate: "Tepkilerin %{{rate}}'i 150 ms altında (şüpheli hız).",
      l1_omission: "İhmal oranı %{{rate}} (göreve katılım çok düşük).",
      l1_rtSdLow: "RT standart sapması {{sd}} ms (robotik performans olasılığı).",
      l1_multi: "Çoklu basış oranı %{{rate}} (yönergeye uyumsuzluk).",
      l2_omission: "İhmal oranı %{{rate}} (düşük güvenilirlik aralığı).",
      l2_commission: "Commission oranı %{{rate}} (yüksek hedef dışı tepki).",
      l2_rtSdHigh: "RT standart sapması {{sd}} ms (aşırı değişkenlik).",
      l2_multi: "Çoklu basış oranı %{{rate}}.",
      l3_attention: "Dikkat (A) fazlar arası düşüş: başlangıç {{start}}, kapanış {{end}} (fark {{delta}} puan).",
      l3_rt: "RT değişimi: başlangıç {{start}} ms, kapanış {{end}} ms (+{{delta}} ms).",
      check_coopOk: "Göreve katılım yeterli",
      check_coopLow: "Göreve katılım sınırlı",
      check_rtOk: "Tepki süreleri beklenen aralıkta",
      check_rtBad: "Tepki süreleri şüpheli veya aşırı değişken",
      check_patternOk: "Yanıt örüntüsü tutarlı",
      check_patternBad: "Yanıt örüntüsü tutarsız",
      check_clinicalOk: "Sonuçlar klinik yorumlama için uygundur",
      check_caution: "Sonuçlar dikkatli yorumlanmalıdır",
      check_invalid: "Sonuçlar yorumlanmamalıdır",
      summary_invalid: "TEST GEÇERSİZ — Kritik geçersizlik bulguları nedeniyle rapor klinik yorum için uygun değildir.",
      summary_valid: "Test sonuçları geçerli kabul edilmiş ve yorumlamaya uygun bulunmuştur.",
      summary_acceptable: "Test sonuçları kabul edilebilir düzeydedir; bazı faktörler yorumu etkileyebilir.",
      summary_caution: "Sonuçlar yorumlanabilir ancak test performansını etkileyebilecek faktörler gözlenmiştir.",
      summary_low: "Düşük güvenilirlik — sonuçlar dikkatli ve destekleyici verilerle birlikte yorumlanmalıdır."
    },
    levels: {
      veryGood: "Çok Güçlü",
      good: "Güçlü",
      average: "Orta",
      low: "Düşük",
      poor: "Belirgin Güçlük"
    },
    strengths: {
      attention: "Dikkat Sürdürme",
      timing: "Zamanlama",
      impulse: "Dürtü Kontrolü",
      motor: "Motor Kontrol"
    },
    flags: {
      invalid: "Test geçersiz — sonuçlar yorumlanmamalıdır",
      impulse: "Dürtüsellik Eğilimi",
      distractor: "Çeldirici Hassasiyeti",
      sustainability: "Dikkat Sürekliliğinde Düşüş",
      poor: "Belirgin Performans Güçlüğü",
      none: "Bayrak Yok"
    },
    distractor: {
      visual: "Görsel Çeldiriciler",
      auditory: "İşitsel Çeldiriciler",
      combined: "Kombine Çeldiriciler",
      noData: "Veri yok",
      noDataComment: "Bu koşulda yeterli deneme bulunmamaktadır.",
      preserved: "Performans Korundu",
      mild: "Hafif Etkilenme",
      moderate: "Orta Düzeyde Etkilenme",
      marked: "Belirgin Etkilenme",
      visualOk: "Katılımcının görsel dikkat dağıtıcılardan belirgin şekilde etkilenmediği görülmüştür.",
      auditoryOk: "İşitsel uyaranlar sırasında performansta anlamlı düşüş gözlenmemiştir.",
      combinedOk: "Görsel ve işitsel çeldiricilerin birlikte sunulduğu koşullarda performans genel olarak korunmuştur.",
      mildComment: "{{title}} altında performansta hafif düzeyde düşüş izlenmiştir.",
      moderateComment: "{{title}} altında dikkat performansında belirgin etkilenme gözlenmiştir.",
      markedComment: "{{title}} altında performans belirgin şekilde düşmüştür.",
      generalAffected: "Katılımcı bazı çeldirici koşullarda performans kaybı göstermiştir.",
      generalOk: "Katılımcının çevresel dikkat dağıtıcılara karşı performansı korunmuştur."
    },
    sustainability: {
      noData: "Yeterli faz verisi bulunmamaktadır.",
      stable: "Test süresince performans büyük ölçüde korunmuştur. Belirgin dikkat yorgunluğu veya performans çöküşü izlenmemiştir.",
      mild: "Test sonuna doğru hafif düzeyde performans düşüşü gözlenmiştir.",
      marked: "Test sonuna doğru belirgin performans düşüşü izlenmiştir; sürdürülebilir dikkat alanı değerlendirilmelidir."
    },
    executive: {
      line1ok: "Katılımcının dikkat performansı genel olarak yeterli düzeydedir.",
      line1low: "Katılımcının dikkat performansında performans zorluğu gözlenmiştir.",
      line2ok: "Hedef uyaranları büyük ölçüde doğru şekilde ayırt edebilmiş ve görev boyunca dikkatini sürdürebilmiştir.",
      line2mixed: "Dikkatini görev boyunca sürdürebilmiş olmakla birlikte {{parts}} gözlenmiştir.",
      timingIssue: "tepki zamanlamasında hafif değişkenlik",
      impulseIssue: "dürtü kontrolünde izlenebilir düzeyde zorlanma",
      impulseIssueStrong: "belirgin dürtü kontrolü güçlüğü",
      line3ok: "Çeldirici koşullarda belirgin performans kaybı izlenmemiştir.",
      line3bad: "Çeldirici koşullarda performansın kısmen etkilendiği görülmektedir."
    },
    indexes: {
      attention: {
        title: "A — DİKKAT",
        definition:
          "Hedef uyaranları fark etme ve görev boyunca odağı sürdürme. Yalnızca ihmal (hedef varken basmama) bu endeksi düşürür; yanlış basış I’ye, geç tepki T’ye yazılır.",
        howCalculated: "A = 100 − (ihmal / hedef sayısı × 100). Bu oturumda A = {{score}}/100.",
        meaning:
          "Yüksek A: hedefleri kaçırmadan sürdürülebilir dikkat. Düşük A: hedef uyaranları sık kaçırma / dikkat sürdürmede zorlanma.",
        c90: "Katılımcı hedef uyaranları fark etme ve görev boyunca odağını sürdürme konusunda güçlü bir performans göstermiştir. Test süresince dikkat performansı genel olarak korunmuştur.",
        c80: "Katılımcı hedef uyaranların büyük bölümünü doğru şekilde ayırt etmiş ve görev boyunca dikkatini sürdürebilmiştir. Belirgin dikkat güçlüğü izlenmemiştir.",
        c70: "Katılımcı görev boyunca genel olarak dikkatini koruyabilmiştir. Bununla birlikte bazı bölümlerde hedef uyaranların kaçırıldığı görülmüştür.",
        c60: "Görev süresince hedef uyaranları fark etme ve dikkatini sürdürme alanlarında zorlanmalar gözlenmiştir. Performansta dönemsel düşüşler izlenmiştir.",
        cLow: "Test boyunca hedef uyaranların önemli bir bölümünün kaçırıldığı görülmüştür. Bulgular dikkat sürdürme alanında belirgin güçlük yaşandığını düşündürmektedir."
      },
      timing: {
        title: "T — ZAMANLAMA",
        definition:
          "Hedefe uygun hızda ve tutarlı tepki. Zamanında isabet, tepki hızı (yaşa göre referans), geç yanıt oranı ve RT stabilitesi birlikte değerlendirilir.",
        howCalculated:
          "T = (zamanında isabet×0,40) + (RT hızı×0,25) + (geç yanıt×0,20) + (RT stabilitesi×0,15). Bu oturum: ({{onTime}}×0,40)+({{rtSpeed}}×0,25)+({{late}}×0,20)+({{stability}}×0,15) = {{score}}.",
        meaning:
          "Yüksek T: hızlı, zamanında ve tutarlı tepkiler. Düşük T: gecikmeli, aceleci veya değişken tepki süreleri.",
        c90: "Katılımcı hedef uyaranlara hızlı, tutarlı ve uygun zamanda tepki vermiştir. Tepki hızında belirgin dalgalanma gözlenmemiştir.",
        c80: "Hedef uyaranlara verilen tepkiler genel olarak zamanında ve tutarlı bulunmuştur.",
        c70: "Tepki hızında zaman zaman değişkenlik gözlenmiş olmakla birlikte genel performans korunmuştur.",
        c60: "Hedef uyaranlara verilen tepkilerde gecikmeler ve zamanlama tutarsızlıkları izlenmiştir.",
        cLow: "Görev boyunca tepki zamanlamasında belirgin düzensizlikler ve gecikmeler gözlenmiştir."
      },
      impulsivity: {
        title: "I — DÜRTÜSELLİK",
        definition:
          "Hedef dışı uyaranlara verilen gereksiz ilk tepkiler (commission). Mükerrer basışlar bu endekste değildir; motor kontrol H’de değerlendirilir.",
        howCalculated:
          "I = 100 − (commission oranı × 5). Commission oranı = hedef dışıya basış / hedef dışı deneme. Bu oturumda I = {{score}}/100.",
        meaning:
          "Yüksek I: iyi dürtü kontrolü (az gereksiz basış). Düşük I: hedef dışı uyarana sık tepki / dürtüsel yanıt eğilimi.",
        c90: "Katılımcı hedef dışı uyaranlara karşı tepki kontrolünü etkili şekilde sürdürebilmiştir.",
        c80: "Görev boyunca gereksiz tepki verme eğilimi düşük düzeyde kalmıştır.",
        c70: "Hedef dışı uyaranlara zaman zaman gereksiz tepkiler verilmiştir.",
        c60: "Görev sırasında hedef dışı uyaranlara yönelik gereksiz tepkilerde artış gözlenmiştir.",
        cLow: "Hedef dışı uyaranlara sık tepki verilmesi, dürtü kontrolünde belirgin zorlanmaya işaret etmektedir."
      },
      hyperactivity: {
        title: "H — HİPERAKTİVİTE",
        definition:
          "Motor tepkiyi durdurma: aynı denemede mükerrer basış ve boş ekran / yönerge dışı basışlar. Doğru veya yanlış simge ayrımı bu endekste yapılmaz.",
        howCalculated:
          "H, mükerrer basış oranı ve yönerge dışı (boş ekran) basışlardan hesaplanır; gereksiz motor olay arttıkça skor düşer. Bu oturumda H = {{score}}/100.",
        meaning:
          "Yüksek H: kontrollü, sakin motor yanıt. Düşük H: tekrarlayan veya görev dışı basışlarla motor kontrol güçlüğü.",
        c90: "Katılımcı motor tepkilerini kontrollü şekilde sürdürmüş ve gereksiz tuş kullanımı göstermemiştir.",
        c80: "Motor kontrol performansı genel olarak korunmuştur.",
        c70: "Zaman zaman gereksiz veya tekrarlayıcı tepkiler gözlenmiştir.",
        c60: "Görev boyunca mükerrer ve gereksiz tepkilerde artış izlenmiştir.",
        cLow: "Motor tepkileri düzenleme alanında belirgin güçlük gözlenmiştir. Görev sırasında sık tekrarlayıcı ve yönerge dışı tepkiler verilmiştir."
      }
    },
    generalComments: {
      profile1:
        "Katılımcı test boyunca dikkatini sürdürme, tepki zamanlaması ve motor kontrol alanlarında güçlü bir performans göstermiştir. Hedef dışı uyaranlara verilen tepkiler sınırlı düzeyde kalmıştır. Genel performansın görev boyunca korunduğu görülmektedir.",
      profile2:
        "Dikkat performansı genel olarak korunmuş olmakla birlikte tepki zamanlamasında değişkenlikler gözlenmiştir. Bulgular, hedef uyaranların fark edilmesinden çok uygun zamanda yanıt verme sürecinde zorlanmalar olabileceğini düşündürmektedir.",
      profile3:
        "Katılımcı dikkatini sürdürme ve zamanında tepki verme alanlarında yeterli performans göstermiştir. Bununla birlikte hedef dışı uyaranlara yönelik gereksiz tepkilerde artış gözlenmiş olup dürtü kontrolü alanında zorlanmalar olabileceğini düşündürmektedir.",
      partStrongCore:
        "Katılımcı test boyunca dikkatini sürdürme, tepki zamanlaması ve motor kontrol alanlarında güçlü bir performans göstermiştir.",
      partAttOk: "Dikkat performansı genel olarak yeterli düzeydedir.",
      partAttMid: "Dikkat performansında zaman zaman dalgalanmalar izlenmiştir.",
      partAttLow: "Dikkat sürdürme alanında belirgin zorlanmalar gözlenmiştir.",
      partTimMid: "Tepki zamanlamasında değişkenlikler gözlenmiştir.",
      partTimLow: "Tepki zamanlamasında belirgin zorlanmalar izlenmiştir.",
      partImpMid: "Hedef dışı uyaranlara yönelik gereksiz tepkilerde zaman zaman artış gözlenmiştir.",
      partImpLow: "Dürtü kontrolü alanında belirgin zorlanmalar olabileceğini düşündürmektedir.",
      partHypLow: "Motor kontrol alanında zorlanmalar izlenmiştir.",
      partDistractorOk: "Çeldirici koşullarda performans genel olarak korunmuştur.",
      partDistractor: "Çeldirici koşullarda performansın kısmen etkilendiği görülmektedir."
    },
    professional: {
      invalid1: "Bu test oturumu geçerlilik kriterlerini karşılamamaktadır.",
      invalid2: "Kritik geçersizlik bulguları nedeniyle performans skorları klinik yorum için kullanılmamalıdır.",
      invalid3: "Gerekirse test tekrar uygulanmalı ve katılımcının göreve katılım koşulları gözden geçirilmelidir.",
      coop: "Katılımcı değerlendirme boyunca yeterli işbirliği göstermiştir.",
      attOk: "Dikkat sürdürme performansı genel olarak yeterli düzeydedir. Hedef uyaranları ayırt etme ve görevi sürdürme becerilerinde belirgin güçlük gözlenmemiştir.",
      attC70: "Dikkat performansı genel olarak yeterli düzeydedir; bazı bölümlerde kısa süreli dalgalanmalar izlenebilir.",
      attC60: "Dikkat sürdürme alanında orta düzeyde zorlanma gözlenmiştir; ihmal örüntüleri izlenmelidir.",
      attLow: "Dikkat sürdürme performansında belirgin performans zorluğu gözlenmiştir. İhmal örüntüleri dikkatle değerlendirilmelidir.",
      timOk: "Zamanlama performansı genel olarak yeterli düzeydedir.",
      timC70: "Tepki hızında hafif düzeyde değişkenlik gözlenmiştir; zaman zaman gecikmiş yanıtlar oluşmuştur.",
      timC60: "Zamanlama performansında orta düzeyde dalgalanma izlenmiştir; geç veya acele yanıtlar izlenmelidir.",
      timLow: "Tepki zamanlamasında belirgin performans zorluğu gözlenmiştir; geç yanıt veya aşırı değişkenlik takip edilmelidir.",
      impOk: "Dürtüsellik göstergeleri kabul edilebilir düzeydedir. Hedef dışı uyaranlara verilen tepkiler sınırlı düzeyde kalmıştır.",
      impC70: "Dürtü kontrolü kabul edilebilir düzeydedir; bazı bölümlerde hedef dışı uyaranlara aceleci tepkiler gözlenmiştir.",
      impC60: "Hafif dürtüsellik göstergeleri izlenmiştir; commission hataları izlenmelidir.",
      impLow: "Belirgin dürtüsellik örüntüsü gözlenmiştir; hedef dışı uyaranlara sık tepki verilmiştir. Bu alanın geliştirilmesi gerekir.",
      hypOk: "Motor kontrol performansı genel olarak yeterli düzeydedir.",
      hypC70: "Motor kontrol genel olarak yeterlidir; ara sıra mükerrer basışlar izlenebilir.",
      hypC60: "Hafif motor hiperaktivite göstergeleri (mükerrer veya boş ekran basışı) gözlenmiştir; izlenmelidir.",
      hypLow: "Motor kontrol alanında belirgin performans zorluğu gözlenmiştir; mükerrer veya yönerge dışı basışlar takip edilmelidir.",
      distOk: "Çeldirici koşullarda performans genel olarak korunmuştur.",
      distLow: "Çeldiriciler altında performansın kısmen etkilendiği görülmektedir.",
      sustNote: "Test süresince sürdürülebilir dikkat analizi: {{label}}.",
      disclaimer:
        "Test bulguları tek başına tanısal yorum amacıyla kullanılmamalı; klinik görüşme, gözlem ve diğer değerlendirme araçlarıyla birlikte ele alınmalıdır."
    },
    metrics: {
      accuracy: "Genel Doğruluk",
      hitRate: "Hedef Tepki Oranı",
      omissionRate: "İhmal Oranı",
      commissionRate: "Hedef Dışı Tepki Oranı",
      lateRate: "Geç Yanıt Oranı",
      multiRate: "Çoklu Basış Oranı",
      avgRt: "Ortalama Tepki Süresi",
      rtSd: "RT Standart Sapma",
      dPrime: "d-prime (d′)",
      beta: "Beta (β)",
      criterion: "Criterion (c)",
      validityIndex: "Geçerlilik Endeksi"
    },
    technical: {
      axisLabels: {
        temel1: "Temel-1",
        gorsel: "Görsel",
        isitsel: "İşitsel",
        kombine: "Kombine",
        temel2: "Temel-2"
      },
      chartLabels: {
        normLow: "Norm alt",
        normBand: "Norm aralığı",
        normRef: "Normatif referans",
        participant: "Katılımcı"
      },
      phaseLegend: [
        ["Temel - 1 (Baz)", "Temel bölüm — hedef odaklı sürekli performans"],
        ["Görsel - 2", "Büyük görsel dikkat dağıtıcılar (sessiz gif)"],
        ["İşitsel - 2", "Büyük işitsel dikkat dağıtıcılar"],
        ["Kombine - 2", "Büyük birleşik görsel + işitsel dikkat dağıtıcılar"],
        ["Temel - 2", "Sürekli performans — test kapanışı"]
      ],
      indexDefinitions: [
        ["A — Dikkat", "İhmal (hedef varken basmama). Yanlış basış I'ye, geç tepki T'ye yazılır; A ile karışmaz."],
        ["T — Zamanlama", "T = (Zamanında İsabet×0.40) + (RT Hızı×0.25) + (Geç Yanıt×0.20) + (RT Stabilitesi×0.15). İhmal A'ya yazılır."],
        ["I — Dürtüsellik", "Commission errors: hedef dışı uyaranlara verilen ilk tepkiler. Mükerrer basış bu endekste değildir (H'ye gider)."],
        ["H — Hiperaktivite", "Mükerrer basış + boş ekran / yönerge dışı basış. Doğru veya yanlış simge fark etmez."],
        ["Genel skor", "A×0.30 + T×0.25 + I×0.30 + H×0.15"]
      ],
      normLevels: [
        { level: 1, label: "İyi performans (Z ≥ 1.0)" },
        { level: 2, label: "Standart performans (0 – 0.99)" },
        { level: 3, label: "Düşük performans (−1 – −0.01)" },
        { level: 4, label: "Performansta zorluk (Z < −1)" },
        { level: 5, label: "Belirgin zorluk (Z < −2)" }
      ],
      severityLevels: [
        { level: 4, label: "Çok Şiddetli" },
        { level: 3, label: "Yüksek şiddet" },
        { level: 2, label: "Orta Şiddetli" },
        { level: 1, label: "Düşük Şiddetli" }
      ],
      matrixRows: {
        sustainability: "Sürdürülebilir performans",
        visual: "Görsel",
        auditory: "İşitsel",
        combined: "Kombine",
        load: "Çeldirici yükü"
      },
      effectBands: {
        improve: "Düzelme",
        none: "Etki yok",
        mild: "Hafif etki",
        moderate: "Orta etki",
        marked: "Belirgin etki",
        points: "puan"
      },
      sustainCells: {
        warmup: "Isınma (+{{delta}})",
        stable: "Değişiklik yok",
        mildDrop: "Hafif düşüş ({{delta}})",
        markedDrop: "Belirgin bozulma ({{delta}})",
        partialData: "Kısmi veri (erken faz)"
      },
      phaseComments: {
        good: "Performans bu fazda genel olarak korunmuştur.",
        average: "Bu fazda performans kabul edilebilir düzeydedir.",
        combined: "Birleşik çeldiriciler altında dikkat ve dürtü kontrolü zorlanmış olabilir.",
        visual: "Görsel çeldiriciler altında dikkat performansı etkilenmiş olabilir.",
        auditory: "İşitsel çeldiriciler altında performans etkilenmiş olabilir.",
        fatigue: "Testin son bölümünde yorgunluk etkisi görülebilir.",
        default: "Bu fazda performansta düşüş izlenmiştir."
      }
    }
  },
  en: {
    coverSubtitle: "Continuous Performance and Attention Assessment Report",
    footer: "FocusProLab",
    pageLabel: "Page",
    chartSuffix: " — Chart",
    perfLevel: "Performance level",
    severity: "Severity",
    participantInfo: "Participant Information",
    fullName: "Full name",
    age: "Age",
    gender: "Gender",
    evalDate: "Assessment date",
    profile: "Profile",
    testDuration: "Test duration",
    testDurationUnit: "minutes",
    totalTrials: "Total trials",
    testValidity: "Test Validity",
    validityIndex: "Validity Index",
    generalResult: "Overall result",
    lowReliabilityWarnings: "Low-reliability warnings",
    consistencyWarnings: "Performance consistency",
    howToReadTitle: "How to read this report",
    guide: {
      title: "How to read this report",
      intro:
        "This report is built from button presses and reaction times during the continuous performance test. Use this order:",
      steps: [
        "1) Test validity — Whether the data is reliable. If low, interpret scores cautiously.",
        "2) Overall score (0–100) — Weighted mean of four indices: Attention 30%, Timing 25%, Impulsivity 30%, Motor control 15%.",
        "3) A / T / I / H indices — Each domain is scored separately. Higher scores mean better performance (fewer errors / better control).",
        "4) Distractors and sustainability — Effects of environmental distractors and fatigue toward the end of the test.",
        "5) Norm comparison — Where the score sits versus the age-group reference (Z-score).",
        "Important: This assessment does not diagnose; interpret with clinical interview and other data."
      ]
    },
    validityIntro:
      "The validity index checks task engagement, whether reaction times are physiologically plausible, and whether response patterns are consistent. Scores of 90–100 are generally suitable for interpretation.",
    overallExplainTitle: "How the overall score is calculated",
    overallExplain:
      "Overall = (A × 0.30) + (T × 0.25) + (I × 0.30) + (H × 0.15). This session: ({{A}} × 0.30) + ({{T}} × 0.25) + ({{I}} × 0.30) + ({{H}} × 0.15) = {{overall}}.",
    scoreScaleTitle: "Score bands (0–100)",
    scoreScale:
      "90–100 Very strong · 80–89 Strong · 70–79 Average · 60–69 Low · below 60 Marked difficulty. For impulsivity and hyperactivity, a higher score means better control (fewer unnecessary responses).",
    howCalculatedLabel: "How it is calculated",
    meaningLabel: "What it means",
    executiveSummary: "Executive Summary",
    overallScore: "Overall Performance Score",
    riskLevel: "Risk level",
    strengths: "Strengths",
    weaknesses: "Areas to monitor",
    noStrengths: "—",
    noWeaknesses: "No notable development areas",
    clinicalFlags: "Clinical Flags",
    shortComment: "Brief comment",
    mainIndexes: "Core Performance Indices",
    mainIndexesIntro:
      "The four indices below are calculated independently. A low score in one domain does not automatically lower the others; the profile pattern matters for clinical interpretation.",
    commentLabel: "Comment",
    distractorAnalysis: "Distractor Analysis",
    distractorIntro:
      "In mid-test, visual, auditory, or combined distractors are presented. A small drop versus the quiet baseline means performance was maintained; a marked drop suggests sensitivity to environmental stimuli.",
    distractorGeneral: "Overall result",
    sustainability: "Sustained Attention Analysis",
    sustainabilityIntro:
      "Overall performance in the first sections is compared with the final sections. A marked drop may indicate fatigue or difficulty sustaining attention.",
    startPerf: "Initial performance",
    endPerf: "Final performance",
    change: "Change",
    points: "points",
    rawPsych: "Raw Psychometric Indicators",
    professionalTitle: "Professional Pre-Evaluation",
    technicalAppendix: "Technical Appendix — Phases and Norms",
    distractorTechnical: "Distractor effect (technical)",
    phasePerformance: "Phase-based performance",
    section: "Section",
    comment: "Comment",
    measurement: "Measure",
    value: "Value",
    disclaimer:
      "FocusProLab does not provide a diagnosis. Results should be interpreted only by qualified professionals together with clinical interview and other data.",
    timingFormula:
      "T = (On-time {{onTime}}×0.40) + (RT {{rtSpeed}}×0.25) + (Late {{late}}×0.20) + (Stab. {{stability}}×0.15) = {{total}}",
    chartAttention: "Attention (A)",
    chartTiming: "Timing (T)",
    chartImpulsivity: "Impulsivity (I)",
    chartHyperactivity: "Hyperactivity (H)",
    chartRadar: "Performance profile",
    chartRadarSubtitle: "The same total score can mean a different profile depending on how the areas are distributed.",
    chartCombined: "Four Indices — Phase Chart",
    chartCombinedTitle: "Performance Across Four Indices",
    invalidTitle: "TEST INVALID",
    invalidCritical: "Critical findings",
    invalidNoReport: "No performance report was generated for this session. Results must not be used for clinical interpretation.",
    normComparison: "Norm Comparison",
    normIntro:
      "The Z-score compares the participant's score with the reference mean for the same age profile. Z ≥ 1.0 is above reference; 0–0.99 is in the standard band; negative values are below reference. This table is relative positioning, not a diagnosis.",
    indexCol: "Index",
    scoreCol: "Score",
    normLevelCol: "Norm level",
    interpretationCol: "Interpretation",
    targetObject: "Target stimulus",
    validity: {
      bands: {
        invalid: "Invalid",
        low: "Low reliability",
        caution: "Interpret with caution",
        acceptable: "Acceptable",
        valid: "Valid"
      },
      l1_avgRt: "Mean reaction time below 150 ms (physiologically suspicious).",
      l1_fastRate: "{{rate}}% of responses under 150 ms (suspicious speed).",
      l1_omission: "Omission rate {{rate}}% (very low task engagement).",
      l1_rtSdLow: "RT standard deviation {{sd}} ms (possible robotic responding).",
      l1_multi: "Multiple-press rate {{rate}}% (non-compliance with instructions).",
      l2_omission: "Omission rate {{rate}}% (low-reliability range).",
      l2_commission: "Commission rate {{rate}}% (high non-target responding).",
      l2_rtSdHigh: "RT standard deviation {{sd}} ms (excessive variability).",
      l2_multi: "Multiple-press rate {{rate}}%.",
      l3_attention: "Attention (A) phase decline: start {{start}}, end {{end}} (delta {{delta}} points).",
      l3_rt: "RT change: start {{start}} ms, end {{end}} ms (+{{delta}} ms).",
      check_coopOk: "Adequate task engagement",
      check_coopLow: "Limited task engagement",
      check_rtOk: "Reaction times within expected range",
      check_rtBad: "Suspicious or highly variable reaction times",
      check_patternOk: "Response pattern consistent",
      check_patternBad: "Inconsistent response pattern",
      check_clinicalOk: "Results suitable for clinical interpretation",
      check_caution: "Results should be interpreted with caution",
      check_invalid: "Results must not be interpreted",
      summary_invalid: "TEST INVALID — Critical validity findings; the report is not suitable for clinical interpretation.",
      summary_valid: "Test results are considered valid and suitable for interpretation.",
      summary_acceptable: "Test results are acceptable; some factors may affect interpretation.",
      summary_caution: "Results can be interpreted, but factors affecting performance were observed.",
      summary_low: "Low reliability — interpret results carefully with supporting data."
    },
    levels: {
      veryGood: "Very Strong",
      good: "Strong",
      average: "Average",
      low: "Low",
      poor: "Marked Difficulty"
    },
    strengths: {
      attention: "Sustained Attention",
      timing: "Timing",
      impulse: "Impulse Control",
      motor: "Motor Control"
    },
    flags: {
      invalid: "Test invalid — results must not be interpreted",
      impulse: "Impulsivity Tendency",
      distractor: "Distractor Sensitivity",
      sustainability: "Decline in Sustained Attention",
      poor: "Marked Performance Difficulty",
      none: "No Flag"
    },
    distractor: {
      visual: "Visual Distractors",
      auditory: "Auditory Distractors",
      combined: "Combined Distractors",
      noData: "No data",
      noDataComment: "Insufficient trials in this condition.",
      preserved: "Performance Maintained",
      mild: "Mild Impact",
      moderate: "Moderate Impact",
      marked: "Marked Impact",
      visualOk: "The participant did not appear markedly affected by visual distractors.",
      auditoryOk: "No meaningful performance drop was observed during auditory distractors.",
      combinedOk: "Performance was generally maintained when visual and auditory distractors were presented together.",
      mildComment: "A mild performance decline was observed under {{title}}.",
      moderateComment: "A noticeable impact on attention performance was observed under {{title}}.",
      markedComment: "Performance declined markedly under {{title}}.",
      generalAffected: "The participant showed performance loss in some distractor conditions.",
      generalOk: "The participant maintained performance against environmental distractors."
    },
    sustainability: {
      noData: "Insufficient phase data.",
      stable: "Performance was largely maintained throughout the test. No marked fatigue or collapse was observed.",
      mild: "A mild performance decline was observed toward the end of the test.",
      marked: "A marked performance decline was observed toward the end; sustained attention should be reviewed."
    },
    executive: {
      line1ok: "The participant's attention performance was generally at an adequate level.",
      line1low: "The participant showed performance difficulty in attention.",
      line2ok: "The participant largely discriminated target stimuli correctly and maintained attention throughout the task.",
      line2mixed: "Although attention was maintained during the task, {{parts}} were observed.",
      timingIssue: "mild variability in response timing",
      impulseIssue: "monitorable difficulty in impulse control",
      impulseIssueStrong: "marked difficulty in impulse control",
      line3ok: "No marked performance loss was observed under distractor conditions.",
      line3bad: "Performance was partly affected under distractor conditions."
    },
    indexes: {
      attention: {
        title: "A — ATTENTION",
        definition:
          "Detecting targets and sustaining focus. Only omissions (no press when the target is present) lower this index; false presses go to I and late responses to T.",
        howCalculated: "A = 100 − (omissions / targets × 100). This session: A = {{score}}/100.",
        meaning:
          "High A: sustained attention without missing targets. Low A: frequent omissions / difficulty sustaining attention.",
        c90: "The participant showed strong performance in detecting targets and sustaining focus throughout the task. Attention performance was generally maintained.",
        c80: "The participant correctly discriminated most target stimuli and maintained attention throughout the task. No marked attention difficulty was observed.",
        c70: "The participant generally maintained attention during the task, though some targets were missed in certain sections.",
        c60: "Difficulty was observed in detecting targets and sustaining attention. Periodic performance declines were noted.",
        cLow: "A substantial proportion of targets were missed during the test, suggesting marked difficulty in sustained attention."
      },
      timing: {
        title: "T — TIMING",
        definition:
          "Responding to targets at an appropriate speed and consistently. On-time hits, RT speed (age reference), late-response rate, and RT stability are combined.",
        howCalculated:
          "T = (on-time hit×0.40) + (RT speed×0.25) + (late response×0.20) + (RT stability×0.15). This session: ({{onTime}}×0.40)+({{rtSpeed}}×0.25)+({{late}}×0.20)+({{stability}}×0.15) = {{score}}.",
        meaning:
          "High T: timely, consistent responses. Low T: delayed, rushed, or highly variable reaction times.",
        c90: "The participant responded to targets quickly, consistently, and at appropriate times. No marked variability in response speed was observed.",
        c80: "Responses to targets were generally timely and consistent.",
        c70: "Some variability in response speed was observed, though overall performance was maintained.",
        c60: "Delays and timing inconsistencies were observed in responses to targets.",
        cLow: "Marked irregularities and delays in response timing were observed throughout the task."
      },
      impulsivity: {
        title: "I — IMPULSIVITY",
        definition:
          "Unnecessary first responses to non-targets (commissions). Repeated presses are not in this index; motor control is scored under H.",
        howCalculated:
          "I = 100 − (commission rate × 5). Commission rate = presses on non-targets / non-target trials. This session: I = {{score}}/100.",
        meaning:
          "High I: good impulse control (few unnecessary presses). Low I: frequent responses to non-targets / impulsive responding.",
        c90: "The participant effectively maintained response control against non-target stimuli.",
        c80: "Unnecessary responding remained at a low level throughout the task.",
        c70: "Occasional unnecessary responses to non-target stimuli were observed.",
        c60: "An increase in unnecessary responses to non-target stimuli was observed during the task.",
        cLow: "Frequent responses to non-target stimuli suggest marked difficulty in impulse control."
      },
      hyperactivity: {
        title: "H — HYPERACTIVITY",
        definition:
          "Motor inhibition: repeated presses in the same trial and blank-screen / off-task presses. Correct vs incorrect symbol is not separated here.",
        howCalculated:
          "H is derived from multi-press and idle (blank-screen) rates; more unnecessary motor events lower the score. This session: H = {{score}}/100.",
        meaning:
          "High H: controlled, calm motor responding. Low H: repeated or off-task presses suggesting motor-control difficulty.",
        c90: "The participant maintained controlled motor responses with no unnecessary key use.",
        c80: "Motor control performance was generally maintained.",
        c70: "Occasional unnecessary or repetitive responses were observed.",
        c60: "An increase in repeated and unnecessary responses was observed during the task.",
        cLow: "Marked difficulty in regulating motor responses was observed, with frequent repetitive and off-task presses."
      }
    },
    generalComments: {
      profile1:
        "The participant showed strong performance in sustained attention, response timing, and motor control. Responses to non-target stimuli remained limited. Overall performance appeared maintained throughout the task.",
      profile2:
        "Attention performance was generally maintained, though variability was observed in response timing. Findings suggest difficulty may lie more in timely responding than in detecting targets.",
      profile3:
        "The participant showed adequate sustained attention and timely responding, though an increase in unnecessary responses to non-target stimuli suggests possible difficulty in impulse control.",
      partStrongCore:
        "The participant showed strong performance in sustained attention, response timing, and motor control.",
      partAttOk: "Attention performance was generally at an adequate level.",
      partAttMid: "Fluctuations in attention performance were observed at times.",
      partAttLow: "Marked difficulty in sustained attention was observed.",
      partTimMid: "Variability in response timing was observed.",
      partTimLow: "Marked difficulty in response timing was observed.",
      partImpMid: "Occasional increases in unnecessary responses to non-target stimuli were observed.",
      partImpLow: "Findings suggest possible difficulty in impulse control.",
      partHypLow: "Difficulty in motor control was observed.",
      partDistractorOk: "Performance was generally maintained under distractor conditions.",
      partDistractor: "Performance was partly affected under distractor conditions."
    },
    professional: {
      invalid1: "This test session does not meet validity criteria.",
      invalid2: "Due to critical invalidity findings, performance scores must not be used for clinical interpretation.",
      invalid3: "If needed, the test should be repeated and task engagement conditions reviewed.",
      coop: "The participant showed adequate cooperation during the assessment.",
      attOk: "Sustained attention was generally at an adequate level. No marked difficulty was observed in discriminating targets or maintaining the task.",
      attC70: "Attention performance was generally adequate; brief fluctuations may occur in some sections.",
      attC60: "Moderate difficulty in sustained attention was observed; omission patterns should be monitored.",
      attLow: "Sustained attention showed marked performance difficulty. Omission patterns should be reviewed carefully.",
      timOk: "Timing performance was generally at an adequate level.",
      timC70: "Mild variability in response speed was observed; occasional delayed responses occurred.",
      timC60: "Moderate variability in timing was observed; late or rushed responses should be monitored.",
      timLow: "Marked timing difficulty was observed; late responses or excessive variability should be followed up.",
      impOk: "Impulsivity indicators were at an acceptable level. Responses to non-target stimuli remained limited.",
      impC70: "Impulse control was acceptable, though occasional rushed responses to non-targets were observed.",
      impC60: "Mild impulsivity indicators were observed; commission errors should be monitored.",
      impLow: "A marked impulsivity pattern was observed; frequent responses to non-target stimuli. This area needs development.",
      hypOk: "Motor control performance was generally at an adequate level.",
      hypC70: "Motor control was generally adequate; occasional repeated presses may occur.",
      hypC60: "Mild hyperactivity indicators (repeated or blank-screen presses) were observed; should be monitored.",
      hypLow: "Marked motor control difficulty was observed; repeated or off-task presses should be followed up.",
      distOk: "Performance was generally maintained under distractor conditions.",
      distLow: "Performance was partly affected under distractors.",
      sustNote: "Sustained attention analysis during the test: {{label}}.",
      disclaimer:
        "Test findings must not be used alone for diagnostic interpretation; they should be considered with clinical interview, observation, and other assessment tools."
    },
    metrics: {
      accuracy: "Overall accuracy",
      hitRate: "Hit rate",
      omissionRate: "Omission rate",
      commissionRate: "Commission rate",
      lateRate: "Late response rate",
      multiRate: "Multi-press rate",
      avgRt: "Mean reaction time",
      rtSd: "RT standard deviation",
      dPrime: "d-prime (d′)",
      beta: "Beta (β)",
      criterion: "Criterion (c)",
      validityIndex: "Validity index"
    },
    technical: {
      axisLabels: {
        temel1: "Baseline-1",
        gorsel: "Visual",
        isitsel: "Auditory",
        kombine: "Combined",
        temel2: "Baseline-2"
      },
      chartLabels: {
        normLow: "Norm lower",
        normBand: "Norm band",
        normRef: "Normative reference",
        participant: "Participant"
      },
      phaseLegend: [
        ["Baseline - 1", "Baseline section — target-focused continuous performance"],
        ["Visual - 2", "Large visual distractors (silent gif)"],
        ["Auditory - 2", "Large auditory distractors"],
        ["Combined - 2", "Large combined visual + auditory distractors"],
        ["Baseline - 2", "Continuous performance — test closure"]
      ],
      indexDefinitions: [
        ["A — Attention", "Omissions (failing to press when target is present). False alarms go to I; late responses to T; not mixed with A."],
        ["T — Timing", "T = (On-time Hit×0.40) + (RT Speed×0.25) + (Late Response×0.20) + (RT Stability×0.15). Omissions are scored under A."],
        ["I — Impulsivity", "Commission errors: first responses to non-target stimuli. Repeated presses are not in this index (they go to H)."],
        ["H — Hyperactivity", "Repeated presses + blank-screen / off-task presses. Correct vs incorrect symbol does not matter."],
        ["Overall score", "A×0.30 + T×0.25 + I×0.30 + H×0.15"]
      ],
      normLevels: [
        { level: 1, label: "Good performance (Z ≥ 1.0)" },
        { level: 2, label: "Standard performance (0 – 0.99)" },
        { level: 3, label: "Low performance (−1 – −0.01)" },
        { level: 4, label: "Performance difficulty (Z < −1)" },
        { level: 5, label: "Marked difficulty (Z < −2)" }
      ],
      severityLevels: [
        { level: 4, label: "Very severe" },
        { level: 3, label: "High severity" },
        { level: 2, label: "Moderate severity" },
        { level: 1, label: "Low severity" }
      ],
      matrixRows: {
        sustainability: "Sustained performance",
        visual: "Visual",
        auditory: "Auditory",
        combined: "Combined",
        load: "Distractor load"
      },
      effectBands: {
        improve: "Improvement",
        none: "No effect",
        mild: "Mild effect",
        moderate: "Moderate effect",
        marked: "Marked effect",
        points: "pts"
      },
      sustainCells: {
        warmup: "Warm-up (+{{delta}})",
        stable: "No change",
        mildDrop: "Mild decline ({{delta}})",
        markedDrop: "Marked decline ({{delta}})",
        partialData: "Partial data (early phase)"
      },
      phaseComments: {
        good: "Performance was generally maintained in this phase.",
        average: "Performance was at an acceptable level in this phase.",
        combined: "Attention and impulse control may have been strained under combined distractors.",
        visual: "Attention performance may have been affected under visual distractors.",
        auditory: "Performance may have been affected under auditory distractors.",
        fatigue: "Fatigue effects may be seen in the final section of the test.",
        default: "A performance decline was observed in this phase."
      }
    }
  },
  it: reportPdfIt
};

export function getReportPdfStrings(locale = "tr") {
  return reportPdfStrings[locale] ?? reportPdfStrings.tr;
}

export function fillTemplate(str, vars = {}) {
  return String(str).replace(/\{\{(\w+)\}\}/g, (_, key) => (vars[key] != null ? String(vars[key]) : ""));
}

export function localizePhaseSectionName(name, locale = "tr") {
  const raw = String(name || "").replace(/^[^—]+—\s*/, "").trim();
  if (locale !== "en" && locale !== "it") {
    return raw.length > 28 ? `${raw.slice(0, 26)}…` : raw;
  }
  const s =
    locale === "it"
      ? raw
          .replace(/sessiz \+ sesli gif/gi, "gif silenziosa + audio")
          .replace(/sessiz gif/gi, "gif silenziosa")
          .replace(/sadece ses/gi, "solo audio")
          .replace(/\bdk\b/gi, "min")
          .replace(/Yetişkin/gi, "Adulto")
          .replace(/Ergen/gi, "Adolescente")
          .replace(/Çocuk/gi, "Bambino")
      : raw
          .replace(/sessiz \+ sesli gif/gi, "silent + sound gif")
          .replace(/sessiz gif/gi, "silent gif")
          .replace(/sadece ses/gi, "sound only")
          .replace(/\bdk\b/gi, "min")
          .replace(/Yetişkin/gi, "Adult")
          .replace(/Ergen/gi, "Teen")
          .replace(/Çocuk/gi, "Child");
  return s.length > 32 ? `${s.slice(0, 30)}…` : s;
}

export function dateLocaleForPdf(locale = "tr") {
  return locale === "en" ? "en-US" : locale === "it" ? "it-IT" : "tr-TR";
}

const NORM_LEVEL_COLORS = {
  1: "#0d9488",
  2: "#86efac",
  3: "#f59e0b",
  4: "#dc2626",
  5: "#7f1d1d"
};

const SEVERITY_LEVEL_COLORS = {
  1: "#fecaca",
  2: "#f87171",
  3: "#dc2626",
  4: "#7f1d1d"
};

export function getFullPhaseLegend(locale = "tr") {
  return getReportPdfStrings(locale).technical.phaseLegend;
}

export function getIndexDefinitions(locale = "tr") {
  return getReportPdfStrings(locale).technical.indexDefinitions;
}

export function getNormLevels(locale = "tr") {
  return getReportPdfStrings(locale).technical.normLevels.map((row) => ({
    ...row,
    color: NORM_LEVEL_COLORS[row.level]
  }));
}

export function getSeverityLevels(locale = "tr") {
  return getReportPdfStrings(locale).technical.severityLevels.map((row) => ({
    ...row,
    color: SEVERITY_LEVEL_COLORS[row.level]
  }));
}

export function getPhaseComment(sectionName, scores, locale = "tr") {
  const P = getReportPdfStrings(locale).technical.phaseComments;
  const overall = typeof scores === "number" ? scores : scores?.overall ?? 0;
  const attention = typeof scores === "object" ? scores.attention ?? overall : overall;
  const timing = typeof scores === "object" ? scores.timing ?? overall : overall;
  const impulsivity = typeof scores === "object" ? scores.impulsivity ?? overall : overall;
  const hyperactivity = typeof scores === "object" ? scores.hyperactivity ?? overall : overall;

  if (attention >= 75 && timing >= 70 && impulsivity >= 60 && hyperactivity >= 60) return P.good;
  if (overall >= 75) return P.good;
  if (attention >= 65 && timing >= 65 && impulsivity >= 60 && hyperactivity >= 55) return P.average;

  const s = sectionName.toLowerCase();
  if (s.includes("sessiz + sesli") || s.includes("sesli gif")) return P.combined;
  if (s.includes("sessiz gif")) return P.visual;
  if (s.includes("sadece ses")) return P.auditory;
  if (/11–|12–|13–|14–|15–|11-|12-|13-|14-|15-/.test(s)) return P.fatigue;
  return P.default;
}

export function getDistractorMatrixLabels(locale = "tr") {
  return getReportPdfStrings(locale).technical.matrixRows;
}

export function getEffectBandLabels(locale = "tr") {
  return getReportPdfStrings(locale).technical.effectBands;
}

export function getSustainCellLabels(locale = "tr") {
  return getReportPdfStrings(locale).technical.sustainCells;
}
