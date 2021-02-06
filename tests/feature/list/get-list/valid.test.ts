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

describe('POST /list - Retrieve list from the DB', () => {
    let response, statusCode;

    // Before running the tests, send a request to the endpoint.
    before(function (done) {
        handler.createList(requestData)
            .then((body: Response) => {
                return handler.getList({ listId: body.data.listId })
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
        expect(response.message).to.eql('To-do list successfully retrieved');
        done();
    });

    it('should expect a list name', (done) => {
        expect(response.data.name).to.eql(requestData.name);
        done();
    });

})
