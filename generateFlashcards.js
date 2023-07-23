const z = require("zod");
const ChatOpenAI = require("langchain/chat_models/openai").ChatOpenAI;
const PromptTemplate = require("langchain/prompts").PromptTemplate;
const {LLMChain, SimpleSequentialChain} = require("langchain/chains");
const StructuredOutputParser =
  require("langchain/output_parsers").StructuredOutputParser;
const OutputFixingParser =
  require("langchain/output_parsers").OutputFixingParser;
require("dotenv").config();

const apiKey = process.env.OPENAI_API_KEY;

const generateFlashcards = async (content) => {
    const chatModel = new ChatOpenAI({
        modelName: "gpt-3.5-turbo",
        temperature: 0,
        OPENAI_API_KEY: apiKey,
        }); 

        const prompt1 = new PromptTemplate({
        template: `Summarize the given text \
        into a list of points that encompass the entire knowledge within as if you are creating a study guide for an important test:\n{content}`,
        inputVariables: ["content"],
        });

        const pointCreatingChain = new LLMChain({
        llm: chatModel,
        prompt: prompt1,
        outputKey: "records",
        });


    const outputParser = StructuredOutputParser.fromZodSchema(
    z
        .array(
        z.object({
            fields: z.object({
            Question: z
                .string()
                .describe("The question from the question answer pair"),
            Answer: z
                .string()
                .describe("The answer from the question answer pair"),
            }),
        })
        )
        .describe(
        "An array of tuples, each representing a question answer pair"
        )
    );

    const chatModel2 = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0,
    OPENAI_API_KEY: apiKey,
    });

    const outputFixingParser = OutputFixingParser.fromLLM(
    chatModel2,
    outputParser
    );

    const prompt2 = new PromptTemplate({
    template: `Create a in-depth question and corresponding answer for each distinct point listed in the following text.\
    Pretend that you are creating flashcards for an important test on the given content and add information as you see fit in order to make both the question and answer informative and educational.:\n{format_instructions}\n{content}`,
    inputVariables: ["content"],
    partialVariables: {
        format_instructions: outputFixingParser.getFormatInstructions(),
    },
    });

    const answerFormattingChain = new LLMChain({
    llm: chatModel2,
    prompt: prompt2,
    outputKey: "records",
    outputParser: outputFixingParser,
    });

    const overallChain = new SimpleSequentialChain({
    chains: [pointCreatingChain, answerFormattingChain],
    verbose: true,
    });
    //get content
    const result = await overallChain.run(content);
    return result;
}

module.exports = generateFlashcards;
