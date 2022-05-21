import { round } from './round.func';
import { Operator } from './operator.enum';

interface IVector {
    precision: number;
    dimValues: number[];

    dimensions: number;
    isNormalized: boolean;

    x: number;
    y: number;
    z: number;

    /** 
     * gets the value for the specified dimension
     * @param {number} dim dimension to get
     * @returns {number} the value of the dimension
     */
    getDimValue: (dim: number) => number;

    /**
     * sets the value for the specified dimension
     * @param {number} value the value to set
     * @param {number} dim dimension to set
     */
    setDimValue(value: number, dim: number): void;

    calc(v: IVector, operator: Operator): IVector;

    add(v: IVector): IVector;

    subtract(v: IVector): IVector;

    multiply(v: IVector): IVector;

    divide(v: IVector): IVector;

    normalize(): IVector;

    getLength(): number;

    clone(): IVector;
};

class Vector implements IVector {
    dimValues: number[] = [0];
    precision: number = 16;

    get x() {return this.dimValues[0];};
    set x(value: number) {this.dimValues[0] = value};
    get y() {return this.dimValues[1];};
    set y(value: number) {this.dimValues[1] = value};
    get z() {return this.dimValues[2];};
    set z(value: number) {this.dimValues[2] = value};

    /** 
     * gets the value for the specified dimension
     * @param {number} dim dimension to get
     * @returns {number} the value of the dimension
     */
    getDimValue = (dim: number): number => {
        return round(this.dimValues[dim], this.precision);
    }

    /**
     * sets the value for the specified dimension
     * @param {number} value the value to set
     * @param {number} dim dimension to set
     */
    setDimValue = (value: number, dim: number): void => {
        this.dimValues[dim] = value;
    }

    get dimensions() {return this.dimValues.length};

    constructor(
        dimValues: number[] | {x: number, y?: number, z?: number} = [0, 0, 0]
    ) {
        if(Array.isArray(dimValues)){
            this.dimValues = dimValues;
        }else{
            this.dimValues = [dimValues.x, dimValues.y ?? 0, dimValues.z ?? 0];
        }
    }

    get isNormalized(): boolean {
        return this.getLength() === 1;
    }

    calc(v: IVector, operator: Operator, t?: new (dimValues: number[]) => Vector): Vector{
        const tt = t ? t : Vector;

        const res = v.dimensions < this.dimensions ? new tt(this.dimValues) : new tt(v.dimValues);

        for (let i = 0; i < this.dimValues.length && i < v.dimValues.length; i++) {
            switch (operator) {
                case Operator.Add:
                    res.dimValues[i] = this.dimValues[i] + v.dimValues[i];
                    break;
                case Operator.Subtract:
                    res.dimValues[i] = this.dimValues[i] - v.dimValues[i];
                    break;
                case Operator.Multiply:
                    res.dimValues[i] = this.dimValues[i] * v.dimValues[i];
                    break;
                case Operator.Divide:
                    res.dimValues[i] = this.dimValues[i] / v.dimValues[i];
                    break;
            }
            
        }
        
        return res;
    } 

    add = (v: IVector, t: (new (dimValues: number[]) => Vector) | undefined = undefined) => this.calc(v, Operator.Add, t);

    subtract = (v: IVector, t: (new (dimValues: number[]) => Vector) | undefined = undefined) => this.calc(v, Operator.Subtract, t);

    multiply = (v: IVector, t: (new (dimValues: number[]) => Vector) | undefined = undefined) => this.calc(v, Operator.Multiply, t);

    divide = (v: IVector, t: (new (dimValues: number[]) => Vector) | undefined = undefined) => this.calc(v, Operator.Divide, t);

    normalize = (t: (new (dimValues?: number[]) => Vector) | undefined = undefined): Vector => {
        const res = t? new t() : new Vector();
        const l = res.getLength();
        const dims = res.dimensions;

        for (let i = 0; i < dims; i++) {
            res.dimValues[i] = res.getDimValue(i) / l;
        }

        return res;
    }

    getLength = (): number => {
        let l = this.getDimValue(0) * this.getDimValue(0);
        
        for (let i = 1; i < this.dimValues.length; i++) {
            l += this.getDimValue(i) * this.getDimValue(i);
        }
        return round(Math.sqrt(l), this.precision - 1);
    }

    clone = (t: (new (dimValues?: number[]) => Vector) | undefined = undefined): Vector => {
        return t ? new t(this.dimValues) : new Vector(this.dimValues);
    }
}

export {
    IVector,
    Vector
}