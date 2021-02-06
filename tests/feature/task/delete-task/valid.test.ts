import * as chai from 'chai';

import handler from '../../../lib/actions/handler';

type Response = {
    data: any;
    message: string;
    status: string;
}

const expect = chai.expect;


const requestData = {
    listId: null,
    name: "My Wednesday list",
    description: "Buy some milk"
}

describe('POST /task/delete - Valid task deleted in DB', () => {
    let response, statusCode = 200, listId, taskId;

    // Before running the tests, send a request to the endpoint.
    before( function (done) {
        this.timeout(10000);
        handler.createList(requestData)
            .then((body: Response) => {
                listId = body.data.listId;
                return handler.createTask({
                    ...requestData,
                    listId
                });
            })
            .then((body: Response) => {
                taskId = body.data.taskId;
                return handler.deleteTask({ listId, taskId })
            })
            .then((body) => {
                statusCode = 200;
                response = body;
                done();
            })
            .catch((error) => {
                statusCode = error.response.statusCode;
                response = error.response.body;
                done();
            });

    });

    it('should expect a 200 status code', (done) => {
        expect(statusCode).to.eql(200);
        done();
    });

    it('should expect a success message', (done) => {
        expect(response.message).to.eql('Task successfully deleted');
        done();
    });

    it('should check that task has been deleted', () => {
        return handler.getTask({ listId, taskId })
            .then(() => {
                expect(true).to.eql(false);
            })
            .catch(() => {
                expect(true).to.eql(true);
            });
    });
})
