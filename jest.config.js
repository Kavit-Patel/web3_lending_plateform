/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    testEnvironment: "node",
    transform: {
      "^.+\\.tsx?$": ["ts-jest", {}],
    },
    testMatch: [
      "**/bankrun/bank/bank_test.ts",
      "**/bankrun/dlp/dlp_test.ts",
      "**/bankrun/settlement/settlement_test.ts"
    ]
  };
  