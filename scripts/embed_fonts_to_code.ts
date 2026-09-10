import fs from "fs";
import path from "path";

async function main() {
  const fontDir = path.join(process.cwd(), "public", "fonts");
  const boldBuf = fs.readFileSync(path.join(fontDir, "PlayfairDisplay-Bold.ttf"));
  const regBuf = fs.readFileSync(path.join(fontDir, "PlayfairDisplay-Regular.ttf"));

  const outTs = path.join(process.cwd(), "src", "services", "certificate-engine", "embedded-fonts.ts");

  const content = `// Auto-generated embedded fonts for 100% reliable rendering on Vercel Serverless (Linux)
export const PLAYFAIR_BOLD_BASE64 = "${boldBuf.toString("base64")}";
export const PLAYFAIR_REGULAR_BASE64 = "${regBuf.toString("base64")}";
`;

  fs.writeFileSync(outTs, content);
  console.log(`Embedded fonts written to ${outTs} (${content.length} chars)`);
}

main().catch(console.error);
