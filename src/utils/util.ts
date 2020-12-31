import validate from 'validate.js/validate';

// Models
import ResponseModel from "../models/response.model";

// Interfaces
import { IGeneric } from "../interfaces/generic.interface";

/**
 * Validate values against constraints
 * @param values
 * @param constraints
 * @return {Promise<any>}
 */
export const validateAgainstConstraints = (values: IGeneric<string>, constraints: IGeneric<object>) => {

    return new Promise<void>((resolve, reject) => {
        const validation = validate(values, constraints);

        if (typeof validation === 'undefined') {
            resolve();
        } else {
            reject(new ResponseModel({ validation }, 400, 'required fields are missing'));
        }
    });
}

/**
 * Function to split array of data
 * into small chunks
 * @param data
 * @param chunkSize
 */
export const createChunks = (data: any[], chunkSize: number) => {
    const urlChunks = [];
    let batchIterator = 0;
    while (batchIterator < data.length) {
        urlChunks.push(data.slice(batchIterator, (batchIterator += chunkSize)));
    }
    return urlChunks;
}

/*
* if (typeof validation === 'undefined') {
        return null
    } else {
        return new ResponseModel({ validation }, 400, 'required fields are missing', 'error');
    }
*
*
* */
