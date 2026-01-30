import { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Language } from '@/types/problem';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language: Language;
  readOnly?: boolean;
}

const languageMap: Record<Language, string> = {
  python: 'python',
  cpp: 'cpp',
  java: 'java',
};

export function CodeEditor({ code, onChange, language, readOnly = false }: CodeEditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Define custom dark theme
    monaco.editor.defineTheme('codearena-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A737D', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'FF7B72' },
        { token: 'string', foreground: 'A5D6FF' },
        { token: 'number', foreground: '79C0FF' },
        { token: 'function', foreground: 'D2A8FF' },
        { token: 'variable', foreground: 'FFA657' },
        { token: 'type', foreground: '7EE787' },
      ],
      colors: {
        'editor.background': '#0D1117',
        'editor.foreground': '#C9D1D9',
        'editor.lineHighlightBackground': '#161B22',
        'editorLineNumber.foreground': '#484F58',
        'editorLineNumber.activeForeground': '#C9D1D9',
        'editor.selectionBackground': '#264F78',
        'editor.inactiveSelectionBackground': '#264F7850',
        'editorCursor.foreground': '#58A6FF',
        'editorWhitespace.foreground': '#484F58',
      },
    });
    
    monaco.editor.setTheme('codearena-dark');
  };

  const handleChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  return (
    <div className="code-editor-container h-full w-full">
      <Editor
        height="100%"
        language={languageMap[language]}
        value={code}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        theme="codearena-dark"
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          automaticLayout: true,
          tabSize: 4,
          readOnly,
          wordWrap: 'on',
          folding: true,
          bracketPairColorization: { enabled: true },
        }}
      />
    </div>
  );
}
