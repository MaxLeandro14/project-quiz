import { DataTypes, Model } from 'sequelize';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        bio: DataTypes.STRING,
        email_verified_at: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        ativo: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        url_avatar: DataTypes.STRING,
        conta_verificada: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        reset_senha_codigo_otp: DataTypes.STRING,
        reset_senha_codigo_expires: DataTypes.DATE,
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        underscored: true,
        indexes: [
          { unique: true, fields: ['email'] },
        ],
      }
    );
  }
}

export default User;
