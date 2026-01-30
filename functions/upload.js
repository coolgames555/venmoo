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
      const amountToAdd = Number(userInput);

      // --- THE "POSITIVE ONLY" CHECK ---
      if (amountToAdd < 0) {
        return { 
          statusCode: 400, 
          body: JSON.stringify({ message: "You can only add positive numbers!" }) 
        };
      }

      const newTotal = currentTotal + amountToAdd;
      content.total = newTotal;

      await octokit.repos.createOrUpdateFileContents({
        ...params,
        message: `Added ${amountToAdd}. New total: ${newTotal}`,
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
