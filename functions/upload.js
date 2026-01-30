const { Octokit } = require("@octokit/rest");

exports.handler = async (event) => {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const params = {
    owner: "coolgames555",
    repo: "venmoo",
    path: "data.json",
  };

  try {
    const { data } = await octokit.repos.getContent(params);
    const content = JSON.parse(Buffer.from(data.content, "base64").toString());
    const currentTotal = Number(content.total) || 0;

    if (event.httpMethod === "GET") {
      return { statusCode: 200, body: JSON.stringify({ currentTotal }) };
    }

    if (event.httpMethod === "POST") {
      const { userInput } = JSON.parse(event.body);
      
      // Calculate new total
      let newTotal = currentTotal + Number(userInput);

      // --- THE "NO NEGATIVE" CHECK ---
      if (newTotal < 0) {
        return { 
          statusCode: 400, 
          body: JSON.stringify({ message: "Total cannot be less than zero!" }) 
        };
      }

      content.total = newTotal;

      await octokit.repos.createOrUpdateFileContents({
        ...params,
        message: `Updated total to ${newTotal}`,
        content: Buffer.from(JSON.stringify(content, null, 2)).toString("base64"),
        sha: data.sha,
      });

      return {
        statusCode: 200,
        body: JSON.stringify({ currentTotal: newTotal }),
      };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
  }
};
