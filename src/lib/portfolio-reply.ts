import { PROJECTS, STACK } from "./content";
import de from "./de";

export function portfolioReply(question: string, language: "en" | "de") {
  const translate = (text: string) => language === "de" ? de[text] ?? text : text;
  const prefix = translate("Portfolio facts (live AI is offline):");
  const contact = translate("For more detail, email anand.ankit093@gmail.com.");
  const projectTopics: [RegExp, string][] = [
    [/smartreco|hackathon|mesh api|build challenge|wettbewerb/i, "smartreco/"],
    [/360t|trade|fintech|deutsche b[oö]rse/i, "post-trade-integrations/"],
    [/rag|knowledge|chatbot|confluence|sharepoint|wissens/i, "enterprise-chatbot/"],
    [/inventory|product intelligence|crew ?ai|bestand|produktintelligenz/i, "product-intelligence/"],
    [/event|kafka|tiktok|marketplace|distributed|ereignis|verteilt/i, "marketplace-integration/"],
    [/copilot|pilot|two weeks|2 weeks|zwei wochen/i, "genai-delivery-pilot/"],
    [/logistic|manhattan|carrier|supply.chain|logistik/i, "logistics-platform/"],
  ];
  let answer: string;
  if (/tech.?stack|skills?|technolog|competenc|kenntnisse|kompetenz/i.test(question)) {
    answer = STACK.map(([label, items]) => `${translate(label)}: ${items}`).join("\n\n");
  } else {
    const match = projectTopics.find(([pattern]) => pattern.test(question));
    const project = match && PROJECTS.find((entry) => entry.dir === match[1]);
    if (project) {
      answer = [project.name, project.architecture, project.outcome].map(translate).join("\n\n");
    } else if (/consult|contact|email|call|hire|30 min|beratung|kontakt|gespr[aä]ch/i.test(question)) {
      answer = translate("I'm open to Solution Architect and Senior Engineer opportunities and conversations about distributed systems, cloud architecture and applied GenAI. For availability and consultation terms, please email me.");
    } else if (/experience|about|background|career|cv|resume|erfahrung|lebenslauf|wer bist|^\s*(hi|hello|hey|hallo)\b/i.test(question)) {
      answer = translate("I'm Ankit Anand, based in Ulm, Germany, with 9 years of experience across QVC, 360T, Manhattan Associates and Nokia. I work on distributed systems, full-stack delivery and applied GenAI. My CV is available in English and German in the CV section.");
    } else {
      answer = translate("I can share published facts about SmartReco, my projects, tech stack and experience. I don't have a verified answer to that question here.");
    }
  }
  return `${prefix}\n\n${answer}\n\n${contact}`;
}