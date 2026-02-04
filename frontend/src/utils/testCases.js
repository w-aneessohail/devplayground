// Test cases for all languages
// Each test has: description, code (perfect solution), expectedOutput

export const TEST_CASES = {
  JavaScript: {
    test1: {
      id: 'test1',
      name: 'Test 1: Addition',
      description: 'Add two numbers and store the result in a third variable. Then print the result.',
      code: `let a = 10;
let b = 20;
let result = a + b;
console.log(result);`,
      expectedOutput: '30',
      operation: 'sum'
    },
    test2: {
      id: 'test2',
      name: 'Test 2: Subtraction',
      description: 'Subtract two numbers and store the result in a third variable. Then print the result.',
      code: `let a = 50;
let b = 20;
let result = a - b;
console.log(result);`,
      expectedOutput: '30',
      operation: 'subtract'
    },
    test3: {
      id: 'test3',
      name: 'Test 3: Multiplication',
      description: 'Multiply two numbers and store the result in a third variable. Then print the result.',
      code: `let a = 5;
let b = 6;
let result = a * b;
console.log(result);`,
      expectedOutput: '30',
      operation: 'multiply'
    },
    test4: {
      id: 'test4',
      name: 'Test 4: Division',
      description: 'Divide two numbers and store the result in a third variable. Then print the result.',
      code: `let a = 60;
let b = 2;
let result = a / b;
console.log(result);`,
      expectedOutput: '30',
      operation: 'divide'
    }
  },
  TypeScript: {
    test1: {
      id: 'test1',
      name: 'Test 1: Addition',
      description: 'Add two numbers and store the result in a third variable. Then print the result.',
      code: `let a: number = 10;
let b: number = 20;
let result: number = a + b;
console.log(result);`,
      expectedOutput: '30',
      operation: 'sum'
    },
    test2: {
      id: 'test2',
      name: 'Test 2: Subtraction',
      description: 'Subtract two numbers and store the result in a third variable. Then print the result.',
      code: `let a: number = 50;
let b: number = 20;
let result: number = a - b;
console.log(result);`,
      expectedOutput: '30',
      operation: 'subtract'
    },
    test3: {
      id: 'test3',
      name: 'Test 3: Multiplication',
      description: 'Multiply two numbers and store the result in a third variable. Then print the result.',
      code: `let a: number = 5;
let b: number = 6;
let result: number = a * b;
console.log(result);`,
      expectedOutput: '30',
      operation: 'multiply'
    },
    test4: {
      id: 'test4',
      name: 'Test 4: Division',
      description: 'Divide two numbers and store the result in a third variable. Then print the result.',
      code: `let a: number = 60;
let b: number = 2;
let result: number = a / b;
console.log(result);`,
      expectedOutput: '30',
      operation: 'divide'
    }
  },
  Python: {
    test1: {
      id: 'test1',
      name: 'Test 1: Addition',
      description: 'Add two numbers and store the result in a third variable. Then print the result.',
      code: `a = 10
b = 20
result = a + b
print(result)`,
      expectedOutput: '30',
      operation: 'sum'
    },
    test2: {
      id: 'test2',
      name: 'Test 2: Subtraction',
      description: 'Subtract two numbers and store the result in a third variable. Then print the result.',
      code: `a = 50
b = 20
result = a - b
print(result)`,
      expectedOutput: '30',
      operation: 'subtract'
    },
    test3: {
      id: 'test3',
      name: 'Test 3: Multiplication',
      description: 'Multiply two numbers and store the result in a third variable. Then print the result.',
      code: `a = 5
b = 6
result = a * b
print(result)`,
      expectedOutput: '30',
      operation: 'multiply'
    },
    test4: {
      id: 'test4',
      name: 'Test 4: Division',
      description: 'Divide two numbers and store the result in a third variable. Then print the result.',
      code: `a = 60
b = 2
result = a / b
print(result)`,
      expectedOutput: '30',
      operation: 'divide'
    }
  },
  PHP: {
    test1: {
      id: 'test1',
      name: 'Test 1: Addition',
      description: 'Add two numbers and store the result in a third variable. Then print the result.',
      code: `<?php
$a = 10;
$b = 20;
$result = $a + $b;
echo $result;
?>`,
      expectedOutput: '30',
      operation: 'sum'
    },
    test2: {
      id: 'test2',
      name: 'Test 2: Subtraction',
      description: 'Subtract two numbers and store the result in a third variable. Then print the result.',
      code: `<?php
$a = 50;
$b = 20;
$result = $a - $b;
echo $result;
?>`,
      expectedOutput: '30',
      operation: 'subtract'
    },
    test3: {
      id: 'test3',
      name: 'Test 3: Multiplication',
      description: 'Multiply two numbers and store the result in a third variable. Then print the result.',
      code: `<?php
$a = 5;
$b = 6;
$result = $a * $b;
echo $result;
?>`,
      expectedOutput: '30',
      operation: 'multiply'
    },
    test4: {
      id: 'test4',
      name: 'Test 4: Division',
      description: 'Divide two numbers and store the result in a third variable. Then print the result.',
      code: `<?php
$a = 60;
$b = 2;
$result = $a / $b;
echo $result;
?>`,
      expectedOutput: '30',
      operation: 'divide'
    }
  },
  'C++': {
    test1: {
      id: 'test1',
      name: 'Test 1: Addition',
      description: 'Add two numbers and store the result in a third variable. Then print the result.',
      code: `#include <iostream>
using namespace std;

int main() {
    int a = 10;
    int b = 20;
    int result = a + b;
    cout << result << endl;
    return 0;
}`,
      expectedOutput: '30',
      operation: 'sum'
    },
    test2: {
      id: 'test2',
      name: 'Test 2: Subtraction',
      description: 'Subtract two numbers and store the result in a third variable. Then print the result.',
      code: `#include <iostream>
using namespace std;

int main() {
    int a = 50;
    int b = 20;
    int result = a - b;
    cout << result << endl;
    return 0;
}`,
      expectedOutput: '30',
      operation: 'subtract'
    },
    test3: {
      id: 'test3',
      name: 'Test 3: Multiplication',
      description: 'Multiply two numbers and store the result in a third variable. Then print the result.',
      code: `#include <iostream>
using namespace std;

int main() {
    int a = 5;
    int b = 6;
    int result = a * b;
    cout << result << endl;
    return 0;
}`,
      expectedOutput: '30',
      operation: 'multiply'
    },
    test4: {
      id: 'test4',
      name: 'Test 4: Division',
      description: 'Divide two numbers and store the result in a third variable. Then print the result.',
      code: `#include <iostream>
using namespace std;

int main() {
    int a = 60;
    int b = 2;
    int result = a / b;
    cout << result << endl;
    return 0;
}`,
      expectedOutput: '30',
      operation: 'divide'
    }
  },
  Java: {
    test1: {
      id: 'test1',
      name: 'Test 1: Addition',
      description: 'Add two numbers and store the result in a third variable. Then print the result.',
      code: `public class Main {
    public static void main(String[] args) {
        int a = 10;
        int b = 20;
        int result = a + b;
        System.out.println(result);
    }
}`,
      expectedOutput: '30',
      operation: 'sum'
    },
    test2: {
      id: 'test2',
      name: 'Test 2: Subtraction',
      description: 'Subtract two numbers and store the result in a third variable. Then print the result.',
      code: `public class Main {
    public static void main(String[] args) {
        int a = 50;
        int b = 20;
        int result = a - b;
        System.out.println(result);
    }
}`,
      expectedOutput: '30',
      operation: 'subtract'
    },
    test3: {
      id: 'test3',
      name: 'Test 3: Multiplication',
      description: 'Multiply two numbers and store the result in a third variable. Then print the result.',
      code: `public class Main {
    public static void main(String[] args) {
        int a = 5;
        int b = 6;
        int result = a * b;
        System.out.println(result);
    }
}`,
      expectedOutput: '30',
      operation: 'multiply'
    },
    test4: {
      id: 'test4',
      name: 'Test 4: Division',
      description: 'Divide two numbers and store the result in a third variable. Then print the result.',
      code: `public class Main {
    public static void main(String[] args) {
        int a = 60;
        int b = 2;
        int result = a / b;
        System.out.println(result);
    }
}`,
      expectedOutput: '30',
      operation: 'divide'
    }
  }
};

// Helper function to get test cases for a language
export const getTestsForLanguage = (languageName) => {
  return TEST_CASES[languageName] || {};
};

// Helper function to get a specific test
export const getTest = (languageName, testId) => {
  const tests = getTestsForLanguage(languageName);
  return tests[testId] || null;
};

// Get all test IDs
export const TEST_IDS = ['test1', 'test2', 'test3', 'test4'];
