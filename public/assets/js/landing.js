(window.webpackJsonp = window.webpackJsonp || []).push([[17], {
    110: function(e, t) {
        e.exports = "#define M_PI 3.1415926535897932384626433832795\n#define M_PHI M_PI * (3. - sqrt(5.)) // golden angle in radians\n#define SPHERE_OFFSET_Y 7.9\n#define SPHERE_SCALE 2.0\n#define SPHERE_GAP 0.03\n#define MOUSE_DISTANCE 0.4\n\nprecision highp float;\n\nattribute float alpha;\n\nuniform float animation; // Wave -> sphere animation progress, in range [0, 1]\nuniform float revealAnimation; // Reveal animation progress, in range [0, 1]\nuniform float size;\nuniform float time;\nuniform float speed;\nuniform float sphereSpeed;\nuniform float sphereSize;\nuniform float sphereOffsetZ;\nuniform float sphereDotSize;\nuniform vec3 objectSize;\nuniform vec4[HIGHLIGHT_COUNT] highlights;\nuniform vec2 mouse; // in range [-1, 1]\nuniform vec2 mouseAnimated; // in range [-1, 1]\nuniform float screenRatio;\n\nuniform vec3 colorA;\nuniform vec3 colorB;\nuniform vec3 colorC;\n\nuniform vec3 colorSphereA;\nuniform vec3 colorSphereB;\nuniform vec3 colorSphereC;\n\nvarying vec3 vColor;\nvarying float vAlpha;\n\n// Depth test\nvarying float vViewZDepth;\n\n// Highlight\nstruct Highlight {\n    float size;\n    vec3 color;\n};\n\n// Noise\nfloat rand(vec2 n) {\n\treturn fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);\n}\n\nfloat noise(vec2 p){\n\tvec2 ip = floor(p);\n\tvec2 u = fract(p);\n\tu = u*u*(3.0-2.0*u);\n\n\tfloat res = mix(\n\t\tmix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),\n\t\tmix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);\n\treturn res*res;\n}\n\n\nfloat wave(float x, float size) {\n    float position = mod(x, 1.0);\n    if (position > 0.0 && position < size) {\n        float progress = position / size;\n        return sin(smoothstep(0.0, 1.0, progress) * M_PI);\n    } else {\n        return 0.0;\n    }\n}\n\n// Generate waves\nfloat waves (vec3 position) {\n    float velocity = time * speed;\n    float velocityAnimated = (time + mouseAnimated.y * 10.0) * speed;\n    float x = position.x / objectSize.x; // in range [-0.5, 0.5]\n    float z = position.z / objectSize.z; // in range [-0.5, 0.5]\n\n    // Waves\n    float wave1 = wave(x + velocity * 0.02 + 0.0, 0.5) * wave(z - 0.25, 0.3) * 0.3;\n\n    float wave2 = wave(x + velocity * 0.02 + 0.0, 0.5) * wave(z - 0.25, 0.3) * 0.3;\n    wave2 = wave2 + wave(x + velocity * 0.02 - 0.05, 0.2) * wave(z - 0.25, 0.3) * 0.3;\n\n    float wave6 = wave(x + velocity * 0.01 + 0.3, 0.5) * wave(z - 0.1, 0.3) * 0.3;\n    float wave7 = wave(x + velocity * 0.03 - 0.3, 0.5) * wave(z - 0.15, 0.2) * 0.3;\n\n    // Large wave in the middle\n    float waveMidLarge = cos(clamp(z * 10.0 + sin(x * 10.0 * .5 + velocityAnimated * 0.07) * 3., -M_PI, M_PI)) * .5 + .5;\n    waveMidLarge = pow(abs(waveMidLarge), 4.) * sin(x * 10.0 * .5 + velocity * 0.1) * 0.7;\n\n    float waveMidMedium = cos(clamp(z * 25.0 + sin(x * 25.0 * .5 + velocity * 0.1) * 3., -M_PI, M_PI)) * .5 + .5;\n    waveMidMedium = pow(abs(waveMidMedium), 4.) * sin(x * 10.0 * .5 + velocityAnimated * 0.1) * 0.3;\n\n    // Large soft wave at the back\n    float waveBackLargeSoft1 = wave(x + velocity * 0.01 + 0.4, 0.5) * wave(z - 0.3, 1.0) * 0.6;\n    float waveBackLargeSoft2 = wave(x + velocity * 0.012 + 0.6, 0.5) * wave(z - 0.23, 1.0) * 0.6;\n\n    // Small soft waves\n    float waveSmallSoft1 = (sin(x * 100.0 + velocity * 0.3) + cos(x * 80.0+ velocity * 0.4) + sin(x * 60.0 + velocity * 0.5)) * 0.05;\n    waveSmallSoft1 = waveSmallSoft1 * wave(z + 0.8, 0.2);\n\n    float waveSmallSoft2 = (sin(x * 95.0 + velocity * 0.5) + cos(x * 75.0 + velocity * 0.4) + sin(x * 55.0 + velocity * 0.3)) * 0.075;\n    waveSmallSoft2 = waveSmallSoft2 * wave(z + 0.65, 0.2);\n\n    float waveSmallSoft3 = (sin(x * 70.0 + velocityAnimated * 0.45) + cos(x * 50.0 + velocity * 0.35) + sin(x * 30.0 + velocityAnimated * 0.45)) * 0.1;\n    waveSmallSoft3 = waveSmallSoft3 * wave(z + 0.95, 0.2);\n\n    float waveSmallSoft4 = (sin(x * 60.0 + velocity * 0.35) + cos(x * 40.0 + velocityAnimated * 0.55) + sin(x * 20.0 + velocity * 0.5)) * 0.075;\n    waveSmallSoft4 = waveSmallSoft4 * wave(z + 1.1, 0.2);\n\n    float waveZ = sin(z * 20.0 + velocity * -0.2) * 0.1;\n\n    // Left side lower, right side higher\n    float slope = x * -2.0;\n\n    // Wave height\n    float waveHeight = objectSize.y;\n\n    return (wave1 + wave2 + wave6 + wave7 + waveMidLarge + waveMidMedium + waveBackLargeSoft1 + waveBackLargeSoft2 + waveSmallSoft1 + waveSmallSoft2 + waveSmallSoft3 + waveSmallSoft4 + waveZ + slope) * (1.0 - smoothstep(0.4, 0.55, z)) * waveHeight;\n}\n\nvec3 sphereAnimation (vec3 position) {\n    float velocity = time * sphereSpeed;\n    vec3 vPosition = normalize(position);\n\n    vec3 largeWave = vec3(\n        cos(vPosition.y * 10.0 + velocity * 0.5),\n        cos(vPosition.x * 13.33 + velocity * 0.5),\n        sin(vPosition.z * 16.66 + velocity * 0.5)\n    );\n\n    vec3 smallWave = vec3(\n        cos(vPosition.y * 3.0 + velocity * 0.75),\n        cos(vPosition.x * 5.3 + velocity * 0.75),\n        sin(vPosition.z * 4.1 + velocity * 0.75)\n    );\n\n    vec3 smallWave2 = vPosition * cos(vPosition.y * 33.0 + velocity * 0.75);\n\n    return largeWave * 0.02 + smallWave * 0.01 + smallWave2 * 0.01;\n}\n\n// Calculate offset so that there is a gap between items\nvec3 sphereGap (vec3 vPosition) {\n    float x = vPosition.x;\n    float y = vPosition.y;\n    vec3 gap = vec3(0.0, 0.0, 0.0);\n\n    if (y > 0.0) {\n        if (x < 0.0) {\n            if (x * -0.5 > y) {\n                // Left\n                gap.x = -SPHERE_GAP * 0.5;\n            } else {\n                // Top\n                gap.y = SPHERE_GAP;\n            }\n        } else {\n            if (x * 0.5 > y) {\n                // Right\n                gap.x = SPHERE_GAP * 0.5;\n            } else {\n                // Top\n                gap.y = SPHERE_GAP;\n            }\n        }\n    } else {\n        if (x < 0.0) {\n            // Left\n            gap.x = -SPHERE_GAP * 0.5;\n        } else {\n            // Right\n            gap.x = SPHERE_GAP * 0.5;\n        }\n    }\n\n    return gap;\n}\n\nfloat getIndex () {\n    float index = float(gl_VertexID);\n    float count = SAMPLES / SPHERE_SAMPLES;\n    return mod(index, count) * SPHERE_SAMPLES + floor(index / count);\n}\n\n// Generate sphere\nvec3 sphere () {\n    // We build sphre of only SPHERE_SAMPLES\n    float index = getIndex();\n    float nindex = 1.0 - mod(index, SPHERE_SAMPLES) / SPHERE_SAMPLES;\n    float y = 1.0 - nindex * 2.0; // in range [-1, 1]\n    float theta = M_PHI * index;\n    float radius = sqrt(1.0 - y * y);\n\n    return vec3(\n        cos(theta) * radius,\n        y,\n        sin(theta) * radius\n    );\n}\n\nvec3 sphereAdjustment (vec3 position) {\n    float index = getIndex();\n    float scale = sphereSize * SPHERE_SCALE;\n\n    position = position + sphereGap(position);\n    position = position + sphereAnimation(position);\n\n    position = position * scale;\n    position = position + vec3(0.0, SPHERE_OFFSET_Y, sphereSize * sphereOffsetZ);\n\n    return position;\n}\n\n// Calculate sphere alpha, in front and back sphere fades out\nfloat sphereAlpha (vec3 vPosition, float increase, vec4 screenPosition) {\n    float index = getIndex();\n\n    if (index < SPHERE_SAMPLES) {\n        float z = vPosition.z;\n\n        // Fade out at the back of the sphere\n        float alpha = smoothstep(-0.75, 0.0, z) * smoothstep(-0.75, 1.0, z);\n\n        // Fade-out at the front of the sphere, based on screen position\n        float centerDistance = abs(distance(vec2(0.0, 0.0), vec2(screenPosition.x * screenRatio, screenPosition.y)));\n        alpha = alpha * smoothstep(0.0, 20.0, centerDistance - 6.0);\n\n        return clamp(alpha + increase, 0.0, 1.0);\n    } else {\n        return 0.0;\n    }\n}\n\n// Highlight dots and make them bigger\nHighlight sphereHighlight (vec3 color, vec3 vPosition) {\n    float index = getIndex();\n    float size = 0.0;\n\n    if (WITH_HIGHLIGHTS == 1) {\n        if (index < SPHERE_SAMPLES) {\n            for (int i = 0; i < highlights.length(); i++) {\n                float isActive = highlights[i].w; // 0 - not active, 1 - point is active\n                float pointDistance = abs(distance(vPosition, vec3(highlights[i])));\n                float pointMainDistance = 1.0 - clamp(smoothstep(0.0, 0.125, pointDistance) / 0.125, 0.0, 1.0);\n                float pointNearDistance = (1.0 - clamp(smoothstep(0.0, 0.45, pointDistance) / 0.45, 0.0, 1.0));\n\n                color = mix(color, vec3(1.0, 1.0, 1.0), clamp(pointMainDistance + pointNearDistance * 0.5 * isActive, 0.0, 1.0));\n                size = size + pointMainDistance * 1.5 * isActive;\n            }\n        }\n    }\n\n    return Highlight(size, color);\n}\n\n// Color sphere 3 parts in different colors\nvec3 sphereColor (vec3 vPosition) {\n    float x = vPosition.x;\n    float y = vPosition.y;\n\n    if (y > 0.0) {\n        if (x < 0.0) {\n            return x * -0.5 > y ? colorSphereB : colorSphereA;\n        } else {\n            return x * 0.5 > y ? colorSphereC : colorSphereA;\n        }\n    } else {\n        return x < 0.0 ? colorSphereB : colorSphereC;\n    }\n}\n\n// Apply easing so that some particles start moving faster, some later\nfloat mixAnimation () {\n    float index = mod(getIndex(), SPHERE_SAMPLES) / SPHERE_SAMPLES;\n    return smoothstep(0.5 * index, 0.5 + 0.5 * index, animation);\n}\n\n// Returns offset for reveal animation, used for position and alpha animation\nfloat getRevealAnimationOffset (vec3 position, float offset) {\n    // float x = position.x / objectSize.x + 0.5; // in range [0.0, 1.0]\n    float z = position.z / objectSize.z + 0.5; // in range [0.0, 1.0]\n\n    float index = z;\n    float s = index + 1.0 - offset;\n    float e = -(1.0 - index);\n    float pos = smoothstep(0.0, 1.0, (e - s) * revealAnimation + s);\n\n    return pos;\n}\n\nvec3 sphereReflection (vec3 color, vec3 position) {\n    vec2 xy = vec2(position.x / sphereSize, -position.y / sphereSize); // in range [-0.5, 0.5]\n    vec2 mouseDistance = vec2(mouseAnimated.x * screenRatio, mouseAnimated.y) * 0.1;\n    float diff = abs(distance(xy, mouseDistance));\n\n    diff = 1.0 - smoothstep(0.0, 0.06, diff);\n\n    // Flickering animation\n    float n = noise(vec2(xy.x * 70.0 + time / 5.0, xy.y * 70.0));\n    diff = diff * n;\n\n    // Make color lighter\n    diff = 1.0 + diff * 2.5;\n\n    color = color * diff;\n    color.r = clamp(color.r, 0.0, 1.0);\n    color.g = clamp(color.g, 0.0, 1.0);\n    color.b = clamp(color.b, 0.0, 1.0);\n\n    return color;\n}\n\nfloat mid (float value, float minValue, float maxValue) {\n    return 1.0 - abs((value - minValue) / (maxValue - minValue) * 2.0 - 1.0);\n}\n\nvec3 waveReflection (vec3 color, float screenX, float z) {\n    float diff = 0.75;\n\n    // Reflection only on part of the screen\n    float screenPart = mid(screenX, mouseAnimated.x - 0.3, mouseAnimated.x + 0.3);\n    diff = smoothstep(0.0, 1.0, diff * screenPart);\n\n    //\n    float n = noise(vec2(position.x / 10.0 + time / 5.0, position.z / 10.0));\n    diff = diff * n;\n\n    // Make color lighter\n    diff = 1.0 + diff * 2.5;\n\n    color = color * diff;\n    color.r = clamp(color.r, 0.0, 1.0);\n    color.g = clamp(color.g, 0.0, 1.0);\n    color.b = clamp(color.b, 0.0, 1.0);\n\n    return color;\n}\n\nvoid main() {\n    float vAnimation = mixAnimation();\n    vAlpha = alpha;\n\n    vec3 vPosition = vec3(0.0, 0.0, 0.0);\n    vec3 vSphere = vec3(0.0, 0.0, 0.0);\n    float vSizeMultiplier = 0.0;\n    Highlight vHighlight;\n\n    // Waves\n    if (vAnimation < 1.0) {\n        vPosition = position;\n        vPosition.y = vPosition.y - waves(position);\n    }\n\n    // Wave color\n    vec4 mvPosition = modelViewMatrix * vec4( vPosition, 1.0 );\n    gl_Position = projectionMatrix * mvPosition;\n\n    // Perspective divide/normalize\n    // Get screen coordinates, in range [-1, 1]\n    if (vAnimation < 1.0) {\n        float screenX = gl_Position.x / gl_Position.w;\n\n        if (screenX < 0.0) {\n            vColor = mix(colorA, colorB, screenX + 1.0);\n        } else {\n            vColor = mix(colorB, colorC, screenX);\n        }\n\n        vColor = waveReflection(vColor, screenX, vPosition.z / objectSize.z);\n    }\n\n    // Sphere\n    if (vAnimation > 0.0) {\n        vSphere = sphere();\n\n        vHighlight = sphereHighlight(sphereReflection(sphereColor(vSphere), vSphere), vSphere);\n        vSizeMultiplier = vHighlight.size;\n\n        vColor = mix(vColor, vHighlight.color, vAnimation);\n        vPosition = mix(vPosition, sphereAdjustment(vSphere), vAnimation);\n    }\n\n    // Reveal animation\n    if (revealAnimation < 1.0) {\n        vAlpha = vAlpha * (1.0 - getRevealAnimationOffset(position, 0.2));\n        vPosition.y = vPosition.y + getRevealAnimationOffset(position, 0.4) * objectSize.y * 0.3;\n    }\n\n    // Position\n    mvPosition = modelViewMatrix * vec4( vPosition, 1.0 );\n    gl_Position = projectionMatrix * mvPosition;\n\n    // Sphere alpha\n    if (vAnimation > 0.0) {\n        vAlpha = mix(vAlpha, sphereAlpha(vSphere, vHighlight.size, gl_Position), vAnimation);\n    }\n\n    // Point size\n    gl_PointSize = mix(size, sphereDotSize, vAnimation) * ( 300.0 / -mvPosition.z ) * (1.0 + vSizeMultiplier);\n\n\n    // For depth test, used by depth shader\n    float viewZDepthPlane = gl_Position.y / gl_Position.w * 50.0 + 20.0;\n    float viewZDepthSphere = -mvPosition.z;\n\n    vViewZDepth = mix(viewZDepthPlane, viewZDepthSphere, vAnimation);\n}\n"
    },
    111: function(e, t) {
        e.exports = "#define M_PI 3.1415926535897932384626433832795\n#define M_PHI M_PI * (3. - sqrt(5.)) // golden angle in radians\n#define SPHERE_OFFSET_Y 7.9\n#define SPHERE_SCALE 2.0\n\nprecision highp float;\n\nattribute float alpha;\n\nuniform float time;\nuniform float speed;\nuniform float sphereSpeed;\nuniform float sphereSize;\nuniform float sphereOffsetZ;\nuniform float sphereDotSize;\nuniform vec3 objectSize;\nuniform vec2 mouse; // in range [-1, 1]\nuniform vec2 mouseAnimated; // in range [-1, 1]\nuniform float screenRatio;\n\nuniform vec3 colorA;\nuniform vec3 colorB;\nuniform vec3 colorC;\n\nvarying vec3 vColor;\nvarying float vAlpha;\n\n// Depth test\nvarying float vViewZDepth;\n\n// Noise\nfloat rand(vec2 n) {\n\treturn fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);\n}\n\nfloat noise(vec2 p){\n\tvec2 ip = floor(p);\n\tvec2 u = fract(p);\n\tu = u*u*(3.0-2.0*u);\n\n\tfloat res = mix(\n\t\tmix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),\n\t\tmix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);\n\treturn res*res;\n}\n\n\nvec3 sphereAnimation (vec3 position) {\n    float velocity = time * sphereSpeed;\n    vec3 vPosition = normalize(position);\n\n    vec3 largeWave = vec3(\n        cos(vPosition.y * 10.0 + velocity * 0.5),\n        cos(vPosition.x * 13.33 + velocity * 0.5),\n        sin(vPosition.z * 16.66 + velocity * 0.5)\n    );\n\n    vec3 smallWave = vec3(\n        cos(vPosition.y * 3.0 + velocity * 0.75),\n        cos(vPosition.x * 5.3 + velocity * 0.75),\n        sin(vPosition.z * 4.1 + velocity * 0.75)\n    );\n\n    vec3 smallWave2 = vPosition * cos(vPosition.y * 33.0 + velocity * 0.75);\n\n    return largeWave * 0.02 + smallWave * 0.01 + smallWave2 * 0.01;\n}\n\n\nfloat getIndex () {\n    return float(gl_VertexID);\n}\n\n// Generate sphere\nvec3 sphere () {\n    float index = getIndex();\n    float nindex = 1.0 - index / SAMPLES;\n    float y = 1.0 - nindex * 2.0; // in range [-1, 1]\n    float theta = M_PHI * index;\n    float radius = sqrt(1.0 - y * y);\n\n    return vec3(\n        cos(theta) * radius,\n        y,\n        sin(theta) * radius\n    );\n}\n\nvec3 sphereAdjustment (vec3 position) {\n    float index = getIndex();\n    float scale = sphereSize * SPHERE_SCALE;\n\n    position = position + sphereAnimation(position);\n    position = position * scale;\n    position = position + vec3(0.0, SPHERE_OFFSET_Y, sphereSize * sphereOffsetZ);\n\n    return position;\n}\n\n// Calculate sphere alpha, in front and back sphere fades out\nfloat sphereAlpha (vec3 vPosition) {\n    // Fade out at the back of the sphere\n    return smoothstep(-0.75, 1.0, vPosition.z);\n}\n\nvec3 sphereReflection (vec3 color, vec3 position) {\n    vec2 xy = vec2(position.x / sphereSize, -position.y / sphereSize); // in range [-0.5, 0.5]\n    vec2 mouseDistance = vec2(mouseAnimated.x * screenRatio, mouseAnimated.y) * 0.1;\n    float diff = abs(distance(xy, mouseDistance));\n\n    diff = 1.0 - smoothstep(0.0, 0.06, diff);\n\n    // Flickering animation\n    float n = noise(vec2(xy.x * 70.0 + time / 5.0, xy.y * 70.0));\n    diff = diff * n;\n\n    // Make color lighter\n    diff = 1.0 + diff * 2.5;\n\n    color = color * diff;\n    color.r = clamp(color.r, 0.0, 1.0);\n    color.g = clamp(color.g, 0.0, 1.0);\n    color.b = clamp(color.b, 0.0, 1.0);\n\n    return color;\n}\n\n// Color sphere 3 parts in different colors\nvec3 sphereColor (vec3 vPosition) {\n    float x = clamp((vPosition.x + 0.9) / 1.8, 0.0, 1.0); // in range [0, 1]\n    float y = clamp((vPosition.y + 0.95) / 1.05, 0.0, 1.0); // in range [0, 1]\n    float pos = (x + y) / 2.0; // diognal gradient\n\n    if (pos < 0.5) {\n        return mix(colorA, colorB, smoothstep(0.0, 0.5, pos));\n    } else {\n        return mix(colorB, colorC, smoothstep(0.5, 1.0, pos));\n    }\n}\n\nvoid main() {\n    vec3 vPosition = vec3(0.0, 0.0, 0.0);\n    vec3 vSphere = vec3(0.0, 0.0, 0.0);\n\n    // Wave color\n    vec4 mvPosition = modelViewMatrix * vec4( vPosition, 1.0 );\n    gl_Position = projectionMatrix * mvPosition;\n\n    // Sphere\n    float screenX = gl_Position.x / gl_Position.w;\n\n    vSphere = sphere();\n    vColor = sphereReflection(sphereColor(vSphere), vSphere);\n    vPosition = sphereAdjustment(vSphere);\n\n    // Position\n    mvPosition = modelViewMatrix * vec4( vPosition, 1.0 );\n    gl_Position = projectionMatrix * mvPosition;\n\n    // Sphere alpha\n    vAlpha = sphereAlpha(vSphere);\n\n    // Point size\n    gl_PointSize = sphereDotSize * ( 300.0 / -mvPosition.z );\n\n    float viewZDepthSphere = -mvPosition.z;\n    vViewZDepth = viewZDepthSphere;\n}\n"
    },
    162: function(e, t) {
        e.exports = "uniform vec3 color;\nuniform sampler2D pointTexture;\n\nvarying vec3 vColor;\nvarying float vAlpha;\n\nvoid main() {\n    gl_FragColor = vec4( vColor, 1.0 );\n    gl_FragColor.w = texture2D( pointTexture, gl_PointCoord ).w * vAlpha;\n}\n"
    },
    163: function(e, t) {
        e.exports = "#define M_PI 3.1415926535897932384626433832795\n#define M_PHI M_PI * (3. - sqrt(5.)) // golden angle in radians\n#define MOUSE_DISTANCE 0.4\n\nprecision highp float;\n\nattribute float alpha;\n\nuniform float animation; // Wave -> sphere animation progress, in range [0, 1]\nuniform float revealAnimation; // Reveal animation progress, in range [0, 1]\nuniform float size;\nuniform float time;\nuniform float speed;\nuniform vec3 objectSize;\nuniform vec2 mouse; // in range [-1, 1]\nuniform vec2 mouseAnimated; // in range [-1, 1]\n\nuniform vec3 colorA;\nuniform vec3 colorB;\nuniform vec3 colorC;\n\nvarying vec3 vColor;\nvarying float vAlpha;\n\n// Depth test\nvarying float vViewZDepth;\n\nfloat wave(float x, float size) {\n    float position = mod(x, 1.0);\n    if (position > 0.0 && position < size) {\n        float progress = position / size;\n        return sin(smoothstep(0.0, 1.0, progress) * M_PI);\n    } else {\n        return 0.0;\n    }\n}\n\n// Generate waves\nfloat waves (vec3 position) {\n    float velocity = time * speed;\n    float velocityAnimated = (time + mouseAnimated.y * 10.0) * speed;\n    float x = position.x / objectSize.x; // in range [-0.5, 0.5]\n    float z = position.z / objectSize.z; // in range [-0.5, 0.5]\n\n    // Large soft wave at the back\n    float waveBackLargeSoft1 = wave(x + velocity * 0.01 + 0.4, 0.5) * wave(z - 0.3, 1.0) * 0.6;\n    float waveBackLargeSoft2 = wave(x + velocity * 0.012 + 0.6, 0.5) * wave(z - 0.23, 1.0) * 0.6;\n\n    // Left side lower, right side higher\n    float slope = x * -2.0;\n    float slopeZ = (z + 0.5) * 1.0;\n\n    // Wave height\n    float waveHeight = objectSize.y;\n\n    return (waveBackLargeSoft1 + waveBackLargeSoft2 + slopeZ) * (1.0 - smoothstep(0.4, 0.55, z)) * waveHeight;\n}\n\n// Returns offset for reveal animation, used for position and alpha animation\nfloat getRevealAnimationOffset (vec3 position, float offset) {\n    float z = position.z / objectSize.z + 0.5; // in range [0.0, 1.0]\n\n    float index = z;\n    float s = index + 1.0 - offset;\n    float e = -(1.0 - index);\n    float pos = smoothstep(0.0, 1.0, (e - s) * revealAnimation + s);\n\n    return pos;\n}\n\nvoid main() {\n    float vAnimation = animation;\n    vAlpha = 1.0;\n\n    vec3 vPosition = vec3(0.0, 0.0, 0.0);\n    vec3 vSphere = vec3(0.0, 0.0, 0.0);\n\n    // Waves\n    if (vAnimation < 1.0) {\n        vPosition = position;\n        vPosition.y = vPosition.y - waves(position);\n    }\n\n    // Wave color\n    vec4 mvPosition = modelViewMatrix * vec4( vPosition, 1.0 );\n    gl_Position = projectionMatrix * mvPosition;\n\n    // Perspective divide/normalize\n    // Get screen coordinates, in range [-1, 1]\n    if (vAnimation < 1.0) {\n        float screenX = gl_Position.x / gl_Position.w;\n\n        if (screenX < 0.0) {\n            vColor = mix(colorA, colorB, screenX + 1.0);\n        } else {\n            vColor = mix(colorB, colorC, screenX);\n        }\n    }\n\n    // Fade out when Z is further away from camera\n    float z = position.z / objectSize.z; // in range [-0.5, 0.5]\n    vAlpha = smoothstep(0.0, 1.0, z * 2.0);\n\n    // Animation fade-out\n    vAlpha = vAlpha * smoothstep(0.0, 1.0, 1.0 - vAnimation);\n\n    // Reveal animation\n    if (revealAnimation < 1.0) {\n        vAlpha = vAlpha * (1.0 - getRevealAnimationOffset(position, 0.2));\n        vPosition.y = vPosition.y + getRevealAnimationOffset(position, 0.4) * objectSize.y * 0.3;\n    }\n\n    // Position\n    mvPosition = modelViewMatrix * vec4( vPosition, 1.0 );\n    gl_Position = projectionMatrix * mvPosition;\n\n    // For depth test, used by depth shader\n    vViewZDepth = -mvPosition.z;\n}\n"
    },
    164: function(e, t) {
        e.exports = "varying vec3 vColor;\nvarying float vAlpha;\n\nvoid main() {\n    gl_FragColor = vec4(vColor, 1.0) * 0.3; // darken by 70%\n    // gl_FragColor = vec4(1.0);\n    gl_FragColor.w = vAlpha;\n}\n"
    },
    165: function(e, t) {
        e.exports = "uniform vec3 color;\nuniform sampler2D pointTexture;\n\nvarying vec3 vColor;\nvarying float vAlpha;\n\nvoid main() {\n    gl_FragColor = vec4( vColor, 1.0 );\n    gl_FragColor.w = texture2D( pointTexture, gl_PointCoord ).w * vAlpha;\n}\n"
    },
    189: function(e, t, n) {
        n(21),
        n(364),
        e.exports = n(365)
    },
    364: function(e, t, n) {
        "use strict";
        n.r(t);
        var i = n(1)
          , o = n(4)
          , s = n.n(o)
          , a = n(19)
          , r = (n(25),
        n(0))
          , l = n(10)
          , h = n(6)
          , c = n(7)
          , v = n(3);
        let p = null;
        function u() {
            if (!p) {
                const e = document.createElement("canvas")
                  , t = 32
                  , n = 10;
                e.width = e.height = 2 * t;
                const i = e.getContext("2d");
                i.clearRect(0, 0, e.width, e.height),
                i.beginPath(),
                i.arc(t, t, n, 0, 2 * Math.PI, !1),
                i.fillStyle = "#fff",
                i.fill(),
                $(e).css({
                    position: "fixed",
                    left: 100,
                    top: 0
                }),
                p = new r.d(e)
            }
            return p
        }
        var m = n(110)
          , f = n.n(m)
          , d = n(162)
          , g = n.n(d)
          , x = n(163)
          , S = n.n(x)
          , w = n(164)
          , P = n.n(w);
        const z = [0, -25, 100]
          , y = [.226, 0, 0]
          , A = [0, 0, 100]
          , b = [.126, 0, 0]
          , M = [300, 10, 150]
          , C = [0, 20, 0]
          , E = [0, 10, 0]
          , D = [8421776, 3425908, 3638158]
          , R = [10066598, 4084875, 4365477]
          , _ = [14, 27]
          , H = (_[0] + _[1]) / 2
          , j = {
            focalDepth: H,
            fstop: .42,
            maxblur: .8,
            showFocus: !1,
            manualdof: !1,
            vignetting: !0,
            depthblur: !1,
            shaderFocus: !1,
            threshold: .5,
            gain: 2,
            bias: .5,
            fringe: .7,
            focalLength: 16,
            noise: !1,
            pentagon: !1,
            dithering: 1e-4,
            znear: 4,
            zfar: 150
        }
          , O = [{
            id: "0",
            x: .715,
            y: -.315,
            z: 1
        }, {
            id: "1",
            x: .34,
            y: -.72,
            z: 1
        }, {
            id: "2",
            x: .78,
            y: .04,
            z: 1
        }, {
            id: "3",
            x: .845,
            y: -.7,
            z: 1
        }, {
            id: "4",
            x: .42,
            y: .05,
            z: 1
        }, {
            id: "7",
            x: -.649,
            y: .15,
            z: 1
        }, {
            id: "8",
            x: -.282,
            y: -.686,
            z: 1
        }, {
            id: "9",
            x: -.73,
            y: -.18,
            z: 1
        }, {
            id: "10",
            x: -.73,
            y: -.783,
            z: 1
        }, {
            id: "11",
            x: -.45,
            y: -.35,
            z: 1
        }, {
            id: "12",
            x: -.44,
            y: -.05,
            z: 1
        }, {
            id: "14",
            x: .325,
            y: .3,
            z: 1
        }, {
            id: "15",
            x: .52,
            y: .56,
            z: 1
        }, {
            id: "16",
            x: .17,
            y: .5,
            z: 1
        }, {
            id: "17",
            x: -.02,
            y: .7,
            z: 1
        }, {
            id: "18",
            x: -.43,
            y: .41,
            z: 1
        }, {
            id: "19",
            x: -.29,
            y: .6,
            z: 1
        }]
          , I = {
            x: {
                from: 0,
                to: 0
            },
            y: {
                from: -2 / 180 * Math.PI,
                to: 2 / 180 * Math.PI
            },
            z: {
                from: 0,
                to: 0
            }
        }
          , L = {
            x: {
                from: -10 / 180 * Math.PI,
                to: 10 / 180 * Math.PI
            },
            y: {
                from: -12 / 180 * Math.PI,
                to: 12 / 180 * Math.PI
            },
            z: {
                from: 0,
                to: 0
            }
        }
          , T = -10
          , F = 10;
        function W(e) {
            return 100 * v.a.lvh() / 1200 * (e || 4)
        }
        function k(e) {
            return W(e) * G()
        }
        function B() {
            const e = 100 * v.a.lvh();
            return window.innerWidth / e
        }
        function G() {
            const e = 100 * v.a.lvh()
              , t = window.innerWidth / e;
            return t < 390 / 450 ? 1 - (390 / 420 - t) : 1
        }
        function V() {
            return 3 + 10 * (1 - G())
        }
        function Z() {
            return 10 * G()
        }
        n(26);
        var q = n(9)
          , N = n.n(q)
          , X = n(5)
          , Y = n(18)
          , U = n(13);
        function J() {
            const e = new r.c
              , t = new Float32Array(15e4)
              , n = new Float32Array(5e4)
              , i = new r.v
              , o = Math.floor(Math.sqrt(M[0] / M[2] * 5e4))
              , s = 5e4 / o;
            for (let e = 0; e < 5e4; e++) {
                const a = Math.floor(e / o) / s
                  , r = e % o / o;
                i.x = M[0] * (r - .5) + C[0],
                i.z = M[2] * (a - .5) + C[2],
                i.y = C[1],
                i.toArray(t, 3 * e),
                n[e] = Object(Y.a)(1.5 * a, 0, 1)
            }
            return e.setAttribute("position", new r.g(t,3)),
            e.setAttribute("alpha", new r.b(n,1)),
            new r.m(e,function() {
                const e = c.a.matches("sm-down") ? R : D;
                return new r.q({
                    uniforms: {
                        colorA: {
                            value: new r.e(D[0])
                        },
                        colorB: {
                            value: new r.e(D[1])
                        },
                        colorC: {
                            value: new r.e(D[2])
                        },
                        colorSphereA: {
                            value: new r.e(e[0])
                        },
                        colorSphereB: {
                            value: new r.e(e[1])
                        },
                        colorSphereC: {
                            value: new r.e(e[2])
                        },
                        mouse: {
                            value: new r.u(0,0)
                        },
                        mouseAnimated: {
                            value: new r.u(0,0)
                        },
                        pointTexture: {
                            value: u()
                        },
                        time: {
                            value: 0
                        },
                        speed: {
                            value: .3
                        },
                        sphereSpeed: {
                            value: .2
                        },
                        highlights: {
                            value: O.map(e=>{
                                const t = new r.v(e.x,e.y,e.z).normalize();
                                return new r.w(t.x,t.y,t.z,1)
                            }
                            )
                        },
                        size: {
                            value: W()
                        },
                        sphereDotSize: {
                            value: k()
                        },
                        revealAnimation: {
                            value: 0
                        },
                        screenRatio: {
                            value: B()
                        },
                        animation: {
                            value: 0
                        },
                        objectSize: {
                            value: new r.v(M[0],M[1],M[2])
                        },
                        sphereSize: {
                            value: Z()
                        },
                        sphereOffsetZ: {
                            value: V()
                        }
                    },
                    defines: {
                        SAMPLES: "50000.0",
                        SPHERE_SAMPLES: "10000.0",
                        HIGHLIGHT_COUNT: O.length,
                        WITH_HIGHLIGHTS: h.a.hasHoverSupport() ? 1 : 0
                    },
                    vertexShader: f.a,
                    fragmentShader: g.a,
                    depthTest: !1,
                    transparent: !0
                })
            }())
        }
        function K() {
            const e = Math.floor(Math.sqrt(M[0] / M[2] * 5e4))
              , t = 5e4 / e
              , n = new r.l(M[0],M[2],e,t)
              , i = n.attributes.position.array
              , o = Math.floor(i.length / 3);
            for (let e = 0; e < o; e++) {
                const t = 3 * e
                  , n = i[t + 1];
                i[t] += E[0],
                i[t + 1] = i[t + 2] + E[1],
                i[t + 2] = n + E[2]
            }
            return new r.i(n,new r.q({
                uniforms: {
                    colorA: {
                        value: new r.e(D[0])
                    },
                    colorB: {
                        value: new r.e(D[1])
                    },
                    colorC: {
                        value: new r.e(D[2])
                    },
                    time: {
                        value: 0
                    },
                    speed: {
                        value: .3
                    },
                    revealAnimation: {
                        value: 0
                    },
                    animation: {
                        value: 0
                    },
                    objectSize: {
                        value: new r.v(M[0],M[1],M[2])
                    }
                },
                vertexShader: S.a,
                fragmentShader: P.a,
                blending: r.a,
                depthTest: !1,
                transparent: !0
            }))
        }
        function Q(e) {
            const t = new r.k(50,window.innerWidth / (100 * v.a.lvh()),.1,1e3);
            return t.position.set(Object(X.a)(z[0], A[0], e), Object(X.a)(z[1], A[1], e), Object(X.a)(z[2], A[2], e)),
            t.rotation.set(Object(X.a)(y[0], b[0], e), Object(X.a)(y[1], b[1], e), Object(X.a)(y[2], b[2], e)),
            t
        }
        function ee(e) {
            e.aspect = window.innerWidth / (100 * v.a.lvh()),
            e.updateProjectionMatrix()
        }
        class te {
            constructor(e) {
                this.controller = e,
                this.camera = null,
                this.scene = null,
                this.mesh = null,
                this.renderer = null,
                this.controls = null,
                this.mouseFocalDepth = H,
                this.rotation = {
                    x: .5,
                    y: .5,
                    z: 0
                },
                this.animationProgress = new U.a(0,{
                    strength: .04,
                    update: this.handleAnimationProgressChange.bind(this)
                }),
                this.revealProgress = new U.a(0,{
                    strength: .01,
                    update: this.handleRevealProgressChange.bind(this)
                }),
                this.dotSize = 4,
                e.on("resize", N()(this.handleResize.bind(this), 60)),
                e.on("tick", this.render.bind(this)),
                this.initCamera(),
                this.initScene(),
                this.initRenderer(),
                this.initControls()
            }
            reveal() {
                this.revealProgress.set(1)
            }
            getAnimationProgress() {
                return this.animationProgress.get()
            }
            setAnimationProgress(e) {
                this.animationProgress.set(e)
            }
            setRotation(e, t, n) {
                this.rotation.x = e,
                this.rotation.y = t,
                this.rotation.z = n,
                this.setRotationOnMesh(e, t, n)
            }
            setRotationOnMesh(e, t, n) {
                const i = Object(Y.a)(this.animationProgress.get() - .25, 0, 1) / .75
                  , o = Object(X.a)(Object(X.a)(I.x.from, I.x.to, t), Object(X.a)(L.x.from, L.x.to, t), i)
                  , s = Object(X.a)(Object(X.a)(I.y.from, I.y.to, e), Object(X.a)(L.y.from, L.y.to, e), i)
                  , a = Object(X.a)(Object(X.a)(I.z.from, I.z.to, n), Object(X.a)(L.z.from, L.z.to, n), i);
                this.mesh.rotation.set(o, s, a),
                this.mesh.position.set(i * (e - .5) * T, i * (t - .5) * F, 0)
            }
            handleAnimationProgressChange(e) {
                const t = this.mesh.material
                  , n = this.controller.postprocessing.materialDepth
                  , i = this.meshBackdrop.material;
                t.uniforms.animation.value = e,
                n.uniforms.animation.value = e,
                i.uniforms.animation.value = e,
                this.setRotationOnMesh(this.rotation.x, this.rotation.y, this.rotation.z);
                const o = Object(X.a)(this.mouseFocalDepth, 29.76, e)
                  , s = Object(X.a)(j.maxblur, 5, e)
                  , a = Object(X.a)(4, 19.9, e)
                  , r = Object(X.a)(150, 78.6, e)
                  , l = Object(X.a)(.7, 0, e);
                this.controller.postprocessing.setFocalDepth(o),
                this.controller.postprocessing.setZNearFar(a, r),
                this.controller.postprocessing.setMaxBlur(s),
                this.controller.postprocessing.setFringe(l);
                const h = this.camera;
                h.position.set(Object(X.a)(z[0], A[0], e), Object(X.a)(z[1], A[1], e), Object(X.a)(z[2], A[2], e)),
                h.rotation.set(Object(X.a)(y[0], b[0], e), Object(X.a)(y[1], b[1], e), Object(X.a)(y[2], b[2], e)),
                this.controller.emit("progress", [e])
            }
            handleRevealProgressChange(e) {
                const t = this.mesh.material
                  , n = this.controller.postprocessing.materialDepth;
                this.meshBackdrop.material.uniforms.revealAnimation.value = e,
                t.uniforms.revealAnimation.value = e,
                n.uniforms.revealAnimation.value = e
            }
            setMouseFocalDepth(e) {
                const t = this.animationProgress.get();
                this.mouseFocalDepth = e;
                const n = Object(X.a)(e, 29.76, t);
                this.controller.postprocessing.setFocalDepth(n)
            }
            initCamera() {
                this.camera = Q(0),
                this.staticCamera = Q(1)
            }
            initControls() {
                this.controller.options.debug,
                0
            }
            initScene() {
                const e = this.scene = new r.p
                  , t = this.mesh = J();
                e.add(t);
                const n = this.meshBackdrop = K();
                e.add(n)
            }
            initRenderer() {
                const e = this.renderer = new r.y;
                if (e.setPixelRatio(1),
                e.setSize(window.innerWidth, 100 * v.a.lvh()),
                e.toneMapping = r.o,
                e.autoClear = !1,
                this.controller.$canvas.append(e.domElement),
                !1 === e.capabilities.isWebGL2 && !1 === e.extensions.has("ANGLE_instanced_arrays"))
                    throw new Error("WebGL2 is not supported")
            }
            handleResize(e) {
                let {width: t, height: n} = e;
                ee(this.camera),
                ee(this.staticCamera),
                this.staticCamera.updateMatrixWorld(),
                this.renderer.setSize(t, n),
                this.mesh.material.uniforms.sphereSize.value = this.controller.postprocessing.materialDepth.uniforms.sphereSize.value = Z(),
                this.mesh.material.uniforms.sphereOffsetZ.value = this.controller.postprocessing.materialDepth.uniforms.sphereOffsetZ.value = V(),
                this.updateMaterialDotSize(),
                this.mesh.material.uniforms.screenRatio.value = B(),
                this.controller.postprocessing.materialDepth.uniforms.screenRatio.value = B()
            }
            updateMaterialDotSize() {
                this.mesh.material.uniforms.size.value = W(this.dotSize),
                this.mesh.material.uniforms.sphereDotSize.value = k(this.dotSize)
            }
            render(e) {
                this.mesh.material.uniforms.time.value = .005 * e,
                this.meshBackdrop.material.uniforms.time.value = .005 * e,
                this.controller.postprocessing.isEnabled || (this.renderer.clear(),
                this.renderer.render(this.scene, this.camera))
            }
        }
        class ne {
            constructor(e) {
                this.controller = e,
                this.$container = e.$container.find(".js-visualization-sphere"),
                this.$text = e.$container.find(".js-visualization-text"),
                this.$debugContainer = e.$container.find(".js-visualization-debug"),
                this.$popovers = e.$container.find("[data-popover-id]"),
                this.$pins = e.$container.find(".js-visualization-pin"),
                this.pinsVisible = !1,
                this.titleVisible = !1,
                this.$debug = null,
                this.debugPoints = [],
                this.areaHeight = 0,
                this.areaOffsetY = 0,
                this.areaX = 0,
                this.areaY = 0,
                this.sectionOffset = 0,
                this.positions = O.map(()=>[0, 0]),
                this.pointActive = -1,
                this.pointAnimations = O.map(()=>new U.a(0,{
                    strength: .05
                })),
                this.mouseAnimation = new U.a({
                    x: 0,
                    y: (H - _[0]) / (_[1] - _[0]) - .5
                },{
                    strength: .04,
                    update: this.updateMouseAnimated.bind(this)
                }),
                h.a.hasHoverSupport() && (e.on("resize", this.update.bind(this)),
                e.one("tick", this.update.bind(this)),
                e.on("tick", this.updateHighlightUniforms.bind(this)),
                e.on("start", this.handleVisuzalizationStart.bind(this)),
                e.on("stop", this.handleVisuzalizationStop.bind(this)),
                this.update()),
                e.on("progress", this.handleAnimationProgress.bind(this))
            }
            handleVisuzalizationStart() {
                $(document).on("mousemove." + this.controller.ns, this.handleMouseMove.bind(this))
            }
            handleVisuzalizationStop() {
                $(document).off("mousemove." + this.controller.ns)
            }
            handleAnimationProgress(e) {
                this.toggleFixedContent(e > .9),
                e <= .9 && this.setActive(-1)
            }
            toggleFixedContent(e) {
                this.pinsVisible !== e && (this.pinsVisible = e,
                this.$pins.toggleClass("intro-fixed-point--active", !!e),
                this.$text.toggleClass("intro-fixed-title--active", !!e))
            }
            setDebug(e) {
                this.$debug && this.$debug.css("visibility", e ? "visible" : "hidden")
            }
            setActive(e) {
                if (e !== this.pointActive) {
                    const t = this.pointAnimations;
                    -1 !== this.pointActive && (t[this.pointActive].set(0),
                    this.getPopover(this.pointActive).attr("aria-hidden", "true").removeClass("popover--active")),
                    -1 !== e && (t[e].set(1),
                    this.getPopover(e).attr("aria-hidden", "false").addClass("popover--active")),
                    -1 !== this.pointActive && -1 === e && this.pinsVisible ? this.$text.addClass("intro-fixed-title--active") : -1 === this.pointActive && -1 !== e && this.$text.removeClass("intro-fixed-title--active"),
                    this.pointActive = e
                }
            }
            getPopover(e) {
                const t = O[e].id
                  , n = this.$popovers;
                for (let e = 0; e < n.length; e++)
                    if (String(n.eq(e).data("popoverId")) === String(t))
                        return n.eq(e);
                return null
            }
            getSphereSize() {
                return this.controller.app.mesh.material.uniforms.sphereSize.value
            }
            sphereToScreen(e) {
                const t = this.controller.app.staticCamera
                  , n = this.getSphereSize()
                  , i = this.areaX
                  , o = this.areaY
                  , s = this.areaHeight
                  , a = 437 + 210 * (window.innerWidth / (100 * v.a.lvh()) - 2.1333);
                let l = new r.v(e.x,e.y,e.z).normalize().multiplyScalar(2 * n).add(new r.v(0,7.9,3));
                l = l.project(t),
                l.y = -l.y;
                let h = new r.v(e.x,e.y,e.z).normalize().multiplyScalar(2 * n).add(new r.v(0,7.9,3));
                h = h.project(this.controller.app.camera),
                h.y = -h.y;
                return [i + (50 + a / 2 * l.x * 1.1 + 0) / 100 * s, o + (50 + 105 * l.y * 1.1 - 10) / 100 * s]
            }
            update() {
                const e = window.innerWidth
                  , t = 100 * v.a.lvh()
                  , n = this.getSphereSize()
                  , i = this.areaOffsetY = t * n * .001
                  , o = this.areaHeight = t * n * .072
                  , s = this.areaX = (e - o) / 2
                  , a = this.areaY = (t - o) / 2 + i
                  , r = this.$container.pageOffset();
                this.sectionOffset = r.top + r.height - t,
                this.$debug && this.$debug.css({
                    left: s,
                    top: a,
                    width: o,
                    height: o
                }),
                O.map((e,t)=>{
                    this.updatePopoverPosition(t)
                }
                )
            }
            updatePopoverPosition(e) {
                const t = this.sphereToScreen(O[e])
                  , n = this.getPopover(e);
                if (this.positions[e] = t,
                n.get(0).style.setProperty("--x", t[0] + "px"),
                n.get(0).style.setProperty("--y", t[1] + "px"),
                this.debugPoints[e]) {
                    const n = (t[0] - this.areaX) / this.areaHeight * 100
                      , i = (t[1] - this.areaY) / this.areaHeight * 100;
                    this.debugPoints[e].css({
                        left: n + "%",
                        top: i + "%",
                        transform: "translate(-50%, -50%)"
                    })
                }
            }
            handleMouseMove(e) {
                const t = this.positions
                  , n = this.controller.$canvas.get(0).getBoundingClientRect().top
                  , i = e.clientX
                  , o = e.clientY - n;
                let s = -1
                  , a = 1 / 0;
                if (this.controller.app.getAnimationProgress() > .9)
                    for (let e = 0; e < t.length; e++) {
                        const n = i - t[e][0]
                          , r = o - t[e][1]
                          , l = n * n + r * r;
                        l < 1e4 && l < a && (a = l,
                        s = e)
                    }
                this.setActive(s);
                const r = this.controller.app.mesh.material
                  , l = this.controller.postprocessing.materialDepth
                  , h = i / window.innerWidth * 2 - 1
                  , c = o / (100 * v.a.lvh()) * 2 - 1;
                r.uniforms.mouse.value.set(h, c),
                l.uniforms.mouse.value.set(h, c),
                this.mouseAnimation.set({
                    x: h,
                    y: c
                })
            }
            updateMouseAnimated(e) {
                let {x: t, y: n} = e;
                const i = this.controller.app.mesh.material
                  , o = this.controller.postprocessing.materialDepth;
                i.uniforms.mouseAnimated.value.set(t, n),
                o.uniforms.mouseAnimated.value.set(t, n);
                const s = Object(X.a)(_[0], _[1], .5 - n);
                this.controller.app.setMouseFocalDepth(s),
                this.controller.app.setRotation(t / 2 + .5, n / 2 + .5, 0)
            }
            updateHighlightUniforms(e, t) {
                const n = this.pointAnimations;
                this.controller.app.mesh.material.uniforms.highlights.value.forEach((e,i)=>{
                    n[i].update(t),
                    e.w = n[i].get()
                }
                )
            }
        }
        class ie {
            constructor(e) {
                this.controller = e,
                this.renderer = e.app.renderer,
                this.scene = e.app.scene,
                this.camera = e.app.camera,
                this.materialDepth = null,
                this.materialBokeh = null,
                this.rtTextureColor = null,
                this.rtTextureDepth = null,
                this.uniforms = null,
                this.quad = null,
                this.postProcessingCamera = null,
                this.postProcessingScene = null,
                this.isEnabled = !1,
                e.on("resize", this.handleResize.bind(this)),
                e.on("tick", this.render.bind(this)),
                this.init(),
                this.setEnabled(!0)
            }
            setMaxBlur(e) {
                this.uniforms.maxblur.value = e
            }
            setFringe(e) {
                this.uniforms.fringe.value = e
            }
            setZNearFar(e, t) {
                const n = this.materialDepth
                  , i = this.uniforms;
                i.znear.value = e,
                i.zfar.value = t,
                n.uniforms.mNear.value = e,
                n.uniforms.mFar.value = t
            }
            setFocalDepth(e) {
                this.uniforms.focalDepth.value = e
            }
            setEnabled(e) {
                (e = !!e) !== this.isEnabled && (this.isEnabled = !!e,
                e || (this.scene.overrideMaterial = null,
                this.renderer.setRenderTarget(null),
                this.controller.app.updateMaterialDotSize()))
            }
            handleResize(e) {
                let {width: t, height: n} = e;
                this.rtTextureDepth.setSize(t, n),
                this.rtTextureColor.setSize(t, n),
                this.materialDepth.uniforms.size.value = 1.5 * W(this.controller.app.dotSize),
                this.uniforms.textureWidth.value = t,
                this.uniforms.textureHeight.value = n,
                this.postProcessingCamera.left = t / -2,
                this.postProcessingCamera.right = t / 2,
                this.postProcessingCamera.top = n / 2,
                this.postProcessingCamera.bottom = n / -2,
                this.postProcessingCamera.updateProjectionMatrix(),
                this.quad.scale.set(t, n, 1)
            }
            init() {
                const e = window.innerWidth
                  , t = 100 * v.a.lvh()
                  , n = this.postProcessingScene = new r.p
                  , i = this.postProcessingCamera = new r.j(e / -2,e / 2,t / 2,t / -2,-1e4,1e4);
                i.position.z = 100,
                n.add(i),
                n.background = new r.e(263182);
                const o = this.materialDepth = new r.q({
                    uniforms: {
                        mouse: {
                            value: new r.u(0,0)
                        },
                        mouseAnimated: {
                            value: new r.u(0,0)
                        },
                        time: {
                            value: 0
                        },
                        speed: {
                            value: .3
                        },
                        sphereSpeed: {
                            value: .2
                        },
                        size: {
                            value: W()
                        },
                        sphereDotSize: {
                            value: k()
                        },
                        revealAnimation: {
                            value: 0
                        },
                        screenRatio: {
                            value: B()
                        },
                        animation: {
                            value: 0
                        },
                        objectSize: {
                            value: new r.v(M[0],M[1],M[2])
                        },
                        sphereSize: {
                            value: Z()
                        },
                        sphereOffsetZ: {
                            value: V()
                        },
                        mNear: {
                            value: 4
                        },
                        mFar: {
                            value: 150
                        }
                    },
                    defines: {
                        SAMPLES: "50000.0",
                        SPHERE_SAMPLES: "10000.0",
                        HIGHLIGHT_COUNT: O.length,
                        WITH_HIGHLIGHTS: 0
                    },
                    vertexShader: f.a,
                    fragmentShader: l.a.fragmentShader
                });
                o.uniforms.mNear.value = 4,
                o.uniforms.mFar.value = 150;
                const s = this.rtTextureDepth = new r.x(e,t)
                  , a = this.rtTextureColor = new r.x(e,t)
                  , h = this.uniforms = r.t.clone(l.b.uniforms);
                h.tColor.value = a.texture,
                h.tDepth.value = s.texture,
                h.textureWidth.value = e,
                h.textureHeight.value = t;
                for (let e in j)
                    h[e].value = j[e];
                const c = this.materialBokeh = new r.q({
                    uniforms: h,
                    vertexShader: l.b.vertexShader,
                    fragmentShader: l.b.fragmentShader,
                    defines: {
                        RINGS: 3,
                        SAMPLES: 3
                    }
                })
                  , p = this.quad = new r.i(new r.l(1,1),c);
                p.scale.set(e, t, 1),
                p.position.z = -500,
                n.add(p)
            }
            render(e) {
                if (this.isEnabled) {
                    this.materialDepth.uniforms.time.value = .005 * e;
                    const t = this.renderer
                      , n = this.scene
                      , i = this.camera
                      , o = this.controller.app.meshBackdrop;
                    let s = o.visible;
                    t.clear(),
                    t.setRenderTarget(this.rtTextureColor),
                    t.clear(),
                    t.render(n, i),
                    o.visible = !1,
                    n.overrideMaterial = this.materialDepth,
                    t.setRenderTarget(this.rtTextureDepth),
                    t.clear(),
                    t.render(n, i),
                    o.visible = s,
                    n.overrideMaterial = null,
                    t.setRenderTarget(null),
                    t.render(this.postProcessingScene, this.postProcessingCamera)
                }
            }
        }
        class oe extends a.a {
            static get Defaults() {
                return i.a.extend({}, a.a.Defaults, {})
            }
            init() {
                this.app = new te(this),
                this.postprocessing = new ie(this),
                this.hover = new ne(this)
            }
        }
        i.a.fn.visualizationLandingIntro = s()(oe)
    },
    365: function(e, t, n) {
        "use strict";
        n.r(t);
        var i = n(1)
          , o = n(4)
          , s = n.n(o)
          , a = n(19);
        n(25);
        const r = [11, -28, 100]
          , l = [-6, -24, 100]
          , h = [.126, 0, 0]
          , c = [300, 10, 150]
          , v = [0, 20, 0]
          , p = [10066598, 4084875, 4365477]
          , u = [11908799, 5073069, 6010045]
          , m = {
            focalDepth: 23.88,
            fstop: .3,
            maxblur: 2,
            showFocus: !1,
            manualdof: !1,
            vignetting: !0,
            depthblur: !1,
            shaderFocus: !1,
            threshold: .5,
            gain: 2,
            bias: .5,
            fringe: 0,
            focalLength: 16,
            noise: !1,
            pentagon: !1,
            dithering: 1e-4,
            znear: 19.9,
            zfar: 78.6
        }
          , f = (Math.PI,
        Math.PI,
        {
            x: {
                from: -10 / 180 * Math.PI,
                to: 10 / 180 * Math.PI
            },
            y: {
                from: -12 / 180 * Math.PI,
                to: 12 / 180 * Math.PI
            },
            z: {
                from: 0,
                to: 0
            }
        })
          , d = -10
          , g = 10;
        var x = n(0)
          , S = (n(26),
        n(9))
          , w = n.n(S)
          , P = n(5)
          , z = n(3)
          , y = n(18)
          , A = n(10)
          , b = n(7);
        let M = null;
        function C() {
            if (!M) {
                const e = document.createElement("canvas")
                  , t = 32
                  , n = 10;
                e.width = e.height = 2 * t;
                const i = e.getContext("2d");
                i.clearRect(0, 0, e.width, e.height),
                i.beginPath(),
                i.arc(t, t, n, 0, 2 * Math.PI, !1),
                i.fillStyle = "#fff",
                i.fill(),
                $(e).css({
                    position: "fixed",
                    left: 100,
                    top: 0
                }),
                M = new x.d(e)
            }
            return M
        }
        var E = n(111)
          , D = n.n(E)
          , R = n(165)
          , _ = n.n(R);
        function H(e) {
            return function(e) {
                return 100 * z.a.lvh() / 1200 * (e || 4)
            }(e) * O()
        }
        function j() {
            return window.innerWidth / (100 * z.a.lvh())
        }
        function O() {
            const e = window.innerWidth / (100 * z.a.lvh());
            return e < 390 / 560 ? 1 - (390 / 560 - e) : 1
        }
        function I() {
            return 3 + 9 * (1 - O())
        }
        function L() {
            return 9 * O()
        }
        function T() {
            const e = new x.c
              , t = new Float32Array(3e4)
              , n = new Float32Array(1e4)
              , i = new x.v
              , o = Math.floor(Math.sqrt(c[0] / c[2] * 1e4))
              , s = 1e4 / o;
            for (let e = 0; e < 1e4; e++) {
                const a = Math.floor(e / o) / s
                  , r = e % o / o;
                i.x = c[0] * (r - .5) + v[0],
                i.z = c[2] * (a - .5) + v[2],
                i.y = v[1],
                i.toArray(t, 3 * e),
                n[e] = Object(y.a)(1.5 * a, 0, 1)
            }
            return e.setAttribute("position", new x.g(t,3)),
            e.setAttribute("alpha", new x.b(n,1)),
            new x.m(e,function() {
                const e = b.a.matches("sm-down") ? u : p;
                return new x.q({
                    uniforms: {
                        colorA: {
                            value: new x.e(e[0])
                        },
                        colorB: {
                            value: new x.e(e[1])
                        },
                        colorC: {
                            value: new x.e(e[2])
                        },
                        mouse: {
                            value: new x.u(0,0)
                        },
                        mouseAnimated: {
                            value: new x.u(0,0)
                        },
                        pointTexture: {
                            value: C()
                        },
                        time: {
                            value: 0
                        },
                        speed: {
                            value: .3
                        },
                        sphereSpeed: {
                            value: .2
                        },
                        sphereDotSize: {
                            value: H()
                        },
                        screenRatio: {
                            value: j()
                        },
                        objectSize: {
                            value: new x.v(c[0],c[1],c[2])
                        },
                        sphereSize: {
                            value: L()
                        },
                        sphereOffsetZ: {
                            value: I()
                        }
                    },
                    defines: {
                        SAMPLES: "10000.0"
                    },
                    vertexShader: D.a,
                    fragmentShader: _.a,
                    depthTest: !1,
                    transparent: !0
                })
            }())
        }
        function F() {
            return b.a.matches("sm-down") ? l : r
        }
        function W() {
            const e = new x.k(50,window.innerWidth / (100 * z.a.lvh()),.1,1e3)
              , t = F();
            return e.position.set(t[0], t[1], t[2]),
            e.rotation.set(h[0], h[1], h[2]),
            e
        }
        function k(e) {
            e.aspect = window.innerWidth / (100 * z.a.lvh()),
            e.updateProjectionMatrix();
            const t = F();
            e.position.set(t[0], t[1], t[2])
        }
        class B {
            constructor(e) {
                this.controller = e,
                this.camera = null,
                this.scene = null,
                this.mesh = null,
                this.renderer = null,
                this.controls = null,
                this.rotation = {
                    x: .5,
                    y: .5,
                    z: 0
                },
                this.dotSize = 4,
                e.on("resize", w()(this.handleResize.bind(this), 60)),
                e.on("tick", this.render.bind(this)),
                this.initCamera(),
                this.initScene(),
                this.initRenderer(),
                this.initControls()
            }
            setRotation(e, t, n) {
                this.rotation.x = e,
                this.rotation.y = t,
                this.rotation.z = n,
                this.setRotationOnMesh(e, t, n)
            }
            setRotationOnMesh(e, t, n) {
                const i = Object(P.a)(f.x.from, f.x.to, t)
                  , o = Object(P.a)(f.y.from, f.y.to, e)
                  , s = Object(P.a)(f.z.from, f.z.to, n);
                this.mesh.rotation.set(i, o, s),
                this.mesh.position.set((e - .5) * d, (t - .5) * g, 0)
            }
            initCamera() {
                this.camera = W(),
                this.staticCamera = W()
            }
            initControls() {
                this.controller.options.debug,
                0
            }
            initScene() {
                const e = this.scene = new x.p
                  , t = this.mesh = T();
                e.add(t)
            }
            initRenderer() {
                const e = this.renderer = new x.y;
                if (e.setPixelRatio(1),
                e.setSize(window.innerWidth, 100 * z.a.lvh()),
                e.toneMapping = x.o,
                e.autoClear = !1,
                this.controller.$canvas.append(e.domElement),
                !1 === e.capabilities.isWebGL2 && !1 === e.extensions.has("ANGLE_instanced_arrays"))
                    throw new Error("WebGL2 is not supported")
            }
            handleResize(e) {
                let {width: t, height: n} = e;
                k(this.camera),
                k(this.staticCamera),
                this.staticCamera.updateMatrixWorld(),
                this.renderer.setSize(t, n),
                this.mesh.material.uniforms.sphereSize.value = this.controller.postprocessing.materialDepth.uniforms.sphereSize.value = L(),
                this.mesh.material.uniforms.sphereOffsetZ.value = this.controller.postprocessing.materialDepth.uniforms.sphereOffsetZ.value = I(),
                this.updateMaterialDotSize(),
                this.mesh.material.uniforms.screenRatio.value = j(),
                this.controller.postprocessing.materialDepth.uniforms.screenRatio.value = j()
            }
            updateMaterialDotSize() {
                this.mesh.material.uniforms.sphereDotSize.value = H(this.dotSize)
            }
            render(e) {
                this.mesh.material.uniforms.time.value = .005 * e,
                this.controller.postprocessing.isEnabled || (this.renderer.clear(),
                this.renderer.render(this.scene, this.camera))
            }
        }
        var G = n(6)
          , V = n(13);
        class Z {
            constructor(e) {
                this.controller = e,
                this.areaHeight = 0,
                this.areaOffsetY = 0,
                this.areaX = 0,
                this.areaY = 0,
                this.mouseAnimation = new V.a({
                    x: 0,
                    y: 0
                },{
                    strength: .04,
                    update: this.updateMouseAnimated.bind(this)
                }),
                G.a.hasHoverSupport() && (e.on("start", this.handleVisuzalizationStart.bind(this)),
                e.on("stop", this.handleVisuzalizationStop.bind(this)))
            }
            handleVisuzalizationStart() {
                $(document).on("mousemove." + this.controller.ns, this.handleMouseMove.bind(this))
            }
            handleVisuzalizationStop() {
                $(document).off("mousemove." + this.controller.ns)
            }
            getSphereSize() {
                return this.controller.app.mesh.material.uniforms.sphereSize.value
            }
            update() {}
            handleMouseMove(e) {
                const t = e.clientX
                  , n = e.clientY
                  , i = this.controller.app.mesh.material
                  , o = this.controller.postprocessing.materialDepth
                  , s = t / window.innerWidth * 2 - 1 + .15
                  , a = n / (100 * z.a.lvh()) * 2 - 1 + .5;
                i.uniforms.mouse.value.set(s, a),
                o.uniforms.mouse.value.set(s, a),
                this.mouseAnimation.set({
                    x: s,
                    y: a
                })
            }
            updateMouseAnimated(e) {
                let {x: t, y: n} = e;
                const i = this.controller.app.mesh.material
                  , o = this.controller.postprocessing.materialDepth;
                i.uniforms.mouseAnimated.value.set(t, n),
                o.uniforms.mouseAnimated.value.set(t, n),
                this.controller.app.setRotation(t / 2 + .5, n / 2 + .5, 0)
            }
        }
        class q {
            constructor(e) {
                this.controller = e,
                this.renderer = e.app.renderer,
                this.scene = e.app.scene,
                this.camera = e.app.camera,
                this.materialDepth = null,
                this.materialBokeh = null,
                this.rtTextureColor = null,
                this.rtTextureDepth = null,
                this.uniforms = null,
                this.quad = null,
                this.postProcessingCamera = null,
                this.postProcessingScene = null,
                this.isEnabled = !1,
                e.on("resize", this.handleResize.bind(this)),
                e.on("tick", this.render.bind(this)),
                this.init(),
                this.setEnabled(!0)
            }
            setMaxBlur(e) {
                this.uniforms.maxblur.value = e
            }
            setFringe(e) {
                this.uniforms.fringe.value = e
            }
            setZNearFar(e, t) {
                const n = this.materialDepth
                  , i = this.uniforms;
                i.znear.value = e,
                i.zfar.value = t,
                n.uniforms.mNear.value = e,
                n.uniforms.mFar.value = t
            }
            setEnabled(e) {
                (e = !!e) !== this.isEnabled && (this.isEnabled = !!e,
                e || (this.scene.overrideMaterial = null,
                this.renderer.setRenderTarget(null),
                this.controller.app.updateMaterialDotSize()))
            }
            handleResize(e) {
                let {width: t, height: n} = e;
                this.rtTextureDepth.setSize(t, n),
                this.rtTextureColor.setSize(t, n),
                this.uniforms.textureWidth.value = t,
                this.uniforms.textureHeight.value = n,
                this.postProcessingCamera.left = t / -2,
                this.postProcessingCamera.right = t / 2,
                this.postProcessingCamera.top = n / 2,
                this.postProcessingCamera.bottom = n / -2,
                this.postProcessingCamera.updateProjectionMatrix(),
                this.quad.scale.set(t, n, 1)
            }
            init() {
                const e = window.innerWidth
                  , t = 100 * z.a.lvh()
                  , n = this.postProcessingScene = new x.p
                  , i = this.postProcessingCamera = new x.j(e / -2,e / 2,t / 2,t / -2,-1e4,1e4);
                i.position.z = 100,
                n.add(i),
                n.background = new x.e(263182);
                const o = this.materialDepth = function() {
                    const e = new x.q({
                        uniforms: Object.assign({
                            mouse: {
                                value: new x.u(0,0)
                            },
                            mouseAnimated: {
                                value: new x.u(0,0)
                            },
                            time: {
                                value: 0
                            },
                            speed: {
                                value: .3
                            },
                            sphereSpeed: {
                                value: .2
                            },
                            sphereDotSize: {
                                value: H()
                            },
                            screenRatio: {
                                value: j()
                            },
                            objectSize: {
                                value: new x.v(c[0],c[1],c[2])
                            },
                            sphereSize: {
                                value: L()
                            },
                            sphereOffsetZ: {
                                value: I()
                            }
                        }, A.a.uniforms),
                        defines: {
                            SAMPLES: "10000.0"
                        },
                        vertexShader: D.a,
                        fragmentShader: A.a.fragmentShader
                    });
                    return e.uniforms.mNear.value = 19.9,
                    e.uniforms.mFar.value = 78.6,
                    e
                }();
                o.uniforms.mNear.value = 19.9,
                o.uniforms.mFar.value = 78.6;
                const s = this.rtTextureDepth = new x.x(e,t)
                  , a = this.rtTextureColor = new x.x(e,t)
                  , r = this.uniforms = x.t.clone(A.b.uniforms);
                r.tColor.value = a.texture,
                r.tDepth.value = s.texture,
                r.textureWidth.value = e,
                r.textureHeight.value = t;
                for (let e in m)
                    r[e].value = m[e];
                const l = this.materialBokeh = new x.q({
                    uniforms: r,
                    vertexShader: A.b.vertexShader,
                    fragmentShader: A.b.fragmentShader,
                    defines: {
                        RINGS: 3,
                        SAMPLES: 3
                    }
                })
                  , h = this.quad = new x.i(new x.l(1,1),l);
                h.scale.set(e, t, 1),
                h.position.z = -500,
                n.add(h)
            }
            render(e) {
                if (this.isEnabled) {
                    this.materialDepth.uniforms.time.value = .005 * e;
                    const t = this.renderer
                      , n = this.scene
                      , i = this.camera;
                    t.clear(),
                    t.setRenderTarget(this.rtTextureColor),
                    t.clear(),
                    t.render(n, i),
                    n.overrideMaterial = this.materialDepth,
                    t.setRenderTarget(this.rtTextureDepth),
                    t.clear(),
                    t.render(n, i),
                    n.overrideMaterial = null,
                    t.setRenderTarget(null),
                    t.render(this.postProcessingScene, this.postProcessingCamera)
                }
            }
        }
        class N extends a.a {
            static get Defaults() {
                return Object.assign({}, a.a.Defaults, {
                    debug: !1,
                    revealDuration: 2e3
                })
            }
            init() {
                this.app = new B(this),
                this.postprocessing = new q(this),
                this.hover = new Z(this)
            }
        }
        i.a.fn.visualizationLandingPlatform = s()(N)
    }
}, [[189, 0]]]);
