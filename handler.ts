export { hello } from './src/actions/hello';

// List functions
export { createList } from './src/actions/list/create-list.action';
export { deleteList } from './src/actions/list/delete-list.action';
export { getList } from './src/actions/list/get-list.action';
export { updateList } from './src/actions/list/update-list.action';

// Task functions
export { createTask } from './src/actions/task/create-task.action';
export { deleteTask } from './src/actions/task/delete-task.action';
export { updateTask } from './src/actions/task/update-task.action';


/*

import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';

export const hello: APIGatewayProxyHandler = async (event, _context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!',
      input: event,
    }, null, 2),
  };
}
*/
