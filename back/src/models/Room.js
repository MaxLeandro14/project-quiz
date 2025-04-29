import { DataTypes, Model } from 'sequelize';

class Room extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4
        },
        owner_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "users", key: "id" },
          onDelete: "CASCADE"
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        codigo: {
          type: DataTypes.STRING,
          allowNull: false
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        is_private: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        is_ativo: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        allow_file_uploads: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        allow_comments: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        password: {
          type: DataTypes.STRING,
          allowNull: true
        },
        likes_count: {
          type: DataTypes.INTEGER,
          defaultValue: 0
        },
        is_banned: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
      },
      {
        sequelize,
        modelName: 'Room',
        tableName: 'rooms',
      }
    );
  }
}

export default Room;
