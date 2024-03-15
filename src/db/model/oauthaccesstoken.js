"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class OauthAccessToken extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      OauthAccessToken.belongsTo(models.User, { foreignKey: "user_id" });
      OauthAccessToken.hasOne(models.OauthRefreshToken, {
        foreignKey: "oauth_access_token_id",
      });
    }
  }
  OauthAccessToken.init(
    {
      user_id: DataTypes.INTEGER,
      token: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "OauthAccessToken",
      tableName: "oauth_access_tokens",
    }
  );
  return OauthAccessToken;
};
