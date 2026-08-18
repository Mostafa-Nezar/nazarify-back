import swaggerAutogen from 'swagger-autogen';
import fs from 'fs';

const doc = {
  info: {
    title: 'Nazarify API',
    description: 'Nazarify Backend API Documentation',
  },
  host: 'localhost:3001',
  schemes: ['http'],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'User', description: 'User operations' },
    { name: 'Service', description: 'Service management' },
    { name: 'Project', description: 'Project management' },
    { name: 'Tool', description: 'Tool management' },
    { name: 'Skill', description: 'Skill management' },
    { name: 'Service Request', description: 'Service Request management' },
  ],
};

const outputFile = './swagger-output.json';
const routes = ['./index.ts'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen()(outputFile, routes, doc).then(() => {
  // Post-process the generated JSON to add tags based on the URL path
  const data = fs.readFileSync(outputFile, 'utf8');
  const swaggerObj = JSON.parse(data);

  for (const path in swaggerObj.paths) {
    const methods = swaggerObj.paths[path];
    const segment = path.split('/')[1]; // Extracts "auth" from "/auth/..."
    
    let tag = 'General';
    if (['register', 'login', 'google', 'logout'].includes(segment)) tag = 'Auth';
    else if (segment === 'user') tag = 'User';
    else if (segment === 'service') tag = 'Service';
    else if (segment === 'project') tag = 'Project';
    else if (segment === 'tool') tag = 'Tool';
    else if (segment === 'skill') tag = 'Skill';
    else if (segment === 'service-request') tag = 'Service Request';

    for (const method in methods) {
      methods[method].tags = [tag];
    }
  }

  fs.writeFileSync(outputFile, JSON.stringify(swaggerObj, null, 2));
  console.log('Swagger docs generated and grouped successfully!');
});
