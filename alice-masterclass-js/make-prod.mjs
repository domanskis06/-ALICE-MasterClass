import { writeFile } from 'fs';

const targetPath = './src/environments/environment.prod.ts';

const envConfigFile = `export const AppConfig = {
  production: true,
  environment: 'PROD',
  apiUrl: '${process.env.API_URL}',
  version: '${process.env.VERSION ?? "0.0.0"}'
};
`;

writeFile(targetPath, envConfigFile, function (err) {
   if (err) {
       throw console.error(err);
   } else {
       console.log(`Angular environment.ts file generated correctly at ${targetPath} \n`);
   }
});