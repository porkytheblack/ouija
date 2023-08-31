import { createClient } from "@supabase/supabase-js"
import readline from "node:readline/promises"
import OpenAI from "openai"

const customReadInterface = readline.createInterface(process.stdin, process.stdout)

const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

interface inputData {
    id: string,
    content: string,
    similarity: number
}

const constructProompt = (data: Array<inputData>, search: string) => {


    return (
        `

        HUMAN:
             
                SEARCHES FOR:  ${search}

                AND GETS THE FOLLOWING RESULTS:::

                    ${

                        data?.map(({content})=>{
                            return (
                                `
                                    ${content}
                                `
                            )
                        })

                    }
                
        PLEASE ANSWER WHAT THEY SEARCHED FOR BASED ON THE RESULTS LISTED
        
        
        `
    )

}



const getInput = async () => {

    try {
        const symptoms = await customReadInterface.question("Enter the disease symptoms::") 
        
        const embeddings = (await openai.embeddings.create({
            input: symptoms,
            model: 'text-embedding-ada-002'
        })).data.at(0)?.embedding
    
        const results = await client.rpc("match_disease", {
            query_embedding: embeddings,
            match_threshold: 0.5,
            match_count: 5
        })

        const proompt = constructProompt(results.data, symptoms)

        const gpt3_response = await openai.chat.completions.create({
            messages: [
                {
                    content: proompt,
                    role: "user"
                }
            ],
            model: 'gpt-3.5-turbo',
            max_tokens: 500,
            n: 1,
            temperature: 0.6
        })

        const response = gpt3_response.choices.at(0)?.message

        console.log("OPEN AI SAYS::",`
            ${response?.content}
        `)
    
    
        await getInput()

    }
    catch (e)
    {
        console.log("SOMETHING BAD::", e)
    }

};


(async ()=>{

    await getInput()

})()

