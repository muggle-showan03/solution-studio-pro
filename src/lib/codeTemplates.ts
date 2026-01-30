import { ParameterDef, Language } from '@/types/problem';

const typeMapping: Record<string, Record<Language, string>> = {
  'int': { python: 'int', cpp: 'int', java: 'int' },
  'integer': { python: 'int', cpp: 'int', java: 'int' },
  'string': { python: 'str', cpp: 'string', java: 'String' },
  'str': { python: 'str', cpp: 'string', java: 'String' },
  'boolean': { python: 'bool', cpp: 'bool', java: 'boolean' },
  'bool': { python: 'bool', cpp: 'bool', java: 'boolean' },
  'float': { python: 'float', cpp: 'double', java: 'double' },
  'double': { python: 'float', cpp: 'double', java: 'double' },
  'array': { python: 'list', cpp: 'vector<int>', java: 'int[]' },
  'list': { python: 'list', cpp: 'vector<int>', java: 'int[]' },
  'int[]': { python: 'List[int]', cpp: 'vector<int>', java: 'int[]' },
  'string[]': { python: 'List[str]', cpp: 'vector<string>', java: 'String[]' },
};

function getType(type: string, lang: Language): string {
  const normalizedType = type.toLowerCase().trim();
  return typeMapping[normalizedType]?.[lang] || type;
}

export function generatePythonTemplate(
  functionName: string,
  params: ParameterDef[],
  returnType: string
): string {
  const paramsList = params.map(p => `${p.name}: ${getType(p.type, 'python')}`).join(', ');
  const returnTypePython = getType(returnType, 'python');
  
  return `from typing import List, Optional

def ${functionName}(${paramsList}) -> ${returnTypePython}:
    """
    Implement your solution here.
    
    Args:
        ${params.map(p => `${p.name}: ${getType(p.type, 'python')}`).join('\n        ')}
    
    Returns:
        ${returnTypePython}
    """
    # Your code here
    pass
`;
}

export function generateCppTemplate(
  functionName: string,
  params: ParameterDef[],
  returnType: string
): string {
  const paramsList = params.map(p => `${getType(p.type, 'cpp')} ${p.name}`).join(', ');
  const returnTypeCpp = getType(returnType, 'cpp');
  
  return `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

class Solution {
public:
    ${returnTypeCpp} ${functionName}(${paramsList}) {
        // Your code here
        
    }
};
`;
}

export function generateJavaTemplate(
  functionName: string,
  params: ParameterDef[],
  returnType: string
): string {
  const paramsList = params.map(p => `${getType(p.type, 'java')} ${p.name}`).join(', ');
  const returnTypeJava = getType(returnType, 'java');
  
  return `import java.util.*;

class Solution {
    public ${returnTypeJava} ${functionName}(${paramsList}) {
        // Your code here
        
    }
}
`;
}

export function generateTemplate(
  language: Language,
  functionName: string,
  params: ParameterDef[],
  returnType: string
): string {
  switch (language) {
    case 'python':
      return generatePythonTemplate(functionName, params, returnType);
    case 'cpp':
      return generateCppTemplate(functionName, params, returnType);
    case 'java':
      return generateJavaTemplate(functionName, params, returnType);
    default:
      return '';
  }
}
