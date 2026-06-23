/** Marketing homepage copy (EN). */
export const homePageEn = {
  nav: {
    home: "Home",
    about: "What is FocusProLab?",
    who: "Who is it for?",
    pros: "For Professionals",
    centers: "Centres",
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
    ctaTest: "Start test",
    ctaExpert: "Find a clinician",
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
      { code: "A", label: "Attention", desc: "Noticing targets and sustaining focus", color: "a" },
      { code: "T", label: "Timing", desc: "Timely and consistent responses", color: "t" },
      { code: "I", label: "Impulsivity", desc: "Control over responses to non-targets", color: "i" },
      { code: "H", label: "Hyperactivity", desc: "Motor control and response regulation", color: "h" }
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
      { icon: "🧠", title: "FocusProLab test", desc: "Multi-phase continuous performance test" },
      { icon: "📊", title: "PDF report", desc: "Professional pre-evaluation report" },
      { icon: "📅", title: "12-week development programme", desc: "Structured follow-up plan" },
      { icon: "💬", title: "Expert commentary", desc: "Clinical interpretation support" },
      { icon: "🎥", title: "Expert consultation", desc: "One-to-one online review" }
    ],
    cta: "Learn more"
  },
  professionals: {
    title: "For professionals",
    items: ["Psychologists", "Psychiatrists", "School counsellors", "Special education centres", "Hospitals", "Schools"],
    cta: "Institutional enquiry"
  },
  afterTest: {
    title: "What happens after the test?",
    steps: [
      "Complete the test",
      "Results are analysed",
      "PDF report is generated",
      "Visible on the clinician dashboard",
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
  sections: {
    about: "FocusProLab objectively measures attention and sustained performance under distractors that simulate real-life conditions.",
    centers: "We offer bulk assessment and panel access for clinics, schools and institutions.",
    contactLead: "Contact us for institutional applications and partnerships."
  }
};
