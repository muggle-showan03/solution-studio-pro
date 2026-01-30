import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestCase {
  id?: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
}

interface EvaluateRequest {
  code: string;
  language: string;
  problem: {
    functionName: string;
    parameters: { name: string; type: string }[];
    returnType: string;
  };
  testCases: TestCase[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language, problem, testCases } = await req.json() as EvaluateRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a code evaluator. Analyze the given ${language} code and determine what it would output for each test case.

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, just raw JSON.

For each test case, determine:
1. What the code would output when executed with the given input
2. Whether the output matches the expected output

Consider:
- The function name: ${problem.functionName}
- Parameters: ${JSON.stringify(problem.parameters)}
- Return type: ${problem.returnType}

Be strict about output format matching. Arrays should match exactly.
If the code has syntax errors or would crash, set actualOutput to an error message and passed to false.
If the code is incomplete (just "pass" or empty return), set actualOutput to "null" or appropriate default.

Return format:
{
  "testCases": [
    {"id": "tc-0", "input": "...", "expectedOutput": "...", "actualOutput": "...", "passed": true/false},
    ...
  ],
  "allPassed": true/false
}`
          },
          {
            role: "user",
            content: `Code to evaluate:
\`\`\`${language}
${code}
\`\`\`

Test cases to run:
${testCases.map((tc, i) => `Test ${i + 1}: Input: ${tc.input}, Expected: ${tc.expectedOutput}`).join("\n")}`
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let result;
    try {
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.replace(/```json?\n?/g, "").replace(/```$/g, "").trim();
      }
      result = JSON.parse(cleanContent);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      // Fallback: return test cases as not passed
      result = {
        testCases: testCases.map((tc, i) => ({
          id: `tc-${i}`,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: "Evaluation failed",
          passed: false,
        })),
        allPassed: false,
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("evaluate-code error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
