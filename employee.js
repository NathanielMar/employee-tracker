const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Employee extends Model {}

Employee.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,

      references: {
        model: "Role",
        key: "id",
      },
    },
    manager_id: {
      type: DataTypes.INTEGER,
      allowNull: true,

      references: {
        model: "Employee",
        key: "id",
      },
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: "Employee",
  }
);

module.exports = Employee;