import { writeFile } from 'fs';

const targetPath = './src/environments/environment.prod.ts';

const envConfigFile = `export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL}',
  masterclassHost: '${process.env.MASTERCLASS_HOST}',
  openIdConfigUrl: '${process.env.OPENID_CONFIG_URL}',
  redirectUri: '${process.env.REDIRECT_URI}',
  clientId: '${process.env.CLIENT_ID}'
};
`;

writeFile(targetPath, envConfigFile, function (err) {
   if (err) {
       throw console.error(err);
   } else {
       console.log(`Angular environment.ts file generated correctly at ${targetPath} \n`);
   }
});