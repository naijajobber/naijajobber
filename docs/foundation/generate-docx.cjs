/**
 * Generate editable NaijaJobber Foundation documents.
 * Usage (from frontend): node ../docs/foundation/generate-docx.cjs
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
  PageOrientation,
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
const noBorder = { style: BorderStyle.NONE, size: 0, color: WHITE };

function run(text, options = {}) {
  return new TextRun({
    text,
    font: options.font || "Aptos",
    size: options.size || 22,
    color: options.color || DARK,
    bold: options.bold || false,
    italics: options.italics || false,
    break: options.break,
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
    indent: options.indent,
    bullet: options.bullet ? { level: options.level || 0 } : undefined,
    numbering: options.numbering,
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
  return p([
    run(`${label}: `, { bold: true, color: DEEP_GREEN }),
    run(value),
  ]);
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

function cover(documentName, strapline, classification = "FOUNDATION • EDITABLE") {
  return [
    spacer(700),
    new Paragraph({
      children: [run(`  ${classification}  `, { size: 18, bold: true, color: DEEP_GREEN })],
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
    p("Africa’s #1 JobTech Platform — From Hustle to Hire", {
      bold: true,
      color: DEEP_GREEN,
      after: 120,
    }),
    p("The hustle is African. The opportunity is NaijaJobber.", {
      italics: true,
      color: GRAY,
      after: 800,
    }),
    p("Prepared July 2026 • Version 2.0", { color: GRAY }),
    p("Editable Microsoft Word document", { color: GRAY }),
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
          run("  •  From Hustle to Hire", { size: 16, color: GRAY }),
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

function doc(name, children, options = {}) {
  return new Document({
    creator: "NaijaJobber",
    title: name,
    subject: "NaijaJobber Foundation Document",
    description: "Editable light-theme branded NaijaJobber document",
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
        properties: {
          page: {
            size: options.landscape
              ? { orientation: PageOrientation.LANDSCAPE }
              : undefined,
            margin: { top: 900, right: 900, bottom: 900, left: 900 },
          },
        },
        headers: { default: header() },
        footers: { default: footer(name) },
        children,
      },
    ],
  });
}

function businessPlan() {
  const c = [
    ...cover(
      "Business Plan",
      "Bridging the gap between untapped African talent and real-time local, remote, and Web3 opportunities.",
    ),
    h1("1. Executive Summary"),
    p(
      "NaijaJobber is a grassroots JobTech platform and opportunity engine connecting Nigerian and African hustlers with verified local, remote, and Web3 work. It began as Builders Hub: a real-time community that curates opportunities for moderators, ambassadors, beta testers, community managers, students, white-collar professionals, blue-collar workers, and early-career talent.",
    ),
    p(
      "NaijaJobber is currently pre-revenue. It has not generated operating income from listings, subscriptions, placements, advertising, transaction fees, or other proposed services. Its present evidence is non-financial community traction. All commercial figures in this plan are forward-looking management estimates that must be validated through paid pilots.",
      { bold: true, color: DEEP_GREEN },
    ),
    p(
      "NaijaJobber is not simply a job board. It is talent-discovery and matching infrastructure that monetizes access, engagement, and successful outcomes. The planned platform combines trusted listings, recruiter verification, swipe-based discovery, talent profiles, education, Jobber XP, referrals, events, and optional assisted safety for local gigs.",
    ),
    labelValue("Mission", "Empower Africa’s young hustlers with access to verified jobs, gigs, information, education, and career resources—starting with Nigeria."),
    labelValue("Vision", "Become Africa’s #1 JobTech Network and connect one million young Africans to digital work by 2030."),
    labelValue("Brand promise", "From Hustle to Hire."),

    h1("2. Company Origin and Identity"),
    p(
      "Builders Hub proved that an active community can form a reliable talent-to-opportunity pipeline in real time. NaijaJobber expands that model into an app and website that serve both opportunity seekers and employers.",
    ),
    h2("The Bat — the night hustler"),
    bullet("The resting, upside-down bat represents preparation, readiness, and the energy to launch when opportunity arrives."),
    bullet("Minimal triangular geometry communicates momentum, growth, confidence, and strong digital recall."),
    bullet("The symbol reflects people learning, applying, and building after hours—calm, capable, and ready."),
    bullet("Brand energy: bold, street-smart, uplifting, electric green and deep black; “No Sleep Till You Eat.”"),

    h1("3. The Problem"),
    bullet("Millions of skilled African youth remain unemployed or underemployed because access—not ability—is the bottleneck."),
    bullet("Real opportunities are fragmented across Telegram, WhatsApp, social media, informal referrals, and foreign platforms."),
    bullet("Many listings are unverified, creating fraud and serious physical-safety risks for local job seekers."),
    bullet("Mainstream platforms lean toward elite or white-collar careers and often exclude Web3, blue-collar work, microjobs, and early-stage gigs."),
    bullet("Degree holders and self-taught hustlers alike lack timely information, visibility, proof-of-work, and guidance."),
    bullet("Employers need a faster alternative to building an entire HR function when they want reliable Nigerian talent."),

    h1("4. The Solution"),
    p("NaijaJobber bridges the gap through one trust-first marketplace with two discovery paths at login: Local and International/Web3."),
    table(
      ["User group", "Core value"],
      [
        ["Jobbers", "Verified local, remote, and Web3 opportunities; swipe discovery; education; events; profile and proof-of-work; XP and rewards."],
        ["Employers/projects", "Free listings, paid promotion, recruiter verification, talent search, shortlisting, matching, dashboards, and staffing support."],
        ["Communities/funders", "Training access, quests, campaigns, placement reporting, youth-employment impact, and auditable outcomes."],
        ["Local-gig participants", "Safety controls, verified hosts, check-in workflows, and an optional NaijaJobber agent where operationally feasible."],
      ],
      [22, 78],
    ),
    h2("Key product concepts"),
    bullet("Tinder-like job swipe: a fast yes/pass interface that reduces discovery friction."),
    bullet("Talent near you: local discovery that puts credible, skilled people on the map while respecting privacy."),
    bullet("In-house Talent Pool: curated top contributors across fields, increasing visibility and employer confidence."),
    bullet("Verified listings: trust badges, moderation, proof checks, and stronger distribution."),
    bullet("Jobber XP and badges: rewards for verified activity, successful placements, referrals, learning, and valid proof-of-work."),
    bullet("Education and information: courses, career playbooks, tech/crypto updates, and nearby event or job-fair alerts."),
    bullet("Advertising: lower-screen brand placements and sponsored suggestions introduced carefully without damaging trust."),

    h1("5. Market Opportunity"),
    p(
      "Management’s market thesis is based on more than 100 million African youth, persistent youth unemployment in Nigeria, growing remote-work adoption, and demand for Web3 and digital contributors. These figures should be independently sourced before external circulation.",
    ),
    p(
      "The initial beachhead is Nigeria: community members seeking entry-level digital work, remote roles, Web3 contributor positions, local jobs, freelance work, and microjobs. Expansion follows community density into major African cities such as Nairobi and other English-speaking markets.",
    ),

    h1("6. Current Community and Non-Financial Traction"),
    table(
      ["Metric", "Reported position (October 2025)"],
      [
        ["Telegram", "750+ subscribers"],
        ["WhatsApp", "700+ members"],
        ["X / Twitter", "400+ followers"],
        ["Activity", "Active daily engagement"],
        ["Opportunity flow", "Historically 3–5 curated job drops daily"],
        ["Outcomes", "Dozens of community job/gig success stories"],
        ["Recognition", "Engagement or recognition from Web3 projects including AYETU and Transfermole"],
      ],
      [35, 65],
    ),
    p(
      "Current community programming includes tech-event updates, remote/Web3/local gigs, tech and crypto news, forex and crypto analysis, signals, and educational resources. Financial-market content must carry clear risk disclosures and should remain separate from verified employment services.",
    ),

    h1("7. Proposed Business Model"),
    p(
      "The following revenue streams are planned and have not yet produced revenue. NaijaJobber will validate them sequentially, beginning with low-technology paid pilots before investing in more complex marketplace payments.",
      { italics: true, color: GRAY },
    ),
    table(
      ["Stage", "Revenue stream", "Commercial model"],
      [
        ["Months 1–6", "Paid listings and sponsored drops", "₦20,000–₦200,000 per post; management estimate $100–$500 per feature."],
        ["Months 1–6", "Talent-as-a-Service", "Finder’s fee or subscription; target 20–30% placement share and $50–$1,000 per client."],
        ["Months 1–6", "NaijaJobber Pro", "₦5,000–₦10,000 monthly for early drops, templates, mentorship, spotlight, and ranking."],
        ["Months 1–6", "Digital products and affiliates", "$10–$30 assets; $2–$10 per qualified partner signup."],
        ["Months 6–12", "Transaction fees", "2–5% of completed jobs or gigs, subject to payment and regulatory design."],
        ["Months 6–12", "Corporate dashboards/API", "$100–$300 per month for profile search, filtering, bulk hiring, and workflow tools."],
        ["Months 6–12", "Sponsored quests/campaigns", "$1,000–$10,000 per ecosystem campaign."],
        ["Months 12–24", "Enterprise recruitment", "$5,000–$50,000 per NGO, government, or mass-workforce engagement."],
        ["Months 12–24", "Ads and brand placements", "$500–$5,000 monthly after meaningful traffic, targeted at 50,000+ users."],
        ["Optional", "XP/token/credentials", "Reputation utility and proof-of-work credentials; only after legal and product validation."],
      ],
      [18, 27, 55],
    ),

    h1("8. Go-to-Market"),
    bullet("Community-first: migrate Telegram and WhatsApp activity into verified platform accounts without losing the grassroots tone."),
    bullet("Campus and city ambassadors: distribute opportunities and events through trusted local representatives."),
    bullet("Employer acquisition: pitch a ready, vetted talent pool and faster hiring—not “cheap labour.”"),
    bullet("Web3 partnerships: Base, Optimism, Celo, NEAR, Arbitrum, Solana, Stacks, and similar ecosystems for campaigns, grants, and credentials."),
    bullet("Events engine: free basic event publishing, paid boosted reach, and proximity notifications."),
    bullet("Content engine: credited, permission-based curation; partnerships or official feeds rather than unauthorized scraping."),

    h1("9. Retention Strategy"),
    bullet("Daily opportunity loop: personalized job drops and a swipe queue."),
    bullet("Progress loop: application status, XP, badges, learning milestones, and proof-of-work."),
    bullet("Information loop: education, market updates, nearby events, and “the gap is information” opening creative."),
    bullet("Trust loop: verified recruiters, moderation, safety reporting, transparent sponsorship labels, and account integrity."),
    bullet("Recognition loop: talent spotlights, community success stories, referrals, and curated talent-pool placement."),

    h1("10. Operations, Safety, and Compliance"),
    bullet("Require stronger identity and organization checks before employers receive a verified badge."),
    bullet("Use single-user account controls while providing a fair recovery and appeal process."),
    bullet("Separate listing verification from employment guarantees; publish clear badge definitions."),
    bullet("For physical gigs: risk classification, emergency contact, check-in/out, location consent, incident escalation, and optional vetted agents."),
    bullet("Points redeemable for USDT require anti-fraud controls, KYC/AML review, tax treatment, and a licensed payment partner."),
    bullet("In-app trading should not be part of the employment MVP; it introduces licensing, custody, suitability, and reputational risk."),
    bullet("Ads, affiliate offers, crypto analysis, and signals must be visibly distinguished from editorial and verified job content."),

    h1("11. Team"),
    p(
      "ELLFEX, Founder: Web3 ambassador and community builder with experience across 15+ projects, a speaker at Blockchain Futurist, and the solo builder behind the early Builders Hub community. The next team layer covers engineering, operations, employer success, communications, verification, safety, and finance.",
    ),

    h1("12. Roadmap"),
    table(
      ["Period", "Priorities"],
      [
        ["0–6 months", "Finalize MVP; launch verified recruiter flow; Local/International discovery; job dashboard; XP/badges; migrate community; target 10,000 users; secure grants and B2B pilots."],
        ["6–12 months", "Swipe matching; corporate dashboards; payment and transaction-fee pilot; events; courses; referral rewards; sponsored quests."],
        ["12–24 months", "Talent-near-you with privacy controls; enterprise recruitment; hiring API; scaled ads; multi-city expansion; optional credential pilot."],
        ["By 2030", "Connect one million young Africans to digital work and become the preferred African opportunity network for employers, projects, governments, and NGOs."],
      ],
      [22, 78],
    ),

    h1("13. Risks and Mitigation"),
    table(
      ["Risk", "Mitigation"],
      [
        ["Fraudulent or dangerous listings", "Verification, moderation, risk scoring, user reporting, local-gig safety controls, and law-enforcement escalation policy."],
        ["Marketplace liquidity", "Start with existing community, curated supply, employer partnerships, and narrow category/geography launches."],
        ["Reward farming", "Identity controls, delayed vesting, event audits, employer/seeker confirmation, caps, and anti-collusion rules."],
        ["Regulatory exposure", "Legal review before USDT redemption, trading, payments, tokens, location services, or financial promotions."],
        ["Brand dilution from ads", "Frequency caps, sponsorship labels, category exclusions, and premium ad-free access."],
        ["Weak employer economics", "Prove time-to-shortlist, quality of hire, and retention before scaling sales spend."],
      ],
      [32, 68],
    ),

    h1("14. Persona — Chidera"),
    p(
      "Chidera is 22, based in Lagos, serving in NYSC, and learning crypto through YouTube. The goal is to earn at least $100 monthly to support family, but credible gigs are difficult to find and visibility is low.",
    ),
    bullet("Web3 path: discovers two ambassador roles, completes a quest, earns a first $50, shares the result, is featured, and builds confidence and proof-of-work."),
    bullet("Local path: discovers three nearby office roles, applies quickly, matches with a verified employer, gets hired, and becomes a community success story."),
    p("Multiply Chidera’s outcome by 100,000—and ultimately one million—and that is the NaijaJobber opportunity."),

    h1("15. Contact"),
    labelValue("Founder", "ELLFEX"),
    labelValue("X / Twitter", "https://x.com/NaijaJobber"),
    labelValue("Telegram", "https://t.me/EllfexNaijaJobber"),
    labelValue("Email", "infoellfex@gmail.com"),
    p("Invest, partner, sponsor, or pilot with NaijaJobber. Let’s put real opportunities in real hands.", {
      bold: true,
      color: DEEP_GREEN,
    }),
  ];
  return doc("NaijaJobber Business Plan", c);
}

function financialModel() {
  const c = [
    ...cover(
      "Financial Model",
      "Pre-revenue three-year management forecast covering proposed revenue, operating budget, cash flow, runway, and staged monetization.",
    ),
    h1("1. Current Financial Position"),
    table(
      ["Item", "Current position"],
      [
        ["Business stage", "Pre-revenue startup"],
        ["Historical operating revenue", "$0"],
        ["Paid products activated", "None confirmed"],
        ["Existing evidence", "Community audience, engagement, opportunity distribution, and reported success stories"],
        ["Forecast status", "Forward-looking management estimates—not historical performance or guaranteed results"],
      ],
      [38, 62],
    ),
    p(
      "NaijaJobber has not generated revenue. The purpose of this model is to estimate the funding required to build and test monetization, not to represent existing financial performance.",
      { bold: true, color: DEEP_GREEN },
    ),

    h1("2. Important Assumptions"),
    p(
      "All figures are planning estimates in USD unless otherwise stated. Prices supplied by management are shown as ranges; the model uses conservative blended assumptions and delayed activation dates. Currency, conversion, retention, tax, payment processing, and regulatory assumptions must be updated after customer interviews and paid pilots.",
    ),
    table(
      ["Input", "Planning assumption"],
      [
        ["Opening external funding", "$250,000 grant/seed funding in Year 1"],
        ["Sponsored listing", "$100–$500 each; volume grows with community reach"],
        ["Talent-as-a-Service", "$50–$1,000 per client; 20–30% placement share"],
        ["NaijaJobber Pro", "$5–$15 monthly / ₦5,000–₦10,000"],
        ["Digital product", "$10–$30 per sale"],
        ["Affiliate", "$2–$10 per qualified signup"],
        ["Transaction fee", "2–5% of completed marketplace value"],
        ["Corporate dashboard", "$100–$300 monthly"],
        ["Sponsored campaign", "$1,000–$10,000 per campaign"],
        ["Enterprise recruitment", "$5,000–$50,000 per engagement"],
      ],
      [38, 62],
    ),

    h1("3. Proposed Three-Year Revenue Forecast — Base Case"),
    table(
      ["Revenue stream", "Year 1", "Year 2", "Year 3"],
      [
        ["Sponsored listings/drops", "$12,000", "$36,000", "$72,000"],
        ["Talent-as-a-Service", "$15,000", "$45,000", "$120,000"],
        ["Premium/VIP subscriptions", "$12,000", "$60,000", "$180,000"],
        ["Digital products/courses", "$6,000", "$20,000", "$60,000"],
        ["Affiliates", "$3,000", "$12,000", "$30,000"],
        ["Corporate dashboards/API", "$3,000", "$30,000", "$90,000"],
        ["Sponsored quests/campaigns", "$8,000", "$45,000", "$120,000"],
        ["Transaction fees", "$1,000", "$15,000", "$60,000"],
        ["Advertising/brand placement", "$0", "$5,000", "$45,000"],
        ["Enterprise recruitment", "$0", "$12,000", "$60,000"],
        ["Other partnerships", "$0", "$0", "$13,000"],
        ["Total projected operating revenue", "$60,000", "$280,000", "$850,000"],
      ],
      [40, 20, 20, 20],
    ),
    p(
      "Year 1 starts from $0 revenue and assumes monetization begins only after initial paid pilots. Grants are treated as financing/non-dilutive support rather than recurring operating revenue. Token issuance is excluded because utility, regulation, and market demand are not yet validated.",
      { italics: true, color: GRAY },
    ),

    h1("4. Three-Year Operating Budget"),
    table(
      ["Expense category", "Year 1", "Year 2", "Year 3"],
      [
        ["Product, engineering, and QA", "$100,000", "$100,000", "$180,000"],
        ["Community, marketing, and partnerships", "$62,500", "$60,000", "$120,000"],
        ["Operations, support, verification, safety", "$50,000", "$65,000", "$120,000"],
        ["Cloud, tools, payments, and security", "$22,500", "$25,000", "$50,000"],
        ["Legal, compliance, accounting, insurance", "$25,000", "$25,000", "$40,000"],
        ["Content, education, and events", "$12,500", "$15,000", "$50,000"],
        ["Contingency", "$12,500", "$10,000", "$40,000"],
        ["Total operating expenses", "$285,000", "$300,000", "$600,000"],
      ],
      [40, 20, 20, 20],
    ),

    h1("5. Cash Flow and Runway"),
    table(
      ["Year", "Opening cash", "Funding", "Operating revenue", "Expenses", "Closing cash"],
      [
        ["Year 1", "$0", "$250,000", "$60,000", "($285,000)", "$25,000"],
        ["Year 2", "$25,000", "$0", "$280,000", "($300,000)", "$5,000"],
        ["Year 3", "$5,000", "$0", "$850,000", "($600,000)", "$255,000"],
      ],
      [14, 17, 17, 18, 17, 17],
    ),
    p(
      "The base case reaches annual operating break-even in Year 3. Year 1 closing cash is only $25,000, approximately 1.1 months of the Year 1 average expense level. This is a tight position: management must stage spending against milestones, validate revenue early, and maintain a contingency or follow-on funding plan.",
    ),

    h1("6. Year 1 Quarterly View"),
    table(
      ["Quarter", "Revenue", "Expenses", "Funding", "Net cash movement"],
      [
        ["Q1", "$0", "($50,000)", "$125,000", "$75,000"],
        ["Q2", "$8,000", "($65,000)", "$0", "($57,000)"],
        ["Q3", "$18,000", "($80,000)", "$125,000", "$63,000"],
        ["Q4", "$34,000", "($90,000)", "$0", "($56,000)"],
        ["Total", "$60,000", "($285,000)", "$250,000", "$25,000"],
      ],
      [20, 20, 20, 20, 20],
    ),

    h1("7. Use of Funds"),
    table(
      ["Allocation", "Amount", "%"],
      [
        ["Product and engineering", "$100,000", "40%"],
        ["Go-to-market and community", "$62,500", "25%"],
        ["Operations and support", "$50,000", "20%"],
        ["Legal, compliance, and administration", "$25,000", "10%"],
        ["Contingency", "$12,500", "5%"],
        ["Total", "$250,000", "100%"],
      ],
      [55, 25, 20],
    ),

    h1("8. Commercial Validation Milestones"),
    table(
      ["Period", "Priority economics"],
      [
        ["Months 1–3", "Confirm employer willingness to pay through interviews, signed letters of interest, and at least five paid sponsored-listing or staffing pilots."],
        ["Months 4–6", "Test premium access and digital products; measure conversion, refunds, acquisition cost, and repeat purchases before scaling."],
        ["Months 6–12", "Pilot corporate dashboards, campaigns, and payments; prove recurring employer demand and responsible unit economics."],
        ["Months 12–24", "Add enterprise recruitment, ads, and API access only after core retention and trust metrics are demonstrated."],
      ],
      [25, 75],
    ),

    h1("9. Key Metrics to Track"),
    bullet("Monthly active users, verified jobbers, verified employers, and opportunity supply."),
    bullet("Free-to-Pro conversion, monthly recurring revenue, churn, and average revenue per paying user."),
    bullet("Sponsored listing volume, average selling price, employer repeat rate, and fill rate."),
    bullet("Applications, interviews, confirmed hires, gross marketplace value, and transaction take rate."),
    bullet("Employer acquisition cost, time-to-shortlist, talent activation, and contribution margin."),
    bullet("Grant spend against budget, unrestricted cash, monthly burn, and runway."),

    h1("10. Sensitivity"),
    table(
      ["Scenario", "Year 2 implication", "Management response"],
      [
        ["Downside: revenue 40% below base", "$168,000 revenue vs $300,000 expenses", "Freeze nonessential hiring, protect safety/compliance, prioritize proven B2B services, and secure milestone-based follow-on funding."],
        ["Base case", "$280,000 revenue vs $300,000 expenses", "Control burn and enter Year 3 with validated recurring revenue."],
        ["Upside: revenue 30% above base", "$364,000 revenue and $64,000 operating surplus", "Build cash reserves before accelerating product or geographic expansion."],
      ],
      [28, 28, 44],
    ),
  ];
  return doc("NaijaJobber Financial Model", c);
}

function grantNarrative() {
  const c = [
    ...cover(
      "Grant Budget Narrative",
      "A 12-month, $250,000 workforce-access program connecting African youth with verified local, remote, and Web3 opportunities.",
      "GRANT APPLICATION • EDITABLE",
    ),
    h1("1. Project Overview"),
    p(
      "NaijaJobber is a pre-revenue, community-validated JobTech startup requesting $250,000 in non-dilutive support to convert a grassroots opportunity community into trusted JobTech infrastructure. The company has not generated operating revenue. The project will improve access to verified employment, digital gigs, Web3 contributor roles, career information, learning, and employer discovery—beginning in Nigeria.",
    ),
    p(
      "The grant addresses an access and trust problem: talented young Africans are job-ready but opportunity-deprived, while employers and projects struggle to identify credible contributors quickly. NaijaJobber will bridge this gap with recruiter verification, structured profiles, matching, Jobber XP, learning, referrals, events, and impact reporting.",
    ),

    h1("2. Evidence of Need and Starting Position"),
    bullet("Management cites more than 100 million African youth and significant youth unemployment; all market statistics will be independently sourced in the final funder submission."),
    bullet("As of October 2025, the community reported 750+ Telegram subscribers, 700+ WhatsApp members, 400+ X followers, daily engagement, and dozens of success stories."),
    bullet("Existing programming already distributes Web3, remote, and local gigs alongside educational and technology information."),
    bullet("Informal opportunity channels lack consistent verification, outcome measurement, and safe pathways for physical work."),
    bullet("Historical operating revenue is $0. Sponsored listings, subscriptions, placement services, campaigns, transaction fees, and advertising are proposed—not currently active income streams."),

    h1("3. 12-Month Objectives"),
    table(
      ["Objective", "12-month target"],
      [
        ["Community-to-platform migration", "10,000 registered users; adoption measured by active use, not signups alone"],
        ["Trust", "Verified recruiter workflow, badge definitions, moderation, reporting, and appeal procedures live"],
        ["Opportunity supply", "At least 500 verified or reviewed listings across local, remote, and Web3 categories"],
        ["Employer demand", "At least 100 employer/project accounts and 25 repeat paying organizations"],
        ["Employment outcomes", "At least 100 verified hires or paid gig completions"],
        ["Learning and readiness", "1,000 course/resource completions and 500 proof-of-work profile items"],
        ["Partnerships", "At least five B2B, ecosystem, NGO, campus, or government pilots"],
      ],
      [40, 60],
    ),

    h1("4. Budget Summary"),
    table(
      ["Category", "Amount", "%"],
      [
        ["Product and engineering", "$100,000", "40%"],
        ["Go-to-market and community", "$62,500", "25%"],
        ["Operations and customer support", "$50,000", "20%"],
        ["Legal, compliance, and administration", "$25,000", "10%"],
        ["Contingency", "$12,500", "5%"],
        ["Total requested", "$250,000", "100%"],
      ],
      [55, 25, 20],
    ),

    h1("5. Line-Item Justification"),
    h2("5.1 Product and Engineering — $100,000"),
    table(
      ["Sub-item", "Amount", "Purpose"],
      [
        ["Engineering and QA", "$65,000", "Complete user, recruiter, matching, moderation, education, XP, referral, event, and reporting workflows."],
        ["Infrastructure and security", "$20,000", "Hosting, database, email/SMS, monitoring, backups, anti-abuse controls, and security testing."],
        ["UX, accessibility, and research", "$15,000", "Mobile-first design, swipe discovery, usability studies, and inclusive access for varied skill levels."],
      ],
      [30, 18, 52],
    ),
    h2("5.2 Go-to-Market and Community — $62,500"),
    table(
      ["Sub-item", "Amount", "Purpose"],
      [
        ["Ambassadors and community activation", "$22,500", "Campus/city pilots, onboarding, verified success stories, and trusted local distribution."],
        ["Employer and project acquisition", "$20,000", "B2B outreach, pilots, case studies, sponsored-drop sales, and talent-pool demonstrations."],
        ["Events, education, and content", "$12,500", "Career resources, workshops, event partnerships, and responsible information programming."],
        ["Partnership development", "$7,500", "Ecosystem, NGO, government, and training-program relationship development."],
      ],
      [30, 18, 52],
    ),
    h2("5.3 Operations and Customer Support — $50,000"),
    table(
      ["Sub-item", "Amount", "Purpose"],
      [
        ["Verification and moderation", "$22,000", "Recruiter checks, listing review, fraud handling, and badge governance."],
        ["Support and success", "$16,000", "User support, employer onboarding, placement confirmation, and appeals."],
        ["Local-gig safety pilot", "$12,000", "Risk design, check-in/out, incident response, agent pilot, and safeguarding training."],
      ],
      [30, 18, 52],
    ),
    h2("5.4 Legal, Compliance, and Administration — $25,000"),
    p(
      "Covers privacy and data-protection review, platform terms, recruiter/listing verification disclosures, safeguarding policy, accounting, grant reporting, insurance review, contractor agreements, and legal analysis before payment, USDT, token, location, or financial-content functionality.",
    ),
    h2("5.5 Contingency — $12,500"),
    p(
      "Reserved for exchange-rate pressure, security remediation, infrastructure spikes, or safeguarding needs. Any drawdown will require written approval and clear reporting.",
    ),

    h1("6. Implementation Schedule"),
    table(
      ["Period", "Milestones"],
      [
        ["Months 1–3", "Complete verification policy; establish impact baseline; run user research; migrate initial community; launch employer pilots."],
        ["Months 4–6", "Release MVP workflows, Local/International discovery, profiles, dashboard, XP/badges, and education; reach first commercial milestones."],
        ["Months 7–9", "Add swipe matching, events, corporate dashboard pilots, sponsored quests, and payment testing; publish interim impact report."],
        ["Months 10–12", "Improve retention; validate 100 employment outcomes; document safety pilot; deliver audited program and sustainability report."],
      ],
      [25, 75],
    ),

    h1("7. Impact Measurement"),
    bullet("Unique registered and monthly active users, disaggregated only with consent and privacy safeguards."),
    bullet("Verified recruiters, reviewed listings, scam removals, reports resolved, and safety incidents."),
    bullet("Applications, interviews, paid gigs, confirmed hires, time-to-opportunity, and income outcomes where users consent."),
    bullet("Learning completions, proof-of-work items, XP progression, referrals, and talent-pool inclusion."),
    bullet("Employer repeat rate, partner campaigns, jobs created, and countries or cities reached."),
    bullet("Qualitative case studies such as Chidera’s Web3 and local-employment pathways."),

    h1("8. Sustainability"),
    p(
      "Because NaijaJobber is pre-revenue, sustainability will be demonstrated through evidence rather than assumed. The program will test diversified earned-revenue streams in stages: sponsored listings and Talent-as-a-Service first; premium subscriptions, courses, and affiliates after initial validation; then corporate dashboards, transaction fees, sponsored quests, enterprise recruitment, and responsible advertising. The conservative base management forecast targets annual operating break-even in Year 3.",
    ),
    table(
      ["Sustainability evidence", "Grant-period test"],
      [
        ["Willingness to pay", "Paid pilots and signed employer/project commitments"],
        ["Repeatability", "Repeat purchase rate for listings, staffing, and campaigns"],
        ["Recurring revenue", "Paid subscription/dashboard conversion and churn"],
        ["Unit economics", "Customer acquisition cost, gross margin, support cost, and collection rate"],
        ["Grant exit", "Monthly earned-revenue coverage of core operating expenses"],
      ],
      [38, 62],
    ),

    h1("9. Risk and Safeguarding"),
    bullet("No employer badge will imply an employment guarantee; verification scope and date will be explicit."),
    bullet("Physical-job functionality will use risk controls and will not launch broadly before safeguarding design and insurance review."),
    bullet("USDT redemption, tokens, trading, and financial promotions remain outside the grant MVP unless approved by counsel and delivered through compliant partners."),
    bullet("Market claims, success stories, and employment outcomes will be documented before publication."),
    bullet("Grant and platform data will be aggregated, access-controlled, and reported according to privacy requirements."),

    h1("10. Funder Alignment"),
    table(
      ["Priority", "NaijaJobber contribution"],
      [
        ["Youth employment", "Direct access to local, remote, and digital work plus outcome tracking."],
        ["Digital inclusion", "Mobile-first discovery and guidance for degree and non-degree pathways."],
        ["Entrepreneurship and Web3", "Contributor roles, quests, credentials, community careers, and ecosystem campaigns."],
        ["Safety and trust", "Recruiter verification, moderation, local-gig safeguarding, and transparent listings."],
        ["Scalability", "Community-led acquisition, employer SaaS, multi-city ambassadors, and API-ready infrastructure."],
      ],
      [34, 66],
    ),

    h1("11. Contact"),
    labelValue("Applicant", "NaijaJobber"),
    labelValue("Founder", "ELLFEX"),
    labelValue("X / Twitter", "https://x.com/NaijaJobber"),
    labelValue("Telegram", "https://t.me/EllfexNaijaJobber"),
    labelValue("Email", "infoellfex@gmail.com"),
  ];
  return doc("NaijaJobber Grant Budget Narrative", c);
}

function slide(label, heading, body) {
  return [
    p(label.toUpperCase(), { bold: true, color: GREEN, after: 100 }),
    new Paragraph({
      children: [run(heading, { size: 42, bold: true, color: DEEP_GREEN })],
      spacing: { after: 260 },
    }),
    ...body,
    pageBreak(),
  ];
}

function pitchDeck() {
  const c = [
    spacer(500),
    p("PITCH DECK • BRIDGING THE GAP • INVESTOR EDITION", { bold: true, color: GREEN, after: 320 }),
    new Paragraph({
      children: [
        run("Naija", { size: 58, bold: true, color: DEEP_GREEN }),
        run("Jobber", { size: 58, bold: true, color: GREEN }),
        run("  🦇", { size: 40 }),
      ],
      spacing: { after: 220 },
    }),
    new Paragraph({
      children: [run("Africa’s #1 JobTech Platform", { size: 48, bold: true, color: DEEP_GREEN })],
      spacing: { after: 120 },
    }),
    p("Connecting Hustlers to Opportunities", { bold: true, color: DARK, after: 200 }),
    p("“From Telegram drops to a full-blown TalentTech revolution.”", {
      italics: true,
      color: GRAY,
      after: 500,
    }),
    p("From Hustle to Hire", { bold: true, color: GREEN }),
    p("Pre-revenue • Seeking $250k • Confidential • July 2026", { color: GRAY }),
    pageBreak(),

    ...slide("01 • What is NaijaJobber?", "Africa’s opportunity engine", [
      p("A fast-growing, grassroots launchpad for early-stage Web3, tech, local, remote, white-collar, blue-collar, student, and freelance talent."),
      bullet("Real builders matched with projects: moderators, ambassadors, beta testers, community managers, and creators."),
      bullet("Career hustlers matched with employers: students, professionals, tradespeople, and first-time job seekers."),
      bullet("A real-time talent-to-opportunity pipeline—Tinder for jobbers, backed by verification and community."),
      p("Stage: pre-revenue. Historical operating revenue: $0. Current evidence is community traction.", {
        bold: true,
        color: DEEP_GREEN,
      }),
    ]),

    ...slide("02 • Problem", "Talent exists. Access and trust do not.", [
      bullet("Millions of African youth are skilled but unemployed or underemployed."),
      bullet("Opportunities are scattered across chats, social networks, and foreign-first platforms."),
      bullet("Existing platforms often exclude Web3, blue-collar, microjob, and early-career pathways."),
      bullet("Unverified recruiters expose job seekers to scams and physical-safety risks."),
      bullet("Employers need faster access to credible talent without building another HR department."),
    ]),

    ...slide("03 • Solution", "One bridge to real-time opportunity", [
      bullet("Web3 ambassador, moderator, beta tester, community, and quest roles."),
      bullet("Local jobs, office roles, freelance assignments, microjobs, and remote employment."),
      bullet("Government/NGO training, educational resources, career tools, events, and job fairs."),
      bullet("Verified recruiters, moderated listings, optional local-gig safety support, and account integrity."),
      p("The difference between untapped potential and income is often information. NaijaJobber puts that information—and the path to act on it—in one place.", {
        bold: true,
        color: DEEP_GREEN,
      }),
    ]),

    ...slide("04 • Why Now", "The window is open for African JobTech", [
      bullet("Youth demographics: Africa’s working-age population is expanding; Nigeria’s youth unemployment remains structurally high—creating urgent demand for access, not only training."),
      bullet("Remote and digital work: Global employers increasingly hire distributed English-proficient talent; African candidates need trusted on-ramps."),
      bullet("Web3 and creator economies: Projects need mods, ambassadors, beta testers, and community managers daily—roles informal chats fill poorly."),
      bullet("Trust crisis: Scams and unsafe local gigs make verification and moderation a product requirement, not a nice-to-have."),
      bullet("Community-to-platform moment: NaijaJobber already has engaged Telegram/WhatsApp distribution; the next step is owned infrastructure and monetization pilots."),
      p("Timing thesis: digital opportunity demand is rising faster than trusted African-native matching infrastructure.", {
        bold: true,
        color: DEEP_GREEN,
      }),
    ]),

    ...slide("05 • Product", "Community today. TalentTech platform next.", [
      table(
        ["Live community", "Platform roadmap"],
        [
          ["Telegram and WhatsApp communities", "Local / International-Web3 discovery"],
          ["Daily curated job drops", "Swipe-based job matching"],
          ["Tech events and opportunity updates", "Verified recruiter dashboard"],
          ["Tech/crypto news and education", "Talent-near-you and curated Talent Pool"],
          ["Community success stories", "Jobber XP, badges, referrals, courses, and rewards"],
        ],
        [48, 52],
      ),
    ]),

    ...slide("06 • Market Size", "Quantified opportunity (management framing)", [
      p("Figures below are planning estimates for investor discussion. Replace bracketed sources with verified citations before formal fundraising.", {
        italics: true,
        color: GRAY,
      }),
      table(
        ["Layer", "Definition", "Planning estimate"],
        [
          ["TAM", "African youth / early-career digital opportunity seekers and employers serving them", "100M+ African youth [cite UN / AU / World Bank youth stats]"],
          ["SAM", "Nigeria + Anglophone Africa English-first local, remote, and Web3 opportunity market", "Tens of millions of job-seeking youth + SME/Web3 demand [cite NBS / ILO + digital economy reports]"],
          ["SOM", "NaijaJobber 24-month reachable beachhead: community migration + Nigeria employers/projects", "Path to 10k+ registered users Y1; paid B2B pilots and recurring employer revenue Y2"],
        ],
        [12, 48, 40],
      ),
      bullet("Beachhead: Nigeria community-driven local, remote, and Web3 opportunities."),
      bullet("Expansion: Lagos → other Nigerian cities → Nairobi and high-density African corridors."),
      bullet("Buyer sides: SMEs, remote employers, Web3 ecosystems, NGOs, governments, training programs."),
    ]),

    ...slide("07 • Traction", "Community demand is already visible", [
      p("NaijaJobber is pre-revenue. These figures are non-financial community traction, not paid-customer or income metrics.", {
        bold: true,
        color: DEEP_GREEN,
      }),
      table(
        ["As of October 2025", "Reported traction"],
        [
          ["Telegram", "750+ subscribers"],
          ["WhatsApp", "700+ members"],
          ["X / Twitter", "400+ followers"],
          ["Engagement", "Active daily community"],
          ["Outcomes", "Dozens of job/gig success stories"],
          ["Opportunity cadence", "Historically 3–5 daily curated drops"],
          ["Recognition", "Web3 projects including AYETU and Transfermole"],
        ],
        [45, 55],
      ),
    ]),

    ...slide("08 • Go-to-Market", "Acquire users and employers in 12–24 months", [
      table(
        ["Period", "Supply (jobbers)", "Demand (employers / projects)"],
        [
          ["0–6 mo", "Migrate Telegram/WhatsApp; campus & city ambassadors; education content; referral XP", "Outbound to SMEs & Web3 projects; sponsored drops; TaaS pilots; LOIs"],
          ["6–12 mo", "Swipe discovery; events near you; Talent Pool spotlights; Pro conversion tests", "Verified recruiter flow; repeat listings; first campaigns; dashboard pilots"],
          ["12–24 mo", "Multi-city ambassadors; talent-near-you; courses at scale", "Corporate dashboards; ecosystem quests; NGO/gov pilots; enterprise recruitment"],
        ],
        [14, 43, 43],
      ),
      bullet("Acquisition wedge: owned community + trusted daily drops (lower CAC than cold ads alone)."),
      bullet("Monetization wedge: B2B paid visibility and staffing before complex consumer paywalls."),
      bullet("Trust wedge: verification and moderation as the reason employers and parents choose NaijaJobber."),
    ]),

    ...slide("09 • Proposed Business Model", "From pre-revenue to validated income", [
      p("Historical operating revenue: $0. Each stream will be tested through paid pilots before scale.", {
        bold: true,
        color: DEEP_GREEN,
      }),
      bullet("0–6 months: sponsored listings, Talent-as-a-Service, NaijaJobber Pro, digital products, and affiliates."),
      bullet("6–12 months: 2–5% transaction fees, $100–$300 corporate dashboards, and $1K–$10K sponsored campaigns."),
      bullet("12–24 months: $5K–$50K enterprise recruitment, hiring API, and responsible in-app advertising."),
      bullet("Ongoing: Web3 ecosystem, African innovation, youth-employment, and digital-skills grants."),
      p("Base planning forecast (illustrative): ~$60k Y1 → ~$280k Y2 → ~$850k Y3 earned revenue; break-even targeted Year 3 after validation.", {
        italics: true,
        color: GRAY,
      }),
    ]),

    ...slide("10 • Competitive Landscape", "Where NaijaJobber wins", [
      table(
        ["", "LinkedIn", "Jobberman", "Upwork", "NaijaJobber"],
        [
          ["Core focus", "Global professional network", "Regional job board", "Freelance marketplace", "African opportunity engine: local + remote + Web3"],
          ["Early / hustler roles", "Weak for first gigs", "Mixed", "Requires portfolio/trust", "Built for entry + hustle pathways"],
          ["Web3 contributor roles", "Limited", "Limited", "Limited", "Native (mods, ambassadors, quests)"],
          ["Verification / safety", "Profile-centric", "Employer listings", "Platform escrow norms", "Recruiter verification + moderation + local-gig safety design"],
          ["Discovery UX", "Search/network", "Search/list", "Search/bid", "Daily drops + swipe matching"],
          ["Culture", "Corporate/global", "Formal jobs", "Global freelance", "Hustler-first, African night-grind brand"],
          ["Community layer", "Weak as job source", "Weak", "Weak", "Live Telegram/WhatsApp distribution"],
        ],
        [16, 21, 21, 21, 21],
      ),
      p("We do not out-LinkedIn LinkedIn. We win on African-native access, trust, Web3 + local breadth, and community-to-platform speed.", {
        bold: true,
        color: DEEP_GREEN,
      }),
    ]),

    ...slide("11 • Differentiation", "Speed, trust, culture, and breadth", [
      table(
        ["Typical job board", "NaijaJobber"],
        [
          ["Listings only", "Community + learning + matching + outcomes"],
          ["White-collar focus", "Web3, local, remote, blue/white collar, students"],
          ["Slow search", "Daily drops and Tinder-style swipe"],
          ["Weak verification", "Recruiter checks, moderation, and safety design"],
          ["Static CV", "Proof-of-work, XP, badges, talent spotlight"],
          ["Foreign product language", "African, hustler-first culture"],
        ],
        [45, 55],
      ),
    ]),

    ...slide("12 • User Story", "Meet Chidera", [
      p("22 • Lagos • NYSC • learning crypto from YouTube • wants to earn $100/month and support family."),
      bullet("Web3 route: discovers ambassador roles → joins a quest → earns first $50 → gets featured → builds confidence and portfolio."),
      bullet("Local route: discovers nearby office roles → applies seamlessly → matches with a verified employer → gets hired → shares the success."),
      p("Multiply Chidera by 100,000—and ultimately one million.", {
        bold: true,
        color: DEEP_GREEN,
      }),
    ]),

    ...slide("13 • Roadmap", "24-month path: community → platform → scale", [
      bullet("Months 1–6: MVP, verification, Local/International discovery, XP, education; paid listing/TaaS pilots; community migration."),
      bullet("Months 7–12: Swipe matching, events, payment pilots, ~10k registered-user path, ~100 verified outcomes, sustainability evidence."),
      bullet("Months 13–18: Corporate dashboards, recurring B2B, multi-city ambassadors, transaction-fee pilot."),
      bullet("Months 19–24: Enterprise/NGO deals, hiring API pilots, cautious ads if trust allows; prepare Year 3 operating break-even."),
      p("Brand: Bat / night hustler • Vision: 1M Africans connected to digital work by 2030.", { color: GRAY }),
    ]),

    ...slide("14 • Team", "Built from the grassroots — hiring to execute", [
      table(
        ["Role", "Person / status", "Relevant expertise"],
        [
          ["Founder / CEO", "ELLFEX — active", "Web3 ambassador across 15+ projects; community builder; Blockchain Futurist speaker; scaled Builders Hub to 600+ contributors"],
          ["Product & Engineering", "Open — priority hire/contract", "MVP, matching, verification tooling, mobile-first UX, security"],
          ["Operations & Verification", "Open — priority hire/contract", "Listing review, scam response, SLAs, local-gig safeguarding"],
          ["Community & Growth", "Open / ambassadors", "Drops, campus/city distribution, content, retention"],
          ["BD / Employer Success", "Open — priority for pilots", "Sponsored listings, TaaS, LOIs, B2B pilots"],
          ["Finance & Compliance", "Open / advisor", "Grant reporting, controls, payment/legal readiness"],
        ],
        [24, 28, 48],
      ),
      p("Investors are backing a founder with proven community creation plus a clear hire plan for product, trust ops, and commercial validation.", {
        italics: true,
        color: GRAY,
      }),
    ]),

    ...slide("15 • The Ask", "$250,000 — 12 months to MVP + paid validation", [
      p("Instrument: grant and/or early-stage capital (non-dilutive preferred where available; equity/convertible terms TBD).", {
        bold: true,
        color: DEEP_GREEN,
      }),
      table(
        ["Use of funds", "Amount", "%"],
        [
          ["Product & engineering", "$100,000", "40%"],
          ["Go-to-market & community", "$62,500", "25%"],
          ["Operations, verification & support", "$50,000", "20%"],
          ["Legal, compliance & admin", "$25,000", "10%"],
          ["Contingency", "$12,500", "5%"],
          ["Total", "$250,000", "100%"],
        ],
        [55, 25, 20],
      ),
      bullet("Milestones funded: MVP live; verified recruiter flow; community migration; 5+ paid B2B pilots; impact baseline and reporting."),
      bullet("Runway: ~12 months of staged build at planned Year 1 opex, contingent on milestone discipline (pre-revenue; earned revenue is not assumed as primary cover)."),
      bullet("Success definition: platform live + willingness-to-pay evidence + auditable youth opportunity outcomes—not vanity signups."),
    ]),

    ...slide("16 • Vision", "One million Africans connected to digital work by 2030", [
      bullet("Africa’s #1 opportunity engine—from Lagos to Nairobi."),
      bullet("The go-to platform for global startups, local employers, governments, NGOs, and ecosystems to find African talent."),
      bullet("The birthplace of the next 1,000 Web3 stars and career leaders."),
      p("We’re not just building an app. We’re building Africa’s tech opportunity culture.", {
        bold: true,
        color: GREEN,
      }),
    ]),

    p("17 • CALL TO ACTION", { bold: true, color: GREEN, after: 220 }),
    new Paragraph({
      children: [run("Invest, partner, or pilot — put real opportunities in real hands.", { size: 40, bold: true, color: DEEP_GREEN })],
      spacing: { after: 280 },
    }),
    p("Seeking $250k to convert community demand into trusted JobTech infrastructure and validated revenue.", { bold: true, after: 260 }),
    labelValue("Founder", "ELLFEX"),
    labelValue("X / Twitter", "https://x.com/NaijaJobber"),
    labelValue("Telegram", "https://t.me/EllfexNaijaJobber"),
    labelValue("Email", "infoellfex@gmail.com"),
    spacer(300),
    p("The hustle is African. The opportunity is NaijaJobber. 🦇", {
      bold: true,
      color: GREEN,
    }),
  ];
  return doc("NaijaJobber Pitch Deck", c, { landscape: true });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const all = [
    ["NaijaJobber-Business-Plan-Pre-Revenue.docx", businessPlan()],
    ["NaijaJobber-Financial-Model-Pre-Revenue.docx", financialModel()],
    ["NaijaJobber-Grant-Budget-Narrative-Pre-Revenue.docx", grantNarrative()],
    ["NaijaJobber-Pitch-Deck-Pre-Revenue.docx", pitchDeck()],
  ];
  const onlyPitch = process.argv.includes("--pitch-only");
  const documents = onlyPitch
    ? all.filter(([name]) => name.includes("Pitch-Deck"))
    : all;

  for (const [filename, document] of documents) {
    const buffer = await Packer.toBuffer(document);
    const target = path.join(OUT, filename);
    try {
      fs.writeFileSync(target, buffer);
      console.log(`Created ${filename} (${Math.round(buffer.length / 1024)} KB)`);
    } catch (error) {
      if (error && error.code === "EBUSY") {
        const alt = filename.replace(/\.docx$/, "-Investor.docx");
        fs.writeFileSync(path.join(OUT, alt), buffer);
        console.log(`Locked ${filename}; wrote ${alt} instead (${Math.round(buffer.length / 1024)} KB)`);
      } else {
        throw error;
      }
    }
  }
  console.log(`All editable documents saved to ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
