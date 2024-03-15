"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }
  Employee.init(
    {
      user_uuid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mobile_phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      birthdate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      blood_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      religion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      place_of_birth: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      marital_status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      identity_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      identity_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      permanent: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      citizen_id_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      residential_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      identity_expiry_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      postal_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Employee",
      tableName: "employees",
      timestamps: true,
      underscored: true,
    }
  );
  return Employee;
};
