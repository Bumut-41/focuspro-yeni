/** Testi della homepage marketing (IT). */
export const homePageIt = {
  nav: {
    home: "Home",
    about: "Cos'è FocusProLab?",
    who: "A chi è rivolto?",
    pros: "Domanda da specialista",
    centers: "Centri FocusProLab",
    faq: "Domande frequenti",
    contact: "Contatti",
    login: "Accedi",
    apply: "Domanda da specialista"
  },
  hero: {
    title: "Valutazione obiettiva di attenzione, impulsività e prestazione",
    subtitle:
      "FocusProLab è un sistema digitale di valutazione della prestazione che misura su più dimensioni attenzione sostenuta, tempismo, controllo degli impulsi e prestazione motoria.",
    ages: [
      { label: "Bambini (6–12)", icon: "👶" },
      { label: "Adolescenti (13–17)", icon: "🎓" },
      { label: "Adulti (18+)", icon: "💼" }
    ],
    ctaTest: "Inizia il test individuale",
    ctaExpert: "Pianifica il test con lo specialista",
    ctaApply: "Domanda da specialista",
    badges: [
      { icon: "⚡", label: "Risultati immediati" },
      { icon: "📄", label: "Report PDF" },
      { icon: "📅", label: "Programma di 12 settimane" },
      { icon: "💬", label: "Commento dell'esperto" }
    ],
    mockProfile: "Profilo di prestazione",
    mockReport: "Anteprima report PDF",
    mockScore: "78/100",
    mockCaption: "Prevalutazione professionale"
  },
  metrics: {
    title: "Cosa misura FocusProLab?",
    items: [
      { code: "A", label: "Attenzione", desc: "Notare i target e sostenere la concentrazione", color: "a", to: "/olcum/dikkat" },
      { code: "T", label: "Tempismo", desc: "Risposte tempestive e costanti", color: "t", to: "/olcum/zamanlama" },
      { code: "I", label: "Impulsività", desc: "Controllo delle risposte agli stimoli non target", color: "i", to: "/olcum/durtusellik" },
      { code: "H", label: "Iperattività", desc: "Controllo motorio e regolazione della risposta", color: "h", to: "/olcum/hiperaktivite" }
    ]
  },
  audience: {
    title: "Scegli l'opzione adatta a te",
    cards: [
      {
        key: "adult",
        theme: "blue",
        icon: "💼",
        title: "Sono un adulto",
        text: "Scopri il tuo profilo di attenzione e prestazione.",
        cta: "Inizia il test",
        to: "/kayit"
      },
      {
        key: "parent",
        theme: "teal",
        icon: "👨‍👩‍👧",
        title: "Sono un genitore",
        text: "Una valutazione sicura e basata sulla scienza per tuo figlio.",
        cta: "Inizia il test per bambini",
        to: "/kayit"
      },
      {
        key: "pro",
        theme: "purple",
        icon: "🩺",
        title: "Sono un clinico",
        text: "Invita i pazienti e gestisci i report dal pannello.",
        cta: "Vai al pannello clinico",
        to: "/giris"
      }
    ]
  },
  products: {
    title: "I nostri prodotti",
    items: [
      { icon: "🧠", title: "Test FocusProLab", desc: "Test di prestazione continua in più fasi", to: "/urun/focusprolab-testi" },
      { icon: "📊", title: "Report PDF", desc: "Report di prevalutazione professionale", to: "/urun/pdf-rapor" },
      { icon: "📅", title: "Programma di sviluppo di 12 settimane", desc: "Piano di follow-up strutturato", to: "/urun/gelisim-programi" },
      { icon: "💬", title: "Commento dell'esperto", desc: "Supporto all'interpretazione clinica", to: "/urun/uzman-yorumu" },
      { icon: "🎥", title: "Consulenza con l'esperto", desc: "Revisione online individuale", to: "/urun/uzman-gorusmesi" }
    ],
    cta: "Scopri di più"
  },
  professionals: {
    title: "Per i professionisti",
    items: ["Psicologi", "Psichiatri", "Consulenti scolastici", "Centri di educazione speciale", "Ospedali", "Scuole"],
    cta: "Domanda da specialista",
    to: "/uzman-basvuru",
    corporateCta: "Richiesta istituzionale",
    corporateTo: "/kurumsal-basvuru"
  },
  afterTest: {
    title: "Cosa succede dopo il test?",
    steps: [
      "Completa il test",
      "I risultati vengono analizzati",
      "Viene generato il report PDF",
      "I report di chi fa il test in modo individuale vengono inviati via e-mail. I test svolti con uno specialista compaiono anche nel pannello dello specialista.",
      "Si può pianificare un programma di sviluppo",
      "Consulenza facoltativa con l'esperto"
    ],
    cta: "Inizia il test"
  },
  faq: {
    title: "Domande frequenti",
    items: [
      {
        q: "FocusProLab formula una diagnosi?",
        a: "No. Il sistema offre solo una prevalutazione basata sulla prestazione; la diagnosi richiede il colloquio clinico e altri dati."
      },
      {
        q: "Quanto dura il test?",
        a: "Circa 15–20 minuti in base al profilo e all'età, più una breve prova."
      },
      {
        q: "Chi vede i risultati?",
        a: "Al termine del test non vedi una schermata dei risultati; compare il messaggio «Grazie per la partecipazione». I dati sono conservati in modo sicuro e al termine del test il report viene inviato alla tua e-mail. I test svolti con uno specialista possono essere visualizzati anche nella schermata dello specialista."
      },
      {
        q: "È adatto ai bambini?",
        a: "Sì. Ci sono scenari distinti per 6–12 anni, 13–17 anni e adulti."
      }
    ]
  },
  footer: {
    tag: "Una soluzione digitale affidabile per la valutazione dell'attenzione e della prestazione continua.",
    quickLinks: "Link rapidi",
    legal: "Note legali",
    contactTitle: "Contatti",
    phone: "+90 (212) 000 00 00",
    email: "info@focusprolab.com",
    address: "Istanbul, Türkiye",
    follow: "Seguici",
    legalLinks: ["Informativa sulla privacy", "Condizioni d'uso", "Protezione dei dati"],
    quickNav: [
      { label: "Home", href: "/" },
      { label: "Cos'è FocusProLab?", href: "#nedir" },
      { label: "A chi è rivolto?", href: "#kimler" },
      { label: "Domanda da specialista", href: "/uzman-basvuru" }
    ],
    copyright: "© {{year}} FocusProLab. Tutti i diritti riservati."
  },
  productPages: {
    test: {
      back: "Torna alla home",
      title: "Sistema di valutazione della prestazione FocusProLab",
      lead: "Oltre la misura dell'attenzione — una piattaforma digitale di nuova generazione per comprendere e sviluppare",
      intro: [
        "FocusProLab è una piattaforma digitale di valutazione della prestazione, basata su computer, sviluppata per valutare l'attenzione su più dimensioni in bambini, adolescenti e adulti.",
        "Con compiti digitali standardizzati il sistema analizza, tramite dati obiettivi, i processi cognitivi che compongono la prestazione attentiva. A differenza degli approcci tradizionali non guarda solo il numero di risposte corrette e errate: valuta insieme schemi di risposta, tempismo, controllo degli impulsi, comportamento motorio e prestazione con i distrattori, e costruisce un profilo personale e dettagliato.",
        "Questo approccio permette di distinguere punti di forza e aree di sviluppo, così la valutazione è orientata sia al risultato sia allo sviluppo."
      ],
      areasTitle: "Ambiti di prestazione valutati",
      areas: [
        {
          code: "A",
          color: "a",
          label: "Attenzione",
          en: "Attention",
          points: ["Attenzione sostenuta", "Attenzione selettiva", "Focus sul target", "Continuità della prestazione"]
        },
        {
          code: "T",
          color: "t",
          label: "Tempismo",
          en: "Timing",
          points: ["Tempo di reazione", "Costanza della risposta", "Controllo del ritmo", "Rispondere al momento giusto"]
        },
        {
          code: "I",
          color: "i",
          label: "Impulsività",
          en: "Impulsivity",
          points: ["Inibizione della risposta", "Tendenza a rispondere agli stimoli non target", "Controllo decisionale", "Autoregolazione comportamentale"]
        },
        {
          code: "M",
          color: "m",
          label: "Controllo motorio",
          en: "Motor control",
          points: ["Risposte motorie inutili", "Schemi di comportamento ripetitivi", "Inibizione motoria", "Controllo del comportamento"]
        },
        {
          code: "Ç",
          color: "c",
          label: "Resistenza ai distrattori",
          en: "Distractor resistance",
          points: [
            "Prestazione con distrattori visivi",
            "Prestazione con distrattori uditivi",
            "Capacità di rifocalizzare l'attenzione",
            "Quanto gli stimoli ambientali incidono sulla prestazione"
          ]
        }
      ],
      processTitle: "Svolgimento del test",
      process: [
        "Circa 13–15 minuti",
        "Interamente digitale",
        "Flusso di compiti standardizzato",
        "Analisi obiettiva della prestazione",
        "Infrastruttura dati sicura"
      ],
      processIcons: ["⏱️", "💻", "📊", "📈", "🔒"],
      afterTitle: "Cosa aspettarsi dopo il test",
      afterLead: "Dopo il test i dati di prestazione vengono analizzati e viene creato un profilo personale.",
      afterHint: "In base alle tue esigenze puoi usare questi servizi:",
      services: [
        { icon: "📄", title: "Report PDF dettagliato della prestazione" },
        { icon: "🧠", title: "Commento dello psicologo clinico" },
        { icon: "📅", title: "Programma di sviluppo personalizzato di 12 settimane" },
        { icon: "💻", title: "Consulenza online con l'esperto" }
      ],
      afterNote: "Tutti questi servizi sono facoltativi. Ogni persona può pianificare la valutazione in base alle proprie esigenze.",
      approachTitle: "L'approccio FocusProLab",
      approach: [
        "FocusProLab non è solo un sistema che misura l'attenzione.",
        "Lo scopo è analizzare la prestazione con dati obiettivi, individuare punti di forza e aree di sviluppo e, se serve, orientare un intervento basato sulla scienza.",
        "Riunisce valutazione, report dettagliato, programmi personalizzati e supporto dell'esperto in un'unica piattaforma."
      ],
      noticeTitle: "Informazione importante",
      notice: [
        "FocusProLab non formula diagnosi e non sostituisce una valutazione clinica.",
        "I dati della piattaforma vanno considerati insieme al colloquio clinico, alla valutazione psicologica, all'osservazione e ad altre misure. I risultati sostengono la decisione dei professionisti con dati obiettivi."
      ]
    },
    report: {
      back: "Torna alla home",
      kicker: "Report PDF",
      title: "Report professionale della prestazione",
      lead: "Dopo il test il sistema crea per te un PDF dettagliato.",
      contentsTitle: "Cosa contiene il report?",
      contents: [
        { icon: "📈", title: "Punteggio complessivo di prestazione" },
        { icon: "📊", title: "Profilo A-T-I-H-C" },
        { icon: "📉", title: "Punti di forza" },
        { icon: "⚠️", title: "Aree da sviluppare" },
        { icon: "📝", title: "Spiegazioni in stile commento clinico" },
        { icon: "🎯", title: "Raccomandazioni personalizzate" }
      ],
      deliveryTitle: "Consegna",
      delivery: "Inviato al tuo indirizzo e-mail in PDF.",
      audienceTitle: "A chi è rivolto?",
      audience: [
        "Bambini e adolescenti",
        "Utenti adulti",
        "Psicologi",
        "Psichiatri",
        "Ospedali",
        "Scuole",
        "Risorse umane"
      ],
      cta: "Inizia il test"
    },
    program: {
      back: "Torna alla home",
      title: "Programma di sviluppo di 12 settimane",
      lead: "Un sistema digitale di sviluppo personalizzato",
      notes: ["Non tutti ricevono lo stesso programma.", "Il programma è costruito interamente sui risultati del test."],
      contentsTitle: "Contenuti",
      contents: [
        "Esercizi digitali quotidiani",
        "Compiti di vita",
        "Obiettivi settimanali",
        "Grafici dei progressi",
        "Test di controllo"
      ],
      goalTitle: "Scopo",
      goal: "Migliorare la prestazione in modo regolare e seguire il cambiamento con dati obiettivi.",
      durationTitle: "Durata",
      duration: "12 settimane",
      dailyTitle: "Ogni giorno",
      daily: "20–25 minuti",
      cta: "Programma di 12 settimane",
      trial: "Il programma è in fase di prova."
    },
    commentary: {
      back: "Torna alla home",
      title: "Commento dell'esperto",
      lead: "Fai esaminare i risultati da un esperto",
      intro: "I dati del report PDF sono interpretati clinicamente da specialisti del settore.",
      includesTitle: "Il servizio include",
      includes: [
        "Spiegazione dei risultati del test",
        "Valutazione dei punti di forza",
        "Individuazione delle aree di sviluppo",
        "Interpretazione degli effetti sulla vita quotidiana",
        "Raccomandazioni su misura"
      ],
      note: "Questo servizio non ha lo scopo di formulare una diagnosi. Offre un feedback professionale che sostiene la valutazione clinica.",
      deliveryTitle: "Come viene consegnato",
      delivery: "Report scritto di valutazione dell'esperto",
      cta: "Richiedi il commento dell'esperto"
    },
    consultation: {
      back: "Torna alla home",
      title: "Consulenza con l'esperto",
      lead: "Rivediamo insieme i risultati",
      intro: "In un incontro online individuale lo specialista esamina con te risultati, report PDF ed esigenze.",
      sessionTitle: "Nella seduta",
      session: [
        { icon: "🧠", title: "Spiegazione dettagliata dei risultati" },
        { icon: "📊", title: "Il tuo profilo di prestazione" },
        { icon: "🎯", title: "Obiettivi di sviluppo" },
        { icon: "📅", title: "Un piano di lavoro su misura" },
        { icon: "👨‍👩‍👧", title: "Colloquio con i genitori (per i bambini)" }
      ],
      durationTitle: "Durata",
      duration: "50 minuti",
      formatTitle: "Incontro",
      format: "Online (Zoom / Google Meet e simili)",
      outcomeTitle: "Al termine",
      outcomes: ["Una roadmap", "Raccomandazioni", "Risposte alle tue domande"],
      cta: "Prenota un appuntamento"
    }
  },
  specialist: {
    back: "Torna alla home",
    title: "Modulo di domanda specialista FocusProLab",
    lead: "Entra nella rete di specialisti FocusProLab",
    intro:
      "Puoi candidarti per usare i sistemi di valutazione e sviluppo FocusProLab nella tua pratica professionale. Le domande sono valutate in base al profilo professionale e all’uso previsto.",
    corporateLink: "Se candidi un’organizzazione, usa il modulo istituzionale.",
    sections: {
      personal: "Dati personali",
      professional: "Dati professionali",
      documents: "Documenti",
      purpose: "Uso previsto di FocusProLab",
      consents: "Conferme"
    },
    fields: {
      name: "Nome e cognome *",
      email: "E-mail *",
      phone: "Cellulare *",
      city: "Città *",
      birth: "Data di nascita",
      birthHint: "Facoltativo",
      profession: "Professione *",
      professionHint: "Puoi selezionarne più di una.",
      otherExplain: "Specifica",
      university: "Università *",
      department: "Corso di laurea *",
      graduationYear: "Anno di laurea",
      postgraduate: "Magistrale / dottorato",
      workplace: "Ente / clinica",
      experience: "Esperienza professionale",
      practiceAreas: "Specializzazioni / ambiti di lavoro",
      diploma: "Diploma",
      certificate: "Attestato di specializzazione o magistrale (se presente)",
      fileHint: "PDF, JPG o PNG. Massimo 8 MB.",
      purpose: "Per quali scopi prevedi di usare FocusProLab?",
      purposeHint: "Puoi selezionare più di una opzione.",
      heard: "Come hai conosciuto FocusProLab?",
      motivation: "Qual è il motivo principale per cui vuoi diventare specialista FocusProLab?"
    },
    professions: [
      { key: "clinical_psychologist", label: "Psicologo clinico" },
      { key: "psychologist", label: "Psicologo" },
      { key: "counselor", label: "Counselor / orientatore" },
      { key: "psychiatrist", label: "Psichiatra" },
      { key: "child_psychiatrist", label: "Psichiatra dell’infanzia e dell’adolescenza" },
      { key: "other", label: "Altro" }
    ],
    purposes: [
      { key: "attention", label: "Valutazione dell’attenzione" },
      { key: "child_adolescent", label: "Valutazioni di bambini e adolescenti" },
      { key: "adult", label: "Valutazioni degli adulti" },
      { key: "adhd", label: "Come supporto nel percorso di valutazione ADHD" },
      { key: "cognitive", label: "Valutazione della prestazione cognitiva" },
      { key: "program12", label: "Sistema di 12 settimane per attenzione e concentrazione" },
      { key: "followup", label: "Follow-up clinico" },
      { key: "education", label: "Scuola / formazione" },
      { key: "research", label: "Ricerca accademica" },
      { key: "corporate", label: "Uso organizzativo" },
      { key: "other", label: "Altro" }
    ],
    sources: [
      { key: "instagram", label: "Instagram" },
      { key: "linkedin", label: "LinkedIn" },
      { key: "colleague", label: "Consiglio di un collega" },
      { key: "event", label: "Formazione o evento" },
      { key: "institution", label: "Ente" },
      { key: "search", label: "Ricerca su internet" },
      { key: "other", label: "Altro" }
    ],
    consents: [
      { key: "accuracy", label: "Dichiaro che le informazioni fornite sono corrette." },
      { key: "privacy", label: "Ho letto l’informativa sul trattamento dei dati personali inviati con questa domanda." },
      { key: "terms", label: "Accetto che i sistemi FocusProLab vadano usati nel rispetto della competenza professionale e delle condizioni d’uso." }
    ],
    submit: "Invia la domanda",
    required: "Compila i campi obbligatori, almeno una professione e una finalità, la fonte e le tre conferme.",
    fileInvalid: "I documenti devono essere PDF, JPG o PNG e non superare 8 MB.",
    success: "La tua domanda è stata ricevuta. Sarà valutata in base al profilo professionale e all’uso previsto. Se approvata, verrà assegnato l’accesso da specialista.",
    saveError: "Impossibile salvare la domanda. Riprova tra poco.",
    noFile: "Non caricato",
    openFile: "Apri documento"
  },
  corporate: {
    back: "Torna alla home",
    title: "Richiesta istituzionale",
    lead: "Programma di partnership FocusProLab",
    intro: [
      "FocusProLab offre a enti e organizzazioni il sistema di valutazione di attenzione, impulsività e prestazione cognitiva, con soluzioni su misura.",
      "Puoi richiedere di usare nella tua organizzazione un sistema digitale di valutazione e report basato sulla scienza."
    ],
    whoTitle: "Chi può fare richiesta?",
    who: [
      "Centri di psicologia",
      "Cliniche psichiatriche",
      "Centri di consulenza scolastica",
      "Centri di educazione speciale e riabilitazione",
      "Ospedali",
      "Centri medici",
      "Scuole",
      "Università",
      "Comuni",
      "Aziende"
    ],
    processTitle: "Cosa succede dopo la richiesta",
    process: [
      { title: "Valutazione iniziale", text: "Vengono analizzate le esigenze della tua organizzazione." },
      { title: "Incontro di presentazione online", text: "Tutte le funzioni del sistema vengono illustrate nel dettaglio." },
      { title: "Account demo", text: "I tuoi specialisti possono provare il sistema su casi reali." },
      { title: "Formazione e installazione", text: "Tutti gli specialisti ricevono una formazione pratica." },
      { title: "Attivazione istituzionale", text: "Viene aperto un pannello di gestione per la tua organizzazione. Si creano gli account degli specialisti. Inizia l'uso dei test." }
    ],
    benefitsTitle: "Cosa ricevono le organizzazioni",
    benefits: [
      "Valutazione digitale dell'attenzione basata sulla scienza",
      "Report PDF automatici",
      "Pannello di gestione per gli specialisti",
      "Storia di pazienti e clienti",
      "Statistiche specifiche per l'organizzazione",
      "Supporto per più specialisti",
      "Sistema cloud sicuro",
      "Assistenza tecnica continua",
      "Supporto a formazione e aggiornamenti"
    ],
    formTitle: "Modulo di richiesta",
    fields: {
      org: "Nome dell'organizzazione",
      contact: "Referente autorizzato",
      role: "Ruolo",
      phone: "Telefono",
      email: "E-mail",
      country: "Paese",
      city: "Città",
      cityPlaceholder: "Seleziona una città",
      type: "Tipo di organizzazione",
      typePlaceholder: "Seleziona il tipo",
      experts: "Numero di specialisti",
      clients: "Clienti stimati al mese",
      message: "Il tuo messaggio"
    },
    types: [
      "Centri di consulenza psicologica",
      "Clinica psichiatrica",
      "Unità private di professioni sanitarie",
      "Ospedale",
      "Scuola",
      "Centro di educazione speciale",
      "Università",
      "Azienda",
      "Altro"
    ],
    submit: "Invia la richiesta",
    required: "Compila tutti i campi obbligatori.",
    success: "La richiesta è stata ricevuta. Ti contatteremo al più presto.",
    saveError: "Non è stato possibile salvare la richiesta. Riprova tra poco."
  },
  metricPages: {
    back: "Torna alla home",
    items: {
      dikkat: {
        code: "A",
        color: "a",
        title: "Attenzione",
        en: "Attention",
        desc: "Notare i target e sostenere la concentrazione",
        points: ["Attenzione sostenuta", "Attenzione selettiva", "Focus sul target", "Continuità della prestazione"]
      },
      zamanlama: {
        code: "T",
        color: "t",
        title: "Tempismo",
        en: "Timing",
        desc: "Risposte tempestive e costanti",
        points: ["Tempo di reazione", "Costanza della risposta", "Controllo del ritmo", "Rispondere al momento giusto"]
      },
      durtusellik: {
        code: "I",
        color: "i",
        title: "Impulsività",
        en: "Impulsivity",
        desc: "Controllo delle risposte agli stimoli non target",
        points: ["Inibizione della risposta", "Tendenza a rispondere agli stimoli non target", "Controllo decisionale", "Autoregolazione comportamentale"]
      },
      hiperaktivite: {
        code: "H",
        color: "h",
        title: "Iperattività",
        en: "Hyperactivity",
        desc: "Controllo motorio e regolazione della risposta",
        points: ["Risposte motorie inutili", "Schemi di comportamento ripetitivi", "Inibizione motoria", "Controllo del comportamento"]
      }
    }
  },
  centersPage: {
    back: "Torna alla home",
    title: "Centri FocusProLab",
    lead: "La valutazione FocusProLab è disponibile nei centri qui sotto.",
    address: "Indirizzo",
    phone: "Telefono",
    directions: "Indicazioni",
    openMap: "Apri in Google Maps",
    view: "Vedi i centri"
  },
  contactPage: {
    back: "Torna alla home",
    kicker: "Contatti",
    title: "Contatta FocusProLab",
    intro: [
      "FocusProLab vuole sviluppare collaborazioni con professionisti, organizzazioni e fornitori di tecnologia nell’ambito della psicologia digitale, della valutazione cognitiva e delle tecnologie per lo sviluppo.",
      "Compila il modulo qui sotto per informazioni su prodotti, uso da specialista, soluzioni per le organizzazioni, un problema o una collaborazione."
    ],
    formTitle: "Modulo di contatto",
    fields: {
      name: "Nome e cognome *",
      namePlaceholder: "Scrivi nome e cognome",
      email: "Indirizzo e-mail *",
      emailPlaceholder: "nome@email.com",
      phone: "Numero di telefono",
      phonePlaceholder: "+90 5XX XXX XX XX",
      profession: "Professione / titolo",
      professionPlaceholder: "Es. psicologo clinico, psicologo, psichiatra, accademico",
      organization: "Ente / azienda",
      organizationPlaceholder: "L’ente o l’azienda in cui lavori, se presente",
      location: "Città / paese",
      locationPlaceholder: "Istanbul / Turchia",
      subject: "Oggetto *",
      subjectPlaceholder: "Seleziona un oggetto",
      message: "Il tuo messaggio *",
      messagePlaceholder: "Come possiamo aiutarti? Descrivi brevemente la richiesta o la proposta di collaborazione."
    },
    subjects: [
      { key: "products", label: "Informazioni su prodotti e sistemi" },
      { key: "specialist", label: "Uso da specialista / domanda da specialista" },
      { key: "program12", label: "Sistema di 12 settimane per attenzione e concentrazione" },
      { key: "corporate", label: "Collaborazione organizzativa" },
      { key: "hospital", label: "Collaborazione con ospedale / clinica" },
      { key: "university", label: "Università / ricerca accademica" },
      { key: "school", label: "Scuola / ente di formazione" },
      { key: "technology", label: "Tecnologia / integrazione" },
      { key: "international", label: "Partnership internazionale / sviluppo commerciale" },
      { key: "support", label: "Supporto tecnico" },
      { key: "press", label: "Stampa / eventi / formazione" },
      { key: "other", label: "Altro" }
    ],
    submit: "INVIA IL TUO MESSAGGIO",
    required: "Compila nome, e-mail, oggetto e messaggio.",
    thanksTitle: "Grazie.",
    thanksBody: "Il tuo messaggio è arrivato al team FocusProLab. Ti contatteremo dopo aver esaminato la richiesta.",
    saveError: "Impossibile inviare il messaggio. Riprova tra poco."
  },
  sections: {
    about: "FocusProLab misura in modo obiettivo attenzione e prestazione continua in presenza di distrattori che simulano la vita reale.",
    centers: "Qui trovi indirizzo, telefono e posizione sulla mappa dei centri FocusProLab a Istanbul.",
    contactLead: "Contattaci per richieste istituzionali e partnership.",
    contactCta: "Modulo di contatto"
  }
};
