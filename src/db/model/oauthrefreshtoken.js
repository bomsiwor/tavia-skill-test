"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class OauthRefreshToken extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      OauthRefreshToken.belongsTo(models.OauthAccessToken, {
        foreignKey: "oauth_access_token_id",
      });
    }
  }
  OauthRefreshToken.init(
    {
      oauth_access_token_id: DataTypes.INTEGER,
      token: DataTypes.TEXT,
      expired_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "OauthRefreshToken",
      tableName: "oauth_refresh_tokens",
    }
  );
  return OauthRefreshToken;
};
