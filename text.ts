import fs from "fs"

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

    console.log(formatted_blocks)

    formatted_blocks?.map((formatted_block, i)=>{

        fs.writeFileSync(`./diseases/${data?.at(i)?.disease_id}.txt`, formatted_block, {
            encoding: 'utf-8'
        })

    })

})()