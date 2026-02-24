import {
  createPositionSpringConfig,
  createLiftSpringConfig,
  createWiggleSpringConfig
} from '../../src/math/spring-configs';

describe('Math > spring-configs.ts', () => {
  it('creates stable translation config', () => {
    const conf = createPositionSpringConfig(200, 20);
    expect(conf.stiffness).toBe(200);
    expect(conf.damping).toBe(20);
    expect(conf.mass).toBe(1);
    expect(conf.overshootClamping).toBe(false);
  });

  it('generates stiffer lift config to provide tactile pop', () => {
    // Standard stiff 200 -> lift should be 300
    const conf = createLiftSpringConfig(200);
    expect(conf.stiffness).toBe(300);
    expect(conf.damping).toBeLessThan(20); // Bounce
  });

  it('generates low damped wiggle config for persistent oscillation', () => {
    const conf = createWiggleSpringConfig();
    expect(conf.stiffness).toBe(100);
    expect(conf.damping).toBe(5); // Easy to wobble
  });
});
