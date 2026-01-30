const { Octokit } = require("@octokit/rest");

exports.handler = async (event) => {
  // 1. Only allow POST requests from your button
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // 2. Initialize GitHub connection
  // Ensure GITHUB_TOKEN is added to Netlify Environment Variables!
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  try {
    const { userInput } = JSON.parse(event.body);

    // 3. Get current data.json from your repo
    const { data } = await octokit.repos.getContent({
      owner: "coolgames555", // Change this
      repo: "venmoo",         // Change this
      path: "data.json",
    });

    const content = JSON.parse(Buffer.from(data.content, "base64").toString());
    
    // 4. Do the math
    const currentTotal = Number(content.total) || 0;
    const newTotal = currentTotal + Number(userInput);
    content.total = newTotal;

    // 5. Push update to GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner: "coolgames555", // Change this
      repo: "venmoo",         // Change this
      path: "data.json",
      message: `Updated total to ${newTotal}`,
      content: Buffer.from(JSON.stringify(content, null, 2)).toString("base64"),
      sha: data.sha,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ newTotal: newTotal }),
    };
  } catch (error) {
    console.error(error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ message: error.message }) 
    };
  }
};
