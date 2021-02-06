import {
    APIGatewayProxyHandler,
    APIGatewayEvent,
    Context,
    APIGatewayProxyResult
} from 'aws-lambda';
import 'source-map-support/register';

// Models
import ResponseModel from "../../models/response.model";

// Services
import DatabaseService from "../../services/database.service";

// utils
import { validateAgainstConstraints, createChunks } from "../../utils/util";

// Define the request constraints
import requestConstraints from '../../constraints/list/id.constraint.json';

// Enums
import { StatusCode } from "../../enums/status-code.enum";
import { ResponseMessage } from "../../enums/response-message.enum";

/***
 * Delete list
 *
 * @api {post} /list/delete
 * @apiName Delete list
 * @apiGroup To-Do List
 * @apiDescription Delete list
 *
 * @apiParam {string}         listId         The id of the to-do list
 *
 * @apiSuccess {object} data
 * @apiSuccess {string} message       The response message
 * @apiSuccess {string} status        The response status
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *      "listId": "468c8094-a756-4000-a919-974a64b5be8e",
 *    }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "data": {},
 *       "message": "To-do list successfully deleted"
 *       "status": "success"
 *     }
 *      *
 *  @apiErrorExample {json} Error-Response: Validation Errors
 *     HTTP/1.1 400 Bad Request
 *    {
 *      "data": {
 *          "validation": {
                "listId": [
                    "List Id can't be blank"
                ]
            }
 *      },
 *      "message": "required fields are missing",
 *      "status": "bad request"
 *    }
 *
 *  @apiErrorExample {json} Error-Response: Invalid List Id
 *     HTTP/1.1 500 Internal Server Error
 *    {
 *      "data": {
 *          "id": "468c8094-a756-4000-a919-example"
 *      },
 *      "message": "Item does not exist",
 *      "status": "bad request"
 *    }
 *
 *  @apiErrorExample {json} Error-Response: Unknown Error
 *     HTTP/1.1 500 Internal Server Error
 *    {
 *      "data": {},
 *      "message": "Unknown error",
 *      "status": "error"
 *    }
 */
export const deleteList: APIGatewayProxyHandler = async (event: APIGatewayEvent, _context: Context): Promise<APIGatewayProxyResult> => {
    // Initialize response variable
    let response;

    // Parse request parameters
    const requestData = JSON.parse(event.body);

    // Destructure request data
    const { listId } = requestData

    // Destructure process.env
    const { LIST_TABLE, TASKS_TABLE } = process.env;

    // Initialise database service
    const databaseService = new DatabaseService();

    // Validate against constraints
    return validateAgainstConstraints(requestData, requestConstraints)
        .then(() => {
            // Get item from the DynamoDB table
            return databaseService.getItem({ key: listId, tableName: LIST_TABLE });
        })
        .then(async () => {
            // Initialise DynamoDB DELETE parameters
            const params = {
                TableName: LIST_TABLE,
                Key: { id: listId },
            }
            return databaseService.delete(params) // Delete to-do list
        })
        .then(async () => {
            // Initialise DynamoDB QUERY parameters
            const taskParams = {
                TableName: TASKS_TABLE,
                IndexName : 'list_index',
                KeyConditionExpression : 'listId = :listIdVal',
                ExpressionAttributeValues : {
                    ':listIdVal' : listId
                }
            };
            // Find tasks in list
            const results = await databaseService.query(taskParams);

            // Validate tasks exist
            if (!!results?.Items?.length) {

                // create-task-list batch objects
                const taskEntities = results?.Items?.map((item) => {
                    return { DeleteRequest: { Key: { id: item.id } } };
                });

                // Tasks more than 25
                // Delete in chunks
                if (taskEntities.length > 25) {
                    // Create chunks if tasks more than 25
                    // BATCH WRITE has a limit of 25 items
                    const taskChunks = createChunks(taskEntities, 25);
                    return Promise.all(taskChunks.map((tasks) => {
                        return databaseService.batchCreate({
                            RequestItems: {
                                [TASKS_TABLE]: tasks, // Batch delete-task-list task items
                            }
                        });
                    }));
                }
                // Batch delete-task-list task items
                return databaseService.batchCreate({
                    RequestItems: {
                        [TASKS_TABLE]: taskEntities,
                    }
                });
            }
        })
        .then(() => {
            // Set Success Response
            response = new ResponseModel({}, StatusCode.OK, ResponseMessage.DELETE_LIST_SUCCESS);
        })
        .catch((error) => {
            // Set Error Response
            response = (error instanceof ResponseModel) ? error : new ResponseModel({}, StatusCode.ERROR, ResponseMessage.DELETE_LIST_FAIL);
        })
        .then(() => {
            // Return API Response
            return response.generate()
        });
}
