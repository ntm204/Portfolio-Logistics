const { AuthorizationCode } = require('simple-oauth2');

const config = {
  client: {
    id: process.env.GITHUB_CLIENT_ID,
    secret: process.env.GITHUB_CLIENT_SECRET,
  },
  auth: {
    tokenHost: 'https://github.com',
    tokenPath: '/login/oauth/access_token',
    authorizePath: '/login/oauth/authorize',
  },
};

const client = new AuthorizationCode(config);

module.exports = async (req, res) => {
  const { code } = req.query;

  try {
    const accessToken = await client.getToken({
      code,
      redirect_uri: `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || req.headers.host}/api/callback`,
    });

    const token = accessToken.token.access_token;
    const responseBody = `
      <html><body><script>
        (function() {
          function receiveMessage(e) {
            console.log("receiveMessage %o", e);
            window.opener.postMessage(
              'authorization:github:success:{"token":"${token}","provider":"github"}',
              e.origin
            );
          }
          window.addEventListener("message", receiveMessage, false);
          window.opener.postMessage("authorizing:github", "*");
        })()
      </script></body></html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(responseBody);
  } catch (error) {
    console.error('Access Token Error', error.message);
    res.status(500).send('Internal Server Error');
  }
};
