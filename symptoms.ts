import 'dotenv/config'
import { parse } from "csv-parse"
import fs from "fs"
import _ from "lodash"

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

    let diseases_and_symptoms: Array<Partial<Disease>> = []

    // symptoms
    fs.createReadStream("./symptoms.csv", {
        encoding: "utf-8"
    })
    .pipe(
        parse({
            delimiter: ",",
            from_line: 2
        })
    )
    .on("data", (row)=>{
        const the_row = row as [string]
        diseases_and_symptoms.push({
            disease_name: row?.at(0),
            symptoms: the_row?.slice(1)?.filter((v)=>!_.isEmpty(v)),
            disease_id: (the_row?.at(0) as string)?.trim()?.toLowerCase()?.replaceAll(" ", "_")
        })
    })
    .on("error", (error)=>{
        console.log("Something went wrong")
    })
    .on("end", ()=>{
        console.log("SYMPTOMS DONE")
    })


    // medicine
    fs.createReadStream("./medicine.csv", {
        encoding: "utf-8"
    })
    .pipe(
        parse({
            delimiter: ",",
            from_line: 2
        })
    )
    .on("data", (row)=>{
        const the_row: string[] = row
        const id = the_row?.at(1)?.toLowerCase()?.replaceAll(" ", "_")

        const existing_index = diseases_and_symptoms.findIndex(({ disease_id }) => disease_id === id )

        if(existing_index === -1){

            diseases_and_symptoms.push({
                disease_name: the_row?.at(1),
                disease_id: the_row?.at(1)?.toLowerCase()?.replaceAll(" ", "_"),
                medicine: {
                    composition: the_row?.at(3) ?? "COMPOSITION NOT SPECIFIED",
                    description: the_row?.at(5) ?? "DESCRIPTION NOT SPECIFIED"
                }
            })

            return
        }

        diseases_and_symptoms = diseases_and_symptoms?.map((disease, i)=>{
            if(existing_index === i) return {
                ...disease,
                medicine: {
                    composition: the_row?.at(3) ?? "COMPOSITION NOT SPECIFIED",
                    description: the_row?.at(5) ?? "DESCRIPTION NOT SPECIFIED"
                }
            }

            return disease
        })

        

    })
    .on("error", (error)=>{
        console.log("Something went wrong")
    })
    .on("end", ()=>{
        console.log("MEDICINE DONE")
    })



    // precautions
    fs.createReadStream("./precautions.csv", {
        encoding: "utf-8"
    })
    .pipe(
        parse({
            delimiter: ",",
            from_line: 2
        })
    )
    .on("data", (row)=>{
        const the_row: string[] = row
        const id = the_row?.at(0)?.toLowerCase()?.replaceAll(" ", "_")

        const existing_index = diseases_and_symptoms.findIndex(({ disease_id }) => disease_id === id )

        if(existing_index === -1){

            diseases_and_symptoms.push({
                disease_name: the_row?.at(0),
                disease_id: the_row?.at(0)?.toLowerCase()?.replaceAll(" ", "_"),
                precautions: the_row?.slice(0)
            })

            return
        }

        diseases_and_symptoms = diseases_and_symptoms?.map((disease, i)=>{
            if(existing_index === i) return {
                ...disease,
                precautions: the_row?.slice(0)
            }

            return disease
        })
        

    })
    .on("error", (error)=>{
        console.log("Something went wrong")
    })
    .on("end", ()=>{
        console.log("PRECAUTIONS DONE")
    })


    // risk_factors
    fs.createReadStream("./risk_factors.csv", {
        encoding: "utf-8"
    })
    .pipe(
        parse({
            delimiter: ",",
            from_line: 2
        })
    )
    .on("data", (row)=>{
        const the_row: string[] = row
        const id = the_row?.at(1)?.toLowerCase()?.replaceAll(" ", "_")

        const existing_index = diseases_and_symptoms.findIndex(({ disease_id }) => disease_id === id )

        if(existing_index === -1){

            diseases_and_symptoms.push({
                disease_name: the_row?.at(1),
                disease_id: the_row?.at(1)?.toLowerCase()?.replaceAll(" ", "_"),
                risk_factors: {
                    occurence: the_row?.at(2) ?? "NO OCCURRENCE SPECIFIED",
                    precaution: the_row?.at(3) ?? "NO PRECAUTION SPECIFIED",
                    risk_factors: the_row?.at(4) ?? "NO RISK FACTORS SPECIFIED"
                }
            })

            return
        }

        diseases_and_symptoms = diseases_and_symptoms?.map((disease, i)=>{
            if(existing_index === i) return {
                ...disease,
                risk_factors: {
                    occurence: the_row?.at(2) ?? "NO OCCURRENCE SPECIFIED",
                    precaution: the_row?.at(3) ?? "NO PRECAUTION SPECIFIED",
                    risk_factors: the_row?.at(4) ?? "NO RISK FACTORS SPECIFIED"
                }
            }

            return disease
        })
        

    })
    .on("error", (error)=>{
        console.log("Something went wrong")
    })
    .on("end", ()=>{
        console.log("RISK FACTORS DONE")
    })

    await new Promise(()=>{
        setTimeout(()=>{
            console.log(diseases_and_symptoms)
            fs.writeFile("output.json", JSON.stringify(diseases_and_symptoms), {
                encoding: 'utf-8'
            }, (err)=>{
                if(err){
                    console.log("SOMETHING WENT WRONG::", err)
                }
        
                console.log("DONEZO")
            })
        }, 10000)
    })


})()