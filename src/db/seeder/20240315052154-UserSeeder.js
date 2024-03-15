"use strict";

const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    // Insert data into the database
    await queryInterface.bulkInsert(
      "users",
      [
        {
          name: "user1",
          email: "user1@example.com",
          password: await bcrypt.hash("12345678", 10),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "user2",
          email: "user2@example.com",
          created_at: new Date(),
          updated_at: new Date(),
          password: await bcrypt.hash("12345678", 10),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
