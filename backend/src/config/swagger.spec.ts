import { isSwaggerEnabled } from './swagger.js';

describe('isSwaggerEnabled', () => {
  it('ligado fora de produção', () => {
    expect(isSwaggerEnabled({})).toBe(true);
    expect(isSwaggerEnabled({ NODE_ENV: 'development' })).toBe(true);
  });

  it('em produção, só com SWAGGER_ENABLED=true', () => {
    expect(isSwaggerEnabled({ NODE_ENV: 'production' })).toBe(false);
    expect(isSwaggerEnabled({ NODE_ENV: 'production', SWAGGER_ENABLED: 'true' })).toBe(true);
  });
});
