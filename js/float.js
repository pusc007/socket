export class Float {
  static mix(a, b, t) {
    return a * (1 - t) + b * t;
  }
  static angleMix(a, b, t) {
    if (b - a > Math.PI) {
      return Float.mix(a + 2 * Math.PI, b, t);
    } else if (b - a < -Math.PI) {
      return Float.mix(a - 2 * Math.PI, b, t);
    } else {
      return Float.mix(a, b, t);
    }
  }
  static fract(val) {
    val = val % 1;
    return val < 0 ? val + 1 : val;
  }
  static inverseMix(a, b, t) {
    return (t - a) / (b - a);
  }
  static clamp(val, min = 0, max = 1) {
    if (val <= min) {
      return min;
    }
    if (val >= max) {
      return max;
    }
    return val;
  }
  static smoothstep(a, b, t) {
    t = clamp(inverseMix(a, b, t));
    return t * t * (3.0 - 2.0 * t);
  }
}
