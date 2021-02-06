import * as chai from 'chai';

import { validateAgainstConstraints, createChunks } from '../../../src/utils/util';

const expect = chai.expect;

describe('Util Functions', () => {

    describe('validateAgainstConstraints function', () => {
        const mockData = {
            name: "Test"
        }
        const constraints = {
            "name": {
                "presence": {
                    "allowEmpty": false
                },
                "type": "string"
            }
        };
        it('should resolve if there are no validation errors', () => {
            validateAgainstConstraints(mockData, constraints)
                .then(() => {
                    expect(true).to.eql(true);
                })
                .catch(() => {
                    expect(true).to.eql(false);
                });
        });
        it('should return a response containing validation errors if the data provided is incorrect', (done) => {
            // @ts-ignore
            mockData.name = 123;
            validateAgainstConstraints(mockData, constraints)
                .then(() => {
                    expect(true).to.eql(false);
                    done();
                })
                .catch(() => {
                    expect(true).to.eql(true);
                    done();
                });
        });
    })

    describe('createChunks function', () => {
        const mockData = [
            { description: "Task 1" },
            { description: "Task 2" },
            { description: "Task 3" },
            { description: "Task 4" },
            { description: "Task 5" },
            { description: "Task 6" },
            { description: "Task 7" },
            { description: "Task 8" },
            { description: "Task 9" },
            { description: "Task 10" },
            { description: "Task 11" },
            { description: "Task 12" }
        ]
        const dataCount = mockData.length;
        let chunkSize = 3;

        it('should return array of chunks', function () {

            const chunks = createChunks(mockData, chunkSize);
            expect(chunks.length).to.eql(dataCount/chunkSize);
        });
    })

})
