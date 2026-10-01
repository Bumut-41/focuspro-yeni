/** Marketing homepage copy (EN). */
export const homePageEn = {
  nav: {
    home: "Home",
    about: "What is FocusProLab?",
    who: "Who is it for?",
    pros: "For Professionals",
    centers: "FocusProLab Centres",
    faq: "FAQ",
    contact: "Contact",
    login: "Sign in"
  },
  hero: {
    title: "Objective Assessment of Attention, Impulsivity and Performance",
    subtitle:
      "FocusProLab is a digital performance assessment system that measures sustained attention, timing, impulse control and motor performance across multiple dimensions.",
    ages: [
      { label: "Children (6–12)", icon: "👶" },
      { label: "Adolescents (13–17)", icon: "🎓" },
      { label: "Adults (18+)", icon: "💼" }
    ],
    ctaTest: "Start individual test",
    ctaExpert: "Plan test with clinician",
    badges: [
      { icon: "⚡", label: "Instant results" },
      { icon: "📄", label: "PDF report" },
      { icon: "📅", label: "12-week programme" },
      { icon: "💬", label: "Expert review" }
    ],
    mockProfile: "Performance profile",
    mockReport: "PDF report preview",
    mockScore: "78/100",
    mockCaption: "Professional pre-evaluation"
  },
  metrics: {
    title: "What does FocusProLab measure?",
    items: [
      { code: "A", label: "Attention", desc: "Noticing targets and sustaining focus", color: "a", to: "/olcum/dikkat" },
      { code: "T", label: "Timing", desc: "Timely and consistent responses", color: "t", to: "/olcum/zamanlama" },
      { code: "I", label: "Impulsivity", desc: "Control over responses to non-targets", color: "i", to: "/olcum/durtusellik" },
      { code: "H", label: "Hyperactivity", desc: "Motor control and response regulation", color: "h", to: "/olcum/hiperaktivite" }
    ]
  },
  audience: {
    title: "Choose the option that fits you",
    cards: [
      {
        key: "adult",
        theme: "blue",
        icon: "💼",
        title: "I'm an adult",
        text: "Discover your attention and performance profile.",
        cta: "Start test",
        to: "/kayit"
      },
      {
        key: "parent",
        theme: "teal",
        icon: "👨‍👩‍👧",
        title: "I'm a parent",
        text: "Safe, science-based assessment for your child.",
        cta: "Start child test",
        to: "/kayit"
      },
      {
        key: "pro",
        theme: "purple",
        icon: "🩺",
        title: "I'm a clinician",
        text: "Invite clients and manage reports from your dashboard.",
        cta: "Go to clinician panel",
        to: "/giris"
      }
    ]
  },
  products: {
    title: "Our products",
    items: [
      { icon: "🧠", title: "FocusProLab test", desc: "Multi-phase continuous performance test", to: "/urun/focusprolab-testi" },
      { icon: "📊", title: "PDF report", desc: "Professional pre-evaluation report", to: "/urun/pdf-rapor" },
      { icon: "📅", title: "12-week development programme", desc: "Structured follow-up plan", to: "/urun/gelisim-programi" },
      { icon: "💬", title: "Expert commentary", desc: "Clinical interpretation support", to: "/urun/uzman-yorumu" },
      { icon: "🎥", title: "Expert consultation", desc: "One-to-one online review", to: "/urun/uzman-gorusmesi" }
    ],
    cta: "Learn more"
  },
  professionals: {
    title: "For professionals",
    items: ["Psychologists", "Psychiatrists", "School counsellors", "Special education centres", "Hospitals", "Schools"],
    cta: "Institutional enquiry",
    to: "/kurumsal-basvuru"
  },
  afterTest: {
    title: "What happens after the test?",
    steps: [
      "Complete the test",
      "Results are analysed",
      "PDF report is generated",
      "Reports for individual test takers are sent to their email address. Tests taken with a specialist are also shown on the specialist dashboard.",
      "Development programme can be planned",
      "Optional expert consultation"
    ],
    cta: "Start test"
  },
  faq: {
    title: "Frequently asked questions",
    items: [
      {
        q: "Does FocusProLab diagnose?",
        a: "No. The system provides performance-based pre-evaluation only; diagnosis requires clinical interview and other data."
      },
      {
        q: "How long does the test take?",
        a: "About 15–20 minutes depending on profile and age group, plus a short practice run."
      },
      {
        q: "Who sees the results?",
        a: "In individual use, results are viewed by authorised clinicians and administrators. In invite flows, participants do not see results."
      },
      {
        q: "Is it suitable for children?",
        a: "Yes. Separate test scenarios are used for ages 6–12, 13–17 and adults."
      }
    ]
  },
  footer: {
    tag: "A trusted digital solution for attention and continuous performance assessment.",
    quickLinks: "Quick links",
    legal: "Legal",
    contactTitle: "Contact",
    phone: "+90 (212) 000 00 00",
    email: "info@focusprolab.com",
    address: "Istanbul, Türkiye",
    follow: "Follow us",
    legalLinks: ["Privacy policy", "Terms of use", "Data protection"],
    quickNav: [
      { label: "Home", href: "/" },
      { label: "What is FocusProLab?", href: "#nedir" },
      { label: "Who is it for?", href: "#kimler" },
      { label: "For professionals", href: "#uzmanlar" }
    ],
    copyright: "© {{year}} FocusProLab. All rights reserved."
  },
  productPages: {
    test: {
      back: "Back to home",
      title: "FocusProLab Performance Assessment System",
      lead: "Beyond Measuring Attention Performance — A Next-Generation Digital Assessment Platform for Understanding and Development",
      intro: [
        "FocusProLab is a computer-based digital performance assessment platform developed to evaluate attention performance across multiple dimensions in children, adolescents and adults.",
        "Through standardised digital tasks, the system analyses the core cognitive processes that make up an individual's attention performance using objective performance data. Unlike traditional approaches, it does not look only at the number of correct and incorrect answers; it also evaluates response patterns, timing skill, impulse control, motor behaviour and performance under distractors together, creating a detailed, person-specific performance profile.",
        "This approach makes it possible to identify each individual's strengths and areas for development separately, so the assessment process becomes development-oriented as well as outcome-oriented."
      ],
      areasTitle: "Performance areas assessed",
      areas: [
        {
          code: "A",
          color: "a",
          label: "Attention",
          en: "Dikkat",
          points: ["Sustaining attention", "Selective attention", "Focusing on the target", "Performance continuity"]
        },
        {
          code: "T",
          color: "t",
          label: "Timing",
          en: "Zamanlama",
          points: ["Reaction time", "Response consistency", "Tempo control", "Responding at the right time"]
        },
        {
          code: "I",
          color: "i",
          label: "Impulsivity",
          en: "Dürtüsellik",
          points: ["Response inhibition", "Tendency to respond to non-targets", "Decision-making control", "Behavioral self-regulation"]
        },
        {
          code: "M",
          color: "m",
          label: "Motor Control",
          en: "Motor Kontrol",
          points: ["Unnecessary motor responses", "Repetitive behavior patterns", "Motor inhibition", "Behavior control"]
        },
        {
          code: "Ç",
          color: "c",
          label: "Distractor Resistance",
          en: "Çeldirici Direnci",
          points: [
            "Performance under visual distractors",
            "Performance under auditory distractors",
            "Ability to refocus attention",
            "How much environmental stimuli affect performance"
          ]
        }
      ],
      processTitle: "Test process",
      process: [
        "About 13–15 minutes",
        "Fully digital",
        "Standardised task flow",
        "Objective performance analysis",
        "Secure data infrastructure"
      ],
      processIcons: ["⏱️", "💻", "📊", "📈", "🔒"],
      afterTitle: "What to expect after the test",
      afterLead: "After the test, your performance data is analysed and a personal performance profile is created.",
      afterHint: "You can use the following services according to your needs:",
      services: [
        { icon: "📄", title: "Detailed PDF performance report" },
        { icon: "🧠", title: "Clinical psychologist commentary" },
        { icon: "📅", title: "12-week personalised development programme" },
        { icon: "💻", title: "Online expert consultation" }
      ],
      afterNote: "All of these services are optional. Users can plan the assessment process according to their own needs.",
      approachTitle: "The FocusProLab approach",
      approach: [
        "FocusProLab is not only a system that measures attention performance.",
        "Its purpose is to analyse performance with objective data, identify strengths and areas for development, and, when needed, guide scientifically based intervention.",
        "It brings performance assessment, detailed reporting, personalised development programmes and expert support together on one platform, offering a holistic assessment experience."
      ],
      noticeTitle: "Important information",
      notice: [
        "FocusProLab does not diagnose and does not replace a clinical assessment.",
        "Performance data from the platform is intended to be considered together with clinical interview, psychological assessment, observation and other measures. Results provide objective performance data that support professionals' decision-making."
      ]
    },
    report: {
      back: "Back to home",
      kicker: "PDF report",
      title: "Professional performance report",
      lead: "After the test, the system creates a detailed PDF for you.",
      contentsTitle: "What is in the report?",
      contents: [
        { icon: "📈", title: "Overall performance score" },
        { icon: "📊", title: "A-T-I-H-C profile" },
        { icon: "📉", title: "Strengths" },
        { icon: "⚠️", title: "Areas to develop" },
        { icon: "📝", title: "Explanations in the style of a clinical commentary" },
        { icon: "🎯", title: "Personalised recommendations" }
      ],
      deliveryTitle: "Delivery",
      delivery: "Sent to your email address as a PDF.",
      audienceTitle: "Who is it for?",
      audience: [
        "Children and adolescents",
        "Adult users",
        "Psychologists",
        "Psychiatrists",
        "Hospitals",
        "Schools",
        "Human resources"
      ],
      cta: "Start test"
    },
    program: {
      back: "Back to home",
      title: "12-week development programme",
      lead: "A personalised digital development system",
      notes: ["Not every user receives the same programme.", "The programme is built entirely from your test results."],
      contentsTitle: "Contents",
      contents: [
        "Daily digital exercises",
        "Life tasks",
        "Weekly goals",
        "Progress charts",
        "Repeat tests"
      ],
      goalTitle: "Purpose",
      goal: "To improve performance regularly and track change with objective data.",
      durationTitle: "Duration",
      duration: "12 weeks",
      dailyTitle: "Daily",
      daily: "20–25 minutes",
      cta: "12-week programme",
      trial: "The programme is in a trial phase."
    },
    commentary: {
      back: "Back to home",
      title: "Expert commentary",
      lead: "Have an expert review your results",
      intro: "The data in your PDF report is interpreted clinically by specialists in the field.",
      includesTitle: "This service includes",
      includes: [
        "Explanation of test results",
        "Assessment of strengths",
        "Identification of areas for development",
        "Interpretation of effects on daily life",
        "Recommendations tailored to you"
      ],
      note: "This service is not intended to make a diagnosis. It provides professional feedback that supports clinical assessment.",
      deliveryTitle: "How it is delivered",
      delivery: "Written expert assessment report",
      cta: "Request expert commentary"
    },
    consultation: {
      back: "Back to home",
      title: "Expert consultation",
      lead: "Let's review your results together",
      intro: "In a one-to-one online meeting, your specialist reviews your test results, PDF report and needs together with you.",
      sessionTitle: "In the session",
      session: [
        { icon: "🧠", title: "Detailed explanation of the results" },
        { icon: "📊", title: "Your performance profile" },
        { icon: "🎯", title: "Development goals" },
        { icon: "📅", title: "A work plan tailored to you" },
        { icon: "👨‍👩‍👧", title: "Parent briefing (for children)" }
      ],
      durationTitle: "Duration",
      duration: "50 minutes",
      formatTitle: "Meeting",
      format: "Online (Zoom / Google Meet and similar)",
      outcomeTitle: "At the end",
      outcomes: ["A roadmap", "Recommendations", "Answers to your questions"],
      cta: "Book an appointment"
    }
  },
  corporate: {
    back: "Back to home",
    title: "Institutional application",
    lead: "FocusProLab Partnership Programme",
    intro: [
      "FocusProLab offers its attention, impulsivity and cognitive performance assessment system to organisations through tailored solutions.",
      "Apply to use a science-based digital assessment and reporting system in your organisation."
    ],
    whoTitle: "Who can apply?",
    who: [
      "Psychology centres",
      "Psychiatry clinics",
      "School counselling centres",
      "Special education and rehabilitation centres",
      "Hospitals",
      "Medical centres",
      "Schools",
      "Universities",
      "Municipalities",
      "Corporate organisations"
    ],
    processTitle: "What happens after you apply",
    process: [
      { title: "Initial review", text: "Your organisation’s needs are analysed." },
      { title: "Online introduction meeting", text: "Every feature of the system is explained in detail." },
      { title: "Demo account", text: "Your specialists can try the system on real cases." },
      { title: "Training and setup", text: "Every specialist receives hands-on training." },
      { title: "Institutional activation", text: "A management panel is opened for your organisation. Specialist accounts are created. Test use begins." }
    ],
    benefitsTitle: "What organisations receive",
    benefits: [
      "Science-based digital attention assessment",
      "Automatic PDF reports",
      "Specialist management panel",
      "Patient and client history",
      "Organisation-specific statistics",
      "Support for multiple specialists",
      "Secure cloud system",
      "Ongoing technical support",
      "Training and update support"
    ],
    formTitle: "Application form",
    fields: {
      org: "Organisation name",
      contact: "Authorised contact",
      role: "Role",
      phone: "Phone",
      email: "Email",
      country: "Country",
      city: "City",
      cityPlaceholder: "Select a city",
      type: "Organisation type",
      typePlaceholder: "Select an organisation type",
      experts: "Number of specialists",
      clients: "Estimated clients per month",
      message: "Your message"
    },
    types: [
      "Psychological counselling centres",
      "Psychiatry clinic",
      "Private allied health service units",
      "Hospital",
      "School",
      "Special education centre",
      "University",
      "Corporate organisation",
      "Other"
    ],
    submit: "Send application",
    required: "Please complete every required field.",
    success: "Your application has been received. We will contact you shortly.",
    saveError: "The application could not be saved. Please try again in a moment."
  },
  metricPages: {
    back: "Back to home",
    items: {
      dikkat: {
        code: "A",
        color: "a",
        title: "Attention",
        en: "Dikkat",
        desc: "Noticing targets and sustaining focus",
        points: ["Sustaining attention", "Selective attention", "Focusing on the target", "Performance continuity"]
      },
      zamanlama: {
        code: "T",
        color: "t",
        title: "Timing",
        en: "Zamanlama",
        desc: "Timely and consistent responses",
        points: ["Reaction time", "Response consistency", "Tempo control", "Responding at the right time"]
      },
      durtusellik: {
        code: "I",
        color: "i",
        title: "Impulsivity",
        en: "Dürtüsellik",
        desc: "Control over responses to non-targets",
        points: ["Response inhibition", "Tendency to respond to non-targets", "Decision-making control", "Behavioral self-regulation"]
      },
      hiperaktivite: {
        code: "H",
        color: "h",
        title: "Hyperactivity",
        en: "Hiperaktivite",
        desc: "Motor control and response regulation",
        points: ["Unnecessary motor responses", "Repetitive behavior patterns", "Motor inhibition", "Behavior control"]
      }
    }
  },
  centersPage: {
    back: "Back to home",
    title: "FocusProLab Centres",
    lead: "FocusProLab assessments are available at the centres below.",
    address: "Address",
    phone: "Phone",
    hours: "Opening hours",
    opensAt: "Opens at: {{time}}",
    directions: "Directions",
    openMap: "Open location in maps",
    view: "View centres"
  },
  sections: {
    about: "FocusProLab objectively measures attention and sustained performance under distractors that simulate real-life conditions.",
    centers: "Find the address, phone number and map location of FocusProLab centres in Istanbul.",
    contactLead: "Contact us for institutional applications and partnerships."
  }
};
