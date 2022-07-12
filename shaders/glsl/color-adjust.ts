export const glsl_color_adjust = /* glsl */`

float contrast(float mValue, float mScale, float mMidPoint) {
	return clamp((mValue - mMidPoint) * mScale + mMidPoint, 0.0, 1.0);
}

float contrast(float mValue, float mScale) {
	return contrast(mValue,  mScale, .5);
}

vec3 contrast(vec3 mValue, float mScale, float mMidPoint) {
	return vec3(contrast(mValue.r, mScale, mMidPoint), contrast(mValue.g, mScale, mMidPoint), contrast(mValue.b, mScale, mMidPoint));
}

vec3 contrast(vec3 mValue, float mScale) {
	return contrast(mValue, mScale, .5);
}

vec3 greyscale(vec3 color, float str) {
    float g = dot(color, vec3(0.299, 0.587, 0.114));
    return mix(color, vec3(g), str);
}

vec3 greyscale(vec3 color) {
    return greyscale(color, 1.0);
}

`