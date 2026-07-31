/**
 * Pitch deck rebuilt from externally edited DOCX text + investor corrections.
 * Usage: cd frontend && node ../docs/foundation/generate-pitch-from-edits.cjs
 */
const fs = require("fs");
const path = require("path");
const {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
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
} = require(path.join(__dirname, "..", "..", "frontend", "node_modules", "docx"));

const OUT = path.join(__dirname, "docx");
const GREEN = "19E66B";
const DARK = "0B0F0D";
const DEEP_GREEN = "075E35";
const GRAY = "5F6B65";
const LIGHT_GRAY = "E5E9E7";
const WHITE = "FFFFFF";
const border = { style: BorderStyle.SINGLE, size: 1, color: LIGHT_GRAY };

function run(text, options = {}) {
  return new TextRun({
    text,
    font: "Aptos",
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
    spacing: { after: options.after ?? 140, line: options.line || 300 },
    bullet: options.bullet ? { level: options.level || 0 } : undefined,
  });
}

function bullet(text) {
  return p(text, { bullet: true, after: 80 });
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
  const children = [
    spacer(500),
    p("PITCH DECK • AFRICA’S BIGGEST OPPORTUNITY ENGINE", { bold: true, color: GREEN, after: 320 }),
    new Paragraph({
      children: [
        run("Naija", { size: 58, bold: true, color: DEEP_GREEN }),
        run("Jobber", { size: 58, bold: true, color: GREEN }),
        run("  🦇", { size: 40 }),
      ],
      spacing: { after: 220 },
    }),
    new Paragraph({
      children: [run("Building Africa’s Fast Growing Opportunity Engine", { size: 40, bold: true, color: DEEP_GREEN })],
      spacing: { after: 120 },
    }),
    p("Where opportunity meets preparation", { bold: true, color: DARK, after: 200 }),
    p("“From Telegram drops to a full-blown talent tech revolution.”", { italics: true, color: GRAY, after: 500 }),
    p("From Hustle to Hire", { bold: true, color: GREEN }),
    p("Pre-revenue • Seeking $250k • Confidential • July 2026 • Editable deck", { color: GRAY }),
    pageBreak(),

    ...slide("01 • What is NaijaJobber?", "Africa’s fast-growing opportunity engine", [
      p("A fast-growing, grassroots launchpad for early-stage Web3, tech, local, remote, white-collar, blue-collar, student, and freelance talent."),
      bullet("Real builders matched with projects: moderators, ambassadors, beta testers, community managers, and creators."),
      bullet("Career builders matched with employers: students, professionals, tradespeople, and first-time job seekers."),
      bullet("A real-time talent-to-opportunity pipeline: Swipe-based talent matching, backed by verification and community."),
    ]),

    ...slide("02 • Problem", "Talent exists. Access and trust do not.", [
      bullet("Millions of African youth are skilled but unemployed or underemployed."),
      bullet("Opportunities are scattered across chats, social networks, and global platforms not designed for African users."),
      bullet("Existing platforms often exclude Web3, blue-collar, microjob, and early-career pathways."),
      bullet("Unverified recruiters expose job seekers to scams and physical-safety risks."),
      bullet("Employers need faster access to credible talent without building another HR department."),
    ]),

    ...slide("03 • Solution", "One bridge to real-time opportunity", [
      bullet("Web3 ambassador, moderator, beta tester, community, and quest roles."),
      bullet("Local jobs, office roles, freelance assignments, microjobs, and remote employment."),
      bullet("Government/NGO training, educational resources, career tools, events, and job fairs."),
      bullet("Verified recruiters, moderated listings, optional local-gig safety support, and account integrity."),
      bullet("Companies discover verified talent, and job seekers discover real opportunities, creating value for both employers and job seekers."),
      p("The difference between untapped potential and income is often information. NaijaJobber puts that information and the path to act on it in one place.", {
        bold: true,
        color: DEEP_GREEN,
      }),
    ]),

    ...slide("04 • Why Now", "The window is open for African JobTech", [
      bullet("Youth labor pressure: each year far more young Africans enter the labor market than formal jobs are created (AfDB Jobs for Youth in Africa Strategy)."),
      bullet("Remote and digital work: global employers hire distributed English-proficient talent; African candidates need trusted on-ramps."),
      bullet("Web3 and creator economies: projects need mods, ambassadors, beta testers, and community managers daily—roles informal chats fill poorly."),
      bullet("Trust crisis: scams and unsafe local gigs make verification and moderation a product requirement."),
      bullet("Community-to-platform moment: NaijaJobber already has engaged Telegram/WhatsApp distribution; next step is owned infrastructure and monetization pilots."),
      p("Timing thesis: digital opportunity demand is rising faster than trusted African-native matching infrastructure.", {
        bold: true,
        color: DEEP_GREEN,
      }),
    ]),

    ...slide("05 • Product", "Community today. Building Tomorrow's TalentTech platform next.", [
      table(
        ["Live community", "Platform roadmap"],
        [
          ["Telegram and WhatsApp communities", "Local / International-Web3 discovery"],
          ["Daily curated job drops", "Swipe-based job matching"],
          ["Tech events and opportunity updates", "Verified recruiter dashboard"],
          ["Tech/crypto news and education", "Talent-near-you and curated talent pools"],
          ["Community success stories", "Jobber XP, badges, referrals, courses, and rewards"],
        ],
        [48, 52],
      ),
    ]),

    ...slide("06 • Why the Bat?", "Built for the night builder", [
      bullet("A resting bat is not idle, it is prepared, conserving energy, ready to launch."),
      bullet("The symbol mirrors African youth learning, applying, and building after hours."),
      bullet("Minimal geometry communicates confidence, upward momentum, and digital recall."),
      bullet("Brand energy: electric green, deep black, bold, street-smart, uplifting."),
      p("Opportunity Never Sleeps.", { bold: true, color: GREEN }),
    ]),

    ...slide("07 • Market", "A massive underserved opportunity", [
      p("Market Insight: Each year, between 10 and 12 million young Africans enter the labor market, but only around 3 million formal jobs are created, and there's growing demand for Web3 and digital skills (African Development Bank. Jobs for Youth in Africa Strategy 2016–2025)."),
      bullet("Beachhead: Nigeria’s community-driven local, remote, and Web3 opportunity market."),
      bullet("Expansion: Lagos to Nairobi and other high-density African talent corridors."),
      bullet("Demand: global startups, fintechs, Web3 ecosystems, SMEs, NGOs, governments, and training programs."),
    ]),

    ...slide("08 • Market Size", "TAM / SAM / SOM for investor framing", [
      table(
        ["Layer", "Definition", "Planning estimate"],
        [
          ["TAM", "African youth entering work + employers/projects hiring digital, local, remote, and Web3 talent", "100M+ African youth opportunity pool; AfDB labor-market gap (10–12M entrants vs ~3M formal jobs/year)"],
          ["SAM", "Nigeria + Anglophone Africa English-first local, remote, and Web3 opportunity market", "Beachhead demand from Nigerian youth + SMEs, fintechs, remote employers, and Web3 projects"],
          ["SOM", "NaijaJobber reachable market in 24 months", "Community migration path to 10,000+ platform users; paid B2B pilots in Y1; recurring employer revenue in Y2"],
        ],
        [12, 40, 48],
      ),
      p("SOM is execution-based, not a claim of capturing the full African labor market.", { italics: true, color: GRAY }),
    ]),

    ...slide("09 • Traction", "Early Community Traction", [
      p("NaijaJobber is pre-revenue. These figures are non-financial community traction, not paid-customer or income metrics.", {
        bold: true,
        color: DEEP_GREEN,
      }),
      table(
        ["As of October 2025", "Reported traction"],
        [
          ["Telegram", "950+ subscribers"],
          ["WhatsApp", "825+ members"],
          ["X / Twitter", "545+ followers"],
          ["Engagement", "Active daily community"],
          ["Outcomes", "Dozens of job/gig success stories"],
          ["Opportunity cadence", "Historically 3–5 daily curated drops"],
        ],
        [45, 55],
      ),
    ]),

    ...slide("10 • Go-to-Market", "How we acquire users and employers (12–24 months)", [
      table(
        ["Period", "Supply (jobbers / builders)", "Demand (employers / projects)"],
        [
          ["0–6 mo", "Migrate Telegram/WhatsApp; campus & city ambassadors; education content; referral XP", "Outbound to SMEs, fintechs & Web3 projects; sponsored drops; TaaS pilots; LOIs"],
          ["6–12 mo", "Swipe discovery; events near you; Talent Pool spotlights; Pro conversion tests", "Verified recruiter flow; repeat listings; first campaigns; dashboard pilots"],
          ["12–24 mo", "Multi-city ambassadors; talent-near-you; courses at scale", "Corporate dashboards; ecosystem quests; NGO/gov pilots; enterprise recruitment"],
        ],
        [14, 43, 43],
      ),
      bullet("Acquisition wedge: owned community + trusted daily drops (lower CAC than cold ads alone)."),
      bullet("Monetization wedge: B2B paid visibility and staffing before complex consumer paywalls."),
      bullet("Trust wedge: verification and moderation as the reason employers choose NaijaJobber."),
    ]),

    ...slide("11 • Proposed Business Model", "From pre-revenue to validated income", [
      p("Revenue Today: Revenue Validation Begins Through Paid Pilot.", { bold: true, color: DEEP_GREEN }),
      bullet("0–6 months: sponsored listings, Talent-as-a-Service, NaijaJobber Pro, digital products, and affiliates."),
      bullet("6–12 months: 2–5% transaction fees, $100–$300 corporate dashboards, and $1K–$10K sponsored campaigns."),
      bullet("12–24 months: $5K–$50K enterprise recruitment, hiring API, and responsible in-app advertising."),
      bullet("Ongoing: Web3 ecosystem, African innovation, youth employment, and digital-skills grants."),
      p("Optional XP/token credentials come only after utility, compliance, and fraud controls are validated.", {
        italics: true,
        color: GRAY,
      }),
    ]),

    ...slide("12 • Competitive Landscape", "LinkedIn, Jobberman, Upwork — and where we win", [
      table(
        ["", "LinkedIn", "Jobberman", "Upwork", "NaijaJobber"],
        [
          ["Core focus", "Global professional network", "Regional job board", "Freelance marketplace", "African opportunity engine: local + remote + Web3"],
          ["Early / builder roles", "Weak for first gigs", "Mixed", "Requires portfolio/trust", "Built for entry + builder pathways"],
          ["Web3 contributor roles", "Limited", "Limited", "Limited", "Native (mods, ambassadors, quests)"],
          ["Verification / safety", "Profile-centric", "Employer listings", "Platform escrow norms", "Recruiter verification + moderation + local-gig safety design"],
          ["Discovery UX", "Search/network", "Search/list", "Search/bid", "Daily drops + swipe matching"],
          ["Culture", "Corporate/global", "Formal jobs", "Global freelance", "Builder-first, African night-grind brand"],
          ["Community layer", "Weak as job source", "Weak", "Weak", "Live Telegram/WhatsApp distribution"],
        ],
        [16, 21, 21, 21, 21],
      ),
      p("We do not out-LinkedIn LinkedIn. We win on African-native access, trust, Web3 + local breadth, and community-to-platform speed.", {
        bold: true,
        color: DEEP_GREEN,
      }),
    ]),

    ...slide("13 • Differentiation", "Speed, trust, culture, and breadth", [
      table(
        ["Typical job board", "NaijaJobber"],
        [
          ["Listings only", "Community + learning + matching + outcomes"],
          ["White-collar focus", "Web3, local, remote, blue/white-collar, students"],
          ["Slow search", "Daily drops and swipe-based talent matching"],
          ["Weak verification", "Recruiter checks, moderation, and safety design"],
          ["Static CV", "Proof-of-work, XP, badges, talent spotlight"],
          ["Global-first product language", "African, builder-first culture"],
        ],
        [45, 55],
      ),
    ]),

    ...slide("14 • User Story", "Meet Chidera", [
      p("22 • Lagos • NYSC • learning crypto from YouTube • I want to earn $100/month and support my family."),
      bullet("Web3 route: discovers ambassador roles → joins a quest → earns first $50 → gets featured → builds confidence and portfolio."),
      bullet("Local route: discovers nearby office roles → applies seamlessly → matches with a verified employer → gets hired → shares the success."),
      p("Multiply Chidera by 100,000—and ultimately 1 million.", { bold: true, color: DEEP_GREEN }),
    ]),

    ...slide("15 • Roadmap", "Next six months: community to platform", [
      bullet("Finalize the platform MVP and verified recruiter workflows."),
      bullet("Launch job dashboard, local/international discovery, and builder reputation."),
      bullet("Grow toward 10,000 platform users while maintaining community quality."),
      bullet("Secure strategic grants and run the first paid ecosystem and B2B hiring pilots."),
      bullet("Establish measurable application, hiring, gig, safety, and learning outcomes."),
      p("Months 13–24 (summary): corporate dashboards, recurring B2B, multi-city ambassadors, enterprise/NGO pilots, and Year 3 break-even preparation.", {
        italics: true,
        color: GRAY,
      }),
    ]),

    ...slide("16 • Team", "Built from the grassroots — hiring to execute", [
      table(
        ["Role", "Person / status", "Relevant expertise"],
        [
          ["Founder / CEO", "ELLFEX — active", "Leading Web3 ambassador across 35+ projects; community growth and operations manager; built and scaled Builders Hub independently"],
          ["Product & Engineering", "Open — priority hire/contract", "MVP, matching, verification tooling, mobile-first UX, security"],
          ["Operations & Verification", "Open — priority hire/contract", "Listing review, scam response, SLAs, local-gig safeguarding"],
          ["Community & Growth", "Open / ambassadors", "Drops, campus/city distribution, content, retention"],
          ["BD / Employer Success", "Open — priority for pilots", "Sponsored listings, TaaS, LOIs, B2B pilots"],
          ["Finance & Compliance", "Open / advisor", "Grant reporting, controls, payment/legal readiness"],
        ],
        [24, 28, 48],
      ),
      p("Building a multidisciplinary team across development, operations, communications, verification, employer success, and finance.", {
        italics: true,
        color: GRAY,
      }),
    ]),

    ...slide("17 • The Ask", "$250,000 — 12 months to MVP + paid validation", [
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

    ...slide("18 • Vision", "One million Africans connected to digital work by 2030", [
      bullet("Africa’s #1 opportunity engine—from Lagos to Nairobi."),
      bullet("The go-to platform for global startups, local employers, fintechs, governments, NGOs, and ecosystems to find African talent."),
      bullet("The launchpad for the next 1,000 Web3 stars and career leaders."),
      p("We’re not just building an app. We’re building Africa’s tech opportunity culture.", { bold: true, color: GREEN }),
    ]),

    p("19 • CALL TO ACTION", { bold: true, color: GREEN, after: 220 }),
    new Paragraph({
      children: [run("Help us put real opportunities in real hands.", { size: 44, bold: true, color: DEEP_GREEN })],
      spacing: { after: 280 },
    }),
    p("Join us as an investor, strategic partner, employer, or ecosystem collaborator.", { bold: true, after: 200 }),
    p("Seeking $250k to convert community demand into trusted JobTech infrastructure and validated revenue.", { after: 260 }),
    labelValue("Founder", "ELLFEX"),
    labelValue("X / Twitter", "https://x.com/NaijaJobber"),
    labelValue("Telegram", "https://t.me/EllfexNaijaJobber"),
    labelValue("Email", "infoellfex@gmail.com"),
    spacer(300),
    p("The hustle is African. The opportunity is NaijaJobber. 🦇", { bold: true, color: GREEN }),
  ];

  return new Document({
    creator: "NaijaJobber",
    title: "NaijaJobber Pitch Deck",
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
            size: { orientation: PageOrientation.LANDSCAPE },
            margin: { top: 900, right: 900, bottom: 900, left: 900 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  run("Naija", { size: 20, bold: true, color: DEEP_GREEN }),
                  run("Jobber", { size: 20, bold: true, color: GREEN }),
                  run("  •  From Hustle to Hire", { size: 16, color: GRAY }),
                ],
                border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: GREEN } },
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  run("NaijaJobber Pitch Deck  •  Confidential  •  ", { size: 16, color: GRAY }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GRAY }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children,
      },
    ],
  });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const buffer = await Packer.toBuffer(pitchDeck());
  const primary = path.join(OUT, "NaijaJobber-Pitch-Deck-Pre-Revenue.docx");
  try {
    fs.writeFileSync(primary, buffer);
    console.log(`Updated ${primary} (${Math.round(buffer.length / 1024)} KB)`);
  } catch (error) {
    if (error && error.code === "EBUSY") {
      const alt = path.join(OUT, "NaijaJobber-Pitch-Deck-Pre-Revenue-Merged.docx");
      fs.writeFileSync(alt, buffer);
      console.log(`Primary file locked; wrote ${alt} (${Math.round(buffer.length / 1024)} KB)`);
    } else {
      throw error;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
