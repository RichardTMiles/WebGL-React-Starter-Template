/******************************************************************************/
export class Orientation {

    angle: number = 0;                  // Angle in degrees
    axis: Array<number> = [];                   // Unit vector

    constructor(angle: number, axis: Array<number>) {
        this.angle = angle;                  // Angle in degrees
        this.axis = axis;                    // Unit vector
    };

    toQuaternion = () => {
        //  Convert from angle/axis to unit quaternion
        const cfac = Math.PI / 180.0;
        const ad2 = cfac * this.angle / 2.0;
        const ca = Math.cos(ad2);
        const sa = Math.sin(ad2);
        return [ca, sa * this.axis[0], sa * this.axis[1],
            sa * this.axis[2]];
    };

    fromQuaternion = (q) => {
        //  Set properties to the angle/axis equivalent of unit quaternion q
        const cfac = Math.PI / 180.0;
        this.angle = 2.0 * Math.acos(q[0]) / cfac;
        const un = Math.sqrt(q[1] * q[1] + q[2] * q[2] + q[3] * q[3]);
        if (un > 0) {
            this.axis[0] = q[1] / un;
            this.axis[1] = q[2] / un;
            this.axis[2] = q[3] / un;
        }
        return;
    };
}
