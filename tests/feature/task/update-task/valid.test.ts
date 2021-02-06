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
    description: "Buy some milk"
}


describe('POST /task/update - Valid task updated in DB', () => {
    let response, statusCode = 200, listId, taskId;

    // Before running the tests, send a request to the endpoint.
    before( function (done) {
        this.timeout(10000);

        handler.createList({ name: "My to do list" })
            .then((body: Response) => {
                listId = body.data.listId;
                return handler.createTask({
                    ...requestData,
                    listId
                });
            })
            .then((body: Response) => {
                taskId = body.data.taskId;
                return handler.updateTask({
                    description: 'Bought some milk and sugar',
                    listId,
                    taskId,
                    completed: true,
                });
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
        expect(response.message).to.eql('Task successfully updated');
        done();
    });


    it('should check that the task has been updated in database', () => {
        return handler.getTask({ listId, taskId })
            .then((results: Response) => {

                expect(results.data.id).to.eql(taskId);
                expect(results.data.listId).to.eql(listId);
                expect(results.data.description).to.eql(response.data.description);
                expect(results.data.completed).to.eql(response.data.completed);
                expect(results.data.createdAt).to.be.an('number');
                expect(results.data.updatedAt).to.be.an('number');

            })
            .catch(() => {
                expect(true).to.eql(false);
            });
    });
});

