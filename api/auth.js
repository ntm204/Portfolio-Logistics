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
  const authorizationUri = client.authorizeURL({
    redirect_uri: `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || req.headers.host}/api/callback`,
    scope: 'repo,user',
  });

  res.writeHead(302, { Location: authorizationUri });
  res.end();
};
