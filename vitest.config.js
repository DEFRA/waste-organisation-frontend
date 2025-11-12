import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'lcov'],
      include: ['src/**'],
      exclude: [
        ...configDefaults.exclude,
        'src/test-utils',
        'src/client/javascripts',
        'src/index.js',
        '.public',
        'coverage',
        'postcss.config.js',
        'stylelint.config.js'
      ]
    }
  }
})
