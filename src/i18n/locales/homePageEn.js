/** Marketing homepage copy (EN). */
export const homePageEn = {
  nav: {
    home: "Home",
    about: "What is FocusProLab?",
    who: "Who is it for?",
    pros: "Specialist application",
    centers: "FocusProLab Centres",
    faq: "FAQ",
    contact: "Contact",
    login: "Sign in",
    apply: "Specialist application"
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
    ctaApply: "Specialist application",
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
      { code: "H", label: "Hyperactivity", desc: "Motor control and response regulation", color: "h", to: "/olcum/hiperaktivite" },
      {
        code: "C",
        label: "Distractor Resistance",
        desc: "Examining how distracting stimuli affect performance",
        color: "c",
        to: "/olcum/celdirici-direnci"
      }
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
    cta: "Specialist application",
    to: "/uzman-basvuru",
    corporateCta: "Institutional application",
    corporateTo: "/kurumsal-basvuru"
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
        a: "About 13–15 minutes depending on profile and age group, plus a short practice run."
      },
      {
        q: "Who sees the results?",
        a: "When the test ends you do not see a results screen; the message «Thank you for your participation» appears. Records are stored securely and the test report is emailed to you when the test finishes. Tests taken with a specialist can also be viewed on the specialist’s screen."
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
      { label: "Specialist application", href: "/uzman-basvuru" }
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
  specialist: {
    back: "Back to home",
    title: "FocusProLab Specialist Application Form",
    lead: "Join the FocusProLab Specialist Network",
    intro:
      "You can apply to use FocusProLab assessment and development systems in your professional practice. Applications are reviewed against professional background and intended use.",
    corporateLink: "Applying for an organisation? Use the institutional form.",
    sections: {
      personal: "Personal details",
      professional: "Professional details",
      documents: "Documents",
      purpose: "Intended use of FocusProLab",
      consents: "Confirmations"
    },
    fields: {
      name: "Full name *",
      email: "Email *",
      phone: "Mobile phone *",
      city: "City *",
      birth: "Date of birth",
      birthHint: "Optional",
      profession: "Profession *",
      professionHint: "You can select more than one.",
      otherExplain: "Please specify",
      university: "University *",
      department: "Department *",
      graduationYear: "Graduation year",
      postgraduate: "Master’s / doctorate",
      workplace: "Organisation / clinic",
      experience: "Years of professional experience",
      practiceAreas: "Specialties / areas of practice",
      diploma: "Diploma",
      certificate: "Specialty or master’s certificate (if applicable)",
      fileHint: "PDF, JPG or PNG. 8 MB maximum.",
      purpose: "For which purposes do you plan to use FocusProLab?",
      purposeHint: "You can select more than one.",
      heard: "How did you hear about FocusProLab?",
      motivation: "What is the main reason you want to become a FocusProLab specialist?"
    },
    professions: [
      { key: "clinical_psychologist", label: "Clinical psychologist" },
      { key: "psychologist", label: "Psychologist" },
      { key: "counselor", label: "Counsellor / school counsellor" },
      { key: "psychiatrist", label: "Psychiatrist" },
      { key: "child_psychiatrist", label: "Child and adolescent psychiatrist" },
      { key: "other", label: "Other" }
    ],
    purposes: [
      { key: "attention", label: "Attention assessment" },
      { key: "child_adolescent", label: "Child and adolescent assessments" },
      { key: "adult", label: "Adult assessments" },
      { key: "adhd", label: "As a support tool in ADHD assessment" },
      { key: "cognitive", label: "Cognitive performance assessment" },
      { key: "program12", label: "12-week attention and focus development system" },
      { key: "followup", label: "Clinical follow-up" },
      { key: "education", label: "Education / school work" },
      { key: "research", label: "Academic research" },
      { key: "corporate", label: "Organisational use" },
      { key: "other", label: "Other" }
    ],
    sources: [
      { key: "instagram", label: "Instagram" },
      { key: "linkedin", label: "LinkedIn" },
      { key: "colleague", label: "Colleague recommendation" },
      { key: "event", label: "Training or event" },
      { key: "institution", label: "Organisation" },
      { key: "search", label: "Web search" },
      { key: "other", label: "Other" }
    ],
    consents: [
      { key: "accuracy", label: "I confirm that the information I have given is accurate." },
      { key: "privacy", label: "I have read the privacy notice on the use of the personal data I submit with this application." },
      { key: "terms", label: "I accept that FocusProLab systems must be used within professional competence and the terms of use." }
    ],
    submit: "Send application",
    required: "Please complete the required fields, at least one profession and purpose, how you heard about us, and all three confirmations.",
    fileInvalid: "Documents must be PDF, JPG or PNG and no larger than 8 MB.",
    success: "Your application has been received. It will be reviewed against your professional background and intended use. If approved, specialist access will be granted.",
    saveError: "The application could not be saved. Please try again in a moment.",
    noFile: "Not uploaded",
    openFile: "Open document"
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
    indicatorsTitle: "Performance indicators assessed",
    items: {
      dikkat: {
        code: "A",
        color: "a",
        title: "Attention",
        en: "Dikkat",
        summary: "The ability to notice target stimuli and sustain focus throughout the task.",
        paragraphs: [
          "Attention is one of the core cognitive processes that allows a person to focus on particular stimuli, distinguish relevant information, and keep attention on the task for its duration.",
          "FocusProLab aims to examine attention performance through responses to target stimuli and the performance changes that appear across the task."
        ],
        indicators: [
          {
            title: "Sustaining attention",
            text: "Continuing attention performance through the task and responding consistently to target stimuli."
          },
          {
            title: "Selective attention",
            text: "Distinguishing targets from non-targets and producing the appropriate response."
          },
          {
            title: "Focusing on the target",
            text: "Correctly noticing target stimuli and examining missed targets (omission errors)."
          },
          {
            title: "Performance continuity",
            text: "Assessing how attention performance changes across different periods of the test."
          }
        ]
      },
      zamanlama: {
        code: "T",
        color: "t",
        title: "Timing",
        en: "Zamanlama",
        summary: "The ability to respond to stimuli at an appropriate speed, at the right time, and with consistency.",
        paragraphs: [
          "Timing refers to the time between perceiving a stimulus and producing a motor response to it, and to how consistent those responses are over time. Along with response speed, how much response times change across the task is an important indicator for understanding performance.",
          "FocusProLab aims to examine timing performance through reaction times, variability between responses, and speed changes that appear during the test."
        ],
        indicators: [
          {
            title: "Reaction time",
            text: "Examining, in milliseconds, the time between presentation of the target and the person's response."
          },
          {
            title: "Response consistency",
            text: "Assessing how close response times are to one another and the variability of reaction time."
          },
          {
            title: "Tempo control",
            text: "Examining whether response speed is maintained, speeds up, or slows down as the task progresses."
          },
          {
            title: "Responding on time",
            text: "Assessing the ability to respond to targets within predefined response-time limits."
          }
        ]
      },
      durtusellik: {
        code: "I",
        color: "i",
        title: "Impulsivity",
        en: "Dürtüsellik",
        summary:
          "The ability to control unnecessary responses to non-target stimuli and to withhold inappropriate responses.",
        paragraphs: [
          "Impulsivity is a behavioral characteristic related to a person's ability to control a response before reacting to a stimulus and, when needed, to stop automatic responses.",
          "In tasks that require attention, it matters not only to respond to the correct stimuli, but also to withhold a response when no response should be given.",
          "FocusProLab aims to examine performance related to impulsivity through incorrect responses to non-targets, response control, and the response patterns that appear across the task."
        ],
        indicators: [
          {
            title: "Response inhibition",
            text: "Examining the ability to withhold inappropriate motor responses to non-target stimuli."
          },
          {
            title: "Tendency to respond to the wrong stimulus",
            text: "Assessing the frequency and rate of incorrect presses to stimuli that should not receive a response (commission errors)."
          },
          {
            title: "Balance of response speed and accuracy",
            text: "Examining the relationship between a tendency to respond quickly and the rate of incorrect responses."
          },
          {
            title: "Response control across the task",
            text: "Assessing how incorrect responses to non-targets change across different periods of the test."
          }
        ]
      },
      hiperaktivite: {
        code: "H",
        color: "h",
        title: "Motor Response Control",
        en: "Motor Yanıt Kontrolü",
        summary:
          "The ability to regulate unnecessary and repetitive motor responses and to respond in line with the task instructions.",
        paragraphs: [
          "Motor response control is a performance domain related to a person's ability, while carrying out a task, to regulate motor responses, limit unnecessary responses, and keep behavior aligned with what the task requires.",
          "In computerized tasks that require attention, it is important not only to respond at the right time, but also to avoid unnecessary repetitions of the same stimulus and to refrain from key presses when no response is required.",
          "FocusProLab aims to examine motor response control through repeated key presses, responses during intervals with no stimulus, and responses that fall outside the task instructions."
        ],
        indicators: [
          {
            title: "Unnecessary motor responses",
            text: "Examining off-task key presses that occur when no target is present, or during intervals when no response should be given."
          },
          {
            title: "Repeated key presses",
            text: "Assessing the frequency and distribution of presses made more than once for the same stimulus."
          },
          {
            title: "Motor response regulation",
            text: "Examining performance indicators related to controlling unnecessary or repetitive motor responses across the task."
          },
          {
            title: "Response pattern across the task",
            text: "Assessing how unnecessary and repeated key presses change across different parts of the test."
          }
        ]
      },
      "celdirici-direnci": {
        code: "C",
        color: "c",
        title: "Distractor Resistance",
        en: "Çeldirici Direnci",
        summary:
          "The ability to maintain task performance and keep focus on the target when distracting stimuli are present.",
        paragraphs: [
          "Distractor resistance is a cognitive process related to a person's ability to focus on task-relevant information and sustain performance even when stimuli that could pull attention away are present.",
          "In daily life people encounter sounds, movement, and varied visual stimuli. In some situations these stimuli can affect attention, response speed, and response accuracy.",
          "FocusProLab aims to assess distractor resistance by examining performance differences between conditions with and without distracting stimuli."
        ],
        indicators: [
          {
            title: "Distractor effect",
            text: "Examining changes in reaction time and response accuracy that appear when distracting stimuli are present."
          },
          {
            title: "Sustaining focus",
            text: "Assessing the ability to notice targets and keep task-related attention despite distracting stimuli."
          },
          {
            title: "Sensitivity to visual and auditory distractors",
            text: "Examining separately how the different types of distractors used in the test affect performance."
          },
          {
            title: "Performance stability",
            text: "Comparing the consistency of responses and the variability of performance in conditions with and without distractors."
          }
        ]
      }
    }
  },
  centersPage: {
    back: "Back to home",
    title: "FocusProLab Centres",
    lead: "FocusProLab assessments are available at the centres below.",
    address: "Address",
    phone: "Phone",
    directions: "Directions",
    openMap: "Open in Google Maps",
    view: "View centres"
  },
  contactPage: {
    back: "Back to home",
    kicker: "Contact",
    title: "Get in touch with FocusProLab",
    intro: [
      "FocusProLab aims to build partnerships with professionals, organisations and technology providers in digital psychology, cognitive assessment and development technologies.",
      "Fill in the form below to ask about our products, specialist use, organisational solutions, a problem you are having, or a partnership."
    ],
    formTitle: "Contact form",
    fields: {
      name: "Full name *",
      namePlaceholder: "Enter your name and surname",
      email: "Email address *",
      emailPlaceholder: "name@email.com",
      phone: "Phone number",
      phonePlaceholder: "+90 5XX XXX XX XX",
      profession: "Profession / title",
      professionPlaceholder: "e.g. Clinical psychologist, psychologist, psychiatrist, academic",
      organization: "Organisation / company",
      organizationPlaceholder: "Your organisation or company, if any",
      location: "City / country",
      locationPlaceholder: "Istanbul / Türkiye",
      subject: "Subject *",
      subjectPlaceholder: "Select a subject",
      message: "Your message *",
      messagePlaceholder: "How can we help? Briefly describe your request or partnership idea."
    },
    subjects: [
      { key: "products", label: "Information about products and systems" },
      { key: "specialist", label: "Specialist use / specialist application" },
      { key: "program12", label: "12-week attention and focus development system" },
      { key: "corporate", label: "Organisational partnership" },
      { key: "hospital", label: "Hospital / clinic partnership" },
      { key: "university", label: "University / academic research" },
      { key: "school", label: "School / education provider" },
      { key: "technology", label: "Technology / integration" },
      { key: "international", label: "International partnership / business development" },
      { key: "support", label: "Technical support" },
      { key: "press", label: "Press / events / training" },
      { key: "other", label: "Other" }
    ],
    submit: "SEND YOUR MESSAGE",
    required: "Please complete your name, email, subject and message.",
    thanksTitle: "Thank you.",
    thanksBody: "Your message has reached the FocusProLab team. We will contact you after reviewing your request.",
    saveError: "The message could not be sent. Please try again in a moment."
  },
  sections: {
    about: "FocusProLab objectively measures attention and sustained performance under distractors that simulate real-life conditions.",
    centers: "Find the address, phone number and map location of FocusProLab centres in Istanbul.",
    contactLead: "Contact us for institutional applications and partnerships.",
    contactCta: "Contact form"
  }
};
