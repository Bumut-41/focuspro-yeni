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
    commentLabel: "Yorum",
    distractorAnalysis: "Çeldirici Analizi",
    distractorGeneral: "Genel Sonuç",
    sustainability: "Sürdürülebilir Dikkat Analizi",
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
    chartAttentionDesc: "Hedef uyaranları fark etme ve kaçırmadan yanıt verebilme becerisi.",
    chartTiming: "Zamanlama (T)",
    chartTimingDesc: "Hedef uyaranlara verilen doğru yanıtların zamanlama tutarlılığını ve geç yanıt sıklığını değerlendirir.",
    chartTimingDescV1: "Hedef uyaranlara zamanında, hızlı ve tutarlı şekilde doğru yanıt verebilme becerisi.",
    chartImpulsivity: "Dürtüsellik (I)",
    chartImpulsivityDesc: "Hedef dışı uyaranlara verilen gereksiz ilk tepkileri engelleyebilme becerisi.",
    chartHyperactivity: "Motor Yanıt Kontrolü (H)",
    chartHyperactivityDesc: "Boş ekrana yapılan gereksiz basışları ve aynı uyaran sırasında tekrarlayan tuş basışlarını kontrol edebilme becerisi.",
    sessionDataQuality: "Oturum Veri Kalitesi",
    dataQualityIndex: "Veri Kalitesi Endeksi",
    algorithmCategoryNote:
      "“Belirgin güçlük”, “çok güçlü” gibi sınıflandırmalar doğrulanmış normlar oluşana kadar geçici algoritmik kategorilerdir.",
    chartRadar: "Performans Profili",
    chartRadarSubtitle: "Aynı toplam puan, alanların dağılımına göre farklı bir profil anlamına gelir.",
    chartCombined: "Dört İndeks — Faz Grafiği",
    chartCombinedTitle: "Dört İndeks Genelinde Performans",
    invalidTitle: "TEST GEÇERSİZ",
    invalidCritical: "Kritik bulgular",
    invalidNoReport: "Bu oturum için performans raporu üretilmemiştir. Sonuçlar klinik yorum için kullanılmamalıdır.",
    normComparison: "Norm Karşılaştırma",
    normIntro: "Normatif referans gruplarına göre standartlaştırılmış performans karşılaştırması.",
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
      check_dataOk: "Göreve katılım ve kayıt bütünlüğü analiz için yeterli görünmektedir",
      check_dataCaution: "Olağan dışı tepki örüntüleri nedeniyle dikkatli inceleme önerilir",
      check_dataLimited: "Veri kalitesi sınırlıdır; destekleyici bilgilerle birlikte ele alınmalıdır",
      summary_invalid: "TEST GEÇERSİZ — Kritik geçersizlik bulguları nedeniyle rapor klinik yorum için uygun değildir.",
      summary_valid: "Test sonuçları geçerli kabul edilmiş ve yorumlamaya uygun bulunmuştur.",
      summary_acceptable: "Test sonuçları kabul edilebilir düzeydedir; bazı faktörler yorumu etkileyebilir.",
      summary_caution: "Sonuçlar yorumlanabilir ancak test performansını etkileyebilecek faktörler gözlenmiştir.",
      summary_low: "Düşük güvenilirlik — sonuçlar dikkatli ve destekleyici verilerle birlikte yorumlanmalıdır.",
      summary_data_ok:
        "Oturum veri kalitesi: göreve katılım, teknik kayıt bütünlüğü ve yanıt örneklemi analiz için yeterli görünmektedir. Bu, normatif doğrulama veya kesin klinik uygunluk iddiası değildir.",
      summary_data_acceptable:
        "Oturum veri kalitesi kabul edilebilir düzeydedir; bazı uyarılar dikkatle incelenmelidir. Normatif doğrulama yapılmadan kesin klinik uygunluk iddiası kullanılmamalıdır.",
      summary_data_caution:
        "Oturum veri kalitesinde dikkat gerektiren bulgular vardır. Sonuçlar pilot/ön değerlendirme bağlamında ele alınmalıdır.",
      summary_data_low:
        "Oturum veri kalitesi düşüktür. Bulgular temkinli yorumlanmalı; kesin klinik uygunluk ifadesi kullanılmamalıdır."
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
      visualOk: "Görsel çeldirici bölümünde belirgin performans düşüşü gözlenmemiştir.",
      auditoryOk: "İşitsel çeldirici bölümünde belirgin performans düşüşü gözlenmemiştir.",
      combinedOk: "Kombine çeldirici bölümünde belirgin performans düşüşü gözlenmemiştir.",
      mildComment: "{{title}} bölümünde performansta hafif düzeyde düşüş gözlendi. Bölüm sırası ve uyaran temposu da katkıda bulunabilir; düşüş doğrudan yalnızca çeldiriciye bağlanmamalıdır.",
      moderateComment: "{{title}} bölümünde performans düşüşü gözlendi. Çeldirici etkisi olasıdır; tempo/sıra etkisi ayrıştırılmadan kesin neden atfedilmemelidir.",
      markedComment: "{{title}} bölümünde belirgin performans düşüşü gözlendi. Bulgu tanımlayıcıdır; tek başına çeldirici nedenselliği kanıtlamaz.",
      generalAffected: "Bazı çeldirici bölümlerinde performans düşüşü gözlenmiştir (tanımlayıcı).",
      generalOk: "Çeldirici bölümlerinde belirgin performans düşüşü gözlenmemiştir."
    },
    sustainability: {
      noData: "Başlangıç (temel) veya kapanış bölümünde yeterli veri bulunamadı; sürdürülebilirlik hesaplanamadı.",
      stable: "Başlangıç ve kapanış performansları arasındaki fark küçüktür; performansın büyük ölçüde korunduğu görülmektedir.",
      mild: "Kapanışta başlangıca göre hafif performans azalması gözlenmiştir.",
      marked: "Kapanışta başlangıca göre belirgin performans azalması gözlenmiştir.",
      increase: "Kapanışta başlangıca göre performans artışı gözlenmiştir."
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
        definition: "Hedef uyaranları fark etme ve kaçırmadan yanıt verebilme becerisi.",
        c90: "Katılımcı hedef uyaranları fark etme ve görev boyunca odağını sürdürme konusunda güçlü bir performans göstermiştir. Test süresince dikkat performansı genel olarak korunmuştur.",
        c80: "Katılımcı hedef uyaranların büyük bölümünü doğru şekilde ayırt etmiş ve görev boyunca dikkatini sürdürebilmiştir. Belirgin dikkat güçlüğü izlenmemiştir.",
        c70: "Katılımcı görev boyunca genel olarak dikkatini koruyabilmiştir. Bununla birlikte bazı bölümlerde hedef uyaranların kaçırıldığı görülmüştür.",
        c60: "Görev süresince hedef uyaranları fark etme ve dikkatini sürdürme alanlarında zorlanmalar gözlenmiştir. Performansta dönemsel düşüşler izlenmiştir.",
        cLow: "Test boyunca hedef uyaranların önemli bir bölümünün kaçırıldığı görülmüştür. Bulgular dikkat sürdürme alanında belirgin güçlük yaşandığını düşündürmektedir."
      },
      timing: {
        title: "T — ZAMANLAMA",
        definition: "Hedef uyaranlara verilen doğru yanıtların zamanlama tutarlılığını ve geç yanıt sıklığını değerlendirir.",
        definitionV1: "Hedef uyaranlara zamanında, hızlı ve tutarlı şekilde doğru yanıt verebilme becerisi.",
        c90: "Doğru yanıtlarda zamanlama tutarlılığı yüksek ve geç yanıt oranı düşüktür.",
        c80: "Zamanlama tutarlılığı genel olarak korunmuş; geç yanıtlar sınırlı düzeydedir.",
        c70: "Zamanlama tutarlılığında orta düzeyde değişkenlik veya geç yanıtlarda hafif artış izlenmiştir.",
        c60: "Geç yanıt artışı ve/veya RT değişkenliği (CV) zamanlama puanını düşürmüştür.",
        cLow: "Geç yanıt sıklığı ve/veya düşük zamanlama tutarlılığı belirgindir."
      },
      impulsivity: {
        title: "I — DÜRTÜSELLİK",
        definition: "Hedef dışı uyaranlara verilen gereksiz ilk tepkileri engelleyebilme becerisi.",
        c90: "Katılımcı hedef dışı uyaranlara karşı tepki kontrolünü etkili şekilde sürdürebilmiştir.",
        c80: "Görev boyunca gereksiz tepki verme eğilimi düşük düzeyde kalmıştır.",
        c70: "Hedef dışı uyaranlara zaman zaman gereksiz tepkiler verilmiştir.",
        c60: "Görev sırasında hedef dışı uyaranlara yönelik gereksiz tepkilerde artış gözlenmiştir.",
        cLow: "Hedef dışı uyaranlara sık tepki verilmesi, dürtü kontrolünde belirgin zorlanmaya işaret etmektedir."
      },
      hyperactivity: {
        title: "H — MOTOR YANIT KONTROLÜ",
        definition: "Boş ekrana yapılan gereksiz basışları ve aynı uyaran sırasında tekrarlayan tuş basışlarını kontrol edebilme becerisi.",
        c90: "Katılımcı motor tepkilerini kontrollü şekilde sürdürmüş ve gereksiz tuş kullanımı göstermemiştir.",
        c90limited:
          "Motor kontrol genel olarak iyidir; bununla birlikte sınırlı sayıda gereksiz basış (boş ekran veya mükerrer tuş) gözlenmiştir.",
        c80: "Motor kontrol performansı genel olarak korunmuştur.",
        c80limited:
          "Motor kontrol kabul edilebilir düzeydedir; sınırlı sayıda gereksiz basış gözlenmiştir.",
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
        ["A — Dikkat", "Hedef uyaranları fark etme ve kaçırmadan yanıt verebilme becerisi."],
        ["T — Zamanlama", "Hedef uyaranlara verilen doğru yanıtların zamanlama tutarlılığını ve geç yanıt sıklığını değerlendirir."],
        ["I — Dürtüsellik", "Hedef dışı uyaranlara verilen gereksiz ilk tepkileri engelleyebilme becerisi."],
        ["H — Motor Yanıt Kontrolü", "Boş ekrana yapılan gereksiz basışları ve aynı uyaran sırasında tekrarlayan tuş basışlarını kontrol edebilme becerisi."],
        ["Genel skor", "A×0.30 + T×0.25 + I×0.30 + H×0.15"]
      ],
      indexDefinitionsV1: [
        ["A — Dikkat", "Hedef uyaranları fark etme ve kaçırmadan yanıt verebilme becerisi."],
        ["T — Zamanlama", "Hedef uyaranlara zamanında, hızlı ve tutarlı şekilde doğru yanıt verebilme becerisi."],
        ["I — Dürtüsellik", "Hedef dışı uyaranlara verilen gereksiz ilk tepkileri engelleyebilme becerisi."],
        ["H — Motor Yanıt Kontrolü", "Boş ekrana yapılan gereksiz basışları ve aynı uyaran sırasında tekrarlayan tuş basışlarını kontrol edebilme becerisi."],
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
        good: "Bu fazda A/T/I/H alt endeksleri yeterli düzeydedir; başlangıca göre belirgin düşüş izlenmemiştir.",
        average: "Bu fazda performans kabul edilebilir düzeydedir.",
        weak:
          "Genel puan yüksek görünse bile alt endekslerde zayıflık vardır ({{indices}}). Performansın tüm alanlarda korunduğu söylenemez.",
        weakWithDrop:
          "Alt endekslerde zayıflık ({{indices}}) ve başlangıca göre düşüş ({{drops}}) gözlenmiştir.",
        mildDrop: "Başlangıç bölümüne göre sınırlı düşüş izlenmiştir ({{drops}}).",
        markedDrop: "Başlangıç bölümüne göre belirgin düşüş izlenmiştir ({{drops}}).",
        combinedOk: "Kombine çeldirici fazında A/T/I/H yeterli düzeyde korunmuştur.",
        visualOk: "Görsel çeldirici fazında A/T/I/H yeterli düzeyde korunmuştur.",
        auditoryOk: "İşitsel çeldirici fazında A/T/I/H yeterli düzeyde korunmuştur.",
        closingOk: "Kapanış fazında A/T/I/H yeterli düzeyde korunmuştur.",
        combined: "Birleşik çeldiriciler altında dikkat ve dürtü kontrolü zorlanmış olabilir.",
        visual: "Görsel çeldiriciler altında dikkat performansı etkilenmiş olabilir.",
        auditory: "İşitsel çeldiriciler altında performans etkilenmiş olabilir.",
        fatigue: "Testin son bölümünde yorgunluk etkisi görülebilir.",
        default: "Bu fazda alt endekslerde performans düşüşü veya zayıflık izlenmiştir."
      },
      rtFilterAppendix: {
        title: "RT filtreleme (teknik)",
        intro:
          "Zamanlama (T) için medyan RT, ortalama, SD ve CV yalnızca hedef isabetlerinde, geç eşiği (≤ lateMs) içindeki tepki sürelerinden hesaplanır. İhmal ve geç yanıtlar bu örneğe dahil edilmez (geç yanıt ayrı bileşende puanlanır).",
        iqr:
          "Aykırı değer temizliği: 1,5×IQR kuralı. Q1−1,5×IQR altı veya Q3+1,5×IQR üstü RT’ler medyan/CV hesabından çıkarılır (N<4 ise temizleme uygulanmaz).",
        summary:
          "Ham geçerli RT: {{raw}} · IQR sonrası: {{cleaned}} · Dışlanan aykırı: {{outliers}} · Geç eşiği: {{lateMs}} ms · <150 ms hedef basış (bilgi): {{rush}}",
        note:
          "Bu filtreleme skorlama teknik adımıdır; klinik norm dışı bırakma değildir. V3/V4’te hız puanı yoktur."
      },
      dataQualityRules: {
        title: "Veri kalitesi endeksi (0–100) — teknik kurallar",
        start: "Başlangıç puanı 100.",
        rules: [
          "Ortalama RT < 150 ms veya hedef isabetlerin ≥%25’i <150 ms → −40",
          "İhmal oranı > %40 → −20",
          "Çoklu basış oranı > %20 → −15",
          "RT SD < 20 ms (≥5 hedef isabet) → −15",
          "Commission (hedef dışı ilk tepki) > %25 → −10",
          "Puan 0–100 aralığına sıkıştırılır. V4’te hızlı hedef basışı tek başına kritik geçersizlik sayılmaz; skor düşümü yine uygulanabilir."
        ]
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
    commentLabel: "Comment",
    distractorAnalysis: "Distractor Analysis",
    distractorGeneral: "Overall result",
    sustainability: "Sustained Attention Analysis",
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
    chartAttentionDesc: "Ability to notice target stimuli and respond without missing them.",
    chartTiming: "Timing (T)",
    chartTimingDesc: "Ability to respond to targets correctly in a timely, fast, and consistent manner.",
    chartImpulsivity: "Impulsivity (I)",
    chartImpulsivityDesc: "Ability to withhold unnecessary first responses to non-target stimuli.",
    chartHyperactivity: "Motor Response Control (H)",
    chartHyperactivityDesc: "Ability to control unnecessary blank-screen presses and repeated key presses during the same stimulus.",
    chartRadar: "Performance profile",
    chartRadarSubtitle: "The same total score can mean a different profile depending on how the areas are distributed.",
    chartCombined: "Four Indices — Phase Chart",
    chartCombinedTitle: "Performance Across Four Indices",
    invalidTitle: "TEST INVALID",
    invalidCritical: "Critical findings",
    invalidNoReport: "No performance report was generated for this session. Results must not be used for clinical interpretation.",
    normComparison: "Norm Comparison",
    normIntro: "Standardized performance comparison against normative reference groups.",
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
        definition: "Ability to notice target stimuli and respond without missing them.",
        c90: "The participant showed strong performance in detecting targets and sustaining focus throughout the task. Attention performance was generally maintained.",
        c80: "The participant correctly discriminated most target stimuli and maintained attention throughout the task. No marked attention difficulty was observed.",
        c70: "The participant generally maintained attention during the task, though some targets were missed in certain sections.",
        c60: "Difficulty was observed in detecting targets and sustaining attention. Periodic performance declines were noted.",
        cLow: "A substantial proportion of targets were missed during the test, suggesting marked difficulty in sustained attention."
      },
      timing: {
        title: "T — TIMING",
        definition: "Ability to respond to targets correctly in a timely, fast, and consistent manner.",
        c90: "The participant responded to targets quickly, consistently, and at appropriate times. No marked variability in response speed was observed.",
        c80: "Responses to targets were generally timely and consistent.",
        c70: "Some variability in response speed was observed, though overall performance was maintained.",
        c60: "Delays and timing inconsistencies were observed in responses to targets.",
        cLow: "Marked irregularities and delays in response timing were observed throughout the task."
      },
      impulsivity: {
        title: "I — IMPULSIVITY",
        definition: "Ability to withhold unnecessary first responses to non-target stimuli.",
        c90: "The participant effectively maintained response control against non-target stimuli.",
        c80: "Unnecessary responding remained at a low level throughout the task.",
        c70: "Occasional unnecessary responses to non-target stimuli were observed.",
        c60: "An increase in unnecessary responses to non-target stimuli was observed during the task.",
        cLow: "Frequent responses to non-target stimuli suggest marked difficulty in impulse control."
      },
      hyperactivity: {
        title: "H — MOTOR RESPONSE CONTROL",
        definition: "Ability to control unnecessary blank-screen presses and repeated key presses during the same stimulus.",
        c90: "The participant maintained controlled motor responses with no unnecessary key use.",
        c90limited:
          "Motor control is generally good; however, a limited number of unnecessary presses (blank screen or repeats) were observed.",
        c80: "Motor control performance was generally maintained.",
        c80limited:
          "Motor control is acceptable; a limited number of unnecessary presses were observed.",
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
        ["A — Attention", "Ability to notice target stimuli and respond without missing them."],
        ["T — Timing", "Ability to respond to targets correctly in a timely, fast, and consistent manner."],
        ["I — Impulsivity", "Ability to withhold unnecessary first responses to non-target stimuli."],
        ["H — Motor Response Control", "Ability to control unnecessary blank-screen presses and repeated key presses during the same stimulus."],
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
        good: "A/T/I/H sub-indices are adequate in this phase; no marked drop vs baseline.",
        average: "Performance was at an acceptable level in this phase.",
        weak:
          "Even if overall looks high, sub-indices are weak ({{indices}}). Performance was not preserved across all domains.",
        weakWithDrop:
          "Weak sub-indices ({{indices}}) and drops vs baseline ({{drops}}) were observed.",
        mildDrop: "A limited drop vs baseline was observed ({{drops}}).",
        markedDrop: "A marked drop vs baseline was observed ({{drops}}).",
        combinedOk: "A/T/I/H remained adequate under combined distractors.",
        visualOk: "A/T/I/H remained adequate under visual distractors.",
        auditoryOk: "A/T/I/H remained adequate under auditory distractors.",
        closingOk: "A/T/I/H remained adequate in the closing phase.",
        combined: "Attention and impulse control may have been strained under combined distractors.",
        visual: "Attention performance may have been affected under visual distractors.",
        auditory: "Performance may have been affected under auditory distractors.",
        fatigue: "Fatigue effects may be seen in the final section of the test.",
        default: "A sub-index weakness or performance decline was observed in this phase."
      },
      rtFilterAppendix: {
        title: "RT filtering (technical)",
        intro:
          "Median RT, mean, SD and CV for timing (T) use only on-time target hits (RT ≤ lateMs). Omissions and late responses are excluded from this sample (late is scored separately).",
        iqr:
          "Outlier cleaning: 1.5×IQR. RTs below Q1−1.5×IQR or above Q3+1.5×IQR are removed from median/CV (no cleaning if N<4).",
        summary:
          "Raw valid RT: {{raw}} · After IQR: {{cleaned}} · Outliers removed: {{outliers}} · Late threshold: {{lateMs}} ms · <150 ms target presses (info): {{rush}}",
        note: "This is a scoring technical step, not clinical exclusion. V3/V4 have no speed score."
      },
      dataQualityRules: {
        title: "Data quality index (0–100) — technical rules",
        start: "Starting score 100.",
        rules: [
          "Mean RT < 150 ms or ≥25% of target hits <150 ms → −40",
          "Omission rate > 40% → −20",
          "Multi-press rate > 20% → −15",
          "RT SD < 20 ms (≥5 target hits) → −15",
          "Commission > 25% → −10",
          "Clamped to 0–100. In V4, fast target presses alone are not critical invalidity; score deduction may still apply."
        ]
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

export function getIndexDefinitions(locale = "tr", scoringVersion = "v1") {
  const tech = getReportPdfStrings(locale).technical;
  if ((scoringVersion === "v1" || scoringVersion === "v2") && tech.indexDefinitionsV1) {
    return tech.indexDefinitionsV1;
  }
  return tech.indexDefinitions;
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

/** @deprecated Use buildPhaseComment from report/phaseComments.js (avoids circular import). */
export function getPhaseComment(sectionName, scores, locale = "tr", ctx = {}) {
  const P = getReportPdfStrings(locale).technical.phaseComments;
  const overall = typeof scores === "number" ? scores : scores?.overall ?? 0;
  const attention = typeof scores === "object" ? scores?.attention ?? overall : overall;
  const timing = typeof scores === "object" ? scores?.timing ?? overall : overall;
  const impulsivity = typeof scores === "object" ? scores?.impulsivity ?? overall : overall;
  const hyperactivity = typeof scores === "object" ? scores?.hyperactivity ?? overall : overall;
  // Strict: never "good/preserved" if any sub-index is weak (e.g. I=64)
  if (attention < 75 || timing < 70 || impulsivity < 70 || hyperactivity < 70) {
    return (P.weak || P.default).replace(
      "{{indices}}",
      [
        attention < 75 ? `A=${Math.round(attention)}` : null,
        timing < 70 ? `T=${Math.round(timing)}` : null,
        impulsivity < 70 ? `I=${Math.round(impulsivity)}` : null,
        hyperactivity < 70 ? `H=${Math.round(hyperactivity)}` : null
      ]
        .filter(Boolean)
        .join(", ")
    );
  }
  if (ctx?.baseline) {
    // Prefer buildPhaseComment for full baseline logic; this is a safe fallback.
  }
  return P.good;
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
