"use strict";
/** @type {import('sequelize-cli').Migration} */
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("employees", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_uuid: {
        allowNull: false,
        unique: true, // Ensure uniqueness of user_uuid
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mobile_phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      birthdate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      blood_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      religion: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      place_of_birth: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      marital_status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      identity_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      identity_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      permanent: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      citizen_id_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      residential_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      identity_expiry_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      postal_code: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("employee");
  },
};
