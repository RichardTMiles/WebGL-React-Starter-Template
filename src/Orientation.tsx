

/******************************************************************************/
export const Orientation = function (angle : number, axis : Array<any>) {
    // @ts-ignore
    const self : any = this as Orientation;
    self.angle = angle;                  // Angle in degrees
    self.axis = axis;                    // Unit vector
};

Orientation.prototype.toQuaternion = function() {

//  Convert from angle/axis to unit quaternion

    var cfac = Math.PI / 180.0;
    var ad2 = cfac * this.angle / 2.0;
    var ca = Math.cos(ad2);
    var sa = Math.sin(ad2);
    return [ ca, sa * this.axis[0], sa * this.axis[1],
        sa * this.axis[2] ];
};

Orientation.prototype.fromQuaternion = function(q) {

//  Set properties to the angle/axis equivalent of unit quaternion q

    var cfac = Math.PI / 180.0;
    this.angle = 2.0 * Math.acos(q[0]) / cfac;
    var un = Math.sqrt(q[1] * q[1] + q[2] * q[2] + q[3] * q[3]);
    if (un > 0) {
        this.axis[0] = q[1] / un;
        this.axis[1] = q[2] / un;
        this.axis[2] = q[3] / un;
    }
    return;
};