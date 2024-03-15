import BaseRouter from "./baseRouter";
import employeeController from "../controller/employeeController";
import uploadMiddleware from "../middleware/upload";
import { validateEmployee } from "../middleware/employeeValidator";
import { auth } from "../middleware/authMiddleware";
import multer from "multer";
import fs from "fs";
import path from "path";
const db = require("../db/model/model.js");

const storage = multer.diskStorage({
  destination: async function (req, file, callback) {
    // Get employee data
    const employeeData = await db.Employee.findOne({
      where: { id: req.body.employee_id },
    });

    // Generate folder data
    const folder =
      employeeData.user_uuid.slice(0, 8) +
      "-" +
      employeeData.first_name +
      " " +
      employeeData.last_name;
    // Root folder
    const root = path.resolve(__dirname, "../../");

    // Check if uplaod directory if exists
    // Create if not exists
    const uploadDirectory = root + "/public/upload/" + folder;
    if (!fs.existsSync(uploadDirectory)) {
      fs.mkdirSync(uploadDirectory, { recursive: true });
    }

    callback(null, uploadDirectory);
  },
  filename: function (req, file, callback) {
    // Create custom filename
    const timeUploaded = new Date().getTime();
    callback(null, timeUploaded + "-" + file.originalname);
  },
});
const uploads = multer({ storage: storage });

class EmployeeRoutes extends BaseRouter {
  public routes(): void {
    this.router.post("/", auth, validateEmployee, employeeController.store);

    // I dont have any idea how to handle this
    // But for sure i still want to learn the best practice how to hanle this
    // Hey it already handled - but sorry if not perfect
    this.router.post(
      "/upload",
      auth,
      uploads.array("files"),
      employeeController.upload
    );

    // Import data from csv
    this.router.get(
      "/import",
      auth,
      uploadMiddleware.single("file"),
      employeeController.import
    );

    // Export employee data to csv
    this.router.get("/export", auth, employeeController.export);
  }
}

export default new EmployeeRoutes().router;
