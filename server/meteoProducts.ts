export const temperatureProducts = {
    0: 'temperature',
    1: 'virtual-temperature',
    2: 'potential-temperature',
    3: 'pseudo-adiabatic-potential-temperature',
    4: 'maximum-temperature',
    5: 'minimum-temperature',
    6: 'dev-point-temperature',
    7: 'dev-point-depression',
    8: 'lapse-rate',
    9: 'temperature-anomaly',
    10: 'latent-heat-net-flux',
    11: 'sensible-heat-net-flux',
    30: 'latent-heat-net-flux-fue-to-evaporation',
    31: 'latent-heat-net-flux-due-to-sublimation',
}

export const moistureProducts = {
    0: 'specific-humidity',
    1: 'relative-humidity',
    2: 'humidity-mixing-ratio',
    3: 'precipitable-water',
    4: 'vapour-pressure',
    5: 'saturation-deficit',
    6: 'evaporation',
    7: 'precipitation-rate',
    8: 'total-precipitation',
    52: 'total-precipitation-rate',
    53: 'total-snowfall-rate-water-equivalent',
    60: 'snow-depth-water-equivalent',
    64: 'total-column-integrated-water-vapour',
    65: 'rain-precipitation-rate',
    69: 'total-column-integrate-cloud-water',
    70: 'total-column-integrate-cloud-ice',
    75: 'graupel-snow-pellets-prepitation-rate',
    128: 'total-solid-precipitation-rate',
    192: 'categorical-rain',
    199: 'potential-evaporation',
}

export const momentumProducts = {
    0: 'wind-direction', // from which blowing
    1: 'wind-speed',
    2: 'u-component-of-wind',
    3: 'v-component-of-wind',
    4: 'stream-function',
    5: 'velocity-potential',
    17: 'momentum-flux-u-component',
    18: 'momentum-flux-v-component',
    22: 'wind-speed-gust',
    23: 'u-component-of-wind-gust',
    24: 'v-component-of-wind-gust',
}

export const massProducts = {
    0: 'pressure',
    1: 'pressure-reduced-to-msl',
    2: 'pressure-tendency',
    3: 'icao-standard-atmosphere-reference-height',
    4: 'geopotential',
    5: 'geopotential-height',
    6: 'geometric-height',
}

export const shortWaveRadiationProducts = {
    0: 'net-short-wave-radiation-flux-surface',
    1: 'net-short-wave-radiation-flux-top-of-atmosphere',
    2: 'short-wave-radiation-flux',
    3: 'global-radiation-flux',
    4: 'brightness-temperature',
    5: 'radiance-with-respect-to-wave-number',
    6: 'radiance-with-respect-to-wavelength',
    7: 'downward-short-wave-radiation-flux',
    8: 'upward-short-wave-radiation-flux',
    9: 'net-short-wave-radiation-flux',
}

export const longWaveRadiationProducts = {
    4: 'upward-long-wave-radiation-flux',
    5: 'net-long-wave-radiation-flux',
}

export const cloudProducts = {
    0: 'cloud-ice',
    1: 'total-cloud-cover',
    2: 'convective-cloud-cover',
    3: 'low-cloud-cover',
    4: 'medium-cloud-cover',
    5: 'high-cloud-cover',
    6: 'cloud-water',
    7: 'cloud-amount',
    8: 'cloud-type',
    9: 'thunderstorm-maximum-tops',
    10: 'thunderstorm-coverage',
    11: 'cloud-base',
    12: 'cloud-top',
    32: 'fraction-of-cloud-cover',
    199: 'ice-fraction-of-total-condensate',
}

export const electrodynamicsProducts = {
    193: 'unknown-local-use',
}

export const physicalAtmosphericProducts = {
    0: 'visibility',
    1: 'albedo',
    2: 'thunderstorm-probability',
    3: 'mixed-layer-depth',
    4: 'volcanic-ash',
}

export const thermodynamicStabilityProducts = {
    6: 'convective-available-potential-energy',
    7: 'convective-inhibition',
}