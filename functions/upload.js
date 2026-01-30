const { Octokit } = require("@octokit/rest");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  const { userInput } = JSON.parse(event.body);
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  try {
    // 1. Get current data from GitHub
    const { data } = await octokit.repos.getContent({
      owner: "coolgames555",
      repo: "venmoo",
      path: "data.json",
    });

    const content = JSON.parse(Buffer.from(data.content, "base64").toString());
    
    // 2. Perform the addition
    // We use Number() to ensure we aren't accidentally "adding" strings like "5" + "5" = "55"
    const currentTotal = Number(content.total) || 0;
    const newTotal = currentTotal + Number(userInput);
    
    content.total = newTotal;

    // 3. Push the updated sum back to GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner: "YOUR_GITHUB_USERNAME",
      repo: "YOUR_REPO_NAME",
      path: "data.json",
      message: `Updated total to: ${newTotal}`,
      content: Buffer.from(JSON.stringify(content, null, 2)).toString("base64"),
      sha: data.sha,
    });

    return { 
      statusCode: 200, 
      body: JSON.stringify({ message: "Success!", newTotal: newTotal }) 
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};
