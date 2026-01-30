import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { problemText } = await req.json();
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
            content: `You are a programming problem parser. Extract structured information from coding problems.

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, just raw JSON.

Extract:
1. title: A short descriptive title
2. description: The full problem description
3. difficulty: "easy", "medium", or "hard" based on complexity
4. functionName: camelCase function name (e.g., twoSum, reverseString)
5. parameters: Array of {name, type} objects
6. returnType: The return type
7. testCases: Array of {input, expectedOutput} from examples

For types, use: int, string, boolean, int[], string[], etc.

Example output format:
{"title":"Two Sum","description":"Given an array...","difficulty":"easy","functionName":"twoSum","parameters":[{"name":"nums","type":"int[]"},{"name":"target","type":"int"}],"returnType":"int[]","testCases":[{"input":"nums = [2,7,11,15], target = 9","expectedOutput":"[0, 1]"}]}`
          },
          {
            role: "user",
            content: problemText,
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
    let parsedProblem;
    try {
      // Clean up the response - remove any markdown code blocks
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.replace(/```json?\n?/g, "").replace(/```$/g, "").trim();
      }
      parsedProblem = JSON.parse(cleanContent);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse problem structure");
    }

    return new Response(JSON.stringify(parsedProblem), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-problem error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
