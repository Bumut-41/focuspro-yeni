export const en = {
  meta: {
    lang: "en",
    dateLocale: "en-US",
    title: "FocusProLab",
    description: "FocusProLab — Attention Test"
  },
  nav: {
    brandTagline: "Continuous performance assessment",
    panel: "Dashboard",
    test: "Test",
    admin: "Admin",
    home: "Home",
    login: "Log in",
    register: "Sign up",
    logout: "Log out"
  },
  common: {
    wait: "Please wait…",
    loading: "Loading…",
    testLoading: "Loading test…",
    continue: "Continue",
    save: "Save",
    delete: "Delete",
    close: "Close",
    you: "You",
    or: "or",
    select: "Select",
    backToPanel: "← Back to dashboard",
    panelBack: "Back to dashboard",
    ok: "OK",
    yes: "Yes",
    no: "No",
    dash: "—"
  },
  auth: {
    setupTitle: "Supabase setup required",
    setupDesc: "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your `.env` file.",
    setupDescRegister: "See docs/SAAS_SENARYO.md.",
    loginTitle: "Log in",
    loginSub: "Access your account and continue assessments.",
    email: "Email",
    password: "Password",
    loginBtn: "Log in with email",
    noAccount: "Don't have an account?",
    registerLink: "Sign up",
    registerTitle: "Sign up",
    registerSub: "You must be 18 or older to register.",
    registerEmailHint: "or sign up with email",
    fullName: "Full name",
    birthDate: "Date of birth",
    birthDateMember: "Date of birth (member)",
    birthDateMember18: "Date of birth (member — 18+)",
    accountType: "Account type",
    registerBtn: "Sign up",
    hasAccount: "I already have an account",
    age18Required: "You must be 18 or older to register.",
    passwordMin: "Password must be at least 6 characters.",
    registerSuccess: "Account created. If email confirmation is enabled, check your inbox, then log in.",
    completeProfileTitle: "Complete your profile",
    completeProfileSub: "You signed in with Google. Enter this information once to continue.",
    saving: "Saving…",
    googleContinue: "Continue with Google",
    redirecting: "Redirecting…",
    oauthError: "Could not start sign-in. Check if this provider is enabled in Supabase.",
    googleHint: "First-time Google sign-in asks for a short profile form (age 18+, account type).",
    roleIndividual: "Individual user",
    rolePsychologist: "Psychologist",
    roleIndividualShort: "Individual"
  },
  setup: {
    title: "Setup",
    desc: "Fill in the `.env` file for Supabase connection. See docs/SAAS_SENARYO.md"
  },
  error: {
    pageTitle: "Page failed to load",
    pageDesc:
      "The app stopped due to an unexpected error. Refresh the page; if the problem persists, send this message to the developer."
  },
  home: {
    eyebrow: "FocusProLab · Continuous performance test",
    goToPanel: "Go to dashboard",
    freeRegister: "Sign up free",
    loginBtn: "Log in",
    trust: "Multi-stage distractors · Delivered with FocusProLab",
    liveMetric: "Live metrics",
    liveMetricValue: "Attention · Response · Distractor",
    statsTitle: "FocusProLab at a glance",
    statsLead: "Assessment capacity and reporting features in one view.",
    testimonialsTitle: "Feedback from professionals",
    ctaTitle: "Start assessing today",
    ctaSub: "Sign up, try the 30-second practice, or go straight to the full test.",
    footerTag: "Continuous performance and attention assessment",
    prevSlide: "Previous slide",
    nextSlide: "Next slide",
    slideSelect: "Slide selection",
    slideN: "Slide {{n}}",
    heroSlides: [
      {
        title: "Next-Generation Attention and Sustained Performance Assessment",
        text: "FocusProLab measures attention and executive function through multi-stage scenarios, providing objective data for clinical and personal use."
      },
      {
        title: "Distractors That Simulate Real Life",
        text: "Silent visual, audio-only, and combined distractor blocks show in detail how performance changes under different conditions."
      },
      {
        title: "Child, Teen, and Adult Profiles",
        text: "Separate test durations, speed ramps, and normative comparisons for ages 6–12, 13–17, and 18+."
      },
      {
        title: "Instant PDF Reports and Admin Panel",
        text: "Automatic reports after each test; dashboard, press timeline, and centralized user management for psychologists and admins."
      },
      {
        title: "Objective Support in ADHD Care",
        text: "Measurement that supports diagnosis and follow-up; visual reports you can share with clients and families."
      }
    ],
    features: [
      {
        title: "Attention assessment for children",
        text: "13-minute age-appropriate scenario with visual and auditory distractors for an attention profile."
      },
      {
        title: "Adults and teens",
        text: "15-minute test with speed ramp and multiple distractor blocks for detailed performance analysis."
      },
      {
        title: "Professional and admin dashboard",
        text: "All tests, press reports, role management, and Super Admin tools from one place."
      },
      {
        title: "Fast, reliable results",
        text: "Metrics, phase charts, and downloadable PDF at session end — no extra steps."
      }
    ],
    stats: [
      { value: "3", label: "Age profiles", suffix: "" },
      { value: "5", label: "Distractor scenario blocks", suffix: "+" },
      { value: "20", label: "Minutes of testing", suffix: "+" },
      { value: "1", label: "Click for PDF report", suffix: "" }
    ],
    testimonials: [
      {
        quote:
          "Seeing how performance shifts under visual and auditory distractors in one report makes session planning much easier.",
        role: "Clinical psychologist"
      },
      {
        quote:
          "Sharing the chart in the first session strengthens trust; families understand concrete data better.",
        role: "Counseling psychologist"
      },
      {
        quote: "The press timeline and phase metrics help me quantify observations from the room.",
        role: "Neuropsychologist"
      },
      {
        quote: "With the online app we finish the test and archive results without in-clinic waiting.",
        role: "Practicing specialist"
      }
    ]
  },
  dashboard: {
    welcome: "Welcome, {{name}}",
    description: "Manage your attention and continuous performance assessments here.",
    pdfAutoSave: "When a test ends, the report PDF is saved automatically and can be opened from the list below.",
    newTest: "Start new test",
    adminPanel: "Admin panel",
    historyTitle: "Your past tests",
    historyDesc: "Participant test report PDF — view from the dashboard.",
    noTests: "No saved tests yet.",
    noTestsDesc: "Start your first assessment.",
    date: "Date",
    participant: "Participant",
    profile: "Profile",
    overallScore: "Overall score",
    testReport: "Test report",
    openReport: "Open report",
    pdfPreparing: "Preparing PDF…",
    pdfOpenFailed: "Could not open PDF."
  },
  test: {
    participantTitle: "Participant information",
    participantDesc: "Participant record for this assessment session.",
    gender: "Gender",
    genderFemale: "Female",
    genderMale: "Male",
    consent: "Parent / legal guardian consent obtained.",
    errName: "Enter full name.",
    errBirth: "Valid date of birth (ages 6–99).",
    errGender: "Select gender.",
    errConsent: "Check the consent box for child/teen participants.",
    saved: "Test saved. Preparing PDF report…",
    noCredits: "Could not save: no test credits remaining.",
    saveError: "Save error: {{msg}}",
    pdfSaveFailed: "PDF save failed; try again with «Download PDF».",
    newTest: "New test",
    devTimer: "Practice timer",
    stepGuide: "Step 3 / 5 · Instructions",
    stepSpace: "Step 1 / 5 · Key check",
    stepAudio: "Step 2 / 5 · Sound check",
    stepMain: "Step 5 / 5 · Main test",
    spaceTitle: "Let's try the SPACE key first",
    spaceSub: "Press or tap the SPACE key once.",
    spaceTouch: "Tap to continue",
    audioTitle: "Now let's check the sound",
    audioSub:
      "A short test sound plays automatically. Press green if you heard it clearly, red if you did not.",
    audioHeard: "I heard the sound",
    audioNotHeard: "I did not hear it",
    audioPlayError:
      "Sound could not play automatically. Try «I did not hear it»; check volume and headphones.",
    audioRetry: "If you did not hear it, turn up volume or check headphones. Playing test sound again…",
    practiceBanner: "Practice — 30 sec (all sections, not recorded)",
    startTest: "Start test",
    qaHint:
      "Temporary mode: silent GIF and silent+audio GIF sections only (~6 min). Audio-only, baseline, and closing disabled.",
    instructions: {
      title: "FocusProLab Attention Test Instructions",
      practiceBtn: "Click for practice test",
      paragraphs: [
        "In this test you will see different shapes on the screen.",
        "Your task is to press the space bar once as quickly as you can each time you see the blue triangle.",
        "Do not press for any shape other than the blue triangle.",
        "For example, do not press for blue square, green triangle, red circle, black plus, or any other shape.",
        "After these instructions you will do a 30-second practice run like the real test: distractor-free, then short silent GIF, audio-only, and combined sections. This practice is not recorded.",
        "Remember: press the space bar once as quickly as you can each time you see the blue triangle."
      ],
      briefExtra: "When you are ready, you can start the main test.",
      briefEmphasis:
        "Remember: press the space bar once as quickly as you can each time you see the blue triangle"
    }
  },
  report: {
    title: "Assessment report",
    meta: "{{name}} · age {{age}} · {{profile}}",
    overall: "Overall",
    attention: "A — Attention",
    timing: "T — Timing",
    impulsivity: "I — Impulsivity",
    hyperactivity: "H — Hyperactivity",
    pdfDownload: "Download PDF",
    pdfSaveDownload: "Save / download PDF",
    pdfFailed: "PDF operation failed. Please try again.",
    pdfCreateFailed: "Could not create PDF."
  },
  admin: {
    title: "Administration",
    description:
      "All users and test results. Download participant test report and press report PDF for each session.",
    superHint: "Super Admin: all admin actions below + manual credits and user deletion in the table.",
    grantLabel: "Grant credits to user",
    amount: "Amount",
    add: "Add",
    creditAdded: "Credits added.",
    usersTitle: "Users ({{count}})",
    usersDescSuper: "Super Admin: role, manual credits, and user deletion. Changes apply immediately.",
    usersDesc: "Role and permissions: select from the list; applied on save.",
    name: "Name",
    email: "Email",
    roleCol: "Role / access",
    credits: "Credits",
    roleUpdated: "{{name}} updated to {{role}}.",
    creditSaved: "{{name}} credits saved as {{credits}}.",
    invalidCredit: "Enter a valid credit value (0 or higher).",
    deleteConfirm: "Delete {{name}} ({{email}})? This cannot be undone.",
    noEmail: "no email",
    userDeleted: "{{name}} deleted.",
    sessionsTitle: "All tests ({{count}})",
    sessionsDesc:
      "PDFs are saved automatically after each test. Test report: participant A/T/I/H. Press report: admin only.",
    date: "Date",
    operator: "Administered by",
    participant: "Participant",
    score: "Score",
    record: "Record",
    reports: "Reports",
    testSaved: "Test ✓",
    testPending: "Test …",
    pressSaved: " · Press ✓",
    openTestReport: "Open test report",
    downloadTestReport: "Download test report",
    openPressReport: "Open press report",
    downloadPressReport: "Download press report",
    pressDetail: "Press detail",
    storedPdfFailed: "Could not open stored PDF.",
    testPdfFailed: "Could not create test report PDF.",
    pressPdfFailed: "Could not create press report PDF."
  },
  pressTimeline: {
    title: "Press timeline",
    emptyScreen: "Blank screen",
    wrongSymbol: "Wrong symbol",
    downloadTest: "Test report PDF",
    downloadPress: "Press report PDF",
    generating: "Generating…",
    summary: "Summary",
    totalPresses: "Total presses",
    targetPresses: "Target presses",
    wrongPresses: "Wrong presses",
    idlePresses: "Blank-screen presses",
    multiPresses: "Multiple presses",
    pressTable: "Press table",
    pressIndex: "#",
    time: "Time",
    trial: "Trial",
    phase: "Phase",
    onScreen: "On screen",
    target: "Target?",
    wrong: "Wrong?",
    pressInTrial: "Press #",
    reactionMs: "RT (ms)",
    status: "Status"
  },
  profiles: {
    child: "Child (6–12)",
    teen: "Teen (13–17)",
    adult: "Adult (18+)"
  },
  roles: {
    super_admin: "Super Admin",
    admin: "Admin",
    psychologist: "Psychologist",
    individual: "Individual",
    descriptions: {
      super_admin:
        "ALL admin powers (panel, all tests, add credits, assign roles, press reports) + manual credits, delete users, assign Super Admin.",
      admin: "Admin panel, all tests and users, add credits, assign roles, press reports.",
      psychologist: "Runs tests; sees own test records and reports in the dashboard.",
      individual: "Runs tests; sees only own test records in the dashboard."
    },
    errors: {
      cannotChangeOwnRole: "You cannot change your own role from this screen.",
      forbiddenSuperAdmin: "Only an existing Super Admin can assign the Super Admin role.",
      cannotDeleteSelf: "You cannot delete your own account.",
      deleteFailed: "Could not delete user. Run super-admin-fix-delete.sql in Supabase.",
      deleteFailedDetail: "Could not delete user: {{detail}}",
      permissionDenied: "Missing RPC permission. Run super-admin-fix-credits.sql in Supabase.",
      forbidden: "You do not have permission for this action.",
      userNotFound: "User not found.",
      generic: "Operation failed."
    }
  },
  metrics: {
    insufficientData: "Insufficient data",
    attentionVeryGood: "Very good",
    attentionGood: "Good",
    attentionAverage: "Average",
    attentionLow: "Low",
    attentionPoor: "Marked attention difficulty",
    impulseGood: "Good impulse control",
    impulseOk: "Acceptable",
    impulseMild: "Mild impulsivity",
    impulseMarked: "Marked impulsivity",
    impulseSevere: "Severe impulsivity",
    riskStrong: "Strong performance",
    riskNormal: "Normal / monitor",
    riskAreas: "Areas of concern",
    riskMarked: "Marked difficulty",
    riskHigh: "High risk",
    flagAttentionPoor: "Marked attention difficulty",
    flagAttentionLow: "Low attention performance",
    flagTiming: "Timing issue (late or rushed response)",
    flagRush: "Rushed response (timing)",
    flagImpulseMarked: "Marked impulsivity",
    flagImpulseMild: "Mild impulsivity",
    flagHyper: "Marked hyperactivity indicator",
    flagOmission: "High omission rate",
    flagFalseAlarm: "High false-alarm rate",
    flagMulti: "Multiple presses",
    flagIdle: "Presses on blank screen",
    summaryIntro: "Test completed with {{trials}} trials. Profile: {{profile}}.",
    summaryScores:
      "Overall score {{overall}}/100 ({{risk}}). A-Attention {{attention}} ({{attentionText}}), T-Timing {{timing}}, I-Impulsivity {{impulse}} ({{impulseText}}), H-Hyperactivity {{hyper}}.",
    summaryBehavior:
      "Behavior summary: hits {{hits}}, omissions {{omissions}}, late {{late}}, false alarms {{falseAlarms}}, multiple {{multiPress}}, correct rejections {{correctRejects}}, blank-screen presses {{idle}}.",
    summaryRt: "Reference RT {{refRt}} ms, mean correct response {{avgRt}} ms.",
    summaryFlags: "Notable findings: {{flags}}.",
    summaryNoFlags: "No notable warnings.",
    disclaimer: "This software does not diagnose; it is for screening only.",
    sustainWarmup: "Warm-up / improvement",
    sustainStable: "No change",
    sustainMild: "Mild decline",
    sustainMarked: "Marked performance decline",
    validityMissingPhase: "Missing phase: no data in {{count}} report section(s)",
    validityTooFast: "Excessively fast responses (possible random pressing)",
    validityFewTrials: "Fewer trials than expected (test may have ended early)",
    validityScattered: "Scattered response pattern (high omission + false alarms)",
    validityNoOnTimeHits: "No response to targets — results may be unreliable",
    validityLowEngagement: "Low engagement (hit rate below 15%)",
    validityHighLate: "High late-response rate — timing (T) index affected",
    flagNoEngagement: "No responses (no test engagement)",
    flagLate: "High late-response rate (timing)",
    flagNoHits: "No target response (omission)"
  }
};
