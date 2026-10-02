export type SampleMessage = {
  id: string;
  label: string;
  companyName: string;
  contact: string;
  sourceText: string;
};

export const SAMPLE_MESSAGES: SampleMessage[] = [
  {
    id: "macbook-crypto",
    label: "Classic MacBook scam",
    companyName: "",
    contact: "hiring.ops.global@gmail.com",
    sourceText: `Dear Freelancer,

We came across your profile and want you for an urgent confidential project paying $5,000/week. Please buy a MacBook Pro first and we will reimburse you via crypto.

Message me on Telegram only — keep this between us.

— Alex, Hiring Manager`,
  },
  {
    id: "unpaid-trial",
    label: "Unpaid trial trap",
    companyName: "BrightPixel LLC",
    contact: "talent@brightpixel-mail.com",
    sourceText: `Hi! Hoping this email finds you well. We need a homepage redesign ASAP.

Before we discuss payment, please complete an unpaid test project (full homepage mock) so we can evaluate you. If we like it we may hire you at $4k/week.

Thanks,
HR Team`,
  },
  {
    id: "clean-brief",
    label: "Clean Swedish brief",
    companyName: "Northwind AB",
    contact: "sara@northwind.se",
    sourceText: `Hej — vi är Northwind AB (org 556677-8899). Behöver en homepage-omdesign med discovery, två riktningar och en revision. Deadline om tre veckor.

Vi betalar gärna 40% handpenning mot ett fast scope innan kickoff. Kan du skicka en kort offert?

Vänliga hälsningar,
Sara`,
  },
];
