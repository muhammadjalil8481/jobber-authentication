"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("auths", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      profilePublicId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      profilePicture: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      emailVerificationToken: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      emailVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      passwordResetToken: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      passwordResetExpires: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex("auths", ["email"], {
      unique: true,
      name: "auths_email_unique",
    });

    await queryInterface.addIndex("auths", ["username"], {
      unique: true,
      name: "auths_username_unique",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("auths");
  },
};
