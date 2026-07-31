/**
 * Checklist item 2 — Company Documents (+ 2-Year Roadmap).
 * Usage (from frontend): node ../docs/company/generate-company-docx.cjs
 */
const fs = require("fs");
const path = require("path");
const {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  PageBreak,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} = require(path.join(
  __dirname,
  "..",
  "..",
  "frontend",
  "node_modules",
  "docx",
));

const OUT = path.join(__dirname, "docx");
const GREEN = "19E66B";
const DARK = "0B0F0D";
const DEEP_GREEN = "075E35";
const PALE = "EAFBF1";
const GRAY = "5F6B65";
const LIGHT_GRAY = "E5E9E7";
const WHITE = "FFFFFF";
const border = { style: BorderStyle.SINGLE, size: 1, color: LIGHT_GRAY };

function run(text, options = {}) {
  return new TextRun({
    text,
    font: options.font || "Aptos",
    size: options.size || 22,
    color: options.color || DARK,
    bold: options.bold || false,
    italics: options.italics || false,
  });
}

function p(text, options = {}) {
  const children = Array.isArray(text)
    ? text
    : [run(text, { bold: options.bold, color: options.color, italics: options.italics })];
  return new Paragraph({
    children,
    alignment: options.alignment,
    spacing: { after: options.after ?? 140, line: options.line || 300 },
    bullet: options.bullet ? { level: options.level || 0 } : undefined,
    keepNext: options.keepNext,
  });
}

function title(text) {
  return new Paragraph({
    heading: HeadingLevel.TITLE,
    children: [run(text, { size: 48, bold: true, color: DEEP_GREEN })],
    spacing: { before: 260, after: 180 },
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [run(text, { size: 32, bold: true, color: DEEP_GREEN })],
    spacing: { before: 300, after: 140 },
    keepNext: true,
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [run(text, { size: 26, bold: true, color: DARK })],
    spacing: { before: 220, after: 100 },
    keepNext: true,
  });
}

function bullet(text, level = 0) {
  return p(text, { bullet: true, level, after: 80 });
}

function labelValue(label, value) {
  return p([run(`${label}: `, { bold: true, color: DEEP_GREEN }), run(value)]);
}

function table(headers, rows, widths) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(
      (value, i) =>
        new TableCell({
          width: widths ? { size: widths[i], type: WidthType.PERCENTAGE } : undefined,
          shading: { type: ShadingType.CLEAR, fill: DEEP_GREEN, color: "auto" },
          margins: { top: 100, bottom: 100, left: 110, right: 110 },
          borders: { top: border, bottom: border, left: border, right: border },
          children: [p([run(String(value), { bold: true, color: WHITE })], { after: 0 })],
        }),
    ),
  });
  const bodyRows = rows.map(
    (row, rowIndex) =>
      new TableRow({
        children: row.map(
          (value, i) =>
            new TableCell({
              width: widths ? { size: widths[i], type: WidthType.PERCENTAGE } : undefined,
              shading:
                rowIndex % 2
                  ? { type: ShadingType.CLEAR, fill: "F7FAF8", color: "auto" }
                  : undefined,
              margins: { top: 90, bottom: 90, left: 110, right: 110 },
              borders: { top: border, bottom: border, left: border, right: border },
              children: [p(String(value), { after: 0 })],
            }),
        ),
      }),
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows],
  });
}

function spacer(height = 180) {
  return new Paragraph({ spacing: { after: height } });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function cover(documentName, strapline) {
  return [
    spacer(700),
    new Paragraph({
      children: [run("  COMPANY DOCUMENTS • CHECKLIST ITEM 2  ", { size: 18, bold: true, color: DEEP_GREEN })],
      shading: { type: ShadingType.CLEAR, fill: PALE, color: "auto" },
      spacing: { after: 360 },
    }),
    new Paragraph({
      children: [
        run("Naija", { size: 52, bold: true, color: DEEP_GREEN }),
        run("Jobber", { size: 52, bold: true, color: GREEN }),
        run("  🦇", { size: 34 }),
      ],
      spacing: { after: 160 },
    }),
    title(documentName),
    p(strapline, { color: GRAY, after: 240, line: 340 }),
    p("Africa’s #1 JobTech Platform — From Hustle to Hire", { bold: true, color: DEEP_GREEN, after: 120 }),
    p("Pre-revenue • Community-validated • Editable Word document", { italics: true, color: GRAY, after: 800 }),
    p("Prepared July 2026 • Version 1.0", { color: GRAY }),
    pageBreak(),
  ];
}

function header() {
  return new Header({
    children: [
      new Paragraph({
        children: [
          run("Naija", { size: 20, bold: true, color: DEEP_GREEN }),
          run("Jobber", { size: 20, bold: true, color: GREEN }),
          run("  •  Company Documents", { size: 16, color: GRAY }),
        ],
        border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: GREEN } },
        spacing: { after: 100 },
      }),
    ],
  });
}

function footer(name) {
  return new Footer({
    children: [
      new Paragraph({
        children: [
          run(`${name}  •  Confidential  •  `, { size: 16, color: GRAY }),
          new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GRAY }),
        ],
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: LIGHT_GRAY } },
      }),
    ],
  });
}

function doc(name, children) {
  return new Document({
    creator: "NaijaJobber",
    title: name,
    subject: "NaijaJobber Company Document",
    description: "Editable company document for checklist item 2",
    styles: {
      default: {
        document: {
          run: { font: "Aptos", size: 22, color: DARK },
          paragraph: { spacing: { line: 300, after: 140 } },
        },
      },
    },
    sections: [
      {
        properties: { page: { margin: { top: 900, right: 900, bottom: 900, left: 900 } } },
        headers: { default: header() },
        footers: { default: footer(name) },
        children,
      },
    ],
  });
}

function companyProfile() {
  return doc("NaijaJobber Company Profile", [
    ...cover("Company Profile", "Who we are, what we do, and how we serve African hustlers and employers."),
    h1("1. Legal and Identity Snapshot"),
    labelValue("Trading name", "NaijaJobber (evolved from Builders Hub)"),
    labelValue("Category", "JobTech / TalentTech / Opportunity marketplace"),
    labelValue("Stage", "Pre-revenue; community-validated"),
    labelValue("Founder", "ELLFEX"),
    labelValue("Primary market", "Nigeria, expanding across Africa"),
    labelValue("Tagline", "Africa’s #1 JobTech Platform — From Hustle to Hire"),
    labelValue("Brand line", "The hustle is African. The opportunity is NaijaJobber."),
    p(
      "Company registration details, tax IDs, and banking information should be inserted by management before external circulation.",
      { italics: true, color: GRAY },
    ),

    h1("2. Who We Are"),
    p(
      "NaijaJobber is a grassroots JobTech platform bridging untapped African talent with real-time local, remote, and Web3 opportunities. We began as Builders Hub—a fast-growing community connecting moderators, ambassadors, beta testers, community managers, students, white-collar and blue-collar hustlers with projects and employers daily.",
    ),
    p(
      "We are not building another static job board. We are building Africa’s opportunity engine: talent discovery, matching, verification, education, and outcome tracking—monetizing access, engagement, and results after paid pilots prove demand.",
    ),

    h1("3. What We Do Today"),
    bullet("Telegram and WhatsApp communities with curated daily opportunity drops"),
    bullet("Tech event updates and job-fair awareness"),
    bullet("Remote, Web3, and local gig distribution"),
    bullet("Tech and crypto news updates (with clear risk disclosures where financial content appears)"),
    bullet("Educational resources for career entry and digital work"),
    bullet("Community recognition and success-story sharing"),

    h1("4. What We Are Building"),
    bullet("App and website with Local and International/Web3 discovery paths"),
    bullet("Verified recruiter dashboard and moderated listings"),
    bullet("Swipe-style job matching, profiles, proof-of-work, Jobber XP and badges"),
    bullet("Talent Pool, talent-near-you (privacy-safe), referrals, and rewards"),
    bullet("Education, events, and employer hiring tools"),

    h1("5. Non-Financial Traction (October 2025)"),
    table(
      ["Channel", "Reported position"],
      [
        ["Telegram", "750+ subscribers"],
        ["WhatsApp", "700+ members"],
        ["X / Twitter", "400+ followers"],
        ["Engagement", "Active daily community"],
        ["Outcomes", "Dozens of job/gig success stories"],
        ["Recognition", "Engagement with Web3 projects including AYETU and Transfermole"],
      ],
      [35, 65],
    ),
    p("Historical operating revenue: $0. Traction above is audience and engagement evidence, not income.", {
      bold: true,
      color: DEEP_GREEN,
    }),

    h1("6. Customers and Beneficiaries"),
    table(
      ["Segment", "Need"],
      [
        ["Jobbers / hustlers", "Verified opportunities, speed, information, learning, visibility"],
        ["Employers / Web3 projects", "Credible talent without building a full HR stack"],
        ["Campuses / communities", "Distribution of gigs, events, and training access"],
        ["NGOs / governments / funders", "Youth employment outcomes with auditable reporting"],
      ],
      [30, 70],
    ),

    h1("7. Contact"),
    labelValue("Founder", "ELLFEX"),
    labelValue("X / Twitter", "https://x.com/NaijaJobber"),
    labelValue("Telegram", "https://t.me/EllfexNaijaJobber"),
    labelValue("Email", "infoellfex@gmail.com"),
  ]);
}

function missionVision() {
  return doc("NaijaJobber Mission & Vision", [
    ...cover("Mission & Vision", "Why NaijaJobber exists and where we are going."),
    h1("1. Mission"),
    p(
      "To empower Africa’s young hustlers with access to verified local and foreign jobs, gigs, career information, and resources—starting with Nigeria’s tech and opportunity ecosystem.",
      { bold: true, color: DEEP_GREEN },
    ),
    p(
      "We believe people do not only need another platform; they need relief: faster discovery, trusted listings, guidance, and a path from hustle to hire.",
    ),

    h1("2. Vision"),
    p(
      "To become Africa’s #1 JobTech Network—connecting one million young Africans to digital work by 2030—and bridging the gap between people and real-time opportunities from Lagos to Nairobi and beyond.",
      { bold: true, color: DEEP_GREEN },
    ),
    bullet("Become the go-to platform for global startups, local employers, governments, and NGOs to find African talent"),
    bullet("Birth the next 1,000 Web3 stars and career leaders"),
    bullet("Build Africa’s tech opportunity culture—not only an app"),

    h1("3. Emotional Mission"),
    p(
      "Our mission is hustler-first. We know the late nights, the data struggles, and the hunger to make it online. NaijaJobber is a badge of honor for those who grind smart—whether they hold a degree or not.",
    ),
    bullet("You don’t need a degree to break in—you need access, hustle, and guidance"),
    bullet("Degree holders still need information to close jobs; we bridge that gap too"),
    bullet("Brand spirit: No Sleep Till You Eat"),

    h1("4. How Mission Shows Up in Product"),
    table(
      ["Mission pillar", "Product expression"],
      [
        ["Access", "Local + International/Web3 paths; daily drops; swipe discovery"],
        ["Trust", "Verified recruiters, moderated listings, safety design for physical gigs"],
        ["Information", "Education, events, career resources, opening creatives about information gaps"],
        ["Dignity & progress", "Proof-of-work, XP, badges, Talent Pool spotlights, referrals"],
        ["Outcomes", "Applications, hires, paid gigs, and impact reporting"],
      ],
      [28, 72],
    ),

    h1("5. Persona Anchor — Chidera"),
    p(
      "Chidera, 22, Lagos, NYSC, learning crypto from YouTube, wants ~$100/month to support family. Through NaijaJobber they can find Web3 ambassador/quest paths or nearby verified office roles, get featured, and build a portfolio. Multiply Chidera by 100,000—and ultimately one million—that is the mission in human form.",
    ),
  ]);
}

function productOverview() {
  return doc("NaijaJobber Product Overview", [
    ...cover("Product Overview", "Current community product and the platform we are shipping."),
    h1("1. Product Thesis"),
    p(
      "NaijaJobber is TalentTech for African hustlers: Tinder-like speed for discovery, marketplace trust through verification, and an opportunity engine that combines jobs, learning, reputation, and employer tools.",
    ),
    p("Stage: pre-revenue. Monetization activates only after paid pilots validate willingness to pay.", {
      italics: true,
      color: GRAY,
    }),

    h1("2. Live Community Layer"),
    table(
      ["Capability", "Status"],
      [
        ["Telegram / WhatsApp communities", "Live"],
        ["Daily curated job drops", "Live"],
        ["Tech events & opportunity updates", "Live"],
        ["Remote, Web3 & local gigs", "Live"],
        ["Education / resources", "Live (expanding)"],
        ["Tech/crypto news & analysis", "Live (must remain labeled and risk-disclosed)"],
      ],
      [40, 60],
    ),

    h1("3. Platform Modules (App & Website)"),
    h2("Discovery"),
    bullet("Login fork: Local vs International / Web3"),
    bullet("Job categories: Web3, Local, Remote"),
    bullet("Swipe-style job matching (yes/pass)"),
    bullet("Talent near you (privacy-safe map discovery)"),
    bullet("Curated in-house Talent Pool"),

    h2("Trust & safety"),
    bullet("Verified recruiter dashboard and listing review"),
    bullet("Free listings with stronger distribution for verified posts"),
    bullet("Optional NaijaJobber agent support for higher-risk local gigs (phased, policy-gated)"),
    bullet("Single-user account integrity and reporting / appeals"),

    h2("Jobber experience"),
    bullet("Profiles, applications, proof-of-work, Jobber XP & badges"),
    bullet("Referrals and rewards (cash/USDT redemption only after legal and KYC readiness)"),
    bullet("Education and purchasable courses"),
    bullet("Events and job-fair notifications near the user"),

    h2("Employer / project experience"),
    bullet("Company/project presence, job posts, shortlists, hiring workflow"),
    bullet("Talent search and Talent-as-a-Service staffing"),
    bullet("Corporate dashboards and later hiring API"),
    bullet("Sponsored drops, quests, and campaigns"),

    h1("4. Monetization Touchpoints (Proposed)"),
    table(
      ["When", "Product surface"],
      [
        ["Months 1–6", "Sponsored listings, TaaS, Pro subscription, digital products, affiliates"],
        ["Months 6–12", "Transaction fees, corporate dashboards, sponsored quests"],
        ["Months 12–24", "Enterprise recruitment, hiring API, controlled brand ads"],
      ],
      [25, 75],
    ),

    h1("5. Explicit Non-Goals (Near Term)"),
    bullet("In-app trading / brokerage as a core employment feature"),
    bullet("Broad token/DAO launch before utility and compliance are proven"),
    bullet("Unauthorized scraping of third-party job boards"),
    bullet("Employment guarantees from verification badges"),
  ]);
}

function orgChart() {
  return doc("NaijaJobber Org Chart", [
    ...cover("Org Chart", "Current leadership and the operating structure we are building."),
    h1("1. Current Structure"),
    p(
      "NaijaJobber is founder-led. ELLFEX founded and scaled the Builders Hub community and is expanding NaijaJobber into a full JobTech platform. Early delivery relies on the founder plus contractors and community ambassadors until permanent roles are funded.",
    ),
    table(
      ["Role", "Person / status", "Primary accountability"],
      [
        ["Founder / CEO", "ELLFEX — active", "Vision, partnerships, community, fundraising, product direction"],
        ["Engineering (contract / hire)", "Open", "MVP, platform reliability, security"],
        ["Operations & verification", "Open", "Listing review, support, safety workflows"],
        ["Community & communications", "Open / ambassadors", "Drops, content, campus/city presence"],
        ["Employer success / sales", "Open", "B2B pilots, sponsored listings, staffing"],
        ["Finance & compliance", "Open / advisor", "Budget, grant reporting, controls"],
      ],
      [28, 28, 44],
    ),

    h1("2. Target Operating Chart (Post-Funding)"),
    p("Founder / CEO"),
    bullet("Product & Engineering Lead → Frontend, Backend, QA"),
    bullet("Operations Lead → Verification / Moderation, Support, Local-gig Safety Pilot"),
    bullet("Growth Lead → Community, Ambassadors, Content, Events"),
    bullet("Commercial Lead → Employer Success, Partnerships, Campaigns"),
    bullet("Finance & Compliance Lead → Accounting, Grant Reporting, Legal Coordination"),

    h1("3. Platform Role Mapping (In-Product)"),
    p(
      "As the product matures, internal tooling can mirror operating roles such as Moderator, Support Agent, Finance Manager, and Marketing Manager for scalable day-to-day ops.",
    ),

    h1("4. Governance Notes"),
    bullet("Founder retains strategic decision rights until a board or advisory structure is formalized"),
    bullet("Grant spending requires documented approval against use-of-funds categories"),
    bullet("Safety and verification decisions should follow written policy, not ad-hoc chat decisions"),
  ]);
}

function hiringPlan() {
  return doc("NaijaJobber Hiring Plan", [
    ...cover("Hiring Plan", "Phased hiring aligned to MVP delivery, trust ops, and monetization pilots."),
    h1("1. Hiring Principles"),
    bullet("Hire only against validated workload and grant/milestone funding"),
    bullet("Prefer contractors for specialized short bursts; convert to core staff when retention proves value"),
    bullet("Prioritize verification, safety, and employer success before vanity growth roles"),
    bullet("Keep culture hustler-first: street-smart, accountable, and community-respectful"),

    h1("2. Year 1 Hiring Sequence"),
    table(
      ["Timing", "Role", "Why now", "Engagement"],
      [
        ["Months 1–3", "Part-time / contract engineers", "Ship MVP and security basics", "Contract"],
        ["Months 1–3", "Verification / moderation lead (part-time)", "Trust is the product differentiator", "Contract → PT"],
        ["Months 2–4", "Community / content coordinator", "Migrate community without quality loss", "PT"],
        ["Months 3–6", "Employer success / BD", "Paid listing and TaaS pilots", "PT / commission mix"],
        ["Months 4–8", "Support associate", "SLA for seekers and recruiters", "PT"],
        ["Months 6–12", "Full-stack or product engineer", "Swipe, dashboards, payments pilots", "FT if revenue/grant allows"],
        ["Months 6–12", "Finance/admin support", "Grant reporting and controls", "PT / advisor"],
      ],
      [18, 28, 34, 20],
    ),

    h1("3. Year 2 Hiring Sequence"),
    table(
      ["Timing", "Role", "Focus"],
      [
        ["Months 13–18", "Customer success / employer AM", "Recurring dashboard and campaign clients"],
        ["Months 13–18", "City/campus ambassador managers", "Multi-city supply and events"],
        ["Months 16–24", "Data / ops analyst", "Impact KPIs, unit economics, fraud signals"],
        ["Months 18–24", "Enterprise partnerships", "NGO/gov and ecosystem deals"],
        ["As needed", "Safeguarding / legal counsel (external)", "Local-gig agents, payments, ads, crypto rails"],
      ],
      [22, 35, 43],
    ),

    h1("4. Budget Alignment (Illustrative)"),
    p(
      "Hiring spend should stay inside the $250k use-of-funds envelope and Year 1–2 opex plan: product/engineering ~40%, GTM/community ~25%, ops/support ~20%, legal/admin ~10%, contingency ~5%. Exact salaries must be filled by management with local market rates.",
    ),

    h1("5. Success Criteria Per Hire"),
    bullet("Engineers: shipped milestones, uptime, security hygiene"),
    bullet("Verification: turnaround time, false-negative scam rate, appeal quality"),
    bullet("Employer success: paid pilots closed, repeat purchase rate"),
    bullet("Community: active users retained post-migration, drop quality, event engagement"),
  ]);
}

function partnershipStrategy() {
  return doc("NaijaJobber Partnership Strategy", [
    ...cover("Partnership Strategy", "Who we partner with, why, and how partnerships create revenue and impact."),
    h1("1. Partnership Goals"),
    bullet("Increase verified opportunity supply (jobs, gigs, quests, training)"),
    bullet("Accelerate paid pilots without over-building product"),
    bullet("Improve trust, safety, and brand credibility"),
    bullet("Unlock non-dilutive grants and ecosystem campaigns"),
    bullet("Expand city/campus distribution through ambassadors"),

    h1("2. Partner Types"),
    table(
      ["Partner type", "Value exchange", "Near-term offer"],
      [
        ["Web3 ecosystems (Base, Optimism, Celo, NEAR, Arbitrum, Solana, Stacks, etc.)", "Audience + quest distribution ↔ campaign fees / grants", "Sponsored quests, ambassador cohorts"],
        ["Startups / SMEs / remote employers", "Vetted talent ↔ listings, staffing, dashboards", "Featured drops, TaaS pilots"],
        ["Campuses & student bodies", "Talent supply ↔ free education/events", "Ambassador program, job fairs"],
        ["NGOs / youth funds / governments", "Outcomes reporting ↔ program fees / grants", "Training + placement pilots"],
        ["Payment / wallet / skill platforms", "Distribution ↔ affiliate economics", "Tracked referral offers"],
        ["Events & communities", "Reach ↔ free or paid event publishing", "Geo notifications, co-marketing"],
      ],
      [28, 36, 36],
    ),

    h1("3. Partnership Motion (12 Months)"),
    bullet("Months 1–3: LOIs and 5+ paid micro-pilots (listings or staffing)"),
    bullet("Months 4–6: Formalize ambassador MOUs in priority cities/campuses"),
    bullet("Months 6–12: Ecosystem campaigns and first NGO/training collaboration"),
    bullet("Year 2: Enterprise recruitment and multi-city partner densification"),

    h1("4. Rules of Engagement"),
    bullet("No partnership that requires unverified mass hiring claims"),
    bullet("Sponsored content and ads must be labeled"),
    bullet("Prefer official APIs and permissioned content over scraping"),
    bullet("Safeguarding review before any physical-gig agent partnerships"),
    bullet("Track every partner on: opportunities posted, applications, hires/gigs, revenue, NPS"),

    h1("5. Priority Target List (Starter)"),
    bullet("Existing warm Web3 relationships (e.g., AYETU, Transfermole) → case studies and referrals"),
    bullet("Nigerian remote-first SMEs and diaspora employers"),
    bullet("University tech clubs and NYSC-adjacent communities"),
    bullet("Youth employment and digital-skills funders (pipeline, not assumed wins)"),
  ]);
}

function brandGuidelines() {
  return doc("NaijaJobber Brand Guidelines", [
    ...cover("Brand Guidelines", "Voice, visuals, and the Bat—how NaijaJobber should look and sound."),
    h1("1. Brand Essence"),
    labelValue("Positioning", "Africa’s opportunity engine — From Hustle to Hire"),
    labelValue("Audience", "Night hustlers, students, career switchers, Web3 builders, local talent, employers"),
    labelValue("Personality", "Bold, street-smart, uplifting, clear, trustworthy"),
    labelValue("Spirit line", "No Sleep Till You Eat"),
    labelValue("Closing line", "The hustle is African. The opportunity is NaijaJobber."),

    h1("2. Logo Concept — The Sleeping / Resting Bat 🦇"),
    bullet("The Bat = the night hustler who learns, applies, and builds after hours"),
    bullet("Resting / upside-down pose = readiness, not laziness—prepared to launch"),
    bullet("Minimal triangular geometry = growth, direction, momentum, scalable recall"),
    bullet("Use consistently across app, social, merch, and pitch materials"),

    h1("3. Color System"),
    table(
      ["Role", "Guidance"],
      [
        ["Electric Green", "Primary energy, CTAs, highlights, success states"],
        ["Deep Black / near-black", "Authority, night hustle, typography contrast"],
        ["Deep / forest green", "Headers, trust, formal documents"],
        ["Pale mint / soft green", "Background accents, badges, light surfaces"],
        ["Neutral gray", "Secondary text and captions"],
      ],
      [30, 70],
    ),
    p(
      "Avoid generic purple-gradient startup aesthetics. Keep the brand African, night-hustle, and high-contrast.",
      { italics: true, color: GRAY },
    ),

    h1("4. Voice and Messaging"),
    bullet("Speak like a mentor on the street corner who also ships product—direct, hopeful, no jargon walls"),
    bullet("Prefer “access,” “relief,” “verified,” “real opportunities” over “cheap labour”"),
    bullet("Celebrate proof-of-work and community wins without overclaiming income guarantees"),
    bullet("Separate editorial job content from ads, affiliates, and speculative market commentary"),

    h2("Approved headline patterns"),
    bullet("From Hustle to Hire"),
    bullet("From Telegram drops to a TalentTech revolution"),
    bullet("The gap between you and your next opportunity is information—welcome to NaijaJobber"),
    bullet("Tinder for jobbers—built for African hustle"),

    h1("5. UI / Experience Notes"),
    bullet("Mobile-first; swipe discovery should feel fast and clear"),
    bullet("Trust badges and verification states must be readable, not decorative clutter"),
    bullet("Lower-screen ads only after traction; never confuse ads with verified jobs"),
    bullet("Splash / open creatives may use information-gap messaging (TradeView-style presence, not spam)"),

    h1("6. Do / Don’t"),
    table(
      ["Do", "Don’t"],
      [
        ["Show real community outcomes with consent", "Fabricate placement numbers"],
        ["Label sponsorships", "Hide paid placements as organic drops"],
        ["Use the Bat with dignity and consistency", "Cartoonize the brand into meme chaos on official surfaces"],
        ["Stay bilingual in vibe: hustle + professionalism", "Sound elitist or foreign-first"],
      ],
      [50, 50],
    ),
  ]);
}

function executiveSummary() {
  return doc("NaijaJobber Executive Summary", [
    ...cover("Executive Summary", "A one-sitting brief for partners, funders, and collaborators."),
    h1("The Opportunity"),
    p(
      "Millions of African youth are skilled but opportunity-deprived. Jobs and gigs are scattered across chats and foreign platforms; verification is weak; information is uneven. NaijaJobber turns a proven grassroots community into Africa’s JobTech opportunity engine.",
    ),

    h1("The Company"),
    p(
      "NaijaJobber (from Builders Hub) connects hustlers—Web3 contributors, students, white- and blue-collar talent—with local, remote, and Web3 work. Live today: Telegram/WhatsApp communities, curated drops, education, and events. Next: verified platform with swipe matching, recruiter tools, XP, Talent Pool, and employer dashboards.",
    ),
    p("Stage: pre-revenue. Historical operating revenue: $0. Evidence today is community traction and engagement.", {
      bold: true,
      color: DEEP_GREEN,
    }),

    h1("Traction (October 2025)"),
    bullet("750+ Telegram · 700+ WhatsApp · 400+ X"),
    bullet("Active daily engagement · historically 3–5 curated drops/day"),
    bullet("Dozens of success stories · recognition from Web3 projects including AYETU and Transfermole"),

    h1("Business Model (Proposed)"),
    p(
      "Hybrid model: sponsored listings, Talent-as-a-Service, Pro subscriptions, digital products, affiliates → then transaction fees, corporate dashboards, sponsored campaigns → then enterprise recruitment and responsible ads. Grant and ecosystem support accelerates infrastructure while paid pilots prove sustainability.",
    ),

    h1("The Ask"),
    p(
      "$250,000 over 12 months to finalize MVP, migrate community, stand up verification and safety, run paid B2B pilots, and report auditable youth-employment outcomes. Conservative base forecast: staged earned revenue from $0, with annual operating break-even targeted in Year 3 after validation—not assumed overnight.",
    ),

    h1("Vision"),
    p("Connect one million young Africans to digital work by 2030. From Hustle to Hire."),

    h1("Contact"),
    labelValue("Founder", "ELLFEX"),
    labelValue("X", "https://x.com/NaijaJobber"),
    labelValue("Telegram", "https://t.me/EllfexNaijaJobber"),
    labelValue("Email", "infoellfex@gmail.com"),
  ]);
}

function twoYearRoadmap() {
  return doc("NaijaJobber 2-Year Product & Company Roadmap", [
    ...cover(
      "2-Year Product & Company Roadmap",
      "From pre-revenue community to validated monetization and early scale (24 months).",
    ),
    h1("1. Roadmap North Star"),
    p(
      "Year 1: build trust infrastructure, ship MVP, prove willingness to pay. Year 2: recurring employer revenue, multi-city depth, institutional pilots. Horizon: one million Africans connected to digital work by 2030.",
    ),
    p("Assumption: ~$250k grant/seed funds Year 1 build; earned revenue grows through phased pilots. All revenue figures remain forward-looking until realized.", {
      italics: true,
      color: GRAY,
    }),

    h1("2. Year 1 — Build, Trust, Validate"),
    table(
      ["Quarter", "Focus", "Key outcomes"],
      [
        ["Q1 (M1–3)", "Foundation", "Verification policy; impact baseline; community migration start; 5+ employer interviews/LOIs; first paid listing or staffing pilots"],
        ["Q2 (M4–6)", "MVP launch", "Local + International/Web3 paths; profiles; job dashboard; verified recruiter flow; XP/badges; education basics; Pro/product tests"],
        ["Q3 (M7–9)", "Match & measure", "Swipe matching; events near you; payment testing; quest pilots; interim impact report; unit-economics review"],
        ["Q4 (M10–12)", "Retention & proof", "~10k registered users path; ~100 verified hires/gigs target; safety pilot docs; Year 1 earned revenue base case ~$60k; sustainability report"],
      ],
      [18, 20, 62],
    ),
    h2("Year 1 product spine"),
    p("Community → platform accounts → verified listings → apply/match → learning → XP → first paid B2B deals."),
    h2("Year 1 explicit deferrals"),
    bullet("Full USDT reward redemption at scale"),
    bullet("In-app trading"),
    bullet("Heavy in-app advertising"),
    bullet("Multi-country launch"),
    bullet("DAO / token launch"),

    h1("3. Year 2 — Recurring Revenue & Depth"),
    table(
      ["Quarter", "Focus", "Key outcomes"],
      [
        ["Q5 (M13–15)", "Employer SaaS", "Corporate dashboards; hiring workflows; repeat listing/staffing clients; stronger moderation ops"],
        ["Q6 (M16–18)", "Marketplace fees", "Transaction-fee pilot (2–5%); referral rewards; curated Talent Pool; ambassadors in 2–3 cities"],
        ["Q7 (M19–21)", "Scale channels", "Ecosystem campaigns; NGO/gov pilots; courses at scale; privacy-safe talent-near-you"],
        ["Q8 (M22–24)", "Institutional path", "Enterprise recruitment deals; hiring API pilots; controlled brand ads if trust/traffic allow; Year 2 base ~$280k revenue; prepare Year 3 break-even"],
      ],
      [18, 20, 62],
    ),
    h2("Year 2 product spine"),
    p("Dashboards → paid campaigns → take-rate on completed work → talent discovery → institutional contracts."),

    h1("4. Company Milestones Parallel Track"),
    table(
      ["Track", "Year 1", "Year 2"],
      [
        ["Team", "Contract eng + verification + community + BD", "CS/AM, ambassador managers, analyst, enterprise partnerships"],
        ["Ops", "Policies, moderation SLAs, grant reporting", "Multi-city ops, fraud/analytics, institutional compliance"],
        ["Brand", "Bat identity, consistent voice, labeled sponsorships", "Broader campaigns without diluting trust"],
        ["Finance", "Pre-revenue controls; pilot ledger", "Recurring revenue reporting; tighter unit economics"],
      ],
      [18, 41, 41],
    ),

    h1("5. Success Metrics by End of Year 2"),
    bullet("Users: community migrated; 10k+ registered pathway in Y1; meaningful MAU and retention in Y2"),
    bullet("Trust: verified recruiters, reviewed listings, incident/safety process live"),
    bullet("Outcomes: auditable applications, hires, and paid gigs"),
    bullet("Money: start at $0 revenue; by Y2 recurring streams covering a rising share of opex"),
    bullet("Brand: hustler-first tone intact; ads/sponsors clearly labeled"),

    h1("6. Milestone Map (Simple)"),
    p("Month 0–3: Policy, LOIs, paid pilots, migrate community"),
    p("Month 4–6: MVP live (Local/Intl, verify, XP, education)"),
    p("Month 7–12: Swipe, events, payments, ~10k users, ~100 outcomes"),
    p("Month 13–18: Dashboards, recurring B2B, multi-city ambassadors"),
    p("Month 19–24: Enterprise/NGO deals, API, cautious ads, unit economics proven"),
    p("2030 horizon: 1M Africans connected to digital work", { bold: true, color: DEEP_GREEN }),

    h1("7. Risks on the Roadmap"),
    table(
      ["Risk", "Response"],
      [
        ["Monetization slower than plan", "Keep burn staged; prioritize B2B pilots; extend grant tranche discipline"],
        ["Trust failures / scam listings", "Slow growth; strengthen verification before acquisition spend"],
        ["Overbuilding", "Defer trading, tokens, and ads until core loops work"],
        ["Key-person dependency", "Document processes; hire ops and engineering depth in Year 1–2"],
      ],
      [35, 65],
    ),
  ]);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const documents = [
    ["NaijaJobber-Company-Profile.docx", companyProfile()],
    ["NaijaJobber-Mission-Vision.docx", missionVision()],
    ["NaijaJobber-Product-Overview.docx", productOverview()],
    ["NaijaJobber-Org-Chart.docx", orgChart()],
    ["NaijaJobber-Hiring-Plan.docx", hiringPlan()],
    ["NaijaJobber-Partnership-Strategy.docx", partnershipStrategy()],
    ["NaijaJobber-Brand-Guidelines.docx", brandGuidelines()],
    ["NaijaJobber-Executive-Summary.docx", executiveSummary()],
    ["NaijaJobber-2-Year-Product-Company-Roadmap.docx", twoYearRoadmap()],
  ];

  for (const [filename, document] of documents) {
    const buffer = await Packer.toBuffer(document);
    fs.writeFileSync(path.join(OUT, filename), buffer);
    console.log(`Created ${filename} (${Math.round(buffer.length / 1024)} KB)`);
  }
  console.log(`\nAll company documents saved to ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
