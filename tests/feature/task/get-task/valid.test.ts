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

describe('POST /task - Valid task created in DB', () => {
    let response, statusCode = 200, listId;

    // Before running the tests, send a request to the endpoint.
    before( function (done) {
        this.timeout(10000);

        handler.createList({ name: "To do list" })
            .then((body: Response) => {
                listId = body.data.listId;
                return handler.createTask({
                    ...requestData,
                    listId
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
        expect(response.message).to.eql('Task successfully added');
        done();
    });

    it('should check that task exists in database', function (done) {
        this.timeout(10000);

        handler.getTask({
            taskId: response.data.taskId,
            listId
        })
            .then((results: Response) => {
                expect(results.data.id).to.eql(response.data.taskId);
                expect(results.data.listId).to.eql(listId);
                expect(results.data.description).to.eql(requestData.description);
                expect(results.data.completed).to.eql(false);
                expect(results.data.createdAt).to.be.an('number');
                expect(results.data.updatedAt).to.be.an('number');
                done();
            })
            .catch(() => {
                expect(true).to.eql(false);
                done();
            });

    });

})
