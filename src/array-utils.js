export function copyFloat32ToInt16(float32Array, int16array, length) {
  for (let i = 0; i < length; i++) {
    const i16 = float32Array[i] * 1000; // to get mm precision

    int16array[i] = Math.max(-32768, Math.min(32768, i16));
  }
}

export function copyInt16ToFloat32(int16array, float32Array, start, length) {
  for (let i = start; i < length; i++) {
    float32Array[i] = int16array[i] / 1000; // back from mm to m
  }
}
