import * as chai from 'chai';

import handler from '../../../lib/actions/handler';

type Response = {
    data: any;
    message: string;
    status: string;
}

const expect = chai.expect;


const requestData = {
    name: "My To do list"
}

describe('POST /list/create - Create list', () => {
    let response, statusCode;

    // Before running the tests, send a request to the endpoint.
    before(function (done) {
        handler.createList(requestData)
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
        expect(response.message).to.eql('To-do list successfully created');
        done();
    });

    it('should check that data exists in DynamoDB', function () {
        this.timeout(10000);

        handler.getList({ listId: response.data.listId })
            .then((response: Response) => {
                expect(response.data.id).to.eql(response.data.listId);
                expect(response.data.name).to.eql(requestData.name);
                expect(response.data.taskCount).to.eql(0);
                expect(response.data.tasks.length).to.eql(0);
            })
            .catch(() => {
                expect(true).to.eql(false);
            });

    });

})
