import { v4 as UUID } from 'uuid';

// Interfaces
interface IProps {
    description: string;
    completed?: boolean;
}
interface ITaskInterface extends IProps {
    id: string;
}

export default class TaskModel {

    private _id: string;
    private _description: string;
    private _completed: boolean;

    constructor({description  = '', completed = false}: IProps) {
        this._id = UUID();
        this._description = description;
        this._completed = completed;
    }

    /**
     * Set Id
     * @param value
     */
    setId(value: string) {
        this._id = value !== '' ? value : null;
    }

    /**
     * Get Id
     * @return {string|*}
     */
    getId() {
        return this._id;
    }

    /**
     * Set Description
     * @param value
     */
    setDescription(value: string) {
        this._description = value ? value : null;
    }

    /**
     * Get Description
     * @return {string}
     */
    getDescription() {
        return this._description;
    }

    /**
     * Set Completed
     * @param value
     */
    setCompleted(value: boolean) {
        this._completed = value ? value : null;
    }

    /**
     * Get Completed
     * @return {boolean}
     */
    getCompleted() {
        return this._completed;
    }

    /**
     * Get Base entity mappings
     * @return {ITaskInterface}
     */
    getEntityMappings(): ITaskInterface {
        return {
            id: this.getId(),
            description: this.getDescription(),
            completed: this.getCompleted(),
        };
    }

}
