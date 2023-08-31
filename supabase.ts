import 'dotenv/config'
import fs from "fs"
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { createHash } from "crypto";


const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

const generate_checksum = (content: string) => {
    return createHash('sha256').update(content).digest('base64')
}   


type Disease = {
    disease_name: string,
    symptoms?: string[],
    medicine: {
        composition: string
        description: string
    },
    precautions: string[],
    risk_factors: {
        precaution: string,
        occurence: string,
        risk_factors: string
    }
    disease_id?: string
}

(async ()=>{

    const output = fs.readFileSync("./output.json", {
        encoding: "utf-8"
    })

    const data: Array<Partial<Disease>> = JSON.parse(output)

    const formatted_blocks = data?.map((disease,i)=>{

        return `
        
            [DISEASE NUMBER ${i+1}]:: ${disease.disease_name} :: [DISEASE ID ${disease.disease_id}]

            DISEASE SYMPTOMS::
                ${
                    disease?.symptoms?.map((symptom, i)=> {
                        return (
                            `
                                (${i + 1}) ${symptom}
                            `
                        )
                    })
                }

            DISEASE MEDICINE::
                COMPOSITIION
                    ${disease?.medicine?.composition}
                DESCRIPTION
                    ${disease?.medicine?.description}
            
            DISEASE PRECAUTIONS::
                ${disease?.precautions?.map((precaution, i)=>{
                    return (
                        `
                            (${i + 1}) ${precaution}
                        `
                    )
                })}
            
            DISEASE RISK FACTORS
                
                PRECAUTION:
                    ${disease?.risk_factors?.precaution}
                OCCURRENCE:
                    ${disease?.risk_factors?.occurence}
                RISKFAC:
                    ${disease?.risk_factors?.risk_factors}
        `
    })


    formatted_blocks?.map((formatted_block, i)=>{

        fs.writeFileSync(`./diseases/${data?.at(i)?.disease_id}.txt`, formatted_block, {
            encoding: 'utf-8'
        })

    })

    data?.slice(2,)?.map(async (disease, i)=>{

        try {

            const emb = (await openai.embeddings.create({
                input: formatted_blocks.at(i) ?? "NO DATA",
                model: 'text-embedding-ada-002'
            })).data?.at(0)?.embedding

            const res = await client.from("diseases").insert({
                disease_name: disease.disease_name,
                disease_id: disease.disease_id,
                embedding: emb,
                checksum: generate_checksum(formatted_blocks?.at(i) ?? ""),
                description: formatted_blocks?.at(i) ?? 'NO DATA',

            })

            console.log("THE RES", res)


        }
        catch (e){
            console.log("SOMETHING WENT WRON")
        }

    })

    client.from("diseases").insert({
    
    })

})()




