import { homeIt } from "./homeIt.js";
import { homePageIt } from "./homePageIt.js";

export const it = {
  meta: {
    lang: "it",
    dateLocale: "it-IT",
    title: "FocusProLab",
    description: "FocusProLab — Test di attenzione"
  },
  nav: {
    brandTagline: "Valutazione della prestazione continua",
    panel: "Pannello",
    test: "Test",
    admin: "Admin",
    home: "Home",
    login: "Accedi",
    register: "Registrati",
    logout: "Esci"
  },
  common: {
    wait: "Attendere…",
    loading: "Caricamento…",
    testLoading: "Caricamento del test…",
    continue: "Continua",
    save: "Salva",
    delete: "Elimina",
    close: "Chiudi",
    you: "Tu",
    or: "oppure",
    select: "Seleziona",
    backToPanel: "← Torna al pannello",
    panelBack: "Torna al pannello",
    ok: "OK",
    yes: "Sì",
    no: "No",
    dash: "—",
    error: "Si è verificato un errore."
  },
  auth: {
    setupTitle: "Configurazione Supabase necessaria",
    setupDesc: "Aggiungi VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY al file `.env`.",
    setupDescRegister: "Vedi docs/SAAS_SENARYO.md.",
    loginTitle: "Accedi",
    loginSub: "Entra nel tuo account e continua le valutazioni.",
    email: "E-mail",
    password: "Password",
    loginBtn: "Accedi con e-mail",
    noAccount: "Non hai un account?",
    registerLink: "Registrati",
    registerTitle: "Registrati",
    registerSub: "Per registrarti devi avere almeno 18 anni.",
    registerEmailHint: "oppure registrati con e-mail",
    fullName: "Nome e cognome",
    birthDate: "Data di nascita",
    birthDateMember: "Data di nascita (utente)",
    birthDateMember18: "Data di nascita (utente — 18+)",
    accountType: "Tipo di account",
    registerBtn: "Registrati",
    hasAccount: "Ho già un account",
    age18Required: "Per registrarti devi avere almeno 18 anni.",
    passwordMin: "La password deve avere almeno 6 caratteri.",
    registerSuccess: "Account creato. Se la conferma e-mail è attiva, controlla la posta e poi accedi.",
    completeProfileTitle: "Completa il profilo",
    completeProfileSub: "Hai effettuato l'accesso con Google. Inserisci questi dati una sola volta per continuare.",
    saving: "Salvataggio…",
    googleContinue: "Continua con Google",
    redirecting: "Reindirizzamento…",
    oauthError: "Impossibile avviare l'accesso. Verifica che il provider sia attivo in Supabase.",
    googleHint: "Al primo accesso con Google viene chiesto un breve profilo (18+, tipo di account).",
    roleIndividual: "Utente individuale",
    rolePsychologist: "Psicologo",
    roleIndividualShort: "Individuale"
  },
  setup: {
    title: "Configurazione",
    desc: "Compila il file `.env` per la connessione a Supabase. Vedi docs/SAAS_SENARYO.md"
  },
  error: {
    pageTitle: "Impossibile caricare la pagina",
    pageDesc:
      "L'applicazione si è interrotta per un errore imprevisto. Aggiorna la pagina; se il problema persiste, invia questo messaggio allo sviluppatore."
  },
  home: { ...homeIt, marketing: homePageIt },
  dashboard: {
    welcome: "Benvenuto, {{name}}",
    description: "Gestisci qui le valutazioni di attenzione e prestazione continua.",
    pdfAutoSave: "Al termine del test il PDF del report viene salvato automaticamente e si apre dall'elenco qui sotto.",
    resultsPrivate:
      "Quando completi un test, la partecipazione viene registrata. I report dei risultati sono visibili solo agli amministratori autorizzati.",
    guideHint: "Il flusso del test mostra una guida in 3 parti: uso del sistema, scenari del test e comportamenti misurati.",
    newTest: "Avvia un nuovo test",
    adminPanel: "Pannello admin",
    historyTitle: "I tuoi test precedenti",
    historyDesc: "Report PDF del partecipante — visibile dal pannello.",
    noTests: "Nessun test salvato.",
    noTestsDesc: "Avvia la prima valutazione.",
    date: "Data",
    participant: "Partecipante",
    profile: "Profilo",
    overallScore: "Punteggio complessivo",
    testReport: "Report del test",
    openReport: "Scarica il report",
    downloadReport: "Scarica il report",
    generateReport: "Genera il report",
    pdfPreparing: "Preparazione del PDF…",
    pdfOpenFailed: "Impossibile aprire il PDF."
  },
  invite: {
    pageTitle: "Invito al test",
    pageDesc: "{{psychologist}} ti ha invitato a un test di attenzione FocusProLab. Per continuare registrati o accedi con {{email}}.",
    expiresAt: "Invito valido fino al: {{date}}",
    expired: "Questo invito è scaduto.",
    alreadyCompleted: "Questo invito è già stato usato.",
    registerBtn: "Registrati e inizia il test",
    loginBtn: "Accedi",
    accepting: "Verifica dell'invito…",
    backHome: "Torna alla home",
    registerTitle: "Registrazione su invito",
    registerSub: "Crea un account individuale con l'invito del tuo specialista. Dopo la registrazione verrai portato al test.",
    loginTitle: "Accesso su invito",
    loginSub: "Accedi con l'e-mail che ha ricevuto l'invito, poi avvia il test.",
    panelTitle: "Inviti al test",
    panelDesc: "Invita i partecipanti con crediti demo. Ogni invito vale 3 giorni; i risultati compaiono solo nel tuo pannello.",
    creditsLeft: "{{count}} crediti",
    buyDemoCredits: "Demo: acquista {{count}} crediti test",
    recipientEmail: "E-mail del partecipante",
    sendHint: "Viene scalato 1 credito. Al partecipante viene inviato un link valido 3 giorni.",
    sendBtn: "Invia invito",
    sentSuccess: "Invito inviato a {{email}}.",
    creditsPurchased: "Aggiunti {{count}} crediti demo.",
    listTitle: "Inviti inviati",
    listDesc: "Inviti in attesa, accettati e completati.",
    noInvites: "Nessun invito.",
    noInvitesDesc: "Invia il primo invito dal modulo sopra.",
    colDate: "Data",
    colEmail: "E-mail",
    colStatus: "Stato",
    colExpires: "Scadenza",
    status: {
      pending: "In attesa",
      accepted: "Accettato",
      completed: "Completato",
      expired: "Scaduto",
      cancelled: "Annullato"
    },
    errNotFound: "Invito non trovato.",
    errExpired: "Questo invito è scaduto.",
    errUsed: "Questo invito è già stato usato.",
    errCancelled: "L'invito è stato annullato.",
    errEmailMismatch: "L'e-mail di accesso non coincide con quella dell'invito.",
    errIndividualOnly: "Gli inviti sono solo per gli account individuali.",
    errTaken: "Questo invito è assegnato a un altro utente.",
    errNoCredits: "Crediti test insufficienti.",
    errInvalidEmail: "Inserisci un'e-mail valida.",
    errForbidden: "Non hai l'autorizzazione per questa operazione."
  },
  clients: {
    title: "I miei clienti",
    desc: "Registra il cliente una sola volta. Puoi inviargli il test via e-mail oppure sceglierlo dall'elenco quando avvii un test.",
    name: "Nome e cognome",
    birth: "Data di nascita",
    email: "E-mail",
    save: "Salva cliente",
    saved: "Cliente salvato.",
    sendTest: "Invia il test via e-mail",
    sent: "Il link del test è stato inviato a {{email}}.",
    listEmpty: "Nessun cliente.",
    listEmptyDesc: "Registra il primo cliente con il modulo sopra.",
    pickTitle: "Scegli un cliente registrato",
    pickDesc: "Sono elencati solo i clienti che hai registrato. La persona selezionata non compila altri dati.",
    pickEmpty: "Nessun cliente registrato. Aggiungine uno dal pannello.",
    backToPanel: "Torna al pannello",
    startTest: "Inizia il test",
    errPick: "Seleziona un cliente per avviare il test.",
    errDuplicate: "Hai già un cliente con questa e-mail.",
    errSave: "Impossibile salvare il cliente. Se manca la tabella, esegui una volta lo SQL specialist_clients in Supabase."
  },
  test: {
    participantTitle: "Dati del partecipante",
    participantDesc: "Inserisci i dati del partecipante per questa sessione di valutazione.",
    participantDescInvite: "Stai iniziando un test su invito del tuo specialista. Inserisci i dati del partecipante; i risultati sono visibili solo allo specialista.",
    gender: "Sesso",
    genderFemale: "Donna",
    genderMale: "Uomo",
    consent: "Consenso del genitore / rappresentante legale ottenuto.",
    errName: "Inserisci nome e cognome.",
    errBirth: "Data di nascita valida (6–99 anni).",
    errGender: "Seleziona il sesso.",
    errConsent: "Per bambini e adolescenti seleziona la casella del consenso.",
    saved: "Test salvato. Preparazione del report PDF…",
    noCredits: "Salvataggio non riuscito: non restano crediti test.",
    saveError: "Errore di salvataggio: {{msg}}",
    pdfSaveFailed: "Salvataggio PDF non riuscito; riprova con «Scarica PDF».",
    newTest: "Nuovo test",
    devTimer: "Timer di prova",
    stepGuide: "Passo 3 / 5 · Guida del partecipante",
    stepSpace: "Passo 1 / 5 · Controllo tasto",
    stepAudio: "Passo 2 / 5 · Controllo audio",
    stepMain: "Passo 5 / 5 · Test principale",
    spaceTitle: "Proviamo prima il tasto SPAZIO",
    spaceSub: "Premi o tocca il tasto SPAZIO una volta.",
    spaceNudge: "Premi ↓",
    spaceOk: "OK — SPAZIO rilevato",
    spaceTouch: "Tocca per continuare",
    audioTitle: "Ora controlliamo l'audio",
    audioSub:
      "Parte automaticamente un breve suono di prova. Premi verde se lo hai sentito bene, rosso se non lo hai sentito.",
    audioHeard: "Ho sentito il suono",
    audioNotHeard: "Non l'ho sentito",
    audioPlayError:
      "Il suono non è partito automaticamente. Prova «Non l'ho sentito» e controlla volume e cuffie.",
    audioRetry: "Se non lo hai sentito, alza il volume o controlla le cuffie. Il suono di prova viene ripetuto…",
    practiceBanner: "Prova — 30 sec (tutte le sezioni, non registrata)",
    startTest: "Inizia il test",
    prep: {
      continue: "Continua",
      paragraphs: [
        "Prima di iniziare il test, leggi attentamente le istruzioni sullo schermo e segui i passaggi di ogni fase nell'ordine indicato. Durante il test è importante rispondere secondo le istruzioni.",
        "Assicurati di essere in un ambiente silenzioso, che la connessione internet sia stabile e che nulla ti distragga durante il test. Dopo l'inizio del test non aggiornare la pagina, non usare il pulsante indietro e non interrompere la sessione."
      ]
    },
    thankYouTitle: "Grazie per la partecipazione",
    thankYouRedirect: "Tra 30 secondi verrai riportato alla home.",
    thankYouInviteRedirect: "Il test è completato. I risultati saranno visibili solo al tuo specialista. Tra poco verrai riportato alla home.",
    qaHint:
      "Modalità temporanea: solo sezioni GIF silenziose e GIF silenziose+audio (~6 min). Solo audio, baseline e chiusura disattivate.",
    participantGuide: {
      title: "Guida del partecipante",
      stepOf: "Sezione {{current}} / {{total}}",
      tabs: {
        usage: "Uso del sistema",
        scenarios: "Scenari del test",
        criteria: "Cosa si misura"
      },
      usage: {
        title: "Come si usa il sistema?",
        lead: "Completerai questi passi in ordine:",
        steps: [
          "Accedi o registrati sul sito",
          "Inserisci i dati del partecipante",
          "Controllo del tasto SPAZIO e dell'audio",
          "Leggi questa guida",
          "Prova di 30 secondi (non registrata)",
          "Test principale con il pulsante «Inizia il test»",
          "Schermata di ringraziamento → ritorno alla home"
        ],
        ruleTitle: "La regola per tutto il test",
        rule: "Premi SPAZIO una sola volta, rapidamente, solo quando vedi il triangolo blu."
      },
      scenarios: {
        title: "Scenari del test",
        lead: "In ogni sezione sullo schermo compaiono cose diverse. Il compito resta lo stesso.",
        happensLabel: "Cosa succede?",
        actionLabel: "Cosa devi fare?",
        actionDefault:
          "Ogni volta che vedi un triangolo blu, premi la barra spaziatrice. Non reagire alle altre forme.",
        items: [
          {
            title: "Prova (30 sec)",
            happens: "Versione breve del test principale; tutti i tipi di sezione compaiono per poco. Non viene registrata."
          },
          {
            title: "Senza distrattori",
            happens: "Compaiono solo le forme; niente GIF né suoni extra."
          },
          {
            title: "Immagini in movimento silenziose",
            happens: "Animazioni GIF silenziose ai bordi dello schermo."
          },
          {
            title: "Solo audio",
            happens: "Senti brevi segnali sonori, senza immagini."
          },
          {
            title: "Immagine + suono",
            happens: "Distrattori GIF e sonori compaiono insieme."
          },
          {
            title: "Sezione di chiusura",
            happens: "Verso la fine i distrattori diminuiscono."
          }
        ]
      },
      criteria: {
        title: "Quali comportamenti vengono valutati?",
        lead: "Ogni pressione di SPAZIO viene registrata. Si calcolano quattro aree distinte, senza sovrapposizioni:",
        measuresLabel: "Misura:",
        items: [
          {
            code: "A",
            title: "Attenzione",
            desc: "Quanto resti sul target",
            measures: "Omissioni — non premere quando compare il target (triangolo blu)"
          },
          {
            code: "T",
            title: "Tempismo",
            desc: "Se le risposte sono tempestive e costanti",
            measures: "Risposta in tempo, velocità RT, risposta tardiva e stabilità RT (formula T ponderata)"
          },
          {
            code: "I",
            title: "Impulsività",
            desc: "Tendenza a rispondere per primi agli stimoli non target",
            measures: "Errori di commissione — prime risposte a stimoli non target"
          },
          {
            code: "H",
            title: "Iperattività",
            desc: "Uso eccessivo o fuori compito del tasto",
            measures: "Pressioni ripetute + pressioni a schermo vuoto"
          }
        ],
        privacy:
          "Dopo il test non vedrai una schermata dei risultati, ma «Grazie per la partecipazione». I dati sono conservati in modo sicuro e rivisti solo da professionisti autorizzati."
      },
      next: "Continua",
      back: "Indietro",
      startPractice: "Inizia la prova"
    },
    instructions: {
      title: "Istruzioni del test di attenzione FocusProLab",
      practiceBtn: "Clicca per la prova",
      paragraphs: [
        "In questo test vedrai forme diverse sullo schermo.",
        "Il tuo compito è premere la barra spaziatrice una volta, il più rapidamente possibile, ogni volta che vedi il triangolo blu.",
        "Non premere per nessuna forma diversa dal triangolo blu.",
        "Per esempio non premere per quadrato blu, triangolo verde, cerchio rosso, più nero o qualsiasi altra forma.",
        "Dopo queste istruzioni farai una prova di 30 secondi simile al test vero: senza distrattori, poi brevi GIF silenziose, solo audio e sezioni combinate. Questa prova non viene registrata.",
        "Ricorda: premi la barra spaziatrice una volta, il più rapidamente possibile, ogni volta che vedi il triangolo blu."
      ],
      briefExtra: "Quando sei pronto puoi avviare il test principale.",
      briefEmphasis:
        "Ricorda: premi la barra spaziatrice una volta, il più rapidamente possibile, ogni volta che vedi il triangolo blu"
    }
  },
  report: {
    title: "Report di valutazione",
    meta: "{{name}} · età {{age}} · {{profile}}",
    overall: "Complessivo",
    attention: "A — Attenzione",
    timing: "T — Tempismo",
    impulsivity: "I — Impulsività",
    hyperactivity: "H — Iperattività",
    clinicalFlags: "Segnalazioni cliniche",
    validity: "Validità",
    pdfDownload: "Scarica PDF",
    pdfSaveDownload: "Salva / scarica PDF",
    pdfFailed: "Operazione PDF non riuscita. Riprova.",
    pdfCreateFailed: "Impossibile creare il PDF."
  },
  admin: {
    title: "Amministrazione",
    description:
      "Tutti gli utenti e i risultati dei test. Per ogni sessione scarica il report del partecipante e il PDF delle pressioni.",
    superHint: "Super Admin: tutte le azioni admin sotto, più crediti manuali e cancellazione utenti nella tabella.",
    grantLabel: "Assegna crediti all'utente",
    amount: "Quantità",
    add: "Aggiungi",
    creditAdded: "Crediti aggiunti.",
    usersTitle: "Utenti ({{count}})",
    usersDescSuper: "Super Admin: ruolo, crediti manuali e cancellazione utenti. Le modifiche sono immediate.",
    usersDesc: "Ruolo e permessi: scegli dall'elenco; si applicano al salvataggio.",
    name: "Nome",
    email: "E-mail",
    roleCol: "Ruolo / accesso",
    credits: "Crediti",
    roleUpdated: "{{name}} aggiornato a {{role}}.",
    creditSaved: "Crediti di {{name}} salvati come {{credits}}.",
    invalidCredit: "Inserisci un valore di crediti valido (0 o superiore).",
    deleteConfirm: "Eliminare {{name}} ({{email}})? L'operazione non si può annullare.",
    noEmail: "nessuna e-mail",
    userDeleted: "{{name}} eliminato.",
    sessionsTitle: "Tutti i test ({{count}})",
    sessionsDesc:
      "I PDF vengono salvati automaticamente dopo ogni test. Report del test: partecipante A/T/I/H. Report pressioni: solo admin.",
    date: "Data",
    operator: "Somministrato da",
    participant: "Partecipante",
    score: "Punteggio",
    record: "Scheda",
    reports: "Report",
    testSaved: "Test ✓",
    testPending: "Test …",
    pressSaved: " · Pressioni ✓",
    openTestReport: "Apri report del test",
    downloadTestReport: "Scarica report del test",
    openPressReport: "Apri report pressioni",
    downloadPressReport: "Scarica report pressioni",
    pressDetail: "Dettaglio pressioni",
    storedPdfFailed: "Impossibile aprire il PDF salvato.",
    testPdfFailed: "Impossibile creare il PDF del report del test.",
    pressPdfFailed: "Impossibile creare il PDF del report pressioni."
  },
  pressTimeline: {
    title: "Cronologia delle pressioni",
    emptyScreen: "Schermo vuoto",
    wrongSymbol: "Simbolo errato",
    downloadTest: "PDF report del test",
    downloadPress: "PDF report pressioni",
    generating: "Generazione…",
    summary: "Sintesi",
    totalPresses: "Pressioni totali",
    targetPresses: "Pressioni sul target",
    wrongPresses: "Pressioni errate",
    idlePresses: "Pressioni a schermo vuoto",
    multiPresses: "Pressioni multiple",
    pressTable: "Tabella pressioni",
    pressIndex: "#",
    time: "Tempo",
    trial: "Prova",
    phase: "Fase",
    onScreen: "A schermo",
    target: "Target?",
    wrong: "Errato?",
    pressInTrial: "Pressione n.",
    reactionMs: "TR (ms)",
    status: "Stato"
  },
  profiles: {
    child: "Bambino (6–12)",
    teen: "Adolescente (13–17)",
    adult: "Adulto (18+)"
  },
  roles: {
    super_admin: "Super Admin",
    admin: "Admin",
    psychologist: "Psicologo",
    individual: "Individuale",
    descriptions: {
      super_admin:
        "TUTTI i poteri admin (pannello, tutti i test, crediti, ruoli, report pressioni) + crediti manuali, cancellazione utenti, assegnazione Super Admin.",
      admin: "Pannello admin, tutti i test e gli utenti, crediti, ruoli, report pressioni.",
      psychologist: "Somministra i test; nel pannello vede le proprie schede e i report.",
      individual: "Svolge i test; nel pannello vede solo le proprie schede."
    },
    errors: {
      cannotChangeOwnRole: "Da questa schermata non puoi cambiare il tuo ruolo.",
      forbiddenSuperAdmin: "Solo un Super Admin esistente può assegnare il ruolo Super Admin.",
      cannotDeleteSelf: "Non puoi eliminare il tuo account.",
      deleteFailed: "Impossibile eliminare l'utente. Esegui super-admin-fix-delete.sql in Supabase.",
      deleteFailedDetail: "Impossibile eliminare l'utente: {{detail}}",
      permissionDenied: "Permesso RPC mancante. Esegui super-admin-fix-credits.sql in Supabase.",
      forbidden: "Non hai il permesso per questa azione.",
      userNotFound: "Utente non trovato.",
      generic: "Operazione non riuscita."
    }
  },
  metrics: {
    insufficientData: "Dati insufficienti",
    attentionVeryGood: "Molto buono",
    attentionGood: "Buono",
    attentionAverage: "Nella media",
    attentionLow: "Basso",
    attentionPoor: "Difficoltà attentiva marcata",
    impulseGood: "Buon controllo degli impulsi",
    impulseOk: "Accettabile",
    impulseMild: "Impulsività lieve",
    impulseMarked: "Impulsività marcata",
    impulseSevere: "Impulsività grave",
    riskStrong: "Prestazione solida",
    riskNormal: "Nella norma / da monitorare",
    riskAreas: "Aree di attenzione",
    riskMarked: "Difficoltà marcata",
    riskHigh: "Rischio elevato",
    flagAttentionPoor: "Difficoltà attentiva marcata",
    flagAttentionLow: "Prestazione attentiva bassa",
    flagTiming: "Problema di tempismo (risposta tardiva, affrettata o variabile)",
    flagRush: "Risposta affrettata (tempismo)",
    flagVariability: "Alta variabilità del tempo di reazione (tempismo)",
    flagImpulseMarked: "Impulsività cognitiva marcata (stimolo errato)",
    flagImpulseMild: "Impulsività cognitiva lieve",
    flagHyper: "Iperattività motoria marcata",
    flagHyperMild: "Iperattività motoria lieve (pressioni ripetute o fuori istruzione)",
    flagOmission: "Alto tasso di omissioni",
    flagFalseAlarm: "Alto tasso di falsi allarmi (impulsività)",
    flagMulti: "Pressioni ripetute (iperattività)",
    flagIdle: "Pressione fuori istruzione / schermo vuoto (iperattività)",
    summaryIntro: "Test completato con {{trials}} prove. Profilo: {{profile}}.",
    summaryScores:
      "Punteggio complessivo {{overall}}/100 ({{risk}}). A-Attenzione {{attention}} ({{attentionText}}), T-Tempismo {{timing}}, I-Impulsività {{impulse}} ({{impulseText}}), H-Iperattività {{hyper}}.",
    summaryBehavior:
      "Sintesi comportamentale: centri {{hits}}, omissioni {{omissions}}, tardive {{late}}, falsi allarmi {{falseAlarms}}, multiple {{multiPress}}, rifiuti corretti {{correctRejects}}, pressioni a schermo vuoto {{idle}}.",
    summaryRt: "TR di riferimento {{refRt}} ms, risposta corretta media {{avgRt}} ms.",
    summaryFlags: "Risultati rilevanti: {{flags}}.",
    summaryNoFlags: "Nessun avviso rilevante.",
    disclaimer: "Questo software non formula diagnosi; serve solo allo screening.",
    sustainWarmup: "Riscaldamento / miglioramento",
    sustainStable: "Nessun cambiamento",
    sustainMild: "Calo lieve",
    sustainMarked: "Calo marcato della prestazione",
    validityMissingPhase: "Fase mancante: nessun dato in {{count}} sezione/i del report",
    validityTooFast: "Risposte eccessivamente rapide (possibile pressione casuale)",
    validityFewTrials: "Meno prove del previsto (il test potrebbe essere terminato in anticipo)",
    validityScattered: "Schema di risposta disperso (alte omissioni + falsi allarmi)",
    validityNoOnTimeHits: "Nessuna risposta ai target — i risultati possono essere inaffidabili",
    validityLowEngagement: "Bassa partecipazione (tasso di centri sotto il 15%)",
    validityHighLate: "Alto tasso di risposte tardive — indice di tempismo (T) influenzato",
    flagNoEngagement: "Nessuna risposta (nessuna partecipazione al test)",
    flagLate: "Alto tasso di risposte tardive (tempismo)",
    flagNoHits: "Nessuna risposta al target (omissione)"
  }
};
