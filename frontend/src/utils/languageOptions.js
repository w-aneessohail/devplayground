export const CURATED_LANGUAGES = [
  { name: 'JavaScript', monaco: 'javascript', snippet: `console.log("Hello, World!");`, desc: 'Popular for web & Node.js' },
  { name: 'TypeScript', monaco: 'typescript', snippet: `console.log("Hello, TypeScript!");`, desc: 'Typed JavaScript' },
  { name: 'Python',     monaco: 'python',     snippet: `print("Hello, World!")`, desc: 'Easy & readable' },
  { name: 'C++',        monaco: 'cpp',        snippet: `#include <iostream>\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}`, desc: 'Fast & powerful' },
  { name: 'Java',       monaco: 'java',       snippet: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`, desc: 'Enterprise standard' },
  { name: 'PHP',        monaco: 'php',        snippet: `<?php\necho "Hello, World!";\n?>`, desc: 'Web scripting' },
];

export const DEFAULT_LANG = 'JavaScript';