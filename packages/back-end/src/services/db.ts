import { DataTypes, Model, Sequelize } from 'sequelize';
import { join, resolve } from 'path';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.EXPRESS_SQLZ_DB || (resolve(join(__dirname, '../../../../database.db'))),
});

export class User extends Model<{
  id: number,
  registered: Date,
  firstName: string,
  middleName?: string,
  lastName: string,
  email: string,
  phoneNumber?: string,
  address?: string,
  adminNotes?: string,
}> {}

User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  registered: {
    type: DataTypes.DATE,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  middleName: {
    type: DataTypes.STRING,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phoneNumber: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.STRING,
  },
  adminNotes: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
}, {
  sequelize,
  modelName: 'User',
});

//
