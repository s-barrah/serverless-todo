export type IGeneric<T> = {
    [index in string | number | any]: T;
};
