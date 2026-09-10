const { registerFont, createCanvas } = require("canvas");

registerFont("public/fonts/PlayfairDisplay-Regular.ttf", { family: "Times-Roman", weight: "400" });
registerFont("public/fonts/PlayfairDisplay-Bold.ttf", { family: "Times-Roman", weight: "700" });
registerFont("public/fonts/PlayfairDisplay-Regular.ttf", { family: "Times", weight: "400" });
registerFont("public/fonts/PlayfairDisplay-Bold.ttf", { family: "Times", weight: "700" });

const c = createCanvas(200, 200);
const ctx = c.getContext("2d");

ctx.font = '700 24px "Times-Roman", serif';
ctx.fillText("Test with quotes", 10, 50);

ctx.font = '700 24px Times, serif';
ctx.fillText("Test with Times", 10, 100);

console.log("Font tests complete!");
