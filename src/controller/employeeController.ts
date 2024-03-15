import express, { Request, Response } from "express";
import { createReadStream } from "fs";
import { parse } from "fast-csv";
import multer from "multer";
import path from "path";
import { promisify } from "util";
import fs from "fs";
import { generateResponse } from "../util";

const db = require("../db/model/model.js");
var data_exporter = require("json2csv").Parser;
const { v4: uuidv4 } = require("uuid");
// Promisify fs.writeFile
const writeFileAsync = promisify(fs.writeFile);
const ensureDirAsync = promisify(fs.mkdir);

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

// declare global {
//   namespace Express {
//     interface Request {
//       file?: UploadedFile;
//     }
//   }
// }

// Generate storage folder for upload
// function storage (folder:string,fileName:string):multer.StorageEngine {
//   return multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, path.join(__dirname, './upload/',folder))
//     },
//     filename: function (req, file, cb) {
//             cb(null, file.fieldname + '-' + Date.now() + file.originalname.match(/\..*$/)[0])
//     }
//   })
// };

// Handle uploading/storing data
// function multi_upload(folder:string,fileName:string) {
//   return multer({
//   storage:storage('fdsa','fdsa'),
//   limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
//   fileFilter: (req, file, cb) => {
//       if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
//           cb(null, true);
//       } else {
//           cb(null, false);
//           const err = new Error('Only .png, .jpg and .jpeg format allowed!')
//           err.name = 'ExtensionError'
//           return cb(err);
//       }
//   },
// }).array('files')
// }

class EmployeeController {
  async import(req: Request, res: Response) {
    try {
      if (req.file == undefined) {
        return res.status(500).json("No file");
      }

      let employees: Array<any> = [];
      let path = "./resources/static/assets/uploads/" + req.file.filename;

      createReadStream(path)
        .pipe(parse({ headers: true, delimiter: ";" }))
        .on("error", (error) => {
          throw error.message;
        })
        .on("data", (row) => {
          console.log(row);
          const employeeData = {
            ...row,
            user_uuid: uuidv4(),
          };
          employees.push(employeeData);
        })
        .on("end", () => {
          db.Employee.bulkCreate(employees)
            .then(() => {
              res.status(200).json({
                message:
                  "The file: " +
                  req.file.originalname +
                  " got uploaded successfully!!",
              });
            })
            .catch((error: any) => {
              console.log(error);

              res.status(500).json({
                message: "Couldn't import data into database!",
                error: error.message,
              });
              return;
            });
        });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Failed to upload the file: " + req.file.originalname,
      });
    }
  }

  async export(req: Request, res: Response) {
    const employee = await db.Employee.findAll();

    var employeeJsonData = JSON.parse(JSON.stringify(employee));

    const header = Object.keys(db.Employee.rawAttributes);

    var json_data = new data_exporter({ header });

    var csv_data = json_data.parse(employeeJsonData);

    // Create a new Date object
    const today = new Date();

    // Get the year, month, and day
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // January is 0, so we add 1
    const day = today.getDate();

    // Format the date as YYYY-MM-DD
    const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;

    res.setHeader("Content-Type", "text/csv");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${formattedDate}-employee-data.csv`
    );

    res.status(200).end(csv_data);
  }

  // Handle upload
  async upload(req: Request, res: Response) {
    try {
      // Send an appropriate response to the client
      return generateResponse(res, 200, "File uploaded", true);
    } catch (err) {
      console.error("Error storing file:", err);
      return generateResponse(res, 500, "Error storing file", true);
    }
  }

  async store(req: Request, res: Response) {
    try {
      const employeeData = {
        ...req.body,
        user_uuid: uuidv4(),
      };
      await db.Employee.create(employeeData);
      return generateResponse(res, 201, "New employee data created", true);
    } catch (error) {
      console.log(error);
      return generateResponse(res, 500, "Error storing data", true);
    }
  }
}

export default new EmployeeController();
