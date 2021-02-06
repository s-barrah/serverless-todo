import * as chai from 'chai';

import handler from '../../../lib/actions/handler';

const expect = chai.expect;


const requestData = {
    listId: '468c8094-a756-4000-a919-example',
    taskId: '3e790b70-d27c-49db-9fc4-example'
}

describe('POST /task - Invalid request', () => {
    let response, statusCode;

    // Before running the tests, send a request to the endpoint.
    // @ts-ignore
    before(function (done) {
        handler.deleteTask(requestData)
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

    it('should expect failed task id', (done) => {
        expect(response.data.id).to.eql(requestData.taskId);
        done();
    });

    it('should expect response message to describe the error', (done) => {
        expect(response.message).to.eql('Invalid Request!');
        done();
    });

    it('should expect an error response status', (done) => {
        expect(response.status).to.eql('bad request');
        done();
    });


})
