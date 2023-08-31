import { createClient } from "@supabase/supabase-js"
import express, { Router } from "express"
import OpenAI from "openai"
import morgan from 'morgan'
import cors from 'cors'


const client = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_ANON_KEY as string)


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY as  string
})

interface inputData {
    id: string,
    content: string,
    similarity: number
}

const getInput = async (symptoms: string) => {

    try {
        
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
            max_tokens: 1000,
            n: 1,
            temperature: 0.6
        })

        const response = gpt3_response.choices.at(0)?.message

        
        return response?.content
        

    }
    catch (e)
    {
        console.log("SOMETHING WENT WRONG")
        return null
    }

};

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
                
        BASED ON THE USER SEARCH AND THE RESULTS ABOVE ADVISE THE HUMAN.
        
        
        `
    )

}


const app = express()

app.use(morgan("tiny"))
app.use(cors())


const router = Router()

router.get("/search", async (req, res)=>{

    const query = req.query.query

    const response = await getInput(query  as string)

    res.status(200).send(response)

})

app.use(router)

app.listen(8089, ()=>{
    console.log("Somebody's up!!")
})