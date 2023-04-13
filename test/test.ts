
export const createTest = (name: string) => {
  const testState = {
    name,
    count: 0,
    failCount: 0,
  }

  const test = (title: string, ...tests: (readonly [boolean, string])[]) => {
    const success = tests.every(([success]) => success)
    console.assert(success, `#${testState.count} ${title}`)
    if (!success) {
      testState.failCount++
      for (const [success, failReason] of tests) {
        if (!success) {
          console.error(failReason)
        }
      }
    }
    testState.count++
  }

  const testDone = () => {
    const { name, count, failCount } = testState
    if (failCount === 0) {
      console.log(`Test %c"${name}"%c succeeded! (${count})`, 'color: yellow', '')
    } else {
      console.log(`Test %c"${name}"%c has failed. (${failCount} fails over ${count})`, 'color: yellow', '')
    }
  }

  return {
    test,
    testDone,
  }
}