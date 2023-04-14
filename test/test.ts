
export const createTest = (sessionName: string) => {
  const state = {
    sessionName,
    currentTestName: '...',
    stepCount: 0,
    failCount: 0,
  }

  const test = (testName: string, ...tests: (readonly [boolean, string])[]) => {
    state.currentTestName = testName
    const success = tests.every(([success]) => success)
    if (state.failCount === 0) {
      console.assert(success, `#${state.stepCount} ${testName}`)
    }
    if (!success) {
      if (state.failCount === 0) {
        for (const [success, failReason] of tests) {
          if (!success) {
            console.error(failReason)
          }
        }
      }
      state.failCount++
    }
    state.stepCount++
  }

  const getCurrentTestName = () => {
    return state.currentTestName
  }

  const testDone = (): boolean => {
    const { sessionName, stepCount, failCount } = state
    if (failCount === 0) {
      console.log(`Test %c"${sessionName}"%c succeeded! (${stepCount})`, 'color: yellow', '')
    } else {
      console.log(`Test %c"${sessionName}"%c has failed. (${failCount} fails over ${stepCount})`, 'color: yellow', '')
    }
    return failCount === 0
  }

  return {
    test,
    getCurrentTestName,
    testDone,
  }
}