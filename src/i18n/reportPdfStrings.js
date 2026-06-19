/** PDF raporu ve klinik anlatım metinleri (TR / EN). */
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
    professional: "Profesyonel Değerlendirme",
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
      summary_invalid: "TEST GEÇERSİZ — Kritik geçersizlik bulguları nedeniyle rapor klinik yorum için uygun değildir.",
      summary_valid: "Test sonuçları geçerli kabul edilmiş ve yorumlamaya uygun bulunmuştur.",
      summary_acceptable: "Test sonuçları kabul edilebilir düzeydedir; bazı faktörler yorumu etkileyebilir.",
      summary_caution: "Sonuçlar yorumlanabilir ancak test performansını etkileyebilecek faktörler gözlenmiştir.",
      summary_low: "Düşük güvenilirlik — sonuçlar dikkatli ve destekleyici verilerle birlikte yorumlanmalıdır."
    },
    levels: {
      veryGood: "Çok iyi",
      good: "İyi düzey",
      average: "Ortalama",
      low: "Düşük",
      poor: "Belirgin güçlük"
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
      line1ok: "Katılımcının dikkat performansı yaş grubuna göre genel olarak yeterli düzeydedir.",
      line1low: "Katılımcının dikkat performansında yaş grubuna göre zorlanma gözlenmiştir.",
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
        definition: "Dikkat endeksi, hedef uyaranları fark etme ve görev boyunca dikkati sürdürebilme performansını değerlendirir.",
        c80: "Katılımcı dikkat sürdürme alanında yaş normlarına uygun performans göstermiştir. Belirgin dikkat kaybı veya görevden kopma örüntüsü gözlenmemiştir.",
        c70: "Dikkat performansı genel olarak yeterli düzeydedir; bazı bölümlerde kısa süreli dikkat dalgalanması izlenebilir.",
        c60: "Dikkat sürdürme alanında orta düzeyde zorlanma gözlenmiştir; ihmal oranı dikkatle değerlendirilmelidir.",
        cLow: "Dikkat alanında belirgin güçlük gözlenmiştir; hedef uyaranları kaçırma eğilimi dikkat çekmektedir."
      },
      timing: {
        title: "T — ZAMANLAMA",
        definition: "Zamanlama endeksi, doğru uyaranlara uygun hızda ve tutarlı şekilde tepki verebilme performansını değerlendirir.",
        c80: "Tepki zamanlaması genel olarak tutarlı ve yaşa uygun düzeydedir.",
        c70: "Tepki hızında hafif düzeyde değişkenlik gözlenmiştir. Görev boyunca zaman zaman gecikmiş yanıtlar oluşmuştur.",
        c60: "Zamanlama performansında orta düzeyde dalgalanma izlenmiştir; geç veya acele yanıtlar dikkat alanıdır.",
        cLow: "Tepki zamanlamasında belirgin zorluk gözlenmiştir; geç yanıt veya aşırı değişkenlik dikkat çekmektedir."
      },
      impulsivity: {
        title: "I — DÜRTÜSELLİK",
        definition: "Dürtüsellik endeksi, hedef dışı uyaranlara gereksiz tepki verme eğilimini (commission errors) değerlendirir.",
        c80: "Dürtü kontrolü genel olarak yeterlidir. Hedef dışı uyaranlara verilen tepkiler sınırlı düzeyde kalmıştır.",
        c70: "Dürtü kontrolü kabul edilebilir düzeydedir. Ancak bazı bölümlerde hedef dışı uyaranlara aceleci tepkiler gözlenmiştir.",
        c60: "Hafif dürtüsellik göstergeleri izlenmiştir; commission hataları takip edilmelidir.",
        cLow: "Belirgin dürtüsellik örüntüsü gözlenmiştir; hedef dışı uyaranlara sık tepki verilmiştir."
      },
      hyperactivity: {
        title: "H — HİPERAKTİVİTE",
        definition: "Hiperaktivite endeksi, motor tepkiyi durdurabilme ve gereksiz tuş kullanımını kontrol edebilme becerisini değerlendirir.",
        c80: "Motor kontrol performansı güçlü bulunmuştur. Mükerrer veya yönerge dışı yanıt örüntüsü gözlenmemiştir.",
        c70: "Motor kontrol genel olarak yeterlidir; ara sıra mükerrer basışlar izlenebilir.",
        c60: "Hafif motor hiperaktivite göstergeleri (mükerrer veya boş ekran basışı) gözlenmiştir.",
        cLow: "Motor kontrol alanında belirgin zorluk gözlenmiştir; mükerrer veya yönerge dışı basışlar dikkat çekmektedir."
      }
    },
    professional: {
      invalid1: "Bu test oturumu geçerlilik kriterlerini karşılamamaktadır.",
      invalid2: "Kritik geçersizlik bulguları nedeniyle performans skorları klinik yorum için kullanılmamalıdır.",
      invalid3: "Gerekirse test tekrar uygulanmalı ve katılımcının göreve katılım koşulları gözden geçirilmelidir.",
      coop: "Katılımcı değerlendirme boyunca yeterli işbirliği göstermiştir.",
      attOk: "Dikkat sürdürme performansı yaş normları içerisinde değerlendirilmiştir. Hedef uyaranları ayırt etme ve görevi sürdürme becerilerinde belirgin güçlük gözlenmemiştir.",
      attC70: "Dikkat performansı genel olarak yeterli düzeydedir; bazı bölümlerde kısa süreli dalgalanmalar izlenebilir.",
      attC60: "Dikkat sürdürme alanında orta düzeyde zorlanma gözlenmiştir; ihmal örüntüleri dikkatle değerlendirilmelidir.",
      attLow: "Dikkat sürdürme performansında yaş normlarının altında belirgin güçlük gözlenmiştir. İhmal örüntüleri dikkatle değerlendirilmelidir.",
      timOk: "Zamanlama performansı kabul edilebilir düzeydedir.",
      timC70: "Tepki hızında hafif düzeyde değişkenlik gözlenmiştir; zaman zaman gecikmiş yanıtlar oluşmuştur.",
      timC60: "Zamanlama performansında orta düzeyde dalgalanma izlenmiştir; geç veya acele yanıtlar dikkat alanıdır.",
      timLow: "Tepki zamanlamasında belirgin zorluk gözlenmiştir; geç yanıt veya aşırı değişkenlik dikkat çekmektedir.",
      impOk: "Dürtüsellik göstergeleri normal sınırlar içerisindedir. Hedef dışı uyaranlara verilen tepkiler sınırlı düzeyde kalmıştır.",
      impC70: "Dürtü kontrolü kabul edilebilir düzeydedir; bazı bölümlerde hedef dışı uyaranlara aceleci tepkiler gözlenmiştir.",
      impC60: "Hafif dürtüsellik göstergeleri izlenmiştir; commission hataları takip edilmelidir.",
      impLow: "Belirgin dürtüsellik örüntüsü gözlenmiştir; hedef dışı uyaranlara sık tepki verilmiştir.",
      hypOk: "Motor kontrol performansı güçlü bulunmuştur.",
      hypC70: "Motor kontrol genel olarak yeterlidir; ara sıra mükerrer basışlar izlenebilir.",
      hypC60: "Hafif motor hiperaktivite göstergeleri (mükerrer veya boş ekran basışı) gözlenmiştir.",
      hypLow: "Motor kontrol alanında belirgin zorluk gözlenmiştir; mükerrer veya yönerge dışı basışlar dikkat çekmektedir.",
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
        ["Genel skor", "A×0.35 + T×0.30 + I×0.20 + H×0.15"]
      ],
      normLevels: [
        { level: 1, label: "Çok iyi performans (Z ≥ 1.0)" },
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
    professional: "Professional Evaluation",
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
      veryGood: "Very good",
      good: "Good level",
      average: "Average",
      low: "Low",
      poor: "Marked difficulty"
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
      line1ok: "The participant's attention performance was generally adequate for their age group.",
      line1low: "Attention performance showed strain relative to the age group.",
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
        definition: "The attention index evaluates detecting target stimuli and sustaining attention throughout the task.",
        c80: "Sustained attention was within age norms. No marked inattention or disengagement was observed.",
        c70: "Attention performance was generally adequate; brief fluctuations may occur in some sections.",
        c60: "Moderate difficulty in sustained attention was observed; omission rate should be reviewed.",
        cLow: "Marked attention difficulty was observed; a tendency to miss targets is notable."
      },
      timing: {
        title: "T — TIMING",
        definition: "The timing index evaluates responding to correct stimuli at an appropriate speed and consistently.",
        c80: "Response timing was generally consistent and age-appropriate.",
        c70: "Mild variability in response speed was observed. Occasional delayed responses occurred during the task.",
        c60: "Moderate variability in timing was observed; late or rushed responses are areas of note.",
        cLow: "Marked timing difficulty was observed; late responses or excessive variability are notable."
      },
      impulsivity: {
        title: "I — IMPULSIVITY",
        definition: "The impulsivity index evaluates unnecessary responses to non-target stimuli (commission errors).",
        c80: "Impulse control was generally adequate. Responses to non-target stimuli remained limited.",
        c70: "Impulse control was acceptable, though occasional rushed responses to non-targets were observed.",
        c60: "Mild impulsivity indicators were observed; commission errors should be monitored.",
        cLow: "A marked impulsivity pattern was observed; frequent responses to non-target stimuli."
      },
      hyperactivity: {
        title: "H — HYPERACTIVITY",
        definition: "The hyperactivity index evaluates motor inhibition and control of unnecessary key use.",
        c80: "Motor control was strong. No marked repeated or off-task responding was observed.",
        c70: "Motor control was generally adequate; occasional repeated presses may occur.",
        c60: "Mild hyperactivity indicators (repeated or blank-screen presses) were observed.",
        cLow: "Marked motor control difficulty was observed; repeated or off-task presses are notable."
      }
    },
    professional: {
      invalid1: "This test session does not meet validity criteria.",
      invalid2: "Due to critical invalidity findings, performance scores must not be used for clinical interpretation.",
      invalid3: "If needed, the test should be repeated and task engagement conditions reviewed.",
      coop: "The participant showed adequate cooperation during the assessment.",
      attOk: "Sustained attention was within age norms. No marked difficulty was observed in discriminating targets or maintaining the task.",
      attC70: "Attention performance was generally adequate; brief fluctuations may occur in some sections.",
      attC60: "Moderate difficulty in sustained attention was observed; omission patterns should be reviewed.",
      attLow: "Sustained attention showed marked difficulty below age norms. Omission patterns should be reviewed carefully.",
      timOk: "Timing performance was at an acceptable level.",
      timC70: "Mild variability in response speed was observed; occasional delayed responses occurred.",
      timC60: "Moderate variability in timing was observed; late or rushed responses are areas of note.",
      timLow: "Marked timing difficulty was observed; late responses or excessive variability are notable.",
      impOk: "Impulsivity indicators were within normal limits. Responses to non-target stimuli remained limited.",
      impC70: "Impulse control was acceptable, though occasional rushed responses to non-targets were observed.",
      impC60: "Mild impulsivity indicators were observed; commission errors should be monitored.",
      impLow: "A marked impulsivity pattern was observed; frequent responses to non-target stimuli.",
      hypOk: "Motor control performance was strong.",
      hypC70: "Motor control was generally adequate; occasional repeated presses may occur.",
      hypC60: "Mild hyperactivity indicators (repeated or blank-screen presses) were observed.",
      hypLow: "Marked motor control difficulty was observed; repeated or off-task presses are notable.",
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
        ["Overall score", "A×0.35 + T×0.30 + I×0.20 + H×0.15"]
      ],
      normLevels: [
        { level: 1, label: "Very good performance (Z ≥ 1.0)" },
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
  }
};

export function getReportPdfStrings(locale = "tr") {
  return reportPdfStrings[locale] ?? reportPdfStrings.tr;
}

export function fillTemplate(str, vars = {}) {
  return String(str).replace(/\{\{(\w+)\}\}/g, (_, key) => (vars[key] != null ? String(vars[key]) : ""));
}

export function localizePhaseSectionName(name, locale = "tr") {
  const raw = String(name || "").replace(/^[^—]+—\s*/, "").trim();
  if (locale !== "en") {
    return raw.length > 28 ? `${raw.slice(0, 26)}…` : raw;
  }
  let s = raw
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
  return locale === "en" ? "en-US" : "tr-TR";
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
