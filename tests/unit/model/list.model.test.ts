import * as chai from 'chai';

import ListModel from '../../../src/models/list.model';

const listMock = require('../../mocks/list.mock.json');

const expect = chai.expect;

describe('Model/List.model', () => {

    describe('Ensure entity mapping', () => {
        it('should return an object with all of the entity values', () => {
            const listModel = new ListModel(listMock);

            expect(listModel.getEntityMappings()).to.eql({
                id: listMock.id,
                name: listMock.name,
                timestamp: listModel.getEntityMappings().timestamp
            });
        });
    });

    describe('Ensure entity hydration', () => {
        it('should be able to get-task-list the hydrated variables from the model', () => {
            const listModel = new ListModel(listMock);

            expect(listModel.getId()).to.eql(listMock.id);
            expect(listModel.getName()).to.eql(listMock.name);
        });
    })
})
