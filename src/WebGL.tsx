import "assets/cuon-utils"
import "assets/cuon-matrix"
import "assets/webgl-utils"
import "assets/webgl-debug"

// generally this lib is straight from concepts im actively reading from

// @link https://sites.google.com/site/csc8820/educational/read-webgl-programs
// @link http://www.cse.unt.edu/~renka/5933/cs5933.html
// @link https://www.glprogramming.com/red/

// https://stackoverflow.com/questions/41139763/how-to-declare-a-fixed-length-array-in-typescript
export type iArrayLengthMutationKeys = 'splice' | 'push' | 'pop' | 'shift' | 'unshift' | number

export type iArrayItems<T extends Array<any>> = T extends Array<infer TItems> ? TItems : never

export type iFixedLengthArray<T extends any[]> =
    Pick<T, Exclude<keyof T, iArrayLengthMutationKeys>>
    & { [Symbol.iterator]: () => IterableIterator< iArrayItems<T> > }

export type iFixedLengthAddableArray<T, L extends number, TObj = [T, ...Array<T>]> =
    Pick<TObj, Exclude<keyof TObj, iArrayLengthMutationKeys>>
    & {
    readonly length: L
    [ I : number ] : T
    [Symbol.iterator]: () => IterableIterator<T>
}

// @link https://stackoverflow.com/questions/17428587/transposing-a-2d-array-in-javascript
export const transpose = m => m[0].map((_,i) => m.map(x => x[i]))

// @link https://stackoverflow.com/questions/2173229/how-do-i-write-a-rgb-color-value-in-javascript
export const rgb = (red : number, green: number, blue: number) =>
    (red & 0xF0 ? '#' : '#0') + (red << 16 | green << 8 | blue).toString(16);

export type iVector2 = iFixedLengthArray<[number, number]>;

export type iTranslation = iVector2;

export type iRotation = iFixedLengthArray<[iVector2, iVector2]>;

export type iVector3 = iFixedLengthArray<[number, number, number]>;

export type iColor = iVector3;

export type iVector4 = iFixedLengthArray<[number, number, number, number]>;

// @def The transpose of a transpose matrix is the original matrixwebgl-utils.js
// webgl-debug.js
export type iTransform2D = iFixedLengthArray<[iVector3, iVector3, iVector3]>;

export type iTransform3D = iFixedLengthArray<[iVector4, iVector4, iVector4, iVector4]>;

export type iImage = Array<Array<iColor>>;

// @link http://sites.science.oregonstate.edu/math/home/programs/undergrad/CalculusQuestStudyGuides/vcalc/system/system.html
export type HomogeneousVector4 =  iTransform3D; // A homogeneous vector with four components (see Chapter 7)

// @link https://staff.fnwi.uva.nl/r.vandenboomgaard/IPCV20172018/LectureNotes/MATH/homogenous.html
export const defineRotation = (acrossAngle : number) : iRotation => [
    [ Math.cos(acrossAngle), -Math.sin(acrossAngle)],
    [ Math.sin(acrossAngle), Math.cos(acrossAngle)]
];

export const mirrorY : iRotation = [ [ -1, 0], [ 0, 1]];

export const mirrorX : iRotation = [ [ 0, -1], [ 1, 0]];    // im not sure if this is right

export const defineAffineTransformation = (rotation : iRotation, translation: iTranslation) : iTransform2D => [
    [ Math.cos(rotation[0][0]), -Math.sin(rotation[0][1]), translation[0]],
    [ Math.sin(rotation[1][0]), Math.cos(rotation[1][1]), translation[1]],
    [ 0, 0, 1],
];

